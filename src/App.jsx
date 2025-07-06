// src/App.jsx
import React, { useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { FiSun, FiMoon } from 'react-icons/fi'; // Import sun and moon icons
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
      className="fixed top-4 right-4 p-2 rounded-full bg-gray-100/30 hover:bg-gray-200/50 transition-colors text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 z-50"
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? 
        <FiSun className="w-5 h-5" /> : 
        <FiMoon className="w-5 h-5" />}
    </button>
  );
}

function Footer() {
  const footerStyle = {
    position: 'fixed',
    bottom: '8px',
    left: '0',
    width: '100%',
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#1976d2',
    fontWeight: 'bold',
    opacity: '0.8',
    zIndex: 50,
    userSelect: 'none'
  };

  return (
    <div style={footerStyle}>
      {isFigLang 
        ? "By Jerry Jiang | Who Is Spy Online | 2025"
        : "By 姜姜大当家 | 谁是卧底在线版 | 2025"}
    </div>
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
      <Footer />
    </ThemeProvider>
  );
}