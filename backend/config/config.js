const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const config = {
    // Server configuration
    server: {
        port: process.env.PORT || 8000,
        env: process.env.NODE_ENV || 'development',
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpire: process.env.JWT_EXPIRE || '1d'
    },

    // Database configuration
    database: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/pwr-cms',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    },

    // File upload configuration
    upload: {
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880, // 5MB
        path: process.env.UPLOAD_PATH || 'uploads',
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    },

    // Admin configuration
    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@preciouswasterefinery.com',
        password: process.env.ADMIN_PASSWORD || 'changeme123'
    },

    // CORS configuration
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['http://localhost:8000', 'http://localhost:3000'],
        credentials: true
    },

    // Email configuration
    email: {
        smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        },
        from: {
            email: process.env.FROM_EMAIL || 'noreply@preciouswasterefinery.com',
            name: process.env.FROM_NAME || 'Precious Waste Refinery'
        }
    },

    // Security configuration
    security: {
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100, // requests per window
        passwordMinLength: 6,
        bcryptSaltRounds: 10
    },

    // Logging configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        file: process.env.LOG_FILE || 'logs/app.log'
    },

    // Content configuration
    content: {
        defaultLanguage: 'en',
        supportedLanguages: ['en'],
        perPage: 10,
        maxTitleLength: 100,
        maxDescriptionLength: 500
    },

    // Cache configuration
    cache: {
        enabled: process.env.CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.CACHE_TTL) || 3600 // 1 hour
    }
};

// Validation function to ensure all required environment variables are set
const validateConfig = () => {
    const required = [
        'JWT_SECRET',
        'MONGODB_URI'
    ];

    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
};

// Validate in non-development environments
if (process.env.NODE_ENV !== 'development') {
    validateConfig();
}

module.exports = config;
