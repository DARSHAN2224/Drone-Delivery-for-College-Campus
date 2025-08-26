import mongoose from 'mongoose';

const staticPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    content: { type: String, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StaticPage = mongoose.model('StaticPage', staticPageSchema);


