import React, { useEffect, useMemo, useState } from 'react';
import {
  IoAdd,
  IoCreateOutline,
  IoSearchOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import ApiService from '../../services/apiService';
import { useToastContext } from '../../context/ToastContext';
import './TableManagement.css';

const TABLE_STATUS_OPTIONS = [
  { value: 'ALL', label: 'Tất cả trạng thái' },
  { value: 'AVAILABLE', label: 'Sẵn sàng' },
  { value: 'RESERVED', label: 'Đã giữ chỗ' },
  { value: 'OCCUPIED', label: 'Đang phục vụ' },
];

const INITIAL_FORM_DATA = {
  capacity: '4',
  table_status: 'AVAILABLE',
  position_x: '0',
  position_y: '0',
  restaurant_note: '',
};

const formatTableLabel = (tableId) => {
  const number = Number(tableId);
  return Number.isFinite(number) ? `B${String(number).padStart(2, '0')}` : String(tableId);
};

const formatPlacementValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number + 1 : '--';
};

const getStatusMeta = (status) => {
  switch (status) {
    case 'RESERVED':
      return { label: 'Đã giữ chỗ', className: 'warn' };
    case 'OCCUPIED':
      return { label: 'Đang phục vụ', className: 'danger' };
    default:
      return { label: 'Sẵn sàng', className: 'ok' };
  }
};

const mapTableToForm = (table) => ({
  capacity: String(table.capacity ?? ''),
  table_status: String(table.table_status || 'AVAILABLE'),
  position_x: String(table.position_x ?? 0),
  position_y: String(table.position_y ?? 0),
  restaurant_note: table.restaurant_note || '',
});

const TableManagement = () => {
  const toast = useToastContext();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [draftFilters, setDraftFilters] = useState({
    search: '',
    status: 'ALL',
  });
  const [activeFilters, setActiveFilters] = useState({
    search: '',
    status: 'ALL',
  });

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getAdminTables();
      setTables(response?.data || []);
    } catch (error) {
      toast.error(error?.message || 'Không thể tải danh sách bàn');
      setTables([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const filteredTables = useMemo(() => {
    const normalizedSearch = activeFilters.search.trim().toLowerCase();

    return tables.filter((table) => {
      const matchesStatus = activeFilters.status === 'ALL'
        || String(table.table_status || '').toUpperCase() === activeFilters.status;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const haystack = [
        formatTableLabel(table.table_id).toLowerCase(),
        String(table.table_id || ''),
        String(table.capacity || ''),
        String(table.position_x || ''),
        String(table.position_y || ''),
        String(table.restaurant_note || '').toLowerCase(),
      ].join(' ');

      return haystack.includes(normalizedSearch);
    });
  }, [activeFilters, tables]);

  const currentEditingTable = useMemo(
    () => tables.find((table) => table.table_id === editingTableId) || null,
    [editingTableId, tables]
  );

  const handleResetForm = () => {
    setEditingTableId(null);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    handleResetForm();
  };

  const handleOpenCreateModal = () => {
    handleResetForm();
    setIsModalOpen(true);
  };

  const handleEditTable = (table) => {
    setEditingTableId(table.table_id);
    setFormData(mapTableToForm(table));
    setIsModalOpen(true);
  };

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      capacity: Number(formData.capacity),
      table_status: formData.table_status,
      position_x: Number(formData.position_x),
      position_y: Number(formData.position_y),
      restaurant_note: formData.restaurant_note.trim() || null,
    };

    try {
      setSubmitting(true);

      if (editingTableId) {
        await ApiService.updateAdminTable(editingTableId, payload);
        toast.success('Cập nhật bàn thành công');
      } else {
        await ApiService.createAdminTable(payload);
        toast.success('Tạo bàn thành công');
      }

      handleCloseModal();
      await fetchTables();
    } catch (error) {
      toast.error(error?.message || 'Không thể lưu thông tin bàn');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async (table) => {
    const confirmed = globalThis.confirm(
      `Xóa ${formatTableLabel(table.table_id)} khỏi hệ thống? Hành động này không thể hoàn tác.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await ApiService.deleteAdminTable(table.table_id);
      toast.success('Xóa bàn thành công');
      if (editingTableId === table.table_id) {
        handleCloseModal();
      }
      await fetchTables();
    } catch (error) {
      toast.error(error?.message || 'Không thể xóa bàn');
    }
  };

  const applyFilters = () => {
    setActiveFilters({ ...draftFilters });
  };

  const tableContent = (() => {
    if (loading) {
      return <p className="table-management__placeholder">Đang tải danh sách bàn...</p>;
    }

    if (filteredTables.length === 0) {
      return <p className="table-management__placeholder">Không có bàn phù hợp với bộ lọc.</p>;
    }

    return (
      <table className="table-admin-table">
        <thead>
          <tr>
            <th>Bàn</th>
            <th>Sức chứa</th>
            <th>Trạng thái</th>
            <th>Vị trí</th>
            <th>Ghi chú</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredTables.map((table) => {
            const statusMeta = getStatusMeta(table.table_status);

            return (
              <tr key={table.table_id}>
                <td>
                  <p className="table-admin-table__main">{formatTableLabel(table.table_id)}</p>
                  <p className="table-admin-table__sub">Mã bàn #{table.table_id}</p>
                </td>
                <td>{table.capacity} chỗ</td>
                <td>
                  <span className={`pill pill--${statusMeta.className}`}>
                    {statusMeta.label}
                  </span>
                </td>
                <td>
                  <p className="table-admin-table__main">Cột {formatPlacementValue(table.position_x)}</p>
                  <p className="table-admin-table__sub">Hàng {formatPlacementValue(table.position_y)}</p>
                </td>
                <td>
                  <p className="table-admin-table__sub table-admin-table__note">{table.restaurant_note || '--'}</p>
                </td>
                <td>
                  <div className="table-admin-table__actions">
                    <button type="button" className="btn btn--ghost btn--mini" onClick={() => handleEditTable(table)}>
                      <IoCreateOutline />
                      Sửa
                    </button>
                    <button
                      type="button"
                      className="btn btn--danger btn--mini"
                      onClick={() => handleDeleteTable(table)}
                    >
                      <IoTrashOutline />
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  })();

  let submitLabel = 'Tạo bàn';
  if (submitting) {
    submitLabel = 'Đang lưu...';
  } else if (editingTableId) {
    submitLabel = 'Lưu thay đổi';
  }

  return (
    <div className="table-management">
      <div className="table-management__header">
        <div>
          <h1>Quản lý bàn</h1>
          <p>Admin có thể tạo bàn, cập nhật trạng thái và chỉnh lại vị trí hiển thị.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={handleOpenCreateModal}>
          <IoAdd />
          Tạo bàn mới
        </button>
      </div>

      <section className="table-management__filters">
        <div className="table-management__search">
          <IoSearchOutline className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã bàn, sức chứa, ghi chú..."
            value={draftFilters.search}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
        </div>

        <div className="table-management__filter-grid">
          <select
            value={draftFilters.status}
            onChange={(event) => setDraftFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            {TABLE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button type="button" className="btn btn--primary" onClick={applyFilters}>
            Lọc
          </button>
        </div>
      </section>

      <section className="table-management__table-wrap">
        {tableContent}
      </section>

      {isModalOpen && (
        <div className="table-management__modal-overlay">
          <button
            type="button"
            className="table-management__modal-backdrop"
            onClick={handleCloseModal}
            aria-label="Đóng modal quản lý bàn"
          />
          <dialog
            className="table-management__modal"
            open
            onCancel={handleCloseModal}
            aria-labelledby="table-management-modal-title"
          >
            <div className="table-management__modal-header">
              <h2 id="table-management-modal-title">
                {editingTableId ? `Chỉnh sửa ${formatTableLabel(editingTableId)}` : 'Tạo bàn mới'}
              </h2>
              <button
                type="button"
                className="btn btn--ghost table-management__modal-close"
                onClick={handleCloseModal}
                disabled={submitting}
              >
                Đóng
              </button>
            </div>

            <form className="table-management__editor-form" onSubmit={handleSubmit}>
              <label>
                <span>Sức chứa</span>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formData.capacity}
                  onChange={handleFieldChange}
                  required
                />
              </label>

              <label>
                <span>Trạng thái bàn</span>
                <select name="table_status" value={formData.table_status} onChange={handleFieldChange}>
                  {TABLE_STATUS_OPTIONS.filter((option) => option.value !== 'ALL').map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Vị trí X</span>
                <input
                  type="number"
                  name="position_x"
                  min="0"
                  value={formData.position_x}
                  onChange={handleFieldChange}
                  required
                />
              </label>

              <label>
                <span>Vị trí Y</span>
                <input
                  type="number"
                  name="position_y"
                  min="0"
                  value={formData.position_y}
                  onChange={handleFieldChange}
                  required
                />
              </label>

              <label className="table-management__editor-note">
                <span>Ghi chú nội bộ</span>
                <textarea
                  name="restaurant_note"
                  rows="3"
                  value={formData.restaurant_note}
                  onChange={handleFieldChange}
                  placeholder="Ví dụ: gần cửa sổ, phù hợp nhóm gia đình..."
                />
              </label>

              <div className="table-management__editor-actions">
                {currentEditingTable && (
                  <button
                    type="button"
                    className="btn btn--danger"
                    onClick={() => handleDeleteTable(currentEditingTable)}
                    disabled={submitting}
                  >
                    <IoTrashOutline />
                    Xóa bàn
                  </button>
                )}
                <button type="submit" className="btn btn--primary" disabled={submitting}>
                  {submitLabel}
                </button>
                <button type="button" className="btn btn--ghost" onClick={handleCloseModal} disabled={submitting}>
                  Hủy
                </button>
              </div>
            </form>
          </dialog>
        </div>
      )}
    </div>
  );
};

export default TableManagement;
