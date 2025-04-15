const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    section: {
        type: String,
        required: true,
        enum: ['hero', 'impact', 'services', 'pricing', 'process', 'join', 'contact', 'footer']
    },
    type: {
        type: String,
        required: true,
        enum: ['text', 'image', 'list', 'form', 'stats']
    },
    content: {
        title: String,
        subtitle: String,
        description: String,
        imageUrl: String,
        items: [{
            icon: String,
            title: String,
            description: String,
            value: String,
            link: String
        }],
        buttons: [{
            text: String,
            link: String,
            style: String
        }]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        required: true
    },
    metadata: {
        seoTitle: String,
        seoDescription: String,
        keywords: [String]
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

// Add indexes for frequently queried fields
contentSchema.index({ section: 1, isActive: 1 });
contentSchema.index({ order: 1 });

module.exports = mongoose.model('Content', contentSchema);
