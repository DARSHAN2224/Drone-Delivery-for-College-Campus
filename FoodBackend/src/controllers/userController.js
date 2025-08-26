import { asyncHandler } from '../utils/asyncHandler.js'
import { validationResult as evValidationResult } from 'express-validator'
import { ApiResponse } from "../utils/ApiResponse.js"
import { User } from '../models/userModel.js'
import { ApiError } from '../utils/ApiError.js'
import uploadOnCloudinary from '../utils/cloudinary.js'
import jwt from "jsonwebtoken"
// duplicate import removed
import { sendVerificationEmail, sendWelcomeEmail, sendResetPasswordEmail, sendResetSuccessEmail } from "../utils/emails.js"
import { generateVerificationCode } from "../utils/generateVerificationCode.js";
import { randomBytes } from "crypto";

import {SellerSales} from "../models/salesModel.js"
import {Offer} from "../models/offersModel.js" 
import {Shop} from "../models/shopModel.js"
import { Product } from "../models/productsModel.js"
import { Order } from "../models/ordersModel.js"
import { OrderHistory } from "../models/historyModel.js"
import { generateAccessToken, generateAccessAndRefreshTokens } from '../utils/tokenUtils.js'
import { logSuccessfulLogin, logFailedLogin } from '../utils/auditLogger.js';
import { recordFailedAttempt, clearFailedAttempts } from '../middlewares/accountLockoutMiddleware.js';
import { Notification } from '../models/notificationModel.js';


export const registerUser = asyncHandler(async (req, res) => {
    // Debug: Log the request body
    console.log('=== BACKEND REGISTRATION DEBUG ===');
    console.log('Request headers:', req.headers);
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body || {}));
    console.log('Request body values:', Object.values(req.body || {}));
    console.log('Content-Type header:', req.headers['content-type']);
    console.log('Raw request body:', req.body);
    
    const errors = evValidationResult(req);

    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        throw new ApiError("Error while sign up", 400, errors.array())
    }

    const { name, email, password, mobile, acceptTerms } = req.body
    console.log('Destructured values:', { name, email, password, mobile, acceptTerms });
    console.log('Destructured value types:', {
        name: typeof name,
        email: typeof email,
        password: typeof password,
        mobile: typeof mobile,
        acceptTerms: typeof acceptTerms
    });
    console.log('Destructured value lengths:', {
        name: name?.length || 0,
        email: email?.length || 0,
        password: password?.length || 0,
        mobile: mobile?.length || 0,
        acceptTerms: acceptTerms
    });
    
    const userAlreadyExists = await User.findOne({ email });
    if (userAlreadyExists) {
        throw new ApiError("Error while registering the user", 400, "Email already exists",)
    }
    
    // Validate terms acceptance
    if (!acceptTerms) {
        throw new ApiError("Error while registering the user", 400, "You must accept the Terms & Conditions")
    }
    
    // Validate password strength
    const { validatePasswordStrength } = await import('../middlewares/inputSanitizationMiddleware.js');
    validatePasswordStrength(password);
    
    const verificationToken = generateVerificationCode();

    const user = new User({
        email,
        password,
        name,
        mobile,
        // image: image?.url || '',
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,

    })
    await user.save();

    try {
        // Re-enable email verification
        await sendVerificationEmail(user.name, user.email, verificationToken);
        console.log('Email verification enabled - verification email sent');
        
        res.status(200).json(new ApiResponse(200,
            {
                ...user._doc,
                password: undefined,
                refreshTokens: undefined,
            }, "User registered Successfully. Please check your email for verification."))
    } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        // Delete the user if email fails to send
        await User.findByIdAndDelete(user._id);
        throw new ApiError("Registration failed", 500, "Failed to send verification email. Please try again.");
    }
})

export const verifyEmail = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const user = await User.findOne({
        verificationToken: code,
        verificationTokenExpiresAt: { $gt: Date.now() }
    })

    if (!user) {
        throw new ApiError("Error while verifying the email", 400, "Invalid or expired verification code")
    }
    user.is_verified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined
    await user.save();
    await sendWelcomeEmail(user.name, user.email);
    return res.status(200).json(
        new ApiResponse(200, {}, "Verify Email Successfully", true)
    )

})

// Resend verification code
export const resendVerificationCode = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError("Missing email", 400, "Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError("User not found", 404, "No user with this email");
    }
    if (user.is_verified) {
        return res.status(200).json(new ApiResponse(200, {}, "Email already verified", true));
    }

    const verificationToken = generateVerificationCode();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
        await sendVerificationEmail(user.name, user.email, verificationToken);
        return res.status(200).json(new ApiResponse(200, {}, "Verification code resent", true));
    } catch (emailError) {
        console.error("Failed to resend verification email:", emailError);
        // Revert the token changes if email fails
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        throw new ApiError("Failed to resend verification", 500, "Failed to send verification email. Please try again.");
    }
});

export const loginUser = asyncHandler(async (req, res) => {
    const errors = evValidationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError("Error while login", 400, errors.array());
    }

    const { email, password, deviceId } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        // Log failed login attempt
        await logFailedLogin(email, req.ip, req.get('User-Agent'), deviceId, 'User not found');
        recordFailedAttempt(email);
        throw new ApiError("Error while login", 400, "Email and password are not correct");
    }

    const correctPassword = await user.isPasswordCorrect(password);
    if (!correctPassword) {
        // Log failed login attempt
        await logFailedLogin(email, req.ip, req.get('User-Agent'), deviceId, 'Incorrect password');
        recordFailedAttempt(email);
        throw new ApiError("Error while login", 400, "Password and email do not exist");
    }
    if (!user.is_verified) {
        // Log failed login attempt
        await logFailedLogin(email, req.ip, req.get('User-Agent'), deviceId, 'Email not verified');
        recordFailedAttempt(email);
        throw new ApiError("Error while login", 400, "Email not verified. Please check your email for verification code.");
    }
    
    // Clear failed attempts on successful login
    clearFailedAttempts(email);
    
    // Log successful login
    await logSuccessfulLogin(user._id, 'User', req.ip, req.get('User-Agent'), deviceId);
    
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user, deviceId, 'User');

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: {
                        ...user._doc,
                        password: undefined,
                        refreshTokens: undefined,
                    },
                    accessToken,
                    refreshToken,
                },

                "User Logged In Successfully"
            )
        );
});

export const logoutUser = asyncHandler(async (req, res) => {
    const { deviceId } = req.body;

    await User.findByIdAndUpdate(req.user._id, {
        $pull: { refreshTokens: { deviceId } },
    });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully", true));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.query?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log(incomingRefreshToken, req.cookies);

    const { deviceId } = req.body;

    if (!incomingRefreshToken || !deviceId) {
        throw new ApiError("Unauthorized request", 401, "Invalid token or device ID");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id);

        if (!user) {
            throw new ApiError("Unauthorized request", 401, "Invalid refresh token");
        }

        const tokenMatch = user.refreshTokens.find((t) => t.token === incomingRefreshToken && t.deviceId === deviceId);
        if (!tokenMatch) {
            throw new ApiError("Unauthorized request", 401, "Token does not match any device");
        }

        const accessToken = await generateAccessToken(user, 'User');

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        };

        return res.status(200).cookie("accessToken", accessToken, options).json(new ApiResponse(200, { accessToken }, "Refresh Access Token Successfully"));
    } catch (error) {
        throw new ApiError("Unauthorized request", 401, "Invalid refresh token");
    }
});

export const forgotPassword = asyncHandler(async (req, res) => {
    const errors = evValidationResult(req);

    if (!errors.isEmpty()) {
        if (!errors.isEmpty()) {
            throw new ApiError("Error while forget password", 400, errors.array())
        }
    }
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError("error in forgot password", 400, "Invalid email")
    }
    //Generate reset token
    const resetToken = randomBytes(20).toString('hex');
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000;// 1 hours in milliseconds
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    await user.save();
    //send email
    await sendResetPasswordEmail(user.name, email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
    return res.status(200).json(new ApiResponse(200, {}, "Reset token successfully sent to user email address"))
})

export const resetPassword = asyncHandler(async (req, res) => {
    const errors = evValidationResult(req);

    if (!errors.isEmpty()) {
        if (!errors.isEmpty()) {
            throw new ApiError("Error while reset password", 400, errors.array())
        }
    }
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    if (confirmPassword != password) {
        throw new ApiError("error in reset password", 400, "confirm password does not match")
    }
    const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } })
    if (!user) {
        throw new ApiError("error in reset password", 400, "Invalid or expired reset token")

    };
    if (user.password === password || user.password === confirmPassword) {
        throw new ApiError("error in reset password", 400, "entered old password pls enter new one")
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    await user.save();
    sendResetSuccessEmail(user.name, user.email);
    return res.status(200).json(new ApiResponse(200, {}, "User password successfully reset", true));
})

export { getDeviceDetails } from '../utils/deviceUtils.js';

export const updateEditProfile = asyncHandler(async (req, res) => {
    const errors = evValidationResult(req);

    if (!errors.isEmpty()) {
        throw new ApiError("Validation error while updating profile", 400, errors.array());
    }

    const { name, email, mobile } = req.body; // Extract user data
    const userId = req.user._id; // Get user ID from session
    const user = await User.findById(userId); // Fetch user from the database

    if (!user) {
        throw new ApiError("User not found", 404, "User not found");
    }

    let image;
    console.log(req.file);
     // Default to existing image
    if (req.file) {
        const localImagePath = req.file.path; // Uploaded image file path
        image = await uploadOnCloudinary(localImagePath); // Upload to cloud
        user.image = image?.url || '';

        // Optionally: Delete the local file if not needed anymore
        // fs.unlinkSync(localImagePath);
    }

    // Update fields
    user.name = name;
    user.email = email;
    user.mobile = mobile;

    await user.save(); // Save updates to database
    res.status(200).json(new ApiResponse(200, {
        ...user._doc,
        password: undefined,
        refreshTokens: undefined,
    }, "User updated successfully", true));
});

export const viewProfile= asyncHandler(async (req, res) => {
  
        const userId = req.user._id; // Get user ID from session
        const user = await User.findById(userId); // Fetch user from the database
  
        if (!user) {
            throw new ApiError("Error while view the user profile", 400, "User not found",)        }
        res.status(200).json(new ApiResponse(200,{
            ...user._doc,
            password:undefined,
            refreshTokens: undefined,

        }, ""))
        // res.render('viewProfile', { user }); // Render the profile EJS template with user data
  });
  
 export const loadEditProfile=asyncHandler(async (req, res) => {
        const userId = req.user._id; // Get user ID from session
        const user = await User.findById(userId); // Fetch user from the database
  
        if (!user) {
            throw new ApiError("Error while loading edit profile", 400, "User not found",)
        }
        res.status(200).json(new ApiResponse(200,{
            ...user._doc,
            password:undefined,
            refreshTokens: undefined,

        }, ""))
   
  })
  
  export const getTopProducts = asyncHandler(async (req, res) => {
  try {
    // Get top products by actual order count from all shops
    let topProducts = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $lookup: {
          from: 'shops',
          localField: 'productDetails.shopId',
          foreignField: '_id',
          as: 'shopDetails'
        }
      },
      { $unwind: '$shopDetails' },
      {
        $project: {
          _id: '$productDetails._id',
          name: '$productDetails.name',
          description: '$productDetails.description',
          price: '$productDetails.price',
          image: '$productDetails.image',
          available: '$productDetails.available',
          category: '$productDetails.category',
          shopId: '$productDetails.shopId',
          shopName: '$shopDetails.name',
          totalOrders: 1,
          totalQuantity: 1,
          averageRating: '$productDetails.averageRating',
          totalRatings: '$productDetails.totalRatings',
          totalLikes: '$productDetails.totalLikes',
          totalFavorites: '$productDetails.totalFavorites',
          totalComments: '$productDetails.totalComments'
        }
      },
      { $sort: { totalOrders: -1, totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    console.log('Top products by orders found:', topProducts.length);
    console.log('Top products data:', topProducts);

    // If no order data, fall back to top rated products
    if (!topProducts || topProducts.length === 0) {
      console.log('No order data found, falling back to top rated products');
      
      const { Product } = await import('../models/productsModel.js');
      const { Shop } = await import('../models/shopModel.js');
      
      topProducts = await Product.aggregate([
        {
          $lookup: {
            from: 'shops',
            localField: 'shopId',
            foreignField: '_id',
            as: 'shopDetails'
          }
        },
        { $unwind: '$shopDetails' },
        {
          $project: {
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            image: 1,
            available: 1,
            category: 1,
            shopId: 1,
            shopName: '$shopDetails.name',
            averageRating: { $ifNull: ['$averageRating', 0] },
            totalRatings: { $ifNull: ['$totalRatings', 0] },
            totalLikes: { $ifNull: ['$totalLikes', 0] },
            totalFavorites: { $ifNull: ['$totalFavorites', 0] },
            totalComments: { $ifNull: ['$totalComments', 0] }
          }
        },
        {
          $addFields: {
            totalOrders: 0,
            totalQuantity: 0
          }
        },
        { $sort: { averageRating: -1, totalRatings: -1 } },
        { $limit: 10 }
      ]);
    }

    console.log(`Found ${topProducts.length} top products`);

    res.status(200).json(new ApiResponse(200, {
      topProducts
    }, ""));
  } catch (error) {
    console.error('Error fetching top products:', error);
    
    // Final fallback - return empty array
    res.status(200).json(new ApiResponse(200, {
      topProducts: []
    }, ""));
  }
});


export const loadHome = asyncHandler(async (req, res) => {
    const user = req.user;
    const now = new Date();
    
    // Fetch only active and approved offers that are currently valid
    const offers = await Offer.find({
        isApproved: true,
        isActive: true,
        validFrom: { $lte: now },
        validUntil: { $gte: now }
    }).populate('shopId', 'name city state image')
      .sort({ discountValue: -1 });
    
    // Fetch approved shops
    const shops = await Shop.find({ isApproved: true, isActive: true });
    
    return res.status(200).json(new ApiResponse(200, {
        offers: offers || [],
        shops: shops || [],
        user: {
            ...user._doc,
            password: undefined,
            refreshTokens: undefined,
        }
    }, "Home data loaded successfully"));
});
export const getCsrfToken = (req, res) => {
    res.status(200).json({ csrfToken: req.csrfToken() });
};

// User-facing shop and order endpoints
export const listShops = asyncHandler(async (req, res) => {
    const { page = 1, limit = 12, search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { isApproved: true };
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { cuisineType: { $regex: search, $options: 'i' } }
        ];
    }
    
    // Get total count for pagination
    const totalShops = await Shop.countDocuments(query);
    const totalPages = Math.ceil(totalShops / limit);
    
    // Get shops with pagination
    const shops = await Shop.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
    
    // Populate additional data for each shop
    const shopsWithData = await Promise.all(shops.map(async (shop) => {
        const shopObj = shop.toObject();
        
        // Get product count for this shop
        const productCount = await Product.countDocuments({ 
            shopId: shop._id, 
            isApproved: true,
            available: true 
        });
        
        // Get order count for this shop
        const orderCount = await Order.countDocuments({ 
            'shops.shopId': shop._id 
        });
        
        // Add computed fields
        shopObj.totalProducts = productCount;
        shopObj.totalOrders = orderCount;
        shopObj.totalCustomers = orderCount; // Simplified for now
        
        return shopObj;
    }));
    
    return res.status(200).json(new ApiResponse(200, {
        shops: shopsWithData,
        totalPages,
        currentPage: parseInt(page),
        totalShops
    }, "Shops fetched successfully"));
});

export const getShopById = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    console.log('🔍 Getting shop by ID:', shopId);
    
    const shop = await Shop.findById(shopId);
    if (!shop) {
        console.log('❌ Shop not found for ID:', shopId);
        throw new ApiError("Error while fetching shop", 404, "Shop not found");
    }
    
    console.log('✅ Shop found:', {
        id: shop._id,
        name: shop.name,
        description: shop.description,
        city: shop.city,
        state: shop.state,
        isApproved: shop.isApproved,
        isActive: shop.isActive,
        openingHours: shop.openingHours,
        closingHours: shop.closingHours,
        contactNumber: shop.contactNumber,
        location: shop.location,
        averageRating: shop.averageRating,
        totalRatings: shop.totalRatings
    });
    
    // For users, only show approved shops
    if (!shop.isApproved) {
        console.log('❌ Shop not approved:', shop.name);
        throw new ApiError("Shop not available", 404, "This shop is not available");
    }
    
    // Log the full shop object being sent
    console.log('📤 Sending shop data:', JSON.stringify(shop, null, 2));
    
    return res.status(200).json(new ApiResponse(200, shop, ""));
});

export const getProductsByShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    console.log('Getting products for shopId:', shopId);
    
    // First, let's check if there are any products at all
    const totalProducts = await Product.countDocuments();
    console.log('Total products in database:', totalProducts);
    
    // Check if the shop exists
    const shop = await Shop.findById(shopId);
    console.log('Shop found:', shop ? 'Yes' : 'No');
    if (shop) {
      console.log('Shop name:', shop.name);
    }
    
    // Only return approved products for users
    const products = await Product.find({ 
        shopId, 
        isApproved: true,
        available: true 
    });
    console.log('Found approved products for this shop:', products.length);
    console.log('Products:', products);
    
    return res.status(200).json(new ApiResponse(200, products, ""));
});

export const listUserOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId }).populate('shops.shopId').populate('shops.products.productId');
    return res.status(200).json(new ApiResponse(200, orders, ""));
});

export const listUserOrderHistory = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    // First, archive any completed orders that should be moved to history
    try {
        const { archiveUserCompletedOrders } = await import('../utils/orderUtils.js');
        const archiveResult = await archiveUserCompletedOrders(userId);
        console.log('📦 OrderHistory: Archive result:', archiveResult);
    } catch (error) {
        console.error('❌ OrderHistory: Error during archiving:', error);
        // Continue with fetching history even if archiving fails
    }
    
    // Now fetch the updated order history
    const history = await OrderHistory.find({ user: userId })
        .populate('shopDetails.shop')
        .populate('shopDetails.products.product');
    
    console.log('📋 OrderHistory: Fetched history count:', history.length);
    return res.status(200).json(new ApiResponse(200, history, ""));
});

export const archiveCompletedOrders = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    try {
        const { archiveUserCompletedOrders } = await import('../utils/orderUtils.js');
        const result = await archiveUserCompletedOrders(userId);
        
        if (result.success) {
            return res.status(200).json(new ApiResponse(200, result, "Orders archived successfully"));
        } else {
            throw new ApiError("Failed to archive orders", 500, result.error);
        }
    } catch (error) {
        console.error('❌ Archive orders error:', error);
        throw new ApiError("Error archiving orders", 500, error.message);
    }
});

// Test endpoint to check shop status
export const testShopStatus = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    
    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            throw new ApiError("Shop not found", 404, "Shop not found");
        }
        
        console.log('🔍 Test shop status for:', shopId);
        console.log('Shop data:', {
            id: shop._id,
            name: shop.name,
            isActive: shop.isActive,
            isApproved: shop.isApproved,
            openingHours: shop.openingHours,
            closingHours: shop.closingHours
        });
        
        return res.status(200).json(new ApiResponse(200, {
            shop: {
                id: shop._id,
                name: shop.name,
                isActive: shop.isActive,
                isApproved: shop.isApproved,
                openingHours: shop.openingHours,
                closingHours: shop.closingHours,
                status: shop.isActive && shop.isApproved ? 'Open' : 'Closed'
            }
        }, "Shop status checked"));
        
    } catch (error) {
        console.error('❌ Error checking shop status:', error);
        throw error;
    }
});

// Test endpoint to approve a shop
export const testApproveShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    
    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            throw new ApiError("Shop not found", 404, "Shop not found");
        }
        
        // Update shop to be approved and active
        shop.isApproved = true;
        shop.isActive = true;
        await shop.save();
        
        console.log('✅ Shop approved:', shop.name);
        
        return res.status(200).json(new ApiResponse(200, {
            shop: {
                id: shop._id,
                name: shop.name,
                isActive: shop.isActive,
                isApproved: shop.isApproved,
                status: 'Approved and Active'
            }
        }, "Shop approved successfully"));
        
    } catch (error) {
        console.error('❌ Error approving shop:', error);
        throw error;
    }
});

// Test endpoint to mark an order as completed (for testing archiving)
export const testMarkOrderCompleted = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { orderId } = req.params;
    
    try {
        const order = await Order.findOne({ _id: orderId, user: userId });
        if (!order) {
            throw new ApiError("Order not found", 404, "Order not found");
        }
        
        // Mark order as completed
        order.deliveryStatus = 'delivered';
        order.shops = order.shops.map(shop => ({
            ...shop.toObject(),
            status: 'delivered',
            deliveredAt: new Date()
        }));
        
        await order.save();
        
        return res.status(200).json(new ApiResponse(200, order, "Order marked as completed"));
    } catch (error) {
        console.error('❌ Test mark order completed error:', error);
        throw new ApiError("Error marking order as completed", 500, error.message);
    }
});

export const getUserOrderById = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: userId }).populate('shops.shopId').populate('shops.products.productId');
    if (!order) {
        throw new ApiError('Order not found', 404, 'Order not found');
    }
    return res.status(200).json(new ApiResponse(200, order, 'OK'));
});

export const cancelUserOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) {
        throw new ApiError('Order not found', 404, 'Order not found');
    }
    // Mark all shops as cancelled for user cancel
    order.shops = order.shops.map(s => ({ ...s.toObject(), status: 'cancelled', cancelReason: reason || 'User cancelled' }));
    await order.save();
    try {
        await Notification.create({
            userId: userId,
            userModel: 'User',
            type: 'warning',
            title: 'Order Cancelled',
            message: `Your order ${id} was cancelled`,
            metadata: { orderId: id }
        });
    } catch {}
    return res.status(200).json(new ApiResponse(200, { order }, 'Order cancelled', true));
});

export const createOrder = asyncHandler(async (req, res) => {
    console.log('🔄 Backend: createOrder called with body:', req.body);
    console.log('🔄 Backend: User ID:', req.user._id);
    
    const errors = evValidationResult(req);
    if (!errors.isEmpty()) {
        console.log('❌ Backend: Validation errors:', errors.array());
        throw new ApiError("Validation error while placing order", 400, errors.array());
    }
    
    const userId = req.user._id;
    const { 
        shops, 
        totalQuantity, 
        totalPrice, 
        isPaid = false, 
        orderToken,
        deliveryType = 'regular',
        deliveryLocation,
        pickupLocation
    } = req.body;

    console.log('📊 Backend: Order data extracted:', { 
        shops, 
        totalQuantity, 
        totalPrice, 
        isPaid, 
        deliveryType, 
        deliveryLocation, 
        pickupLocation 
    });

    if (!Array.isArray(shops) || shops.length === 0) {
        console.log('❌ Backend: Invalid shops array:', shops);
        throw new ApiError("Error while placing order", 400, "Invalid order payload");
    }

    // Validate drone delivery requirements
    if (deliveryType === 'drone') {
        if (!deliveryLocation || !pickupLocation) {
            console.log('❌ Backend: Missing drone delivery locations');
            throw new ApiError("Error while placing order", 400, "Delivery and pickup locations are required for drone delivery");
        }
        if (!deliveryLocation.lat || !deliveryLocation.lng || !pickupLocation.lat || !pickupLocation.lng) {
            console.log('❌ Backend: Invalid drone delivery coordinates');
            throw new ApiError("Error while placing order", 400, "Valid coordinates are required for drone delivery");
        }
    }

    console.log('📝 Backend: Creating order in database...');
    const order = await Order.create({
        user: userId,
        shops,
        totalQuantity,
        totalPrice,
        isPaid,
        orderToken: orderToken || randomBytes(12).toString('hex'),
        deliveryType,
        deliveryLocation,
        pickupLocation
    });
    
    console.log('✅ Backend: Order created successfully:', order._id);
    console.log('📋 Backend: Order details:', {
        id: order._id,
        user: order.user,
        shops: order.shops,
        totalQuantity: order.totalQuantity,
        totalPrice: order.totalPrice,
        deliveryType: order.deliveryType
    });

    // Decrement stock per product (basic inventory enforcement)
    try {
        for (const shop of shops) {
            for (const item of shop.products) {
                const p = await Product.findById(item.productId);
                if (p) {
                    p.stock = Math.max(0, (p.stock || 0) - item.quantity);
                    if (p.stock <= 0) p.available = false;
                    await p.save();
                    // Low-stock alert (<=5)
                    if ((p.stock || 0) <= 5) {
                        try {
                            await Notification.create({ userId: p.shopId, userModel: 'Seller', type: 'warning', title: 'Low Stock', message: `${p.name} low stock (${p.stock})`, metadata: { productId: p._id } });
                        } catch {}
                    }
                }
            }
        }
    } catch (invErr) {
        console.warn('Inventory update failed:', invErr?.message);
    }

    // If drone delivery is selected, create drone order automatically
    let droneOrder = null;
    if (deliveryType === 'drone') {
        try {
            const { DroneOrder } = await import('../models/droneOrderModel.js');
            const { generateQRCode } = await import('../utils/qrCodeGenerator.js');
            const { checkWeatherConditions } = await import('../utils/weatherAPI.js');
            
            // Check weather conditions
            const weatherCheck = await checkWeatherConditions(
                deliveryLocation.lat,
                deliveryLocation.lng
            );
            
            // Generate QR code
            const qrCode = generateQRCode(order._id, userId, Date.now());
            
            // Create drone order
            droneOrder = new DroneOrder({
                orderId: order._id,
                userId,
                sellerId: shops[0].shopId, // Assuming single shop order for drone delivery
                qrCode,
                status: weatherCheck.isSafe ? 'pending' : 'weather_blocked',
                weatherCheck,
                location: {
                    pickup: pickupLocation,
                    delivery: deliveryLocation
                }
            });
            
            await droneOrder.save();
            
            // Update order with drone order reference
            order.droneOrderId = droneOrder._id;
            await order.save();
            
        } catch (error) {
            console.error('Failed to create drone order:', error);
            // Continue with regular order even if drone order creation fails
        }
    }

    try {
        await Notification.create({
            userId: userId,
            userModel: 'User',
            type: 'success',
            title: 'Order Placed',
            message: 'Your order was placed successfully',
            metadata: { orderId: order._id }
        });
        console.log('✅ Backend: Notification created successfully');
    } catch (notifError) {
        console.warn('⚠️ Backend: Failed to create notification:', notifError?.message);
    }
    
    console.log('📤 Backend: Sending success response...');
    const responseData = {
        order,
        droneOrder: droneOrder ? {
            ...droneOrder._doc,
            qrCode: droneOrder.qrCode
        } : null
    };
    console.log('📤 Backend: Response data:', responseData);
    
    return res.status(201).json(new ApiResponse(201, responseData, "Order placed successfully"));
});

// Self account deletion
export const deleteSelfAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError('Not found', 404, 'User not found');
    }
    await User.deleteOne({ _id: userId });
    return res.status(200).json(new ApiResponse(200, {}, 'Account deleted', true));
});

// Test endpoint to check database content
export const testDatabase = asyncHandler(async (req, res) => {
  try {
    // Get all products
    const allProducts = await Product.find({});
    console.log('All products in database:', allProducts.length);
    
    // Get all shops
    const allShops = await Shop.find({});
    console.log('All shops in database:', allShops.length);
    
    // Get products with their shop information
    const productsWithShops = await Product.aggregate([
      {
        $lookup: {
          from: 'shops',
          localField: 'shopId',
          foreignField: '_id',
          as: 'shopInfo'
        }
      },
      { $unwind: '$shopInfo' },
      {
        $project: {
          _id: 1,
          name: 1,
          price: 1,
          shopId: 1,
          shopName: '$shopInfo.name'
        }
      }
    ]);
    
    console.log('Products with shop info:', productsWithShops);
    
    res.status(200).json(new ApiResponse(200, {
      totalProducts: allProducts.length,
      totalShops: allShops.length,
      productsWithShops: productsWithShops
    }, "Database test completed"));
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json(new ApiResponse(500, null, "Database test failed"));
  }
});

// Function to create test products if none exist
export const createTestProducts = asyncHandler(async (req, res) => {
  try {
    // Check if any products exist
    const existingProducts = await Product.countDocuments();
    console.log('Existing products count:', existingProducts);
    
    if (existingProducts > 0) {
      return res.status(200).json(new ApiResponse(200, { message: 'Products already exist' }, "Products already exist"));
    }
    
    // Get the first shop to associate products with
    const firstShop = await Shop.findOne({});
    if (!firstShop) {
      return res.status(400).json(new ApiResponse(400, null, "No shops found. Please create a shop first."));
    }
    
    console.log('Creating test products for shop:', firstShop.name);
    
    // Create some test products
    const testProducts = [
      {
        name: 'Test Burger',
        description: 'A delicious test burger',
        price: 299,
        category: 'Fast Food',
        available: true,
        isApproved: true, // Mark as approved so users can see them
        shopId: firstShop._id,
        image: 'https://via.placeholder.com/300x200?text=Burger'
      },
      {
        name: 'Test Pizza',
        description: 'A tasty test pizza',
        price: 499,
        category: 'Italian',
        available: true,
        isApproved: true, // Mark as approved so users can see them
        shopId: firstShop._id,
        image: 'https://via.placeholder.com/300x200?text=Pizza'
      },
      {
        name: 'Test Salad',
        description: 'A healthy test salad',
        price: 199,
        category: 'Healthy',
        available: true,
        isApproved: true, // Mark as approved so users can see them
        shopId: firstShop._id,
        image: 'https://via.placeholder.com/300x200?text=Salad'
      }
    ];
    
    const createdProducts = await Product.insertMany(testProducts);
    console.log('Created test products:', createdProducts.length);
    
    // Update the shop's productId array to include the new products
    const productIds = createdProducts.map(product => product._id);
    await Shop.findByIdAndUpdate(
        firstShop._id,
        { $push: { productId: { $each: productIds } } },
        { new: true }
    );
    
    res.status(200).json(new ApiResponse(200, {
      message: 'Test products created successfully',
      products: createdProducts
    }, "Test products created"));
  } catch (error) {
    console.error('Error creating test products:', error);
    res.status(500).json(new ApiResponse(500, null, "Failed to create test products"));
  }
});

// Function to approve all existing products for testing
export const approveAllProducts = asyncHandler(async (req, res) => {
  try {
    const result = await Product.updateMany(
      { isApproved: { $ne: true } }, // Find products that are not approved
      { 
        $set: { 
          isApproved: true,
          approvedAt: new Date()
        } 
      }
    );
    
    console.log('Approved products:', result.modifiedCount);
    
    res.status(200).json(new ApiResponse(200, {
      message: `Approved ${result.modifiedCount} products`,
      modifiedCount: result.modifiedCount
    }, "Products approved successfully"));
  } catch (error) {
    console.error('Error approving products:', error);
    res.status(500).json(new ApiResponse(500, null, "Failed to approve products"));
  }
});

// Simple test endpoint without authentication
export const testBackend = asyncHandler(async (req, res) => {
    try {
        // Test database connection
        const totalProducts = await Product.countDocuments();
        const totalShops = await Shop.countDocuments();
        
        console.log('Backend test - Total products:', totalProducts);
        console.log('Backend test - Total shops:', totalShops);
        
        res.status(200).json(new ApiResponse(200, {
            message: 'Backend is working',
            totalProducts,
            totalShops,
            timestamp: new Date().toISOString()
        }, "Backend test successful"));
    } catch (error) {
        console.error('Backend test error:', error);
        res.status(500).json(new ApiResponse(500, null, "Backend test failed"));
    }
});

// Test endpoint to get shop information without authentication
export const testShopInfo = asyncHandler(async (req, res) => {
    try {
        const shops = await Shop.find({});
        const products = await Product.find({});
        
        console.log('Test shop info - Shops:', shops.length);
        console.log('Test shop info - Products:', products.length);
        console.log('Shop details:', shops.map(s => ({ id: s._id, name: s.name, isApproved: s.isApproved })));
        console.log('Product details:', products.map(p => ({ id: p._id, name: p.name, shopId: p.shopId, isApproved: p.isApproved })));
        
        res.status(200).json(new ApiResponse(200, {
            shops: shops.map(s => ({ id: s._id, name: s.name, isApproved: s.isApproved })),
            products: products.map(p => ({ id: p._id, name: p.name, shopId: p.shopId, isApproved: p.isApproved, available: p.available }))
        }, "Shop info test successful"));
    } catch (error) {
        console.error('Shop info test error:', error);
        res.status(500).json(new ApiResponse(500, null, "Shop info test failed"));
    }
});

// Test endpoint to approve all products without authentication
export const testApproveProducts = asyncHandler(async (req, res) => {
    try {
        const result = await Product.updateMany(
            { isApproved: { $ne: true } },
            { 
                $set: { 
                    isApproved: true,
                    approvedAt: new Date()
                } 
            }
        );
        
        console.log('Test approve products - Modified count:', result.modifiedCount);
        
        // Get updated products
        const products = await Product.find({});
        
        res.status(200).json(new ApiResponse(200, {
            message: `Approved ${result.modifiedCount} products`,
            modifiedCount: result.modifiedCount,
            products: products.map(p => ({ id: p._id, name: p.name, shopId: p.shopId, isApproved: p.isApproved, available: p.available }))
        }, "Products approved successfully"));
    } catch (error) {
        console.error('Test approve products error:', error);
        res.status(500).json(new ApiResponse(500, null, "Failed to approve products"));
    }
});

// Test endpoint to get products for a specific shop without authentication
export const testShopProducts = asyncHandler(async (req, res) => {
    try {
        const { shopId } = req.params;
        console.log('Test shop products - shopId:', shopId);
        
        // Check if the shop exists
        const shop = await Shop.findById(shopId);
        console.log('Test shop products - Shop found:', shop ? 'Yes' : 'No');
        
        // Get approved products for this shop
        const products = await Product.find({ 
            shopId, 
            isApproved: true,
            available: true 
        });
        
        console.log('Test shop products - Found products:', products.length);
        console.log('Test shop products - Products:', products);
        
        res.status(200).json(new ApiResponse(200, {
            shop: shop ? { id: shop._id, name: shop.name, isApproved: shop.isApproved } : null,
            products: products,
            count: products.length
        }, "Shop products test successful"));
    } catch (error) {
        console.error('Test shop products error:', error);
        res.status(500).json(new ApiResponse(500, null, "Shop products test failed"));
    }
});
