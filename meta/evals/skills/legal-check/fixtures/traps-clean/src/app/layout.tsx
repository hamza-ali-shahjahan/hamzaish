import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={inter.className}><body>{children}<a href="/dmca">DMCA</a></body></html>);
}
