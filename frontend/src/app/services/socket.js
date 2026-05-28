import { io } from 'socket.io-client';
const WS_URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:5000';
let socket = null;
export function getSocket() {
  return socket;
}
export function connectSocket(token) {
  if (socket?.connected) return socket;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  socket = io(WS_URL, {
    auth: {
      token
    },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000
  });
  return socket;
}
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}