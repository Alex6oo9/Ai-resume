import { Request, Response, NextFunction } from 'express';

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
};

export const isGuest = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.status(400).json({ error: 'Already authenticated' });
};
