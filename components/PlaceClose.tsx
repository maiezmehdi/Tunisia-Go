'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useLocale, useLocalePath } from '@/lib/i18n/LocaleProvider';

/**
 * Closes a place page: back to the list of places when the visitor came from it, otherwise to the
 * map with this place open.
 */
export default function PlaceClose({ placeId }: { placeId: string }) {
  const lp = useLocalePath();
  const { t } = useLocale();
  const router = useRouter();
  const close = () => {
    // The map drops ?place from its address once the place is open, so going "back" to it would
    // show the map with nothing selected: reopen the place explicitly instead.
    const from = document.referrer ? new URL(document.referrer) : null;
    const fromList = from && from.origin === window.location.origin && /^\/(en\/)?lieux\/?$/.test(from.pathname);
    if (fromList) router.back();
    else router.push(lp(`/explore?place=${placeId}`));
  };
  return (
    <button
      type="button"
      onClick={close}
      aria-label={t.closePage}
      data-tip={t.closePage}
      data-tip-align="end"
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-sand-200 text-charcoal transition hover:border-charcoal-300"
    >
      <X className="h-4 w-4" strokeWidth={1.75} />
    </button>
  );
}
