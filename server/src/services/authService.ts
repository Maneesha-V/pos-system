import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AppError } from '../utils/AppError';

export async function login(username?: string, password?: string) {
  if (!username || !password) throw new AppError('Username and password required');
  const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password))) throw new AppError('Invalid credentials', 401);
  if (!user.active) throw new AppError('Account disabled', 403);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '12h' });
  return { token, user: { id: user._id, name: user.name, username: user.username, role: user.role } };
}