/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0eaff',
          200: '#c7d7fe',
          300: '#a4bcfd',
          400: '#7b97fa',
          500: '#5472f5',
          600: '#3d52e8',
          700: '#3140d4',
          800: '#2c36ab',
          900: '#293487',
          950: '#1c2057',
        },
        success: { 50: '#f0fdf4', 500: '#22c55e', 700: '#15803d' },
        danger:  { 50: '#fff1f2', 500: '#ef4444', 700: '#b91c1c' },
        warn:    { 50: '#fffbeb', 500: '#f59e0b', 700: '#b45309' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
