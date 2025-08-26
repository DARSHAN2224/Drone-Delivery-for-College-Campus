import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetType: {
    type: String,
    enum: ['product', 'shop', 'seller'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one favorite per user per target
favoriteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for efficient queries
favoriteSchema.index({ targetType: 1, targetId: 1 });
favoriteSchema.index({ userId: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);

export default Favorite;
