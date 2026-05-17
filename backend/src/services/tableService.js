const RestaurantTable = require('../models/RestaurantTable');
const Reservation = require('../models/Reservation');

const ACTIVE_TABLE_RESERVATION_STATES = ['CONFIRM', 'ON_SERVING'];

const buildError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

class TableService {
  static normalizeTablePayload(payload = {}) {
    return {
      capacity: Number(payload.capacity),
      table_status: String(payload.table_status || 'AVAILABLE').toUpperCase(),
      position_x: Number(payload.position_x),
      position_y: Number(payload.position_y),
      restaurant_note: payload.restaurant_note ? String(payload.restaurant_note).trim() : null,
    };
  }

  static async ensurePositionAvailable(positionX, positionY, excludeTableId = null) {
    const occupiedTable = await RestaurantTable.getByPosition(positionX, positionY, {
      excludeTableId,
    });

    if (occupiedTable) {
      throw buildError('Vị trí này đã có bàn khác sử dụng', 409);
    }
  }

  static async getTableMapForAdmin({ status = null } = {}) {
    return await RestaurantTable.getAll({ status });
  }

  static async createTableForAdmin(payload) {
    const normalizedPayload = this.normalizeTablePayload(payload);
    await this.ensurePositionAvailable(normalizedPayload.position_x, normalizedPayload.position_y);
    return await RestaurantTable.create(normalizedPayload);
  }

  static async updateTableForAdmin(tableId, payload) {
    if (!tableId) {
      throw buildError('table_id không hợp lệ', 400);
    }

    const existingTable = await RestaurantTable.getById(tableId);
    if (!existingTable) {
      throw buildError('Không tìm thấy bàn trong hệ thống', 404);
    }

    const normalizedPayload = this.normalizeTablePayload(payload);
    await this.ensurePositionAvailable(normalizedPayload.position_x, normalizedPayload.position_y, tableId);
    const updatedTable = await RestaurantTable.update(tableId, normalizedPayload);
    if (!updatedTable) {
      throw buildError('Không thể cập nhật bàn', 409);
    }

    return updatedTable;
  }

  static async deleteTableForAdmin(tableId) {
    if (!tableId) {
      throw buildError('table_id không hợp lệ', 400);
    }

    const hasActiveReservation = await Reservation.hasActiveReservationForTable(
      tableId,
      ACTIVE_TABLE_RESERVATION_STATES
    );
    if (hasActiveReservation) {
      throw buildError('Không thể xóa bàn vì vẫn còn reservation đang hiệu lực', 409);
    }

    const deletedTable = await RestaurantTable.delete(tableId);
    if (!deletedTable) {
      throw buildError('Không tìm thấy bàn trong hệ thống', 404);
    }

    return deletedTable;
  }
}

module.exports = TableService;