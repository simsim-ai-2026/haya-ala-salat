/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Core palette for the app. Tweak here rather than in screens.
        sand: {
          50: '#faf7f2',
          100: '#f2ece1',
          200: '#e4d8c3',
        },
        emerald: {
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#0b3b38',
        },
        // Sampled from logo.png / image.png. `night` is the splash background and
        // must stay in sync with the expo-splash-screen backgroundColor in app.json.
        brand: {
          night: '#0b2b22',
          deep: '#0d251d',
          gold: '#d9b771',
          cream: '#eddcb4',
        },
      },
    },
  },
  plugins: [],
};
