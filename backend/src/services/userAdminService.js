const User = require('../models/User');
const AdminActionLog = require('../models/AdminActionLog');

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

  static ensureCanManageAdminRole(actorUser, targetUser, nextRole) {
    const actorIsSystemAdmin = actorUser?.role === 'system_admin';
    const targetIsAdmin = targetUser?.role === 'admin';
    const nextIsAdmin = nextRole === 'admin';

    if ((targetIsAdmin || nextIsAdmin) && !actorIsSystemAdmin) {
      throw UserAdminService.buildError(
        'Chỉ system admin mới có quyền gán hoặc thay đổi vai trò admin',
        403
      );
    }
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
    const actorUser = await User.findById(actorUserId);
    if (!actorUser) {
      throw UserAdminService.buildError('Phiên đăng nhập không hợp lệ', 401);
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw UserAdminService.buildError('Không tìm thấy người dùng', 404);
    }

    UserAdminService.ensureCanManageAdminRole(actorUser, targetUser, role);

    if (targetUser.role === 'system_admin' && actorUser.role !== 'system_admin') {
      throw UserAdminService.buildError('Bạn không có quyền thay đổi vai trò của system admin', 403);
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
    await AdminActionLog.create({
      actorUserId,
      targetUserId: userId,
      action: 'CHANGE_ROLE',
      oldValue: { role: targetUser.role },
      newValue: { role: updated.role },
    });

    return UserAdminService.toUserView(updated);
  }

  static async updateUserVerification(userId, isVerified, actorUserId) {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw UserAdminService.buildError('Không tìm thấy người dùng', 404);
    }

    const updated = await User.updateUserVerification(userId, isVerified);
    await AdminActionLog.create({
      actorUserId,
      targetUserId: userId,
      action: isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER',
      oldValue: { is_verified: targetUser.is_verified },
      newValue: { is_verified: updated.is_verified },
    });

    return UserAdminService.toUserView(updated);
  }

  static async updateUserLockState(userId, locked, lockHours, actorUserId) {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw UserAdminService.buildError('Không tìm thấy người dùng', 404);
    }

    if (targetUser.role === 'system_admin') {
      throw UserAdminService.buildError('Không thể khóa hoặc mở khóa tài khoản system admin', 403);
    }

    if (targetUser.user_id === actorUserId && locked) {
      throw UserAdminService.buildError('Bạn không thể tự khóa tài khoản của mình', 409);
    }

    const updated = await User.updateUserLockState(userId, locked, lockHours);
    await AdminActionLog.create({
      actorUserId,
      targetUserId: userId,
      action: locked ? 'LOCK_USER' : 'UNLOCK_USER',
      oldValue: {
        locked_until: targetUser.locked_until,
        fail_login_attempts: targetUser.fail_login_attempts,
      },
      newValue: {
        locked_until: updated.locked_until,
        fail_login_attempts: updated.fail_login_attempts,
      },
    });

    return UserAdminService.toUserView(updated);
  }
}

module.exports = UserAdminService;