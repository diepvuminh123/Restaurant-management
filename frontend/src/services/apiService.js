const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:5002/api";

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
  


  
}

export default ApiService;
