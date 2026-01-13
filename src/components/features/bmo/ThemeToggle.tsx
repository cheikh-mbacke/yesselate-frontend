'use client';

import { useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAppStore } from '@/lib/stores';

export function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useAppStore();

  // Appliquer la classe au document pour que le CSS fonctionne
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  return (
    <button
      onClick={toggleDarkMode}
      className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                 border border-slate-200/70 bg-white/80 backdrop-blur
                 hover:bg-slate-100 transition-colors
                 dark:border-slate-800 dark:bg-[#1f1f1f]/70 dark:hover:bg-slate-800/60
                 text-slate-700 dark:text-slate-200"
      title={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
      aria-label={darkMode ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {darkMode ? (
        <>
          <Moon className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Sombre</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4" />
          <span className="hidden sm:inline text-sm">Clair</span>
        </>
      )}
    </button>
  );
}
