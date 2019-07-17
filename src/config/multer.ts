import path from 'path';
import multer = require('multer');

const mb = 1024 * 1024;

const uploadBasePath = 'uploads';
const imageUploadPath = 'images';
const markdownUploadPath = 'md';
const imageSizeLimit = 10 * mb;
const mdSizeLimit = 5 * mb;

function customMulterFactory (destinationPath, limitFileSize): multer.Instance {
  return multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(undefined, destinationPath);
      },
      filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(undefined, path.join(destinationPath, path.basename(file.originalname, ext) + Date.now() + ext));
      },
    }),
    limits: { fileSize: limitFileSize },
  });
}

export const imageUpload: multer.Instance = customMulterFactory(path.join(uploadBasePath, imageUploadPath), imageSizeLimit);
export const markdownUpload: multer.Instance = customMulterFactory(path.join(uploadBasePath, markdownUploadPath), mdSizeLimit);
