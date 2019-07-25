import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { S3_BUCKET } from '../util/secrets';
import s3 from './aws';

const uploadBasePath = 'original';
const profileImagePath = 'profile';
const markdownUploadPath = 'md';

function multerFactory (destinationPath, limitFileSize): multer.Instance {
  return multer({
    storage: multerS3({
      s3,
      bucket: S3_BUCKET,
      key(req, file, cb) {
        cb(undefined, path.join(destinationPath, `${Date.now()}${path.basename(file.originalname)}`));
      },
    }),
    limits: { fileSize: limitFileSize },
  });
}

export const profileUpload: multer.Instance = multerFactory(path.join(uploadBasePath, profileImagePath), '1MB');
export const markdownUpload: multer.Instance = multerFactory(path.join(uploadBasePath, markdownUploadPath), '16MB');
