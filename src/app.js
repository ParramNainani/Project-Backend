const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');

const app = express();

// ── Security & Parsing ──
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Request Logging ──
app.use(morgan('dev'));

// ── Health Check ──
app.get('/health', async (_req, res) => {
  try {
    const prisma = require('./config/prisma');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database disconnected' });
  }
});

// ── API Routes ──
app.use('/api', routes);

// ── Root Route ──
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Welcome to the Zorvyn Finance Dashboard API!' });
});

// ── 404 Handler ──
app.use((_req, _res, next) => {
  next(ApiError.notFound('Route not found'));
});

// ── Global Error Handler ──
app.use(errorHandler);

module.exports = app;
