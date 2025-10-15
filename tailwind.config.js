/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
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
      },
      keyframes: {
        'star-movement-top': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'star-movement-top': 'star-movement-top 8s linear infinite',
      },
    },
  },
  plugins: [],
}