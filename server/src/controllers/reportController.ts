import { Request, Response } from 'express';
import Sale from '../models/Sale';
import Return from '../models/Return';
import Product from '../models/Product';
import Supplier from '../models/Supplier';
import LedgerEntry from '../models/LedgerEntry';

const TZ = 'Asia/Kolkata';
const today = () => new Date().toLocaleDateString('en-CA', { timeZone: TZ });

const range = (q: Request['query']) => {
  const from = (q.from as string) || today();
  const to = (q.to as string) || today();
  return {
    start: new Date(`${from}T00:00:00+05:30`),
    end: new Date(`${to}T23:59:59.999+05:30`),
  };
};

export const summary = async (req: Request, res: Response) => {
  const { start, end } = range(req.query);
  const match = { createdAt: { $gte: start, $lte: end } };

  const [sales] = await Sale.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$total' }, count: { $sum: 1 }, discount: { $sum: '$discount' } } },
  ]);
  const [ret] = await Return.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$refund' }, count: { $sum: 1 } } },
  ]);
  const led = await LedgerEntry.aggregate([
    { $match: { ...match, type: { $in: ['purchase', 'payment', 'expense'] } } },
    { $group: { _id: '$type', total: { $sum: '$debit' } } },
  ]);
  const [margin] = await Sale.aggregate([
    { $match: match },
    { $unwind: '$items' },
    { $group: { _id: null, v: { $sum: { $multiply: [
      { $subtract: ['$items.price', '$items.cost'] },
      { $subtract: ['$items.qty', '$items.returnedQty'] },
    ] } } } },
  ]);
  const byStaff = await Sale.aggregate([
    { $match: match },
    { $group: { _id: '$staffName', total: { $sum: '$total' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
  ]);
  const topProducts = await Sale.aggregate([
    { $match: match },
    { $unwind: '$items' },
    { $group: { _id: '$items.name', qty: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
    { $sort: { qty: -1 } },
    { $limit: 5 },
  ]);

  const since = new Date(new Date(`${today()}T00:00:00+05:30`).getTime() - 6 * 864e5);
  const daily = await Sale.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: TZ } },
      total: { $sum: '$total' }, count: { $sum: 1 },
    } },
    { $sort: { _id: 1 } },
  ]);

  const lowStock = await Product.countDocuments({ active: true, $expr: { $lte: ['$stock', '$minStock'] } });
  const [pay] = await Supplier.aggregate([{ $group: { _id: null, v: { $sum: '$balance' } } }]);

  const l = (t: string) => led.find((x) => x._id === t)?.total ?? 0;
  const grossProfit = (margin?.v ?? 0) - (sales?.discount ?? 0);

  res.json({
    sales: { total: sales?.total ?? 0, count: sales?.count ?? 0 },
    returns: { total: ret?.total ?? 0, count: ret?.count ?? 0 },
    purchases: l('purchase'),
    payments: l('payment'),
    expenses: l('expense'),
    grossProfit,
    netProfit: grossProfit - l('expense'),
    byStaff, topProducts, daily, lowStock,
    payable: pay?.v ?? 0,
  });
};

export const listLedger = async (req: Request, res: Response) => {
  const { start, end } = range(req.query);
  const type = String(req.query.type || '');
  const filter: Record<string, any> = { createdAt: { $gte: start, $lte: end } };
  if (type) filter.type = type;
  res.json(await LedgerEntry.find(filter).sort({ createdAt: -1 }).limit(1000));
};

export const addExpense = async (req: Request, res: Response) => {
  const { description, amount } = req.body as { description?: string; amount?: number };
  if (!description?.trim() || !(Number(amount) > 0))
    return res.status(400).json({ message: 'Description and a valid amount required' });
  const e = await LedgerEntry.create({ type: 'expense', description: description.trim(), debit: Number(amount) });
  res.status(201).json(e);
};