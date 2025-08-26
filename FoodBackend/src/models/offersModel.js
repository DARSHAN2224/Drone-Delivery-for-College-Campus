import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  discountType: { type: String, enum: ['percentage', 'fixed', 'buy_one_get_one'], required: true },
  discountValue: { type: Number, required: true },
  minimumOrderAmount: { type: Number, default: 0 },
  maximumDiscount: { type: Number },
  validFrom: { type: Date, required: true },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  image: { type: String },
  terms: { type: String },
  usageLimit: { type: Number, default: -1 }, // -1 means unlimited
  usedCount: { type: Number, default: 0 },
  applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  applicableCategories: [String],
  isApproved: { type: Boolean, default: false },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  approvedAt: { type: Date }
}, { timestamps: true });

// Index for efficient queries
offerSchema.index({ shopId: 1, isActive: 1, validUntil: 1 });
offerSchema.index({ isApproved: 1, isActive: 1 });

export const Offer = mongoose.model('Offer', offerSchema);
