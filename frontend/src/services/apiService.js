const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
   
    
    const config = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
    };

    if (options.body && typeof options.body === "object") {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        
        throw new Error(data.message || "Có lỗi xảy ra");
      }

      
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: userData,
    });
  }

  static async sendOtp(email, OTPType = "signup") {
    return this.request("/auth/sendOtp", {
      method: "POST",
      body: { email, OTPType },
    });
  }

  static async verifyOtp(email, code) {
    return this.request("/auth/verifyOtp", {
      method: "POST",
      body: { email, code },
    });
  }

  static async login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: { email, password },
    });
  }

  static async resetPassword(newPassword) {
    return this.request("/auth/resetPassword", {
      method: "POST",
      body: { newPassword },
    });
  }

  static async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  static async getCurrentUser() {
    return this.request("/auth/me", {
      method: "GET",
    });
  }

  static async checkAuth() {
    return this.request("/auth/check", {
      method: "GET",
    });
  }

  // Lấy danh sách menu sections (Món Chính, Đồ Uống, Tráng Miệng, etc.)
  static async getMenuSections() {
    return this.request("/menu/sections", {
      method: "GET",
    });
  }

  static async createMenuSections(section_name, display_order) {
    return this.request("/menu/sections", {
      body: { section_name, display_order },
      method: "POST",
    });
  }

  static async updateMenuSectionOrder(id, sort_order) {
    return this.request(`/menu/sections/${id}/order`, {
      body: { sort_order },
      method: "PATCH",
    });
  }

  static async deleteMenuSections( id ) {
    return this.request(`/menu/sections/${id}`, {
      method: "DELETE",
    });
  }
  
  // Lấy danh sách categories theo section_id
  static async getMenuCategories(sectionId) {
    const query = sectionId ? `?section_id=${sectionId}` : "";
    return this.request(`/menu/categories${query}`, {
      method: "GET",
    });
  }

  static async createMenuCategory(category_name, section_id) {
    return this.request("/menu/categories", {
      body: { category_name, section_id },
      method: "POST",
    });
  }

  static async deleteMenuCategory( id ) {
    return this.request(`/menu/categories/${id}`, {
      method: "DELETE",
    });
  }



  // Lấy danh sách món ăn với filters
  // filters: { section_id, category_id, search, min_price, max_price, sort }
  static async getMenuItems(filters = {}) {
    const queryParams = new URLSearchParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    return this.request(`/menus${queryString ? `?${queryString}` : ""}`, {
      method: "GET",
    });
  }
  static async updateMenuItem(id, updatedData) {
    return this.request(`/menus/${id}`, {
      method: "PUT",
      body: updatedData,
    });
  }

  static async uploadMenuImage(id, file) {
    const formData = new FormData();
    formData.append("image", file);

    const url = `${API_BASE_URL}/menus/upload/${id}/image`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      return data;
    } catch (error) {
      throw error;
    }
  }
  // Tạo món ăn mới
  static async createMenuItem(newData) {
    return this.request("/menus", {
      method: "POST",
      body: newData,
    });
  }
  //DELETE /api/menus/:id
   // xóa món ăn mới 
   static async deleteMenuItem(id){
    return this.request(`/menus/${id}`, {
      method: "DELETE",
    });
   }

  // ============= CART API =============
  
  /**
   * Lấy giỏ hàng hiện tại
   */
  static async getCart() {
    return this.request("/cart", {
      method: "GET",
    });
  }

  /**
   * Thêm món vào giỏ hàng
   * @param {number} menuItemId - ID của món ăn
   * @param {number} quantity - Số lượng
   * @param {string} note - Ghi chú (optional)
   */
  static async addItemToCart(menuItemId, quantity = 1, note = '') {
    return this.request("/cart/items", {
      method: "POST",
      body: {
        menu_item_id: menuItemId,
        quantity,
        note: note || '',
      },
    });
  }

  /**
   * Cập nhật item trong giỏ hàng
   * @param {number} cartItemId - ID của cart item
   * @param {number} quantity - Số lượng mới (optional)
   * @param {string} note - Ghi chú mới (optional)
   */
  static async updateCartItem(cartItemId, { quantity, note }) {
    const body = {};
    if (quantity !== undefined) body.quantity = quantity;
    if (note !== undefined) body.note = note;

    return this.request(`/cart/items/${cartItemId}`, {
      method: "PUT",
      body,
    });
  }

  /**
   * Xóa item khỏi giỏ hàng
   * @param {number} cartItemId - ID của cart item
   */
  static async removeItemFromCart(cartItemId) {
    return this.request(`/cart/items/${cartItemId}`, {
      method: "DELETE",
    });
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  static async clearCart() {
    return this.request("/cart", {
      method: "DELETE",
    });
  }

  /**
   * Migrate guest cart sang user cart
   * @param {string} guestSessionId - Session ID của guest
   */
  static async migrateCart(guestSessionId) {
    return this.request("/cart/migrate", {
      method: "POST",
      body: {
        guest_session_id: guestSessionId,
      },
    });
  }

  /**
   * Validate giỏ hàng trước khi checkout
   */
  static async validateCart() {
    return this.request("/cart/validate", {
      method: "GET",
    });
  }

  // ============= ORDER API =============

  /**
   * Tạo đơn hàng từ giỏ hiện tại
   */
  static async createOrder(payload) {
    return this.request('/orders', {
      method: 'POST',
      body: payload,
    });
  }

  static async getTakeawayOrders(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    });

    const query = params.toString();
    return this.request(`/orders${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  }

  static async getTakeawayOrderDetail(orderId) {
    return this.request(`/orders/${orderId}`, {
      method: 'GET',
    });
  }

  static async updateTakeawayOrderStatus(orderId, status) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: { status },
    });
  }

  static async confirmTakeawayOrderDeposit(orderId) {
    return this.request(`/orders/${orderId}/deposit-confirm`, {
      method: 'PATCH',
    });
  }

  static async cancelTakeawayOrder(orderId, reason = '') {
    return this.request(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: {
        reason,
      },
    });
  }

  static async updateTakeawayOrderNote(orderId, note) {
    return this.request(`/orders/${orderId}/note`, {
      method: 'PATCH',
      body: {
        note,
      },
    });
  }

  // ============= RESERVATION API =============

  /**
   * Lấy danh sách bàn + khả dụng theo thời gian/số khách
   */
  static async getTablesAvailability({ date, time, guests }) {
    const query = new URLSearchParams({
      date: String(date),
      time: String(time),
      guests: String(guests),
    });

    return this.request(`/tables/availability?${query.toString()}`, {
      method: "GET",
    });
  }

  /**
   * Tạo reservation (guest hoặc user; backend tự lấy user/session từ cookie)
   */
  static async createReservation({ reservation_time, number_of_guests, table_id, note }) {
    return this.request("/reservations", {
      method: "POST",
      body: {
        reservation_time,
        number_of_guests,
        table_id,
        note,
      },
    });
  }

  static async getReservationHistory() {
    return this.request('/reservations/history', {
      method: 'GET',
    });
  }
  
}

export default ApiService;
