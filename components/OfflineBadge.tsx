'use client';

import { useEffect, useState } from 'react';

/** A quiet "Offline" label in the header while the device has no network. */
export default function OfflineBadge() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);
  if (!offline) return null;
  return (
    <span role="status" className="inline-flex shrink-0 items-center gap-1.5 text-sm text-charcoal-500">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-charcoal-300" />
      Offline
    </span>
  );
}
