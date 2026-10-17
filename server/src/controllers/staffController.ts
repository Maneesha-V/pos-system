import { Request, Response } from 'express';
import User from '../models/User';

export const listStaff = async (_req: Request, res: Response) => {
  res.json(await User.find().sort({ createdAt: -1 }));
};

export const createStaff = async (req: Request, res: Response) => {
  const { name, username, password, role } = req.body;
  if (!name || !username || !password) return res.status(400).json({ message: 'Name, username and password required' });
  const u = await User.create({ name, username, password, role });
  res.status(201).json({ _id: u._id, name: u.name, username: u.username, role: u.role, active: u.active });
};

export const updateStaff = async (req: Request, res: Response) => {
  const u = await User.findById(req.params.id);
  if (!u) return res.status(404).json({ message: 'Staff not found' });
  const { name, username, password, role, active } = req.body;
  const self = String(u._id) === String(req.user!._id);
  if (self && (active === false || (role && role !== 'admin')))
    return res.status(400).json({ message: 'You cannot disable or demote yourself' });
  if (name) u.name = name;
  if (username) u.username = username;
  if (role) u.role = role;
  if (typeof active === 'boolean') u.active = active;
  if (password) u.password = password; 
  await u.save();
  res.json({ _id: u._id, name: u.name, username: u.username, role: u.role, active: u.active });
};