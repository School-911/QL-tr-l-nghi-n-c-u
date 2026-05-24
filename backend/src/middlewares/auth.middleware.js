const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Middleware xác thực và bảo mật các route (JWT Authentication)
 */
const protect = async (req, res, next) => {
  let token;

  // Lấy token từ Header Authorization theo chuẩn 'Bearer <Token>'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Xác thực chữ ký Token JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
      
      // Lấy thông tin người dùng từ DB (không lấy trường mật khẩu) và đính kèm vào req
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Không tìm thấy tài khoản người dùng tương ứng với Token này.'
        });
      }
      
      return next(); // Cho phép đi tiếp vào controller chính
    } catch (error) {
      console.error(`Lỗi xác nhận Token: ${error.message}`);
      return res.status(401).json({
        status: 'error',
        message: 'Token xác thực đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Không có quyền truy cập. Vui lòng cung cấp Token xác thực qua headers.'
    });
  }
};

module.exports = {
  protect
};
