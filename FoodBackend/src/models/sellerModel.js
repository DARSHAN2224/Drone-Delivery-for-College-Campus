import mongoose from 'mongoose';
import { createBaseSchema } from './baseSchema.js';

// Create seller schema with role 2 (seller)
const sellerSchema = createBaseSchema(2);

export const Seller = mongoose.model("Seller", sellerSchema);
