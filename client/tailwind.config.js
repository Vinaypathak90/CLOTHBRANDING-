/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkLuxury: '#0A0A0A',
        lightLuxury: '#F5F5F0',
        goldAccent: 'var(--primary-accent)' // Database se aane wale hex color variable ko handle karega
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
