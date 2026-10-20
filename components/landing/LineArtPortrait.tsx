'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * Line drawing of a Tunisian woman in a headscarf, in profile, with a jasmine flower at the temple.
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
      viewBox="96 64 314 452"
      aria-hidden
      className={className}
      animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, -0.6, 0] }}
      transition={reduce ? undefined : { duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
    >
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
