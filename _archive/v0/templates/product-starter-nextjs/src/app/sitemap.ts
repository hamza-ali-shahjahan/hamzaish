import type { MetadataRoute } from 'next';
import { env } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_APP_URL;
  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), priority: 0.8 },
    { url: `${base}/waitlist`, lastModified: new Date(), priority: 0.6 },
  ];
}
