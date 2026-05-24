import { passwordRules, THEME_STORAGE_KEY } from './constants';

export const getSavedTheme = () => localStorage.getItem(THEME_STORAGE_KEY) || 'light';

export const getPersonalWorkspaceId = (userId, email) => {
  const rawId = userId || email || 'guest';
  return `user-${String(rawId).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
};

export const isStrongPassword = (value) => passwordRules.every(([, , test]) => test(value));

export const formatMembershipStatus = (status) => {
  if (status === 'active') return 'Đang hoạt động';
  if (status === 'pending') return 'Đang chờ duyệt';
  return status || 'Không rõ';
};

export const startOfDay = (date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const endOfDay = (date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

export const getRangeDates = (preset, customStart, customEnd) => {
  const now = new Date();
  const end = endOfDay(now);
  const start = startOfDay(now);

  if (preset === 'today') return { start, end };
  if (preset === '7d') {
    const rangeStart = startOfDay(now);
    rangeStart.setDate(rangeStart.getDate() - 6);
    return { start: rangeStart, end };
  }
  if (preset === '30d') {
    const rangeStart = startOfDay(now);
    rangeStart.setDate(rangeStart.getDate() - 29);
    return { start: rangeStart, end };
  }
  if (preset === 'custom' && customStart && customEnd) {
    const startDate = new Date(customStart);
    const endDate = new Date(customEnd);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      return { start: null, end: null };
    }

    return {
      start: startOfDay(startDate),
      end: endOfDay(endDate)
    };
  }

  return { start: null, end: null };
};

export const isWithinRange = (value, range) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  if (!range.start || !range.end) return true;
  return date >= range.start && date <= range.end;
};
