const path = require('path');
const fs = require('fs').promises;
const mongoose = require('mongoose');
const config = require('../config/config');
const logger = require('../config/logger');
const helpers = require('../utils/helpers');
const { ErrorResponse } = require('../middleware/error');

// Create Media model inline since it's specific to this service
const MediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    filename: {
        type: String,
        required: true
    },
    mimetype: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    metadata: {
        width: Number,
        height: Number,
        format: String,
        alt: String
    },
    tags: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Media = mongoose.model('Media', MediaSchema);

class MediaService {
    /**
     * Upload media file
     * @param {Object} file - File object from multer
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Uploaded media
     */
    async uploadMedia(file, userId) {
        try {
            // Validate file
            if (!this.isValidFile(file)) {
                throw new ErrorResponse('Invalid file type', 400);
            }

            // Generate unique filename
            const filename = this.generateUniqueFilename(file.originalname);
            const uploadPath = path.join(config.upload.path, filename);

            // Save file
            await fs.mkdir(path.dirname(uploadPath), { recursive: true });
            await fs.writeFile(uploadPath, file.buffer);

            // Create media record
            const media = await Media.create({
                name: file.originalname,
                filename,
                mimetype: file.mimetype,
                size: file.size,
                url: `/uploads/${filename}`,
                uploadedBy: userId,
                metadata: await this.getImageMetadata(file)
            });

            logger.info(`Media uploaded: ${filename}`);
            return media;
        } catch (error) {
            logger.error('Error uploading media:', error);
            throw error;
        }
    }

    /**
     * Get all media files
     * @param {Object} query - Query parameters
     * @returns {Promise<Object>} Paginated media files
     */
    async getAllMedia(query) {
        try {
            const { page, limit, skip } = helpers.getPaginationOptions(query);
            
            const total = await Media.countDocuments({ isActive: true });
            const media = await Media.find({ isActive: true })
                .sort('-createdAt')
                .skip(skip)
                .limit(limit)
                .populate('uploadedBy', 'username email');

            return helpers.formatPaginationResponse(page, limit, total, media);
        } catch (error) {
            logger.error('Error getting media files:', error);
            throw new ErrorResponse('Error retrieving media files', 500);
        }
    }

    /**
     * Get media by ID
     * @param {string} id - Media ID
     * @returns {Promise<Object>} Media file
     */
    async getMediaById(id) {
        try {
            const media = await Media.findById(id)
                .populate('uploadedBy', 'username email');

            if (!media) {
                throw new ErrorResponse('Media not found', 404);
            }

            return media;
        } catch (error) {
            logger.error(`Error getting media ${id}:`, error);
            throw error;
        }
    }

    /**
     * Update media metadata
     * @param {string} id - Media ID
     * @param {Object} updateData - Update data
     * @returns {Promise<Object>} Updated media
     */
    async updateMedia(id, updateData) {
        try {
            const media = await Media.findByIdAndUpdate(
                id,
                { $set: { metadata: updateData } },
                { new: true }
            );

            if (!media) {
                throw new ErrorResponse('Media not found', 404);
            }

            logger.info(`Media updated: ${id}`);
            return media;
        } catch (error) {
            logger.error(`Error updating media ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete media
     * @param {string} id - Media ID
     * @returns {Promise<void>}
     */
    async deleteMedia(id) {
        try {
            const media = await Media.findById(id);
            
            if (!media) {
                throw new ErrorResponse('Media not found', 404);
            }

            // Delete file
            const filePath = path.join(config.upload.path, media.filename);
            await fs.unlink(filePath);

            // Delete record
            await media.remove();
            
            logger.info(`Media deleted: ${id}`);
        } catch (error) {
            logger.error(`Error deleting media ${id}:`, error);
            throw error;
        }
    }

    /**
     * Search media by tags or filename
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Search results
     */
    async searchMedia(searchTerm) {
        try {
            const media = await Media.find({
                isActive: true,
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { tags: { $in: [new RegExp(searchTerm, 'i')] } }
                ]
            }).sort('-createdAt');

            return media;
        } catch (error) {
            logger.error('Error searching media:', error);
            throw new ErrorResponse('Error searching media', 500);
        }
    }

    /**
     * Generate unique filename
     * @param {string} originalname - Original filename
     * @returns {string} Unique filename
     */
    generateUniqueFilename(originalname) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15);
        const extension = path.extname(originalname);
        return `${timestamp}-${random}${extension}`;
    }

    /**
     * Validate file type
     * @param {Object} file - File object
     * @returns {boolean} Is valid file
     */
    isValidFile(file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        return allowedTypes.includes(file.mimetype);
    }

    /**
     * Get image metadata
     * @param {Object} file - File object
     * @returns {Promise<Object>} Image metadata
     */
    async getImageMetadata(file) {
        // Implementation would depend on image processing library
        // For example, using sharp:
        /*
        const sharp = require('sharp');
        const metadata = await sharp(file.buffer).metadata();
        return {
            width: metadata.width,
            height: metadata.height,
            format: metadata.format
        };
        */
        return {};
    }

    /**
     * Clean up unused media files
     * @returns {Promise<void>}
     */
    async cleanupUnusedMedia() {
        try {
            const media = await Media.find({ isActive: false });
            
            for (const file of media) {
                const filePath = path.join(config.upload.path, file.filename);
                await fs.unlink(filePath);
                await file.remove();
            }

            logger.info('Unused media cleanup completed');
        } catch (error) {
            logger.error('Error cleaning up unused media:', error);
            throw error;
        }
    }
}

module.exports = new MediaService();
