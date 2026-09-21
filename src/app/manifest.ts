import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site';

export const dynamic = 'force-static';

/** Web app manifest, so the converter can be added to a phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.defaultTitle,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#171717',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  };
}
