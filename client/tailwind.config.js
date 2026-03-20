/** @type {import('tailwindcss').Config} */
const c = (v) => ({ opacityValue }) =>
  opacityValue !== undefined
    ? `hsl(var(${v}) / ${opacityValue})`
    : `hsl(var(${v}))`;

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background:           c('--background'),
        foreground:           c('--foreground'),
        card:                 c('--card'),
        primary:              c('--primary'),
        'primary-foreground': c('--primary-foreground'),
        muted:                c('--muted'),
        'muted-foreground':   c('--muted-foreground'),
        border:               c('--border'),
        accent:               c('--accent'),
        'accent-foreground':  c('--accent-foreground'),
        input:                c('--input'),
        secondary:            c('--secondary'),
        'secondary-foreground': c('--secondary-foreground'),
        destructive:          c('--destructive'),
        'destructive-foreground': c('--destructive-foreground'),
      },
    },
  },
  plugins: [],
};
