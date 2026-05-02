const NAME_REGEX = /^[\p{L}][\p{L}\s'.-]{1,99}$/u;
const PHONE_REGEX = /^0\d{9}$/;
const GMAIL_REGEX = /^[^\s@]+@gmail\.com$/i;

export const normalizeReservationName = (value) => String(value || '').trim().replace(/\s+/g, ' ');

export const normalizeReservationPhone = (value) => String(value || '').replace(/\D/g, '');

export const validateReservationName = (value) => {
  const normalized = normalizeReservationName(value);

  if (!normalized) return 'Vui lòng nhập họ tên';
  if (!NAME_REGEX.test(normalized)) return 'Họ tên chỉ được chứa chữ cái và khoảng trắng hợp lệ';
  return '';
};

export const validateReservationPhone = (value) => {
  const normalized = normalizeReservationPhone(value);

  if (!normalized) return 'Vui lòng nhập số điện thoại';
  if (!PHONE_REGEX.test(normalized)) return 'Số điện thoại phải gồm đúng 10 chữ số';
  return '';
};

export const validateReservationEmail = (value) => {
  const normalized = String(value || '').trim();

  if (!normalized) return '';
  if (!GMAIL_REGEX.test(normalized)) return 'Email phải đúng định dạng, ví dụ ten@gmail.com';
  return '';
};

export const validateReservationPeople = (value, { min = 1, max = 50 } = {}) => {
  const normalized = String(value ?? '').trim();

  if (!normalized) return 'Vui lòng nhập số khách';

  const peopleNumber = Number(normalized);
  if (!Number.isInteger(peopleNumber)) return 'Số khách phải là số nguyên';
  if (peopleNumber < min) return `Số khách phải >= ${min}`;
  if (peopleNumber > max) return `Số khách tối đa ${max}`;

  return '';
};

export const validateReservationContact = ({ name, phone, email, people }) => {
  const errors = {};

  const nameError = validateReservationName(name);
  if (nameError) errors.customer_name = nameError;

  const phoneError = validateReservationPhone(phone);
  if (phoneError) errors.customer_phone = phoneError;

  const emailError = validateReservationEmail(email);
  if (emailError) errors.email = emailError;

  if (people !== undefined) {
    const peopleError = validateReservationPeople(people);
    if (peopleError) errors.people = peopleError;
  }

  return errors;
};