// frontend/src/services/socket.js
import { io } from 'socket.io-client';

let socket;

export const connectSocket = (userId) => {
    if (socket && socket.connected) return socket;

    socket = io('http://localhost:5000', {
        transports: ['websocket'], // 强制使用 WebSocket，拒绝轮询
        reconnection: true,
    });

    socket.on('connect', () => {
        console.log('✅ Socket 连接成功');
        // 连接后立即加入自己的房间
        if (userId) {
            socket.emit('join', userId);
        }
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};