module.exports = {
  presets: [require('@spartan-ng/ui-core/hlm-tailwind-preset')],
  darkMode: ['class'],
  content: [
    "./src/**/*.{html,ts}",
    "./src/app/components/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        /* Override the CSS-var based primary with hard maroon */
        primary: {
          DEFAULT: '#831b1b',    /* deep maroon — school color */
          foreground: '#fafafa',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-150%)' },
          '100%': { transform: 'translateX(150%)' }
        }
      },
      animation: {
        'shimmer': 'shimmer 2.5s infinite ease-in-out'
      }
    },
  },
  plugins: [
    require('tailwindcss-primeui')
  ],
}
