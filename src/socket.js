// who-is-spy-frontend/src/socket.js
import { io } from 'socket.io-client';
import axios from 'axios';

// 获取当前域名，判断是否为新版 figurativelanguage 域名
// 在本地开发环境中也启用 figurativelanguage 功能
export const isFigLang = window.location.hostname.includes('figurativelanguage') || window.location.hostname === 'localhost';

// 设置 API 基础 URL
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin  // 使用当前域名
  : 'http://localhost:3001';

console.log('Current hostname:', window.location.hostname);
console.log('Environment:', process.env.NODE_ENV);
console.log('Setting API base URL to:', API_BASE_URL);

// 导出 baseURL 供其他组件使用
export const baseURL = API_BASE_URL;

// 配置 axios 默认 baseURL
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// 添加 axios 请求拦截器，用于调试
axios.interceptors.request.use(request => {
  console.log('Starting Request', {
    url: request.url,
    method: request.method,
    baseURL: request.baseURL,
    fullURL: request.baseURL + request.url,
    headers: request.headers
  });
  return request;
});

// 添加 axios 响应拦截器，用于调试
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
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
export default io(socketURL);
