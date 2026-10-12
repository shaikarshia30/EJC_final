/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#090B0E',
          surface: '#0D1117',
          card: '#161B22',
          elevated: '#21262D',
          border: '#30363D',
          hover: '#282E37',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
          subtle: 'rgba(99, 102, 241, 0.12)',
        },
        ai: {
          purple: '#A371F7',
          glow: 'rgba(163, 113, 247, 0.15)',
        },
        fg: {
          DEFAULT: '#F0F6FC',
          muted: '#8B949E',
          subtle: '#6E7681',
        },
        state: {
          success: '#3FB950',
          warning: '#D29922',
          danger: '#F85149',
          info: '#58A6FF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Geist', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '10px',
        'xl': '12px',
      },
    },
  },
  plugins: [],
};
