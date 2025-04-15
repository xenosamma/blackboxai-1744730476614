const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/error');
const mediaService = require('../services/mediaService');
const config = require('../config/config');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: config.upload.maxFileSize // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (!config.upload.allowedTypes.includes(file.mimetype)) {
            cb(new Error('Invalid file type'), false);
            return;
        }
        cb(null, true);
    }
});

/**
 * @route   POST /api/media/upload
 * @desc    Upload media file(s)
 * @access  Private
 */
router.post('/upload',
    protect,
    checkPermission('manage_media'),
    upload.array('media', 10), // Allow up to 10 files
    asyncHandler(async (req, res) => {
        const uploadedFiles = [];

        for (const file of req.files) {
            const media = await mediaService.uploadMedia(file, req.user.id);
            uploadedFiles.push(media);
        }

        res.status(201).json({
            success: true,
            count: uploadedFiles.length,
            data: uploadedFiles
        });
    })
);

/**
 * @route   GET /api/media
 * @desc    Get all media files
 * @access  Private
 */
router.get('/',
    protect,
    asyncHandler(async (req, res) => {
        const media = await mediaService.getAllMedia(req.query);
        res.json({
            success: true,
            ...media
        });
    })
);

/**
 * @route   GET /api/media/:id
 * @desc    Get media by ID
 * @access  Private
 */
router.get('/:id',
    protect,
    asyncHandler(async (req, res) => {
        const media = await mediaService.getMediaById(req.params.id);
        res.json({
            success: true,
            data: media
        });
    })
);

/**
 * @route   PUT /api/media/:id
 * @desc    Update media metadata
 * @access  Private
 */
router.put('/:id',
    protect,
    checkPermission('manage_media'),
    asyncHandler(async (req, res) => {
        const media = await mediaService.updateMedia(req.params.id, req.body);
        res.json({
            success: true,
            data: media
        });
    })
);

/**
 * @route   DELETE /api/media/:id
 * @desc    Delete media
 * @access  Private
 */
router.delete('/:id',
    protect,
    checkPermission('manage_media'),
    asyncHandler(async (req, res) => {
        await mediaService.deleteMedia(req.params.id);
        res.json({
            success: true,
            message: 'Media deleted successfully'
        });
    })
);

/**
 * @route   GET /api/media/search/:term
 * @desc    Search media
 * @access  Private
 */
router.get('/search/:term',
    protect,
    asyncHandler(async (req, res) => {
        const media = await mediaService.searchMedia(req.params.term);
        res.json({
            success: true,
            count: media.length,
            data: media
        });
    })
);

/**
 * @route   POST /api/media/bulk-delete
 * @desc    Delete multiple media files
 * @access  Private (Admin only)
 */
router.post('/bulk-delete',
    protect,
    authorize('admin'),
    asyncHandler(async (req, res) => {
        const { ids } = req.body;

        if (!Array.isArray(ids)) {
            return res.status(400).json({
                success: false,
                message: 'IDs must be provided as an array'
            });
        }

        for (const id of ids) {
            await mediaService.deleteMedia(id);
        }

        res.json({
            success: true,
            message: `${ids.length} media files deleted successfully`
        });
    })
);

/**
 * @route   POST /api/media/bulk-tag
 * @desc    Add tags to multiple media files
 * @access  Private
 */
router.post('/bulk-tag',
    protect,
    checkPermission('manage_media'),
    asyncHandler(async (req, res) => {
        const { ids, tags } = req.body;

        if (!Array.isArray(ids) || !Array.isArray(tags)) {
            return res.status(400).json({
                success: false,
                message: 'IDs and tags must be provided as arrays'
            });
        }

        const updatedMedia = [];
        for (const id of ids) {
            const media = await mediaService.updateMedia(id, { tags });
            updatedMedia.push(media);
        }

        res.json({
            success: true,
            message: `Tags added to ${ids.length} media files`,
            data: updatedMedia
        });
    })
);

/**
 * @route   POST /api/media/cleanup
 * @desc    Clean up unused media files
 * @access  Private (Admin only)
 */
router.post('/cleanup',
    protect,
    authorize('admin'),
    asyncHandler(async (req, res) => {
        await mediaService.cleanupUnusedMedia();
        res.json({
            success: true,
            message: 'Media cleanup completed successfully'
        });
    })
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: `File size should not exceed ${config.upload.maxFileSize / (1024 * 1024)}MB`
            });
        }
    }
    next(error);
});

module.exports = router;
