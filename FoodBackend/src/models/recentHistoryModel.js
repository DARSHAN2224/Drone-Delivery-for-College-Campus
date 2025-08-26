import mongoose from 'mongoose';

const recentHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actionType: {
    type: String,
    enum: ['view_product', 'view_shop', 'add_to_cart', 'place_order', 'rate_product', 'like_product', 'favorite_product'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['product', 'shop', 'seller', 'order'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
recentHistorySchema.index({ userId: 1, createdAt: -1 });
recentHistorySchema.index({ userId: 1, actionType: 1 });
recentHistorySchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

const RecentHistory = mongoose.model('RecentHistory', recentHistorySchema);

export default RecentHistory;
