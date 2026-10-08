const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  // Connect to database (graceful fallback if URI not set in foundation)
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`===============================================`);
    console.log(`🚀 School Management Backend Server Running`);
    console.log(`📡 URL: http://localhost:${env.PORT}`);
    console.log(`🏥 Health Check: http://localhost:${env.PORT}/api/health`);
    console.log(`⚙️  Environment: ${env.NODE_ENV}`);
    console.log(`===============================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });

  // Graceful shutdown on termination signal
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing HTTP server gracefully.');
    server.close(() => {
      console.log('HTTP server closed.');
    });
  });
};

startServer();
