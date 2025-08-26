import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Favorite from '../models/favoriteModel.js';
import { Product } from '../models/productsModel.js';
import { Shop } from '../models/shopModel.js';
import { Seller } from '../models/sellerModel.js';
import RecentHistory from '../models/recentHistoryModel.js';

// Toggle favorite (add/remove)
export const toggleFavorite = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!targetType || !targetId) {
        throw new ApiError(400, "Missing required fields");
    }

    // Check if target exists
    let target;
    switch (targetType) {
        case 'product':
            target = await Product.findById(targetId);
            break;
        case 'shop':
            target = await Shop.findById(targetId);
            break;
        case 'seller':
            target = await Seller.findById(targetId);
            break;
        default:
            throw new ApiError(400, "Invalid target type");
    }

    if (!target) {
        throw new ApiError(404, "Target not found");
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
        userId,
        targetType,
        targetId
    });

    let isFavorited = false;
    if (existingFavorite) {
        // Remove favorite
        await Favorite.findByIdAndDelete(existingFavorite._id);
        isFavorited = false;
        
        // Update target favorite count
        await updateTargetFavoriteCount(targetType, targetId, -1);
    } else {
        // Add favorite
        await Favorite.create({
            userId,
            targetType,
            targetId
        });
        isFavorited = true;
        
        // Update target favorite count
        await updateTargetFavoriteCount(targetType, targetId, 1);
    }

    // Add to recent history
    await RecentHistory.create({
        userId,
        actionType: 'favorite_product',
        targetType,
        targetId,
        metadata: { isFavorited }
    });

    res.status(200).json(new ApiResponse(200, { isFavorited }, "Favorite toggled successfully"));
});

// Check if user has favorited a target
export const checkFavoriteStatus = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const userId = req.user._id;

    const favorite = await Favorite.findOne({
        userId,
        targetType,
        targetId
    });

    res.status(200).json(new ApiResponse(200, { isFavorited: !!favorite }, "Favorite status checked"));
});

// Get favorites for a target
export const getFavorites = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const favorites = await Favorite.find({ targetType, targetId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalFavorites = await Favorite.countDocuments({ targetType, targetId });
    const totalPages = Math.ceil(totalFavorites / limit);

    res.status(200).json(new ApiResponse(200, {
        favorites,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalFavorites,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
        }
    }, "Favorites retrieved successfully"));
});

// Get user's favorites
export const getUserFavorites = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { targetType, targetId } = req.params;

    // Find user's favorite for the specific target
    const favorite = await Favorite.findOne({ 
        userId, 
        targetType, 
        targetId 
    });

    res.status(200).json(new ApiResponse(200, { isFavorited: !!favorite }, "User favorite status retrieved successfully"));
});

// Helper function to update target favorite count
const updateTargetFavoriteCount = async (targetType, targetId, increment) => {
    const updateData = { $inc: { totalFavorites: increment } };

    switch (targetType) {
        case 'product':
            await Product.findByIdAndUpdate(targetId, updateData);
            break;
        case 'shop':
            await Shop.findByIdAndUpdate(targetId, updateData);
            break;
        case 'seller':
            await Seller.findByIdAndUpdate(targetId, updateData);
            break;
    }
};
