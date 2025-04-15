const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Create Settings model inline since it's specific to this route
const mongoose = require('mongoose');
const SettingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: mongoose.Schema.Types.Mixed,
    category: {
        type: String,
        required: true,
        enum: ['theme', 'layout', 'contact', 'seo', 'features']
    },
    description: String,
    lastModified: {
        type: Date,
        default: Date.now
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Settings = mongoose.model('Settings', SettingsSchema);

// Default settings configuration
const defaultSettings = {
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

// Initialize settings if they don't exist
const initializeSettings = async () => {
    try {
        for (const [category, settings] of Object.entries(defaultSettings)) {
            for (const [key, value] of Object.entries(settings)) {
                const settingExists = await Settings.findOne({ key });
                if (!settingExists) {
                    await Settings.create({
                        key,
                        value,
                        category,
                        description: `Default setting for ${key}`
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error initializing settings:', error);
    }
};

initializeSettings();

// @route   GET /api/settings
// @desc    Get all settings
// @access  Public
router.get('/', async (req, res) => {
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

        res.json({
            success: true,
            data: groupedSettings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching settings',
            error: error.message
        });
    }
});

// @route   GET /api/settings/:category
// @desc    Get settings by category
// @access  Public
router.get('/:category', async (req, res) => {
    try {
        const settings = await Settings.find({ category: req.params.category });
        
        const categorySettings = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {});

        res.json({
            success: true,
            data: categorySettings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching category settings',
            error: error.message
        });
    }
});

// @route   PUT /api/settings/:category
// @desc    Update settings by category
// @access  Private (Admin only)
router.put('/:category',
    protect,
    authorize('admin'),
    checkPermission('manage_settings'),
    async (req, res) => {
        try {
            const updates = req.body;
            const category = req.params.category;

            // Validate category
            if (!Object.keys(defaultSettings).includes(category)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid settings category'
                });
            }

            // Update each setting in the category
            const updatePromises = Object.entries(updates).map(([key, value]) =>
                Settings.findOneAndUpdate(
                    { key, category },
                    {
                        value,
                        lastModified: Date.now(),
                        modifiedBy: req.user.id
                    },
                    { new: true }
                )
            );

            await Promise.all(updatePromises);

            // Fetch updated settings
            const updatedSettings = await Settings.find({ category });

            res.json({
                success: true,
                message: 'Settings updated successfully',
                data: updatedSettings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating settings',
                error: error.message
            });
        }
    }
);

// @route   PUT /api/settings/reset/:category
// @desc    Reset category settings to default
// @access  Private (Admin only)
router.put('/reset/:category',
    protect,
    authorize('admin'),
    checkPermission('manage_settings'),
    async (req, res) => {
        try {
            const category = req.params.category;

            if (!defaultSettings[category]) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid category'
                });
            }

            // Reset to default values
            const resetPromises = Object.entries(defaultSettings[category]).map(([key, value]) =>
                Settings.findOneAndUpdate(
                    { key },
                    {
                        value,
                        lastModified: Date.now(),
                        modifiedBy: req.user.id
                    },
                    { new: true }
                )
            );

            await Promise.all(resetPromises);

            res.json({
                success: true,
                message: `${category} settings reset to default`,
                data: defaultSettings[category]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error resetting settings',
                error: error.message
            });
        }
    }
);

module.exports = router;
