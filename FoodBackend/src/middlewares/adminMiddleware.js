import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Middleware to check if user is an admin
export const onlyAdminAccess = asyncHandler(async (req, res, next) => {
    const isAdmin = Boolean(req.admin) || req.user?.role === 1;
    if (!isAdmin) {
        throw new ApiError("Access denied", 403, "You have not permission to access this route!");
    }
    return next();
});