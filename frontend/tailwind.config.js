/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#050811',
        darkCard: '#0d1326',
        darkBorder: '#1a264d',
        brandPrimary: '#00f0ff',
        brandSecondary: '#39ff14',
        cyberBlue: '#00f0ff',
        cyberGreen: '#39ff14',
        cyberRed: '#ff003c',
        cyberPurple: '#bd00ff',
        cyberYellow: '#fefe00',
        cyberDark: '#050811',
        cyberCard: '#0d1326',
        cyberBorder: '#1a264d',
      },
      animation: {
        'glow-pulse': 'glowPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scanline': 'scanLine 8s linear infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'dash-offset': 'dashOffset 30s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.6))' },
          '50%': { opacity: '0.6', filter: 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.2))' },
        },
        scanLine: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dashOffset: {
          'to': { strokeDashoffset: '-1000' }
        }
      }
    },
  },
  plugins: [],
}

