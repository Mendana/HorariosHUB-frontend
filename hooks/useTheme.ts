'use client';

import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

/**
 * Lee el tema actual del DOM (aplicado por el script inline del layout antes
 * del primer paint) y expone una función para alternarlo.
 * Persiste la preferencia en localStorage con la clave 'theme'.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  // 'light' como estado inicial de React; useEffect sincroniza con el DOM real.
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const toggleTheme = useCallback(() => {
    const next: Theme = theme === 'light' ? 'dark' : 'light';
    const html = document.documentElement;

    if (next === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }

    try {
      localStorage.setItem('theme', next);
    } catch {
      // localStorage no disponible (modo privado muy restrictivo, etc.)
    }

    setTheme(next);
  }, [theme]);

  return { theme, toggleTheme };
}
