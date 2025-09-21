/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <-- This line is essential
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        'dap-purple-1': '#A855F7',
        'dap-purple-2': '#7C3AED',
      }
    },
  },
  plugins: [],
}