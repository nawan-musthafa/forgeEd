/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        ink: {
          50: '#f7f7f8', 100: '#ededf0', 200: '#d5d6dc', 300: '#b1b3be',
          400: '#878997', 500: '#6b6d7c', 600: '#575966', 700: '#474854',
          800: '#3b3c46', 900: '#1c1e26', 950: '#0a0d14',
        },
        saffron: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c' },
        teal:    { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
        plum:    { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
        coral:   { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48' },
        moss:    { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a' },
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(10, 13, 20, 0.04), 0 4px 12px rgba(10, 13, 20, 0.04)',
        elev: '0 4px 16px rgba(10, 13, 20, 0.06), 0 16px 40px rgba(10, 13, 20, 0.08)',
        lux:  '0 8px 32px rgba(10, 13, 20, 0.10), 0 32px 80px rgba(10, 13, 20, 0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 600ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 500ms ease-out both',
        'scale-in': 'scaleIn 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp:   { from: { opacity: '0', transform: 'translateY(20px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:   { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn:  { from: { opacity: '0', transform: 'scale(0.94)' }, to: { opacity: '1', transform: 'scale(1)' } },
        shimmer:  { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};