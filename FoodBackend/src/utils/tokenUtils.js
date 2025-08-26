import { ApiError } from './ApiError.js';
import { User } from '../models/userModel.js';
import { Seller } from '../models/sellerModel.js';
import { Admin } from '../models/adminModel.js';

// Centralized token generation utilities
export const generateAccessToken = async (user, modelName = 'User') => {
    try {
        if (!user || typeof user.generateAccessToken !== 'function') {
            throw new Error(`Invalid user object or missing generateAccessToken method for ${modelName}`);
        }
        const accessToken = user.generateAccessToken();
        return accessToken;
    } catch (error) {
        throw new ApiError(
            500,
            `Error in generating access token for ${modelName}`,
            `Something went wrong while generating the access token for ${modelName}`
        );
    }
};

export const generateAccessAndRefreshTokens = async (userId, deviceId = null, modelName = 'User') => {
    try {
        // Find the user by ID across all models
        let user = await User.findById(userId);
        if (!user) {
            user = await Seller.findById(userId);
        }
        if (!user) {
            user = await Admin.findById(userId);
        }
        
        if (!user) {
            throw new Error(`User not found with ID: ${userId}`);
        }
        
        if (typeof user.generateAccessToken !== 'function' || typeof user.generateRefreshToken !== 'function') {
            throw new Error(`User object missing required token generation methods for ${modelName}`);
        }

        // Ensure deviceId is not null
        const finalDeviceId = deviceId || 'default';

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken(finalDeviceId);

        // Save the refresh token with the deviceId
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push({ token: refreshToken, deviceId: finalDeviceId });
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            `Error in generating tokens for ${modelName}`,
            `Something went wrong in generating refresh and access token for ${modelName}: ${error.message}`
        );
    }
};

export const generateRefreshToken = async (userId, deviceId = null, modelName = 'User') => {
    try {
        // Find the user by ID across all models
        let user = await User.findById(userId);
        if (!user) {
            user = await Seller.findById(userId);
        }
        if (!user) {
            user = await Admin.findById(userId);
        }
        
        if (!user) {
            throw new Error(`User not found with ID: ${userId}`);
        }
        
        if (typeof user.generateRefreshToken !== 'function') {
            throw new Error(`User object missing required refresh token generation method for ${modelName}`);
        }
        
        // Ensure deviceId is not null
        const finalDeviceId = deviceId || 'default';
        
        const refreshToken = user.generateRefreshToken(finalDeviceId);
        
        // Save the refresh token with the deviceId
        if (!user.refreshTokens) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push({ token: refreshToken, deviceId: finalDeviceId });
        user.lastLogin = new Date();
        await user.save({ validateBeforeSave: false });

        return refreshToken;
    } catch (error) {
        throw new ApiError(
            500,
            `Error in generating refresh token for ${modelName}`,
            `Something went wrong while generating the refresh token for ${modelName}: ${error.message}`
        );
    }
};
