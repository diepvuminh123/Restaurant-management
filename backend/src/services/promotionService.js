const Promotion = require('../models/Promotion');

class PromotionService {
  static async listPromotions(query) {
    return Promotion.getAll(query);
  }

  static async getPromotion(id) {
    const promo = await Promotion.getById(id);
    if (!promo) {
      const error = new Error('Không tìm thấy khuyến mãi');
      error.statusCode = 404;
      throw error;
    }
    return promo;
  }

  static async createPromotion(data) {
    const existing = await Promotion.getByCode(data.code);
    if (existing) {
      const error = new Error('Mã khuyến mãi này đã tồn tại');
      error.statusCode = 400;
      throw error;
    }
    
    if (new Date(data.start_date) >= new Date(data.end_date)) {
      const error = new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu');
      error.statusCode = 400;
      throw error;
    }

    return Promotion.create(data);
  }

  static async updatePromotion(id, data) {
    const existing = await Promotion.getById(id);
    if (!existing) {
      const error = new Error('Không tìm thấy khuyến mãi');
      error.statusCode = 404;
      throw error;
    }
    
    // Validate dates if they are updated
    const start = data.start_date ? new Date(data.start_date) : new Date(existing.start_date);
    const end = data.end_date ? new Date(data.end_date) : new Date(existing.end_date);
    
    if (start >= end) {
      const error = new Error('Ngày kết thúc phải lớn hơn ngày bắt đầu');
      error.statusCode = 400;
      throw error;
    }

    return Promotion.update(id, data);
  }

  static async deletePromotion(id) {
    const existing = await Promotion.getById(id);
    if (!existing) {
      const error = new Error('Không tìm thấy khuyến mãi');
      error.statusCode = 404;
      throw error;
    }

    if (existing.used_count > 0) {
      const error = new Error('Không thể xóa mã khuyến mãi đã được sử dụng. Vui lòng vô hiệu hóa thay vì xóa.');
      error.statusCode = 409;
      throw error;
    }

    return Promotion.delete(id);
  }

  static async validateCode(code, cartTotal) {
    if (!code) {
      const error = new Error('Vui lòng nhập mã khuyến mãi');
      error.statusCode = 400;
      throw error;
    }

    const promotion = await Promotion.getByCode(code);
    
    if (!promotion) {
      const error = new Error('Mã khuyến mãi không tồn tại');
      error.statusCode = 404;
      throw error;
    }

    if (!promotion.is_active) {
      const error = new Error('Mã khuyến mãi này không hoạt động');
      error.statusCode = 400;
      throw error;
    }

    const now = new Date();
    if (now < new Date(promotion.start_date)) {
      const error = new Error('Mã khuyến mãi này chưa đến ngày sử dụng');
      error.statusCode = 400;
      throw error;
    }

    if (now > new Date(promotion.end_date)) {
      const error = new Error('Mã khuyến mãi này đã hết hạn');
      error.statusCode = 400;
      throw error;
    }

    if (Number(cartTotal) < Number(promotion.min_order_value)) {
      const error = new Error(`Đơn hàng cần tối thiểu ${Number(promotion.min_order_value).toLocaleString('vi-VN')}đ để áp dụng mã này`);
      error.statusCode = 400;
      throw error;
    }

    if (promotion.usage_limit !== null && promotion.used_count >= promotion.usage_limit) {
      const error = new Error('Mã khuyến mãi này đã hết lượt sử dụng');
      error.statusCode = 410;
      throw error;
    }

    const discountAmount = Promotion.calculateDiscount(promotion, cartTotal);

    return {
      promotion,
      discountAmount
    };
  }
}

module.exports = PromotionService;
