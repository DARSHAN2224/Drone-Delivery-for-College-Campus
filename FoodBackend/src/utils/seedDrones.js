import { Drone } from '../models/droneModel.js';
import connectDB from '../db/index.js';

const seedDrones = async () => {
  try {
    await connectDB();
    
    // Check if drones already exist
    const existingDrones = await Drone.countDocuments();
    if (existingDrones > 0) {
      console.log('Drones already exist, skipping seed');
      return;
    }
    
    // Create sample drones
    const drones = [
      {
        droneId: 'DRONE-001',
        battery: 95,
        location: { lat: 40.7128, lng: -74.0060 },
        altitude: 0,
        status: 'idle'
      },
      {
        droneId: 'DRONE-002',
        battery: 87,
        location: { lat: 40.7589, lng: -73.9851 },
        altitude: 0,
        status: 'idle'
      },
      {
        droneId: 'DRONE-003',
        battery: 92,
        location: { lat: 40.7505, lng: -73.9934 },
        altitude: 0,
        status: 'idle'
      },
      {
        droneId: 'DRONE-004',
        battery: 78,
        location: { lat: 40.7484, lng: -73.9857 },
        altitude: 0,
        status: 'idle'
      },
      {
        droneId: 'DRONE-005',
        battery: 100,
        location: { lat: 40.7527, lng: -73.9772 },
        altitude: 0,
        status: 'idle'
      }
    ];
    
    await Drone.insertMany(drones);
    console.log('✅ Drones seeded successfully:', drones.length);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding drones:', error);
    process.exit(1);
  }
};

seedDrones();
