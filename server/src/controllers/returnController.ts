import { asyncHandler } from '../utils/asyncHandler';
import * as returns from '../services/returnService';

export const lookupBill = asyncHandler(async (req, res) => res.json(await returns.lookupBill(String(req.params.billNo))));
export const listReturns = asyncHandler(async (_req, res) => res.json(await returns.list()));
export const createReturn = asyncHandler(async (req, res) =>
  res.status(201).json(await returns.create(req.body, req.user!)));