require('dotenv').config();
const nodemailer = require('nodemailer');

//Hàm tạo mã OTP 6 số
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

(async () => {
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'restaurantmqhnotification@gmail.com',
      pass: 'abqc wiab vfgs lmme', 
    },
  });

  const otp = generateOTP();

  // Gửi mail
  const info = await transporter.sendMail({
    from: `"Restaurant MQH" <${process.env.EMAIL_USER}>`,
    to: 'chinhtpc123@gmail.com', // email người nhận
    subject: 'Mã xác thực tài khoản của bạn',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6">
        <h2>Chào bạn 👋</h2>
        <p>Dưới đây là mã xác thực của bạn:</p>
        <p style="font-size: 28px; font-weight: bold; letter-spacing: 5px; color: #007bff;">
          ${otp}
        </p>
        <p>Mã có hiệu lực trong <b>10 phút</b>.</p>
        <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
      </div>
    `,
  });

  console.log(' Mail đã gửi:', info.messageId);
  console.log('OTP:', otp);
})();
