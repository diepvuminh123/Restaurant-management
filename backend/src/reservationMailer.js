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

function formatReservationTime(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildReservationCode(reservationId) {
  if (reservationId === undefined || reservationId === null) return '';
  // Keep it simple: 6-digit numeric code (e.g. 000009)
  return String(reservationId).padStart(6, '0');
}

const reservationMailer = async ({
  to,
  code,
  reservationId,
  reservation_id,
  reservationTime,
  reservation_time,
  tableId,
  table_id,
  numberOfGuests,
  number_of_guests,
  note,
} = {}) => {
  const transporter = createTransporter();

  const resolvedReservationId = reservationId ?? reservation_id;
  const resolvedReservationTime = reservationTime ?? reservation_time;
  const resolvedTableId = tableId ?? table_id;
  const resolvedGuests = numberOfGuests ?? number_of_guests;
  const resolvedTime = formatReservationTime(resolvedReservationTime);
  const resolvedNote = note ? String(note).trim() : '';

  const resolvedCode = code ?? buildReservationCode(resolvedReservationId);

  const safeCode = resolvedCode ? escapeHtml(resolvedCode) : '';
  const safeTableId = resolvedTableId !== undefined && resolvedTableId !== null ? escapeHtml(resolvedTableId) : null;
  const safeGuests = resolvedGuests !== undefined && resolvedGuests !== null ? escapeHtml(resolvedGuests) : null;
  const safeTime = resolvedTime ? escapeHtml(resolvedTime) : null;
  const safeNote = resolvedNote ? escapeHtml(resolvedNote) : '';

  const infoRows = [
    safeTime
      ? `<tr>
          <td style="padding:10px 0; color:#666; width:140px;">Thời gian đặt</td>
          <td style="padding:10px 0; font-weight:600;">${safeTime}</td>
        </tr>`
      : '',
    safeTableId !== null
      ? `<tr>
          <td style="padding:10px 0; color:#666;">Vị trí bàn</td>
          <td style="padding:10px 0; font-weight:600;">${safeTableId}</td>
        </tr>`
      : '',
    safeGuests !== null
      ? `<tr>
          <td style="padding:10px 0; color:#666;">Số khách</td>
          <td style="padding:10px 0; font-weight:600;">${safeGuests}</td>
        </tr>`
      : '',
    safeNote
      ? `<tr>
          <td style="padding:10px 0; color:#666;">Ghi chú</td>
          <td style="padding:10px 0; font-weight:600; white-space:pre-wrap;">${safeNote}</td>
        </tr>`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

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

    <h3 style="margin-top:24px; margin-bottom:8px;">Xác nhận đặt bàn của bạn</h3>
    <p>Xin chào,</p>
    <p style="margin:0;">
      Cảm ơn bạn đã đặt bàn tại <b>Nhà Hàng Huân Minh Quanh</b>. Dưới đây là thông tin xác nhận đặt bàn của bạn:
    </p>

    <p style="margin:16px 0 8px 0;">Mã đặt bàn:</p>
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
      ${safeCode}
    </p>

    ${infoRows
      ? `
    <div style="margin-top:16px; padding:12px 16px; border:1px solid #eee; border-radius:10px; background:#fff;">
      <table style="width:100%; border-collapse:collapse;">
        ${infoRows}
      </table>
    </div>`
      : ''}

    <p style="margin-top:16px; font-size:13px; color:#777;">
      Vui lòng giữ lại email này để đối chiếu khi đến nhà hàng.
    </p>

    <hr style="margin:24px 0; border:none; border-top:1px solid #eee;" />

    <p style="font-size:12px; color:#999; text-align:center;">
      Email được gửi tự động từ hệ thống Nhà Hàng Huân Minh Quanh. Vui lòng không trả lời email này.
    </p>
  </div>
`;

  return transporter.sendMail({
    from: `"Restaurant MQH" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Xác nhận đặt bàn tại nhà hàng Huân Minh Quanh',
    html,
  });
};

module.exports = reservationMailer;
   
