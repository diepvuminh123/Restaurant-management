const pool = require('../config/database');
const Order = require('../models/Order');
const { sendTakeawayAutomationEmail } = require('../takeawayMailer');
const sseService = require('./sseService');

const ADVISORY_LOCK_KEY = 420042;
// Chuẩn hóa dữ liệu 
function toIntEnv(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

class TakeawayAutomationService {
  constructor() {
    this.intervalId = null;
    this.isRunning = false;

    this.enabled = process.env.TAKEAWAY_AUTOMATION_ENABLED !== 'false';
    this.intervalMs = toIntEnv(process.env.TAKEAWAY_AUTOMATION_INTERVAL_MS, 60000);
    this.unpaidTimeoutMinutes = toIntEnv(process.env.TAKEAWAY_UNPAID_TIMEOUT_MINUTES, 20);
    this.preparingLeadMinutes = toIntEnv(process.env.TAKEAWAY_PREPARING_LEAD_MINUTES, 30);
    this.readyToCompletedMinutes = toIntEnv(process.env.TAKEAWAY_READY_TO_COMPLETED_MINUTES, 90);
  }

  start() {
    if (!this.enabled) {
      console.log('Takeaway automation is disabled by TAKEAWAY_AUTOMATION_ENABLED=false');
      return;
    }

    if (this.intervalId) {
      return;
    }

    console.log(
      `Takeaway automation started: interval=${this.intervalMs}ms, unpaidTimeout=${this.unpaidTimeoutMinutes}m, preparingLead=${this.preparingLeadMinutes}m, completeAfterReady=${this.readyToCompletedMinutes}m`
    );

    this.intervalId = setInterval(() => {
      this.runCycle();
    }, this.intervalMs);

    this.runCycle();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  async runCycle() {
    if (this.isRunning || !this.enabled) {
      return;
    }

    this.isRunning = true;
    let hasLock = false;

    try {
      const lockResult = await pool.query('SELECT pg_try_advisory_lock($1) AS locked', [ADVISORY_LOCK_KEY]);
      hasLock = Boolean(lockResult.rows[0]?.locked);

      if (!hasLock) {
        return;
      }

      const autoCanceled = await Order.autoCancelUnpaidOrders(this.unpaidTimeoutMinutes);
      await this.notifyOrders(autoCanceled, 'auto_cancel_unpaid');

      const movedToPreparing = await Order.autoMoveToPreparing(this.preparingLeadMinutes);
      await this.notifyOrders(movedToPreparing, 'auto_preparing');

      const movedToReady = await Order.autoMoveToReady();
      await this.notifyOrders(movedToReady, 'auto_ready');

      const movedToCompleted = await Order.autoCompleteReadyOrders(this.readyToCompletedMinutes);
      await this.notifyOrders(movedToCompleted, 'auto_completed');
      // debug
      const totalAffected =
        autoCanceled.length +
        movedToPreparing.length +
        movedToReady.length +
        movedToCompleted.length;

      if (totalAffected > 0) {
        console.log(
          `[TakeawayAutomation] updated ${totalAffected} orders: canceled=${autoCanceled.length}, preparing=${movedToPreparing.length}, ready=${movedToReady.length}, completed=${movedToCompleted.length}`
        );
      }
    } catch (error) {
      console.error('[TakeawayAutomation] cycle failed:', error.message);
    } finally {
      if (hasLock) {
        try {
          await pool.query('SELECT pg_advisory_unlock($1)', [ADVISORY_LOCK_KEY]);
        } catch (unlockError) {
          console.error('[TakeawayAutomation] unlock failed:', unlockError.message);
        }
      }
      this.isRunning = false;
    }
  }

  async notifyOrders(orders, eventType) {
    if (!Array.isArray(orders) || orders.length === 0) {
      return;
    }

    // Thông báo qua SSE cho từng đơn hàng
    orders.forEach(order => {

      sseService.notifyCustomer(order.user_id, order.session_id, 'ORDER_STATUS_UPDATED', order);
      sseService.notifyStaff('ORDER_STATUS_UPDATED', order);
    });

    const mailJobs = orders
      .filter((order) => order.customer_email)
      .map((order) =>
        sendTakeawayAutomationEmail({
          to: order.customer_email,
          customerName: order.customer_name,
          orderCode: order.order_code,
          pickupTime: order.pickup_time,
          eventType,
        })
      );

    if (mailJobs.length === 0) {
      return;
    }

    const results = await Promise.allSettled(mailJobs);
    // debug log
    const failedCount = results.filter((result) => result.status === 'rejected').length;

    if (failedCount > 0) {
      console.error(`[TakeawayAutomation] ${failedCount}/${mailJobs.length} emails failed for event=${eventType}`);
    }
  }
}

module.exports = new TakeawayAutomationService();
