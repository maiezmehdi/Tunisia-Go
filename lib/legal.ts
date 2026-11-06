/**
 * What the legal page and the structured data say about who runs Tunisia Go.
 * Empty fields are simply not shown: fill them in with the official details to publish them
 * (the address also feeds the LocalBusiness data used by search engines).
 */
export const LEGAL = {
  publisher: 'Mehdi Maiez',
  email: 'contact@tunisiagoo.com',
  /** Company name or status (for example "Entreprise individuelle", "SARL …"), if any. */
  legalForm: '',
  /** Registration number (registre de commerce, matricule fiscal…), if any. */
  registration: '',
  /** Official postal address, free text on one line. Empty until given. */
  address: '',
  /** Structured address for search engines, filled with `address`. */
  addressParts: null as null | {
    street: string;
    city: string;
    postalCode?: string;
    region?: string;
  },
  /** Official social profiles other than TikTok and LinkedIn (Instagram, Facebook), when they exist. */
  extraProfiles: [] as string[],
  host: {
    name: 'Vercel Inc.',
    address: '440 N Barranca Ave #4133, Covina, CA 91723, États-Unis',
  },
};
