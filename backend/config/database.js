const mongoose = require('mongoose');
const config = require('./config');
const logger = require('./logger');

class Database {
    constructor() {
        this.mongoose = mongoose;
        this.isConnected = false;
        this.retryAttempts = 0;
        this.maxRetryAttempts = 5;
        this.retryInterval = 5000; // 5 seconds
    }

    async connect() {
        if (this.isConnected) {
            logger.info('Database is already connected');
            return;
        }

        try {
            await mongoose.connect(config.database.uri, config.database.options);
            
            this.isConnected = true;
            this.retryAttempts = 0;
            
            logger.info('Successfully connected to MongoDB');

            // Handle connection events
            mongoose.connection.on('error', this.handleError.bind(this));
            mongoose.connection.on('disconnected', this.handleDisconnect.bind(this));
            mongoose.connection.on('reconnected', this.handleReconnect.bind(this));

            // Handle process termination
            process.on('SIGINT', this.handleTermination.bind(this));
            process.on('SIGTERM', this.handleTermination.bind(this));

        } catch (error) {
            logger.error('MongoDB connection error:', error);
            await this.handleConnectionError(error);
        }
    }

    async handleConnectionError(error) {
        this.isConnected = false;

        if (this.retryAttempts < this.maxRetryAttempts) {
            this.retryAttempts++;
            logger.info(`Retrying connection attempt ${this.retryAttempts} of ${this.maxRetryAttempts}`);
            
            setTimeout(async () => {
                await this.connect();
            }, this.retryInterval);
        } else {
            logger.error('Max retry attempts reached. Unable to connect to MongoDB');
            process.exit(1);
        }
    }

    handleError(error) {
        logger.error('MongoDB error:', error);
        this.isConnected = false;
    }

    async handleDisconnect() {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
        await this.connect();
    }

    handleReconnect() {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
        this.retryAttempts = 0;
    }

    async handleTermination() {
        try {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        } catch (error) {
            logger.error('Error closing MongoDB connection:', error);
            process.exit(1);
        }
    }

    // Utility methods for database operations
    async executeTransaction(operations) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();
            const results = await operations(session);
            await session.commitTransaction();
            return results;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    }

    async healthCheck() {
        try {
            const status = mongoose.connection.readyState;
            return {
                isConnected: status === 1,
                state: this.getConnectionState(status),
                host: mongoose.connection.host,
                database: mongoose.connection.name
            };
        } catch (error) {
            logger.error('Database health check failed:', error);
            return {
                isConnected: false,
                state: 'error',
                error: error.message
            };
        }
    }

    getConnectionState(state) {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
            99: 'uninitialized'
        };
        return states[state] || 'unknown';
    }

    // Backup and restore utilities
    async backup(outputPath) {
        try {
            // Implementation depends on MongoDB tools and system configuration
            logger.info('Database backup started');
            // Add backup implementation
            logger.info('Database backup completed');
        } catch (error) {
            logger.error('Database backup failed:', error);
            throw error;
        }
    }

    async restore(inputPath) {
        try {
            // Implementation depends on MongoDB tools and system configuration
            logger.info('Database restore started');
            // Add restore implementation
            logger.info('Database restore completed');
        } catch (error) {
            logger.error('Database restore failed:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const database = new Database();
module.exports = database;
