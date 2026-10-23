import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LunchHub',
  description: 'Workplace lunch management — canteen ordering, meal planner, kitchen display, delivery tracking',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
