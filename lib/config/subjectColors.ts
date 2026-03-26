// Internal representation: hue, chroma, lightness for the saturated color.
interface ColorDef {
  l: number; // lightness (e.g., 55 → "55%")
  c: number; // chroma
  h: number; // hue angle
}

/**
 * Builds CSS custom property key-value pairs from a color definition.
 *
 * Light mode: background at 10% opacity (very tinted, never overwhelming).
 * Dark mode: background at 18% opacity over surface-raised (more visible on dark).
 * Borders: same hue, full opacity — saturated in light, slightly lighter in dark.
 *
 * Returned vars for spreading into `style={{ ...getSubjectColorVars(name) }}`:
 *   --sb-bg, --sb-bg-active         → light mode backgrounds (10%, 20%)
 *   --sb-bg-dark, --sb-bg-dark-active → dark mode backgrounds (18%, 28%)
 *   --sb-border                     → saturated border (light mode)
 *   --sb-border-dark                → lighter border (dark mode)
 */
function buildColorVars(def: ColorDef): Record<string, string> {
  const { l, c, h } = def;
  // Slightly higher lightness in dark mode so the border is visible on dark surfaces
  const dl = Math.min(l + 13, 82);

  const base = `${l}% ${c} ${h}`;
  const dark = `${dl}% ${c} ${h}`;

  return {
    '--sb-bg':             `oklch(${base} / 10%)`,
    '--sb-bg-active':      `oklch(${base} / 20%)`,
    '--sb-bg-dark':        `oklch(${dark} / 18%)`,
    '--sb-bg-dark-active': `oklch(${dark} / 28%)`,
    '--sb-border':         `oklch(${base})`,
    '--sb-border-dark':    `oklch(${dark})`,
  };
}

// ─── Cold palette: blues, purples, teals (Matemáticas) ───────────────────────
const COLD: ColorDef[] = [
  { l: 52, c: 0.22, h: 278 }, // indigo
  { l: 54, c: 0.18, h: 250 }, // blue
  { l: 54, c: 0.18, h: 300 }, // purple
  { l: 54, c: 0.18, h: 200 }, // teal
  { l: 54, c: 0.18, h: 220 }, // sky
  { l: 52, c: 0.20, h: 265 }, // violet
  { l: 54, c: 0.18, h: 190 }, // cyan
  { l: 54, c: 0.18, h: 316 }, // blue-purple
];

// ─── Warm palette: oranges, greens, pinks (Informática y resto) ───────────────
const WARM: ColorDef[] = [
  { l: 60, c: 0.22, h: 70  }, // amber
  { l: 57, c: 0.18, h: 145 }, // green
  { l: 60, c: 0.22, h: 15  }, // coral
  { l: 57, c: 0.18, h: 110 }, // yellow-green
  { l: 60, c: 0.22, h: 340 }, // pink
  { l: 60, c: 0.20, h: 85  }, // orange-yellow
  { l: 57, c: 0.18, h: 130 }, // lime
  { l: 60, c: 0.22, h: 0   }, // crimson
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

export type SubjectColorVars = Record<string, string>;

/**
 * Returns CSS custom property key-value pairs for a subject's color scheme.
 * Math subjects get the cold palette; everything else gets the warm palette.
 *
 * Usage — spread into the block's `style` prop:
 *   style={{ ...getSubjectColorVars(name), top, height, ... }}
 *
 * Then reference in className:
 *   "[background-color:var(--sb-bg)] dark:[background-color:var(--sb-bg-dark)]"
 */
export function getSubjectColorVars(name: string): SubjectColorVars {
  const code = name.split(' - ')[0].split('.')[0].trim().toUpperCase();

  if (MAT_SET.has(code)) {
    const idx = MAT_CODES.indexOf(code) % COLD.length;
    return buildColorVars(COLD[idx]);
  }

  return buildColorVars(WARM[hashCode(code) % WARM.length]);
}
