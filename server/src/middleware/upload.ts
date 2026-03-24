import multer from 'multer';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function uploadMiddleware(_destDir?: string) {
  const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  };

  return multer({
    storage: multer.memoryStorage(),
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE },
  });
}
