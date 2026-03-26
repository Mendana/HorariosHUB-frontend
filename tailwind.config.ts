/**
 * Tailwind CSS v4: la configuración vive en app/globals.css mediante @theme.
 * Este archivo existe como referencia para herramientas que lo esperan (IDEs, linters).
 *
 * - Tokens de color, radios y fuente → globals.css (@theme inline)
 * - Dark mode via clase .dark       → globals.css (@variant dark)
 * - Espaciado (space-N)             → escala por defecto de Tailwind v4 (1u = 4px)
 *
 * Visual System (shadows, transitions, global hover/focus/active rules):
 * - Variables CSS (:root / .dark)   → globals.css (--shadow-*, --transition-*)
 * - Utilidades Tailwind             → globals.css (@utility shadow-*, transition-*)
 * - Reglas globales                 → globals.css (@layer base, *:focus-visible)
 * - Documentación y patrones        → lib/config/visualSystem.ts
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  // En v4, darkMode se configura en CSS con @variant dark.
  // Este campo no tiene efecto con @tailwindcss/postcss v4.
  darkMode: 'class',
};

export default config;
