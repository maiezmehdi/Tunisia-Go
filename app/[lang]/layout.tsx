import type { Metadata, Viewport } from 'next';

import { notFound } from 'next/navigation';

import CookieConsent from '@/components/CookieConsent';
import ServiceWorker from '@/components/ServiceWorker';
import { LOCALES, isLocale } from '@/lib/i18n/config';
import { LocaleProvider } from '@/lib/i18n/LocaleProvider';
import { MyTripProvider } from '@/lib/myTrip';
import { SoundProvider } from '@/lib/sound';

import '../globals.css';

// Both languages are prerendered; middleware.ts picks one per visitor.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const fr = lang !== 'en';
  return {
    title: fr ? 'Tunisia Go · Explorer la Tunisie' : 'Tunisia Go · Explore Tunisia',
    description: fr
      ? 'Carte interactive, road trips choisis et conseils locaux pour la Tunisie : ruines romaines, dunes du Sahara, plages, médinas et cuisine.'
      : 'Interactive map, curated road trips and local know-how for Tunisia: Roman ruins, Sahara dunes, beaches, medinas and food.',
    appleWebApp: { capable: true, title: 'Tunisia Go', statusBarStyle: 'default' },
    icons: { icon: '/icons/icon-192.png', apple: '/icons/apple-touch-icon.png' },
  };
}

export const viewport: Viewport = {
  themeColor: '#FAF6F0',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html lang={lang}>
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
      <body className="font-sans antialiased">
        <LocaleProvider locale={lang}>
          <SoundProvider>
            <MyTripProvider>
              {children}
              <CookieConsent />
            </MyTripProvider>
          </SoundProvider>
        </LocaleProvider>
        <ServiceWorker />
      </body>
    </html>
  );
}
