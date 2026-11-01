/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1D2F',
          900: '#102A43',
          800: '#1A365D',
          700: '#2A4365',
        },
        primary: {
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#3B82F6',
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
        brand: {
          aqua: '#67E8F9',
          lightAqua: '#CFFAFE',
          teal: '#0D9488',
          sky: '#38BDF8',
          navy: '#102A43',
          canvas: '#F5FAFC',
          text: '#172B4D',
          muted: '#64748B',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'card': '12px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(16, 42, 67, 0.06), 0 1px 2px 0 rgba(16, 42, 67, 0.04)',
        'elevated': '0 4px 6px -1px rgba(16, 42, 67, 0.08), 0 2px 4px -1px rgba(16, 42, 67, 0.04)',
        'floating': '0 10px 25px -3px rgba(16, 42, 67, 0.12), 0 4px 6px -2px rgba(16, 42, 67, 0.05)',
      }
    },
  },
  plugins: [],
}
