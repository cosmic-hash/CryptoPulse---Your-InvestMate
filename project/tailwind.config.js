/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-navy': '#1A1A2E',
        'neon-pink': '#F64E60',
        'pastel-yellow': '#F1FA8C',
        'grid-line': 'rgba(241, 250, 140, 0.2)',
      },
      fontFamily: {
        mono: ['"Space Mono"', 'monospace'],
        display: ['"Orbitron"', 'sans-serif'],
      },
      animation: {
        'grid-breathe': 'gridBreathe 1.5s infinite ease-in-out',
        'glow-pulse': 'glowPulse 2s infinite ease-in-out',
        'fade-in': 'fadeIn 400ms ease-out forwards',
        'slide-up': 'slideUp 300ms ease-in forwards',
        'slide-down': 'slideDown 250ms ease-out forwards',
        'slide-in-left': 'slideInLeft 300ms ease-out forwards',
        'stagger-fade-up': 'staggerFadeUp 150ms ease-out forwards',
        'bounce-once': 'bounceOnce 200ms ease-out',
        'typewriter': 'typewriter 30ms steps(1) forwards',
      },
      keyframes: {
        gridBreathe: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '0.3' },
        },
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 0px #F64E60' },
          '50%': { textShadow: '0 0 12px #F64E60' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        staggerFadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        typewriter: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      transitionDuration: {
        '50': '50ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      transitionTimingFunction: {
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        'neon-pink': '0 0 8px #F64E60',
        'neon-yellow': '0 0 8px #F1FA8C',
      },
    },
  },
  plugins: [],
};