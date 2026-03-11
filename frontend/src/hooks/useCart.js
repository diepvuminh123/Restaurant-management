import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/apiService';

/**
 * Custom hook để quản lý giỏ hàng
 * Thay thế sessionStorage bằng API calls
 */
export const useCart = () => {
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart từ API
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getCart();
      
      if (response.success && response.data) {
        setCart(response.data);
        
        // Transform items để tương thích với format cũ
        const transformedItems = (response.data.items || []).map(item => ({
          id: item.menu_item_id,        // Giữ menu_item_id làm id chính
          cartItemId: item.id,           // ID của cart_item trong DB
          name: item.name,
          price: Number(item.sale_price || item.price),
          imageUrl: item.images && item.images.length > 0 ? item.images[0] : null,
          quantity: item.quantity,
          note: item.note,
          available: item.available
        }));
        
        setCartItems(transformedItems);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load cart khi component mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Thêm món vào giỏ hàng
  const addToCart = useCallback(async (menuItem, quantity = 1, note = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.addItemToCart(menuItem.id, quantity, note);
      
      if (response.success && response.data) {
        setCart(response.data);
        
        // Transform items
        const transformedItems = (response.data.items || []).map(item => ({
          id: item.menu_item_id,
          cartItemId: item.id,
          name: item.name,
          price: Number(item.sale_price || item.price),
          imageUrl: item.images && item.images.length > 0 ? item.images[0] : null,
          quantity: item.quantity,
          note: item.note,
          available: item.available
        }));
        
        setCartItems(transformedItems);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật số lượng item trong giỏ
  const updateQuantity = useCallback(async (menuItemId, change) => {
    try {
      const item = cartItems.find(i => i.id === menuItemId);
      if (!item) return false;

      const newQuantity = item.quantity + change;
      
      // Nếu quantity = 0, xóa item
      if (newQuantity <= 0) {
        return await removeFromCart(menuItemId);
      }

      setLoading(true);
      setError(null);
      
      const response = await ApiService.updateCartItem(item.cartItemId, { quantity: newQuantity });
      
      if (response.success && response.data) {
        setCart(response.data);
        
        const transformedItems = (response.data.items || []).map(item => ({
          id: item.menu_item_id,
          cartItemId: item.id,
          name: item.name,
          price: Number(item.sale_price || item.price),
          imageUrl: item.images && item.images.length > 0 ? item.images[0] : null,
          quantity: item.quantity,
          note: item.note,
          available: item.available
        }));
        
        setCartItems(transformedItems);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating quantity:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  // Xóa item khỏi giỏ hàng
  const removeFromCart = useCallback(async (menuItemId) => {
    try {
      const item = cartItems.find(i => i.id === menuItemId);
      if (!item) return false;

      setLoading(true);
      setError(null);
      
      const response = await ApiService.removeItemFromCart(item.cartItemId);
      
      if (response.success && response.data) {
        setCart(response.data);
        
        const transformedItems = (response.data.items || []).map(item => ({
          id: item.menu_item_id,
          cartItemId: item.id,
          name: item.name,
          price: Number(item.sale_price || item.price),
          imageUrl: item.images && item.images.length > 0 ? item.images[0] : null,
          quantity: item.quantity,
          note: item.note,
          available: item.available
        }));
        
        setCartItems(transformedItems);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [cartItems]);

  // Xóa toàn bộ giỏ hàng
  const clearCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await ApiService.clearCart();
      
      if (response.success) {
        setCart(response.data);
        setCartItems([]);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error clearing cart:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Validate cart trước khi checkout
  const validateCart = useCallback(async () => {
    try {
      const response = await ApiService.validateCart();
      return response.data;
    } catch (err) {
      console.error('Error validating cart:', err);
      return {
        valid: false,
        errors: [err.message],
        cart: null
      };
    }
  }, []);

  // Tính tổng số lượng items
  const cartTotalCount = cartItems.reduce((total, item) => total + (item.quantity || 0), 0);

  // Tính tổng tiền
  const cartTotalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return {
    cart,
    cartItems,
    loading,
    error,
    cartTotalCount,
    cartTotalAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    validateCart,
    refreshCart: fetchCart
  };
};

export default useCart;
