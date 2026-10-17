import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body as { username?: string; password?: string };
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.active) return res.status(403).json({ message: 'Account disabled' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '12h' });
  res.json({ token, user: { id: user._id, name: user.name, username: user.username, role: user.role } });
};

export const me = (req: Request, res: Response) => res.json(req.user);