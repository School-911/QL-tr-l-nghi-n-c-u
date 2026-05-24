export const THEME_STORAGE_KEY = 'schoolResearchTheme';
export const HISTORY_PAGE_SIZE = 6;

const normalizeApiUrl = (value, fallback) => {
  return (value || fallback).replace(/\/+$/, '');
};

const isLocalHost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

export const BACKEND_API = normalizeApiUrl(
  import.meta.env.VITE_BACKEND_API_URL,
  isLocalHost ? 'http://localhost:5000' : ''
).replace(/\/api$/, '');

export const AI_CORE_API = normalizeApiUrl(
  import.meta.env.VITE_AI_CORE_API_URL,
  isLocalHost ? 'http://localhost:8000' : ''
);

export const passwordRules = [
  ['length', 'Tối thiểu 6 ký tự', (value) => value.length >= 6],
  ['uppercase', 'Có ít nhất 1 chữ viết hoa', (value) => /[A-Z]/.test(value)],
  ['number', 'Có ít nhất 1 số', (value) => /\d/.test(value)],
  ['special', 'Có ít nhất 1 ký tự đặc biệt', (value) => /[^A-Za-z0-9]/.test(value)]
];
