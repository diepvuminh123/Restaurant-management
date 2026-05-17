const TableService = require('../services/tableService');

class TableController {
  static async getTableMapForAdmin(req, res) {
    try {
      const { status } = req.query;
      const tables = await TableService.getTableMapForAdmin({ status });

      res.json({
        success: true,
        message: 'Đây là sơ đồ bàn của nhà hàng',
        data: tables,
      });
    } catch (error) {
      console.error('Get table map for admin error:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Không thể tải sơ đồ bàn',
        error: error.message,
      });
    }
  }

  static async createTableForAdmin(req, res) {
    try {
      const table = await TableService.createTableForAdmin(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo bàn thành công',
        data: table,
      });
    } catch (error) {
      console.error('Create table for admin error:', error);
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Không thể tạo bàn',
        error: error.message,
      });
    }
  }

  static async updateTableForAdmin(req, res) {
    try {
      const tableId = Number(req.params?.id);
      if (!Number.isFinite(tableId)) {
        return res.status(400).json({
          success: false,
          message: 'table_id không hợp lệ',
        });
      }

      const table = await TableService.updateTableForAdmin(tableId, req.body);
      res.json({
        success: true,
        message: 'Cập nhật bàn thành công',
        data: table,
      });
    } catch (error) {
      console.error('Update table for admin error:', error);
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Không thể cập nhật bàn',
        error: error.message,
      });
    }
  }

  static async deleteTableForAdmin(req, res) {
    try {
      const tableId = Number(req.params?.id);
      if (!Number.isFinite(tableId)) {
        return res.status(400).json({
          success: false,
          message: 'table_id không hợp lệ',
        });
      }

      const table = await TableService.deleteTableForAdmin(tableId);
      res.json({
        success: true,
        message: 'Xóa bàn thành công',
        data: table,
      });
    } catch (error) {
      console.error('Delete table for admin error:', error);
      res.status(error.statusCode || 400).json({
        success: false,
        message: error.message || 'Không thể xóa bàn',
        error: error.message,
      });
    }
  }
}

module.exports = TableController;