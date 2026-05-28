import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hamzaish — Portfolio',
  description: 'Telemetry across the 10-product startup factory.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
