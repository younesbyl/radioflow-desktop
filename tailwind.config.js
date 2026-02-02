/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // New sophisticated color palette - Indigo / Violet / Deep Slate
        primary: {
          DEFAULT: '#6366f1', // Indigo 500
          dark: '#4f46e5',
          light: '#818cf8',
        },
        accent: {
          DEFAULT: '#a855f7', // Purple 500
          dark: '#9333ea',
          light: '#c084fc',
        },
        background: {
          DEFAULT: '#0f172a', // Slate 900
          secondary: '#1e293b', // Slate 800
          tertiary: '#334155', // Slate 700
        },
        surface: {
          DEFAULT: '#1e293b',
          hover: '#2d3748',
        },
        text: {
          primary: '#f8fafc',
          secondary: '#cbd5e1',
          tertiary: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'player': '0 -10px 30px rgba(0, 0, 0, 0.6)',
        'card': '0 8px 30px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 12px 40px rgba(99, 102, 241, 0.25)',
        'glow-indigo': '0 0 30px rgba(99, 102, 241, 0.35)',
        'glow-purple': '0 0 30px rgba(168, 85, 247, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-indigo': 'pulseIndigo 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseIndigo: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(99, 102, 241, 0.7)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 0 12px rgba(99, 102, 241, 0)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
