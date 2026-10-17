import { asyncHandler } from '../utils/asyncHandler';
import * as products from '../services/productService';

export const listProducts = asyncHandler(async (req, res) =>
  res.json(await products.list(req.query.q as string | undefined, req.query.lowStock as string | undefined)));

export const createProduct = asyncHandler(async (req, res) =>
  res.status(201).json(await products.create(req.body)));

export const updateProduct = asyncHandler(async (req, res) =>
  res.json(await products.update(String(req.params.id), req.body)));

export const deleteProduct = asyncHandler(async (req, res) => {
  await products.remove(String(req.params.id));
  res.json({ message: 'Deleted' });
});