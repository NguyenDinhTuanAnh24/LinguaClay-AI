import type { Config } from 'tailwindcss'
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Claymorphism Color Palette
        cream: '#FFF8E7',
        'warm-white': '#FFFEF7',
        'soft-gray': '#E8E4DE',
        'clay-shadow': '#D4C5B9',

        clay: {
          cream: '#FFF8E7',
          blue: '#7BA3D0',
          'blue-dark': '#5A86B8',
          orange: '#F4A460',
          pink: '#E8B4B8',
          green: '#A8D5BA',
          gold: '#E5B77E',
          deep: '#8B7355',
          brown: '#6B4226',
          'brown-dark': '#4A2C17',
        },
        // Brutalist / Newsprint Theme
        'newsprint-black': '#141414',
        'newsprint-white': '#FFFFFF',
        'newsprint-paper': '#F5F0E8',
        'newsprint-gray': {
          DEFAULT: '#6B7280',
          light: '#E5E7EB',
          dark: '#374151',
        }
      },
      fontFamily: {
        // Newsprint + Swiss Design fonts
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        // Vietnamese optimized font with comprehensive fallbacks
        vietnamese: ['var(--font-vietnamese)', '"Be Vietnam Pro"', '"Noto Sans Vietnamese"', 'var(--font-inter)', 'system-ui', 'sans-serif'],
        // Legacy claymorphism fonts (keep for backward compatibility)
        heading: ['Nunito', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      boxShadow: {
        // Brutalist Hard Shadows
        'brutalist-soft': '4px 4px 0px 0px rgba(20, 20, 20, 1)',
        'brutalist-card': '8px 8px 0px 0px rgba(20, 20, 20, 1)',
        'brutalist-heavy': '12px 12px 0px 0px rgba(20, 20, 20, 1)',
        'brutalist-button': '2px 2px 0px 0px rgba(20, 20, 20, 1)',
        
        // Soft neumorphic/clay shadows (Keeping for transition)
        'clay-card':
          '15px 15px 30px #D4C5B9, ' +
          '-15px -15px 30px #FFFFFF, ' +
          'inset 5px 5px 10px rgba(255, 255, 255, 0.5), ' +
          'inset -5px -5px 10px rgba(212, 197, 185, 0.3)',
        'clay-button':
          '8px 8px 16px #D4C5B9, ' +
          '-8px -8px 16px #FFFFFF, ' +
          'inset 3px 3px 6px rgba(255, 255, 255, 0.6), ' +
          'inset -3px -3px 6px rgba(212, 197, 185, 0.2)',
        'clay-button-hover':
          '12px 12px 24px #D4C5B9, ' +
          '-12px -12px 24px #FFFFFF',
        'clay-inset':
          'inset 5px 5px 10px rgba(212, 197, 185, 0.4), ' +
          'inset -5px -5px 10px rgba(255, 255, 255, 0.8)',
        'clay-float':
          '0 25px 50px rgba(212, 197, 185, 0.3), ' +
          '0 15px 30px rgba(212, 197, 185, 0.15)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-delayed': 'float 6s ease-in-out 2s infinite',
        'breathe': 'breathe 3s ease-in-out infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee': 'marquee 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.95)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        /* Khởi tạo không gian chiều sâu */
        ".perspective-1000": {
          perspective: "1000px",
        },
        /* Khai báo khối 3D thay vì ảnh phẳng */
        ".preserve-3d": {
          transformStyle: "preserve-3d",
        },
        /* Ẩn mặt lưng của phần tử khi bị lật đi */
        ".backface-hidden": {
          backfaceVisibility: "hidden",
        },
        /* Trục xoay lật mặt thẻ 180 độ */
        ".rotate-y-180": {
          transform: "rotateY(180deg)",
        },
      });
    }),
  ],

}
export default config
