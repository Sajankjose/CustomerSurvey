import type { Metadata } from 'next';
import './globals.css';
import { tokens } from '@/lib/tokens';

export const metadata: Metadata = {
  title: 'Loan Closure Planner',
  description: 'A premium guided flow for planning loan closure.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          ['--color-bg' as string]: tokens.colors.bg,
          ['--color-accent' as string]: tokens.colors.accent,
          ['--color-text' as string]: tokens.colors.text,
          ['--color-secondary' as string]: tokens.colors.secondary,
          ['--color-helper' as string]: tokens.colors.helper,
          ['--color-hairline' as string]: tokens.colors.hairline,
          ['--radius-card' as string]: tokens.radii.card,
          ['--radius-input' as string]: tokens.radii.input,
          ['--radius-button' as string]: tokens.radii.button
        }}
      >
        {children}
      </body>
    </html>
  );
}
