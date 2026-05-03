import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'lichen',
  description: 'A warm, human habit tracker.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="warm" data-accent="terracotta" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
