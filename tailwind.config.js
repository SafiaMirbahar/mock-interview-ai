/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#0A0A14',
        panel: '#131320',
        panelLight: '#1A1A2E',
        brass: '#3D7FFF',      // primary accent — now blue
        brassLight: '#6FA0FF', // lighter blue, hover states
        pink: '#FF4FA3',       // secondary accent — used in gradients
        ash: '#8C90A6',
        signal: '#34D399',
        clay: '#FF5C5C',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}