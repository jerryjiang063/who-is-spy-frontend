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

// 配置 axios 默认 baseURL
axios.defaults.baseURL = API_BASE_URL;

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

// 创建并导出 socket 连接
export default io(socketURL);
