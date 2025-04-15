require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Content = require('../models/Content');
const Settings = require('../models/Settings');

// Initial admin user data
const adminUser = {
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

// Initial content data
const initialContent = [
    {
        section: 'hero',
        type: 'text',
        order: 1,
        content: {
            title: 'Transform E-Waste into a Greener Future',
            subtitle: 'Responsible E-Waste Recycling',
            description: 'Join us in our mission to responsibly recycle electronic waste and create a sustainable tomorrow. Every device recycled is a step towards a cleaner planet.',
            buttons: [
                {
                    text: 'Start Recycling Now',
                    link: '/recycle',
                    style: 'primary'
                },
                {
                    text: 'Learn How It Works',
                    link: '#process',
                    style: 'secondary'
                }
            ]
        },
        isActive: true
    },
    // Add more initial content sections here
];

// Database initialization function
async function initializeDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pwr-cms', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Create admin user if it doesn't exist
        const adminExists = await User.findOne({ email: adminUser.email });
        if (!adminExists) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminUser.password, salt);
            await User.create({
                ...adminUser,
                password: hashedPassword
            });
            console.log('Admin user created successfully');
        } else {
            console.log('Admin user already exists');
        }

        // Initialize content if it doesn't exist
        for (const content of initialContent) {
            const contentExists = await Content.findOne({
                section: content.section,
                order: content.order
            });
            if (!contentExists) {
                await Content.create(content);
                console.log(`Content for section "${content.section}" created successfully`);
            } else {
                console.log(`Content for section "${content.section}" already exists`);
            }
        }

        console.log('Database initialization completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

// Add command line arguments handling
const args = process.argv.slice(2);
if (args.includes('--reset')) {
    // Drop database before initialization
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pwr-cms', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log('Dropping database...');
        return mongoose.connection.dropDatabase();
    }).then(() => {
        console.log('Database dropped successfully');
        initializeDatabase();
    }).catch(error => {
        console.error('Error resetting database:', error);
        process.exit(1);
    });
} else {
    initializeDatabase();
}

// Handle process termination
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
});
