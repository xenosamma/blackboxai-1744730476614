const { validationResult, body, param, query } = require('express-validator');
const { ErrorResponse } = require('./error');

// Middleware to check validation results
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array()
        });
    }
    next();
};

// Common validation rules
const validations = {
    // Content validations
    content: {
        create: [
            body('section')
                .notEmpty()
                .withMessage('Section is required')
                .isIn(['hero', 'impact', 'services', 'pricing', 'process', 'join', 'contact', 'footer'])
                .withMessage('Invalid section'),
            body('type')
                .notEmpty()
                .withMessage('Content type is required')
                .isIn(['text', 'image', 'list', 'form', 'stats'])
                .withMessage('Invalid content type'),
            body('order')
                .notEmpty()
                .withMessage('Order is required')
                .isInt({ min: 0 })
                .withMessage('Order must be a positive number'),
            body('content')
                .notEmpty()
                .withMessage('Content is required')
                .isObject()
                .withMessage('Content must be an object'),
            validateRequest
        ],
        update: [
            param('id')
                .isMongoId()
                .withMessage('Invalid content ID'),
            body('section')
                .optional()
                .isIn(['hero', 'impact', 'services', 'pricing', 'process', 'join', 'contact', 'footer'])
                .withMessage('Invalid section'),
            body('type')
                .optional()
                .isIn(['text', 'image', 'list', 'form', 'stats'])
                .withMessage('Invalid content type'),
            body('order')
                .optional()
                .isInt({ min: 0 })
                .withMessage('Order must be a positive number'),
            body('content')
                .optional()
                .isObject()
                .withMessage('Content must be an object'),
            validateRequest
        ]
    },

    // User validations
    user: {
        register: [
            body('username')
                .notEmpty()
                .withMessage('Username is required')
                .isLength({ min: 3 })
                .withMessage('Username must be at least 3 characters long')
                .matches(/^[a-zA-Z0-9_-]+$/)
                .withMessage('Username can only contain letters, numbers, underscores and hyphens'),
            body('email')
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Please enter a valid email')
                .normalizeEmail(),
            body('password')
                .notEmpty()
                .withMessage('Password is required')
                .isLength({ min: 6 })
                .withMessage('Password must be at least 6 characters long')
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
                .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
            body('role')
                .optional()
                .isIn(['admin', 'editor'])
                .withMessage('Invalid role'),
            validateRequest
        ],
        login: [
            body('email')
                .notEmpty()
                .withMessage('Email is required')
                .isEmail()
                .withMessage('Please enter a valid email')
                .normalizeEmail(),
            body('password')
                .notEmpty()
                .withMessage('Password is required'),
            validateRequest
        ],
        updateProfile: [
            body('username')
                .optional()
                .isLength({ min: 3 })
                .withMessage('Username must be at least 3 characters long')
                .matches(/^[a-zA-Z0-9_-]+$/)
                .withMessage('Username can only contain letters, numbers, underscores and hyphens'),
            body('email')
                .optional()
                .isEmail()
                .withMessage('Please enter a valid email')
                .normalizeEmail(),
            validateRequest
        ]
    },

    // Settings validations
    settings: {
        update: [
            body('theme')
                .optional()
                .isObject()
                .withMessage('Theme must be an object'),
            body('theme.primaryColor')
                .optional()
                .matches(/^#[0-9A-Fa-f]{6}$/)
                .withMessage('Invalid color format'),
            body('theme.secondaryColor')
                .optional()
                .matches(/^#[0-9A-Fa-f]{6}$/)
                .withMessage('Invalid color format'),
            body('layout')
                .optional()
                .isObject()
                .withMessage('Layout must be an object'),
            body('contact')
                .optional()
                .isObject()
                .withMessage('Contact must be an object'),
            body('contact.email')
                .optional()
                .isEmail()
                .withMessage('Please enter a valid email'),
            validateRequest
        ]
    },

    // Common parameter validations
    params: {
        id: [
            param('id')
                .isMongoId()
                .withMessage('Invalid ID format'),
            validateRequest
        ]
    },

    // Query validations
    query: {
        pagination: [
            query('page')
                .optional()
                .isInt({ min: 1 })
                .withMessage('Page must be a positive number'),
            query('limit')
                .optional()
                .isInt({ min: 1, max: 100 })
                .withMessage('Limit must be between 1 and 100'),
            validateRequest
        ]
    }
};

module.exports = validations;
