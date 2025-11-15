import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { LuUtensilsCrossed } from "react-icons/lu";
import ApiService from "../../services/apiService";
import Loading from "../Loading/Loading";
import "./SignUpForm.css";

export default function SignUpForm({ onSignupSuccess, onBackToLogin }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.register({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        onSignupSuccess(formData.email);
      }
    } catch (err) {
      setError(err.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signupFormWrapper">
      <div className="formLogo">
        <LuUtensilsCrossed />
      </div>
      <h2 className="formTitle">Đăng ký để đặt bàn ngay !</h2>
      <p className="formSubtitle">Đăng ký</p>

      <form className="formContainer" onSubmit={handleSubmit}>
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
           style={{ width: "95%" }}
        />

        <label className="label">
          Tên tài khoản <span className="required">*</span>
        </label>
        <input
          type="text"
          name="username"
          className="input"
          placeholder="Nhập tên tài khoản"
          value={formData.username}
          onChange={handleChange}
          required
          style={{ width: "95%" }}
        />

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

        <label className="label">
          Nhập lại mật khẩu <span className="required">*</span>
        </label>
        <div className="passwordBox">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            className="input"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="togglePass"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {error && <div className="errorMessage">{error}</div>}

        <button type="submit" className="primaryButton" disabled={loading}>
          {loading ? <Loading /> : "Đăng ký"}
        </button>
      </form>

      <div className="formFooter">
        Đã có tài khoản?{" "}
        <span className="loginLink" onClick={onBackToLogin}>
          Đăng nhập ngay
        </span>
      </div>
    </div>
  );
}
