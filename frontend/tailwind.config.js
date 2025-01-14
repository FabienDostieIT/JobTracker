/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'custom-blue': {
          50: '#f0f4f9',
          100: '#e1e9f2',
          600: '#425f99',
          700: '#385180',
        },
        // Couleurs pour le mode sombre
        dark: {
          'bg-primary': '#1a1a1a',
          'bg-secondary': '#2d2d2d',
          'text-primary': '#e1e1e1',
          'text-secondary': '#a0a0a0',
          'border': '#404040',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
} 