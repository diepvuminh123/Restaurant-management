import React, { useEffect, useState } from 'react';
import { IoSearchOutline, IoRefreshOutline } from 'react-icons/io5';
import ApiService from '../../services/apiService';
import { useToastContext } from '../../context/ToastContext';
import './UserManagement.css';

const ROLE_OPTIONS = [
  { value: 'all', label: 'Tất cả vai trò' },
  { value: 'customer', label: 'Khách hàng' },
  { value: 'employee', label: 'Nhân viên' },
  { value: 'admin', label: 'Admin' },
  { value: 'system_admin', label: 'System Admin' },
];

const BOOLEAN_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'true', label: 'Có' },
  { value: 'false', label: 'Không' },
];

const ROLE_LABEL = {
  customer: 'Khách hàng',
  employee: 'Nhân viên',
  admin: 'Admin',
  system_admin: 'System Admin',
};

const ASSIGNABLE_ROLE_OPTIONS = ROLE_OPTIONS.filter(
  (item) => item.value !== 'all' && item.value !== 'system_admin'
);

const isSystemAdminUser = (actorUser) => actorUser?.role === 'system_admin';

const canEditRole = (actorUser, targetUser) => {
  if (!targetUser) return false;

  // Rule: Nobody can edit system_admin role from this page.
  if (targetUser.role === 'system_admin') return false;

  // Rule: system_admin can edit customer/employee/admin.
  if (isSystemAdminUser(actorUser)) return true;

  // Rule: normal admin can only edit customer/employee.
  return targetUser.role === 'customer' || targetUser.role === 'employee';
};

const canSeeRoleOption = (actorUser, targetUser, roleValue) => {
  // Rule: filter option only, never a role to assign.
  if (roleValue === 'all') return false;

  // Rule: never allow assigning system_admin from dropdown UI.
  if (roleValue === 'system_admin') return false;

  if (isSystemAdminUser(actorUser)) return true;

  // Rule: admin cannot promote to admin, but must still see current admin role value.
  if (roleValue === 'admin') return targetUser?.role === 'admin';

  return true;
};

const getAssignableRoleOptions = (actorUser, targetUser) => {
  // Keep value valid for read-only system_admin row while still blocking assignment.
  if (targetUser?.role === 'system_admin') {
    return [{ value: 'system_admin', label: ROLE_LABEL.system_admin }];
  }

  return ASSIGNABLE_ROLE_OPTIONS.filter((roleOption) =>
    canSeeRoleOption(actorUser, targetUser, roleOption.value)
  );
};

const formatDateTime = (value) => {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const UserManagement = ({ currentUser }) => {
  const toast = useToastContext();

  const [draftFilters, setDraftFilters] = useState({
    search: '',
    role: 'all',
    locked: 'all',
  });

  const [activeFilters, setActiveFilters] = useState({
    search: '',
    role: 'all',
    locked: 'all',
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await ApiService.getAdminUsers({
        ...activeFilters,
        page,
        limit: pagination.limit,
      });

      if (response.success) {
        setUsers(response.data || []);
        setPagination((prev) => ({
          ...prev,
          ...(response.pagination || {}),
        }));
      }
    } catch (error) {
      toast.error(error.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters.search, activeFilters.role, activeFilters.locked]);

  const applyFilters = () => {
    setActiveFilters({ ...draftFilters });
  };

  const resetFilters = () => {
    const reset = {
      search: '',
      role: 'all',
      locked: 'all',
    };
    setDraftFilters(reset);
    setActiveFilters(reset);
  };

  const updateUserInState = (updatedUser) => {
    setUsers((prev) => prev.map((item) => (item.userId === updatedUser.userId ? updatedUser : item)));
  };

  const handleRoleChange = async (targetUserId, nextRole) => {
    try {
      setUpdatingUserId(targetUserId);
      const response = await ApiService.updateAdminUserRole(targetUserId, nextRole);
      if (response.success) {
        updateUserInState(response.data);
        toast.success('Đã cập nhật vai trò');
      }
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật vai trò');
      await fetchUsers(pagination.page);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleLockToggle = async (user) => {
    try {
      setUpdatingUserId(user.userId);
      const lockHours = 24;
      const response = await ApiService.updateAdminUserLock(user.userId, !user.isLocked, lockHours);
      if (response.success) {
        updateUserInState(response.data);
        toast.success(user.isLocked ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
      }
    } catch (error) {
      toast.error(error.message || 'Không thể cập nhật trạng thái khóa');
      await fetchUsers(pagination.page);
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="user-management">
      <div className="user-management__header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Admin có thể tìm kiếm tài khoản, đổi vai trò và khóa/mở khóa.</p>
        </div>
      </div>

      <section className="user-management__filters">
        <div className="user-management__search">
          <IoSearchOutline className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo tên đăng nhập, email, số điện thoại..."
            value={draftFilters.search}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
        </div>

        <div className="user-management__filter-grid">
          <select
            value={draftFilters.role}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, role: event.target.value }))}
          >
            {ROLE_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={draftFilters.locked}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, locked: event.target.value }))}
          >
            <option value="all">Khóa: Tất cả</option>
            {BOOLEAN_FILTER_OPTIONS.filter((item) => item.value !== 'all').map((item) => (
              <option key={item.value} value={item.value}>
                Khóa: {item.label}
              </option>
            ))}
          </select>

          <button type="button" className="btn btn--primary" onClick={applyFilters}>
            Lọc
          </button>
          <button type="button" className="btn btn--ghost" onClick={resetFilters}>
            <IoRefreshOutline />
            Đặt lại
          </button>
        </div>
      </section>

      <section className="user-management__table-wrap">
        {loading ? (
          <p className="user-management__placeholder">Đang tải danh sách người dùng...</p>
        ) : users.length === 0 ? (
          <p className="user-management__placeholder">Không có người dùng phù hợp với bộ lọc.</p>
        ) : (
          <table className="user-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Xác thực</th>
                <th>Khóa</th>
                <th>Người sửa cuối</th>
                <th>Tạo lúc</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isBusy = updatingUserId === user.userId;
                const isCurrentUser = currentUser?.userId === user.userId;
                const roleOptions = getAssignableRoleOptions(currentUser, user);
                const isRoleEditDisabled = isBusy || !canEditRole(currentUser, user);

                return (
                  <tr key={user.userId}>
                    <td>
                      <p className="user-table__main">{user.username}</p>
                      <p className="user-table__sub">{user.fullName || '--'}</p>
                    </td>
                    <td>
                      <p className="user-table__main">{user.email}</p>
                      <p className="user-table__sub">{user.phone || '--'}</p>
                    </td>
                    <td>
                      <select
                        className="user-table__role-select"
                        value={user.role}
                        disabled={isRoleEditDisabled}
                        onChange={(event) => handleRoleChange(user.userId, event.target.value)}
                      >
                        {roleOptions.map((roleOption) => (
                          <option key={roleOption.value} value={roleOption.value}>
                            {ROLE_LABEL[roleOption.value]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`pill ${user.isVerified ? 'pill--ok' : 'pill--warn'}`}>
                        {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </td>
                    <td>
                      <span className={`pill ${user.isLocked ? 'pill--danger' : 'pill--neutral'}`}>
                        {user.isLocked ? 'Đang khóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td>
                      <p className="user-table__main">{user.lastEditorUsername || '--'}</p>
                      <p className="user-table__sub">{formatDateTime(user.lastEditedAt)}</p>
                    </td>
                    <td>{formatDateTime(user.createdAt)}</td>
                    <td>
                      <div className="user-table__actions">
                        <button
                          type="button"
                          className={`btn btn--mini ${user.isLocked ? 'btn--success' : 'btn--danger'}`}
                          disabled={isBusy || user.role === 'system_admin' || (isCurrentUser && !user.isLocked)}
                          onClick={() => handleLockToggle(user)}
                          title={
                            user.role === 'system_admin'
                              ? 'Không thể khóa tài khoản system admin'
                              : (isCurrentUser && !user.isLocked ? 'Không thể tự khóa tài khoản đang đăng nhập' : '')
                          }
                        >
                          {user.isLocked ? 'Mở khóa' : 'Khóa 24h'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <div className="user-management__footer">
        <p>Tổng số người dùng: {pagination.total}</p>
        <div className="user-management__pagination">
          <button
            type="button"
            onClick={() => fetchUsers(pagination.page - 1)}
            disabled={loading || pagination.page <= 1}
          >
            {'<'}
          </button>
          <span>
            {pagination.page}/{pagination.total_pages}
          </span>
          <button
            type="button"
            onClick={() => fetchUsers(pagination.page + 1)}
            disabled={loading || pagination.page >= pagination.total_pages}
          >
            {'>'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
