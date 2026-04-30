const PromotionService = require('../services/promotionService');

class PromotionController {
  static async listPromotions(req, res) {
    try {
      const result = await PromotionService.listPromotions(req.query);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination
      });
    } catch (error) {
      console.error('List promotions error:', error);
      res.status(500).json({ success: false, message: 'Lỗi khi lấy danh sách khuyến mãi' });
    }
  }

  static async getPromotion(req, res) {
    try {
      const promo = await PromotionService.getPromotion(req.params.id);
      res.json({ success: true, data: promo });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async createPromotion(req, res) {
    try {
      const promo = await PromotionService.createPromotion(req.body);
      res.status(201).json({ success: true, message: 'Tạo mã khuyến mãi thành công', data: promo });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async updatePromotion(req, res) {
    try {
      const promo = await PromotionService.updatePromotion(req.params.id, req.body);
      res.json({ success: true, message: 'Cập nhật thành công', data: promo });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async deletePromotion(req, res) {
    try {
      await PromotionService.deletePromotion(req.params.id);
      res.json({ success: true, message: 'Xóa khuyến mãi thành công' });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }

  static async validatePromotion(req, res) {
    try {
      const { code, cart_total } = req.body;
      const result = await PromotionService.validateCode(code, cart_total);
      
      res.json({
        success: true,
        message: 'Áp dụng mã thành công',
        data: result
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
  }
}

module.exports = PromotionController;
