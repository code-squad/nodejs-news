import AWS from 'aws-sdk';
import dotenv from 'dotenv';
import fs from 'fs';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';

if (fs.existsSync('.env')) {
  dotenv.config({ path: '.env' });
}

const mb = 1024 * 1024;

const uploadBasePath = 'original';
const profileImagePath = 'profile';
const markdownUploadPath = 'md';

function multerFactory (destinationPath, limitFileSize): multer.Instance {
  return multer({
    storage: multerS3({
      s3: new AWS.S3(),
      bucket: 'nodejs-news',
      key(req, file, cb) {
        cb(undefined, path.join(destinationPath, `${Date.now()}${path.basename(file.originalname)}`));
      },
    }),
    limits: { fileSize: limitFileSize },
  });
}

AWS.config.update({
  accessKeyId: process.env.S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

export const profileUpload: multer.Instance = multerFactory(path.join(uploadBasePath, profileImagePath), '1MB');
