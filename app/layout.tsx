import type { Metadata, Viewport } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: 'Tunisia Go · Explore Tunisia',
  description:
    'Interactive map, curated road trips and local know-how for Tunisia: Roman ruins, Sahara dunes, beaches, medinas and food.',
};

export const viewport: Viewport = {
  themeColor: '#FAF6F0',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Inter:wght@400;500;600;700&display=swap"
        />
        <style>{`:root{--font-serif:'Fraunces';--font-sans:'Inter';}`}</style>
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
