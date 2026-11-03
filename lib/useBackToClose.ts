import { useEffect, useRef } from 'react';

const MARK = '__layer';

/**
 * Makes the phone's back button (or swipe) close a full-screen layer instead of leaving the page.
 * Opening adds one history entry; going back closes the layer; closing it by hand removes that entry.
 */
export function useBackToClose(open: boolean, onClose: () => void) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    let pushed = true;
    window.history.pushState({ ...(window.history.state ?? {}), [MARK]: true }, '', window.location.href);
    const onPop = () => {
      pushed = false;
      close.current();
    };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      // Closed by hand: drop the entry we added, unless the page already moved on (a link was followed).
      if (pushed && window.history.state?.[MARK]) window.history.back();
    };
  }, [open]);
}
