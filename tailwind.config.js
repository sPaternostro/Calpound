/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#F4F1EA',
        paper: '#FFFcf7',
        ink: '#1F1A16',
        muted: '#6F675F',
        forest: '#2F5D50',
        forestSoft: '#3F7A69',
        bronze: '#C17F4A',
        sage: '#D7E4DE',
        line: '#E7E1D6',
        danger: '#9A4A3C',
      },
    },
  },
  plugins: [],
};
