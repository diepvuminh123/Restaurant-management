const StatsService = require('../services/statsService');

class StatsController {
  static async getDashboardStats(req, res) {
    try {
      const { timeRange } = req.query; // 'today', 'week', 'month', 'all'
      console.log('Fetching stats for range:', timeRange);
      
      const stats = await StatsService.getDashboardStats(timeRange || 'month');
      console.log('Stats fetched successfully:', stats);
      
      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu thống kê:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi server khi lấy dữ liệu thống kê',
        error: error.message
      });
    }
  }
}

module.exports = StatsController;
