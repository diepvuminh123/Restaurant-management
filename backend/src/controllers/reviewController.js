const ReviewService = require('../services/reviewService');

class ReviewController {
  static async createReview(req, res) {
    try {
      const created = await ReviewService.createReview(req.session.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo review thành công',
        data: created,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể tạo review',
      });
    }
  }

  static async updateOwnReview(req, res) {
    try {
      const updated = await ReviewService.updateOwnReview(Number(req.params.id), req.session.userId, req.body);
      res.json({
        success: true,
        message: 'Cập nhật review thành công',
        data: updated,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể cập nhật review',
      });
    }
  }

  static async deleteOwnReview(req, res) {
    try {
      await ReviewService.deleteOwnReview(Number(req.params.id), req.session.userId);
      res.json({
        success: true,
        message: 'Xóa review thành công',
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể xóa review',
      });
    }
  }

  static async getPublicReviewsByMenuItem(req, res) {
    try {
      const result = await ReviewService.getPublicReviewsByMenuItem(Number(req.params.menuItemId), req.query);
      res.json({
        success: true,
        data: result.items,
        menu_item: result.menu_item,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể lấy danh sách review',
      });
    }
  }

  static async reportReview(req, res) {
    try {
      const report = await ReviewService.reportReview(Number(req.params.id), req.session.userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Report review thành công',
        data: report,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể report review',
      });
    }
  }

  static async getReportedReviewsForAdmin(req, res) {
    try {
      const result = await ReviewService.getReportedReviewsForAdmin(req.query);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể lấy review bị report',
      });
    }
  }

  static async getMenuItemReportSummary(req, res) {
    try {
      const result = await ReviewService.getMenuItemReportSummary(req.query);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể lấy thống kê report theo món ăn',
      });
    }
  }

  static async updateReviewVisibilityForAdmin(req, res) {
    try {
      const updated = await ReviewService.updateReviewVisibilityForAdmin(Number(req.params.id), req.body);
      res.json({
        success: true,
        message: updated.is_hidden ? 'Đã ẩn review' : 'Đã bỏ ẩn review',
        data: updated,
      });
    } catch (error) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể cập nhật trạng thái ẩn của review',
      });
    }
  }
}

module.exports = ReviewController;
