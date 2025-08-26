import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema({
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

// Compound index to ensure one like per user per target
likeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

// Index for efficient queries
likeSchema.index({ targetType: 1, targetId: 1 });
likeSchema.index({ userId: 1 });

const Like = mongoose.model('Like', likeSchema);

export default Like;
