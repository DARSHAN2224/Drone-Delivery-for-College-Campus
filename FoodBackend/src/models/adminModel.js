import mongoose from 'mongoose';
import { createBaseSchema } from './baseSchema.js';

// Create admin schema with role 1 (admin)
const adminSchema = createBaseSchema(1);

export const Admin = mongoose.model("Admin", adminSchema);
