/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#0F172A',         // Slate 900
          card: '#1E293B',       // Slate 800
          border: '#334155',     // Slate 700
          hover: '#283548',
          text: '#F8FAFC',
          muted: '#94A3B8',
        },
        kumbh: {
          navy: '#0A192F',
          blue: '#1E3A8A',
          azure: '#2563EB',
          gold: '#D97706',
          saffron: '#EA580C',
        },
        risk: {
          low: '#10B981',       // Safe Green
          moderate: '#F59E0B',  // Caution Amber
          high: '#F97316',      // Warning Orange
          critical: '#EF4444',  // Emergency Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
