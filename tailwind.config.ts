import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './domain/**/*.{ts,tsx}', './infrastructure/**/*.{ts,tsx}', './hooks/**/*.{ts,tsx}', './store/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        appBg: 'var(--color-bg)',
        appAccent: 'var(--color-accent)',
        appText: 'var(--color-text)',
        appSecondary: 'var(--color-secondary)',
        appHelper: 'var(--color-helper)',
        appHairline: 'var(--color-hairline)'
      },
      borderRadius: {
        card: 'var(--radius-card)',
        input: 'var(--radius-input)',
        button: 'var(--radius-button)'
      }
    }
  },
  plugins: []
};

export default config;
