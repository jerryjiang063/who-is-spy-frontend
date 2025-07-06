// who-is-spy-frontend/src/socket.js
import { io } from 'socket.io-client';
import axios from 'axios';

// 获取当前域名，判断是否为新版 figurativelanguage 域名
// 在本地开发环境中也启用 figurativelanguage 功能
export const isFigLang = window.location.hostname.includes('figurativelanguage') || window.location.hostname === 'localhost';

// 获取当前完整域名
const currentOrigin = window.location.origin;
console.log('Current origin:', currentOrigin);

// 使用 HTML 中预先设置的 API_BASE_URL，如果不存在则使用当前设置逻辑
const API_BASE_URL = window.API_BASE_URL || 
  ((window.location.hostname !== 'localhost') 
    ? currentOrigin  // 使用当前域名
    : 'http://localhost:3001');

console.log('Socket.js - Current hostname:', window.location.hostname);
console.log('Socket.js - Environment:', process.env.NODE_ENV);
console.log('Socket.js - Setting API base URL to:', API_BASE_URL);

// 导出 baseURL 供其他组件使用
export const baseURL = API_BASE_URL;

// 配置 axios 默认 baseURL - 确保使用全局变量
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.timeout = 10000; // 设置10秒超时

// 创建一个带有重试功能的axios实例
export const axiosWithRetry = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 添加重试功能
axiosWithRetry.interceptors.response.use(null, async (error) => {
  const { config } = error;
  
  // 如果没有配置或已经重试过，直接拒绝
  if (!config || config._retryCount >= 2) {
    return Promise.reject(error);
  }
  
  // 设置重试计数
  config._retryCount = config._retryCount || 0;
  config._retryCount += 1;
  
  console.log(`请求失败，正在重试 (${config._retryCount}/2): ${config.url}`);
  
  // 延迟重试
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 重新发送请求
  return axiosWithRetry(config);
});

// 添加 axios 请求拦截器，用于调试和修复 URL
axios.interceptors.request.use(request => {
  // 确保 baseURL 正确应用 - 如果是生产环境且请求URL中包含 localhost，则修正
  if (window.location.hostname !== 'localhost' && 
      (request.url.includes('localhost') || 
      (typeof request.url === 'string' && !request.url.startsWith('http') && !request.url.startsWith('/')))) {
    console.warn('检测到可能错误的请求URL:', request.url);
    
    // 处理不同类型的 URL
    if (typeof request.url === 'string') {
      if (request.url.startsWith('http://localhost:3001')) {
        // 如果是完整的 localhost URL，替换为当前域名
        console.warn('将 localhost URL 替换为当前域名');
        request.url = request.url.replace('http://localhost:3001', API_BASE_URL);
      } else if (!request.url.startsWith('http') && !request.url.startsWith('/')) {
        // 如果是相对路径但不以斜杠开头，添加斜杠
        console.log('添加斜杠到相对路径:', request.url);
        request.url = '/' + request.url;
      }
    }
  }
  
  // 记录请求信息
  console.log('Starting Request Object');
  
  return request;
});

// 添加 axios 响应拦截器，用于调试
axios.interceptors.response.use(
  response => {
    console.log('Response Object');
    return response;
  },
  error => {
    console.error('Response Error:', {
      message: error.message,
      config: error.config ? {
        url: error.config.url,
        method: error.config.method,
        baseURL: error.config.baseURL
      } : 'No config available'
    });
    return Promise.reject(error);
  }
);

// 同样为axiosWithRetry添加拦截器
axiosWithRetry.interceptors.request.use(request => {
  // 确保 baseURL 正确应用
  if (window.location.hostname !== 'localhost' && 
      (request.url.includes('localhost') || 
      (typeof request.url === 'string' && !request.url.startsWith('http') && !request.url.startsWith('/')))) {
    
    if (typeof request.url === 'string') {
      if (request.url.startsWith('http://localhost:3001')) {
        request.url = request.url.replace('http://localhost:3001', API_BASE_URL);
      } else if (!request.url.startsWith('http') && !request.url.startsWith('/')) {
        request.url = '/' + request.url;
      }
    }
  }
  
  return request;
});

// 创建 socket 连接
let socketURL;

// 本地开发环境
if (window.location.hostname === 'localhost') {
  socketURL = 'http://localhost:3001';
} 
// 生产环境
else {
  socketURL = window.location.origin;  // 使用当前域名
}

console.log('Setting socket URL to:', socketURL);

// 创建并导出 socket 连接
const socket = io(socketURL, {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000
});

// 添加连接事件监听
socket.on('connect', () => {
  console.log('Socket connected successfully');
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

export default socket;
