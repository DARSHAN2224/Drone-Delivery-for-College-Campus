import mongoose from 'mongoose';
import { createBaseSchema } from './baseSchema.js';

// Create user schema with role 0 (user)
const userSchema = createBaseSchema(0);

export const User = mongoose.model("User", userSchema);
