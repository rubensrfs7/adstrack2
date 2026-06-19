
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dashboard: {
          bg: '#0B0E14',
          card: '#151921',
          border: '#242933'
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-bounce': 'subtleBounce 1s infinite'
      },
      keyframes: {
        subtleBounce: {
          '0%, 100%': { transform: 'translateY(-2%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
          '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
        }
      }
    },
  },
  plugins: [],
}
