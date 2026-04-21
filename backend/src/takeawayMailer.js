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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDateTime(value) {
  if (!value) return 'Khong xac dinh';
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toLocaleString('vi-VN');
  }
}

function getEventContent(eventType, orderCode) {
  const safeCode = escapeHtml(orderCode || 'N/A');

  const eventMap = {
    auto_cancel_unpaid: {
      subject: `Don ${safeCode} da tu dong huy do qua han coc`,
      heading: 'Don mang di da tu dong huy',
      body: 'He thong da tu dong huy don vi qua thoi gian xac nhan dat coc.',
      footer: 'Neu ban da thanh toan, vui long lien he nha hang de duoc ho tro nhanh nhat.',
    },
    auto_preparing: {
      subject: `Don ${safeCode} dang duoc chuan bi`,
      heading: 'Don mang di dang duoc che bien',
      body: 'Nha hang da bat dau chuan bi don cua ban theo khung gio nhan mon.',
      footer: 'Ban vui long den dung gio de nhan mon khi don o trang thai san sang.',
    },
    auto_ready: {
      subject: `Don ${safeCode} da san sang de nhan`,
      heading: 'Don mang di da san sang',
      body: 'Don cua ban da o trang thai SAN SANG. Ban co the den nha hang de nhan mon.',
      footer: 'Neu den tre, vui long lien he nha hang de duoc giu don.',
    },
    auto_completed: {
      subject: `Don ${safeCode} da duoc cap nhat hoan tat`,
      heading: 'Don mang di da hoan tat',
      body: 'He thong da cap nhat don cua ban sang trang thai HOAN TAT theo moc thoi gian.',
      footer: 'Cam on ban da su dung dich vu cua nha hang.',
    },
  };

  return eventMap[eventType] || null;
}

async function sendTakeawayAutomationEmail({
  to,
  customerName,
  orderCode,
  pickupTime,
  eventType,
} = {}) {
  if (!to) {
    return null;
  }

  const eventContent = getEventContent(eventType, orderCode);
  if (!eventContent) {
    return null;
  }

  const transporter = createTransporter();
  const safeName = escapeHtml(customerName || 'Quy khach');
  const safeOrderCode = escapeHtml(orderCode || 'N/A');
  const pickupText = escapeHtml(formatDateTime(pickupTime));

  const html = `
  <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:640px; margin:0 auto;">
    <div style="text-align:center; margin-bottom:16px;">
      <h2 style="margin:0 0 4px 0; font-size:24px; color:#b66333;">Nha Hang Huan Minh Quanh</h2>
      <p style="margin:0; font-size:14px; color:#777;">Thong bao don mang di</p>
    </div>

    <h3 style="margin-top:20px; margin-bottom:8px;">${eventContent.heading}</h3>
    <p>Xin chao <b>${safeName}</b>,</p>
    <p>${eventContent.body}</p>

    <div style="margin-top:14px; padding:12px 16px; border:1px solid #eee; border-radius:10px; background:#fff;">
      <p style="margin:0 0 8px 0;"><b>Ma don:</b> ${safeOrderCode}</p>
      <p style="margin:0;"><b>Gio nhan mon:</b> ${pickupText}</p>
    </div>

    <p style="margin-top:16px; color:#555;">${eventContent.footer}</p>

    <hr style="margin:24px 0; border:none; border-top:1px solid #eee;" />
    <p style="font-size:12px; color:#999; text-align:center;">
      Email duoc gui tu dong tu he thong nha hang. Vui long khong tra loi email nay.
    </p>
  </div>
  `;

  return transporter.sendMail({
    from: `"Restaurant MQH" <${process.env.EMAIL_USER}>`,
    to,
    subject: eventContent.subject,
    html,
  });
}

module.exports = {
  sendTakeawayAutomationEmail,
};
