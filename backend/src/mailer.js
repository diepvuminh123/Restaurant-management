require('dotenv').config();
const nodemailer = require('nodemailer');

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,   
      pass: process.env.EMAIL_PASS,   
    },
  });
}

async function sendVerificationEmail({ to, code, minutes }) {
  const transporter = createTransporter();
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.6">
      <h3>Xác thực tài khoản</h3>
      <p>Mã xác thực của bạn là:</p>
      <p style="font-size:26px;font-weight:bold;letter-spacing:6px">${code}</p>
      <p>Mã có hiệu lực trong <b>${minutes}</b> phút.</p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    </div>
  `;
  return transporter.sendMail({
    from: `"Restaurant MQH" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Mã xác thực tài khoản',
    html,
  });
}

module.exports = { sendVerificationEmail };
