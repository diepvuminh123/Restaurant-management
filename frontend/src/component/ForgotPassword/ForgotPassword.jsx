import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { LuUtensilsCrossed } from "react-icons/lu";
import ApiService from "../../services/apiService";
import VerifyOTP from "../VerifyOTP/VerifyOTP";
import Loading from "../Loading/Loading";
import "./ForgotPassword.css";

export default function ForgotPassword({ onBackToLogin }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await ApiService.sendOtp(email, "reset");
      setStep("verify");
    } catch (err) {
      setError(err.message || "Không thể gửi mã xác thực");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySuccess = (response) => {
    if (response.allow_reset) {
      setStep("reset");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.resetPassword(newPassword);
      if (response.success) {
        alert("Đặt lại mật khẩu thành công!");
        onBackToLogin();
      }
    } catch (err) {
      setError(err.message || "Không thể đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (step === "verify") {
    return (
      <VerifyOTP
        email={email}
        onVerifySuccess={handleVerifySuccess}
        otpType="reset"
      />
    );
  }

  if (step === "reset") {
    return (
      <div className="forgotPasswordWrapper">
        <div className="formLogo">
          <LuUtensilsCrossed />
        </div>
        <h2 className="formTitle">Đặt lại mật khẩu</h2>
        <p className="formSubtitle">Nhập mật khẩu mới của bạn</p>

        <form className="formContainer" onSubmit={handleResetPassword}>
          <label className="label">
            Mật khẩu mới <span className="required">*</span>
          </label>
          <div className="passwordBox">
            <input
              type={showPassword ? "text" : "password"}
              className="input"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
              }}
              placeholder="Nhập mật khẩu mới"
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
            Xác nhận mật khẩu <span className="required">*</span>
          </label>
          <div className="passwordBox">
            <input
              type={showConfirmPassword ? "text" : "password"}
              className="input"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError("");
              }}
              placeholder="Nhập lại mật khẩu mới"
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
            {loading ? <Loading /> : "Đặt lại mật khẩu"}
          </button>
        </form>

        <div className="formFooter">
          <span className="backLink" onClick={onBackToLogin}>
            ← Quay lại đăng nhập
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="forgotPasswordWrapper">
      <div className="formLogo">
        <LuUtensilsCrossed />
      </div>
      <h2 className="formTitle">Quên mật khẩu</h2>
      <p className="formSubtitle">
        Nhập email của bạn để nhận mã xác thực
      </p>

      <form className="formContainer" onSubmit={handleSendOtp}>
        <label className="label">
          Email <span className="required">*</span>
        </label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError("");
          }}
          placeholder="email@example.com"
          required
        />

        {error && <div className="errorMessage">{error}</div>}

        <button type="submit" className="primaryButton" disabled={loading}>
          {loading ? <Loading /> : "Gửi mã xác thực"}
        </button>
      </form>

      <div className="formFooter">
        <span className="backLink" onClick={onBackToLogin}>
          ← Quay lại đăng nhập
        </span>
      </div>
    </div>
  );
}
