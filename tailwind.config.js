/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'menu-green': '#0D3B2F',
        'menu-gold': '#cab57c',
        'menu-cream': '#FFF8E1',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
