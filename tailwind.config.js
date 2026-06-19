/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: '#1a1a1a',
        offwhite: '#f5f2eb',
        'green-dark': '#2d6a4f',
        'green-med': '#52b788',
        'green-light': '#d8f3dc',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
      },
    },
  },
  plugins: [],
}