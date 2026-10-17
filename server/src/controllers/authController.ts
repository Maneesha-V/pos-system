import { asyncHandler } from '../utils/asyncHandler';
import * as auth from '../services/authService';

export const login = asyncHandler(async (req, res) =>
  res.json(await auth.login(req.body?.username, req.body?.password)));

export const me = asyncHandler(async (req, res) => res.json(req.user));