import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Rating from '../models/ratingModel.js';
import { Product } from '../models/productsModel.js';
import { Shop } from '../models/shopModel.js';
import { Seller } from '../models/sellerModel.js';
import RecentHistory from '../models/recentHistoryModel.js';

// Add or update rating
export const addRating = asyncHandler(async (req, res) => {
    const { targetType, targetId, rating, comment, isAnonymous } = req.body;
    const userId = req.user._id;
    
    // Validate input
    if (!targetType || !targetId || !rating) {
        throw new ApiError(400, "Missing required fields");
    }

    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
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

    // Create or update rating
    const existingRating = await Rating.findOne({
        userId,
        targetType,
        targetId
    });

    let ratingDoc;
    if (existingRating) {
        existingRating.rating = rating;
        existingRating.comment = comment || existingRating.comment;
        existingRating.isAnonymous = isAnonymous || false;
        existingRating.updatedAt = new Date();
        ratingDoc = await existingRating.save();
    } else {
        ratingDoc = await Rating.create({
            userId,
            targetType,
            targetId,
            rating,
            comment,
            isAnonymous: isAnonymous || false
        });
    }

    await updateTargetRatingStats(targetType, targetId);

    await RecentHistory.create({
        userId,
        actionType: 'rate_product',
        targetType,
        targetId,
        metadata: { rating, comment: comment ? true : false }
    });

    res.status(200).json(new ApiResponse(200, ratingDoc, "Rating added successfully"));
});

// Get ratings for a target
export const getRatings = asyncHandler(async (req, res) => {
    const { targetType, targetId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    if (!['product', 'shop', 'seller'].includes(targetType)) {
        throw new ApiError(400, "Invalid target type");
    }

    const query = { targetType, targetId };
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    const skip = (page - 1) * limit;

    const ratings = await Rating.find(query)
        .populate('userId', 'name email avatar')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

    const totalRatings = await Rating.countDocuments(query);

    const totalPages = Math.ceil(totalRatings / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json(new ApiResponse(200, {
        ratings,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalRatings,
            hasNextPage,
            hasPrevPage,
            limit: parseInt(limit)
        }
    }, "Ratings retrieved successfully"));
});

export const getUserRatings = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { targetType, targetId } = req.params;

    // Find user's rating for the specific target
    const rating = await Rating.findOne({ 
        userId, 
        targetType, 
        targetId 
    });

    res.status(200).json(new ApiResponse(200, { rating }, "User rating retrieved successfully"));
});

export const deleteRating = asyncHandler(async (req, res) => {
    const { ratingId } = req.params;
    const userId = req.user._id;

    const rating = await Rating.findById(ratingId);
    if (!rating) {
        throw new ApiError(404, "Rating not found");
    }

    if (rating.userId.toString() !== userId.toString()) {
        throw new ApiError(403, "Not authorized to delete this rating");
    }

    await Rating.findByIdAndDelete(ratingId);
    await updateTargetRatingStats(rating.targetType, rating.targetId);

    res.status(200).json(new ApiResponse(200, {}, "Rating deleted successfully"));
});

const updateTargetRatingStats = async (targetType, targetId) => {
    const ratings = await Rating.find({ targetType, targetId });
    
    if (ratings.length === 0) {
        const updateData = {
            averageRating: 0,
            totalRatings: 0,
            totalComments: 0
        };

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
        return;
    }

    const totalRatings = ratings.length;
    const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings;
    const totalComments = ratings.filter(r => (r.comment && String(r.comment).trim().length > 0)).length;

    const updateData = {
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings,
        totalComments
    };

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
