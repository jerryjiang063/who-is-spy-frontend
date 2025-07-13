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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    // 添加过渡动画
    document.documentElement.classList.add('theme-transition');
    
    // 设置新主题
    setTheme(newTheme);
    
    // 动画完成后移除过渡类
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 500);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 p-3 rounded-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-700/50 shadow-lg backdrop-blur-sm transition-all duration-300 text-blue-500 dark:text-blue-300 hover:scale-110 z-50"
      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {theme === 'dark' ? 
        <FiSun className="w-6 h-6" /> : 
        <FiMoon className="w-6 h-6" />}
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
    fontWeight: 'bold',
    opacity: '0.8',
    zIndex: 50,
    userSelect: 'none'
    // 移除固定颜色，让它继承当前主题颜色
  };

  return (
    <div style={footerStyle} className="text-blue-600 dark:text-blue-300">
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
    
    // 添加主题切换时的CSS类
    const style = document.createElement('style');
    style.textContent = `
      .theme-transition,
      .theme-transition *,
      .theme-transition *::before,
      .theme-transition *::after {
        transition-duration: 500ms !important;
        transition-delay: 0ms !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="min-h-screen transition-colors duration-500 bg-[#F1F4F8] dark:bg-[#1e293b]">
        <Room 
          socket={socket} 
          title={isFigLang ? 'Fig Lang Game' : '《谁是卧底》在线版'} 
          defaultWordList={isFigLang ? 'figurative_language' : 'default'}
        />
        <ThemeToggle />
        <Footer />
      </div>
    </ThemeProvider>
  );
}