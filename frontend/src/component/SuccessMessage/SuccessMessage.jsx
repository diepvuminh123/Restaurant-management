import React from "react";
import { LuUtensilsCrossed } from "react-icons/lu";
import "./SuccessMessage.css";

export default function SuccessMessage({ message, onLoginClick }) {
  return (
    <div className="successWrapper">
      <div className="successIconBox">
        <div className="checkmarkCircle">
          <svg viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="25" fill="none" />
            <path fill="none" d="M14 27l8 8 16-16" />
          </svg>
        </div>
      </div>
      <h2 className="successTitle">Bạn đã xác thực thành công !</h2>
      <p className="successMessage">{message || "Tài khoản đã được kích hoạt"}</p>
      <button onClick={onLoginClick} className="primaryButton">
        Đăng nhập ngay
      </button>
    </div>
  );
}
