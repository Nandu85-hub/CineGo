require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const startReservationCleanupJob = require('./jobs/reservationCleanup');
const { initSocket } = require('./socket');

const getAvailablePort = (preferredPort) => {
  const net = require('net');

  return new Promise((resolve, reject) => {
    const tester = net.createServer();

    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(getAvailablePort(preferredPort + 1));
      } else {
        reject(err);
      }
    });

    tester.once('listening', () => {
      tester.close(() => resolve(preferredPort));
    });

    tester.listen(preferredPort);
  });
};

connectDB().then(async () => {
  const preferredPort = Number(process.env.PORT) || 5000;
  const PORT = await getAvailablePort(preferredPort).catch((err) => {
    console.error('[ERROR] Unable to determine available port:', err);
    process.exit(1);
  });

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` Movie Booking Server is running on port: ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(` API Base URL: http://localhost:${PORT}/api`);
    console.log(` WebSockets: Socket.io active on port: ${PORT}`);
    console.log(`==================================================`);

    startReservationCleanupJob();
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[ERROR] Port ${PORT} is already in use. Please terminate the process using port ${PORT} or change PORT in .env.`);
    } else {
      console.error('[ERROR] Server error:', err);
    }
    process.exit(1);
  });

  const gracefulShutdown = (signal) => {
    server.close(() => {
      if (signal === 'SIGUSR2') {
        process.kill(process.pid, 'SIGUSR2');
      } else {
        process.exit(0);
      }
    });
  };

  process.once('SIGUSR2', () => gracefulShutdown('SIGUSR2'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
});


