import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (window.location.port === '5173' ? 'http://localhost:5001' : window.location.origin);

let socketInstance = null;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    socketInstance.on('connect', () => {
      console.log('[Socket] Connected to real-time server with id:', socketInstance.id);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected from server:', reason);
    });

    socketInstance.on('connect_error', (err) => {
      console.warn('[Socket] Connection warning:', err.message);
    });
  }

  return socketInstance;
};
