/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#1A1A2E',
        'neon-pink': '#F64E60',
        'pastel-yellow': '#F1FA8C',
        'dark-navy': '#0F0F1A',
        'medium-navy': '#23233F',
        'light-navy': '#2D2D4A',
      },
      fontFamily: {
        'heading': ['Orbitron', 'sans-serif'],
        'mono': ['Space Mono', 'monospace'],
      },
      animation: {
        'grid-pulse': 'gridPulse 1.5s ease-in-out infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'grid-drift': 'gridDrift 10s linear infinite',
        'typewriter': 'typewriter 2s steps(40, end)',
      },
      keyframes: {
        gridPulse: {
          '0%, 100%': { opacity: 0.2 },
          '50%': { opacity: 0.3 },
        },
        glowPulse: {
          '0%, 100%': { textShadow: '0 0 0px #F64E60' },
          '50%': { textShadow: '0 0 12px #F64E60' },
        },
        gridDrift: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 20px' },
        },
        typewriter: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
    },
  },
  plugins: [],
};