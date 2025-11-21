import React, { useState, useEffect } from "react";
import { LuUtensilsCrossed } from "react-icons/lu";
import ApiService from "../../services/apiService";
import Loading from "../Loading/Loading";
import "./VerifyOTP.css";

export default function VerifyOTP({ email, onVerifySuccess, otpType = "signup" }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(600);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length < 4) {
      setError("Vui lòng nhập mã xác thực");
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.verifyOtp(email, otp);
      if (response.success) {
        onVerifySuccess(response);
      }
    } catch (err) {
      setError(err.message || "Mã xác thực không đúng");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setResendLoading(true);

    try {
      await ApiService.sendOtp(email, otpType);
      setCountdown(600);
      setCanResend(false);
      setOtp("");
    } catch (err) {
      setError(err.message || "Không thể gửi lại mã");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="verifyOTPWrapper">
      <div className="formLogo">
        <LuUtensilsCrossed />
      </div>
      <h2 className="formTitle">Nhập mã</h2>
      <p className="formSubtitle">
        Mã xác thực đã được gửi qua mail. Vui lòng check ạ
      </p>

      <form className="formContainer" onSubmit={handleVerify}>
        <div className="otpInputContainer">
          <input
            type="text"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value);
              setError("");
            }}
            placeholder="Nhập mã xác thực"
            className="otpInput"
            maxLength="6"
             style={{ width: "95%", padding: "8px" }}
          />
        </div>

        <div className="resendContainer">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              className="resendButton"
              disabled={resendLoading}
            >
              {resendLoading ? <Loading /> : "Gửi lại mã"}
            </button>
          ) : (
            <span className="countdown">
              GỬI LẠI MÃ XÁC THỰC SAU : {formatTime(countdown)}
            </span>
          )}
        </div>

        {error && <div className="errorMessage">{error}</div>}

        <button type="submit" className="primaryButton" disabled={loading}>
          {loading ? <Loading /> : "Xác thực"}
        </button>
      </form>
    </div>
  );
}
