/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'custom-blue': {
          50: '#f0f4f9',
          100: '#e1e9f2',
          600: '#425f99',
          700: '#385180',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 