import React from 'react';
import { useTheme } from '../hooks/useTheme';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-full border border-token bg-surface text-token-2 transition-colors hover:border-strong hover:text-token ${className ?? ''}`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {/* Sun */}
        <g className="origin-center transition-all duration-500" style={{ opacity: isDark ? 0 : 1, transform: isDark ? 'rotate(90deg) scale(0.6)' : 'none' }}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </g>
        {/* Moon */}
        <g className="origin-center transition-all duration-500" style={{ opacity: isDark ? 1 : 0, transform: isDark ? 'none' : 'rotate(-90deg) scale(0.6)' }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </g>
      </svg>
    </button>
  );
};