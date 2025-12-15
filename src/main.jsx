import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// 强制设置 API URL，确保在应用启动前配置
const configureAPI = () => {
  // 优先使用环境变量 VITE_API_BASE，然后使用 window.API_BASE_URL，最后根据环境选择
  // 生产环境使用 https://api.spyccb.top，开发环境使用 localhost:3001
  const apiBaseUrl = import.meta.env.VITE_API_BASE || 
    window.API_BASE_URL ||
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : 'https://api.spyccb.top');
  
  console.log('main.jsx - Setting API URL to:', apiBaseUrl);
  
  // 覆盖 axios 默认设置
  axios.defaults.baseURL = apiBaseUrl;
  axios.defaults.withCredentials = true;
  
  // 打印当前环境信息
  console.log('main.jsx - Current hostname:', window.location.hostname);
  console.log('main.jsx - Current origin:', window.location.origin);
  console.log('main.jsx - Using API URL:', axios.defaults.baseURL);
};

// 应用启动前配置 API
configureAPI();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
