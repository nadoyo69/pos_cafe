import tailwindForms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#3755c3',
          600: '#2b44a8',
          700: '#1e338b',
          800: '#17276d',
          900: '#101c50',
        },
        cafe: {
          amber: '#f59e0b',
          copper: '#d97706',
          brown: '#78350f',
          cream: '#fffbeb',
          dark: '#0f172a',
          card: '#1e293b'
        }
      }
    },
  },
  plugins: [
    tailwindForms
  ],
}
