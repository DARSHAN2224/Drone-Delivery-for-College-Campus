import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Like from '../models/likeModel.js';
import { Product } from '../models/productsModel.js';
import { Shop } from '../models/shopModel.js';
import { Seller } from '../models/sellerModel.js';
import RecentHistory from '../models/recentHistoryModel.js';

// Toggle like (add/remove)
export const toggleLike = asyncHandler(async (req, res) => {
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

    // Check if already liked
    const existingLike = await Like.findOne({
        userId,
        targetType,
        targetId
    });

    let isLiked = false;
    if (existingLike) {
        // Remove like
        await Like.findByIdAndDelete(existingLike._id);
        isLiked = false;
        
        // Update target like count
        await updateTargetLikeCount(targetType, targetId, -1);
    } else {
        // Add like
        await Like.create({
            userId,
            targetType,
            targetId
        });
        isLiked = true;
        
        // Update target like count
        await updateTargetLikeCount(targetType, targetId, 1);
    }

    // Add to recent history
    await RecentHistory.create({
        userId,
        actionType: 'like_product',
        targetType,
        targetId,
        metadata: { isLiked }
    });

    res.status(200).json(new ApiResponse(200, { isLiked }, "Like toggled successfully"));
});

// Check if user has liked a target
export const checkLikeStatus = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({
        userId,
        targetType,
        targetId
    });

    res.status(200).json(new ApiResponse(200, { isLiked: !!like }, "Like status checked"));
});

// Get likes for a target
export const getLikes = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const likes = await Like.find({ targetType, targetId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalLikes = await Like.countDocuments({ targetType, targetId });
    const totalPages = Math.ceil(totalLikes / limit);

    res.status(200).json(new ApiResponse(200, {
        likes,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalLikes,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
        }
    }, "Likes retrieved successfully"));
});

// Get user's likes
export const getUserLikes = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { targetType, targetId } = req.params;

    // Find user's like for the specific target
    const like = await Like.findOne({ 
        userId, 
        targetType, 
        targetId 
    });

    res.status(200).json(new ApiResponse(200, { isLiked: !!like }, "User like status retrieved successfully"));
});

// Helper function to update target like count
const updateTargetLikeCount = async (targetType, targetId, increment) => {
    const updateData = { $inc: { totalLikes: increment } };

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
