import { asyncHandler } from '../utils/asyncHandler';
import { priceCart } from '../utils/pricing';
import { createGatewayOrder } from '../services/paymentService';
import { AppError } from '../utils/AppError';

export const createOrder = asyncHandler(async (req, res) => {
  const { total } = await priceCart(req.body.items, req.body.discount);
  if (total <= 0) throw new AppError('Nothing to pay');
  res.json(await createGatewayOrder(total));
});