import { useEffect, useRef } from 'react';

/**
 * Hook lắng nghe sự kiện thời gian thực từ Server (SSE)
 * @param {Object} callbacks Các hàm callback xử lý sự kiện { onNewOrder, onStatusUpdate }
 */
const useOrderSSE = (callbacks = {}) => {
  const eventSourceRef = useRef(null);

  // Dùng ref để lưu callbacks → tránh effect bị re-run khi parent re-render
  const onNewOrderRef = useRef(callbacks.onNewOrder);
  const onStatusUpdateRef = useRef(callbacks.onStatusUpdate);

  // Cập nhật ref mỗi khi callbacks thay đổi (không gây re-mount SSE)
  useEffect(() => {
    onNewOrderRef.current = callbacks.onNewOrder;
  }, [callbacks.onNewOrder]);

  useEffect(() => {
    onStatusUpdateRef.current = callbacks.onStatusUpdate;
  }, [callbacks.onStatusUpdate]);

  // Chỉ mount SSE 1 lần duy nhất khi component được gắn vào DOM
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const streamUrl = `${apiUrl}/api/orders/stream`;

    console.log('[SSE] Connecting to:', streamUrl);

    const es = new EventSource(streamUrl, { withCredentials: true });
    eventSourceRef.current = es;

    es.onopen = () => {
      console.log('[SSE] Connection opened');
    };

    // Lắng nghe đơn hàng mới (Dành cho Staff)
    es.addEventListener('NEW_ORDER', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] New Order received:', data);
        if (onNewOrderRef.current) onNewOrderRef.current(data);
      } catch (err) {
        console.error('[SSE] Error parsing NEW_ORDER data:', err);
      }
    });

    // Lắng nghe cập nhật trạng thái (Dành cho Customer & Staff)
    es.addEventListener('ORDER_STATUS_UPDATED', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Order Status Update:', data);
        if (onStatusUpdateRef.current) onStatusUpdateRef.current(data);
      } catch (err) {
        console.error('[SSE] Error parsing ORDER_STATUS_UPDATED data:', err);
      }
    });

    es.onerror = (err) => {
      console.error('[SSE] Connection error:', err);
      // Trình duyệt sẽ tự động thử kết nối lại theo mặc định của EventSource
    };

    return () => {
      console.log('[SSE] Closing connection');
      es.close();
      eventSourceRef.current = null;
    };
  }, []); // ← [] = chỉ chạy 1 lần, không phụ thuộc vào callbacks

  return eventSourceRef.current;
};

export default useOrderSSE;
