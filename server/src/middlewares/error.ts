import { Request, Response, NextFunction } from 'express';

export const notFound = (_req: Request, res: Response) =>
  res.status(404).json({ message: 'Route not found' });

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'value';
    return res.status(409).json({ message: `Duplicate ${field}` });
  }
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid id' });
  res.status(res.statusCode >= 400 ? res.statusCode : 500).json({ message: err.message });
};