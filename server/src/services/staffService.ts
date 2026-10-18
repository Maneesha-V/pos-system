import User, { type UserDoc } from '../models/User';
import { AppError } from '../utils/AppError';

const publicUser = (u: UserDoc) => ({ _id: u._id, name: u.name, username: u.username, role: u.role, active: u.active });

export const list = () => User.find().sort({ createdAt: -1 });

export async function create(b: { name?: string; username?: string; password?: string; role?: 'admin' | 'staff' }) {
  if (!b.name || !b.username || !b.password) throw new AppError('Name, username and password required');
  return publicUser(await User.create({ name: b.name, username: b.username, password: b.password, role: b.role }));
}

export async function update(
  id: string,
  b: { name?: string; username?: string; password?: string; role?: 'admin' | 'staff'; active?: boolean },
  currentUserId: unknown
) {
  const u = await User.findById(id);
  if (!u) throw new AppError('Staff not found', 404);
  if (String(u._id) === String(currentUserId) && (b.active === false || (b.role && b.role !== 'admin')))
    throw new AppError('You cannot disable or demote yourself');
  if (b.name) u.name = b.name;
  if (b.username) u.username = b.username;
  if (b.role) u.role = b.role;
  if (typeof b.active === 'boolean') u.active = b.active;
  if (b.password) u.password = b.password;
  await u.save();
  return publicUser(u);
}