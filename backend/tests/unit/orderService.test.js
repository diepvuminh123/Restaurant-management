const OrderService = require('../../src/services/orderService');
const Order = require('../../src/models/Order');

jest.mock('../../src/models/Order');

describe('OrderService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveOrderOwner', () => {
    it('should throw an error if both userId and sessionId are missing', () => {
      expect(() => OrderService.resolveOrderOwner(null, null)).toThrow('Cần đăng nhập hoặc có phiên guest hợp lệ để đặt món');
    });

    it('should return userId if provided', () => {
      const result = OrderService.resolveOrderOwner(1, 'session123');
      expect(result).toEqual({ userId: 1, sessionId: null });
    });
  });

  describe('createOrder', () => {
    const validPayload = {
      pickup_time: new Date(Date.now() + 60000 * 60).toISOString(), // 1 hour from now
      payment_method: 'zalopay',
      note: 'Extra spicy',
      customer_name: 'John'
    };

    it('should throw an error if pickup_time is invalid', async () => {
      await expect(OrderService.createOrder(1, null, { pickup_time: 'invalid' })).rejects.toThrow('pickup_time không hợp lệ');
    });

    it('should throw an error if pickup_time is in the past', async () => {
      const pastTime = new Date(Date.now() - 60000 * 60).toISOString();
      await expect(OrderService.createOrder(1, null, { pickup_time: pastTime })).rejects.toThrow('Thời gian nhận món phải lớn hơn thời gian hiện tại');
    });

    it('should create order and append payment method to note (Happy Path)', async () => {
      Order.createFromCart.mockResolvedValue({ id: 100 });
      
      const result = await OrderService.createOrder(1, null, validPayload);
      
      expect(Order.createFromCart).toHaveBeenCalledWith(expect.objectContaining({
        userId: 1,
        note: '[PAYMENT_METHOD:ZaloPay] Extra spicy',
        paymentStatus: 'UNPAID',
        customerName: 'John'
      }));
      expect(result).toEqual({ id: 100 });
    });
  });

  describe('confirmDeposit', () => {
    it('should throw an error if order not found', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue(null);
      await expect(OrderService.confirmDeposit(100)).rejects.toThrow('Không tìm thấy đơn hàng');
    });

    it('should throw an error if order is CANCELED', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'CANCELED' });
      await expect(OrderService.confirmDeposit(100)).rejects.toThrow('Đơn hàng đã hủy, không thể xác nhận cọc');
    });

    it('should return order without updating if already DEPOSIT_PAID or PAID', async () => {
      const mockOrder = { status: 'PENDING', payment_status: 'DEPOSIT_PAID' };
      Order.getOrderByIdForStaff.mockResolvedValue(mockOrder);
      
      const result = await OrderService.confirmDeposit(100);
      expect(result).toEqual(mockOrder);
      expect(Order.confirmDepositPaid).not.toHaveBeenCalled();
    });

    it('should throw an error if payment_status is not UNPAID', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'PENDING', payment_status: 'REFUNDED' });
      await expect(OrderService.confirmDeposit(100)).rejects.toThrow('Trạng thái thanh toán hiện tại không thể xác nhận cọc');
    });

    it('should confirm deposit successfully (Happy Path)', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'PENDING', payment_status: 'UNPAID' });
      Order.confirmDepositPaid.mockResolvedValue({ id: 100, payment_status: 'DEPOSIT_PAID' });

      const result = await OrderService.confirmDeposit(100);
      expect(Order.confirmDepositPaid).toHaveBeenCalledWith(100);
      expect(result.payment_status).toBe('DEPOSIT_PAID');
    });
  });

  describe('updateOrderStatus', () => {
    it('should throw an error if order not found', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue(null);
      await expect(OrderService.updateOrderStatus(100, 'READY')).rejects.toThrow('Không tìm thấy đơn hàng');
    });

    it('should throw an error if order is already CANCELED or COMPLETED', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'CANCELED' });
      await expect(OrderService.updateOrderStatus(100, 'READY')).rejects.toThrow('Đơn hàng đã kết thúc, không thể cập nhật trạng thái');
    });

    it('should return order without updating if status is the same', async () => {
      const mockOrder = { status: 'READY' };
      Order.getOrderByIdForStaff.mockResolvedValue(mockOrder);
      const result = await OrderService.updateOrderStatus(100, 'READY');
      expect(result).toEqual(mockOrder);
      expect(Order.updateOrderStatus).not.toHaveBeenCalled();
    });

    it('should update status successfully (Happy Path)', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'PENDING' });
      Order.updateOrderStatus.mockResolvedValue({ status: 'READY' });
      await OrderService.updateOrderStatus(100, 'READY');
      expect(Order.updateOrderStatus).toHaveBeenCalledWith(100, 'READY');
    });
  });

  describe('cancelOrder', () => {
    it('should return order if already CANCELED', async () => {
      const mockOrder = { status: 'CANCELED' };
      Order.getOrderByIdForStaff.mockResolvedValue(mockOrder);
      const result = await OrderService.cancelOrder(100, 1, 'Lý do');
      expect(result).toEqual(mockOrder);
    });

    it('should throw an error if order is COMPLETED', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'COMPLETED' });
      await expect(OrderService.cancelOrder(100, 1, 'Lý do')).rejects.toThrow('Đơn đã hoàn tất, không thể hủy');
    });

    it('should cancel order successfully (Happy Path)', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'PENDING' });
      Order.cancelOrder.mockResolvedValue({ status: 'CANCELED' });
      await OrderService.cancelOrder(100, 1, 'Hết món');
      expect(Order.cancelOrder).toHaveBeenCalledWith(100, 1, 'Hết món');
    });
  });

  describe('cancelOrderForUser', () => {
    it('should throw an error if userId is missing', async () => {
      await expect(OrderService.cancelOrderForUser(null, 100, 'lý do')).rejects.toThrow('Bạn cần đăng nhập để hủy đơn');
    });

    it('should throw an error if order does not belong to user', async () => {
      Order.getOrderById.mockResolvedValue(null);
      await expect(OrderService.cancelOrderForUser(1, 100, 'lý do')).rejects.toThrow('Không tìm thấy đơn hàng thuộc tài khoản của bạn');
    });
  });

  describe('updateOrderNote', () => {
    it('should throw an error if order is COMPLETED', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'COMPLETED' });
      await expect(OrderService.updateOrderNote(100, 'New Note')).rejects.toThrow('Đơn hàng đã kết thúc, không thể cập nhật ghi chú');
    });

    it('should correctly append note while preserving payment tag (Happy Path)', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'PENDING', note: '[PAYMENT_METHOD:ZaloPay] Old Note' });
      Order.updateOrderNote.mockResolvedValue(true);
      
      await OrderService.updateOrderNote(100, 'More spicy');
      
      // Should preserve the tag and append new note
      expect(Order.updateOrderNote).toHaveBeenCalledWith(100, '[PAYMENT_METHOD:ZaloPay] More spicy');
    });

    it('should handle updating note without payment tag', async () => {
      Order.getOrderByIdForStaff.mockResolvedValue({ status: 'PENDING', note: 'Old Note' });
      Order.updateOrderNote.mockResolvedValue(true);
      
      await OrderService.updateOrderNote(100, 'More spicy');
      
      // Should completely overwrite note if no tag exists
      expect(Order.updateOrderNote).toHaveBeenCalledWith(100, 'More spicy');
    });
  });
});
