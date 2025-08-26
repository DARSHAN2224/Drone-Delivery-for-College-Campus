import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { Seller } from "../models/sellerModel.js";
import { Admin } from "../models/adminModel.js";

// Middleware to check if user is already authenticated (for login/register protection)
export const checkAlreadyAuthenticated = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return next(); // No token, allow access to login/register
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Check if user exists and token is valid
        const [user, seller, admin] = await Promise.all([
            User.findById(decodedToken?._id).select("-password -refreshTokens"),
            Seller.findById(decodedToken?._id).select("-password -refreshTokens"),
            Admin.findById(decodedToken?._id).select("-password -refreshTokens"),
        ]);

        const principal = user || seller || admin;
        if (principal) {
            // User is already authenticated, return error
            throw new ApiError("Already authenticated", 400, "You are already logged in. Please logout first to access this route.");
        }

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            // Invalid or expired token, allow access to login/register
            return next();
        }
        throw error;
    }
});

// Generic JWT verification middleware
export const verifyJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError("Unauthorized request", 401, "Invalid token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Attempt to resolve the principal across all supported roles
        const [user, seller, admin] = await Promise.all([
            User.findById(decodedToken?._id).select("-password -refreshTokens"),
            Seller.findById(decodedToken?._id).select("-password -refreshTokens"),
            Admin.findById(decodedToken?._id).select("-password -refreshTokens"),
        ]);

        const principal = user || seller || admin;
        if (!principal) {
            throw new ApiError("Unauthorized request", 401, "Invalid token");
        }

        // Attach generic and role-specific references for downstream middlewares/controllers
        req.user = principal;
        if (seller) req.seller = seller;
        if (admin) req.admin = admin;

        next();
    } catch (error) {
        throw new ApiError("Unauthorized request", 401, error.message || "Invalid token");
    }
});

// Seller-specific JWT verification
export const verifySellerJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError("Unauthorized request", 401, "Invalid token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const seller = await Seller.findById(decodedToken?._id).select("-password -refreshTokens");

        if (!seller) {
            throw new ApiError("Unauthorized request", 401, "Invalid token");
        }

        req.seller = seller;
        next();
    } catch (error) {
        throw new ApiError("Unauthorized request", 401, error.message || "Invalid token");
    }
});

// Admin-specific JWT verification
export const verifyAdminJWT = asyncHandler(async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError("Unauthorized request", 401, "Invalid token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const admin = await Admin.findById(decodedToken?._id).select("-password -refreshTokens");

        if (!admin) {
            throw new ApiError("Unauthorized request", 401, "Invalid token");
        }

        req.admin = admin;
        next();
    } catch (error) {
        throw new ApiError("Unauthorized request", 401, error.message || "Invalid token");
    }
});

