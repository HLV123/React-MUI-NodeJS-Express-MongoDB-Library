const app = require('./src/app');
const config = require('./src/config');
const connectDB = require('./src/config/database');

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start server
    const server = app.listen(config.port, () => {
      console.log('');
      console.log('========================================');
      console.log('🚀 SAPARETHERE LIBRARY API SERVER');
      console.log('========================================');
      console.log(`📡 Environment: ${config.env}`);
      console.log(`🌐 Server running on: http://localhost:${config.port}`);
      console.log(`📚 API Base URL: http://localhost:${config.port}/api`);
      console.log('========================================');
      console.log('');
      console.log('📌 Available endpoints:');
      console.log('   GET  /api/health          - Health check');
      console.log('   POST /api/auth/register   - Register');
      console.log('   POST /api/auth/login      - Login');
      console.log('   GET  /api/books           - List books');
      console.log('   GET  /api/categories      - List categories');
      console.log('');
      console.log('📖 Test accounts:');
      console.log('   Admin: admin@saparethere.com / admin123456');
      console.log('   User:  bons@gmail.com / user123456');
      console.log('========================================');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION! Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated.');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
