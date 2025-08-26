import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Admin Schema
const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  mobile: {
    type: String,
    required: true
  },
  role: {
    type: Number,
    default: 1, // 1 for admin
    enum: [1]
  },
  is_verified: {
    type: Boolean,
    default: true
  },
  is_active: {
    type: Boolean,
    default: true
  },
  verificationToken: String,
  verificationTokenExpiresAt: Date,
  refreshTokens: [{
    token: String,
    deviceId: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastLogin: Date
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

async function createAdminUser() {
  try {
    // Connect to MongoDB
    const MONGODB_URL = 'mongodb://127.0.0.1:27017';
    const DB_NAME = 'food-backend';
    
    await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@foodhub.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists');
      console.log('📧 Email: admin@foodhub.com');
      console.log('🔑 Password: Admin123!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Create admin user
    const admin = new Admin({
      name: 'FoodHub Admin',
      email: 'admin@foodhub.com',
      password: hashedPassword,
      mobile: '+1234567890',
      role: 1,
      is_verified: true,
      is_active: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@foodhub.com');
    console.log('🔑 Password: Admin123!');
    console.log('\n🎉 You can now log in to the admin panel and access the documentation editor!');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
createAdminUser();
