import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginForm from '../../component/LoginForm/LoginForm'
import SignUpForm from '../../component/SignUpForm/SignUpForm'
import VerifyOTP from '../../component/VerifyOTP/VerifyOTP'
import SuccessMessage from '../../component/SuccessMessage/SuccessMessage'
import ForgotPassword from '../../component/ForgotPassword/ForgotPassword'
import './LoginScreen.css'
import WelcomeBoard from '../../component/WelcomeBoard/WelcomeBoard'
import BackButton from '../../component/BackButton/BackButton'
import ApiService from '../../services/apiService'
export default function LoginScreen({ onLoginSuccess, initialView = 'login' }) {
  const [currentView, setCurrentView] = useState(initialView);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredPassword, setRegisteredPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setCurrentView(initialView);
  }, [initialView]);
  
  const handleLoginSuccess = (userData) => {
    if (onLoginSuccess) {
      onLoginSuccess(userData);
    }

    const redirectTo = location.state?.redirectTo;
    const redirectState = location.state?.redirectState;

    if (redirectTo) {
      navigate(redirectTo, { state: redirectState, replace: true });
      return;
    }

    navigate('/home');
  }
  const handleSignupClick = () => {
    setCurrentView('signup');
    navigate('/signup');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    navigate('/');
  };

  const handleForgotPasswordClick = () => {
    setCurrentView('forgot');
    navigate('/forgot-password');
  };

  const handleSignupSuccess = (email, password) => {
    setRegisteredEmail(email);
    setRegisteredPassword(password || '');
    setCurrentView('verify');
    navigate('/verify', { state: { email, password } });
  };

  const handleVerifySuccess = async (response) => {
    if (response.otp_type === 'signup') {
      const email = response.email || registeredEmail || location.state?.email;
      const password = registeredPassword || location.state?.password;
      if (email && password) {
        try {
          const loginResponse = await ApiService.login(email, password);
          if (loginResponse.success) {
            setRegisteredPassword('');
            handleLoginSuccess(loginResponse.data.user);
            return;
          }
        } catch {
          // Auto-login failed, fall through to success screen
        }
      }
      setCurrentView('success');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return (
          <LoginForm
            onSignupClick={handleSignupClick}
            onForgotPasswordClick={handleForgotPasswordClick}
            onLoginSuccess={handleLoginSuccess}
            onNotVerified={handleSignupSuccess}
          />
        );
      case 'signup':
        return (
          <SignUpForm
            onSignupSuccess={handleSignupSuccess}
            onBackToLogin={handleBackToLogin}
          />
        );
      case 'verify':
        return (
          <VerifyOTP
            email={registeredEmail || location.state?.email}
            onVerifySuccess={handleVerifySuccess}
            otpType="signup"
          />
        );
      case 'success':
        return (
          <SuccessMessage
            message="Tài khoản đã được kích hoạt thành công!"
            onLoginClick={handleBackToLogin}
          />
        );
      case 'forgot':
        return (
          <ForgotPassword
            onBackToLogin={handleBackToLogin}
          />
        );
      default:
        return (
          <LoginForm
            onSignupClick={handleSignupClick}
            onForgotPasswordClick={handleForgotPasswordClick}
            onLoginSuccess={onLoginSuccess}
          />
        );
    }
  };

  return (
    <div className="loginScreen">
      <div className="loginScreen__back">
        <BackButton />
      </div>
      
      <div className="loginContainer">
        {renderCurrentView()}
      </div>
      <WelcomeBoard />
    </div>
  );
}