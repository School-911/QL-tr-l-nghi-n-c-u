/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Tùy chỉnh màu sắc thương hiệu cao cấp cho giao diện Trợ lý Nghiên cứu AI
        brand: {
          50: '#f5f7fa',
          100: '#e4e8f0',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#1e293b'
        }
      }
    },
  },
  plugins: [],
}
