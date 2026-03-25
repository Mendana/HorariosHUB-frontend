export interface SubjectColor {
  bgLight: string; // oklch pastel for light mode
  bgDark: string;  // oklch dark/desaturated for dark mode
  border: string;  // oklch saturated — always the same
}

// ─── Cold palette: blues, purples, teals (Matemáticas) ───────────────────────
const COLD: SubjectColor[] = [
  { bgLight: 'oklch(97.5% 0.015 278)', bgDark: 'oklch(24% 0.08 278)', border: 'oklch(55% 0.22 278)' }, // indigo
  { bgLight: 'oklch(97.5% 0.015 250)', bgDark: 'oklch(24% 0.07 250)', border: 'oklch(54% 0.18 250)' }, // blue
  { bgLight: 'oklch(97.5% 0.015 300)', bgDark: 'oklch(24% 0.07 300)', border: 'oklch(54% 0.18 300)' }, // purple
  { bgLight: 'oklch(97.5% 0.015 200)', bgDark: 'oklch(24% 0.07 200)', border: 'oklch(54% 0.18 200)' }, // teal
  { bgLight: 'oklch(97.5% 0.015 220)', bgDark: 'oklch(24% 0.07 220)', border: 'oklch(54% 0.18 220)' }, // sky
  { bgLight: 'oklch(97.5% 0.015 265)', bgDark: 'oklch(24% 0.08 265)', border: 'oklch(55% 0.20 265)' }, // violet
  { bgLight: 'oklch(97.5% 0.015 190)', bgDark: 'oklch(24% 0.07 190)', border: 'oklch(54% 0.18 190)' }, // cyan
  { bgLight: 'oklch(97.5% 0.015 316)', bgDark: 'oklch(24% 0.07 316)', border: 'oklch(54% 0.18 316)' }, // blue-purple
];

// ─── Warm palette: oranges, greens, pinks (Informática y resto) ───────────────
const WARM: SubjectColor[] = [
  { bgLight: 'oklch(97.5% 0.018 70)',  bgDark: 'oklch(25% 0.08 70)',  border: 'oklch(60% 0.22 70)'  }, // amber
  { bgLight: 'oklch(97.5% 0.018 145)', bgDark: 'oklch(25% 0.07 145)', border: 'oklch(57% 0.18 145)' }, // green
  { bgLight: 'oklch(97.5% 0.018 15)',  bgDark: 'oklch(25% 0.08 15)',  border: 'oklch(60% 0.22 15)'  }, // coral
  { bgLight: 'oklch(97.5% 0.018 110)', bgDark: 'oklch(25% 0.07 110)', border: 'oklch(57% 0.18 110)' }, // yellow-green
  { bgLight: 'oklch(97.5% 0.018 340)', bgDark: 'oklch(25% 0.08 340)', border: 'oklch(60% 0.22 340)' }, // pink
  { bgLight: 'oklch(97.5% 0.018 85)',  bgDark: 'oklch(25% 0.08 85)',  border: 'oklch(60% 0.20 85)'  }, // orange-yellow
  { bgLight: 'oklch(97.5% 0.018 130)', bgDark: 'oklch(25% 0.07 130)', border: 'oklch(57% 0.18 130)' }, // lime
  { bgLight: 'oklch(97.5% 0.018 0)',   bgDark: 'oklch(25% 0.08 0)',   border: 'oklch(60% 0.22 0)'   }, // crimson
];

// ─── Matemáticas subject codes (24 known) ─────────────────────────────────────
const MAT_CODES: string[] = [
  'ALG', 'CDI', 'GEO', 'TMA', 'EDP', 'MTN', 'CAP', 'AMC',
  'TOP', 'ACC', 'ECA', 'MCC', 'AMF', 'EST', 'VCA', 'AST',
  'IDE', 'ANS', 'LOG', 'MAT', 'CAN', 'MEC', 'CUR', 'GAL',
];
const MAT_SET = new Set(MAT_CODES);

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Returns the color pair for a subject name.
 * Math subjects use the cold palette, everything else uses the warm palette.
 * Assignment is cyclic (stable per code).
 */
export function getSubjectColor(name: string): SubjectColor {
  const code = name.split(' - ')[0].split('.')[0].trim().toUpperCase();

  if (MAT_SET.has(code)) {
    const idx = MAT_CODES.indexOf(code) % COLD.length;
    return COLD[idx];
  }

  return WARM[hashCode(code) % WARM.length];
}
