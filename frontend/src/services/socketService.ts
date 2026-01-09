/**
 * Socket Service
 * 
 * WebSocket client singleton for real-time communication.
 */

import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Connect to WebSocket server
 */
export function connect(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true, // CRITICAL: Send cookies with WebSocket
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    socket.on('error', (error: { message: string }) => {
      console.error('❌ Socket error:', error.message);
    });
  }

  return socket;
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Disconnect from WebSocket server
 */
export function disconnect(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

/**
 * Emit an event
 */
export function emit(event: string, data: unknown): void {
  if (socket) {
    socket.emit(event, data);
  }
}

/**
 * Listen to an event
 */
export function on(event: string, callback: (...args: any[]) => void): void {
  if (socket) {
    socket.on(event, callback);
  }
}

/**
 * Remove event listener
 */
export function off(event: string, callback?: (...args: any[]) => void): void {
  if (socket) {
    if (callback) {
      socket.off(event, callback);
    } else {
      socket.off(event);
    }
  }
}

/**
 * Socket service object (for convenience)
 */
export const socketService = {
  connect,
  getSocket,
  disconnect,
  emit,
  on,
  off,
};
