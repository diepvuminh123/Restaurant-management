const UserAdminService = require('../services/userAdminService');

class UserAdminController {
  static async getUsers(req, res) {
    try {
      const result = await UserAdminService.getUsers(req.query);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Không thể lấy danh sách người dùng',
      });
    }
  }

  static async updateRole(req, res) {
    try {
      const updated = await UserAdminService.updateUserRole(
        Number(req.params.id),
        req.body.role,
        req.session.userId,
        req.session.userRole
      );

      res.json({
        success: true,
        message: 'Cập nhật vai trò thành công',
        data: updated,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Không thể cập nhật vai trò',
      });
    }
  }

  static async updateLockState(req, res) {
    try {
      const updated = await UserAdminService.updateUserLockState(
        Number(req.params.id),
        req.body.locked,
        req.body.lockHours,
        req.session.userId,
        req.session.userRole
      );

      res.json({
        success: true,
        message: req.body.locked ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
        data: updated,
      });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Không thể cập nhật trạng thái khóa',
      });
    }
  }
}

module.exports = UserAdminController;