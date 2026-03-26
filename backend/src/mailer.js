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
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
    <div style="text-align:center; margin-bottom:16px;">
      <h2 style="margin:0 0 4px 0; font-size:24px; color:#b66333;">
        Nhà Hàng Huân Minh Quanh
      </h2>
      <p style="margin:0; font-size:14px; color:#777;">
        Ẩm thực đậm vị, phục vụ tận tâm
      </p>
    </div>

    <h3 style="margin-top:24px; margin-bottom:8px;">Xác thực tài khoản của bạn</h3>
    <p>Xin chào,</p>
    <p>
      Đây là mã xác thực để hoàn tất thao tác của bạn tại
      <b>Nhà Hàng Huân Minh Quanh</b>.
    </p>

    <p style="margin:16px 0 8px 0;">Mã xác thực của bạn là:</p>
    <p style="
      font-size:26px;
      font-weight:bold;
      letter-spacing:6px;
      text-align:center;
      padding:10px 16px;
      border-radius:8px;
      background:#f5e6dd;
      display:inline-block;
    ">
      ${code}
    </p>

    <p style="margin-top:16px;">
      Mã có hiệu lực trong <b>${minutes}</b> phút.
      Vui lòng không chia sẻ mã này với bất kỳ ai để bảo vệ tài khoản của bạn.
    </p>

    <p style="margin-top:16px; font-size:13px; color:#777;">
      Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
    </p>

    <hr style="margin:24px 0; border:none; border-top:1px solid #eee;" />

    <p style="font-size:12px; color:#999; text-align:center;">
      Email được gửi tự động từ hệ thống Nhà Hàng Huân Minh Quanh. Vui lòng không trả lời email này.
    </p>
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
