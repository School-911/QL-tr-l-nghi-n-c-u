const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { sendResetPasswordCode } = require('../config/mailer');
const { isStrongPassword, PASSWORD_RULE_MESSAGE } = require('../utils/password');

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET chưa được cấu hình trong file .env');
  }

  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

const hashResetCode = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * Đăng ký tài khoản
 */
const register = async (req, res) => {
  try {

    const { fullName, email, password } = req.body;

    // Validate dữ liệu đầu vào
    if (!fullName || !email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng nhập đầy đủ thông tin.'
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        status: 'error',
        message: PASSWORD_RULE_MESSAGE
      });
    }

    // Kiểm tra email tồn tại
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email đã tồn tại.'
      });
    }

    // Tạo user mới
    const user = await User.create({
      fullName,
      email,
      password
    });

    // Trả response
    res.status(201).json({
      status: 'success',
      message: 'Đăng ký tài khoản thành công.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      status: 'error',
      message: error.message || 'Lỗi server khi đăng ký.'
    });

  }
};

/**
 * Đăng nhập tài khoản
 */
const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng nhập email và mật khẩu.'
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng.'
      });
    }

    // So sánh mật khẩu
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Email hoặc mật khẩu không đúng.'
      });
    }

    // Login thành công
    res.status(200).json({
      status: 'success',
      message: 'Đăng nhập thành công.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      status: 'error',
      message: 'Lỗi server khi đăng nhập.'
    });

  }
};

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng nhập email.'
      });
    }

    const user = await User.findOne({ email }).select('+passwordResetCode +passwordResetExpires');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'Không tìm thấy tài khoản với email này.'
      });
    }

    const resetCode = crypto.randomInt(100000, 999999).toString();

    user.passwordResetCode = hashResetCode(resetCode);
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendResetPasswordCode({
      to: user.email,
      code: resetCode
    });

    return res.status(200).json({
      status: 'success',
      message: 'Mã xác nhận đã được gửi tới email của bạn.'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 'error',
      message: error.message || 'Không thể gửi mã đặt lại mật khẩu.'
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Vui lòng nhập email, mã xác nhận và mật khẩu mới.'
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        status: 'error',
        message: PASSWORD_RULE_MESSAGE
      });
    }

    const user = await User.findOne({
      email,
      passwordResetCode: hashResetCode(code),
      passwordResetExpires: { $gt: new Date() }
    }).select('+passwordResetCode +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Mã xác nhận không đúng hoặc đã hết hạn.'
      });
    }

    user.password = password;
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Mật khẩu đã được cập nhật. Hãy đăng nhập lại.'
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: 'error',
      message: error.message || 'Không thể đặt lại mật khẩu.'
    });
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  resetPassword
};
