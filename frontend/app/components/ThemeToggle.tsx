'use client';

import { useTheme } from '@/app/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative p-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-foyer-200 dark:border-foyer-700">
        <div className="w-5 h-5" />
      </div>
    );
  }

  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-xl bg-surface-light dark:bg-surface-dark border border-foyer-200 dark:border-foyer-700 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 group"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        <Sun
          size={20}
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-75'
          } text-accent-500`}
        />
        <Moon
          size={20}
          className={`absolute inset-0 transition-all duration-300 ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-75'
          } text-primary-400`}
        />
      </div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400/20 to-accent-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  );
}
