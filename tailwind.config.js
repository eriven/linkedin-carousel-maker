/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#e5322d',
          hover: '#cc2b26',
        },
      },
    },
  },
  plugins: [],
}
