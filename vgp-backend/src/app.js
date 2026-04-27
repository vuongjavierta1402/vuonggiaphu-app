const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const routes       = require('./routes');
const notFound     = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS — allow the React dev server (and any configured origin)
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: false,
}));

// Request logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing — product descriptions can be large HTML
app.use(express.json({ limit: '2mb' }));

// Health check (intentionally before API routes, returns JSON)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: Date.now() }));

// All versioned API routes
app.use('/api/v1', routes);

// 404 handler — must come after all routes
app.use(notFound);

// Global error handler — must come last, must have 4 params
app.use(errorHandler);

module.exports = app;
