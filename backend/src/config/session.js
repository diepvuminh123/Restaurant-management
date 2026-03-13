const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const pool = require('./database');
require('dotenv').config();

const sessionConfig = {
  store: new pgSession({
    pool: pool,
    tableName: 'user_sessions',
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false, // Chỉ lưu session khi thực sự có dữ liệu (login/guest cart)
  name: process.env.SESSION_NAME || 'restaurant_session',
  cookie: {
    maxAge: parseInt(process.env.SESSION_MAX_AGE) || 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', //Ngăn gửi cookie tự động qua cross-site, bảo mật CSRF.
  },
};

module.exports = sessionConfig;
