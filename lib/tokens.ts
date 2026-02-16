export const tokens = {
  colors: {
    bg: '#FFFFFF',
    accent: '#07877B',
    text: '#1C1C1C',
    secondary: '#6F6F6F',
    helper: '#A0A0A0',
    hairline: '#F2F2F2'
  },
  typography: {
    family: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
    display: 'text-[32px] leading-[1.1] font-semibold',
    h2: 'text-[24px] leading-[1.2] font-semibold',
    h3: 'text-[20px] leading-[1.3] font-semibold',
    body: 'text-[16px] leading-[1.6] font-normal',
    small: 'text-[14px] leading-[1.5] font-normal'
  },
  radii: {
    card: '28px',
    input: '28px',
    button: '26px'
  },
  spacing: {
    page: '24px',
    section: '24px'
  },
  motion: {
    ease: [0, 0, 0.2, 1] as const,
    screenTransition: 0.32,
    tooltip: 0.2,
    buttonPress: 0.14,
    selection: 0.2,
    graphLoad: 1,
    graphTabSwitch: 0.8
  }
} as const;
