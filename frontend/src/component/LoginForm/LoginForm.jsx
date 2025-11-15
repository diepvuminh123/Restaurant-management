import React, { useState } from "react";
import { ICONS } from "../../constants/asset/icon";
import "./LoginForm.css";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="loginFormWrapper">
      <img src={ICONS.LOGO} alt="Logo" className="formLogo" />
      <h1 className="formTitle">Đăng nhập</h1>
      <p className="formSubtitle">Chào mừng bạn trở lại</p>
      
      <form onSubmit={(e) => e.preventDefault()}>
        {/* Email */}
        <div className="group">
          <label htmlFor="email" className="label">
            Email <span className="required">*</span>
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="Nhập email của bạn"
            className="input"
          />
        </div>

        {/* Password */}
        <div className="group">
          <label htmlFor="password" className="label">
            Mật khẩu <span className="required">*</span>
          </label>

          <div style={{ position: "relative" }}>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Nhập mật khẩu"
              className="input"
              style={{ paddingRight: "40px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setShowPassword(!showPassword);
                }
              }}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                userSelect: "none",
                padding: "4px",
              }}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {/* Options */}
        <div className="optionsRow">
          <label htmlFor="remember" className="checkboxLabel">
            <input id="remember" type="checkbox" />
            Ghi nhớ đăng nhập
          </label>
          <a href="#forgot" className="forgot">
            Quên mật khẩu?
          </a>
        </div>

        {/* Button */}
        <button className="button">Đăng nhập</button>
      </form>

      <div className="formFooter">
        Bạn chưa có tài khoản? <span className="signupLink">Đăng ký ngay</span>
      </div>
    </div>
  );
}
