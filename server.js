import http from 'http';
import app from './src/app.js';
import { setupSocketIO } from './src/socket/index.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = setupSocketIO(server);

// Start server
server.listen(PORT, () => {
  console.log(`\n🚀 ====================================`);
  console.log(`   ConnectAI Server is Running!`);
  console.log(`   📡 http://localhost:${PORT}`);
  console.log(`   🔌 Socket.IO server ready`);
  console.log(`   🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🚀 ====================================\n`);
});

// Handle shutdown
const shutdown = () => {
  console.log('\n🔄 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default server;