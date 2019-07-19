import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } from '../util/secrets';

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
  accessKeyId: S3_ACCESS_KEY_ID,
  secretAccessKey: S3_SECRET_ACCESS_KEY,
  region: 'ap-northeast-2',
});

export const profileUpload: multer.Instance = multerFactory(path.join(uploadBasePath, profileImagePath), '1MB');
