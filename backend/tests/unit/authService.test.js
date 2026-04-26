const AuthService = require('../../src/services/authService');
const User = require('../../src/models/User');
const Mail = require('../../src/models/Mail');
const { sendVerificationEmail } = require('../../src/mailer');
const { generateOtp6 } = require('../../src/utils/otp');

// Mock dependencies
jest.mock('../../src/models/User');
jest.mock('../../src/models/Mail');
jest.mock('../../src/mailer');
jest.mock('../../src/utils/otp');

describe('AuthService Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockUserData = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'customer'
    };

    it('should throw an error if username already exists', async () => {
      User.isUsernameExists.mockResolvedValue(true);

      await expect(AuthService.register(mockUserData)).rejects.toThrow('Username đã tồn tại');
      expect(User.isUsernameExists).toHaveBeenCalledWith('testuser');
    });

    it('should throw an error if email already exists', async () => {
      User.isUsernameExists.mockResolvedValue(false);
      User.isEmailExists.mockResolvedValue(true);

      await expect(AuthService.register(mockUserData)).rejects.toThrow('Email đã được sử dụng');
      expect(User.isEmailExists).toHaveBeenCalledWith('test@example.com');
    });

    it('should successfully register a new user and send OTP (Happy Path)', async () => {
      User.isUsernameExists.mockResolvedValue(false);
      User.isEmailExists.mockResolvedValue(false);
      
      const mockCreatedUser = { user_id: 1, username: 'testuser', email: 'test@example.com' };
      User.create.mockResolvedValue(mockCreatedUser);
      
      generateOtp6.mockReturnValue('123456');
      Mail.createAuthMail.mockResolvedValue(true);
      sendVerificationEmail.mockResolvedValue(true);

      const result = await AuthService.register(mockUserData);

      expect(result).toEqual(mockCreatedUser);
      expect(User.create).toHaveBeenCalledWith(mockUserData);
      expect(generateOtp6).toHaveBeenCalled();
      expect(Mail.createAuthMail).toHaveBeenCalledWith({
        user_id: 1,
        code: '123456',
        otp_type: 'signup',
      });
      expect(sendVerificationEmail).toHaveBeenCalledWith({
        to: 'test@example.com',
        code: '123456',
        minutes: 10,
      });
    });
  });

  describe('login', () => {
    const email = 'test@example.com';
    const password = 'password123';

    it('should throw an error if email does not exist', async () => {
      User.findByEmail.mockResolvedValue(null);

      await expect(AuthService.login(email, password)).rejects.toThrow('Email hoặc mật khẩu không đúng');
    });

    it('should throw an error if user is not verified', async () => {
      User.findByEmail.mockResolvedValue({ user_id: 1 });
      User.checkIs_verified.mockResolvedValue({ is_verified: false });

      await expect(AuthService.login(email, password)).rejects.toThrow('Bạn vui lòng xác thực tài khoản trước khi đăng nhập');
    });

    it('should throw an error if account is currently locked', async () => {
      const futureDate = new Date(Date.now() + 60000 * 30); // 30 mins in future
      User.findByEmail.mockResolvedValue({ user_id: 1, locked_until: futureDate });
      User.checkIs_verified.mockResolvedValue({ is_verified: true });

      await expect(AuthService.login(email, password)).rejects.toThrow(/Tài khoản của bạn đã bị khóa.*30 phút/);
    });

    it('should reset lock and attempts if locked_until has expired', async () => {
      const pastDate = new Date(Date.now() - 60000 * 30); // 30 mins in past
      User.findByEmail.mockResolvedValue({ 
        user_id: 1, 
        locked_until: pastDate,
        password_hash: 'hash'
      });
      User.checkIs_verified.mockResolvedValue({ is_verified: true });
      User.verifyPassword.mockResolvedValue(true);
      User.resetFailLoginAttempts.mockResolvedValue(true);

      await AuthService.login(email, password);

      // It should call resetFailLoginAttempts twice: once for expiration check, once for successful login
      expect(User.resetFailLoginAttempts).toHaveBeenCalledWith(1);
    });

    it('should increment fail attempts and throw error if password is wrong', async () => {
      User.findByEmail.mockResolvedValue({ 
        user_id: 1, 
        fail_login_attempts: 2,
        password_hash: 'hash'
      });
      User.checkIs_verified.mockResolvedValue({ is_verified: true });
      User.verifyPassword.mockResolvedValue(false);

      await expect(AuthService.login(email, password)).rejects.toThrow('Email hoặc mật khẩu không đúng. Bạn còn 2 lần thử nữa');
      expect(User.incrementFailLoginAttempts).toHaveBeenCalledWith(1);
    });

    it('should lock account if wrong password and max attempts reached', async () => {
      User.findByEmail.mockResolvedValue({ 
        user_id: 1, 
        fail_login_attempts: 5,
        password_hash: 'hash'
      });
      User.checkIs_verified.mockResolvedValue({ is_verified: true });
      User.verifyPassword.mockResolvedValue(false);

      await expect(AuthService.login(email, password)).rejects.toThrow('Tài khoản của bạn đã bị khóa do đăng nhập sai nhiều lần.');
      expect(User.lockAccount).toHaveBeenCalled();
    });

    it('should successfully login and return user without password_hash (Happy Path)', async () => {
      const mockUser = { 
        user_id: 1, 
        email, 
        password_hash: 'hash', 
        fail_login_attempts: 0 
      };
      User.findByEmail.mockResolvedValue(mockUser);
      User.checkIs_verified.mockResolvedValue({ is_verified: true });
      User.verifyPassword.mockResolvedValue(true);

      const result = await AuthService.login(email, password);

      expect(result).not.toHaveProperty('password_hash');
      expect(result).toHaveProperty('email', email);
      expect(User.resetFailLoginAttempts).toHaveBeenCalledWith(1);
    });
  });

  describe('verifyOtp', () => {
    const mockUserData = { email: 'test@example.com', code: '123456' };

    it('should throw an error if email does not exist', async () => {
      User.findByEmail.mockResolvedValue(null);
      await expect(AuthService.verifyOtp(mockUserData)).rejects.toThrow('Email không tồn tại');
    });

    it('should throw an error if OTP is expired and clear OTP', async () => {
      User.findByEmail.mockResolvedValue({ user_id: 1 });
      const pastDate = new Date(Date.now() - 60000);
      Mail.getOtpDataByUserId.mockResolvedValue({ code_hash: 'hash', expires_at: pastDate });
      
      await expect(AuthService.verifyOtp(mockUserData)).rejects.toThrow('Mã OTP đã hết hạn');
      expect(Mail.clearOtpByUserId).toHaveBeenCalledWith(1);
    });

    it('should throw an error if OTP is incorrect', async () => {
      User.findByEmail.mockResolvedValue({ user_id: 1 });
      const futureDate = new Date(Date.now() + 60000);
      Mail.getOtpDataByUserId.mockResolvedValue({ code_hash: 'hash', expires_at: futureDate });
      Mail.verifycode.mockResolvedValue(false);

      await expect(AuthService.verifyOtp(mockUserData)).rejects.toThrow('Mã code không đúng');
    });

    it('should verify signup OTP and set user verified (Happy Path)', async () => {
      User.findByEmail.mockResolvedValue({ user_id: 1 });
      const futureDate = new Date(Date.now() + 60000);
      Mail.getOtpDataByUserId.mockResolvedValue({ code_hash: 'hash', expires_at: futureDate, otp_type: 'signup' });
      Mail.verifycode.mockResolvedValue(true);

      const result = await AuthService.verifyOtp(mockUserData);

      expect(User.setUserVerified).toHaveBeenCalledWith(1);
      expect(Mail.clearOtpByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true, otp_type: 'signup', email: mockUserData.email, user_id: 1 });
    });

    it('should verify reset OTP and allow reset (Happy Path)', async () => {
      User.findByEmail.mockResolvedValue({ user_id: 1 });
      const futureDate = new Date(Date.now() + 60000);
      Mail.getOtpDataByUserId.mockResolvedValue({ code_hash: 'hash', expires_at: futureDate, otp_type: 'reset' });
      Mail.verifycode.mockResolvedValue(true);

      const result = await AuthService.verifyOtp(mockUserData);

      expect(Mail.clearOtpByUserId).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true, allow_reset: true, email: mockUserData.email, user_id: 1, otp_type: 'reset' });
    });
  });

  describe('resetPassword', () => {
    const mockData = { userId: 1, newPassword: 'newpassword123' };

    it('should throw error if user not found', async () => {
      User.findById.mockResolvedValue(null);
      await expect(AuthService.resetPassword({ newPassword: 'new', userId: null })).rejects.toThrow('User không tồn tại');
    });

    it('should throw error if new password is same as old', async () => {
      User.findById.mockResolvedValue({ password_hash: 'hash' });
      User.verifyPassword.mockResolvedValue(true); // new pass equals old hash
      await expect(AuthService.resetPassword(mockData)).rejects.toThrow('Mật khẩu mới không được trùng với mật khẩu cũ');
    });

    it('should update password successfully (Happy Path)', async () => {
      User.findById.mockResolvedValue({ password_hash: 'hash' });
      User.verifyPassword.mockResolvedValue(false); // new pass different from old
      User.updatePassword.mockResolvedValue(true);

      await AuthService.resetPassword(mockData);
      expect(User.updatePassword).toHaveBeenCalledWith(1, 'newpassword123');
    });
  });

  describe('changePassword', () => {
    const mockData = { userId: 1, currentPassword: 'old', newPassword: 'new' };

    it('should throw error if not logged in', async () => {
      await expect(AuthService.changePassword({ ...mockData, userId: null })).rejects.toThrow('Bạn chưa đăng nhập');
    });

    it('should throw error if wrong current password', async () => {
      User.findById.mockResolvedValue({ password_hash: 'hash' });
      User.verifyPassword.mockResolvedValueOnce(false); // current pass check fails

      await expect(AuthService.changePassword(mockData)).rejects.toThrow('Mật khẩu hiện tại không đúng');
    });

    it('should throw error if new password same as current', async () => {
      User.findById.mockResolvedValue({ password_hash: 'hash' });
      User.verifyPassword
        .mockResolvedValueOnce(true) // current pass check succeeds
        .mockResolvedValueOnce(true); // new pass check matches old

      await expect(AuthService.changePassword(mockData)).rejects.toThrow('Mật khẩu mới không được trùng với mật khẩu hiện tại');
    });

    it('should change password successfully (Happy Path)', async () => {
      User.findById.mockResolvedValue({ password_hash: 'hash' });
      User.verifyPassword
        .mockResolvedValueOnce(true) // current pass check succeeds
        .mockResolvedValueOnce(false); // new pass check different

      await AuthService.changePassword(mockData);
      expect(User.updatePassword).toHaveBeenCalledWith(1, 'new');
    });
  });

  describe('updateProfile', () => {
    it('should throw error if not logged in', async () => {
      await expect(AuthService.updateProfile(null, {})).rejects.toThrow('Bạn chưa đăng nhập');
    });

    it('should throw error if username already taken by someone else', async () => {
      User.findById.mockResolvedValue({ username: 'oldusername' });
      User.isUsernameExists.mockResolvedValue(true);

      await expect(AuthService.updateProfile(1, { username: 'newusername' })).rejects.toThrow('Username đã tồn tại');
    });

    it('should update profile successfully and normalize data (Happy Path)', async () => {
      User.findById.mockResolvedValue({ username: 'oldusername' });
      User.isUsernameExists.mockResolvedValue(false);
      User.updateProfile.mockResolvedValue({ username: 'newusername', fullName: 'Test' });

      const result = await AuthService.updateProfile(1, { 
        username: ' newusername ', 
        fullName: 'Test' 
      });

      expect(User.updateProfile).toHaveBeenCalledWith(1, {
        username: 'newusername', // Should be trimmed
        fullName: 'Test',
        phone: undefined
      });
      expect(result).toHaveProperty('fullName', 'Test');
    });
  });
});
