const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const logger = require('../config/logger');
const helpers = require('../utils/helpers');
const { ErrorResponse } = require('../middleware/error');

class UserService {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise<Object>} Created user
     */
    async registerUser(userData) {
        try {
            const { email } = userData;

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new ErrorResponse('User already exists', 400);
            }

            // Create new user
            const user = await User.create(userData);
            logger.info(`New user registered: ${user.email}`);

            return user.getPublicProfile();
        } catch (error) {
            logger.error('Error registering user:', error);
            throw error;
        }
    }

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login response with token
     */
    async loginUser(email, password) {
        try {
            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                throw new ErrorResponse('Invalid credentials', 401);
            }

            // Check password
            const isMatch = await user.comparePassword(password);
            if (!isMatch) {
                throw new ErrorResponse('Invalid credentials', 401);
            }

            // Check if user is active
            if (!user.isActive) {
                throw new ErrorResponse('Account is deactivated', 401);
            }

            // Update last login
            user.lastLogin = Date.now();
            await user.save();

            // Generate token
            const token = this.generateToken(user._id);

            logger.info(`User logged in: ${user.email}`);

            return {
                token,
                user: user.getPublicProfile()
            };
        } catch (error) {
            logger.error('Error logging in user:', error);
            throw error;
        }
    }

    /**
     * Get user profile
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile
     */
    async getUserProfile(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new ErrorResponse('User not found', 404);
            }

            return user.getPublicProfile();
        } catch (error) {
            logger.error(`Error getting user profile ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated user profile
     */
    async updateUserProfile(userId, updateData) {
        try {
            // Sanitize update data
            const sanitizedData = helpers.sanitizeObject(updateData);

            const user = await User.findByIdAndUpdate(
                userId,
                sanitizedData,
                { new: true, runValidators: true }
            );

            if (!user) {
                throw new ErrorResponse('User not found', 404);
            }

            logger.info(`User profile updated: ${user.email}`);
            return user.getPublicProfile();
        } catch (error) {
            logger.error(`Error updating user profile ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Change user password
     * @param {string} userId - User ID
     * @param {string} currentPassword - Current password
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new ErrorResponse('User not found', 404);
            }

            // Verify current password
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                throw new ErrorResponse('Current password is incorrect', 401);
            }

            // Update password
            user.password = newPassword;
            await user.save();

            logger.info(`Password changed for user: ${user.email}`);
        } catch (error) {
            logger.error(`Error changing password for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<string>} Reset token
     */
    async requestPasswordReset(email) {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                throw new ErrorResponse('User not found', 404);
            }

            // Generate reset token
            const resetToken = helpers.generateToken();
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            await user.save();

            logger.info(`Password reset requested for user: ${email}`);
            return resetToken;
        } catch (error) {
            logger.error(`Error requesting password reset for ${email}:`, error);
            throw error;
        }
    }

    /**
     * Reset password
     * @param {string} token - Reset token
     * @param {string} newPassword - New password
     * @returns {Promise<void>}
     */
    async resetPassword(token, newPassword) {
        try {
            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                throw new ErrorResponse('Invalid or expired reset token', 400);
            }

            // Update password and clear reset token
            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            logger.info(`Password reset completed for user: ${user.email}`);
        } catch (error) {
            logger.error('Error resetting password:', error);
            throw error;
        }
    }

    /**
     * Generate JWT token
     * @param {string} userId - User ID
     * @returns {string} JWT token
     */
    generateToken(userId) {
        return jwt.sign(
            { id: userId },
            config.server.jwtSecret,
            { expiresIn: config.server.jwtExpire }
        );
    }

    /**
     * Get all users (admin only)
     * @param {Object} query - Query parameters
     * @returns {Promise<Object>} Paginated users
     */
    async getAllUsers(query) {
        try {
            const { page, limit, skip } = helpers.getPaginationOptions(query);
            
            const total = await User.countDocuments();
            const users = await User.find()
                .select('-password -resetPasswordToken -resetPasswordExpires')
                .skip(skip)
                .limit(limit);

            return helpers.formatPaginationResponse(page, limit, total, users);
        } catch (error) {
            logger.error('Error getting all users:', error);
            throw new ErrorResponse('Error retrieving users', 500);
        }
    }

    /**
     * Delete user (admin only)
     * @param {string} userId - User ID
     * @returns {Promise<void>}
     */
    async deleteUser(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new ErrorResponse('User not found', 404);
            }

            await user.remove();
            logger.info(`User deleted: ${user.email}`);
        } catch (error) {
            logger.error(`Error deleting user ${userId}:`, error);
            throw error;
        }
    }
}

module.exports = new UserService();
