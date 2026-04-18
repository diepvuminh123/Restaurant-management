const Review = require('../models/Review');

class ReviewService {
  static buildError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  static toReviewView(review) {
    if (!review) return null;

    return {
      id: review.id,
      user_id: review.user_id,
      menu_item_id: review.menu_item_id,
      rating: Number(review.rating),
      comment: review.comment || '',
      is_hidden: Boolean(review.is_hidden),
      hidden_reason: review.hidden_reason,
      created_at: review.created_at,
      updated_at: review.updated_at,
      username: review.username,
      full_name: review.full_name,
      menu_item_name: review.menu_item_name,
      report_count: review.report_count !== undefined ? Number(review.report_count) : undefined,
      latest_report_at: review.latest_report_at,
      reasons: review.reasons || undefined,
      report_notes: review.notes || undefined,
    };
  }

  static async createReview(userId, payload) {
    const menuItem = await Review.getMenuItemById(payload.menu_item_id);
    if (!menuItem) {
      throw ReviewService.buildError('Món ăn không tồn tại', 404);
    }

    try {
      const created = await Review.createReview(userId, payload);
      return ReviewService.toReviewView(created);
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'unique_review_user_menu_item') {
        throw ReviewService.buildError('Bạn đã review món ăn này rồi', 409);
      }
      throw error;
    }
  }

  static async updateOwnReview(reviewId, userId, payload) {
    const existing = await Review.getReviewById(reviewId);
    if (!existing || Number(existing.user_id) !== Number(userId)) {
      throw ReviewService.buildError('Không tìm thấy review của bạn', 404);
    }

    if (existing.is_hidden) {
      throw ReviewService.buildError('Review đang bị ẩn, không thể chỉnh sửa', 409);
    }

    const updated = await Review.updateOwnReview(reviewId, userId, payload);
    if (!updated) {
      throw ReviewService.buildError('Không tìm thấy review của bạn', 404);
    }

    return ReviewService.toReviewView(updated);
  }

  static async deleteOwnReview(reviewId, userId) {
    const deleted = await Review.deleteOwnReview(reviewId, userId);
    if (!deleted) {
      throw ReviewService.buildError('Không tìm thấy review của bạn', 404);
    }

    return deleted;
  }

  static async getPublicReviewsByMenuItem(menuItemId, query) {
    const menuItem = await Review.getMenuItemById(menuItemId);
    if (!menuItem) {
      throw ReviewService.buildError('Món ăn không tồn tại', 404);
    }

    const result = await Review.getPublicReviewsByMenuItem(menuItemId, query);
    return {
      items: result.items.map(ReviewService.toReviewView),
      pagination: result.pagination,
      menu_item: menuItem,
    };
  }

  static async reportReview(reviewId, reporterId, payload) {
    const review = await Review.getReviewById(reviewId);
    if (!review) {
      throw ReviewService.buildError('Review không tồn tại', 404);
    }

    if (Number(review.user_id) === Number(reporterId)) {
      throw ReviewService.buildError('Bạn không thể report review của chính mình', 409);
    }

    try {
      return await Review.createReviewReport(reviewId, reporterId, payload);
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'unique_review_report_per_user') {
        throw ReviewService.buildError('Bạn đã report review này rồi', 409);
      }
      throw error;
    }
  }

  static async getReportedReviewsForAdmin(query) {
    const result = await Review.getReportedReviewsForAdmin(query);
    return {
      items: result.items.map(ReviewService.toReviewView),
      pagination: result.pagination,
    };
  }

  static async getMenuItemReportSummary(query) {
    return Review.getMenuItemReportSummary(query);
  }

  static async updateReviewVisibilityForAdmin(reviewId, payload) {
    if (payload.is_hidden && !payload.hidden_reason) {
      throw ReviewService.buildError('hidden_reason là bắt buộc khi ẩn review', 400);
    }

    const normalizedPayload = {
      is_hidden: payload.is_hidden,
      hidden_reason: payload.is_hidden ? payload.hidden_reason : null,
    };

    const updated = await Review.updateReviewVisibilityForAdmin(reviewId, normalizedPayload);
    if (!updated) {
      throw ReviewService.buildError('Review không tồn tại', 404);
    }

    return ReviewService.toReviewView(updated);
  }
}

module.exports = ReviewService;
