// who-is-spy-frontend/src/socket.js
import { io } from 'socket.io-client';
import axios from 'axios';

// 获取当前域名，判断是否为新版 figurativelanguage 域名
// 在本地开发环境中也启用 figurativelanguage 功能
export const isFigLang = window.location.hostname.includes('figurativelanguage') || window.location.hostname === 'localhost';

// 使用环境变量 VITE_API_BASE，如果不存在则根据环境选择
// 生产环境使用 https://api.spyccb.top，开发环境使用 localhost:3001
const API_BASE_URL = import.meta.env.VITE_API_BASE || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'
    : 'https://api.spyccb.top');

console.log('Socket.js - Current hostname:', window.location.hostname);
console.log('Socket.js - Environment:', import.meta.env.MODE);
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
// 使用环境变量 VITE_API_BASE，如果不存在则根据环境选择
// 生产环境使用 https://api.spyccb.top，开发环境使用 localhost:3001
const socketURL = import.meta.env.VITE_API_BASE || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:3001'
    : 'https://api.spyccb.top');

console.log('Setting socket URL to:', socketURL);

// 创建并导出 socket 连接
const socket = io(socketURL, {
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  autoConnect: true
});

// 存储玩家信息，用于断线重连
let currentPlayerInfo = {
  name: '',
  roomId: '',
  isConnected: false,
  isHost: false
};

// 设置当前玩家信息
export const setPlayerInfo = (name, roomId, isHost = false) => {
  console.log(`Setting player info: name=${name}, roomId=${roomId}, isHost=${isHost}`);
  currentPlayerInfo.name = name;
  currentPlayerInfo.roomId = roomId;
  currentPlayerInfo.isHost = isHost;
  
  // 将信息存储在localStorage中，以便页面刷新后恢复
  localStorage.setItem('whoisspy_player_name', name);
  localStorage.setItem('whoisspy_room_id', roomId);
  localStorage.setItem('whoisspy_is_host', isHost ? 'true' : 'false');
};

// 清除玩家信息
export const clearPlayerInfo = () => {
  console.log('Clearing player info');
  currentPlayerInfo = { name: '', roomId: '', isConnected: false, isHost: false };
  localStorage.removeItem('whoisspy_player_name');
  localStorage.removeItem('whoisspy_room_id');
  localStorage.removeItem('whoisspy_is_host');
};

// 尝试从localStorage恢复玩家信息
const restorePlayerInfo = () => {
  const name = localStorage.getItem('whoisspy_player_name');
  const roomId = localStorage.getItem('whoisspy_room_id');
  const isHost = localStorage.getItem('whoisspy_is_host') === 'true';
  
  if (name && roomId) {
    console.log(`Restored player info from localStorage: name=${name}, roomId=${roomId}, isHost=${isHost}`);
    currentPlayerInfo.name = name;
    currentPlayerInfo.roomId = roomId;
    currentPlayerInfo.isHost = isHost;
    return true;
  }
  return false;
};

// 添加连接事件监听
socket.on('connect', () => {
  console.log('Socket connected successfully');
  currentPlayerInfo.isConnected = true;
  
  // 如果有存储的房间信息，尝试重新加入房间
  if (currentPlayerInfo.name && currentPlayerInfo.roomId) {
    console.log(`Attempting to rejoin room ${currentPlayerInfo.roomId} as ${currentPlayerInfo.name}`);
    
    // 显示重连通知
    if (document.getElementById('reconnect-notification')) {
      // 如果已有通知，不重复创建
      return;
    }
    
    // 创建一个临时通知元素
    const notification = document.createElement('div');
    notification.id = 'reconnect-notification';
    notification.style.position = 'fixed';
    notification.style.top = '10px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%)';
    notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '5px';
    notification.style.zIndex = '9999';
    notification.style.fontSize = '14px';
    notification.textContent = '正在重新连接到房间...';
    
    document.body.appendChild(notification);
    
    // 发送重连请求
    socket.emit('rejoin-room', {
      playerName: currentPlayerInfo.name,
      roomId: currentPlayerInfo.roomId,
      wasHost: currentPlayerInfo.isHost // 添加房主状态信息
    });
    
    // 5秒后自动移除通知
    setTimeout(() => {
      if (document.getElementById('reconnect-notification')) {
        document.body.removeChild(notification);
      }
    }, 5000);
  } else {
    // 尝试从localStorage恢复
    if (restorePlayerInfo()) {
      console.log(`Attempting to rejoin room ${currentPlayerInfo.roomId} as ${currentPlayerInfo.name} (restored from localStorage)`);
      
      // 显示重连通知
      const notification = document.createElement('div');
      notification.id = 'reconnect-notification';
      notification.style.position = 'fixed';
      notification.style.top = '10px';
      notification.style.left = '50%';
      notification.style.transform = 'translateX(-50%)';
      notification.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      notification.style.color = 'white';
      notification.style.padding = '10px 20px';
      notification.style.borderRadius = '5px';
      notification.style.zIndex = '9999';
      notification.style.fontSize = '14px';
      notification.textContent = '正在重新连接到房间...';
      
      document.body.appendChild(notification);
      
      socket.emit('rejoin-room', {
        playerName: currentPlayerInfo.name,
        roomId: currentPlayerInfo.roomId,
        wasHost: currentPlayerInfo.isHost // 添加房主状态信息
      });
      
      // 5秒后自动移除通知
      setTimeout(() => {
        if (document.getElementById('reconnect-notification')) {
          document.body.removeChild(notification);
        }
      }, 5000);
    }
  }
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
  currentPlayerInfo.isConnected = false;
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
  currentPlayerInfo.isConnected = false;
});

// 重连成功或失败的处理
socket.on('rejoin-success', ({ room }) => {
  console.log('Successfully rejoined room:', room);
  
  // 移除重连通知
  const notification = document.getElementById('reconnect-notification');
  if (notification) {
    document.body.removeChild(notification);
  }
});

socket.on('rejoin-failed', ({ message }) => {
  console.error('Failed to rejoin room:', message);
  
  // 移除重连通知
  const notification = document.getElementById('reconnect-notification');
  if (notification) {
    document.body.removeChild(notification);
  }
  
  // 清除无效的房间信息
  clearPlayerInfo();
});

export default socket;
