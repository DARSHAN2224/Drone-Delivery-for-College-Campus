import mongoose from 'mongoose';

const documentationBlockSchema = new mongoose.Schema({
  order: { 
    type: Number, 
    required: true 
  }, // To maintain the sequence of blocks
  type: {
    type: String,
    enum: ['heading', 'subheading', 'paragraph', 'image', 'video', 'bullet_points'],
    required: true
  },
  content: {
    text: { type: String }, // For heading, subheading, paragraph
    url: { type: String }, // For image, video
    altText: { type: String }, // For image accessibility
    items: [{ type: String }] // For bullet_points
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { 
  timestamps: true 
});

// Index for efficient ordering
documentationBlockSchema.index({ order: 1 });

// Pre-save middleware to ensure order is set if not provided
documentationBlockSchema.pre('save', async function(next) {
  if (!this.order) {
    const maxOrder = await this.constructor.findOne().sort({ order: -1 });
    this.order = maxOrder ? maxOrder.order + 1 : 1;
  }
  next();
});

export const DocumentationBlock = mongoose.model('DocumentationBlock', documentationBlockSchema);
