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


  const onlineUsers = new Set();

  io.on('connection', async (socket) => {
    try {
      const userId = String(socket.userId);

      console.log(`🟢 User connected: ${userId}`);

    
      onlineUsers.add(userId);

      await User.findByIdAndUpdate(userId, {
        status: 'online',
        lastSeen: Date.now(),
      });

    
      socket.join(`user_${userId}`);

     
      socket.emit(
        'online-users',
        Array.from(onlineUsers)
      );

     
      socket.broadcast.emit(
        'user-online',
        {
          userId,
        }
      );

      
      handlePersonalChat(io, socket);
      handleGroupChat(io, socket);
      handleAI(io, socket);

      
      socket.on('disconnect', async () => {
        try {
          console.log(
            `🔴 User disconnected: ${userId}`
          );

        

          const connectedSockets =
            await io
              .in(`user_${userId}`)
              .fetchSockets();

         
          if (connectedSockets.length === 0) {
            onlineUsers.delete(userId);

            await User.findByIdAndUpdate(
              userId,
              {
                status: 'offline',
                lastSeen: Date.now(),
              }
            );

           
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