import React from 'react';
import { FiDatabase, FiFileText, FiLink, FiActivity } from 'react-icons/fi';
import './SystemDocs.css';

const SystemDocs = () => {
  const docs = [
    {
      id: 'api-docs',
      title: 'Tài liệu API (Swagger)',
      description: 'Giao diện tương tác và kiểm thử các API endpoints của hệ thống.',
      icon: <FiLink />,
      url: 'http://localhost:5001/api-docs/',
      isExternal: true
    },
    {
      id: 'db-diagram',
      title: 'Database Diagram',
      description: 'Sơ đồ thiết kế cơ sở dữ liệu (ERD) và các ràng buộc toàn hệ thống.',
      icon: <FiDatabase />,
      url: 'https://dbdiagram.io/d/Quan-ly-nha-hang-69255c95228c5bbc1a6029c3',
      isExternal: true
    },
    {
      id: 'usecase-diagram',
      title: 'Usecase Diagrams',
      description: 'Sơ đồ Use Case phân tích luồng nghiệp vụ của các tác nhân (Admin, Employee, Customer).',
      icon: <FiFileText />,
      url: 'https://drive.google.com/file/d/1ct_ASMwOhhVmqtTyi88bEcq8GM3JYydl/view?usp=sharing', // TODO: Thay bằng link ảnh thật
      isExternal: true
    },

  ];

  const handleOpenDoc = (doc) => {
    if (doc.isExternal && doc.url !== '#') {
      window.open(doc.url, '_blank');
    } else {
      alert(`[Demo] Hệ thống sẽ mở file ${doc.title} tại đây (bạn cần cập nhật link thật vào code).`);
    }
  };

  return (
    <div className="system-docs-container">
      <div className="system-docs-header">
        <h1>Tài liệu kỹ thuật hệ thống</h1>
        <p>Quản lý và tra cứu các tài liệu thiết kế, API và cấu trúc hệ thống dành riêng cho System Admin.</p>
      </div>

      <div className="system-docs-grid">
        {docs.map((doc) => (
          <div className="system-doc-card" key={doc.id}>
            <div className="system-doc-icon">{doc.icon}</div>
            <div className="system-doc-content">
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
            </div>
            <button
              className="system-doc-btn"
              onClick={() => handleOpenDoc(doc)}
            >
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>

      {/* <div className="system-docs-footer">
        <div className="info-box">
          <h4>Hướng dẫn Phân quyền:</h4>
          <p>
            Để quản lý quyền người dùng (Phân quyền tài khoản), vui lòng sử dụng tab
            <strong> Quản lý người dùng</strong> ở thanh menu bên trái.
            Màn hình này cho phép System Admin gán quyền (Admin, Nhân viên, Khách hàng) một cách nhanh chóng.
          </p>
        </div>
      </div> */}
    </div>
  );
};

export default SystemDocs;
