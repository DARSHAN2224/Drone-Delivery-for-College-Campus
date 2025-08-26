import mongoose from "mongoose";
const orderHistorySchema = new mongoose.Schema({
  orderToken: { type: String, required: true }, // Same token as the Order model
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User reference
  shopDetails: [{
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    products: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }],
    status: {
      type: String,
      enum: ['arrived', 'preparing', 'cancelled', 'ready', 'delivered'],
      default: 'arrived'
    },
    cancelReason: { type: String, default: null },
    deliveredAt: { type: Date },
    totalQuantity: { type: Number },
    totalPrice: { type: Number }
  }],
  totalQuantity: { type: Number, required: true }, // Aggregate total of all products
  totalPrice: { type: Number, required: true }, // Aggregate total price of all products
  isPaid: { type: Boolean, default: false }
}, { timestamps: true });


export const  OrderHistory = mongoose.model('OrderHistory', orderHistorySchema);
