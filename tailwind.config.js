/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#233876', // deep blue
          50: '#eaf0fa',
          100: '#cfdcf2',
          200: '#a3bde3',
          300: '#6e93c7',
          400: '#3e5fa3',
          500: '#233876',
          600: '#1a2958',
          700: '#142043',
          800: '#101733',
          900: '#0b1021',
        },
        secondary: {
          DEFAULT: '#00bfae', // teal
          50: '#e0fcf8',
          100: '#b3f7ec',
          200: '#7deedc',
          300: '#3edfc7',
          400: '#00bfae',
          500: '#009e8e',
          600: '#007e6f',
          700: '#005e50',
          800: '#003e31',
          900: '#001e12',
        },
        accent: {
          lime: '#a3e635',
          blue: '#2563eb',
          slate: '#64748b',
        },
        gradientStart: '#233876',
        gradientEnd: '#00bfae',
        surface: '#ffffff',
        background: '#f8fafc',
  },
  spacing: {
        'sidebar': '16rem',
      },
      boxShadow: {
        'sidebar': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      }
    },
  },
  plugins: [],
}