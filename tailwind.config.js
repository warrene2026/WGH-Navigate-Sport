/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'nys-red': '#E8192C',
        'nys-bg': '#1A1A1A',
        'nys-card': '#2A2A2A',
        'nys-border': '#3A3A3A',
        'nys-dim': '#B8B8B4',
        'nys-faint': '#8A8A86',
      },
    },
  },
  plugins: [],
};
