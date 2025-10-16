/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Ensures these utilities are always generated
    'animate-scroll-x',
    'animate-scroll-x-reverse',
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
        // --- Existing animation (KEEP) ---
        'star-movement-top': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },

        // --- Horizontal scroll animation (FIXED) ---
        'scroll-x': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },

        // --- Reverse scroll (optional, moves right) ---
        'scroll-x-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },

      animation: {
        // --- Existing ---
        'star-movement-top': 'star-movement-top 8s linear infinite',

        // --- New ---
        'scroll-x': 'scroll-x 40s linear infinite',
        'scroll-x-reverse': 'scroll-x-reverse 40s linear infinite',
      },
      safelist: [
  'animate-scroll-x',
],

    },
  },
  plugins: [],
};