/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#FAF6F0',
          50: '#FFFDFA',
          100: '#FAF6F0',
          200: '#F4EDE2',
        },
        terracotta: {
          50: '#FDF3EF',
          100: '#FAE2D9',
          200: '#F5C4B3',
          300: '#F0A68D',
          400: '#EC9075',
          500: '#E87A5D',
          600: '#D35E40',
          700: '#B04A30',
          800: '#8A3B27',
          900: '#5E2A1D',
          DEFAULT: '#E87A5D',
        },
        sand: {
          50: '#FAF7F2',
          100: '#F2ECE1',
          200: '#E8DECD',
          300: '#D9CAB2',
          400: '#C4AF8E',
          DEFAULT: '#F2ECE1',
        },
        sage: {
          50: '#F2F5F0',
          100: '#E2E8DF',
          200: '#C9D4C4',
          300: '#A6B79E',
          400: '#7E9474',
          500: '#5F7556',
          DEFAULT: '#E2E8DF',
        },
        charcoal: {
          DEFAULT: '#1A1A1A',
          700: '#3A3734',
          500: '#6B6560',
          300: '#A39D96',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',   // 24px
        '4xl': '2rem',     // 32px
        pill: '9999px',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(26, 26, 26, 0.18)',
        lift: '0 20px 50px -20px rgba(26, 26, 26, 0.35)',
        glow: '0 0 0 6px rgba(232, 122, 93, 0.25), 0 0 24px 4px rgba(232, 122, 93, 0.45)',
      },
    },
  },
  plugins: [],
};
