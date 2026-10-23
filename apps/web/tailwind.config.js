/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   '#DC2626',
        'primary-hover': '#B91C1C',
        secondary: '#F87171',
        accent:    '#A16207',
        background:'#FEF2F2',
        foreground:'#450A0A',
        card:      '#FFFFFF',
        muted:     '#F0EDF1',
        'muted-fg':'#475569',
        border:    '#FECACA',
      },
      fontFamily: {
        heading: ['Playfair Display SC', 'serif'],
        body:    ['Karla', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
