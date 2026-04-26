const ReservationService = require('../../src/services/reservationService');
const Reservation = require('../../src/models/Reservation');
const User = require('../../src/models/User');

jest.mock('../../src/models/Reservation');
jest.mock('../../src/models/User');

describe('ReservationService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('normalizeReservationForStaff (Text Parsing & User Fallback)', () => {
    it('should return null if reservation is null', async () => {
      const result = await ReservationService.normalizeReservationForStaff(null);
      expect(result).toBeNull();
    });

    it('should parse restaurant_note and return extracted values', async () => {
      const mockReservation = {
        restaurant_note: 'KH: Nguyen Van A | SDT: 0123456789 | Email: a@a.com | Ghi chú: Tiec sinh nhat',
      };
      
      const result = await ReservationService.normalizeReservationForStaff(mockReservation);
      
      expect(result.customer_name).toBe('Nguyen Van A');
      expect(result.customer_phone).toBe('0123456789');
      expect(result.customer_email).toBe('a@a.com');
      expect(result.customer_note).toBe('Tiec sinh nhat');
    });

    it('should fallback to User profile if restaurant_note does not have tags', async () => {
      const mockReservation = {
        user_id: 1,
        restaurant_note: 'Some random note',
      };
      User.findById.mockResolvedValue({ full_name: 'John Doe', phone: '111', email: 'john@abc.com' });
      
      const result = await ReservationService.normalizeReservationForStaff(mockReservation);
      
      expect(result.customer_name).toBe('John Doe');
      expect(result.customer_phone).toBe('111');
      expect(result.customer_email).toBe('john@abc.com');
      expect(result.customer_note).toBeNull(); // "Some random note" is not tagged "Ghi chú: "
    });
  });

  describe('resolveReservationOwner', () => {
    it('should throw error if both missing', () => {
      expect(() => ReservationService.resolveReservationOwner(null, null)).toThrow('Cần có user_id hoặc session_id');
    });

    it('should return userId if present', () => {
      expect(ReservationService.resolveReservationOwner(1, 'session')).toEqual({ userId: 1, sessionId: null });
    });

    it('should return sessionId if userId is null', () => {
      expect(ReservationService.resolveReservationOwner(null, 'session')).toEqual({ userId: null, sessionId: 'session' });
    });
  });

  describe('getTablesForSelection', () => {
    it('should throw if missing params', async () => {
      await expect(ReservationService.getTablesForSelection(null, 2)).rejects.toThrow('Cần nhập đầy đủ thời gian và số lượng khách');
    });

    it('should call Reservation model with correct params', async () => {
      Reservation.DEFAULT_SLOT_MINUTES = 120;
      Reservation.getTablesWithAvailability.mockResolvedValue([]);
      const time = new Date();
      await ReservationService.getTablesForSelection(time, 2, { ignoreCapacity: true });
      expect(Reservation.getTablesWithAvailability).toHaveBeenCalledWith(time, 2, 120, true);
    });
  });

  describe('createReservation', () => {
    const payload = {
      reservation_time: new Date(),
      number_of_guests: 2,
      table_id: 1,
      customer_name: 'Bob'
    };

    it('should throw if missing table_id', async () => {
      await expect(ReservationService.createReservation(1, null, { ...payload, table_id: null })).rejects.toThrow('Thiếu table_id');
    });

    it('should throw if reservation_time is invalid Date', async () => {
      await expect(ReservationService.createReservation(1, null, { ...payload, reservation_time: 'abc' })).rejects.toThrow('reservation_time không hợp lệ');
    });

    it('should throw if table not found', async () => {
      Reservation.getTablesWithAvailability.mockResolvedValue([]);
      await expect(ReservationService.createReservation(1, null, payload)).rejects.toThrow('Không tìm thấy bàn');
    });

    it('should throw if table not selectable', async () => {
      Reservation.getTablesWithAvailability.mockResolvedValue([{ table_id: 1, selectable: false, disabled_reason: 'Bàn đang sửa' }]);
      await expect(ReservationService.createReservation(1, null, payload)).rejects.toThrow('Bàn không khả dụng: Bàn đang sửa');
    });

    it('should create reservation successfully (Happy Path)', async () => {
      Reservation.getTablesWithAvailability.mockResolvedValue([{ table_id: 1, selectable: true }]);
      User.findById.mockResolvedValue(null);
      Reservation.create.mockResolvedValue({ id: 10 });

      const result = await ReservationService.createReservation(1, null, payload);
      expect(result).toHaveProperty('id', 10);
      expect(Reservation.create).toHaveBeenCalledWith(expect.objectContaining({
        owner: { userId: 1, sessionId: null },
        tableId: 1,
        restaurantNote: expect.stringContaining('KH: Bob')
      }));
    });
  });

  describe('cancelReservation', () => {
    it('should throw if no userId', async () => {
      await expect(ReservationService.cancelReservation(null, 1)).rejects.toThrow('Bạn cần đăng nhập vào hệ thống để thực hiện tính năng này');
    });

    it('should throw if no reservationId', async () => {
      await expect(ReservationService.cancelReservation(1, null)).rejects.toThrow('Không tìm thấy lịch đặt bàn trong hệ thống');
    });

    it('should throw if cancel fails in model', async () => {
      Reservation.cancelReservation.mockResolvedValue(false);
      await expect(ReservationService.cancelReservation(1, 10)).rejects.toThrow('Không thể hủy đặt bàn (có thể đã quá giờ, đã bị hủy, hoặc không thuộc tài khoản của bạn)');
    });

    it('should return true on success', async () => {
      Reservation.cancelReservation.mockResolvedValue(true);
      expect(await ReservationService.cancelReservation(1, 10)).toBe(true);
    });
  });

  describe('getReservationHistory & ForStaff', () => {
    it('should throw if no userId for history', async () => {
      await expect(ReservationService.getReservationHistory(null)).rejects.toThrow('Bạn cần đăng nhập để xem lịch sử đặt bàn');
    });

    it('should return history', async () => {
      Reservation.getReservationsByUserId.mockResolvedValue([{ id: 1 }]);
      const res = await ReservationService.getReservationHistory(1);
      expect(res).toEqual([{ id: 1 }]);
    });

    it('should normalize data for staff listing', async () => {
      Reservation.listForStaff.mockResolvedValue([{ id: 1, restaurant_note: 'KH: Admin' }]);
      const res = await ReservationService.getReservationsForStaff();
      expect(res.data[0]).toHaveProperty('customer_name', 'Admin');
    });
  });

  describe('createReservationForStaff', () => {
    const payload = {
      reservation_time: new Date(),
      number_of_guests: 4,
      table_id: 1,
    };

    it('should throw if missing staffUserId', async () => {
      await expect(ReservationService.createReservationForStaff(null, payload)).rejects.toThrow('Bạn cần đăng nhập để thực hiện chức năng này');
    });

    it('should throw if missing table', async () => {
      await expect(ReservationService.createReservationForStaff(1, { ...payload, table_id: null })).rejects.toThrow('Thiếu table_id');
    });

    it('should throw if invalid time', async () => {
      await expect(ReservationService.createReservationForStaff(1, { ...payload, reservation_time: 'abc' })).rejects.toThrow('reservation_time không hợp lệ');
    });

    it('should throw if table not selectable', async () => {
      Reservation.getTablesWithAvailability.mockResolvedValue([{ table_id: 1, selectable: false }]);
      await expect(ReservationService.createReservationForStaff(1, payload)).rejects.toThrow('Bàn không khả dụng: undefined');
    });

    it('should create reservation with staff sessionId (Happy Path)', async () => {
      Reservation.getTablesWithAvailability.mockResolvedValue([{ table_id: 1, selectable: true }]);
      Reservation.create.mockResolvedValue({ id: 99 });
      
      const result = await ReservationService.createReservationForStaff(1, payload);
      expect(result).toHaveProperty('id', 99);
      expect(Reservation.create).toHaveBeenCalledWith(expect.objectContaining({
        owner: expect.objectContaining({ sessionId: expect.stringMatching(/^staff:1:/) })
      }));
    });
  });

  describe('updateReservationStatusForStaff (State Machine)', () => {
    it('should throw if invalid args', async () => {
      await expect(ReservationService.updateReservationStatusForStaff(null, 'READY')).rejects.toThrow('reservation_id không hợp lệ');
      await expect(ReservationService.updateReservationStatusForStaff(1, null)).rejects.toThrow('reservation_state không hợp lệ');
    });

    it('should throw if reservation not found', async () => {
      Reservation.getReservationDetailForStaff.mockResolvedValue(null);
      await expect(ReservationService.updateReservationStatusForStaff(1, 'CONFIRM')).rejects.toThrow('Không tìm thấy đơn đặt bàn');
    });

    it('should throw 409 if invalid state transition (CONFIRM -> COMPLETED)', async () => {
      Reservation.getReservationDetailForStaff.mockResolvedValue({ reservation_state: 'CONFIRM' });
      await expect(ReservationService.updateReservationStatusForStaff(1, 'COMPLETED')).rejects.toThrow('Không thể chuyển trạng thái từ CONFIRM sang COMPLETED');
    });

    it('should update successfully if transition is valid (CONFIRM -> ON_SERVING)', async () => {
      Reservation.getReservationDetailForStaff.mockResolvedValue({ reservation_state: 'CONFIRM' });
      Reservation.updateReservationStatusForStaff.mockResolvedValue({ id: 1, reservation_state: 'ON_SERVING' });

      const res = await ReservationService.updateReservationStatusForStaff(1, 'ON_SERVING');
      expect(res.reservation_state).toBe('ON_SERVING');
    });

    it('should throw 409 if db update fails', async () => {
      Reservation.getReservationDetailForStaff.mockResolvedValue({ reservation_state: 'CONFIRM' });
      Reservation.updateReservationStatusForStaff.mockResolvedValue(null);

      await expect(ReservationService.updateReservationStatusForStaff(1, 'ON_SERVING')).rejects.toThrow('Không thể cập nhật trạng thái đặt bàn');
    });
  });
});
