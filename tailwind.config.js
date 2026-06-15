/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // tema "festa" portado do protótipo (styles.css legado)
        brand: {
          bg: '#0b4a3a',        // fundo do app (verde profundo)
          accent: '#2dd4bf',    // teal de destaque
          'accent-ink': '#063b34',
          panel: '#5b21b6',     // roxo dos painéis
          nav: '#4c1d95',
          sheet: '#2e1065',     // fundo do bottom-sheet
          header1: '#fb923c',   // gradiente do header
          header2: '#f97316',
          pink: '#ec4899',
        },
        // cores de status dos cromos (alinhadas com STATUS_META.tw)
        st: {
          got: '#16a34a',
          'got-2': '#15803d',
          dup: '#f59e0b',
          'dup-2': '#d97706',
          trade: '#7c5cff',
          'trade-2': '#6d28d9',
        },
      },
      fontFamily: {
        disp: ['"Barlow Condensed"', 'system-ui', 'sans-serif'],
        body: ['Barlow', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        app: '540px', // largura mobile-first do conteúdo (cap no desktop)
      },
    },
  },
  plugins: [],
};
