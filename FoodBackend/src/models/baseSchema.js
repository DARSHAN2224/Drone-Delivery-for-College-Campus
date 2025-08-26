import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Common token schema
export const tokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    deviceId: {
        type: String,
        required: true,
    },
    issuedAt: {
        type: Date,
        default: Date.now,
    },
});

// Base schema with common methods
export const createBaseSchema = (roleValue) => {
    const baseSchema = new mongoose.Schema(
        {
            image: {
                type: String,
            },
            name: {
                type: String,
                required: true,
                trim: true,
                lowercase: true,
                index: true,
            },
            email: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
            },
            mobile: {
                type: String,
                required: true,
                unique: true,
                minlength: 10,
                maxlength: 10,
            },
            password: {
                type: String,
                required: [true, "password is required"],
                minlength: 8,
            },
            refreshTokens: [tokenSchema],
            is_verified: {
                type: Number,
                default: 0,
            },
            role: {
                type: Number,
                enum: [0, 1, 2],
                default: roleValue,
            },
            lastLogin: {
                type: Date,
                default: Date.now,
            },
            resetPasswordToken: String,
            resetPasswordExpiresAt: Date,
            verificationToken: String,
            verificationTokenExpiresAt: Date,
        },
        { timestamps: true }
    );

    // Common pre-save middleware
    baseSchema.pre('save', async function (next) {
        if (!this.isModified('password')) return next();
        this.password = await bcryptjs.hash(this.password, 10);
        next();
    });

    // Common methods
    baseSchema.methods.isPasswordCorrect = async function (password) {
        return await bcryptjs.compare(password, this.password);
    };

    baseSchema.methods.generateRefreshToken = function (deviceId) {
        if (!deviceId) {
            deviceId = 'default'; // Use a default device ID if none provided
        }
        
        const token = jwt.sign(
            {
                _id: this._id,
                deviceId,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            }
        );
        return token;
    };

    baseSchema.methods.generateAccessToken = function () {
        return jwt.sign(
            { _id: this._id, email: this.email, mobile: this.mobile, name: this.name },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
        );
    };

    return baseSchema;
};
