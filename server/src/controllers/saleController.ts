import { asyncHandler } from '../utils/asyncHandler';
import * as sales from '../services/saleService';

export const createSale = asyncHandler(async (req, res) => {
  const b = req.body;
  const sale = await sales.createSale({
    items: b.items, discount: b.discount ?? 0, paymentMode: b.paymentMode ?? 'Cash',
    amountReceived: b.amountReceived, customerName: b.customerName,
    customerPhone: b.customerPhone, payment: b.payment,
    staffId: req.user!._id, staffName: req.user!.name,
  });
  res.status(201).json(sale);
});

export const listSales = asyncHandler(async (req, res) =>
  res.json(await sales.listSales(req.user!, req.query as { from?: string; to?: string; q?: string })));

export const getSale = asyncHandler(async (req, res) =>
  res.json(await sales.getSale(req.user!, String(req.params.id))));