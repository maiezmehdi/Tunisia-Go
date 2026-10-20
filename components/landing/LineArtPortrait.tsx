'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Line drawing of a Tunisian woman in a headscarf, in profile, with a jasmine flower at the temple.
 * Behind her, smaller and fainter: the amphitheatre of El Jem and the houses of Sidi Bou Saïd.
 * The strokes draw themselves when the section scrolls into view, then the figure drifts gently.
 */
const STROKES = [
  // Scarf: over the crown and down the back.
  'M146 178 C 140 120, 190 82, 248 84 C 312 86, 344 128, 346 188 C 350 248, 330 292, 336 346 C 342 400, 370 446, 390 506',
  // Scarf: front edge framing the face, wrapping under the chin.
  'M150 176 C 190 160, 222 176, 230 216 C 238 262, 232 310, 210 344 C 196 364, 180 370, 166 372',
  // Face in profile.
  'M156 184 C 154 200, 151 210, 151 224 C 151 234, 149 242, 141 255 C 135 264, 128 272, 130 278 C 132 284, 141 284, 145 288 C 141 294, 140 298, 143 302 C 140 306, 140 312, 146 316 C 146 326, 150 334, 162 340 C 176 346, 192 346, 207 341',
  // Brow, closed eye and lashes.
  'M158 216 C 168 210, 181 209, 192 214',
  'M162 232 C 170 238, 180 238, 188 232',
  'M166 238 L 164 243 M 174 240 L 173 245 M 182 238 L 183 243',
  // Drape across the chest and shoulder.
  'M166 372 C 208 384, 260 380, 298 360 C 316 350, 328 342, 336 350',
  'M174 372 C 164 410, 148 450, 116 506',
  'M212 386 C 218 420, 234 464, 260 506',
  // Folds.
  'M204 102 C 248 118, 284 156, 298 214',
  'M256 222 C 278 262, 284 300, 276 344',
  'M300 252 C 306 300, 304 330, 312 360',
];


/** Background monuments, drawn first and kept faint so the portrait stays in front. */
const BACKDROP = [
  // El Jem: ground, then the three tiers of the amphitheatre with the breach on the right.
  'M-28 506 H132',
  'M-20 506 V444 C-20 440, -16 438, -12 438 H58 L64 446 L70 446 L76 456 L84 456 L90 464 H104 L110 472 V506',
  'M-20 484 H110 M-20 462 H90',
  'M-14 506 V497 C-14 492, -6 492, -6 497 V506 M-1 506 V497 C-1 492, 7 492, 7 497 V506 M12 506 V497 C12 492, 20 492, 20 497 V506 M25 506 V497 C25 492, 33 492, 33 497 V506 M38 506 V497 C38 492, 46 492, 46 497 V506 M51 506 V497 C51 492, 59 492, 59 497 V506 M64 506 V497 C64 492, 72 492, 72 497 V506 M77 506 V497 C77 492, 85 492, 85 497 V506 M90 506 V497 C90 492, 98 492, 98 497 V506 M103 506 V497 C103 492, 111 492, 111 497 V506',
  'M-14 484 V475 C-14 470, -6 470, -6 475 V484 M-1 484 V475 C-1 470, 7 470, 7 475 V484 M12 484 V475 C12 470, 20 470, 20 475 V484 M25 484 V475 C25 470, 33 470, 33 475 V484 M38 484 V475 C38 470, 46 470, 46 475 V484 M51 484 V475 C51 470, 59 470, 59 475 V484 M64 484 V475 C64 470, 72 470, 72 475 V484 M77 484 V475 C77 470, 85 470, 85 475 V484 M90 484 V475 C90 470, 98 470, 98 475 V484 M103 484 V475 C103 470, 111 470, 111 475 V484',
  'M-14 462 V453 C-14 448, -6 448, -6 453 V462 M-1 462 V453 C-1 448, 7 448, 7 453 V462 M12 462 V453 C12 448, 20 448, 20 453 V462 M25 462 V453 C25 448, 33 448, 33 453 V462 M38 462 V453 C38 448, 46 448, 46 453 V462 M51 462 V453 C51 448, 59 448, 59 453 V462',
  // Sidi Bou Saïd: ground, a domed house, a taller one with its arched door and moucharabieh.
  'M368 506 H480',
  'M390 506 V454 H428 M400 454 C400 437, 418 437, 418 454 M409 441 V433',
  'M406 480 V472 C406 467, 414 467, 414 472 V480 Z',
  'M428 506 V430 H468 V506',
  'M440 506 V486 C440 477, 456 477, 456 486 V506',
  'M444 442 H456 V452 H444 Z M450 442 V452',
];

/** Jasmine (the Tunisian machmoum flower): five petals around a small heart, tucked at the temple. */
const JASMINE_CENTER = { x: 238, y: 196 };
const PETALS = [0, 72, 144, 216, 288];

const EASE = [0.65, 0, 0.35, 1] as const;

export default function LineArtPortrait({ className = '' }: { className?: string }) {
  const reduce = useReducedMotion();
  const draw = (i: number, duration = 2.2) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, amount: 0.4 },
          transition: {
            pathLength: { duration, delay: 0.15 + i * 0.22, ease: EASE },
            opacity: { duration: 0.2, delay: 0.15 + i * 0.22 },
          },
        };

  return (
    <motion.svg
      viewBox="-34 64 518 452"
      aria-hidden
      className={className}
      animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, -0.6, 0] }}
      transition={reduce ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    >
      <g fill="none" stroke="currentColor" strokeWidth={0.9} strokeLinecap="round" strokeLinejoin="round" opacity={0.55}>
        {BACKDROP.map((d, i) => (
          <motion.path key={i} d={d} {...draw(1 + i * 0.35, 1.8)} />
        ))}
      </g>
      <g fill="none" stroke="currentColor" strokeWidth={1.15} strokeLinecap="round" strokeLinejoin="round">
        {STROKES.map((d, i) => (
          <motion.path key={i} d={d} {...draw(i)} />
        ))}
      </g>
      <g className="text-terracotta-300" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" strokeLinejoin="round">
        {PETALS.map((angle, i) => (
          <motion.ellipse
            key={angle}
            cx={JASMINE_CENTER.x}
            cy={JASMINE_CENTER.y - 6}
            rx={3.2}
            ry={6}
            transform={`rotate(${angle} ${JASMINE_CENTER.x} ${JASMINE_CENTER.y})`}
            {...draw(STROKES.length + i * 0.4, 0.9)}
          />
        ))}
        <motion.circle cx={JASMINE_CENTER.x} cy={JASMINE_CENTER.y} r={1.6} {...draw(STROKES.length + 2.2, 0.5)} />
      </g>
    </motion.svg>
  );
}
