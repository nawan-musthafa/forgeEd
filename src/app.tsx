import React, { useEffect, useState } from 'react';
import { HeroPage } from './components/HeroPage';
import { StudyHub } from './components/StudyHub';
import { RankedView } from './components/ranked/RankedView';
import { AboutPage } from './components/AboutPage';
import { LoadingScreen } from './components/LoadingScreen';
import { Logo } from './components/Logo';
import { ThemeToggle } from './components/ThemeToggle';
import { AuthButton } from './components/auth/AuthButton';
import { useTheme } from './hooks/useTheme';
import { useAuth } from './hooks/useAuth';

type View = 'hero' | 'study' | 'ranked' | 'about';

const App: React.FC = () => {
  const [view, setView] = useState<View>('hero');
  const [loading, setLoading] = useState(true);

  useTheme();
  useAuth();

  useEffect(() => {
    const id = window.setTimeout(() => setLoading(false), 2200);
    return () => window.clearTimeout(id);
  }, []);

  if (loading) return <LoadingScreen duration={2200} />;

  if (view === 'hero') {
    return (
      <HeroPage
        onLearn={() => setView('study')}
        onQuiz={() => setView('study')}
        onRanked={() => setView('ranked')}
        onAbout={() => setView('about')}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-app text-token">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-token bg-surface/85 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <button
          type="button"
          onClick={() => setView('hero')}
          className="transition-opacity hover:opacity-80"
        >
          <Logo />
        </button>

        <nav className="flex shrink-0 items-center gap-1 overflow-x-auto rounded-full border border-token bg-surface-2 p-1 shadow-soft">
          {(
            [
              { id: 'study', label: 'Study' },
              { id: 'ranked', label: 'JEE Practice' },
              { id: 'about', label: 'About' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setView(tab.id)}
              className={`min-h-[34px] shrink-0 rounded-full px-4 py-1.5 text-[12.5px] font-bold transition-all sm:min-h-[36px] sm:px-5 sm:text-[13px] ${
                view === tab.id ? 'bg-accent text-white shadow-soft' : 'text-token-2 hover:text-token'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AuthButton />
        </div>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
        {view === 'study' && <StudyHub onNavigate={(v) => setView(v)} />}
        {view === 'ranked' && <RankedView />}
        {view === 'about' && <AboutPage onBack={() => setView('hero')} />}
      </main>
    </div>
  );
};

export default App;