const User = require('../models/User');

class UserAdminService {
  static buildError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  static toUserView(user) {
    if (!user) return null;
    return {
      userId: user.user_id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
      isVerified: user.is_verified,
      failLoginAttempts: user.fail_login_attempts,
      lockedUntil: user.locked_until,
      isLocked: !!(user.locked_until && new Date(user.locked_until) > new Date()),
      createdAt: user.created_at,
    };
  }

  static async getUsers(filters) {
    const result = await User.getUsersForAdmin(filters);
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 10);
    const totalPages = Math.max(1, Math.ceil(result.total / limit));

    return {
      items: result.rows.map(UserAdminService.toUserView),
      pagination: {
        page,
        limit,
        total: result.total,
        total_pages: totalPages,
      },
    };
  }

  static async updateUserRole(userId, role, actorUserId) {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw UserAdminService.buildError('Không tìm thấy người dùng', 404);
    }

    if (targetUser.user_id === actorUserId && role !== 'admin') {
      throw UserAdminService.buildError('Bạn không thể tự hạ quyền tài khoản admin của mình', 409);
    }

    if (targetUser.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countAdmins();
      if (adminCount <= 1) {
        throw UserAdminService.buildError('Không thể hạ quyền admin cuối cùng', 409);
      }
    }

    const updated = await User.updateUserRole(userId, role);
    return UserAdminService.toUserView(updated);
  }

  static async updateUserLockState(userId, locked, lockHours, actorUserId) {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw UserAdminService.buildError('Không tìm thấy người dùng', 404);
    }

    if (targetUser.user_id === actorUserId && locked) {
      throw UserAdminService.buildError('Bạn không thể tự khóa tài khoản của mình', 409);
    }

    const updated = await User.updateUserLockState(userId, locked, lockHours);
    return UserAdminService.toUserView(updated);
  }
}

module.exports = UserAdminService;