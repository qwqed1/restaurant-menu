/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'menu-green': '#00264B', // Темно-синий фон
        'menu-gold': '#F2A11F', // Желто-оранжевый для акцентов
        'menu-cream': '#FFFFFF', // Белый для текста
        'menu-blue': '#F2A11F', // Желто-оранжевый для кнопок
        'menu-orange': '#C85A3D', // Терракотовый оранжевый
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
