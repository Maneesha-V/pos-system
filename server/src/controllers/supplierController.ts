import { asyncHandler } from '../utils/asyncHandler';
import * as suppliers from '../services/supplierService';

const id = (r: { params: Record<string, unknown> }) => String(r.params.id);

export const listSuppliers = asyncHandler(async (_req, res) => res.json(await suppliers.list()));
export const createSupplier = asyncHandler(async (req, res) => res.status(201).json(await suppliers.create(req.body)));
export const updateSupplier = asyncHandler(async (req, res) => res.json(await suppliers.update(id(req), req.body)));
export const deleteSupplier = asyncHandler(async (req, res) => {
  await suppliers.remove(id(req));
  res.json({ message: 'Deleted' });
});
export const purchase = asyncHandler(async (req, res) => res.json(await suppliers.purchase(id(req), req.body)));
export const paySupplier = asyncHandler(async (req, res) => res.json(await suppliers.pay(id(req), req.body?.amount)));