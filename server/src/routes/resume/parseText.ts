import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import rateLimit from 'express-rate-limit';
import { extractTextFromPDF } from '../../services/parser/pdfParser';

export const parseTextLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many parse requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const parseResumeText = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const filePath = (req.file as Express.Multer.File | undefined)?.path;

  if (!filePath) {
    res.status(400).json({ message: 'No file uploaded. Please attach a PDF.' });
    return;
  }

  try {
    const parsedText = await extractTextFromPDF(filePath);

    if (!parsedText || !parsedText.trim()) {
      res.status(400).json({ message: 'Could not extract text from the uploaded PDF.' });
      return;
    }

    res.json({ parsedText });
  } catch (err) {
    next(err);
  } finally {
    // Always clean up the temp file
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // ignore cleanup errors
    }
  }
};
