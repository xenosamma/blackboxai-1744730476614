const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');

const config = require('./config/config');
const logger = require('./config/logger');
const database = require('./config/database');
const { errorHandler, notFound } = require('./middleware/error');

// Import routes
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const settingsRoutes = require('./routes/settings');
const mediaRoutes = require('./routes/media');

// Initialize express app
const app = express();

// Connect to database
database.connect().catch(err => {
    logger.error('Database connection failed:', err);
    process.exit(1);
});

// Security middleware
app.use(helmet()); // Set security headers
app.use(cors(config.cors)); // Enable CORS
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Rate limiting
const limiter = rateLimit({
    windowMs: config.security.rateLimitWindow,
    max: config.security.rateLimitMax,
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev', { stream: logger.stream }));
}
app.use(logger.requestLogger);

// Static files
app.use('/uploads', express.static(path.join(__dirname, config.upload.path)));
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/media', mediaRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const dbStatus = await database.healthCheck();
        res.json({
            status: 'ok',
            timestamp: new Date(),
            database: dbStatus,
            environment: config.server.env,
            version: process.env.npm_package_version
        });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Health check failed',
            timestamp: new Date()
        });
    }
});

// Admin panel routes
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/login.html'));
});

app.get('/admin/content', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/content.html'));
});

app.get('/admin/media', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/media.html'));
});

app.get('/admin/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/settings.html'));
});

// Frontend routes
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle frontend routing
app.get('*', (req, res) => {
    // Exclude API and admin routes
    if (!req.path.startsWith('/api') && !req.path.startsWith('/admin')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = config.server.port;
const server = app.listen(PORT, () => {
    logger.info(`Server running in ${config.server.env} mode on port ${PORT}`);
    logger.info(`Admin panel available at http://localhost:${PORT}/admin`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Process terminated');
        database.handleTermination();
    });
});

module.exports = app;
