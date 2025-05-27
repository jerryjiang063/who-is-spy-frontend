// who-is-spy-frontend/src/socket.js
import { io } from 'socket.io-client';
export default io(window.location.origin);
