import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Heritage Design System — Vansha Lineage
        'primary':                    '#181512',
        'on-primary':                 '#ffffff',
        'primary-container':          '#2d2926',
        'on-primary-container':       '#96908b',
        'primary-fixed':              '#e9e1dc',
        'primary-fixed-dim':          '#cdc5c0',
        'on-primary-fixed':           '#1e1b18',
        'on-primary-fixed-variant':   '#4b4642',
        'inverse-primary':            '#cdc5c0',

        'secondary':                  '#506354',
        'on-secondary':               '#ffffff',
        'secondary-container':        '#cfe5d3',
        'on-secondary-container':     '#546759',
        'secondary-fixed':            '#d2e8d6',
        'secondary-fixed-dim':        '#b6ccba',
        'on-secondary-fixed':         '#0d1f14',
        'on-secondary-fixed-variant': '#384b3e',

        'tertiary':                   '#280e00',
        'on-tertiary':                '#ffffff',
        'tertiary-container':         '#42210a',
        'on-tertiary-container':      '#b78668',
        'tertiary-fixed':             '#ffdbc8',
        'tertiary-fixed-dim':         '#f2bb9a',
        'on-tertiary-fixed':          '#301401',
        'on-tertiary-fixed-variant':  '#643e25',

        'surface':                    '#fbf9f7',
        'surface-dim':                '#dbdad8',
        'surface-bright':             '#fbf9f7',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#f5f3f1',
        'surface-container':          '#efedec',
        'surface-container-high':     '#eae8e6',
        'surface-container-highest':  '#e4e2e0',
        'surface-variant':            '#e4e2e0',
        'surface-tint':               '#635d5a',

        'on-surface':                 '#1b1c1b',
        'on-surface-variant':         '#4d4540',
        'inverse-surface':            '#30302f',
        'inverse-on-surface':         '#f2f0ee',

        'outline':                    '#7e756f',
        'outline-variant':            '#cfc4bd',

        'v-error':                    '#ba1a1a',
        'on-error':                   '#ffffff',
        'error-container':            '#ffdad6',
        'on-error-container':         '#93000a',

        'background':                 '#fbf9f7',
        'on-background':              '#1b1c1b',
      },
      fontFamily: {
        'serif':   ['"Libre Caslon Text"', 'Georgia', 'serif'],
        'sans':    ['Inter', 'system-ui', 'sans-serif'],
        'display': ['"Libre Caslon Text"', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-lg':        ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '400' }],
        'display-lg-mobile': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-lg':       ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'headline-md':       ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'body-lg':           ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':           ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md':          ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
        'caption':           ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      boxShadow: {
        'archival':    '0 4px 20px rgba(45, 41, 38, 0.05)',
        'archival-lg': '0 12px 40px rgba(45, 41, 38, 0.08)',
        'archival-xl': '0 20px 60px rgba(45, 41, 38, 0.12)',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'shake':      'shake 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97) both',
        'spin-slow':  'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        shake: {
          '10%, 90%':       { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%':       { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%':  { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%':       { transform: 'translate3d(4px, 0, 0)' },
        },
      },
      borderRadius: {
        'brand': '12px',
      },
    },
  },
  plugins: [],
}
export default config
