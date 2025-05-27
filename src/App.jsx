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
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="card-center min-h-screen w-full flex flex-col items-center justify-center">
        <h1 className="text-5xl mb-10">谁是卧底</h1>
        <div className="flex flex-col gap-8 w-full max-w-xl items-center">
          <button className="w-full" onClick={handleCreateRoom}>创建房间</button>
          <button className="w-full" onClick={handleJoinRoom}>加入房间</button>
          <button className="w-full" onClick={handleEditWordList}>词库编辑</button>
        </div>
      </div>
    </ThemeProvider>
  );
}