const nodemailer = require('nodemailer');

/**
 * Hàm gửi mail dùng chung. 
 * Tự động chọn Elastic Email API trên Production, 
 * và dùng Nodemailer (Gmail) trên Localhost.
 */
async function sendMail({ from, to, subject, html }) {
  if (process.env.NODE_ENV === 'production') {
    const apiKey = process.env.ELASTIC_EMAIL_API_KEY;
    if (!apiKey) {
      throw new Error('Missing ELASTIC_EMAIL_API_KEY in environment variables');
    }

    // Dùng API v2 (Query string hoặc Form data)
    const url = new URL('https://api.elasticemail.com/v2/email/send');
    url.searchParams.append('apikey', apiKey);
    url.searchParams.append('from', from);
    url.searchParams.append('to', to);
    url.searchParams.append('subject', subject);
    url.searchParams.append('bodyHtml', html);
    url.searchParams.append('isTransactional', 'true');

    const response = await fetch(url.toString(), {
      method: 'POST'
    });

    const result = await response.json();

    if (result.success === false) {
      throw new Error(`Elastic Email Error: ${result.error}`);
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
