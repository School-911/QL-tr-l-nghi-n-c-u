const PASSWORD_RULE_MESSAGE = 'Mật khẩu phải có ít nhất 6 ký tự, 1 chữ viết hoa, 1 số và 1 ký tự đặc biệt.';

const isStrongPassword = (password) => {
  return /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/.test(password);
};

module.exports = {
  PASSWORD_RULE_MESSAGE,
  isStrongPassword
};
