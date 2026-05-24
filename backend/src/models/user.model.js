const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isStrongPassword, PASSWORD_RULE_MESSAGE } = require('../utils/password');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email là bắt buộc.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Vui lòng cung cấp một địa chỉ email hợp lệ.'
    ]
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc.'],
    minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự.'],
    validate: {
      validator: isStrongPassword,
      message: PASSWORD_RULE_MESSAGE
    }
  },
  fullName: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc.'],
    trim: true
  },
  passwordResetCode: {
    type: String,
    select: false
  },
  passwordResetExpires: {
    type: Date,
    select: false
  }
}, {
  timestamps: true
});

// Middleware pre-save: Tự động mã hóa mật khẩu trước khi lưu vào MongoDB
userSchema.pre('save', async function (next) {
  // Chỉ mã hóa lại mật khẩu khi trường mật khẩu có sự thay đổi
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Phương thức đối sánh mật khẩu dùng khi đăng nhập
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
