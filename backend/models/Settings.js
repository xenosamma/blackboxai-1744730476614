const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: [true, 'Setting key is required'],
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Setting value is required']
    },
    category: {
        type: String,
        required: [true, 'Setting category is required'],
        enum: ['theme', 'layout', 'contact', 'seo', 'features'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for faster queries
settingsSchema.index({ category: 1, key: 1 }, { unique: true });

module.exports = mongoose.model('Settings', settingsSchema);
