const nodemailer = require('nodemailer');

/**
 * Hàm gửi mail dùng chung. 
 * Tự động chọn Elastic Email API trên Production, 
 * và dùng Nodemailer (Gmail) trên Localhost.
 */
async function sendMail({ from, to, subject, html }) {
  if (process.env.NODE_ENV === 'production') {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY in environment variables');
    }

    // Lưu ý: 
    const resendFrom = "Restaurant MQH <onboarding@resend.dev>";

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: resendFrom,
        to: [to],
        subject: subject,
        html: html
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Resend Error: ${result.message || JSON.stringify(result)}`);
    }

    return result;

  } else {
    // 2. Môi trường Localhost -> Gửi qua Nodemailer (Gmail SMTP)
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      connectionTimeout: 10000,
    });

    return await transporter.sendMail({
      from,
      to,
      subject,
      html
    });
  }
}

module.exports = { sendMail };
