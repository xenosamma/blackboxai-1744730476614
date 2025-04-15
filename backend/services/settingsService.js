const Settings = require('../models/Settings');
const logger = require('../config/logger');
const helpers = require('../utils/helpers');
const { ErrorResponse } = require('../middleware/error');
const config = require('../config/config');

class SettingsService {
    /**
     * Get all settings
     * @returns {Promise<Object>} Settings grouped by category
     */
    async getAllSettings() {
        try {
            const settings = await Settings.find().select('-__v');
            
            // Group settings by category
            const groupedSettings = settings.reduce((acc, setting) => {
                if (!acc[setting.category]) {
                    acc[setting.category] = {};
                }
                acc[setting.category][setting.key] = setting.value;
                return acc;
            }, {});

            return groupedSettings;
        } catch (error) {
            logger.error('Error getting all settings:', error);
            throw new ErrorResponse('Error retrieving settings', 500);
        }
    }

    /**
     * Get settings by category
     * @param {string} category - Settings category
     * @returns {Promise<Object>} Category settings
     */
    async getSettingsByCategory(category) {
        try {
            const settings = await Settings.find({ category });
            
            if (!settings.length) {
                throw new ErrorResponse(`No settings found for category: ${category}`, 404);
            }

            const categorySettings = settings.reduce((acc, setting) => {
                acc[setting.key] = setting.value;
                return acc;
            }, {});

            return categorySettings;
        } catch (error) {
            logger.error(`Error getting settings for category ${category}:`, error);
            throw error;
        }
    }

    /**
     * Update settings
     * @param {string} category - Settings category
     * @param {Object} updates - Settings updates
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Updated settings
     */
    async updateSettings(category, updates, userId) {
        try {
            // Validate category
            if (!this.isValidCategory(category)) {
                throw new ErrorResponse('Invalid settings category', 400);
            }

            // Sanitize updates
            const sanitizedUpdates = helpers.sanitizeObject(updates);

            // Update each setting in the category
            const updatePromises = Object.entries(sanitizedUpdates).map(([key, value]) =>
                Settings.findOneAndUpdate(
                    { key, category },
                    {
                        value,
                        lastModified: Date.now(),
                        modifiedBy: userId
                    },
                    { new: true }
                )
            );

            await Promise.all(updatePromises);

            // Fetch updated settings
            const updatedSettings = await this.getSettingsByCategory(category);
            
            logger.info(`Settings updated for category: ${category}`);
            return updatedSettings;
        } catch (error) {
            logger.error(`Error updating settings for category ${category}:`, error);
            throw error;
        }
    }

    /**
     * Reset category settings to default
     * @param {string} category - Settings category
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Default settings
     */
    async resetCategoryToDefault(category, userId) {
        try {
            const defaultSettings = this.getDefaultSettings(category);
            if (!defaultSettings) {
                throw new ErrorResponse('Invalid category', 400);
            }

            // Reset to default values
            const resetPromises = Object.entries(defaultSettings).map(([key, value]) =>
                Settings.findOneAndUpdate(
                    { key },
                    {
                        value,
                        lastModified: Date.now(),
                        modifiedBy: userId
                    },
                    { new: true }
                )
            );

            await Promise.all(resetPromises);
            
            logger.info(`Settings reset to default for category: ${category}`);
            return defaultSettings;
        } catch (error) {
            logger.error(`Error resetting settings for category ${category}:`, error);
            throw error;
        }
    }

    /**
     * Initialize settings if they don't exist
     * @returns {Promise<void>}
     */
    async initializeSettings() {
        try {
            const categories = ['theme', 'layout', 'contact', 'seo', 'features'];
            
            for (const category of categories) {
                const defaultSettings = this.getDefaultSettings(category);
                
                for (const [key, value] of Object.entries(defaultSettings)) {
                    const settingExists = await Settings.findOne({ key });
                    
                    if (!settingExists) {
                        await Settings.create({
                            key,
                            value,
                            category,
                            description: `Default setting for ${key}`
                        });
                        logger.info(`Initialized setting: ${key}`);
                    }
                }
            }
        } catch (error) {
            logger.error('Error initializing settings:', error);
            throw error;
        }
    }

    /**
     * Get settings history
     * @param {string} category - Settings category
     * @returns {Promise<Array>} Settings history
     */
    async getSettingsHistory(category) {
        try {
            const history = await Settings.find({ category })
                .populate('modifiedBy', 'username email')
                .select('key value lastModified modifiedBy')
                .sort('-lastModified');

            return history;
        } catch (error) {
            logger.error(`Error getting settings history for ${category}:`, error);
            throw new ErrorResponse('Error retrieving settings history', 500);
        }
    }

    /**
     * Validate settings category
     * @param {string} category - Category to validate
     * @returns {boolean} Is valid category
     */
    isValidCategory(category) {
        const validCategories = ['theme', 'layout', 'contact', 'seo', 'features'];
        return validCategories.includes(category);
    }

    /**
     * Get default settings for category
     * @param {string} category - Settings category
     * @returns {Object} Default settings
     */
    getDefaultSettings(category) {
        const defaults = {
            theme: {
                primaryColor: '#2F855A',
                secondaryColor: '#276749',
                accentColor: '#48BB78',
                backgroundColor: '#FFFFFF',
                textColor: '#1A202C',
                fontPrimary: 'Poppins',
                fontSecondary: 'Inter'
            },
            layout: {
                containerWidth: '1200px',
                spacing: {
                    section: '4rem',
                    element: '1rem'
                },
                borderRadius: '0.5rem'
            },
            contact: {
                email: 'info@preciouswasterefinery.com',
                phone: '+1 234 567 890',
                address: '123 Eco Street, Green City',
                socialMedia: {
                    facebook: '',
                    twitter: '',
                    instagram: '',
                    linkedin: ''
                }
            },
            seo: {
                title: 'Precious Waste Refinery - Responsible E-Waste Recycling',
                description: 'Professional e-waste recycling services for a sustainable future',
                keywords: ['e-waste', 'recycling', 'electronics', 'sustainability'],
                googleAnalyticsId: ''
            },
            features: {
                enableBlog: true,
                enableNewsletter: true,
                enableChat: false,
                enableAnalytics: true
            }
        };

        return defaults[category];
    }
}

module.exports = new SettingsService();
