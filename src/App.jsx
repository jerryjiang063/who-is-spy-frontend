// src/App.jsx
import React from 'react';
import { ThemeProvider } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import Room from './Room';
import './index.css';

function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = React.useContext(ThemeProvider);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-4 right-4 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="h-6 w-6" />
      ) : (
        <MoonIcon className="h-6 w-6" />
      )}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground transition-colors duration-300">
        <ThemeToggle />
        <div className="container py-8">
          <Room />
        </div>
      </div>
    </ThemeProvider>
  );
}