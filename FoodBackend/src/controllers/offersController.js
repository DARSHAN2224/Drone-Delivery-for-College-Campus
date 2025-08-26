import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { Offer } from '../models/offersModel.js';
import { Shop } from '../models/shopModel.js';
import { Product } from '../models/productsModel.js';

// Create new offer (Seller)
export const createOffer = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscount,
    validFrom,
    validUntil,
    terms,
    usageLimit,
    applicableProducts,
    applicableCategories
  } = req.body;

  // Validate discount value based on type
  if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
    throw new ApiError('Invalid discount value', 400, 'Percentage discount must be between 1 and 100');
  }
  if (discountType === 'fixed' && discountValue <= 0) {
    throw new ApiError('Invalid discount value', 400, 'Fixed discount must be greater than 0');
  }

  // Validate dates
  const now = new Date();
  const fromDate = new Date(validFrom);
  const untilDate = new Date(validUntil);
  
  if (fromDate <= now) {
    throw new ApiError('Invalid start date', 400, 'Start date must be in the future');
  }
  if (untilDate <= fromDate) {
    throw new ApiError('Invalid end date', 400, 'End date must be after start date');
  }

  // Check if seller has a shop
  const sellerShop = await Shop.findOne({ sellerId: req.seller._id });
  if (!sellerShop) {
    throw new ApiError('Shop not found', 404, 'You must create a shop before creating offers');
  }

  // Validate applicable products if specified
  if (applicableProducts && applicableProducts.length > 0) {
    const validProducts = await Product.find({
      _id: { $in: applicableProducts },
      shopId: sellerShop._id
    });
    if (validProducts.length !== applicableProducts.length) {
      throw new ApiError('Invalid products', 400, 'Some products do not belong to your shop');
    }
  }

  const offer = new Offer({
    shopId: sellerShop._id,
    title,
    description,
    discountType,
    discountValue,
    minimumOrderAmount,
    maximumDiscount,
    validFrom: fromDate,
    validUntil: untilDate,
    terms,
    usageLimit,
    applicableProducts,
    applicableCategories
  });

  await offer.save();

  return res.status(201).json(
    new ApiResponse(201, { offer }, 'Offer created successfully')
  );
});

// Get seller's offers
export const getSellerOffers = asyncHandler(async (req, res) => {
  const sellerShop = await Shop.findOne({ sellerId: req.seller._id });
  if (!sellerShop) {
    return res.status(200).json(
      new ApiResponse(200, { offers: [] }, 'No shop found')
    );
  }

  const offers = await Offer.find({ shopId: sellerShop._id })
    .sort({ createdAt: -1 })
    .populate('applicableProducts', 'name price image');

  return res.status(200).json(
    new ApiResponse(200, { offers }, 'Offers retrieved successfully')
  );
});

// Update offer (Seller)
export const updateOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;
  const updateData = req.body;

  // Find offer and verify ownership
  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new ApiError('Offer not found', 404, 'Offer does not exist');
  }

  const sellerShop = await Shop.findOne({ sellerId: req.seller._id });
  if (!sellerShop || offer.shopId.toString() !== sellerShop._id.toString()) {
    throw new ApiError('Unauthorized', 403, 'You can only update your own offers');
  }

  // Prevent updates if offer is already approved
  if (offer.isApproved) {
    throw new ApiError('Cannot update approved offer', 400, 'Approved offers cannot be modified');
  }

  // Validate dates if updating
  if (updateData.validFrom || updateData.validUntil) {
    const now = new Date();
    const fromDate = updateData.validFrom ? new Date(updateData.validFrom) : offer.validFrom;
    const untilDate = updateData.validUntil ? new Date(updateData.validUntil) : offer.validUntil;
    
    if (fromDate <= now) {
      throw new ApiError('Invalid start date', 400, 'Start date must be in the future');
    }
    if (untilDate <= fromDate) {
      throw new ApiError('Invalid end date', 400, 'End date must be after start date');
    }
  }

  // Validate discount value if updating
  if (updateData.discountValue) {
    const discountType = updateData.discountType || offer.discountType;
    if (discountType === 'percentage' && (updateData.discountValue <= 0 || updateData.discountValue > 100)) {
      throw new ApiError('Invalid discount value', 400, 'Percentage discount must be between 1 and 100');
    }
    if (discountType === 'fixed' && updateData.discountValue <= 0) {
      throw new ApiError('Invalid discount value', 400, 'Fixed discount must be greater than 0');
    }
  }

  const updatedOffer = await Offer.findByIdAndUpdate(
    offerId,
    { ...updateData, isApproved: false, approvedBy: undefined, approvedAt: undefined },
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, { offer: updatedOffer }, 'Offer updated successfully')
  );
});

// Delete offer (Seller)
export const deleteOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new ApiError('Offer not found', 404, 'Offer does not exist');
  }

  const sellerShop = await Shop.findOne({ sellerId: req.seller._id });
  if (!sellerShop || offer.shopId.toString() !== sellerShop._id.toString()) {
    throw new ApiError('Unauthorized', 403, 'You can only delete your own offers');
  }

  await Offer.findByIdAndDelete(offerId);

  return res.status(200).json(
    new ApiResponse(200, {}, 'Offer deleted successfully')
  );
});

// Get all offers for admin approval
export const getPendingOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find({ isApproved: false })
    .populate('shopId', 'name city state')
    .populate('applicableProducts', 'name price image')
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { offers }, 'Pending offers retrieved successfully')
  );
});

// Approve offer (Admin)
export const approveOffer = asyncHandler(async (req, res) => {
  const { offerId } = req.params;

  const offer = await Offer.findById(offerId);
  if (!offer) {
    throw new ApiError('Offer not found', 404, 'Offer does not exist');
  }

  if (offer.isApproved) {
    throw new ApiError('Already approved', 400, 'Offer is already approved');
  }

  offer.isApproved = true;
  offer.approvedBy = req.admin._id;
  offer.approvedAt = new Date();
  await offer.save();

  return res.status(200).json(
    new ApiResponse(200, { offer }, 'Offer approved successfully')
  );
});

// Get active offers for users
export const getActiveOffers = asyncHandler(async (req, res) => {
  const now = new Date();
  
  const offers = await Offer.find({
    isApproved: true,
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  })
    .populate('shopId', 'name city state image')
    .populate('applicableProducts', 'name price image')
    .sort({ discountValue: -1 });

  return res.status(200).json(
    new ApiResponse(200, { offers }, 'Active offers retrieved successfully')
  );
});

// Get shop offers for users
export const getShopOffers = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const now = new Date();

  const offers = await Offer.find({
    shopId,
    isApproved: true,
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now }
  })
    .populate('applicableProducts', 'name price image')
    .sort({ discountValue: -1 });

  return res.status(200).json(
    new ApiResponse(200, { offers }, 'Shop offers retrieved successfully')
  );
});
