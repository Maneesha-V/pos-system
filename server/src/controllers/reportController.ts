import { asyncHandler } from '../utils/asyncHandler';
import * as reports from '../services/reportService';

type Q = { from?: string; to?: string; type?: string };

export const summary = asyncHandler(async (req, res) => {
  const { from, to } = req.query as Q;
  res.json(await reports.summary(from, to));
});

export const listLedger = asyncHandler(async (req, res) => {
  const { from, to, type } = req.query as Q;
  res.json(await reports.ledger(from, to, type));
});

export const addExpense = asyncHandler(async (req, res) =>
  res.status(201).json(await reports.addExpense(req.body?.description, req.body?.amount)));