'use client';

import { useRef, useState } from 'react';

import ProProfileFields, { type ProProfile } from '@/components/ProProfileFields';
import ProSteps, { PRO_STEP_LABELS } from '@/components/ProSteps';

import { BIO_MAX, EXPERIENCE_MAX } from '@/lib/pros';
import { useLocale } from '@/lib/i18n/LocaleProvider';

const COPY = {
  fr: {
    status: 'Votre statut',
    guide: 'Guide indépendant',
    agency: 'Agence',
    name: { guide: 'Votre nom', agency: 'Nom de l’agence' },
    whatsapp: 'Numéro WhatsApp',
    whatsappHint: 'Avec l’indicatif du pays, par exemple +216 …',
    card: 'Numéro de carte professionnelle de guide',
    cardHint:
      'Facultatif. Avec la carte, votre fiche est publiée tout de suite. Sans carte, nous la vérifions d’abord à la main.',
    socials: 'Réseaux sociaux ou site',
    socialsHint: 'Instagram, Facebook ou site web. Nous vérifions la fiche avant de la publier.',
    consent:
      'J’accepte que mon nom et mon numéro WhatsApp soient affichés publiquement sur Tunisia Go, pour que les voyageurs puissent me contacter.',
    next: 'Continuer',
    back: 'Retour',
    send: 'Envoyer',
    sending: 'Envoi…',
    changeHint: 'Vous pourrez modifier ou retirer votre fiche à tout moment en vous connectant à votre compte.',
    exists: 'Ce numéro ou ce compte est déjà inscrit.',
    expired: 'Votre connexion a expiré. Reconnectez-vous.',
    published: 'Merci, votre fiche est publiée. Elle apparaît comme « carte déclarée ».',
    pending: 'Merci, c’est reçu. Nous vérifions votre fiche avant de la publier.',
    seeList: 'Voir les guides et agences',
    invalid: 'Vérifiez votre nom et votre numéro WhatsApp (avec l’indicatif du pays).',
    invalidCard: 'Ce numéro de carte ne semble pas valide. Corrigez-le ou laissez le champ vide.',
    needSocials: 'Indiquez au moins un réseau social ou un site.',
    needConsent: 'Cochez la case pour autoriser l’affichage.',
    tooMany: 'Trop d’envois pour le moment. Réessayez plus tard.',
    failed: 'L’envoi n’a pas abouti. Réessayez dans un instant.',
  },
  en: {
    status: 'Your status',
    guide: 'Independent guide',
    agency: 'Agency',
    name: { guide: 'Your name', agency: 'Agency name' },
    whatsapp: 'WhatsApp number',
    whatsappHint: 'With the country code, for example +216 …',
    card: 'Professional guide card number',
    cardHint: 'Optional. With the card, your listing is published right away. Without it, we check it by hand first.',
    socials: 'Social networks or website',
    socialsHint: 'Instagram, Facebook or a website. We check the listing before publishing it.',
    consent: 'I agree that my name and WhatsApp number are shown publicly on Tunisia Go, so travellers can contact me.',
    next: 'Continue',
    back: 'Back',
    send: 'Send',
    sending: 'Sending…',
    changeHint: 'You can change or remove your listing at any time by signing in to your account.',
    exists: 'This number or this account is already registered.',
    expired: 'Your sign-in has expired. Please sign in again.',
    published: 'Thank you, your listing is published. It appears as “card declared”.',
    pending: 'Thank you, we have it. We check your listing before publishing it.',
    seeList: 'See guides and agencies',
    invalid: 'Check your name and your WhatsApp number (with the country code).',
    invalidCard: 'This card number does not look valid. Correct it or leave the field empty.',
    needSocials: 'Give at least one social network or website.',
    needConsent: 'Tick the box to allow the listing to be shown.',
    tooMany: 'Too many submissions for now. Please try again later.',
    failed: 'Sending did not work. Please try again in a moment.',
  },
} as const;

const field =
  'mt-1.5 w-full rounded-2xl border border-sand-200 bg-white px-4 py-2.5 text-[15px] text-charcoal outline-none transition placeholder:text-charcoal-300 focus:border-charcoal';

/** Steps 2 to 4 of the sign-up (the account is step 1): status and contact, profile, then consent and send. */
export default function ProSignup({ accessToken, onExpired }: { accessToken: string; onExpired: () => void }) {
  const { locale } = useLocale();
  const c = COPY[locale];
  const openedAt = useRef(Date.now());
  const [kind, setKind] = useState<'guide' | 'agency'>('guide');
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [card, setCard] = useState('');
  const [socials, setSocials] = useState('');
  const [consent, setConsent] = useState(false);
  const [profile, setProfile] = useState<ProProfile>({
    bio: '',
    experience: '',
    languages: [],
    activities: [],
    priceNote: '',
    placeId: '',
    photoPath: '',
    photoUrl: '',
  });
  const [state, setState] = useState<'idle' | 'sending' | 'published' | 'pending' | 'change' | 'error'>('idle');
  const [error, setError] = useState('');
  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [stepError, setStepError] = useState('');

  const fail = (message: string) => {
    setState('error');
    setError(message);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return fail(c.needConsent);
    setState('sending');
    try {
      const res = await fetch('/api/pro-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          name,
          whatsapp,
          bio: profile.bio,
          experience: profile.experience,
          languages: profile.languages,
          activities: profile.activities,
          priceNote: profile.priceNote,
          placeId: profile.placeId,
          photoPath: profile.photoPath,
          card: kind === 'guide' ? card : '',
          socials: kind === 'agency' ? socials : '',
          consent,
          accessToken,
          elapsed: Date.now() - openedAt.current,
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as { status?: string };
        return setState(data.status === 'published' ? 'published' : 'pending');
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 401) {
        onExpired();
        return fail(c.expired);
      }
      if (res.status === 429) return fail(c.tooMany);
      if (data.error === 'invalid_card') return fail(c.invalidCard);
      if (data.error === 'exists') return fail(c.exists);
      if (data.error === 'invalid')
        return fail(kind === 'agency' && socials.trim().length < 3 ? c.needSocials : c.invalid);
      fail(c.failed);
    } catch {
      fail(c.failed);
    }
  };

  if (state === 'published' || state === 'pending') {
    return (
      <div role="status">
        <p className="text-[15px] leading-relaxed text-charcoal">{state === 'published' ? c.published : c.pending}</p>
        <a
          href={locale === 'fr' ? '/guides' : '/en/guides'}
          className="mt-4 inline-block text-sm text-charcoal underline decoration-sand-300 underline-offset-4 hover:decoration-charcoal"
        >
          {c.seeList}
        </a>
      </div>
    );
  }

  const goNext = () => {
    if (step === 2) {
      if (name.trim().length < 2 || whatsapp.replace(/\D/g, '').length < 8) return setStepError(c.invalid);
      if (kind === 'agency' && socials.trim().length < 3) return setStepError(c.needSocials);
    }
    setStepError('');
    setStep((step + 1) as 3 | 4);
  };
  const goBack = () => {
    setStepError('');
    setState('idle');
    setStep((step - 1) as 2 | 3);
  };

  return (
    <form onSubmit={submit} noValidate>
      <ProSteps steps={PRO_STEP_LABELS[locale]} current={step} />
      <div className="space-y-5">
        {step === 2 && (
          <>
            <fieldset>
              <legend className="text-sm font-medium text-charcoal">{c.status}</legend>
              <div className="mt-2 flex gap-2">
                {(['guide', 'agency'] as const).map((k) => (
                  <label
                    key={k}
                    className={`cursor-pointer rounded-pill border px-4 py-1.5 text-sm transition ${
                      kind === k
                        ? 'border-charcoal bg-charcoal text-cream'
                        : 'border-sand-200 bg-white text-charcoal-700 hover:border-charcoal-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="kind"
                      value={k}
                      checked={kind === k}
                      onChange={() => setKind(k)}
                      className="sr-only"
                    />
                    {c[k]}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm font-medium text-charcoal">
              {c.name[kind]}
              <input
                className={`${field} font-normal`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={80}
                autoComplete="name"
                required
              />
            </label>

            <label className="block text-sm font-medium text-charcoal">
              {c.whatsapp}
              <input
                className={`${field} font-normal`}
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                maxLength={30}
                inputMode="tel"
                autoComplete="tel"
                placeholder="+216"
                required
              />
              <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.whatsappHint}</span>
            </label>

            {kind === 'guide' ? (
              <label className="block text-sm font-medium text-charcoal">
                {c.card}
                <input
                  className={`${field} font-normal`}
                  value={card}
                  onChange={(e) => setCard(e.target.value)}
                  maxLength={40}
                  autoComplete="off"
                />
                <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.cardHint}</span>
              </label>
            ) : (
              <label className="block text-sm font-medium text-charcoal">
                {c.socials}
                <input
                  className={`${field} font-normal`}
                  value={socials}
                  onChange={(e) => setSocials(e.target.value)}
                  maxLength={200}
                  autoComplete="off"
                  required
                />
                <span className="mt-1 block text-xs font-normal text-charcoal-500">{c.socialsHint}</span>
              </label>
            )}
          </>
        )}

        {step === 3 && (
          <ProProfileFields
            accessToken={accessToken}
            value={profile}
            onChange={(patch) => setProfile((p) => ({ ...p, ...patch }))}
            onExpired={onExpired}
            bioMax={BIO_MAX}
            experienceMax={EXPERIENCE_MAX}
          />
        )}

        {step === 4 && (
          <>
            <label className="flex items-start gap-3 text-sm leading-relaxed text-charcoal-700">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-charcoal"
              />
              {c.consent}
            </label>
            <p className="text-xs leading-relaxed text-charcoal-500">{c.changeHint}</p>
          </>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {step > 2 && (
            <button
              type="button"
              onClick={goBack}
              className="rounded-pill border border-sand-200 px-5 py-2.5 text-sm text-charcoal-700 transition hover:border-charcoal-300"
            >
              {c.back}
            </button>
          )}
          {step < 4 ? (
            <button
              type="button"
              onClick={goNext}
              className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700"
            >
              {c.next}
            </button>
          ) : (
            <button
              type="submit"
              disabled={state === 'sending'}
              className="rounded-pill bg-charcoal px-5 py-2.5 text-sm text-cream transition hover:bg-charcoal-700 disabled:opacity-60"
            >
              {state === 'sending' ? c.sending : c.send}
            </button>
          )}
          {(stepError || state === 'error') && (
            <p role="alert" className="text-sm text-terracotta-700">
              {stepError || error}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
