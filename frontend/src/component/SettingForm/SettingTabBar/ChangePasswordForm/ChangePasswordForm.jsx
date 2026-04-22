import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoKeyOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5';
import ApiService from '../../../../services/apiService';
import { useToastContext } from '../../../../context/ToastContext';
import './ChangePasswordForm.css';

const DEFAULT_DIRECT_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

const DEFAULT_RESET_FORM = {
  otp: '',
  newPassword: '',
  confirmPassword: '',
};

const PASSWORD_RULES = [
  'Tối thiểu 6 ký tự.',
  'Nên dùng cả chữ và số để an toàn hơn.',
];

const getPasswordMatchError = (newPassword, confirmPassword) => {
  if (!confirmPassword) {
    return '';
  }

  return newPassword === confirmPassword ? '' : 'Xác nhận mật khẩu mới không khớp';
};

const PasswordField = ({ id, label, name, value, onChange, autoComplete, placeholder, visible, onToggle, hint, error }) => (
  <div className="change-password-field">
    <label htmlFor={id}>{label}</label>
    <div className={`change-password-input-shell ${error ? 'has-error' : ''}`}>
      <input
        id={id}
        name={name}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required
      />
      <button type="button" className="change-password-visibility-btn" onClick={onToggle} aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
        {visible ? <IoEyeOffOutline /> : <IoEyeOutline />}
      </button>
    </div>
    {hint ? <p className="change-password-field-hint">{hint}</p> : null}
    {error ? <p className="change-password-field-error">{error}</p> : null}
  </div>
);

PasswordField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  autoComplete: PropTypes.string,
  placeholder: PropTypes.string,
  visible: PropTypes.bool,
  onToggle: PropTypes.func.isRequired,
  hint: PropTypes.string,
  error: PropTypes.string,
};

PasswordField.defaultProps = {
  autoComplete: 'off',
  placeholder: '',
  visible: false,
  hint: '',
  error: '',
};

const ChangePasswordForm = ({ user }) => {
  const toast = useToastContext();
  const [mode, setMode] = useState('direct');
  const [directFormData, setDirectFormData] = useState(DEFAULT_DIRECT_FORM);
  const [resetFormData, setResetFormData] = useState(DEFAULT_RESET_FORM);
  const [emailStep, setEmailStep] = useState('intro');
  const [isDirectSubmitting, setIsDirectSubmitting] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [emailFlowMessage, setEmailFlowMessage] = useState('');
  const [directVisibility, setDirectVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [resetVisibility, setResetVisibility] = useState({
    newPassword: false,
    confirmPassword: false,
  });

  const email = user?.email || '';

  const directConfirmError = getPasswordMatchError(directFormData.newPassword, directFormData.confirmPassword);
  const resetConfirmError = getPasswordMatchError(resetFormData.newPassword, resetFormData.confirmPassword);

  const resetDirectFlow = () => {
    setDirectFormData(DEFAULT_DIRECT_FORM);
    setDirectVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false,
    });
  };

  const resetEmailFlow = () => {
    setResetFormData(DEFAULT_RESET_FORM);
    setResetVisibility({
      newPassword: false,
      confirmPassword: false,
    });
    setEmailStep('intro');
  };

  const isDirectFormValid = useMemo(() => {
    if (!directFormData.currentPassword || !directFormData.newPassword || !directFormData.confirmPassword) {
      return false;
    }

    if (directFormData.newPassword.length < 6) {
      return false;
    }

    return directFormData.newPassword === directFormData.confirmPassword;
  }, [directFormData]);

  const isResetFormValid = useMemo(() => {
    if (!resetFormData.newPassword || !resetFormData.confirmPassword) {
      return false;
    }

    if (resetFormData.newPassword.length < 6) {
      return false;
    }

    return resetFormData.newPassword === resetFormData.confirmPassword;
  }, [resetFormData]);

  const onDirectChange = (event) => {
    const { name, value } = event.target;
    setDirectFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onResetChange = (event) => {
    const { name, value } = event.target;
    setResetFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleDirectVisibility = (fieldName) => {
    setDirectVisibility((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const toggleResetVisibility = (fieldName) => {
    setResetVisibility((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  const switchMode = (nextMode) => {
    if (nextMode === 'direct') {
      resetDirectFlow();
    }

    if (nextMode === 'email') {
      resetEmailFlow();
    }

    setMode(nextMode);
    setEmailFlowMessage('');
  };

  const onDirectSubmit = async (event) => {
    event.preventDefault();
    if (isDirectSubmitting) {
      return;
    }

    try {
      setIsDirectSubmitting(true);
      await ApiService.changePassword(directFormData.currentPassword, directFormData.newPassword);
      toast.success('Đổi mật khẩu thành công');
      resetDirectFlow();
      resetEmailFlow();
    } catch (error) {
      toast.error(error.message || 'Không thể đổi mật khẩu');
    } finally {
      setIsDirectSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    if (!email || isSendingOtp) {
      return;
    }

    try {
      setIsSendingOtp(true);
      await ApiService.sendOtp(email, 'reset');
      setEmailStep('verify');
      setResetFormData(DEFAULT_RESET_FORM);
      setEmailFlowMessage(`Mã xác thực đã được gửi tới ${email}.`);
      toast.success('Đã gửi mã xác thực qua email');
    } catch (error) {
      toast.error(error.message || 'Không thể gửi mã xác thực');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (isVerifyingOtp) {
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const response = await ApiService.verifyOtp(email, resetFormData.otp);

      if (response.allow_reset) {
        setEmailStep('reset');
        setEmailFlowMessage('Email đã được xác thực. Bạn có thể đặt mật khẩu mới ngay bây giờ.');
        toast.success('Xác thực email thành công');
      }
    } catch (error) {
      toast.error(error.message || 'Không thể xác thực mã');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (isResetSubmitting) {
      return;
    }

    try {
      setIsResetSubmitting(true);
      await ApiService.resetPassword(resetFormData.newPassword);
      toast.success('Đặt lại mật khẩu thành công');
      resetEmailFlow();
      resetDirectFlow();
      setEmailFlowMessage('');
      setMode('direct');
    } catch (error) {
      toast.error(error.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setIsResetSubmitting(false);
    }
  };

  const renderDirectForm = () => (
    <form onSubmit={onDirectSubmit} className="change-password-panel-form">
      <div className="change-password-grid">
        <PasswordField
          id="currentPassword"
          label="Mật khẩu hiện tại"
          name="currentPassword"
          value={directFormData.currentPassword}
          onChange={onDirectChange}
          autoComplete="current-password"
          placeholder="Nhập mật khẩu hiện tại"
          visible={directVisibility.currentPassword}
          onToggle={() => toggleDirectVisibility('currentPassword')}
        />

        <PasswordField
          id="newPassword"
          label="Mật khẩu mới"
          name="newPassword"
          value={directFormData.newPassword}
          onChange={onDirectChange}
          autoComplete="new-password"
          placeholder="Tạo mật khẩu mới"
          visible={directVisibility.newPassword}
          onToggle={() => toggleDirectVisibility('newPassword')}
          hint="Mật khẩu mới cần tối thiểu 6 ký tự."
        />

        <PasswordField
          id="confirmPassword"
          label="Xác nhận mật khẩu mới"
          name="confirmPassword"
          value={directFormData.confirmPassword}
          onChange={onDirectChange}
          autoComplete="new-password"
          placeholder="Nhập lại mật khẩu mới"
          visible={directVisibility.confirmPassword}
          onToggle={() => toggleDirectVisibility('confirmPassword')}
          error={directConfirmError}
        />
      </div>

      <button type="submit" className="change-password-primary-btn" disabled={!isDirectFormValid || isDirectSubmitting}>
        {isDirectSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
      </button>
    </form>
  );

  const renderEmailReset = () => {
    if (!email) {
      return (
        <div className="change-password-empty-state">
          <IoMailOutline />
          <p>Không tìm thấy email tài khoản hiện tại nên chưa thể gửi mã xác thực.</p>
        </div>
      );
    }

    if (emailStep === 'intro') {
      return (
        <div className="change-password-email-flow">
          <div className="change-password-email-card">
            <span className="change-password-email-label">Email nhận mã</span>
            <strong>{email}</strong>
            <p>Một mã OTP 6 số sẽ được gửi tới email này để bạn đặt lại mật khẩu mà không cần nhập mật khẩu hiện tại.</p>
          </div>

          <button type="button" className="change-password-primary-btn" onClick={handleSendOtp} disabled={isSendingOtp}>
            {isSendingOtp ? 'Đang gửi mã...' : 'Gửi mã xác thực qua email'}
          </button>
        </div>
      );
    }

    if (emailStep === 'verify') {
      return (
        <form onSubmit={handleVerifyOtp} className="change-password-panel-form">
          <div className="change-password-field">
            <label htmlFor="resetOtp">Mã xác thực</label>
            <div className="change-password-input-shell change-password-input-shell--otp">
              <input
                id="resetOtp"
                name="otp"
                type="text"
                value={resetFormData.otp}
                onChange={onResetChange}
                placeholder="Nhập 6 số OTP"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength="6"
                required
              />
            </div>
            <p className="change-password-field-hint">Kiểm tra hộp thư đến hoặc spam nếu chưa thấy email.</p>
          </div>

          <div className="change-password-secondary-actions">
            <button type="button" className="change-password-ghost-btn" onClick={handleSendOtp} disabled={isSendingOtp}>
              {isSendingOtp ? 'Đang gửi lại...' : 'Gửi lại mã'}
            </button>
            <button type="submit" className="change-password-primary-btn" disabled={resetFormData.otp.trim().length < 4 || isVerifyingOtp}>
              {isVerifyingOtp ? 'Đang xác thực...' : 'Xác thực email'}
            </button>
          </div>
        </form>
      );
    }

    return (
      <form onSubmit={handleResetPassword} className="change-password-panel-form">
        <div className="change-password-grid">
          <PasswordField
            id="resetNewPassword"
            label="Mật khẩu mới"
            name="newPassword"
            value={resetFormData.newPassword}
            onChange={onResetChange}
            autoComplete="new-password"
            placeholder="Tạo mật khẩu mới"
            visible={resetVisibility.newPassword}
            onToggle={() => toggleResetVisibility('newPassword')}
            hint="Sau khi lưu, bạn có thể dùng mật khẩu mới để đăng nhập ở các lần sau."
          />

          <PasswordField
            id="resetConfirmPassword"
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            value={resetFormData.confirmPassword}
            onChange={onResetChange}
            autoComplete="new-password"
            placeholder="Nhập lại mật khẩu mới"
            visible={resetVisibility.confirmPassword}
            onToggle={() => toggleResetVisibility('confirmPassword')}
            error={resetConfirmError}
          />
        </div>

        <button type="submit" className="change-password-primary-btn" disabled={!isResetFormValid || isResetSubmitting}>
          {isResetSubmitting ? 'Đang cập nhật...' : 'Lưu mật khẩu mới'}
        </button>
      </form>
    );
  };

  return (
    <div className="change-password-form-card">
      <div className="change-password-hero">
        <div>
          <span className="change-password-eyebrow">Bảo mật tài khoản</span>
          <div className="change-password-header">
            <span className="change-password-title">Đổi mật khẩu</span>
          </div>
        </div>
      </div>

      <div className="change-password-mode-switch">
        <button
          type="button"
          className={`change-password-mode-btn ${mode === 'direct' ? 'is-active' : ''}`}
          onClick={() => switchMode('direct')}
        >
          <IoKeyOutline />
          <span>Dùng mật khẩu hiện tại</span>
        </button>
        <button
          type="button"
          className={`change-password-mode-btn ${mode === 'email' ? 'is-active' : ''}`}
          onClick={() => switchMode('email')}
        >
          <IoMailOutline />
          <span>Đổi qua email</span>
        </button>
      </div>

      <div className="change-password-content-shell">
        <div className="change-password-content-header">
          <div className="change-password-content-icon">
            {mode === 'direct' ? <IoLockClosedOutline /> : <IoMailOutline />}
          </div>
          <div>
            <h3>{mode === 'direct' ? 'Xác nhận bằng mật khẩu hiện tại' : 'Xác nhận bằng email'}</h3>
          </div>
        </div>

        {emailFlowMessage ? <div className="change-password-status-banner">{emailFlowMessage}</div> : null}

        {mode === 'direct' ? renderDirectForm() : renderEmailReset()}
      </div>

      <div className="change-password-footer-note">
        <IoShieldCheckmarkOutline />
        <span>Sau khi đổi mật khẩu, hệ thống sẽ dùng thông tin mới cho các lần đăng nhập tiếp theo.</span>
      </div>
    </div>
  );
};

export default ChangePasswordForm;

ChangePasswordForm.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string,
  }),
};

ChangePasswordForm.defaultProps = {
  user: null,
};
