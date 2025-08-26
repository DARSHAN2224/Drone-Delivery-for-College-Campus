import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Seller } from "../models/sellerModel.js";
import { Shop } from "../models/shopModel.js";
import { Product } from "../models/productsModel.js";
import { Offer } from "../models/offersModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import { generateAccessAndRefreshTokens } from "../utils/tokenUtils.js";
import jwt from "jsonwebtoken";
import { Order } from "../models/ordersModel.js";

// Register seller
export const registerSeller = asyncHandler(async (req, res) => {
    const { name, email, password, mobile, address } = req.body;

    if ([name, email, password, mobile, address].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedSeller = await Seller.findOne({
        $or: [{ email }, { mobile }]
    });

    if (existedSeller) {
        throw new ApiError(409, "Seller with email or mobile already exists");
    }

    const seller = await Seller.create({
        name,
        email,
        password,
        mobile,
        address
    });

    const createdSeller = await Seller.findById(seller._id).select("-password -refreshTokens");

    if (!createdSeller) {
        throw new ApiError(500, "Something went wrong while registering the seller");
    }

    return res.status(201).json(
        new ApiResponse(201, createdSeller, "Seller registered successfully")
    );
});

// Login seller
export const loginSeller = asyncHandler(async (req, res) => {
    const { email, password, deviceId } = req.body;

    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const seller = await Seller.findOne({ email });

    if (!seller) {
        throw new ApiError(401, "Invalid credentials");
    }

    const isPasswordValid = await seller.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens with proper parameters
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(seller._id, deviceId, 'Seller');

    const loggedInSeller = await Seller.findById(seller._id).select("-password -refreshTokens");

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    seller: loggedInSeller,
                    accessToken,
                    refreshToken,
                },
                "Seller logged in successfully"
            )
        );
});

// Logout seller
export const logoutSeller = asyncHandler(async (req, res) => {
    const { deviceId } = req.body;
    
    if (deviceId) {
        // Remove specific device's refresh token
        await Seller.findByIdAndUpdate(
            req.seller._id,
            {
                $pull: { refreshTokens: { deviceId } }
            },
            {
                new: true
            }
        );
    } else {
        // Remove all refresh tokens (full logout)
        await Seller.findByIdAndUpdate(
            req.seller._id,
            {
                $set: { refreshTokens: [] }
            },
            {
                new: true
            }
        );
    }

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "Seller logged out"));
});

// Refresh access token
export const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    const { deviceId } = req.body;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        const seller = await Seller.findById(decodedToken?._id);

        if (!seller) {
            throw new ApiError(401, "Invalid refresh token");
        }

        // Check if the refresh token exists in the seller's refreshTokens array
        let tokenExists;
        if (deviceId) {
            // Check for specific device
            tokenExists = seller.refreshTokens && seller.refreshTokens.some(rt => rt.token === incomingRefreshToken && rt.deviceId === deviceId);
        } else {
            // Check for any matching token (fallback for backward compatibility)
            tokenExists = seller.refreshTokens && seller.refreshTokens.some(rt => rt.token === incomingRefreshToken);
        }
        
        if (!tokenExists) {
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        };

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(seller._id, deviceId, 'Seller');

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

// Get current seller
export const getCurrentSeller = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.seller, "Seller fetched successfully")
    );
});

// View seller profile (alias for getCurrentSeller for consistency)
export const viewProfile = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.seller, "Seller profile fetched successfully")
    );
});

// Update seller profile
export const updateSellerProfile = asyncHandler(async (req, res) => {
    const { name, email, mobile, address } = req.body;

    if (!name && !email && !mobile && !address) {
        throw new ApiError(400, "At least one field is required");
    }

    const seller = await Seller.findByIdAndUpdate(
        req.seller._id,
        {
            $set: {
                ...(name && { name }),
                ...(email && { email }),
                ...(mobile && { mobile }),
                ...(address && { address })
            }
        },
        { new: true }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(200, seller, "Profile updated successfully")
    );
});

// Change password
export const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const seller = await Seller.findById(req.seller._id);
    const isPasswordCorrect = await seller.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    seller.password = newPassword;
    await seller.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(200, {}, "Password changed successfully")
    );
});

// Get seller dashboard
export const getSellerDashboard = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;

    // Get seller's shops
    const shops = await Shop.find({ sellerId }).select('name isActive isApproved');

    // Get shop IDs to find products
    const shopIds = shops.map(shop => shop._id);
    
    // Get total products across all shops
    const totalProducts = await Product.countDocuments({ shopId: { $in: shopIds } });

    // Get total offers
    const totalOffers = await Offer.countDocuments({ sellerId });

    // Get recent products
    const recentProducts = await Product.find({ shopId: { $in: shopIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name price image');

    // Get recent offers
    const recentOffers = await Offer.find({ sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title discountPercentage');

    const dashboardData = {
        shops,
        totalProducts,
        totalOffers,
        recentProducts,
        recentOffers
    };

    return res.status(200).json(
        new ApiResponse(200, dashboardData, "Dashboard data fetched successfully")
    );
});

// Get seller shops
export const getSellerShops = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;

    const shops = await Shop.find({ sellerId })
        .select('name description state city location contactNumber openingHours closingHours isActive isApproved createdAt productId')
        .populate('productId', 'name price image');

    return res.status(200).json(
        new ApiResponse(200, shops, "Shops fetched successfully")
    );
});

// Get seller products
export const getSellerProducts = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;

    // First get all shops of the seller
    const sellerShops = await Shop.find({ sellerId }).select('_id name');
    const shopIds = sellerShops.map(shop => shop._id);

    // Then get products from those shops
    const products = await Product.find({ shopId: { $in: shopIds } })
        .populate('shopId', 'name')
        .select('name description price image available stock discount isApproved');

    return res.status(200).json(
        new ApiResponse(200, products, "Products fetched successfully")
    );
});

// Get seller offers
export const getSellerOffers = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;

    const offers = await Offer.find({ sellerId })
        .populate('productId', 'name price image')
        .select('title description discountPercentage startDate endDate productId');

    return res.status(200).json(
        new ApiResponse(200, offers, "Offers fetched successfully")
    );
});

// Create shop
export const createShop = asyncHandler(async (req, res) => {
    const { 
        name, 
        description, 
        state, 
        city, 
        location, 
        FSSAI_license,
        Eating_house_license,
        Healt_or_trade_license,
        Liquior_license,
        Gst_registration,
        Environmental_clearance_license,
        Fire_safety_license,
        Signage_license,
        Shop_act,
        Insurance,
        contactNumber,
        openingHours,
        closingHours
    } = req.body;

    if (!name || !state || !city || !location || !openingHours || !closingHours) {
        throw new ApiError(400, "Name, state, city, location, opening hours, and closing hours are required");
    }

    const sellerId = req.seller._id;

    // Check if seller already has a shop with this name
    const existingShop = await Shop.findOne({ sellerId, name });
    if (existingShop) {
        throw new ApiError(400, "Shop with this name already exists");
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (req.file) {
        const localImagePath = req.file.path;
        const result = await uploadOnCloudinary(localImagePath);
        imageUrl = result?.url;
    }

    const shop = await Shop.create({
        name,
        description,
        state,
        city,
        location,
        FSSAI_license,
        Eating_house_license,
        Healt_or_trade_license,
        Liquior_license,
        Gst_registration,
        Environmental_clearance_license,
        Fire_safety_license,
        Signage_license,
        Shop_act,
        Insurance,
        contactNumber: contactNumber ? parseInt(contactNumber) : undefined,
        openingHours,
        closingHours,
        image: imageUrl,
        sellerId
    });

    return res.status(201).json(
        new ApiResponse(201, shop, "Shop created successfully")
    );
});

// Update shop
export const updateShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const { 
        name, 
        description, 
        state, 
        city, 
        location, 
        FSSAI_license,
        Eating_house_license,
        Healt_or_trade_license,
        Liquior_license,
        Gst_registration,
        Environmental_clearance_license,
        Fire_safety_license,
        Signage_license,
        Shop_act,
        Insurance,
        contactNumber,
        openingHours,
        closingHours
    } = req.body;

    const sellerId = req.seller._id;

    const shop = await Shop.findOne({ _id: shopId, sellerId });
    if (!shop) {
        throw new ApiError(404, "Shop not found");
    }

    // Handle image upload if provided
    let imageUrl = shop.image; // Keep existing image if no new one
    if (req.file) {
        const localImagePath = req.file.path;
        const result = await uploadOnCloudinary(localImagePath);
        imageUrl = result?.url;
    }

    const updatedShop = await Shop.findByIdAndUpdate(
        shopId,
        {
            $set: {
                ...(name && { name }),
                ...(description && { description }),
                ...(state && { state }),
                ...(city && { city }),
                ...(location && { location }),
                ...(FSSAI_license && { FSSAI_license }),
                ...(Eating_house_license && { Eating_house_license }),
                ...(Healt_or_trade_license && { Healt_or_trade_license }),
                ...(Liquior_license && { Liquior_license }),
                ...(Gst_registration && { Gst_registration }),
                ...(Environmental_clearance_license && { Environmental_clearance_license }),
                ...(Fire_safety_license && { Fire_safety_license }),
                ...(Signage_license && { Signage_license }),
                ...(Shop_act && { Shop_act }),
                ...(Insurance && { Insurance }),
                ...(contactNumber && { contactNumber: parseInt(contactNumber) }),
                ...(openingHours && { openingHours }),
                ...(closingHours && { closingHours }),
                ...(imageUrl && { image: imageUrl })
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedShop, "Shop updated successfully")
    );
});

// Delete seller's shop (for frontend compatibility)
export const deleteSellerShop = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;

    // Find the seller's shop
    const shop = await Shop.findOne({ sellerId });
    if (!shop) {
        throw new ApiError(404, "No shop found");
    }

    // Check if shop has products
    const productCount = await Product.countDocuments({ shopId: shop._id });
    if (productCount > 0) {
        throw new ApiError(400, "Cannot delete shop with existing products. Please delete all products first.");
    }

    await Shop.findByIdAndDelete(shop._id);

    return res.status(200).json(
        new ApiResponse(200, {}, "Shop deleted successfully")
    );
});

// Delete shop
export const deleteShop = asyncHandler(async (req, res) => {
    const { shopId } = req.params;
    const sellerId = req.seller._id;

    const shop = await Shop.findOne({ _id: shopId, sellerId });
    if (!shop) {
        throw new ApiError(404, "Shop not found");
    }

    // Check if shop has products
    const productCount = await Product.countDocuments({ shopId });
    if (productCount > 0) {
        throw new ApiError(400, "Cannot delete shop with existing products");
    }

    await Shop.findByIdAndDelete(shopId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Shop deleted successfully")
    );
});

// Create product
export const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, shopId, stock, discount } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !shopId) {
        throw new ApiError(400, "Name, description, price, category, and shopId are required");
    }

    // Validate and parse numeric fields
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new ApiError(400, "Price must be a valid positive number");
    }

    let parsedStock = 0;
    if (stock !== undefined && stock !== null && stock !== '') {
        parsedStock = parseInt(stock);
        if (isNaN(parsedStock) || parsedStock < 0) {
            throw new ApiError(400, "Stock must be a valid non-negative integer");
        }
    }

    let parsedDiscount = 0;
    if (discount !== undefined && discount !== null && discount !== '') {
        parsedDiscount = parseFloat(discount);
        if (isNaN(parsedDiscount) || parsedDiscount < 0) {
            throw new ApiError(400, "Discount must be a valid non-negative number");
        }
    }

    const sellerId = req.seller._id;

    // Verify shop belongs to seller
    const shop = await Shop.findOne({ _id: shopId, sellerId });
    if (!shop) {
        throw new ApiError(404, "Shop not found or does not belong to you");
    }

    // Handle image upload if provided
    let imageUrl = null;
    if (req.file) {
        try {
            const localImagePath = req.file.path;
            const result = await uploadOnCloudinary(localImagePath);
            imageUrl = result?.url;
        } catch (uploadError) {
            console.error('Image upload failed:', uploadError);
            throw new ApiError(400, "Failed to upload image. Please try again.");
        }
    }

    const product = await Product.create({
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        category: category.trim(),
        shopId,
        stock: parsedStock,
        discount: parsedDiscount,
        image: imageUrl,
        available: true
    });

    return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );
});

// Update product
export const updateProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { name, description, price, category, isAvailable, stock, discount } = req.body;

    const sellerId = req.seller._id;

    // First find the product
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Verify the product belongs to a shop owned by the seller
    const shop = await Shop.findOne({ _id: product.shopId, sellerId });
    if (!shop) {
        throw new ApiError(404, "Product not found");
    }

    // Handle image upload if provided
    let imageUrl = product.image; // Keep existing image if no new one
    if (req.file) {
        const localImagePath = req.file.path;
        const result = await uploadOnCloudinary(localImagePath);
        imageUrl = result?.url;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            $set: {
                ...(name && { name }),
                ...(description && { description }),
                ...(price && { price: parseFloat(price) }),
                ...(category && { category }),
                ...(typeof isAvailable === 'boolean' && { available: isAvailable }),
                ...(stock && { stock: parseInt(stock) }),
                ...(discount && { discount: parseFloat(discount) }),
                ...(imageUrl && { image: imageUrl })
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedProduct, "Product updated successfully")
    );
});

// Delete product
export const deleteProduct = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const sellerId = req.seller._id;

    // First find the product
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Verify the product belongs to a shop owned by the seller
    const shop = await Shop.findOne({ _id: product.shopId, sellerId });
    if (!shop) {
        throw new ApiError(404, "Product not found");
    }

    await Product.findByIdAndDelete(productId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Product deleted successfully")
    );
});

// Create offer
export const createOffer = asyncHandler(async (req, res) => {
    const { title, description, discountPercentage, startDate, endDate, productId } = req.body;

    if (!title || !discountPercentage || !startDate || !endDate || !productId) {
        throw new ApiError(400, "All fields are required");
    }

    const sellerId = req.seller._id;

    // First find the product
    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // Verify the product belongs to a shop owned by the seller
    const shop = await Shop.findOne({ _id: product.shopId, sellerId });
    if (!shop) {
        throw new ApiError(404, "Product not found");
    }

    const offer = await Offer.create({
        title,
        description,
        discountPercentage,
        startDate,
        endDate,
        productId,
        sellerId
    });

    return res.status(201).json(
        new ApiResponse(201, offer, "Offer created successfully")
    );
});

// Update offer
export const updateOffer = asyncHandler(async (req, res) => {
    const { offerId } = req.params;
    const { title, description, discountPercentage, startDate, endDate } = req.body;

    const sellerId = req.seller._id;

    const offer = await Offer.findOne({ _id: offerId, sellerId });
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    const updatedOffer = await Offer.findByIdAndUpdate(
        offerId,
        {
            $set: {
                ...(title && { title }),
                ...(description && { description }),
                ...(discountPercentage && { discountPercentage }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate })
            }
        },
        { new: true }
    );

    return res.status(200).json(
        new ApiResponse(200, updatedOffer, "Offer updated successfully")
    );
});

// Delete offer
export const deleteOffer = asyncHandler(async (req, res) => {
    const { offerId } = req.params;
    const sellerId = req.seller._id;

    const offer = await Offer.findOne({ _id: offerId, sellerId });
    if (!offer) {
        throw new ApiError(404, "Offer not found");
    }

    await Offer.findByIdAndDelete(offerId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Offer deleted successfully")
    );
});

// Get seller home data (comprehensive data for dashboard)
export const getSellerHome = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;

    // Get seller's shops
    const shops = await Shop.find({ sellerId })
        .select('name description state city location contactNumber openingHours closingHours isActive isApproved productId')
        .populate('productId', 'name price image');

    // Get shop IDs to find products
    const shopIds = shops.map(shop => shop._id);
    
    // Get total products across all shops
    const totalProducts = await Product.countDocuments({ shopId: { $in: shopIds } });

    // Get total offers
    const totalOffers = await Offer.countDocuments({ sellerId });

    // Get total orders
    const totalOrders = await Order.countDocuments({
        'shops.shopId': { $in: shopIds }
    });

    // Get recent products
    const recentProducts = await Product.find({ shopId: { $in: shopIds } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name price image');

    // Get recent offers
    const recentOffers = await Offer.find({ sellerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title discountPercentage');

    // Get recent orders
    const recentOrders = await Order.find({
        'shops.shopId': { $in: shopIds }
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('user', 'name email mobile')
        .populate('shops.shopId', 'name')
        .populate('shops.products.productId', 'name price image');

    const homeData = {
        shop: shops[0] || null, // Most sellers have one shop
        productCount: totalProducts,
        offerCount: totalOffers,
        orderCount: totalOrders,
        recentProducts,
        recentOffers,
        recentOrders
    };

    return res.status(200).json(
        new ApiResponse(200, homeData, "Home data fetched successfully")
    );
});

// Get seller statistics
export const getSellerStats = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;

    const totalShops = await Shop.countDocuments({ sellerId });
    
    // Get shop IDs to count products
    const shopIds = await Shop.find({ sellerId }).select('_id');
    const totalProducts = await Product.countDocuments({ shopId: { $in: shopIds } });
    
    const totalOffers = await Offer.countDocuments({ sellerId });
    const activeShops = await Shop.countDocuments({ sellerId, isActive: true });

    const stats = {
        totalShops,
        totalProducts,
        totalOffers,
        activeShops
    };

    return res.status(200).json(
        new ApiResponse(200, stats, "Statistics fetched successfully")
    );
});

// Get seller orders
export const getSellerOrders = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;
    
    // Get all shops of the seller
    const sellerShops = await Shop.find({ sellerId }).select('_id name sellerId');
    const shopIds = sellerShops.map(shop => shop._id);
    
    // Find orders that contain products from seller's shops
    const orders = await Order.find({
        'shops.shopId': { $in: shopIds }
    })
    .populate('user', 'name email mobile')
    .populate('shops.shopId', 'name')
    .populate('shops.products.productId', 'name price image')
    .sort({ createdAt: -1 });



        // Group orders by status for frontend compatibility
    const groupedOrders = {
      arrivedOrders: [],
      processingOrders: [],
      readyOrders: [],
      deliveredOrders: [],
      cancelledOrders: []
    };

        orders.forEach(order => {
      // Find the shop status for this seller's shop
      const sellerShop = order.shops.find(shop => {
        const shopId = shop.shopId._id || shop.shopId;
        // Convert to string for comparison
        const shopIdStr = shopId.toString();
        const shopIdsStr = shopIds.map(id => id.toString());
        const isMatch = shopIdsStr.includes(shopIdStr);
        return isMatch;
      });
      
      if (sellerShop) {
        const status = sellerShop.status;
        
        switch (status) {
          case 'arrived':
            groupedOrders.arrivedOrders.push(order);
            break;
          case 'preparing':
            groupedOrders.processingOrders.push(order);
            break;
          case 'ready':
            groupedOrders.readyOrders.push(order);
            break;
          case 'delivered':
            groupedOrders.deliveredOrders.push(order);
            break;
          case 'cancelled':
            groupedOrders.cancelledOrders.push(order);
            break;
          default:
            groupedOrders.arrivedOrders.push(order);
        }
      }
    });

    return res.status(200).json(
        new ApiResponse(200, groupedOrders, "Orders fetched successfully")
    );
});

// Update order status (Accept → Process → Ready → Cancel)
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { orderId, shopId, status, cancelReason } = req.body;
    const sellerId = req.seller._id;

    // Verify the shop belongs to the seller
    const shop = await Shop.findOne({ _id: shopId, sellerId });
    if (!shop) {
        throw new ApiError(404, "Shop not found");
    }

    // Find and update the order
    const order = await Order.findOneAndUpdate(
        {
            _id: orderId,
            'shops.shopId': shopId
        },
        {
            $set: {
                'shops.$.status': status,
                ...(cancelReason && { 'shops.$.cancelReason': cancelReason })
            }
        },
        { new: true }
    ).populate('user', 'name email mobile')
     .populate('shops.shopId', 'name')
     .populate('shops.products.productId', 'name price image');

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res.status(200).json(
        new ApiResponse(200, order, "Order status updated successfully")
    );
});

// Delete seller account
export const deleteSellerAccount = asyncHandler(async (req, res) => {
    const sellerId = req.seller._id;
    const { password } = req.body;

    if (!password) {
        throw new ApiError(400, "Password is required to delete account");
    }

    // Verify password
    const seller = await Seller.findById(sellerId);
    if (!seller) {
        throw new ApiError(404, "Seller not found");
    }

    const isPasswordValid = await seller.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid password");
    }

    // Check if seller has active shops with products
    const activeShops = await Shop.find({ sellerId, isActive: true });
    for (const shop of activeShops) {
        const productCount = await Product.countDocuments({ shopId: shop._id });
        if (productCount > 0) {
            throw new ApiError(400, "Cannot delete account with active shops and products. Please delete all products and shops first.");
        }
    }

    // Delete all shops
    await Shop.deleteMany({ sellerId });
    
    // Delete all products
    await Product.deleteMany({ sellerId });
    
    // Delete all offers
    await Offer.deleteMany({ sellerId });
    
    // Delete seller account
    await Seller.findByIdAndDelete(sellerId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Account deleted successfully")
    );
});
