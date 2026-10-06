// DIGI-TEXX Tailwind preset: module.exports = { presets: [require('./tailwind.preset.js')] }
module.exports = {
  theme: {
    extend: {
      colors: {
        dtx: {
          blue: '#2582D7', 'blue-hover': '#1A6FBF', navy: '#26385D', ocean: '#137BB6',
          sky: '#30AAE0', light: '#7BD2F2', ice: '#A8E5F5',
          lime: '#A5CB1F', amber: '#F6B71E', violet: '#9127D6',
          ink: '#231F20', gray: '#6E6F72',
          dark: '#1E1D23', 'surface-dark': '#26252C', 'border-dark': '#34333B',
          canvas: '#F0F0F0', border: '#E2E4E8', muted: '#B8BAC0',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        display: ['SVN-HemiHead', 'Chakra Petch', 'Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'dtx-bar': 'linear-gradient(90deg, #00ACEB 0%, #004EBE 100%)',
        'dtx-panel': 'linear-gradient(135deg, #00ACEB 0%, #0047BB 100%)',
        'dtx-cta': 'linear-gradient(90deg, #1A6FBF 0%, #004EBE 100%)',
        'dtx-logo': 'radial-gradient(circle, #1A489E 0%, #0D1120 100%)',
      },
      borderRadius: { dtx: '6px' },
    },
  },
};
