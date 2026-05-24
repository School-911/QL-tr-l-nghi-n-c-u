export const THEME_STORAGE_KEY = 'schoolResearchTheme';
export const HISTORY_PAGE_SIZE = 6;
export const AI_CORE_API = 'http://localhost:8000';

export const passwordRules = [
  ['length', 'Tối thiểu 6 ký tự', (value) => value.length >= 6],
  ['uppercase', 'Có ít nhất 1 chữ viết hoa', (value) => /[A-Z]/.test(value)],
  ['number', 'Có ít nhất 1 số', (value) => /\d/.test(value)],
  ['special', 'Có ít nhất 1 ký tự đặc biệt', (value) => /[^A-Za-z0-9]/.test(value)]
];
