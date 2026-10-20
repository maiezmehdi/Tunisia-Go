/** Stops the page from scrolling while at least one full-screen layer is open. */
let locks = 0;

export function lockPageScroll(): () => void {
  locks += 1;
  if (locks === 1) document.documentElement.style.overflow = 'hidden';
  let released = false;
  return () => {
    if (released) return;
    released = true;
    locks -= 1;
    if (locks === 0) document.documentElement.style.overflow = '';
  };
}
