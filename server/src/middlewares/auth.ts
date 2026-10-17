import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { Role } from '../models/User';

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const user = await User.findById(id);
    if (!user || !user.active) return res.status(401).json({ message: 'Account disabled' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireRole =
  (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) =>
    req.user && roles.includes(req.user.role)
      ? next()
      : res.status(403).json({ message: 'Forbidden' });