const ReviewService = require('../../src/services/reviewService');
const Review = require('../../src/models/Review');

jest.mock('../../src/models/Review');

describe('ReviewService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toReviewView', () => {
    it('should return null if review is falsy', () => {
      expect(ReviewService.toReviewView(null)).toBeNull();
    });

    it('should format review correctly', () => {
      const mockReview = {
        id: 1,
        user_id: 2,
        menu_item_id: 3,
        rating: '4.5',
        comment: 'Ngon',
        is_hidden: 1, // DB sometimes returns 1/0 for boolean
        hidden_reason: 'Spam',
        report_count: '5',
      };
      
      const result = ReviewService.toReviewView(mockReview);
      
      expect(result).toHaveProperty('rating', 4.5);
      expect(result).toHaveProperty('is_hidden', true);
      expect(result).toHaveProperty('report_count', 5);
      expect(result).toHaveProperty('comment', 'Ngon');
    });
  });

  describe('createReview', () => {
    const payload = { menu_item_id: 1, rating: 5 };

    it('should throw 404 if menu item not found', async () => {
      Review.getMenuItemById.mockResolvedValue(null);
      await expect(ReviewService.createReview(1, payload)).rejects.toThrow('Món ăn không tồn tại');
    });

    it('should throw 409 if user already reviewed this item (DB 23505)', async () => {
      Review.getMenuItemById.mockResolvedValue({ id: 1 });
      const dbError = new Error('DB Error');
      dbError.code = '23505';
      dbError.constraint = 'unique_review_user_menu_item';
      Review.createReview.mockRejectedValue(dbError);

      await expect(ReviewService.createReview(1, payload)).rejects.toThrow('Bạn đã review món ăn này rồi');
    });

    it('should bubble up other errors', async () => {
      Review.getMenuItemById.mockResolvedValue({ id: 1 });
      Review.createReview.mockRejectedValue(new Error('Random Error'));

      await expect(ReviewService.createReview(1, payload)).rejects.toThrow('Random Error');
    });

    it('should create and format review successfully (Happy Path)', async () => {
      Review.getMenuItemById.mockResolvedValue({ id: 1 });
      Review.createReview.mockResolvedValue({ id: 10, rating: 5 });

      const result = await ReviewService.createReview(1, payload);
      expect(result).toHaveProperty('id', 10);
      expect(result).toHaveProperty('rating', 5);
    });
  });

  describe('updateOwnReview', () => {
    it('should throw 404 if review does not exist', async () => {
      Review.getReviewById.mockResolvedValue(null);
      await expect(ReviewService.updateOwnReview(10, 1, {})).rejects.toThrow('Không tìm thấy review của bạn');
    });

    it('should throw 404 if review does not belong to user', async () => {
      Review.getReviewById.mockResolvedValue({ id: 10, user_id: 99 }); // Belongs to user 99
      await expect(ReviewService.updateOwnReview(10, 1, {})).rejects.toThrow('Không tìm thấy review của bạn');
    });

    it('should throw 409 if review is hidden', async () => {
      Review.getReviewById.mockResolvedValue({ id: 10, user_id: 1, is_hidden: true });
      await expect(ReviewService.updateOwnReview(10, 1, {})).rejects.toThrow('Review đang bị ẩn, không thể chỉnh sửa');
    });

    it('should throw 404 if update fails internally', async () => {
      Review.getReviewById.mockResolvedValue({ id: 10, user_id: 1, is_hidden: false });
      Review.updateOwnReview.mockResolvedValue(null);
      await expect(ReviewService.updateOwnReview(10, 1, {})).rejects.toThrow('Không tìm thấy review của bạn');
    });

    it('should update and format review successfully (Happy Path)', async () => {
      Review.getReviewById.mockResolvedValue({ id: 10, user_id: 1, is_hidden: false });
      Review.updateOwnReview.mockResolvedValue({ id: 10, rating: 4 });

      const result = await ReviewService.updateOwnReview(10, 1, { rating: 4 });
      expect(result).toHaveProperty('rating', 4);
    });
  });

  describe('deleteOwnReview', () => {
    it('should throw 404 if delete fails', async () => {
      Review.deleteOwnReview.mockResolvedValue(false);
      await expect(ReviewService.deleteOwnReview(10, 1)).rejects.toThrow('Không tìm thấy review của bạn');
    });

    it('should return true if delete succeeds', async () => {
      Review.deleteOwnReview.mockResolvedValue(true);
      const result = await ReviewService.deleteOwnReview(10, 1);
      expect(result).toBe(true);
    });
  });

  describe('getPublicReviewsByMenuItem', () => {
    it('should throw 404 if menu item not found', async () => {
      Review.getMenuItemById.mockResolvedValue(null);
      await expect(ReviewService.getPublicReviewsByMenuItem(1, {})).rejects.toThrow('Món ăn không tồn tại');
    });

    it('should return formatted reviews and pagination', async () => {
      Review.getMenuItemById.mockResolvedValue({ id: 1, name: 'Pho' });
      Review.getPublicReviewsByMenuItem.mockResolvedValue({
        items: [{ id: 10, rating: 5 }],
        pagination: { total: 1 }
      });

      const result = await ReviewService.getPublicReviewsByMenuItem(1, {});
      
      expect(result.items[0]).toHaveProperty('id', 10);
      expect(result.menu_item).toHaveProperty('name', 'Pho');
      expect(result.pagination).toHaveProperty('total', 1);
    });
  });

  describe('reportReview', () => {
    it('should throw 404 if review does not exist', async () => {
      Review.getReviewById.mockResolvedValue(null);
      await expect(ReviewService.reportReview(10, 1, {})).rejects.toThrow('Review không tồn tại');
    });

    it('should throw 409 if user tries to report own review', async () => {
      Review.getReviewById.mockResolvedValue({ id: 10, user_id: 1 });
      await expect(ReviewService.reportReview(10, 1, {})).rejects.toThrow('Bạn không thể report review của chính mình');
    });

    it('should throw 409 if user already reported (DB 23505)', async () => {
      Review.getReviewById.mockResolvedValue({ id: 10, user_id: 2 });
      const dbError = new Error('DB Error');
      dbError.code = '23505';
      dbError.constraint = 'unique_review_report_per_user';
      Review.createReviewReport.mockRejectedValue(dbError);

      await expect(ReviewService.reportReview(10, 1, {})).rejects.toThrow('Bạn đã report review này rồi');
    });

    it('should create report successfully (Happy Path)', async () => {
      Review.getReviewById.mockResolvedValue({ id: 10, user_id: 2 });
      Review.createReviewReport.mockResolvedValue(true);

      const result = await ReviewService.reportReview(10, 1, { reason: 'Spam' });
      expect(result).toBe(true);
    });
  });

  describe('Admin Queries', () => {
    it('getReportedReviewsForAdmin should return formatted reviews', async () => {
      Review.getReportedReviewsForAdmin.mockResolvedValue({
        items: [{ id: 10, rating: 5 }],
        pagination: { total: 1 }
      });

      const result = await ReviewService.getReportedReviewsForAdmin({});
      expect(result.items[0]).toHaveProperty('id', 10);
      expect(result.pagination).toHaveProperty('total', 1);
    });

    it('getMenuItemReportSummary should call model', async () => {
      Review.getMenuItemReportSummary.mockResolvedValue([{ menu_item_id: 1 }]);
      const result = await ReviewService.getMenuItemReportSummary({});
      expect(result).toEqual([{ menu_item_id: 1 }]);
    });
  });

  describe('updateReviewVisibilityForAdmin', () => {
    it('should throw 400 if is_hidden is true but hidden_reason is missing', async () => {
      await expect(ReviewService.updateReviewVisibilityForAdmin(10, { is_hidden: true })).rejects.toThrow('hidden_reason là bắt buộc khi ẩn review');
    });

    it('should throw 404 if review does not exist', async () => {
      Review.updateReviewVisibilityForAdmin.mockResolvedValue(null);
      await expect(ReviewService.updateReviewVisibilityForAdmin(10, { is_hidden: false })).rejects.toThrow('Review không tồn tại');
    });

    it('should normalize payload and update successfully (Hide)', async () => {
      Review.updateReviewVisibilityForAdmin.mockResolvedValue({ id: 10, is_hidden: true, hidden_reason: 'Spam' });
      
      const result = await ReviewService.updateReviewVisibilityForAdmin(10, { is_hidden: true, hidden_reason: 'Spam' });
      
      expect(Review.updateReviewVisibilityForAdmin).toHaveBeenCalledWith(10, { is_hidden: true, hidden_reason: 'Spam' });
      expect(result).toHaveProperty('hidden_reason', 'Spam');
    });

    it('should normalize payload and update successfully (Show/Unhide)', async () => {
      Review.updateReviewVisibilityForAdmin.mockResolvedValue({ id: 10, is_hidden: false, hidden_reason: null });
      
      // Even if they pass hidden_reason when unhiding, it should force it to null
      const result = await ReviewService.updateReviewVisibilityForAdmin(10, { is_hidden: false, hidden_reason: 'Spam' });
      
      expect(Review.updateReviewVisibilityForAdmin).toHaveBeenCalledWith(10, { is_hidden: false, hidden_reason: null });
      expect(result).toHaveProperty('hidden_reason', null);
    });
  });
});
