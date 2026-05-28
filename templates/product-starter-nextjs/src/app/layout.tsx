import type { Metadata } from 'next';
import Script from 'next/script';
import { env } from '@/lib/env';
import './globals.css';

export const metadata: Metadata = {
  title: { default: env.NEXT_PUBLIC_APP_NAME, template: `%s — ${env.NEXT_PUBLIC_APP_NAME}` },
  description: '{{ONE_LINER}}',
  metadataBase: new URL(env.NEXT_PUBLIC_APP_URL),
  openGraph: {
    type: 'website',
    siteName: env.NEXT_PUBLIC_APP_NAME,
    title: env.NEXT_PUBLIC_APP_NAME,
    description: '{{ONE_LINER}}',
  },
  twitter: { card: 'summary_large_image' },
  verification: env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { google: env.NEXT_PUBLIC_GSC_VERIFICATION }
    : undefined,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {env.NEXT_PUBLIC_GA4_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${env.NEXT_PUBLIC_GA4_MEASUREMENT_ID}');
            `}</Script>
          </>
        )}
        {env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
