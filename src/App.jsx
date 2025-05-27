// src/App.jsx
import React from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import Room from './Room';
import './index.css';

function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-6 right-6 btn btn-secondary p-3 shadow-lg rounded-full"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <SunIcon className="icon-md" />
      ) : (
        <MoonIcon className="icon-md" />
      )}
    </button>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="page-center text-center-all">
        <ThemeToggle />
        <div className="content-container">
          <Room />
        </div>
      </div>
    </ThemeProvider>
  );
}