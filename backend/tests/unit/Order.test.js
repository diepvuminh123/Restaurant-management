const Order = require('../../src/models/Order');

describe('Order Model - Unit Tests', () => {
  describe('formatOrderCode', () => {
    it('should generate a correct order code based on date and id', () => {
      const mockOrder = {
        id: 125,
        created_at: new Date('2023-10-25T14:30:00Z')
      };

      const code = Order.formatOrderCode(mockOrder);

      // Expected format: ORD-YYYYMMDD-000125
      expect(code).toBe('ORD-20231025-000125');
    });

    it('should pad the id with leading zeros to 6 digits', () => {
      const mockOrder = {
        id: 5,
        created_at: new Date('2024-01-05T08:00:00Z')
      };

      const code = Order.formatOrderCode(mockOrder);

      expect(code).toBe('ORD-20240105-000005');
    });

    it('should use the current date if created_at is missing', () => {
      const mockOrder = { id: 10 };
      const now = new Date();

      const code = Order.formatOrderCode(mockOrder);

      const dateStr = now.getUTCFullYear().toString() +
        String(now.getUTCMonth() + 1).padStart(2, '0') +
        String(now.getUTCDate()).padStart(2, '0');

      expect(code).toBe(`ORD-${dateStr}-000010`);
    });

    it('should not truncate the id if it is longer than 6 digits', () => {
      const mockOrder = {
        id: 1234567,
        created_at: new Date('2023-10-25T14:30:00Z')
      };

      const code = Order.formatOrderCode(mockOrder);

      expect(code).toBe('ORD-20231025-1234567');
    });

    it('should handle id being a string', () => {
      const mockOrder = {
        id: '99',
        created_at: new Date('2023-10-25T14:30:00Z')
      };

      const code = Order.formatOrderCode(mockOrder);

      expect(code).toBe('ORD-20231025-000099');
    });

    it('should handle id being 0', () => {
      const mockOrder = {
        id: 0,
        created_at: new Date('2023-10-25T14:30:00Z')
      };

      const code = Order.formatOrderCode(mockOrder);

      expect(code).toBe('ORD-20231025-000000');
    });

    it('should return "undefined" in the sequence if id is missing', () => {
      const mockOrder = {
        created_at: new Date('2023-10-25T14:30:00Z')
      };

      const code = Order.formatOrderCode(mockOrder);

      // Current implementation returns 'undefined' for missing id
      expect(code).toBe('ORD-20231025-undefined');
    });

    it('should throw an error if order is null or undefined', () => {
      expect(() => Order.formatOrderCode(null)).toThrow();
      expect(() => Order.formatOrderCode(undefined)).toThrow();
    });
  });
});

