import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/userModel.js';
import { Seller } from '../models/sellerModel.js';

export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const user = await User.findById(userId);
  if (!user) throw new ApiError('Not found', 404, 'User not found');
  await User.deleteOne({ _id: userId });
  return res.status(200).json(new ApiResponse(200, {}, 'User deleted', true));
});

export const deleteSeller = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const seller = await Seller.findById(sellerId);
  if (!seller) throw new ApiError('Not found', 404, 'Seller not found');
  await Seller.deleteOne({ _id: sellerId });
  return res.status(200).json(new ApiResponse(200, {}, 'Seller deleted', true));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body || {};
  const user = await User.findById(userId);
  if (!user) throw new ApiError('Not found', 404, 'User not found');
  user.isActive = Boolean(isActive);
  await user.save();
  return res.status(200).json(new ApiResponse(200, { user }, 'User status updated', true));
});

export const toggleSellerStatusAdmin = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { isActive } = req.body || {};
  const seller = await Seller.findById(sellerId);
  if (!seller) throw new ApiError('Not found', 404, 'Seller not found');
  seller.isActive = Boolean(isActive);
  await seller.save();
  return res.status(200).json(new ApiResponse(200, { seller }, 'Seller status updated', true));
});


