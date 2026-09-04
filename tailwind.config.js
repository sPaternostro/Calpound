/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './lib/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope_400Regular'],
        medium: ['Manrope_500Medium'],
        semibold: ['Manrope_600SemiBold'],
        display: ['Manrope_700Bold'],
      },
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
        ember: '#1C100C',
        emberCard: '#2B1710',
        emberLine: '#5A3224',
        charcoal: '#24120C',
        flame: '#E85D04',
        flameSoft: '#FF8A3D',
        ash: '#F6EDE6',
        smoke: '#C4A99A',
      },
    },
  },
  plugins: [],
};
