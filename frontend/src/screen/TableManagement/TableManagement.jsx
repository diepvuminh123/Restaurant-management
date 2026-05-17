import React, { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  IoAdd,
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

const getAdminTableVisualState = (isSelected, tableStatus) => {
  if (isSelected) {
    return 'selected';
  }

  if (tableStatus === 'AVAILABLE') {
    return 'available';
  }

  return 'booked';
};

const mapTableToForm = (table) => ({
  capacity: String(table.capacity ?? ''),
  table_status: String(table.table_status || 'AVAILABLE'),
  position_x: String(table.position_x ?? 0),
  position_y: String(table.position_y ?? 0),
  restaurant_note: table.restaurant_note || '',
});

const AdminTableBox = ({ table, editingTableId, onEditTable }) => {
  const statusMeta = getStatusMeta(table.table_status);
  const isSelected = editingTableId === table.table_id;
  const visualState = getAdminTableVisualState(isSelected, table.table_status);

  return (
    <button
      type="button"
      className={`table-management__table-box ${visualState}`}
      onClick={() => onEditTable(table)}
      aria-pressed={isSelected}
    >
      <span className="table-management__table-box-id">{formatTableLabel(table.table_id)}</span>
      <span className="table-management__table-box-seats">{table.capacity} chỗ</span>
      <span className="table-management__table-box-status">{statusMeta.label}</span>
    </button>
  );
};

AdminTableBox.propTypes = {
  table: PropTypes.shape({
    table_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    capacity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    table_status: PropTypes.string,
  }).isRequired,
  editingTableId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onEditTable: PropTypes.func.isRequired,
};

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

  const duplicatePositionInfo = useMemo(() => {
    const positionMap = new Map();

    filteredTables.forEach((table) => {
      const key = `${table.position_x}:${table.position_y}`;
      const existing = positionMap.get(key) || [];
      existing.push(table);
      positionMap.set(key, existing);
    });

    const duplicateGroups = Array.from(positionMap.values()).filter((group) => group.length > 1);
    const duplicateTableIds = new Set(duplicateGroups.flat().map((table) => table.table_id));
    const groupedPositions = Array.from(positionMap.entries()).map(([key, group]) => {
      const [positionX, positionY] = key.split(':').map((value) => Number(value || 0));

      return {
        key,
        positionX,
        positionY,
        tables: group,
      };
    });

    const uniqueColumns = [...new Set(groupedPositions.map((group) => group.positionX))].sort((left, right) => left - right);
    const uniqueRows = [...new Set(groupedPositions.map((group) => group.positionY))].sort((left, right) => left - right);
    const columnIndexMap = new Map(uniqueColumns.map((value, index) => [value, index + 1]));
    const rowIndexMap = new Map(uniqueRows.map((value, index) => [value, index + 1]));

    const normalizedGroups = groupedPositions.map((group) => ({
      ...group,
      gridColumn: columnIndexMap.get(group.positionX) || 1,
      gridRow: rowIndexMap.get(group.positionY) || 1,
      displayColumn: columnIndexMap.get(group.positionX) || 1,
      displayRow: rowIndexMap.get(group.positionY) || 1,
    }));

    return {
      duplicateGroups,
      duplicateTableIds,
      groupedPositions: normalizedGroups,
      columnCount: uniqueColumns.length,
      rowCount: uniqueRows.length,
    };
  }, [filteredTables]);

  const gridSize = useMemo(() => {
    return {
      columns: Math.max(duplicatePositionInfo.columnCount || 0, 4),
      rows: Math.max(duplicatePositionInfo.rowCount || 0, 3),
    };
  }, [duplicatePositionInfo.columnCount, duplicatePositionInfo.rowCount]);

  const mapCells = useMemo(() => {
    const positionMap = new Map(
      duplicatePositionInfo.groupedPositions.map((group) => [`${group.displayRow}:${group.displayColumn}`, group])
    );

    const cells = [];

    for (let row = 1; row <= gridSize.rows; row += 1) {
      for (let column = 1; column <= gridSize.columns; column += 1) {
        const group = positionMap.get(`${row}:${column}`) || null;
        cells.push({
          key: `${row}:${column}`,
          row,
          column,
          tables: group ? [...group.tables].sort((left, right) => Number(left.table_id) - Number(right.table_id)) : [],
        });
      }
    }

    return cells;
  }, [duplicatePositionInfo.groupedPositions, gridSize.columns, gridSize.rows]);

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

  const mapContent = (() => {
    if (loading) {
      return <p className="table-management__placeholder">Đang tải sơ đồ bàn...</p>;
    }

    if (filteredTables.length === 0) {
      return <p className="table-management__placeholder">Không có bàn phù hợp với bộ lọc.</p>;
    }

    return (
      <div className="table-management__map-layout">
        <div className="table-management__map-corner" aria-hidden="true" />

        <div
          className="table-management__column-axis"
          style={{ gridTemplateColumns: `repeat(${gridSize.columns}, minmax(90px, 1fr))` }}
        >
          {Array.from({ length: gridSize.columns }, (_, index) => (
            <span key={`column-${index + 1}`} className="table-management__axis-label table-management__axis-label--column">
              Cột {index + 1}
            </span>
          ))}
        </div>

        <div
          className="table-management__row-axis"
          style={{ gridTemplateRows: `repeat(${gridSize.rows}, minmax(92px, auto))` }}
        >
          {Array.from({ length: gridSize.rows }, (_, index) => (
            <span key={`row-${index + 1}`} className="table-management__axis-label table-management__axis-label--row">
              Hàng {index + 1}
            </span>
          ))}
        </div>

        <div
          className="table-management__map-grid"
          style={{
            gridTemplateColumns: `repeat(${gridSize.columns}, minmax(90px, 1fr))`,
            gridTemplateRows: `repeat(${gridSize.rows}, minmax(92px, auto))`,
          }}
        >
          {mapCells.map((cell) => {
            const hasMultipleTables = cell.tables.length > 1;

            return (
              <div
                key={cell.key}
                className={`table-management__map-cell ${cell.tables.length === 0 ? 'table-management__map-cell--empty' : ''} ${hasMultipleTables ? 'table-management__map-cell--duplicate' : ''}`}
              >
                {cell.tables.length > 0 ? (
                  <>
                    {cell.tables.map((table) => (
                      <AdminTableBox
                        key={table.table_id}
                        table={table}
                        editingTableId={editingTableId}
                        onEditTable={handleEditTable}
                      />
                    ))}
                    {hasMultipleTables && (
                      <span className="table-management__duplicate-chip">{cell.tables.length} bàn</span>
                    )}
                  </>
                ) : (
                  <span className="table-management__empty-slot">Trống</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  })();

  let selectionBlock = (
    <div className="table-management__selection-hint">
      Chọn bàn phù hợp với nhu cầu quản lý của bạn.
    </div>
  );

  if (currentEditingTable) {
    selectionBlock = (
      <output className="table-management__selection-notice" aria-live="polite">
        Đang chỉnh {formatTableLabel(currentEditingTable.table_id)} • {currentEditingTable.capacity} chỗ.
      </output>
    );
  }

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
        <div className="table-management__map-header">
          <div>
            <h2>Sơ đồ bàn</h2>
            <p>Chọn bàn phù hợp với yêu cầu của bạn</p>
          </div>
        </div>

        {mapContent}

        {selectionBlock}

        <div className="table-management__legend" aria-label="Chú thích trạng thái bàn">
          <span><span className="table-management__legend-dot table-management__legend-dot--available" /> Trống</span>
          <span><span className="table-management__legend-dot table-management__legend-dot--selected" /> Đã chọn</span>
          <span><span className="table-management__legend-dot table-management__legend-dot--booked" /> Đã đặt</span>
        </div>
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
