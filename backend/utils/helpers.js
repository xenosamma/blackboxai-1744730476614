const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const config = require('../config/config');
const logger = require('../config/logger');

const helpers = {
    /**
     * Generate a random token
     * @param {number} bytes - Number of bytes for the token
     * @returns {string} Random token
     */
    generateToken: (bytes = 32) => {
        return crypto.randomBytes(bytes).toString('hex');
    },

    /**
     * Handle file upload
     * @param {Object} file - File object from multer
     * @param {string} directory - Directory to save the file
     * @returns {Promise<string>} File path
     */
    async handleFileUpload(file, directory) {
        try {
            const fileName = `${Date.now()}-${file.originalname}`;
            const uploadPath = path.join(config.upload.path, directory);
            
            // Create directory if it doesn't exist
            await fs.mkdir(uploadPath, { recursive: true });
            
            const filePath = path.join(uploadPath, fileName);
            await fs.writeFile(filePath, file.buffer);
            
            return path.join(directory, fileName);
        } catch (error) {
            logger.error('File upload error:', error);
            throw new Error('File upload failed');
        }
    },

    /**
     * Delete a file
     * @param {string} filePath - Path to the file
     * @returns {Promise<void>}
     */
    async deleteFile(filePath) {
        try {
            const fullPath = path.join(config.upload.path, filePath);
            await fs.unlink(fullPath);
        } catch (error) {
            logger.error('File deletion error:', error);
            throw new Error('File deletion failed');
        }
    },

    /**
     * Sanitize object for MongoDB
     * @param {Object} obj - Object to sanitize
     * @returns {Object} Sanitized object
     */
    sanitizeObject(obj) {
        const sanitized = {};
        Object.keys(obj).forEach(key => {
            if (obj[key] !== null && obj[key] !== undefined) {
                sanitized[key] = obj[key];
            }
        });
        return sanitized;
    },

    /**
     * Format error message
     * @param {Error} error - Error object
     * @returns {Object} Formatted error
     */
    formatError(error) {
        return {
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
    },

    /**
     * Parse query parameters for pagination
     * @param {Object} query - Query object
     * @returns {Object} Pagination options
     */
    getPaginationOptions(query) {
        const page = parseInt(query.page, 10) || 1;
        const limit = parseInt(query.limit, 10) || config.content.perPage;
        const skip = (page - 1) * limit;

        return {
            page,
            limit,
            skip
        };
    },

    /**
     * Format pagination response
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @param {number} total - Total items
     * @param {Array} data - Data array
     * @returns {Object} Formatted response
     */
    formatPaginationResponse(page, limit, total, data) {
        return {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            hasMore: page * limit < total,
            data
        };
    },

    /**
     * Validate image file
     * @param {Object} file - File object
     * @returns {boolean} Is valid image
     */
    isValidImage(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        return allowedTypes.includes(file.mimetype);
    },

    /**
     * Format date for display
     * @param {Date} date - Date object
     * @returns {string} Formatted date
     */
    formatDate(date) {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Generate slug from string
     * @param {string} text - Text to slugify
     * @returns {string} Slug
     */
    generateSlug(text) {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    },

    /**
     * Deep clone object
     * @param {Object} obj - Object to clone
     * @returns {Object} Cloned object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Check if object is empty
     * @param {Object} obj - Object to check
     * @returns {boolean} Is empty
     */
    isEmpty(obj) {
        return Object.keys(obj).length === 0;
    },

    /**
     * Generate random password
     * @param {number} length - Password length
     * @returns {string} Random password
     */
    generatePassword(length = 12) {
        const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }
        return password;
    },

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} Is valid email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

module.exports = helpers;
