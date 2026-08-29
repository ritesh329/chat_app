// import { Server } from 'socket.io';
// import jwt from 'jsonwebtoken';
// import dotenv from 'dotenv';

// dotenv.config();

// export const configureSocket = (server) => {
//   const io = new Server(server, {
//     cors: {
//       origin: ['http://localhost:5173'],
//       credentials: true,
//     },
//     transports: ['websocket', 'polling'],
//   });

//   // Authentication middleware
//   io.use((socket, next) => {
//     try {
//       const token = socket.handshake.auth.token;
//       if (!token) {
//         return next(new Error('Authentication required'));
//       }

//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       socket.userId = decoded.id;
//       socket.user = decoded;
//       next();
//     } catch (error) {
//       next(new Error('Invalid token'));
//     }
//   });

//   return io;
// };


import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const configureSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',

      credentials: true,

      methods: [
        'GET',
        'POST',
      ],
    },

    transports: [
      'websocket',
      'polling',
    ],

    /*
     * Connection recovery
     */
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,

      skipMiddlewares: false,
    },
  });

  /* ==========================================================
     SOCKET AUTH
     ========================================================== */

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token;

      if (!token) {
        return next(
          new Error(
            'Authentication required'
          )
        );
      }

      const decoded =
        jwt.verify(
          token,
          process.env.JWT_SECRET
        );

      if (!decoded?.id) {
        return next(
          new Error(
            'Invalid token payload'
          )
        );
      }

      socket.userId =
        String(decoded.id);

      socket.user =
        decoded;

      next();

    } catch (error) {
      console.error(
        'Socket authentication error:',
        error.message
      );

      next(
        new Error(
          'Invalid or expired token'
        )
      );
    }
  });

  return io;
};