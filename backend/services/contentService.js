const Content = require('../models/Content');
const helpers = require('../utils/helpers');
const logger = require('../config/logger');
const { ErrorResponse } = require('../middleware/error');

class ContentService {
    /**
     * Get all content with pagination
     * @param {Object} query - Query parameters
     * @returns {Promise<Object>} Paginated content
     */
    async getAllContent(query) {
        try {
            const { page, limit, skip } = helpers.getPaginationOptions(query);
            
            const total = await Content.countDocuments({ isActive: true });
            const content = await Content.find({ isActive: true })
                .sort('order')
                .skip(skip)
                .limit(limit)
                .select('-__v');

            return helpers.formatPaginationResponse(page, limit, total, content);
        } catch (error) {
            logger.error('Error getting all content:', error);
            throw new ErrorResponse('Error retrieving content', 500);
        }
    }

    /**
     * Get content by section
     * @param {string} section - Section name
     * @returns {Promise<Array>} Content items
     */
    async getContentBySection(section) {
        try {
            const content = await Content.find({
                section,
                isActive: true
            }).sort('order');

            if (!content.length) {
                throw new ErrorResponse(`No content found for section: ${section}`, 404);
            }

            return content;
        } catch (error) {
            logger.error(`Error getting content for section ${section}:`, error);
            throw error;
        }
    }

    /**
     * Create new content
     * @param {Object} contentData - Content data
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Created content
     */
    async createContent(contentData, userId) {
        try {
            const content = new Content({
                ...contentData,
                modifiedBy: userId
            });

            await content.save();
            logger.info(`New content created for section: ${content.section}`);
            
            return content;
        } catch (error) {
            logger.error('Error creating content:', error);
            throw new ErrorResponse('Error creating content', 500);
        }
    }

    /**
     * Update content
     * @param {string} id - Content ID
     * @param {Object} updateData - Update data
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Updated content
     */
    async updateContent(id, updateData, userId) {
        try {
            const content = await Content.findById(id);
            
            if (!content) {
                throw new ErrorResponse('Content not found', 404);
            }

            // Sanitize update data
            const sanitizedData = helpers.sanitizeObject(updateData);

            const updatedContent = await Content.findByIdAndUpdate(
                id,
                {
                    ...sanitizedData,
                    modifiedBy: userId,
                    lastModified: Date.now()
                },
                { new: true, runValidators: true }
            );

            logger.info(`Content updated: ${id}`);
            return updatedContent;
        } catch (error) {
            logger.error(`Error updating content ${id}:`, error);
            throw error;
        }
    }

    /**
     * Delete content
     * @param {string} id - Content ID
     * @returns {Promise<void>}
     */
    async deleteContent(id) {
        try {
            const content = await Content.findById(id);
            
            if (!content) {
                throw new ErrorResponse('Content not found', 404);
            }

            await content.remove();
            logger.info(`Content deleted: ${id}`);
        } catch (error) {
            logger.error(`Error deleting content ${id}:`, error);
            throw error;
        }
    }

    /**
     * Reorder content items
     * @param {Array} items - Array of items with id and order
     * @returns {Promise<void>}
     */
    async reorderContent(items) {
        try {
            const updates = items.map(item => ({
                updateOne: {
                    filter: { _id: item.id },
                    update: { $set: { order: item.order } }
                }
            }));

            await Content.bulkWrite(updates);
            logger.info('Content reordering completed');
        } catch (error) {
            logger.error('Error reordering content:', error);
            throw new ErrorResponse('Error reordering content', 500);
        }
    }

    /**
     * Get content statistics
     * @returns {Promise<Object>} Content statistics
     */
    async getContentStats() {
        try {
            const stats = await Content.aggregate([
                {
                    $group: {
                        _id: '$section',
                        count: { $sum: 1 },
                        activeCount: {
                            $sum: { $cond: ['$isActive', 1, 0] }
                        }
                    }
                }
            ]);

            return stats;
        } catch (error) {
            logger.error('Error getting content statistics:', error);
            throw new ErrorResponse('Error retrieving content statistics', 500);
        }
    }

    /**
     * Search content
     * @param {string} searchTerm - Search term
     * @returns {Promise<Array>} Search results
     */
    async searchContent(searchTerm) {
        try {
            const results = await Content.find({
                $text: { $search: searchTerm },
                isActive: true
            }).sort({ score: { $meta: 'textScore' } });

            return results;
        } catch (error) {
            logger.error('Error searching content:', error);
            throw new ErrorResponse('Error searching content', 500);
        }
    }

    /**
     * Get content version history
     * @param {string} id - Content ID
     * @returns {Promise<Array>} Version history
     */
    async getContentHistory(id) {
        try {
            const content = await Content.findById(id)
                .populate('modifiedBy', 'username email')
                .select('lastModified modifiedBy');

            if (!content) {
                throw new ErrorResponse('Content not found', 404);
            }

            return content;
        } catch (error) {
            logger.error(`Error getting content history for ${id}:`, error);
            throw error;
        }
    }
}

module.exports = new ContentService();
