const express = require('express');
const router = express.Router();
const { protect, authorize, checkPermission } = require('../middleware/auth');
const Content = require('../models/Content');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateContent = [
    body('section').notEmpty().withMessage('Section is required'),
    body('type').notEmpty().withMessage('Content type is required'),
    body('order').isNumeric().withMessage('Order must be a number'),
    body('content').notEmpty().withMessage('Content is required')
];

// @route   GET /api/content
// @desc    Get all content
// @access  Public
router.get('/', async (req, res) => {
    try {
        const content = await Content.find({ isActive: true })
            .sort('order')
            .select('-__v');

        res.json({
            success: true,
            count: content.length,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching content',
            error: error.message
        });
    }
});

// @route   GET /api/content/:section
// @desc    Get content by section
// @access  Public
router.get('/:section', async (req, res) => {
    try {
        const content = await Content.find({
            section: req.params.section,
            isActive: true
        }).sort('order');

        if (!content) {
            return res.status(404).json({
                success: false,
                message: 'Content not found'
            });
        }

        res.json({
            success: true,
            data: content
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching section content',
            error: error.message
        });
    }
});

// @route   POST /api/content
// @desc    Create new content
// @access  Private (Admin/Editor)
router.post('/',
    protect,
    authorize('admin', 'editor'),
    checkPermission('manage_content'),
    validateContent,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const content = new Content({
                ...req.body,
                modifiedBy: req.user.id
            });

            await content.save();

            res.status(201).json({
                success: true,
                data: content
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating content',
                error: error.message
            });
        }
    }
);

// @route   PUT /api/content/:id
// @desc    Update content
// @access  Private (Admin/Editor)
router.put('/:id',
    protect,
    authorize('admin', 'editor'),
    checkPermission('manage_content'),
    validateContent,
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            let content = await Content.findById(req.params.id);

            if (!content) {
                return res.status(404).json({
                    success: false,
                    message: 'Content not found'
                });
            }

            content = await Content.findByIdAndUpdate(
                req.params.id,
                {
                    ...req.body,
                    modifiedBy: req.user.id,
                    lastModified: Date.now()
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            res.json({
                success: true,
                data: content
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating content',
                error: error.message
            });
        }
    }
);

// @route   DELETE /api/content/:id
// @desc    Delete content
// @access  Private (Admin only)
router.delete('/:id',
    protect,
    authorize('admin'),
    async (req, res) => {
        try {
            const content = await Content.findById(req.params.id);

            if (!content) {
                return res.status(404).json({
                    success: false,
                    message: 'Content not found'
                });
            }

            await content.remove();

            res.json({
                success: true,
                message: 'Content deleted successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error deleting content',
                error: error.message
            });
        }
    }
);

// @route   PUT /api/content/reorder
// @desc    Reorder multiple content items
// @access  Private (Admin/Editor)
router.put('/reorder',
    protect,
    authorize('admin', 'editor'),
    checkPermission('manage_content'),
    async (req, res) => {
        try {
            const { items } = req.body;

            if (!Array.isArray(items)) {
                return res.status(400).json({
                    success: false,
                    message: 'Items must be an array'
                });
            }

            // Update each item's order
            await Promise.all(
                items.map(item =>
                    Content.findByIdAndUpdate(
                        item.id,
                        { order: item.order },
                        { new: true }
                    )
                )
            );

            res.json({
                success: true,
                message: 'Content reordered successfully'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error reordering content',
                error: error.message
            });
        }
    }
);

module.exports = router;
