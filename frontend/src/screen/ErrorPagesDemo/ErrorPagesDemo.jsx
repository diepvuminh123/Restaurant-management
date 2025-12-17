import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPagesDemo.css';

export default function ErrorPagesDemo() {
  const navigate = useNavigate();

  return (
    <div className="error-demo-container">
      <div className="error-demo-content">
        <h1>🎨 Error Pages Demo</h1>
        <p className="demo-subtitle">Test các trang lỗi đã tạo</p>

        <div className="demo-cards">
          {/* Card 404 */}
          <div className="demo-card card-404">
            <div className="card-icon">🎈</div>
            <h2>Error 404</h2>
            <p className="card-description">
              Page Not Found - Trang không tồn tại
            </p>
            <div className="card-features">
              <div className="feature">✨ Balloon animation</div>
              <div className="feature">☁️ Floating clouds</div>
              <div className="feature">📱 Responsive</div>
            </div>
            <button 
              className="demo-btn btn-404"
              onClick={() => navigate('/404')}
            >
              Xem Demo 404
            </button>
          </div>

          {/* Card 403 */}
          <div className="demo-card card-403">
            <div className="card-icon">🔐</div>
            <h2>Error 403</h2>
            <p className="card-description">
              Unauthorized - Không có quyền truy cập
            </p>
            <div className="card-features">
              <div className="feature">🌟 Particles effect</div>
              <div className="feature">💎 Glassmorphism</div>
              <div className="feature">🎭 Lock animation</div>
            </div>
            <button 
              className="demo-btn btn-403"
              onClick={() => navigate('/403')}
            >
              Xem Demo 403
            </button>
          </div>

          {/* Card Test Random URL */}
          <div className="demo-card card-random">
            <div className="card-icon">🎲</div>
            <h2>Random URL</h2>
            <p className="card-description">
              Test 404 với URL ngẫu nhiên
            </p>
            <div className="card-features">
              <div className="feature">🔀 URL không tồn tại</div>
              <div className="feature">🚀 Auto redirect 404</div>
              <div className="feature">✅ Catch-all route</div>
            </div>
            <button 
              className="demo-btn btn-random"
              onClick={() => navigate('/random-url-' + Math.random().toString(36).substr(2, 9))}
            >
              Test Random URL
            </button>
          </div>
        </div>

        <div className="demo-info">
          <h3>📝 Thông tin:</h3>
          <ul>
            <li>✅ Error 404: Trang không tồn tại (balloon theme)</li>
            <li>✅ Error 403: Không có quyền truy cập (lock theme)</li>
            <li>✅ Tất cả đều có nút "Quay lại" và "Trang chủ"</li>
            <li>✅ Responsive mobile/tablet/desktop</li>
            <li>✅ Smooth animations và transitions</li>
          </ul>
        </div>

        <button 
          className="btn-back-home"
          onClick={() => navigate('/')}
        >
          ← Về Trang Chủ
        </button>
      </div>
    </div>
  );
}
