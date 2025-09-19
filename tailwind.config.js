/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // make a semantic name so we can use `font-poppins` in components
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        // optional: make sure purple shades exist for consistent gradient
        'dap-purple-1': '#A855F7',
        'dap-purple-2': '#7C3AED',
      }
    },
  },
  plugins: [],
}