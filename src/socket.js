// who-is-spy-frontend/src/socket.js
import { io } from 'socket.io-client';
import axios from 'axios';

// 获取当前域名，判断是否为新版 figurativelanguage 域名
// 在本地开发环境中也启用 figurativelanguage 功能
export const isFigLang = window.location.hostname.includes('figurativelanguage') || window.location.hostname === 'localhost';

// 获取当前完整域名
const currentOrigin = window.location.origin;
console.log('Current origin:', currentOrigin);

// 强制设置 API 基础 URL - 在生产环境中始终使用当前域名，无论环境变量如何设置
const API_BASE_URL = (window.location.hostname !== 'localhost') 
  ? currentOrigin  // 使用当前域名
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
  // 确保 baseURL 正确应用 - 如果是生产环境且请求URL中包含 localhost，则修正
  if (window.location.hostname !== 'localhost' && 
      (request.url.includes('localhost') || !request.url.startsWith(API_BASE_URL))) {
    console.warn('检测到可能错误的请求URL:', request.url);
    if (request.url.startsWith('/')) {
      // 如果是相对路径，直接使用设置的 baseURL
      console.log('使用相对路径:', request.url);
    } else {
      // 如果是绝对路径且包含 localhost，则将其替换为当前域名
      console.warn('将localhost替换为当前域名');
      request.url = request.url.replace(/http:\/\/localhost:3001/g, API_BASE_URL);
    }
  }
  
  console.log('Starting Request', {
    url: request.url,
    method: request.method,
    baseURL: request.baseURL,
    fullURL: request.baseURL + (request.url.startsWith('/') ? request.url : '/' + request.url),
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
