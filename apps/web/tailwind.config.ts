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
        // Vansha — Forest & Ocean palette with Golden accents
        'primary':                    '#1b4332',   // Deep Forest Green
        'on-primary':                 '#ffffff',
        'primary-container':          '#40916c',   // Sage Green
        'on-primary-container':       '#f0fdf4',
        'primary-fixed':              '#d8f3dc',   // Mint
        'primary-fixed-dim':          '#b7e4c7',
        'on-primary-fixed':           '#0d2818',
        'on-primary-fixed-variant':   '#2d6a4f',
        'inverse-primary':            '#74c69d',

        'secondary':                  '#1e3a5f',   // Deep Ocean Blue
        'on-secondary':               '#ffffff',
        'secondary-container':        '#2e86c1',   // Sky Blue
        'on-secondary-container':     '#eaf4fc',
        'secondary-fixed':            '#d6eaf8',   // Light Blue
        'secondary-fixed-dim':        '#aed6f1',
        'on-secondary-fixed':         '#0a1e38',
        'on-secondary-fixed-variant': '#1a4f7a',

        'tertiary':                   '#92400e',   // Amber/Gold
        'on-tertiary':                '#ffffff',
        'tertiary-container':         '#d97706',   // Golden Amber
        'on-tertiary-container':      '#fff8e7',
        'tertiary-fixed':             '#fef3c7',   // Soft Yellow
        'tertiary-fixed-dim':         '#fde68a',
        'on-tertiary-fixed':          '#3d2000',
        'on-tertiary-fixed-variant':  '#7c3a0e',

        'surface':                    '#f8fffb',
        'surface-dim':                '#c3e2cc',
        'surface-bright':             '#f8fffb',
        'surface-container-lowest':   '#ffffff',
        'surface-container-low':      '#eef7f2',
        'surface-container':          '#e3f0e8',
        'surface-container-high':     '#d4e8da',
        'surface-container-highest':  '#c5e0cd',
        'surface-variant':            '#daeee2',
        'surface-tint':               '#2d6a4f',

        'on-surface':                 '#0d2218',
        'on-surface-variant':         '#3a5443',
        'inverse-surface':            '#1a2e22',
        'inverse-on-surface':         '#eef7f2',

        'outline':                    '#587862',
        'outline-variant':            '#b0cdb8',

        'v-error':                    '#dc2626',
        'on-error':                   '#ffffff',
        'error-container':            '#fee2e2',
        'on-error-container':         '#7f1d1d',

        'background':                 '#f0fdf4',   // Green-50
        'on-background':              '#0d2218',

        // Generation palette for tree visualization
        'gen-0':  '#1b4332',   // deep green
        'gen-1':  '#1e3a5f',   // deep blue
        'gen-2':  '#0f766e',   // teal
        'gen-3':  '#92400e',   // amber
        'gen-4':  '#4a1d96',   // purple
        'gen-5':  '#065f46',   // emerald
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
        'archival':    '0 4px 20px rgba(27, 67, 50, 0.08)',
        'archival-lg': '0 12px 40px rgba(27, 67, 50, 0.12)',
        'archival-xl': '0 20px 60px rgba(27, 67, 50, 0.16)',
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
