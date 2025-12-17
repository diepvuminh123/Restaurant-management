import React from "react";
import { IoWarning, IoCheckmarkCircle, IoClose } from "react-icons/io5";
import "./ConfirmDialog.css";

const ConfirmDialog = ({
  isOpen,
  title = "Xác nhận",
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onConfirm,
  onCancel,
  type = "warning", // warning, danger, info, success
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <IoClose className="confirm-icon confirm-icon--danger" />;
      case "success":
        return <IoCheckmarkCircle className="confirm-icon confirm-icon--success" />;
      case "warning":
      default:
        return <IoWarning className="confirm-icon confirm-icon--warning" />;
    }
  };

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-header">
          {getIcon()}
          <h3 className="confirm-title">{title}</h3>
        </div>
        
        <div className="confirm-body">
          <p className="confirm-message">{message}</p>
        </div>
        
        <div className="confirm-actions">
          <button 
            className="confirm-btn confirm-btn--cancel" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`confirm-btn confirm-btn--confirm confirm-btn--${type}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
