import dotenv from 'dotenv';
import fs from 'fs';
import logger from './logger';

if (fs.existsSync('.env')) {
    logger.debug('Using .env file to supply config environment variables');
    dotenv.config({ path: '.env' });

}
export const ENVIRONMENT = process.env.NODE_ENV;
const prod = ENVIRONMENT === 'production';

export const SESSION_SECRET = process.env.SESSION_SECRET;
export const MONGODB_URI = process.env.MONGODB_URI;

export const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID;
export const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY;

if (!SESSION_SECRET) {
    logger.error('No client secret. Set SESSION_SECRET environment variable.');
    process.exit(1);
}

if (!MONGODB_URI) {
    if (prod) {
        logger.error('No mongo connection string. Set MONGODB_URI environment variable.');
    } else {
        logger.error('No mongo connection string. Set MONGODB_URI_LOCAL environment variable.');
    }
    process.exit(1);
}