const UserAdminService = require('../../src/services/userAdminService');
const User = require('../../src/models/User');
const AdminActionLog = require('../../src/models/AdminActionLog');

jest.mock('../../src/models/User');
jest.mock('../../src/models/AdminActionLog');

describe('UserAdminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toUserView', () => {
    it('should return null if no user provided', () => {
      expect(UserAdminService.toUserView(null)).toBeNull();
    });

    it('should format user correctly', () => {
      const mockUser = {
        user_id: 1,
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
        phone: '0123456789',
        role: 'customer',
        is_verified: true,
        fail_login_attempts: 0,
        locked_until: null,
        created_at: '2024-01-01',
        last_editor_user_id: 2,
        last_editor_username: 'admin',
        last_edited_at: '2024-01-02'
      };

      const result = UserAdminService.toUserView(mockUser);
      expect(result.userId).toBe(1);
      expect(result.username).toBe('testuser');
      expect(result.isLocked).toBe(false);
    });

    it('should correctly identify locked user', () => {
      const mockUser = {
        locked_until: new Date(Date.now() + 100000).toISOString()
      };
      const result = UserAdminService.toUserView(mockUser);
      expect(result.isLocked).toBe(true);
    });
  });

  describe('ensureCanManageAdminRole', () => {
    it('should throw if non-system-admin tries to assign admin role', () => {
      expect(() => {
        UserAdminService.ensureCanManageAdminRole({ role: 'employee' }, { role: 'customer' }, 'admin');
      }).toThrow('Chỉ system admin mới có quyền gán hoặc thay đổi vai trò admin');
    });

    it('should throw if non-system-admin tries to modify existing admin', () => {
      expect(() => {
        UserAdminService.ensureCanManageAdminRole({ role: 'employee' }, { role: 'admin' }, 'customer');
      }).toThrow('Chỉ system admin mới có quyền gán hoặc thay đổi vai trò admin');
    });

    it('should allow system admin to manage admin roles', () => {
      expect(() => {
        UserAdminService.ensureCanManageAdminRole({ role: 'system_admin' }, { role: 'customer' }, 'admin');
      }).not.toThrow();
    });

    it('should allow non-system-admin to manage non-admin roles', () => {
      expect(() => {
        UserAdminService.ensureCanManageAdminRole({ role: 'employee' }, { role: 'customer' }, 'employee');
      }).not.toThrow();
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      User.getUsersForAdmin.mockResolvedValue({
        rows: [{ user_id: 1 }],
        total: 15
      });

      const result = await UserAdminService.getUsers({ page: 2, limit: 10 });
      expect(result.items.length).toBe(1);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.total_pages).toBe(2);
      expect(result.pagination.total).toBe(15);
    });
  });

  describe('updateUserRole', () => {
    it('should throw if actor is invalid', async () => {
      User.findById.mockResolvedValueOnce(null);
      await expect(UserAdminService.updateUserRole(1, 'admin', 2)).rejects.toThrow('Phiên đăng nhập không hợp lệ');
    });

    it('should throw if target user not found', async () => {
      User.findById.mockResolvedValueOnce({ role: 'system_admin' });
      User.findById.mockResolvedValueOnce(null);
      await expect(UserAdminService.updateUserRole(1, 'admin', 2)).rejects.toThrow('Không tìm thấy người dùng');
    });

    it('should throw if trying to change system_admin role by non-system_admin', async () => {
      User.findById.mockResolvedValueOnce({ role: 'admin' });
      User.findById.mockResolvedValueOnce({ role: 'system_admin' });
      await expect(UserAdminService.updateUserRole(1, 'customer', 2)).rejects.toThrow('Bạn không có quyền thay đổi vai trò của system admin');
    });

    it('should throw if user tries to demote themselves from admin', async () => {
      User.findById.mockResolvedValueOnce({ role: 'system_admin', user_id: 1 });
      User.findById.mockResolvedValueOnce({ role: 'admin', user_id: 1 });
      await expect(UserAdminService.updateUserRole(1, 'customer', 1)).rejects.toThrow('Bạn không thể tự hạ quyền tài khoản admin của mình');
    });

    it('should throw if trying to demote the last admin', async () => {
      User.findById.mockResolvedValueOnce({ role: 'system_admin', user_id: 2 });
      User.findById.mockResolvedValueOnce({ role: 'admin', user_id: 1 });
      User.countAdmins.mockResolvedValue(1);
      await expect(UserAdminService.updateUserRole(1, 'customer', 2)).rejects.toThrow('Không thể hạ quyền admin cuối cùng');
    });

    it('should update role successfully and create log', async () => {
      User.findById.mockResolvedValueOnce({ role: 'system_admin', user_id: 2 }); // actor
      User.findById.mockResolvedValueOnce({ role: 'customer', user_id: 1 }); // target
      User.updateUserRole.mockResolvedValue({ role: 'admin' });
      User.getAdminUserById.mockResolvedValue({ user_id: 1, role: 'admin' });
      AdminActionLog.create.mockResolvedValue({});

      const result = await UserAdminService.updateUserRole(1, 'admin', 2);
      expect(result.role).toBe('admin');
      expect(AdminActionLog.create).toHaveBeenCalled();
    });
  });

  describe('updateUserLockState', () => {
    it('should throw if target user not found', async () => {
      User.findById.mockResolvedValueOnce(null);
      await expect(UserAdminService.updateUserLockState(1, true, 24, 2)).rejects.toThrow('Không tìm thấy người dùng');
    });

    it('should throw if trying to lock system admin', async () => {
      User.findById.mockResolvedValueOnce({ role: 'system_admin' });
      await expect(UserAdminService.updateUserLockState(1, true, 24, 2)).rejects.toThrow('Không thể khóa hoặc mở khóa tài khoản system admin');
    });

    it('should throw if trying to lock oneself', async () => {
      User.findById.mockResolvedValueOnce({ user_id: 1, role: 'customer' });
      await expect(UserAdminService.updateUserLockState(1, true, 24, 1)).rejects.toThrow('Bạn không thể tự khóa tài khoản của mình');
    });

    it('should lock user successfully', async () => {
      User.findById.mockResolvedValueOnce({ user_id: 1, role: 'customer' });
      User.updateUserLockState.mockResolvedValue({ locked_until: '2024', fail_login_attempts: 0 });
      User.getAdminUserById.mockResolvedValue({ user_id: 1, isLocked: true });
      AdminActionLog.create.mockResolvedValue({});

      await UserAdminService.updateUserLockState(1, true, 24, 2);
      expect(User.updateUserLockState).toHaveBeenCalledWith(1, true, 24);
      expect(AdminActionLog.create).toHaveBeenCalled();
    });
    
    it('should unlock user successfully', async () => {
        User.findById.mockResolvedValueOnce({ user_id: 1, role: 'customer' });
        User.updateUserLockState.mockResolvedValue({ locked_until: null, fail_login_attempts: 0 });
        User.getAdminUserById.mockResolvedValue({ user_id: 1, isLocked: false });
        AdminActionLog.create.mockResolvedValue({});
  
        await UserAdminService.updateUserLockState(1, false, null, 2);
        expect(User.updateUserLockState).toHaveBeenCalledWith(1, false, null);
        expect(AdminActionLog.create).toHaveBeenCalled();
      });
  });
});
