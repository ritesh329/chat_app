import { configureSocket } from '../config/socket.js';
import { handlePersonalChat } from './personalChat.js';
import { handleGroupChat } from './groupChat.js';
import { handleAI } from './aiHandler.js';
import User from '../models/User.js';
import Message from '../models/Message.js';

export const setupSocketIO = (server) => {
  const io = configureSocket(server);

  io.on('connection', async (socket) => {
    console.log(`🟢 User connected: ${socket.userId}`);

    // Update user status
    await User.findByIdAndUpdate(socket.userId, {
      status: 'online',
      lastSeen: Date.now(),
    });

    // Broadcast online status
    socket.broadcast.emit('user-online', { userId: socket.userId });

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Setup handlers
    handlePersonalChat(io, socket);
    handleGroupChat(io, socket);
    handleAI(io, socket);

    // Disconnect handler
    socket.on('disconnect', async () => {
      console.log(`🔴 User disconnected: ${socket.userId}`);
      
      await User.findByIdAndUpdate(socket.userId, {
        status: 'offline',
        lastSeen: Date.now(),
      });

      socket.broadcast.emit('user-offline', { userId: socket.userId });
    });
  });

  return io;
};