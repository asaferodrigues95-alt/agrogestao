/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta "Feira" — verde-mata (folhas), terra (cesto de palha), painço (milho/banana).
        feira: {
          bg: '#f6f3ea',          // fundo claro, papel-manilha
          bgDark: '#12231c',      // fundo escuro, verde-mata profundo
          surface: '#ffffff',
          surfaceDark: '#1b3428',
          primary: '#0f3d2e',     // verde-mata — marca / navegação
          primaryLight: '#1f6b4f',
          accent: '#d98e3c',      // painço/milho — destaque de marca (não terracota genérico)
          entrada: '#1f8a4c',     // verde — entradas
          saida: '#c0392b',       // vermelho — saídas
          info: '#25636b',        // azul petróleo — informações
          alerta: '#d9a441',      // amarelo — alertas
          borda: '#e2ddcd',
          bordaDark: '#2a4a3a'
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 3px rgba(15, 61, 46, 0.08), 0 1px 2px rgba(15,61,46,0.06)'
      }
    }
  },
  plugins: []
}
