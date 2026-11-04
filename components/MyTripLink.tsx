'use client';

import { useLocale } from '@/lib/i18n/LocaleProvider';
import { useMyTrip } from '@/lib/myTrip';

export default function MyTripLink({ className }: { className: string }) {
  const { t } = useLocale();
  const { ids } = useMyTrip();
  return (
    <a href="/mon-voyage" className={className}>
      {t.myTripCount(ids.length)}
    </a>
  );
}
