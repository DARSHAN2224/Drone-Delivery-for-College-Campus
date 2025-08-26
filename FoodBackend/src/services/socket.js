import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });
  
  console.log('🔌 Socket.IO server initialized');

  ioInstance.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id);
    
    // Client may join rooms per droneId or orderId for scoped updates
    socket.on('join_drone', ({ droneId }) => {
      if (droneId) {
        socket.join(`drone:${droneId}`);
        console.log(`🔌 Client ${socket.id} joined drone room: ${droneId}`);
      }
    });
    socket.on('join_order', ({ orderId }) => {
      if (orderId) {
        socket.join(`order:${orderId}`);
        console.log(`🔌 Client ${socket.id} joined order room: ${orderId}`);
      }
    });
    socket.on('join_notif', ({ userId }) => {
      if (userId) {
        socket.join(`notif:${userId}`);
        console.log(`🔌 Client ${socket.id} joined notification room: ${userId}`);
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('🔌 Client disconnected:', socket.id, 'Reason:', reason);
    });
  });

  return ioInstance;
};

export const getIo = () => ioInstance;

export const emitNotification = (userId, payload) => {
  try {
    ioInstance?.to(`notif:${userId}`).emit('notification:new', payload);
  } catch {}
};


