import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tunisia Go',
    short_name: 'Tunisia Go',
    description: 'Map, road trips and local know-how for Tunisia, available offline once saved.',
    start_url: '/explore',
    scope: '/',
    display: 'standalone',
    background_color: '#FAF6F0',
    theme_color: '#FAF6F0',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
