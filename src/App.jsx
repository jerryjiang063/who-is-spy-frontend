// src/App.jsx
import React, { useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
// import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'; // No longer needed
import Room from './Room';
import socket, { isFigLang } from './socket';
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
      {theme === 'dark' ? 
        (isFigLang ? 'Switch to Light Mode' : '切换亮色') : 
        (isFigLang ? 'Switch to Dark Mode' : '切换暗色')}
    </button>
  );
}

export default function App() {
  // 根据域名设置页面标题
  useEffect(() => {
    document.title = isFigLang ? 'Fig Lang Game' : '谁是卧底在线版';
  }, []);
  
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <Room 
        socket={socket} 
        title={isFigLang ? 'Fig Lang Game' : '《谁是卧底》在线版'} 
        defaultWordList={isFigLang ? 'figurative_language' : 'default'}
      />
      <ThemeToggle />
    </ThemeProvider>
  );
}