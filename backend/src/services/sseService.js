/**
 * SSE Service - Quản lý các kết nối Server-Sent Events
 */
class SSEService {
  constructor() {
    this.clients = [];
  }

  /**
   * Thêm một client mới vào danh sách kết nối
   * @param {Object} res Response object của express
   * @param {Object} metadata Thông tin thêm (userId, sessionId, role)
   */
  addClient(res, metadata = {}) {
    const clientId = Date.now();
    const newClient = {
      id: clientId,
      res,
      ...metadata
    };
    this.clients.push(newClient);
    
    console.log(`[SSE] Client connected: ${clientId}, Role: ${metadata.role || 'guest'}`);
    
    return clientId;
  }

  /**
   * Xóa client khi ngắt kết nối
   * @param {Number} clientId 
   */
  removeClient(clientId) {
    this.clients = this.clients.filter(client => client.id !== clientId);
    console.log(`[SSE] Client disconnected: ${clientId}`);
  }

  /**
   * Gửi sự kiện tới một nhóm client cụ thể
   * @param {String} event Tên sự kiện
   * @param {Object} data Dữ liệu gửi đi
   * @param {Function} filter Hàm lọc client (không bắt buộc)
   */
  sendEvent(event, data, filter = null) {
    let targets = this.clients;
    if (filter && typeof filter === 'function') {
      targets = targets.filter(filter);
    }

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    targets.forEach(client => {
      client.res.write(payload);
    });
  }

  /**
   * Gửi sự kiện tới tất cả nhân viên (admin, employee)
   */
  notifyStaff(event, data) {
    this.sendEvent(event, data, (client) => 
      client.role === 'admin' || client.role === 'employee' || client.role === 'system_admin'
    );
  }

  /**
   * Gửi sự kiện tới một khách hàng cụ thể
   */
  notifyCustomer(userId, sessionId, event, data) {
    this.sendEvent(event, data, (client) => {
      if (userId && client.userId === userId) return true;
      if (sessionId && client.sessionId === sessionId) return true;
      return false;
    });
  }
}

module.exports = new SSEService();
