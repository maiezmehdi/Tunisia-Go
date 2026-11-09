'use client';

import { useLocale, useLocalePath } from '@/lib/i18n/LocaleProvider';
import { useMyTrip } from '@/lib/myTrip';

export default function MyTripLink({ className }: { className: string }) {
  const lp = useLocalePath();
  const { t } = useLocale();
  const { ids } = useMyTrip();
  return (
    <a href={lp('/mon-voyage')} className={className}>
      {t.myTripCount(ids.length)}
    </a>
  );
}
