const TakeawayAutomationService = require('../../src/services/takeawayAutomationService');
const pool = require('../../src/config/database');
const Order = require('../../src/models/Order');
const { sendTakeawayAutomationEmail } = require('../../src/takeawayMailer');

jest.mock('../../src/config/database');
jest.mock('../../src/models/Order');
jest.mock('../../src/takeawayMailer');

describe('TakeawayAutomationService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.useFakeTimers();
    // Spy on console.log and console.error to keep test output clean
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Reset service state
    TakeawayAutomationService.stop();
    TakeawayAutomationService.isRunning = false;
    TakeawayAutomationService.enabled = true;
  });

  afterEach(() => {
    jest.useRealTimers();
    TakeawayAutomationService.stop();
  });

  describe('start & stop', () => {
    it('should not start if disabled', () => {
      TakeawayAutomationService.enabled = false;
      TakeawayAutomationService.start();
      expect(TakeawayAutomationService.intervalId).toBeNull();
    });

    it('should start interval and call runCycle immediately', () => {
      const runCycleSpy = jest.spyOn(TakeawayAutomationService, 'runCycle').mockImplementation(async () => {});
      TakeawayAutomationService.start();
      
      expect(TakeawayAutomationService.intervalId).not.toBeNull();
      expect(runCycleSpy).toHaveBeenCalledTimes(1);

      // Fast forward time
      jest.advanceTimersByTime(TakeawayAutomationService.intervalMs);
      expect(runCycleSpy).toHaveBeenCalledTimes(2);
    });

    it('should not start again if already running', () => {
      TakeawayAutomationService.intervalId = 123; // Fake running state
      TakeawayAutomationService.start();
      // Should not re-assign intervalId
      expect(TakeawayAutomationService.intervalId).toBe(123);
    });

    it('should stop the interval', () => {
      TakeawayAutomationService.start();
      expect(TakeawayAutomationService.intervalId).not.toBeNull();
      
      TakeawayAutomationService.stop();
      expect(TakeawayAutomationService.intervalId).toBeNull();
    });
  });

  describe('runCycle', () => {
    it('should exit early if already running or disabled', async () => {
      TakeawayAutomationService.enabled = false;
      await TakeawayAutomationService.runCycle();
      expect(pool.query).not.toHaveBeenCalled();

      TakeawayAutomationService.enabled = true;
      TakeawayAutomationService.isRunning = true;
      await TakeawayAutomationService.runCycle();
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should exit early if advisory lock is not acquired', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ locked: false }] });
      
      await TakeawayAutomationService.runCycle();
      
      expect(pool.query).toHaveBeenCalledWith('SELECT pg_try_advisory_lock($1) AS locked', [420042]);
      expect(Order.autoCancelUnpaidOrders).not.toHaveBeenCalled();
      expect(TakeawayAutomationService.isRunning).toBe(false);
    });

    it('should process orders and release lock on success (Happy Path)', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ locked: true }] }) // acquire lock
        .mockResolvedValueOnce(); // release lock

      Order.autoCancelUnpaidOrders.mockResolvedValue([{ id: 1, customer_email: 'test@test.com' }]);
      Order.autoMoveToPreparing.mockResolvedValue([]);
      Order.autoMoveToReady.mockResolvedValue([]);
      Order.autoCompleteReadyOrders.mockResolvedValue([]);
      sendTakeawayAutomationEmail.mockResolvedValue(true);

      const notifySpy = jest.spyOn(TakeawayAutomationService, 'notifyOrders');

      await TakeawayAutomationService.runCycle();

      expect(Order.autoCancelUnpaidOrders).toHaveBeenCalledWith(TakeawayAutomationService.unpaidTimeoutMinutes);
      expect(notifySpy).toHaveBeenCalledWith(expect.any(Array), 'auto_cancel_unpaid');
      
      expect(pool.query).toHaveBeenCalledWith('SELECT pg_advisory_unlock($1)', [420042]);
      expect(TakeawayAutomationService.isRunning).toBe(false);
    });

    it('should release lock even if an error occurs during processing', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ locked: true }] }) // acquire lock
        .mockResolvedValueOnce(); // release lock

      Order.autoCancelUnpaidOrders.mockRejectedValue(new Error('DB Error'));

      await TakeawayAutomationService.runCycle();

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('[TakeawayAutomation] cycle failed:'), 'DB Error');
      expect(pool.query).toHaveBeenCalledWith('SELECT pg_advisory_unlock($1)', [420042]);
      expect(TakeawayAutomationService.isRunning).toBe(false);
    });
  });

  describe('notifyOrders', () => {
    it('should do nothing if orders array is empty or not an array', async () => {
      await TakeawayAutomationService.notifyOrders([], 'event');
      await TakeawayAutomationService.notifyOrders(null, 'event');
      expect(sendTakeawayAutomationEmail).not.toHaveBeenCalled();
    });

    it('should only send emails to orders with customer_email', async () => {
      const orders = [
        { customer_email: 'test@example.com', order_code: 'A1' },
        { order_code: 'A2' } // missing email
      ];
      sendTakeawayAutomationEmail.mockResolvedValue(true);

      await TakeawayAutomationService.notifyOrders(orders, 'auto_ready');

      expect(sendTakeawayAutomationEmail).toHaveBeenCalledTimes(1);
      expect(sendTakeawayAutomationEmail).toHaveBeenCalledWith(expect.objectContaining({
        to: 'test@example.com',
        eventType: 'auto_ready'
      }));
    });

    it('should log error if some emails fail to send', async () => {
      const orders = [{ customer_email: 'test@example.com' }];
      sendTakeawayAutomationEmail.mockRejectedValue(new Error('SMTP Error'));

      await TakeawayAutomationService.notifyOrders(orders, 'event');

      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('1/1 emails failed'));
    });
  });
});
