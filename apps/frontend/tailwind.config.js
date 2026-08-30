/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        titulo: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        corpo: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        page: '#FAFAFA',
        primary: { DEFAULT: '#1E9E3E', foreground: '#FAFAFA' },
        muted: { DEFAULT: '#F4F4F5', foreground: '#71717A' },
        card: { DEFAULT: '#FFFFFF', foreground: '#09090B' },
        border: '#E4E4E7',
        'severity-critical': '#DC2626',
        'severity-warning': '#D97706',
        'severity-info': '#3B82F6',
        'status-sent': '#16A34A',
        'status-failed': '#DC2626',
        'status-pending': '#CA8A04',
      },
      borderRadius: { card: '8px', badge: '6px' },
      spacing: { '18': '72px', '22': '88px' },
    },
  },
  plugins: [],
};