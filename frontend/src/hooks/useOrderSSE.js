import { useEffect, useRef } from 'react';

/**
 * Hook lắng nghe sự kiện thời gian thực từ Server (SSE)
 * @param {Object} callbacks Các hàm callback xử lý sự kiện { onNewOrder, onStatusUpdate }
 */
const useOrderSSE = (callbacks = {}) => {
  const eventSourceRef = useRef(null);
  const { onNewOrder, onStatusUpdate } = callbacks;

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001';
    const streamUrl = `${apiUrl}/api/orders/stream`;

    console.log('[SSE] Connecting to:', streamUrl);

    // Khởi tạo EventSource với credentials để gửi kèm session cookie
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
        if (onNewOrder) onNewOrder(data);
      } catch (err) {
        console.error('[SSE] Error parsing NEW_ORDER data:', err);
      }
    });

    // Lắng nghe cập nhật trạng thái (Dành cho Customer & Staff)
    es.addEventListener('ORDER_STATUS_UPDATED', (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[SSE] Order Status Update:', data);
        if (onStatusUpdate) onStatusUpdate(data);
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
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [onNewOrder, onStatusUpdate]);

  return eventSourceRef.current;
};

export default useOrderSSE;
