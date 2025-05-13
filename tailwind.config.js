/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // Enable dark mode using class,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        kanit: ['Kanit', 'sans-serif'],
        centurygothic: ['"Century Gothic"', 'sans-serif'],
      },
      transitionProperty: {
        colors: "color, background-color, border-color",
      },
    },
  },
  plugins: [],
}