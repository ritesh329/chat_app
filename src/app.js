// import express from 'express';
// import cors from 'cors';
// import helmet from 'helmet';
// import rateLimit from 'express-rate-limit';
// import dotenv from 'dotenv';
// import connectDB from './config/db.js';

// // Import routes
// import authRoutes from './routes/auth.js';
// import chatRoutes from './routes/chat.js';
// import groupRoutes from './routes/group.js';
// import aiRoutes from './routes/ai.js';
// import uploadRoutes from './routes/upload.js'; // ADD THIS

// dotenv.config();

// const app = express();

// // Connect to database
// connectDB();

// // Security middleware
// app.use(helmet());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // Limit each IP to 100 requests per windowMs
// });


// // CORS
// app.use(
//   cors({
//     origin: ['http://localhost:5173'],
//     credentials: true,
//   })
// );


// app.use('/api', limiter);

// // Body parser
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// // Static files
// app.use('/uploads', express.static('uploads'));

// // ============= ROUTES =============
// // Health check
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     timestamp: new Date(),
//     uptime: process.uptime(),
//   });
// });

// app.get('/', (req, res) => {
//   res.json({
//     message: '🚀 ConnectAI Server is Running!',
//     version: '1.0.0',
//     status: 'active',
//     endpoints: {
//       health: '/health',
//       api: '/api',
//       auth: '/api/auth',
//       chat: '/api/chat',
//       group: '/api/group',
//       ai: '/api/ai',
//       upload: '/api/upload', // ADD THIS
//     }
//   });
// });

// // API Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/chat', chatRoutes);
// app.use('/api/group', groupRoutes);
// app.use('/api/ai', aiRoutes);
// app.use('/api/upload', uploadRoutes); // ADD THIS

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`,
//   });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error('❌ Error:', err.message);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal server error',
//     error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
//   });
// });

// export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import groupRoutes from './routes/group.js';
import aiRoutes from './routes/ai.js';
import uploadRoutes from './routes/upload.js';

dotenv.config();

const app = express();
app.set('trust proxy', 1);



connectDB();


app.use(helmet());



const allowedOrigins = [
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
     
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log(
        '❌ CORS blocked:',
        origin
      );

      return callback(
        new Error('Not allowed by CORS')
      );
    },

    credentials: true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],

    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
  })
);


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 300,

  standardHeaders: true,

  legacyHeaders: false,

  message: {
    success: false,
    message:
      'Too many requests. Please try again later.',
  },
});

app.use(
  '/api',
  limiter
);



app.use(
  express.json({
    limit: '50mb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '50mb',
  })
);



app.use(
  '/uploads',
  express.static('uploads')
);



app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});



app.get('/', (req, res) => {
  res.json({
    message:
      '🚀 ConnectAI Server is Running!',

    version: '1.0.0',

    status: 'active',

    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      chat: '/api/chat',
      group: '/api/group',
      ai: '/api/ai',
      upload: '/api/upload',
    },
  });
});



app.use(
  '/api/auth',
  authRoutes
);

app.use(
  '/api/chat',
  chatRoutes
);

app.use(
  '/api/group',
  groupRoutes
);

app.use(
  '/api/ai',
  aiRoutes
);

app.use(
  '/api/upload',
  uploadRoutes
);



app.use((req, res) => {
  res.status(404).json({
    success: false,
    message:
      `Route ${req.originalUrl} not found`,
  });
});



app.use(
  (err, req, res, next) => {
    console.error(
      '❌ Error:',
      err.message
    );

  
    if (
      err.message ===
      'Not allowed by CORS'
    ) {
      return res.status(403).json({
        success: false,
        message:
          'CORS origin not allowed',
      });
    }

    res.status(
      err.status || 500
    ).json({
      success: false,

      message:
        err.message ||
        'Internal server error',

      error:
        process.env.NODE_ENV ===
        'development'
          ? err.stack
          : undefined,
    });
  }
);

export default app;
