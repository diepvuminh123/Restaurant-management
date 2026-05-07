const nodemailer = require('nodemailer');

/**
 * Hàm gửi mail dùng chung. 
 * Tự động chọn Elastic Email API trên Production, 
 * và dùng Nodemailer (Gmail) trên Localhost.
 */
async function sendMail({ from, to, subject, html }) {
  if (process.env.NODE_ENV === 'production') {
    // 1. Môi trường Production (Render) -> Gửi qua Elastic Email API v4
    const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    if (!apiKey) {
      throw new Error('Missing ELASTIC_EMAIL_API_KEY in environment variables');
    }

    const payload = {
      Recipients: [
        {
          Email: to
        }
      ],
      Content: {
        Body: [
          {
            ContentType: 'HTML',
            Content: html,
            Charset: 'utf-8'
          }
        ],
        From: from,
        ReplyTo: from,
        Subject: subject
      }
    };

    const response = await fetch('https://api.elasticemail.com/v4/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-ElasticEmail-ApiKey': apiKey
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorDetail = '';
      try {
        const errJson = await response.json();
        errorDetail = JSON.stringify(errJson);
      } catch (e) {
        errorDetail = response.statusText;
      }
      throw new Error(`Elastic Email Error: ${errorDetail}`);
    }

    // Nếu cần lấy json response thì return:
    // return await response.json();
    return { success: true, message: 'Sent via Elastic Email API' };

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
