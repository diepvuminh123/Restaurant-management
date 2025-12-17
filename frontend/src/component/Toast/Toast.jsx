import React, { useEffect } from "react";
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoWarning, 
  IoInformationCircle,
  IoClose 
} from "react-icons/io5";
import "./Toast.css";

const Toast = ({ type = "info", message, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <IoCheckmarkCircle className="toast-icon toast-icon--success" />;
      case "error":
        return <IoCloseCircle className="toast-icon toast-icon--error" />;
      case "warning":
        return <IoWarning className="toast-icon toast-icon--warning" />;
      case "info":
      default:
        return <IoInformationCircle className="toast-icon toast-icon--info" />;
    }
  };

  return (
    <div className={`toast toast--${type}`}>
      {getIcon()}
      <div className="toast-content">
        <p className="toast-message">{message}</p>
      </div>
      <button className="toast-close" onClick={onClose}>
        <IoClose />
      </button>
    </div>
  );
};

export default Toast;
