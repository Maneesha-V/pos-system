import { asyncHandler } from '../utils/asyncHandler';
import * as staff from '../services/staffService';

export const listStaff = asyncHandler(async (_req, res) => res.json(await staff.list()));
export const createStaff = asyncHandler(async (req, res) => res.status(201).json(await staff.create(req.body)));
export const updateStaff = asyncHandler(async (req, res) =>
  res.json(await staff.update(String(req.params.id), req.body, req.user!._id)));