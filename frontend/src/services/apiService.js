const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

class ApiService {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  }

  static async sendOtp(email, OTPType = 'signup') {
    return this.request('/auth/sendOtp', {
      method: 'POST',
      body: { email, OTPType },
    });
  }

  static async verifyOtp(email, code) {
    return this.request('/auth/verifyOtp', {
      method: 'POST',
      body: { email, code },
    });
  }

  static async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  }

  static async resetPassword(password, confirmPassword) {
    return this.request('/auth/resetPassword', {
      method: 'POST',
      body: { password, confirmPassword },
    });
  }

  static async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  static async getCurrentUser() {
    return this.request('/auth/me', {
      method: 'GET',
    });
  }

  static async checkAuth() {
    return this.request('/auth/check', {
      method: 'GET',
    });
  }
}

export default ApiService;
