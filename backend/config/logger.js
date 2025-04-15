const winston = require('winston');
const path = require('path');
const config = require('./config');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Create log directory if it doesn't exist
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, align } = format;

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
    let msg = `${timestamp} [${level}] : ${message}`;
    if (Object.keys(metadata).length > 0) {
        msg += JSON.stringify(metadata, null, 2);
    }
    return msg;
});

// Create the logger
const logger = createLogger({
    level: config.logging.level,
    format: combine(
        timestamp(),
        logFormat
    ),
    transports: [
        // Write all logs to file
        new transports.File({
            filename: path.join(process.cwd(), config.logging.file),
            format: format.combine(
                format.timestamp(),
                format.json()
            )
        }),
        // Write errors to separate file
        new transports.File({
            filename: path.join(process.cwd(), 'logs/error.log'),
            level: 'error',
            format: format.combine(
                format.timestamp(),
                format.json()
            )
        })
    ],
    // Handle uncaught exceptions and unhandled rejections
    exceptionHandlers: [
        new transports.File({
            filename: path.join(process.cwd(), 'logs/exceptions.log')
        })
    ],
    rejectionHandlers: [
        new transports.File({
            filename: path.join(process.cwd(), 'logs/rejections.log')
        })
    ]
});

// Add console transport in development environment
if (process.env.NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: combine(
            colorize(),
            timestamp(),
            align(),
            consoleFormat
        )
    }));
}

// Create a stream object for Morgan middleware
logger.stream = {
    write: (message) => logger.info(message.trim())
};

// Custom logging methods
logger.logAPIRequest = (req, startTime) => {
    const duration = Date.now() - startTime;
    logger.info('API Request', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        ip: req.ip,
        user: req.user ? req.user.id : 'anonymous'
    });
};

logger.logAPIResponse = (req, res, startTime) => {
    const duration = Date.now() - startTime;
    logger.info('API Response', {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        user: req.user ? req.user.id : 'anonymous'
    });
};

logger.logError = (error, req = null) => {
    const errorLog = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    };

    if (req) {
        errorLog.method = req.method;
        errorLog.url = req.originalUrl;
        errorLog.ip = req.ip;
        errorLog.user = req.user ? req.user.id : 'anonymous';
    }

    logger.error('Application Error', errorLog);
};

// Middleware for logging requests
logger.requestLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Log request
    logger.logAPIRequest(req, startTime);

    // Log response
    res.on('finish', () => {
        logger.logAPIResponse(req, res, startTime);
    });

    next();
};

// Error logging middleware
logger.errorHandler = (err, req, res, next) => {
    logger.logError(err, req);
    next(err);
};

// Export logger instance
module.exports = logger;
