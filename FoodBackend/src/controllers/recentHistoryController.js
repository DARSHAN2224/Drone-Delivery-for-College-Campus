import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import RecentHistory from '../models/recentHistoryModel.js';

// Add activity to recent history
export const addActivity = asyncHandler(async (req, res) => {
    const { actionType, targetType, targetId, metadata } = req.body;
    const userId = req.user._id;

    // Validate input
    if (!actionType || !targetType || !targetId) {
        throw new ApiError(400, "Missing required fields");
    }

    // Create history entry
    const historyEntry = await RecentHistory.create({
        userId,
        actionType,
        targetType,
        targetId,
        metadata: metadata || {}
    });

    res.status(200).json(new ApiResponse(200, historyEntry, "Activity recorded successfully"));
});

// Get user's recent history
export const getUserHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { actionType, targetType, page = 1, limit = 20 } = req.query;

    const query = { userId };
    if (actionType) query.actionType = actionType;
    if (targetType) query.targetType = targetType;

    const skip = (page - 1) * limit;

    const history = await RecentHistory.find(query)
        .populate('targetId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalHistory = await RecentHistory.countDocuments(query);
    const totalPages = Math.ceil(totalHistory / limit);

    res.status(200).json(new ApiResponse(200, {
        history,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalHistory,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
        }
    }, "User history retrieved successfully"));
});

// Get recent history by action type
export const getHistoryByAction = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { actionType } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;

    const history = await RecentHistory.find({ userId, actionType })
        .populate('targetId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const totalHistory = await RecentHistory.countDocuments({ userId, actionType });
    const totalPages = Math.ceil(totalHistory / limit);

    res.status(200).json(new ApiResponse(200, {
        history,
        pagination: {
            currentPage: parseInt(page),
            totalPages,
            totalHistory,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
            limit: parseInt(limit)
        }
    }, "Action history retrieved successfully"));
});

// Clear user's history
export const clearHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { actionType, targetType } = req.query;

    const query = { userId };
    if (actionType) query.actionType = actionType;
    if (targetType) query.targetType = targetType;

    await RecentHistory.deleteMany(query);

    res.status(200).json(new ApiResponse(200, {}, "History cleared successfully"));
});

// Get user's activity summary
export const getActivitySummary = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const summary = await RecentHistory.aggregate([
        { $match: { userId: userId } },
        {
            $group: {
                _id: '$actionType',
                count: { $sum: 1 },
                lastActivity: { $max: '$createdAt' }
            }
        },
        { $sort: { lastActivity: -1 } }
    ]);

    const totalActivities = await RecentHistory.countDocuments({ userId });

    res.status(200).json(new ApiResponse(200, {
        summary,
        totalActivities
    }, "Activity summary retrieved successfully"));
});
