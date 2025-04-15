const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateLogin = [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

const validateRegistration = [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['admin', 'editor']).withMessage('Invalid role')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Admin only
router.post('/register', 
    protect, 
    authorize('admin'),
    validateRegistration,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { username, email, password, role } = req.body;

            // Check if user already exists
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists'
                });
            }

            // Create new user
            user = new User({
                username,
                email,
                password,
                role: role || 'editor'
            });

            await user.save();

            res.status(201).json({
                success: true,
                message: 'User registered successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error registering user',
                error: error.message
            });
        }
    }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Create and send token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            data: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting profile',
            error: error.message
        });
    }
});

// @route   PUT /api/auth/me
// @desc    Update user profile
// @access  Private
router.put('/me', protect, async (req, res) => {
    try {
        const { username, email } = req.body;
        const user = await User.findById(req.user.id);

        if (username) user.username = username;
        if (email) user.email = email;

        await user.save();

        res.json({
            success: true,
            data: user.getPublicProfile()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error.message
        });
    }
});

// @route   PUT /api/auth/password
// @desc    Change password
// @access  Private
router.put('/password', protect, 
    [body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { currentPassword, newPassword } = req.body;
            const user = await User.findById(req.user.id);

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            user.password = newPassword;
            await user.save();

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error changing password',
                error: error.message
            });
        }
    }
);

module.exports = router;
