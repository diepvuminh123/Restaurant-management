// Shared time-slot helpers for reservation UIs.
// Keeps time-slot lists consistent across Quick Booking, Table Map, and Staff/Admin bookings.

export const parseTimeToMinutes = (hhmm) => {
  if (!hhmm || typeof hhmm !== 'string') return null;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
};

export const formatMinutesToTime = (totalMinutes) => {
  const minutesInDay = 24 * 60;
  const normalized = ((Number(totalMinutes) % minutesInDay) + minutesInDay) % minutesInDay;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const roundUpMinutesToInterval = (minutes, intervalMinutes) => {
  const interval = Math.max(1, Number(intervalMinutes) || 30);
  const m = Math.max(0, Number(minutes) || 0);
  return Math.ceil(m / interval) * interval;
};

export const getLocalMinutes = (date = new Date()) => date.getHours() * 60 + date.getMinutes();

// Generates slot objects like:
// { id: '09:00', label: '09:00 - 09:30', startMinutes: 540, endMinutes: 570 }
// The `endTime` is treated as closing time (exclusive for starts).
export const generateTimeSlots = ({
  startTime = '11:00',
  endTime = '22:00',
  intervalMinutes = 30,
} = {}) => {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  const interval = Math.max(1, Number(intervalMinutes) || 30);

  if (start == null || end == null || end <= start) return [];

  const slots = [];
  for (let current = start; current + interval <= end; current += interval) {
    const id = formatMinutesToTime(current);
    const label = `${formatMinutesToTime(current)} - ${formatMinutesToTime(current + interval)}`;
    slots.push({ id, label, startMinutes: current, endMinutes: current + interval });
  }
  return slots;
};

export const isSameLocalDate = (yyyyMmDd, date = new Date()) => {
  if (!yyyyMmDd) return false;
  const local = new Date(date);
  const y = local.getFullYear();
  const m = String(local.getMonth() + 1).padStart(2, '0');
  const d = String(local.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}` === yyyyMmDd;
};
