import mongoose from "mongoose";
const sellerSalesSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
    period: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'], // Classification for sales
      required: true
    },
    date: { type: Date, required: true }, // Start of the period (e.g., start of the week)
    totalSales: { type: Number, required: true }, // Revenue for the period
    totalOrders: { type: Number, required: true }, // Number of orders for the period
    productBreakdown: [{
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantitySold: { type: Number },
      revenue: { type: Number }
    }]
  }, { timestamps: true });
  
sellerSalesSchema.index({ seller: 1, shop: 1, period: 1, date: 1 });
  
export const SellerSales = mongoose.model('SellerSales', sellerSalesSchema);
  