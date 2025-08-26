import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Shop } from "../models/shopModel.js";

// Middleware to check if user is a seller
export const onlySellerAccess = asyncHandler(async (req, res, next) => {
    // Allow if seller was set by verifySellerJWT or user role is 2 (seller)
    const isSeller = Boolean(req.seller) || req.user?.role === 2;
    if (!isSeller) {
        throw new ApiError("Access denied", 403, "You have not permission to access this route!");
    }
    return next();
});

// Middleware to fetch shop details for the logged-in seller
export const fetchSellerShop = asyncHandler(async (req, res, next) => {
    const sellerId = req.seller?._id || req.user?._id;
    const shop = await Shop.findOne({ sellerId }).populate('productId', 'name price available stock');

    // If shop not found, allow downstream to handle gracefully
    req.shop = shop || null;
    next();
});
