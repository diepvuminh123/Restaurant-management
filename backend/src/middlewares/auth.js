// Kiểm tra đăng nhập
const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Bạn cần đăng nhập để thực hiện chức năng này'
    });
  }
  next();
};

/*
 * @param {Array|String} roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để thực hiện chức năng này'
      });
    }

    if (!roles.includes(req.session.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập chức năng này'
      });
    }

    next();
  };
};

const optionalAuth = (req, res, next) => {
  // Chỉ tạo session cho luồng guest cart, không ép tạo cho user đã đăng nhập
  if (req.session && !req.session.userId && !req.session.guestCartSession) {
    req.session.guestCartSession = true;
  }
  next();
};


module.exports = {
  requireAuth,
  requireRole,
  optionalAuth
};
