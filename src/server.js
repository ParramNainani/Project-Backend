const app = require('./app');
const config = require('./config');

const server = app.listen(config.port, () => {
  console.log(`\n🚀 Zorvyn Finance Dashboard API`);
  console.log(`   Environment : ${config.nodeEnv}`);
  console.log(`   Port        : ${config.port}`);
  console.log(`   Health      : http://localhost:${config.port}/health`);
  console.log(`   API Base    : http://localhost:${config.port}/api\n`);
});

// Keep-alive: Prisma 7's adapter-pg unrefs the event loop
// This ensures the server process stays running
server.ref();

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
