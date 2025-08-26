import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

const riderSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  vehicle: { type: String },
  location: locationSchema,
});

const deliverySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },
    status: {
      type: String,
      enum: ['unassigned', 'assigned', 'picked_up', 'en_route', 'nearby', 'delivered', 'cancelled'],
      default: 'unassigned',
    },
    currentLocation: locationSchema,
    route: [locationSchema],
    etaMinutes: { type: Number },
    rider: riderSchema,
    deliveryNotes: String,
    statusHistory: [{
      status: String,
      timestamp: { type: Date, default: Date.now },
      location: locationSchema,
      notes: String
    }],
    qrCode: String,
    qrExpiry: Date,
    qrToken: String
  },
  { timestamps: true }
);

deliverySchema.index({ orderId: 1, shopId: 1 }, { unique: true });

export const Delivery = mongoose.model('Delivery', deliverySchema);


