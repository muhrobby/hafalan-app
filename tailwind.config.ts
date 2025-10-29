import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Figtree', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0f0ff',
          200: '#c7e0ff',
          300: '#9cc9ff',
          400: '#68b2ff',
          500: '#3b95ff',
          600: '#2271ff',
          700: '#1553e3',
          800: '#1542b8',
          900: '#163a93',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
