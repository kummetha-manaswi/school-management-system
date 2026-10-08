const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.CLIENT_ORIGIN === '*' ? '*' : [env.CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

// Request logging in development
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Request body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health ping fallback
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Welcome to the School Management System API. Visit /api/health for system status.',
  });
});

// Centralized API routes
app.use('/api', routes);

// 404 Route Not Found middleware
app.use(notFound);

// Centralized Error Handler middleware
app.use(errorHandler);

module.exports = app;
