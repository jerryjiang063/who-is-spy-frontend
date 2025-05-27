// src/App.jsx
import React from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
// import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'; // No longer needed
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
      className="fixed top-4 right-4 p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors text-sm"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '切换亮色' : '切换暗色'}
    </button>
  );
}

export default function App() {
  return <Room />;
}