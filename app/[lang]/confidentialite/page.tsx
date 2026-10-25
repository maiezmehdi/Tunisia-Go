import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import SoundToggle from '@/components/SoundToggle';
import MadeBy from '@/components/MadeBy';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { pageMetadata } from '@/lib/seo';

type Section = { title: string; body: string[] };

const COPY: Record<
  Locale,
  { metaTitle: string; brandTag: string; backToMap: string; title: string; updated: string; sections: Section[] }
> = {
  fr: {
    metaTitle: 'Confidentialité et cookies · Tunisia Go',
    brandTag: 'Confidentialité',
    backToMap: 'Retour à la carte',
    title: 'Confidentialité et cookies',
    updated: 'Mise à jour : octobre 2026',
    sections: [
      {
        title: 'Qui est responsable',
        body: [
          'Tunisia Go est édité par Mehdi Maiez. Pour toute question sur vos données, ou pour en demander l’accès, la correction ou la suppression, écrivez-nous via mehdimaiez.com.',
        ],
      },
      {
        title: 'Les lieux que vous proposez',
        body: [
          'Quand vous proposez un lieu, nous enregistrons ce que vous saisissez (nom du lieu, région, position, description, prénom et contact si vous les donnez) et vos photos. Les photos sont réduites et leurs métadonnées, dont la position GPS, sont supprimées dans votre navigateur avant l’envoi.',
          'Ces données servent uniquement à relire la proposition et, si elle est retenue, à l’ajouter à la carte en vous créditant par votre prénom. Elles sont hébergées dans l’Union européenne (Supabase, Francfort). Votre contact n’est jamais publié. Les propositions non retenues sont supprimées au bout de 12 mois.',
        ],
      },
      {
        title: 'Les guides et agences inscrits',
        body: [
          'Si vous vous inscrivez comme guide ou agence, nous enregistrons votre nom, votre numéro WhatsApp, le numéro de votre carte professionnelle (facultatif) et vos réseaux sociaux. Votre nom et votre numéro WhatsApp sont affichés publiquement sur la page Guides et agences, avec votre accord explicite donné dans le formulaire. Le numéro de carte n’est jamais publié : la fiche indique seulement « carte professionnelle déclarée », sans que Tunisia Go l’ait vérifiée officiellement.',
          'La connexion se fait par un lien envoyé à votre adresse e-mail, via le service d’authentification de Supabase : il enregistre cette adresse pour vous reconnaître, et nous ne la publions pas. Vous pouvez ainsi modifier ou retirer votre fiche à tout moment ; le retrait supprime votre fiche. Les données sont hébergées dans l’Union européenne (Supabase, Francfort).',
        ],
      },
      {
        title: 'Les notes sur les lieux',
        body: [
          'Vous pouvez noter un lieu de 1 à 5 étoiles, sans créer de compte. Pour qu’une personne ne vote qu’une fois par lieu, nous calculons une empreinte chiffrée de votre adresse IP avec une clé secrète. L’adresse IP elle-même n’est pas enregistrée, et l’empreinte ne permet pas de la retrouver.',
          'Nous gardons seulement cette empreinte, le lieu et votre note, hébergés dans l’Union européenne (Supabase, Francfort). Votre note est aussi mémorisée dans votre navigateur (tg-rating-…) pour afficher votre choix.',
        ],
      },
      {
        title: 'Mesure d’audience',
        body: [
          'Avec votre accord seulement, nous mesurons les visites (pages vues, lieux et road trips consultés, type d’appareil, pays) avec PostHog, hébergé dans l’Union européenne. Cela nous aide à savoir quels contenus vous sont utiles. Aucune donnée n’est vendue ni utilisée pour de la publicité.',
          'Si vous refusez, aucun outil de mesure n’est chargé. Votre choix est conservé 6 mois, et vous pouvez le changer à tout moment avec le lien « Cookies » en bas de chaque page.',
        ],
      },
      {
        title: 'Ce qui est stocké sur votre appareil',
        body: [
          'tg-lang : la langue choisie. tg-consent : votre choix sur les cookies. Les road trips enregistrés pour le hors-ligne sont gardés dans votre navigateur et ne nous sont pas envoyés. Si vous acceptez la mesure d’audience, PostHog dépose ses propres cookies (ph_…).',
          'tg-my-trip : les étapes de « Mon voyage ». tg-assistant : la conversation avec l’assistant de voyage, effacée quand vous fermez l’onglet.',
        ],
      },
      {
        title: 'L’assistant de voyage',
        body: [
          'L’assistant en bas à droite n’est pas une intelligence artificielle en ligne. Il fonctionne entièrement dans votre navigateur et répond à partir des contenus du site (lieux, road trips, cahiers pratiques, mots du cru). Ce que vous y écrivez ne nous est pas envoyé et n’est transmis à aucun service.',
        ],
      },
      {
        title: 'Vos droits',
        body: [
          'Vous pouvez demander l’accès à vos données, leur correction, leur suppression ou vous opposer à leur traitement. Vous pouvez aussi saisir l’autorité de protection des données de votre pays (la CNIL en France, l’INPDP en Tunisie).',
        ],
      },
    ],
  },
  en: {
    metaTitle: 'Privacy and cookies · Tunisia Go',
    brandTag: 'Privacy',
    backToMap: 'Back to the map',
    title: 'Privacy and cookies',
    updated: 'Updated October 2026',
    sections: [
      {
        title: 'Who is responsible',
        body: [
          'Tunisia Go is published by Mehdi Maiez. For any question about your data, or to ask for access, correction or deletion, contact us through mehdimaiez.com.',
        ],
      },
      {
        title: 'Places you suggest',
        body: [
          'When you suggest a place, we store what you type (name of the place, area, location, description, first name and contact if you give them) and your photos. Photos are resized and their metadata, including GPS location, is removed in your browser before upload.',
          'This is only used to review the suggestion and, if it is accepted, to add it to the map with your first name as credit. It is hosted in the European Union (Supabase, Frankfurt). Your contact details are never published. Suggestions that are not kept are deleted after 12 months.',
        ],
      },
      {
        title: 'Registered guides and agencies',
        body: [
          'If you register as a guide or agency, we store your name, your WhatsApp number, your professional card number (optional) and your social networks. Your name and WhatsApp number are shown publicly on the Guides and agencies page, with the explicit consent you give in the form. The card number is never published: the listing only says “professional card declared”, which Tunisia Go has not officially checked.',
          'Sign-in uses a link sent to your e-mail address, through Supabase’s authentication service: it stores that address to recognise you, and we do not publish it. You can change or remove your listing at any time; removing it deletes the listing. The data is hosted in the European Union (Supabase, Frankfurt).',
        ],
      },
      {
        title: 'Ratings on places',
        body: [
          'You can rate a place from 1 to 5 stars without creating an account. So that one person votes only once per place, we compute an encrypted fingerprint of your IP address with a secret key. The IP address itself is not stored, and the fingerprint cannot be turned back into it.',
          'We keep only that fingerprint, the place and your rating, hosted in the European Union (Supabase, Frankfurt). Your rating is also remembered in your browser (tg-rating-…) to show your choice.',
        ],
      },
      {
        title: 'Audience measurement',
        body: [
          'Only with your consent, we measure visits (pages viewed, places and road trips opened, device type, country) with PostHog, hosted in the European Union. It tells us which content is useful. No data is sold or used for advertising.',
          'If you decline, no measurement tool is loaded. Your choice is kept for 6 months, and you can change it at any time with the “Cookies” link at the bottom of every page.',
        ],
      },
      {
        title: 'What is stored on your device',
        body: [
          'tg-lang: your language. tg-consent: your cookie choice. Road trips saved for offline use stay in your browser and are not sent to us. If you accept audience measurement, PostHog sets its own cookies (ph_…).',
          'tg-my-trip: the stops of “My trip”. tg-assistant: your conversation with the travel assistant, erased when you close the tab.',
        ],
      },
      {
        title: 'The travel assistant',
        body: [
          'The assistant in the bottom-right corner is not an online artificial intelligence. It runs entirely in your browser and answers from the site’s own content (places, road trips, practical guides, local words). What you type is not sent to us or to any other service.',
        ],
      },
      {
        title: 'Your rights',
        body: [
          'You can ask for access to your data, its correction or deletion, or object to its processing. You can also contact the data protection authority of your country (CNIL in France, INPDP in Tunisia).',
        ],
      },
    ],
  },
};

type Params = { params: Promise<{ lang: string }> };

async function localeOf(params: Params['params']): Promise<Locale> {
  const { lang } = await params;
  return isLocale(lang) ? lang : 'fr';
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const lang = await localeOf(params);
  return pageMetadata({
    lang,
    path: '/confidentialite',
    title: COPY[lang].metaTitle,
    description:
      lang === 'en'
        ? 'What Tunisia Go collects, why, and how to have it removed: suggested places, photos and audience statistics.'
        : 'Ce que Tunisia Go collecte, pourquoi, et comment le faire supprimer : lieux proposés, photos et statistiques.',
  });
}

export default async function PrivacyPage({ params }: Params) {
  const c = COPY[await localeOf(params)];
  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-5">
            <SoundToggle />
            <LanguageSwitch />
            <a
              href="/explore"
              className="text-sm text-charcoal-500 underline-offset-4 transition hover:text-charcoal hover:underline"
            >
              {c.backToMap}
            </a>
          </div>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-4 pb-24 pt-12 sm:px-6">
        <h1 className="font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl">{c.title}</h1>
        <p className="mt-3 text-sm text-charcoal-300">{c.updated}</p>
        {c.sections.map((s) => (
          <section key={s.title} className="mt-10 border-t border-sand-200 pt-6">
            <h2 className="font-serif text-2xl">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 24)} className="mt-3 max-w-2xl text-[15px] leading-relaxed text-charcoal-700">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
      <footer className="border-t border-sand-200">
        <MadeBy className="mx-auto max-w-3xl px-4 py-6 sm:px-6" />
      </footer>
    </main>
  );
}
