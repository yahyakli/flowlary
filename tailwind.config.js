/** @type {import('tailwindcss').Config} */
const { designTokens } = require('./src/lib/design-tokens')

module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: designTokens.colors.brand,
        accent: designTokens.colors.accent,
        teal: designTokens.colors.teal,
        slate: designTokens.colors.slate,
      },
      fontSize: designTokens.typography.fontSize,
      spacing: designTokens.spacing,
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 30px -12px rgba(15, 23, 42, 0.18)',
      },
    },
  },
  plugins: [],
}