const nodemailer = require('nodemailer');

const getMailConfig = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return {
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return {
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    };
  }

  return null;
};

const sendResetPasswordCode = async ({ to, code }) => {
  const config = getMailConfig();

  if (!config) {
    throw new Error('SMTP/Gmail chưa được cấu hình trong backend/.env.');
  }

  const transporter = nodemailer.createTransport(config);
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER;

  await transporter.sendMail({
    from,
    to,
    subject: 'Mã đặt lại mật khẩu School Research',
    text: `Mã đặt lại mật khẩu của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
        <h2>School Research</h2>
        <p>Mã đặt lại mật khẩu của bạn là:</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
        <p>Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu thao tác này, hãy bỏ qua email.</p>
      </div>
    `
  });
};

module.exports = {
  sendResetPasswordCode
};
