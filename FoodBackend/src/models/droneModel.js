import mongoose from 'mongoose';

const DroneSchema = new mongoose.Schema({
  droneId: { type: String, required: true, unique: true },
  battery: { type: Number, default: 100 },
  location: {
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },
  },
  altitude: { type: Number, default: 0 },
  status: { type: String, enum: ['idle', 'assigned', 'launched', 'in_flight', 'landed', 'returning', 'stopped'], default: 'idle' },
}, { timestamps: true });

export const Drone = mongoose.model('Drone', DroneSchema);


