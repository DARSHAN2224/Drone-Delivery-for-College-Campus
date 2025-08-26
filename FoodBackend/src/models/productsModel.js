import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    discount:{
        type: Number,
        default: 0,
    },
    shopId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
     },  // Link to seller
    available: { 
        type: Boolean,
         default: true 
    },
    stock: {
        type: Number,
        default: 0
    },
    image:  {
        type: String,
    }, // URL or local path to image
    // Admin approval fields
    isApproved: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String,
        default: null
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    },
    approvedAt: {
        type: Date
    },
    // Rating and engagement fields
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    totalLikes: {
        type: Number,
        default: 0
    },
    totalFavorites: {
        type: Number,
        default: 0
    },
    totalComments: {
        type: Number,
        default: 0
    }
},{timestamps:true});

export const Product = mongoose.model('Product', productSchema);
