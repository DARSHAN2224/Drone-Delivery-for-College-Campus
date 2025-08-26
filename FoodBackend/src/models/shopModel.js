import  mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
    image: {
        type: String,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        // optional per latest requirements
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seller'
    },  // Link to seller
    productId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    state: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    is_filled: {
        type: Number,
        default: 0
    },
    // Essential business licenses only
    FSSAI_license: {
        type: String,
        // Food Safety and Standards Authority of India license
    },
    Gst_registration: {
        type: String,
        // GST registration number
    },
    Shop_act: {
        type: String,
        // Shop establishment license
    },
    contactNumber: {
        type: String,
        required: true
    }, // Shop's contact info
    openingHours: { type: String, required: true }, // Opening time
    closingHours: { type: String, required: true }, // Closing time
    isActive: {
        type: Boolean,
        required: true,
        default: true
    }, // Shop's active status
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

}, { timestamps: true });

export const  Shop = mongoose.model('Shop', shopSchema);
