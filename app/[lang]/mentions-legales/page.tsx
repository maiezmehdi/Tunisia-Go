import type { Metadata } from 'next';

import BrandLogo from '@/components/BrandLogo';
import LanguageSwitch from '@/components/LanguageSwitch';
import SoundToggle from '@/components/SoundToggle';
import MadeBy from '@/components/MadeBy';
import { LEGAL } from '@/lib/legal';
import { isLocale, type Locale } from '@/lib/i18n/config';
import { pageMetadata, localePath } from '@/lib/seo';

type Section = { title: string; body: string[] };

const COPY: Record<
  Locale,
  {
    metaTitle: string;
    brandTag: string;
    backToMap: string;
    title: string;
    updated: string;
    sections: Section[];
  }
> = {
  fr: {
    metaTitle: 'Mentions légales et conditions d’utilisation · Tunisia Go',
    brandTag: 'Mentions légales',
    backToMap: 'Retour à la carte',
    title: 'Mentions légales et conditions d’utilisation',
    updated: 'Mise à jour : novembre 2026',
    sections: [
      {
        title: 'Éditeur du site',
        body: ['Le site tunisiagoo.com (Tunisia Go) est édité par Mehdi Maiez. Contact : contact@tunisiagoo.com.'],
      },
      {
        title: 'Hébergement',
        body: [
          'Le site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis. Les données des comptes, des propositions de lieux et des notes sont stockées dans l’Union européenne chez Supabase (Francfort). Voir la page Confidentialité et cookies.',
        ],
      },
      {
        title: 'Ce qu’est Tunisia Go',
        body: [
          'Tunisia Go est un guide de voyage indépendant : une carte, des fiches de lieux, des road trips et des conseils pratiques sur la Tunisie. Le site ne vend aucun voyage, n’organise aucun séjour et ne prend aucune réservation. Il n’est lié à aucun organisme officiel.',
        ],
      },
      {
        title: 'Informations indicatives',
        body: [
          'Les textes, distances, durées, saisons et conseils sont donnés à titre indicatif, avec le plus grand soin, mais ils peuvent changer ou comporter des erreurs. Vérifiez les horaires, les accès, les tarifs et les conditions de sécurité avant de partir, notamment pour la route, le désert et les zones proches des frontières. Si vous voyez une erreur, le lien « Signaler une erreur » des fiches ou contact@tunisiagoo.com nous permet de la corriger.',
          'Les durées et distances des road trips sont des estimations. L’assistant de voyage rédige ses réponses à partir des contenus du site, avec l’aide d’une intelligence artificielle : il peut se tromper et ne remplace ni un professionnel du voyage, ni les consignes des autorités.',
        ],
      },
      {
        title: 'Guides, agences et partenaires',
        body: [
          'Les fiches de guides, d’agences et de partenaires sont renseignées par les personnes concernées. Tunisia Go ne vérifie pas leurs qualifications, leurs tarifs ni leurs services : la mention « carte professionnelle déclarée » indique seulement qu’un numéro a été donné, sans contrôle officiel. Les prestations sont conclues directement entre vous et le professionnel, sans que Tunisia Go en soit partie ni responsable. Les hébergements classés ONTT et les agences agréées viennent de l’annuaire officiel de l’ONTT ; vérifiez toujours leur situation auprès de l’organisme.',
          'Tout contenu commercial ou sponsorisé, s’il en existe, est signalé comme tel.',
        ],
      },
      {
        title: 'Contenus que vous envoyez',
        body: [
          'Quand vous proposez un lieu, une photo, un road trip, un événement ou une fiche, vous confirmez en être l’auteur ou avoir le droit de l’envoyer, et vous nous autorisez à l’afficher sur Tunisia Go en vous créditant si vous le souhaitez. Nous relisons les propositions et pouvons refuser ou retirer tout contenu inexact, illicite, offensant ou qui expose un lieu fragile ou privé. Vous pouvez demander le retrait de votre contenu à tout moment.',
          'N’envoyez pas de contenu qui porte atteinte aux droits d’autrui ou à la vie privée de personnes identifiables.',
        ],
      },
      {
        title: 'Comptes',
        body: [
          'Un compte est personnel. Vous êtes responsable de votre mot de passe et des informations que vous publiez. Vous pouvez supprimer votre compte à tout moment depuis la page « Mon compte ».',
        ],
      },
      {
        title: 'Propriété intellectuelle',
        body: [
          'Les textes, la mise en page, la carte et le logo de Tunisia Go sont protégés. Les photos viennent de Wikimedia Commons ou de contributeurs, et restent soumises à leurs licences et à leurs auteurs, indiqués sur les fiches. Vous pouvez partager un lien vers le site librement ; toute autre reproduction nécessite notre accord écrit.',
        ],
      },
      {
        title: 'Liens vers d’autres sites',
        body: [
          'Le site renvoie vers des services extérieurs (hébergement, réservation, itinéraires, réseaux sociaux). Nous ne contrôlons pas leur contenu et ne sommes pas responsables de leurs conditions.',
        ],
      },
      {
        title: 'Responsabilité',
        body: [
          'Tunisia Go s’efforce de garder le site accessible et à jour, sans garantie de disponibilité continue ni d’exactitude absolue. L’éditeur ne peut être tenu responsable des dommages liés à l’usage des informations du site, ni des services de tiers mentionnés. Les voyages se font sous votre responsabilité.',
        ],
      },
      {
        title: 'Droit applicable',
        body: [
          'Ces conditions sont régies par le droit tunisien. En cas de litige, et à défaut d’accord amiable, les tribunaux tunisiens sont compétents, sans priver un consommateur des règles impératives de protection de son pays de résidence.',
        ],
      },
      {
        title: 'Données personnelles',
        body: [
          'Voir la page Confidentialité et cookies pour ce que nous collectons, pourquoi, et comment exercer vos droits : /confidentialite.',
        ],
      },
      {
        title: 'Modifications',
        body: [
          'Ces conditions peuvent évoluer. La date de mise à jour figure en haut de cette page. Pour toute question : contact@tunisiagoo.com.',
        ],
      },
    ],
  },
  en: {
    metaTitle: 'Legal notice and terms of use · Tunisia Go',
    brandTag: 'Legal notice',
    backToMap: 'Back to the map',
    title: 'Legal notice and terms of use',
    updated: 'Updated November 2026',
    sections: [
      {
        title: 'Publisher',
        body: ['The site tunisiagoo.com (Tunisia Go) is published by Mehdi Maiez. Contact: contact@tunisiagoo.com.'],
      },
      {
        title: 'Hosting',
        body: [
          'The site is hosted by Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA. Account data, suggested places and ratings are stored in the European Union with Supabase (Frankfurt). See the Privacy and cookies page.',
        ],
      },
      {
        title: 'What Tunisia Go is',
        body: [
          'Tunisia Go is an independent travel guide: a map, place pages, road trips and practical advice about Tunisia. The site does not sell trips, organise stays or take bookings. It is not linked to any official body.',
        ],
      },
      {
        title: 'Indicative information',
        body: [
          'Texts, distances, durations, seasons and advice are given in good faith for guidance, but they can change or contain errors. Check opening hours, access, prices and safety conditions before you go, especially for roads, the desert and areas near borders. If you spot a mistake, the “Report an error” link on place pages or contact@tunisiagoo.com lets us fix it.',
          'Road trip durations and distances are estimates. The travel assistant writes its answers from the site’s content with the help of artificial intelligence: it can be wrong and does not replace a travel professional or official guidance.',
        ],
      },
      {
        title: 'Guides, agencies and partners',
        body: [
          'Listings for guides, agencies and partners are filled in by the people concerned. Tunisia Go does not check their qualifications, prices or services: “professional card declared” only means a number was given, without official checking. Services are agreed directly between you and the professional; Tunisia Go is neither a party to them nor responsible for them. ONTT-classified lodgings and approved agencies come from the official ONTT directory; always check their status with the authority.',
          'Any commercial or sponsored content, if there is any, is labelled as such.',
        ],
      },
      {
        title: 'Content you send',
        body: [
          'When you suggest a place, photo, road trip, event or listing, you confirm that you are its author or have the right to send it, and you allow us to display it on Tunisia Go, crediting you if you wish. We review suggestions and may refuse or remove any content that is inaccurate, unlawful, offensive, or that exposes a fragile or private place. You can ask us to remove your content at any time.',
          'Do not send content that infringes the rights of others or the privacy of identifiable people.',
        ],
      },
      {
        title: 'Accounts',
        body: [
          'An account is personal. You are responsible for your password and for what you publish. You can delete your account at any time from the “My account” page.',
        ],
      },
      {
        title: 'Intellectual property',
        body: [
          'The texts, layout, map and logo of Tunisia Go are protected. Photos come from Wikimedia Commons or from contributors and remain subject to their licences and authors, credited on the pages. You may link to the site freely; any other reproduction needs our written consent.',
        ],
      },
      {
        title: 'Links to other sites',
        body: [
          'The site links to outside services (lodging, booking, directions, social networks). We do not control their content and are not responsible for their terms.',
        ],
      },
      {
        title: 'Liability',
        body: [
          'Tunisia Go does its best to keep the site available and up to date, without guaranteeing continuous availability or absolute accuracy. The publisher cannot be held liable for damage linked to the use of the information on the site or to the third-party services mentioned. You travel at your own risk.',
        ],
      },
      {
        title: 'Governing law',
        body: [
          'These terms are governed by Tunisian law. In case of a dispute, and failing an amicable settlement, the Tunisian courts have jurisdiction, without depriving a consumer of the mandatory protection rules of their country of residence.',
        ],
      },
      {
        title: 'Personal data',
        body: [
          'See the Privacy and cookies page for what we collect, why, and how to exercise your rights: /confidentialite.',
        ],
      },
      {
        title: 'Changes',
        body: [
          'These terms may change. The update date is shown at the top of this page. Any question: contact@tunisiagoo.com.',
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
    path: '/mentions-legales',
    title: COPY[lang].metaTitle,
    description:
      lang === 'en'
        ? 'Who publishes Tunisia Go, who hosts it, and the terms of use of the travel guide.'
        : 'Qui édite Tunisia Go, qui l’héberge, et les conditions d’utilisation du guide de voyage.',
  });
}

export default async function LegalPage({ params }: Params) {
  const lang = await localeOf(params);
  const c = COPY[lang];
  const lp = (path: string) => localePath(path, lang);
  const fr = lang === 'fr';
  // Only what has been filled in lib/legal.ts is shown.
  const details: [string, string][] = [];
  if (LEGAL.legalForm) details.push([fr ? 'Statut' : 'Status', LEGAL.legalForm]);
  if (LEGAL.registration) details.push([fr ? 'Immatriculation' : 'Registration', LEGAL.registration]);
  if (LEGAL.address) details.push([fr ? 'Adresse' : 'Address', LEGAL.address]);
  return (
    <main className="min-h-dvh bg-cream text-charcoal">
      <header className="border-b border-sand-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <BrandLogo tag={c.brandTag} size={40} compact />
          <div className="flex items-center gap-3 sm:gap-5">
            <span className="hidden sm:inline-flex">
              <SoundToggle />
            </span>
            <LanguageSwitch />
            <a
              href={lp('/explore')}
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
        {details.length > 0 && (
          <dl className="mt-8 max-w-2xl divide-y divide-sand-200 rounded-2xl border border-sand-200 text-[15px]">
            {details.map(([k, v]) => (
              <div key={k} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:gap-6">
                <dt className="w-44 shrink-0 text-charcoal-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
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
