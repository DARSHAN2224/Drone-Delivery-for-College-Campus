import { Router } from 'express';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import { Product } from '../models/productsModel.js';
import { Shop } from '../models/shopModel.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

// GET /api/v1/search?query=...&limit=&type=all|shops|products
router.get('/', verifyJWT, async (req, res) => {
  const query = String(req.query.query || '').trim();
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const type = String(req.query.type || 'all');

  if (!query) {
    return res.status(200).json(new ApiResponse(200, { shops: [], products: [] }, ''));
  }

  const textFilter = { $regex: query, $options: 'i' };
  const searchShops = async () => {
    if (type !== 'all' && type !== 'shops') return [];
    return Shop.find({ $or: [{ name: textFilter }, { city: textFilter }, { state: textFilter }] })
      .limit(limit)
      .lean();
  };
  const searchProducts = async () => {
    if (type !== 'all' && type !== 'products') return [];
    return Product.find({
      isApproved: true,
      available: true,
      $or: [{ name: textFilter }, { description: textFilter }],
    })
      .limit(limit)
      .lean();
  };

  const [shops, products] = await Promise.all([searchShops(), searchProducts()]);
  return res.status(200).json(new ApiResponse(200, { shops, products }, ''));
});

export default router;


