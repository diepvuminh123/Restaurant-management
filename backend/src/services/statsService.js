const Stats = require('../models/Stats');

class StatsService {
  static async getDashboardStats(timeRange = 'month') {
    // Gọi logic truy vấn từ Model
    return await Stats.getDashboardStats(timeRange);
  }
}

module.exports = StatsService;
