import mongoose from 'mongoose';

const droneAssignmentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true, unique: true },
  droneId: { type: String, required: true, index: true },
  assignedAt: { type: Date, default: Date.now },
  releasedAt: { type: Date, default: null },
  status: { type: String, enum: ['assigned', 'released'], default: 'assigned' },
  notes: { type: String, default: '' },
}, { timestamps: true });

export const DroneAssignment = mongoose.model('DroneAssignment', droneAssignmentSchema);


