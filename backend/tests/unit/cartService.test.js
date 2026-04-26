const CartService = require('../../src/services/cartService');
const Cart = require('../../src/models/Cart');

jest.mock('../../src/models/Cart');

describe('CartService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('resolveCartOwner', () => {
    it('should throw an error if both userId and sessionId are missing', () => {
      expect(() => CartService.resolveCartOwner(null, null)).toThrow('Cần có user_id hoặc session_id');
    });

    it('should return userId if provided', () => {
      const result = CartService.resolveCartOwner(1, 'session123');
      expect(result).toEqual({ userId: 1, sessionId: null });
    });

    it('should return sessionId if userId is null', () => {
      const result = CartService.resolveCartOwner(null, 'session123');
      expect(result).toEqual({ userId: null, sessionId: 'session123' });
    });
  });

  describe('getCurrentCart', () => {
    it('should return cart with items and totals', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.getCartWithItems.mockResolvedValue({ id: 10, items: [] });
      Cart.calculateCartTotal.mockResolvedValue({ total_amount: 0, total_quantity: 0 });

      const result = await CartService.getCurrentCart(1, null);

      expect(Cart.findOrCreateActiveCart).toHaveBeenCalledWith(1, null);
      expect(Cart.getCartWithItems).toHaveBeenCalledWith(10);
      expect(Cart.calculateCartTotal).toHaveBeenCalledWith(10);
      expect(result).toEqual({ id: 10, items: [], total_amount: 0, total_quantity: 0 });
    });
  });

  describe('addItemToCart', () => {
    it('should throw an error if quantity <= 0', async () => {
      await expect(CartService.addItemToCart(1, null, 5, 0, 'note')).rejects.toThrow('Số lượng phải lớn hơn 0');
    });

    it('should add item and return updated cart', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.addItem.mockResolvedValue(true);
      // Mocking getCurrentCart dependencies
      Cart.getCartWithItems.mockResolvedValue({ id: 10, items: [{ menu_item_id: 5 }] });
      Cart.calculateCartTotal.mockResolvedValue({ total_amount: 100 });

      const result = await CartService.addItemToCart(1, null, 5, 2, 'note');

      expect(Cart.addItem).toHaveBeenCalledWith(10, 5, 2, 'note');
      expect(result).toHaveProperty('total_amount', 100);
    });
  });

  describe('updateCartItem', () => {
    it('should throw an error if quantity is provided and <= 0', async () => {
      await expect(CartService.updateCartItem(1, null, 15, 0)).rejects.toThrow('Số lượng phải lớn hơn 0');
    });

    it('should throw an error if updating quantity fails (item not found)', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.updateItemQuantity.mockResolvedValue(false);

      await expect(CartService.updateCartItem(1, null, 15, 2)).rejects.toThrow('Không tìm thấy item trong giỏ hàng');
    });

    it('should throw an error if updating note fails (item not found)', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.updateItemNote.mockResolvedValue(false);

      await expect(CartService.updateCartItem(1, null, 15, undefined, 'new note')).rejects.toThrow('Không tìm thấy item trong giỏ hàng');
    });

    it('should update quantity and note and return cart', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.updateItemQuantity.mockResolvedValue(true);
      Cart.updateItemNote.mockResolvedValue(true);
      Cart.getCartWithItems.mockResolvedValue({ id: 10 });
      Cart.calculateCartTotal.mockResolvedValue({ total_amount: 200 });

      const result = await CartService.updateCartItem(1, null, 15, 3, 'updated note');

      expect(Cart.updateItemQuantity).toHaveBeenCalledWith(15, 10, 3);
      expect(Cart.updateItemNote).toHaveBeenCalledWith(15, 10, 'updated note');
      expect(result).toHaveProperty('total_amount', 200);
    });
  });

  describe('removeItemFromCart', () => {
    it('should throw an error if item not found', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.removeItem.mockResolvedValue(false);

      await expect(CartService.removeItemFromCart(1, null, 15)).rejects.toThrow('Không tìm thấy item trong giỏ hàng');
    });

    it('should remove item and return updated cart', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.removeItem.mockResolvedValue(true);
      Cart.getCartWithItems.mockResolvedValue({ id: 10 });
      Cart.calculateCartTotal.mockResolvedValue({ total_amount: 0 });

      const result = await CartService.removeItemFromCart(1, null, 15);

      expect(Cart.removeItem).toHaveBeenCalledWith(15, 10);
      expect(result).toHaveProperty('total_amount', 0);
    });
  });

  describe('clearCart', () => {
    it('should clear cart and return empty cart', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.clearCart.mockResolvedValue(true);
      Cart.getCartWithItems.mockResolvedValue({ id: 10, items: [] });
      Cart.calculateCartTotal.mockResolvedValue({ total_amount: 0 });

      const result = await CartService.clearCart(1, null);

      expect(Cart.clearCart).toHaveBeenCalledWith(10);
      expect(result).toHaveProperty('items', []);
    });
  });

  describe('migrateGuestCart', () => {
    it('should return null if sessionId or userId is missing', async () => {
      const res1 = await CartService.migrateGuestCart(null, 1);
      const res2 = await CartService.migrateGuestCart('session', null);
      expect(res1).toBeNull();
      expect(res2).toBeNull();
    });

    it('should migrate cart and return the new user cart', async () => {
      Cart.migrateGuestCartToUser.mockResolvedValue(true);
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.getCartWithItems.mockResolvedValue({ id: 10 });
      Cart.calculateCartTotal.mockResolvedValue({ total_amount: 50 });

      const result = await CartService.migrateGuestCart('session123', 1);

      expect(Cart.migrateGuestCartToUser).toHaveBeenCalledWith('session123', 1);
      expect(result).toHaveProperty('total_amount', 50);
    });
  });

  describe('validateCart', () => {
    it('should return valid: false if cart is empty', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.getCartWithItems.mockResolvedValue({ items: [] });
      Cart.calculateCartTotal.mockResolvedValue({});

      const result = await CartService.validateCart(1, null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Giỏ hàng trống');
    });

    it('should return valid: false if an item is unavailable', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.getCartWithItems.mockResolvedValue({ items: [{ name: 'Pho', available: false }] });
      Cart.calculateCartTotal.mockResolvedValue({});

      const result = await CartService.validateCart(1, null);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Món "Pho" hiện không còn phục vụ');
    });

    it('should return valid: true if cart is good', async () => {
      Cart.findOrCreateActiveCart.mockResolvedValue({ id: 10 });
      Cart.getCartWithItems.mockResolvedValue({ items: [{ name: 'Pho', available: true }] });
      Cart.calculateCartTotal.mockResolvedValue({});

      const result = await CartService.validateCart(1, null);

      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });
  });
});
