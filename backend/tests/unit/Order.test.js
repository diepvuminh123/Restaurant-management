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
  });
});
