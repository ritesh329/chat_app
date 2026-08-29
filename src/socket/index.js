// import { configureSocket } from '../config/socket.js';
// import { handlePersonalChat } from './personalChat.js';
// import { handleGroupChat } from './groupChat.js';
// import { handleAI } from './aiHandler.js';
// import User from '../models/User.js';
// import Message from '../models/Message.js';

// export const setupSocketIO = (server) => {
//   const io = configureSocket(server);

//   io.on('connection', async (socket) => {
//     console.log(`🟢 User connected: ${socket.userId}`);

//     // Update user status
//     await User.findByIdAndUpdate(socket.userId, {
//       status: 'online',
//       lastSeen: Date.now(),
//     });

//     // Broadcast online status
//     socket.broadcast.emit('user-online', { userId: socket.userId });

//     // Join user's personal room
//     socket.join(`user_${socket.userId}`);

//     // Setup handlers
//     handlePersonalChat(io, socket);
//     handleGroupChat(io, socket);
//     handleAI(io, socket);

//     // Disconnect handler
//     socket.on('disconnect', async () => {
//       console.log(`🔴 User disconnected: ${socket.userId}`);
      
//       await User.findByIdAndUpdate(socket.userId, {
//         status: 'offline',
//         lastSeen: Date.now(),
//       });

//       socket.broadcast.emit('user-offline', { userId: socket.userId });
//     });
//   });

//   return io;
// };


import { configureSocket } from '../config/socket.js';
import { handlePersonalChat } from './personalChat.js';
import { handleGroupChat } from './groupChat.js';
import { handleAI } from './aiHandler.js';
import User from '../models/User.js';

export const setupSocketIO = (server) => {
  const io = configureSocket(server);

  // ============================================================
  // CURRENTLY ONLINE USERS
  // ============================================================
  const onlineUsers = new Set();

  io.on('connection', async (socket) => {
    try {
      const userId = String(socket.userId);

      console.log(`🟢 User connected: ${userId}`);

      // ========================================================
      // ADD USER TO ONLINE LIST
      // ========================================================
      onlineUsers.add(userId);

      // ========================================================
      // UPDATE DATABASE STATUS
      // ========================================================
      await User.findByIdAndUpdate(userId, {
        status: 'online',
        lastSeen: Date.now(),
      });

      // ========================================================
      // JOIN PERSONAL ROOM
      // ========================================================
      socket.join(`user_${userId}`);

      // ========================================================
      // SEND CURRENT ONLINE USERS TO NEWLY CONNECTED USER
      // ========================================================
      socket.emit(
        'online-users',
        Array.from(onlineUsers)
      );

      // ========================================================
      // TELL OTHER USERS THAT THIS USER IS ONLINE
      // ========================================================
      socket.broadcast.emit(
        'user-online',
        {
          userId,
        }
      );

      // ========================================================
      // SETUP CHAT HANDLERS
      // ========================================================
      handlePersonalChat(io, socket);
      handleGroupChat(io, socket);
      handleAI(io, socket);

      // ========================================================
      // DISCONNECT
      // ========================================================
      socket.on('disconnect', async () => {
        try {
          console.log(
            `🔴 User disconnected: ${userId}`
          );

          /*
           * IMPORTANT:
           *
           * Same user multiple tabs/devices se connected
           * ho sakta hai.
           *
           * Isliye pehle check karenge ki user ke aur
           * sockets connected hain ya nahi.
           */

          const connectedSockets =
            await io
              .in(`user_${userId}`)
              .fetchSockets();

          // Agar koi aur socket connected nahi hai
          if (connectedSockets.length === 0) {
            onlineUsers.delete(userId);

            await User.findByIdAndUpdate(
              userId,
              {
                status: 'offline',
                lastSeen: Date.now(),
              }
            );

            // Baaki users ko offline batao
            io.emit(
              'user-offline',
              {
                userId,
              }
            );
          }

        } catch (error) {
          console.error(
            'Disconnect error:',
            error
          );
        }
      });

    } catch (error) {
      console.error(
        'Socket connection error:',
        error
      );
    }
  });

  return io;
};