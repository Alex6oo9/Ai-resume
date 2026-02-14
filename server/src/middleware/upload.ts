import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function uploadMiddleware(destDir?: string) {
  const uploadDir = destDir || path.join(__dirname, '../../uploads');

  // Ensure upload directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadDir);
    },
    filename: (_req, _file, cb) => {
      const uniqueName = `${crypto.randomUUID()}-${Date.now()}.pdf`;
      cb(null, uniqueName);
    },
  });

  const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
}
