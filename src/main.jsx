import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

// 强制设置 API URL，确保在应用启动前配置
const configureAPI = () => {
  // 使用全局设置的 API_BASE_URL 或回退到当前域名
  const apiBaseUrl = window.API_BASE_URL || 
    (window.location.hostname === 'localhost' 
      ? 'http://localhost:3001' 
      : window.location.origin);
  
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
