import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { LuUtensilsCrossed } from "react-icons/lu";
import ApiService from "../../services/apiService";
import Loading from "../Loading/Loading";
import "./LoginForm.css";

export default function LoginForm({
  onSignupClick,
  onForgotPasswordClick,
  onLoginSuccess,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await ApiService.login(formData.email, formData.password);
      
      if (response.success) {
        onLoginSuccess?.(response.data.user);
      }
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="loginFormWrapper">
      {/* Logo */}
      <div className="formLogo">
        <LuUtensilsCrossed />
      </div>

      {/* Title */}
      <h2 className="formTitle">Chào mừng bạn trở lại</h2>
      <p className="formSubtitle">Đăng nhập để tiếp tục</p>

      <form className="formContainer" onSubmit={handleSubmit}>
        {/* Email */}
        <label className="label">
          Email <span className="required">*</span>
        </label>
        <input
          type="email"
          name="email"
          className="input"
          placeholder="email@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Password */}
        <label className="label">
          Mật khẩu <span className="required">*</span>
        </label>
        <div className="passwordBox">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            className="input"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="togglePass"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* Remember + forgot */}
        <div className="optionsRow">
          <label className="checkRow">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            Ghi nhớ đăng nhập
          </label>

          <span className="forgot" onClick={onForgotPasswordClick}>
            Quên mật khẩu?
          </span>
        </div>

        {/* Error */}
        {error && <div className="errorMessage">{error}</div>}

        {/* Login button */}
        <button type="submit" className="primaryButton" disabled={loading}>
          {loading ? <Loading /> : "Đăng nhập"}
        </button>
      </form>

      {/* Footer */}
      <div className="formFooter">
        Chưa có tài khoản?{" "}
        <span className="signupLink" onClick={onSignupClick}>
          Đăng ký tài khoản
        </span>
      </div>

      <div className="orRole">ĐĂNG NHẬP VỚI VAI TRÒ KHÁC</div>

      <div className="roleButtons">
        <button className="roleButton">Nhân viên</button>
        <button className="roleButton">Quản trị viên</button>
      </div>
    </div>
  );
}
