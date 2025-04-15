require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const config = require('../config/config');
const User = require('../models/User');
const Content = require('../models/Content');
const Settings = require('../models/Settings');
const logger = require('../config/logger');

const defaultContent = {
    hero: {
        section: 'hero',
        type: 'text',
        order: 1,
        content: {
            title: 'Transform E-Waste into a Greener Future',
            subtitle: 'Responsible E-Waste Recycling',
            description: 'Join us in our mission to responsibly recycle electronic waste and create a sustainable tomorrow.',
            buttons: [
                {
                    text: 'Start Recycling',
                    link: '/recycle',
                    style: 'primary'
                },
                {
                    text: 'Learn More',
                    link: '#about',
                    style: 'secondary'
                }
            ]
        }
    },
    impact: {
        section: 'impact',
        type: 'stats',
        order: 2,
        content: {
            title: 'Our Environmental Impact',
            stats: [
                {
                    value: '10000+',
                    label: 'Devices Recycled',
                    icon: 'fa-mobile-alt'
                },
                {
                    value: '500+',
                    label: 'Trees Saved',
                    icon: 'fa-tree'
                },
                {
                    value: '1000+',
                    label: 'Happy Customers',
                    icon: 'fa-smile'
                }
            ]
        }
    },
    services: {
        section: 'services',
        type: 'list',
        order: 3,
        content: {
            title: 'Our Services',
            description: 'Professional e-waste recycling solutions for individuals and businesses',
            items: [
                {
                    title: 'Device Collection',
                    description: 'Convenient pickup service for your electronic waste',
                    icon: 'fa-truck'
                },
                {
                    title: 'Data Destruction',
                    description: 'Secure data wiping and physical destruction services',
                    icon: 'fa-shield-alt'
                },
                {
                    title: 'Recycling Process',
                    description: 'Environmentally responsible recycling methods',
                    icon: 'fa-recycle'
                }
            ]
        }
    }
};

const defaultAdmin = {
    username: 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@preciouswasterefinery.com',
    password: process.env.ADMIN_PASSWORD || 'changeme123',
    role: 'admin',
    permissions: [
        'manage_content',
        'manage_users',
        'manage_settings',
        'view_analytics',
        'manage_media'
    ],
    isActive: true
};

async function initializeCMS() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.database.uri, config.database.options);
        logger.info('Connected to MongoDB');

        // Create admin user if it doesn't exist
        const adminExists = await User.findOne({ email: defaultAdmin.email });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(defaultAdmin.password, salt);
            await User.create({
                ...defaultAdmin,
                password: hashedPassword
            });
            logger.info('Admin user created successfully');
        } else {
            logger.info('Admin user already exists');
        }

        // Initialize default content
        for (const [key, content] of Object.entries(defaultContent)) {
            const contentExists = await Content.findOne({
                section: content.section
            });

            if (!contentExists) {
                await Content.create(content);
                logger.info(`Default content created for section: ${content.section}`);
            } else {
                logger.info(`Content already exists for section: ${content.section}`);
            }
        }

        // Initialize settings
        const settingsService = require('../services/settingsService');
        await settingsService.initializeSettings();
        logger.info('Settings initialized successfully');

        // Create required directories
        const fs = require('fs').promises;
        const path = require('path');
        const directories = [
            path.join(__dirname, '../../uploads'),
            path.join(__dirname, '../../uploads/images'),
            path.join(__dirname, '../../logs')
        ];

        for (const dir of directories) {
            await fs.mkdir(dir, { recursive: true });
            logger.info(`Directory created: ${dir}`);
        }

        logger.info('CMS initialization completed successfully');
        process.exit(0);
    } catch (error) {
        logger.error('Error initializing CMS:', error);
        process.exit(1);
    }
}

// Add command line arguments handling
const args = process.argv.slice(2);
if (args.includes('--reset')) {
    // Drop database before initialization
    mongoose.connect(config.database.uri, config.database.options).then(() => {
        logger.info('Dropping database...');
        return mongoose.connection.dropDatabase();
    }).then(() => {
        logger.info('Database dropped successfully');
        initializeCMS();
    }).catch(error => {
        logger.error('Error resetting database:', error);
        process.exit(1);
    });
} else {
    initializeCMS();
}

// Handle process termination
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
    });
});
