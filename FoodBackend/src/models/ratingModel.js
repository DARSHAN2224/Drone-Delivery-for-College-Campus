import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to ensure one rating per user per target
ratingSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for efficient queries
ratingSchema.index({ targetType: 1, targetId: 1 });
ratingSchema.index({ userId: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;
