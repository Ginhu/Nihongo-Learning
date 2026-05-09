/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#E63946',
        accent: '#F4A261'
      },
      fontFamily: {
        sans: [
          'system-ui', '-apple-system', 'BlinkMacSystemFont',
          '"Segoe UI"', 'Roboto', '"Hiragino Sans"',
          '"Noto Sans CJK JP"', 'sans-serif'
        ]
      }
    }
  },
  plugins: []
}
