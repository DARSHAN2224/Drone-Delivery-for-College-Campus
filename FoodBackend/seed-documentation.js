import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Update connection to use the correct database
const MONGODB_URL = 'mongodb://127.0.0.1:27017';
const DB_NAME = 'food-backend';

// Documentation Block Schema
const documentationBlockSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  type: { type: String, required: true },
  content: {
    text: String,
    title: String,
    description: String,
    url: String,
    altText: String,
    items: [String],
    icon: String,
    color: String,
    html: String,
    features: [String]
  },
  style: {
    fontSize: String,
    fontFamily: String,
    color: String,
    backgroundColor: String,
    textAlign: String,
    fontWeight: String,
    fontStyle: String,
    textDecoration: String,
    lineHeight: String,
    letterSpacing: String,
    padding: String,
    margin: String,
    border: String,
    borderRadius: String,
    boxShadow: String,
    width: String,
    height: String,
    animation: String,
    hoverEffect: String
  },
  isActive: { type: Boolean, default: true },
  sectionId: String,
  sectionName: String
}, { timestamps: true });

const DocumentationBlock = mongoose.model('DocumentationBlock', documentationBlockSchema);

const modernDocumentationData = [
  // Hero Section
  {
    order: 1,
    type: 'hero',
    content: {
      title: '🚀 FoodHub - The Future of Food Delivery',
      text: 'Experience lightning-fast drone delivery with real-time tracking and AI-powered logistics',
      description: 'Join thousands of users who have already embraced the future of food delivery technology'
    },
    style: {
      fontSize: '4rem',
      fontFamily: 'Inter',
      color: '#ffffff',
      backgroundColor: 'gradient-indigo',
      textAlign: 'center',
      fontWeight: 'bold',
      animation: 'fade-in'
    },
    sectionId: 'hero-section',
    sectionName: 'Hero Section'
  },

  // Platform Overview
  {
    order: 2,
    type: 'heading',
    content: {
      text: 'Revolutionary Platform Features',
      title: 'Revolutionary Platform Features'
    },
    style: {
      fontSize: '3rem',
      fontFamily: 'Inter',
      color: '#111827',
      textAlign: 'center',
      fontWeight: 'bold',
      animation: 'slide-up'
    },
    sectionId: 'features-section',
    sectionName: 'Platform Features'
  },

  // Modern Feature Cards
  {
    order: 3,
    type: 'modern_card',
    content: {
      title: '🚁 Drone Delivery Technology',
      description: 'Cutting-edge autonomous drones deliver your food in minutes, not hours. Real-time GPS tracking ensures you know exactly where your order is.',
      icon: 'Zap',
      color: 'gradient-blue',
      animation: 'fade-in',
      features: [
        'Autonomous flight navigation',
        'Real-time GPS tracking',
        'Weather-resistant drones',
        'Safe landing zones'
      ]
    },
    style: {
      fontSize: '1.125rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in',
      hoverEffect: 'scale'
    },
    sectionId: 'features-section',
    sectionName: 'Platform Features'
  },

  {
    order: 4,
    type: 'modern_card',
    content: {
      title: '⚡ Lightning Fast Delivery',
      description: 'Average delivery time of 15-20 minutes. Our AI-powered route optimization ensures the fastest possible delivery to your doorstep.',
      icon: 'TrendingUp',
      color: 'gradient-purple',
      animation: 'fade-in',
      features: [
        '15-20 minute average delivery',
        'AI route optimization',
        'Priority delivery options',
        'Express delivery service'
      ]
    },
    style: {
      fontSize: '1.125rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in',
      hoverEffect: 'scale'
    },
    sectionId: 'features-section',
    sectionName: 'Platform Features'
  },

  {
    order: 5,
    type: 'modern_card',
    content: {
      title: '🎯 Smart Order Management',
      description: 'Intelligent order processing with automated kitchen coordination, real-time status updates, and seamless payment integration.',
      icon: 'Target',
      color: 'gradient-pink',
      animation: 'fade-in',
      features: [
        'Automated kitchen coordination',
        'Real-time order status',
        'Seamless payment processing',
        'Order history tracking'
      ]
    },
    style: {
      fontSize: '1.125rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in',
      hoverEffect: 'scale'
    },
    sectionId: 'features-section',
    sectionName: 'Platform Features'
  },

  // User Roles Section
  {
    order: 6,
    type: 'heading',
    content: {
      text: 'Three Powerful User Roles',
      title: 'Three Powerful User Roles'
    },
    style: {
      fontSize: '3rem',
      fontFamily: 'Inter',
      color: '#111827',
      textAlign: 'center',
      fontWeight: 'bold',
      animation: 'slide-up'
    },
    sectionId: 'roles-section',
    sectionName: 'User Roles'
  },

  // Role Cards
  {
    order: 7,
    type: 'role_card',
    content: {
      title: '👤 Customer Experience',
      description: 'Enjoy seamless food ordering with real-time tracking, multiple payment options, and personalized recommendations.',
      icon: 'User',
      color: 'blue',
      items: [
        'Browse restaurants and menus',
        'Real-time order tracking',
        'Multiple payment methods',
        'Personalized recommendations',
        'Order history and reviews',
        'Loyalty rewards program'
      ]
    },
    style: {
      fontSize: '1.125rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in',
      hoverEffect: 'scale'
    },
    sectionId: 'roles-section',
    sectionName: 'User Roles'
  },

  {
    order: 8,
    type: 'role_card',
    content: {
      title: '🏪 Restaurant Management',
      description: 'Powerful tools for restaurant owners to manage orders, menus, and operations efficiently.',
      icon: 'Store',
      color: 'purple',
      items: [
        'Order management dashboard',
        'Menu customization tools',
        'Sales analytics and reports',
        'Inventory management',
        'Staff coordination',
        'Customer feedback system'
      ]
    },
    style: {
      fontSize: '1.125rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in',
      hoverEffect: 'scale'
    },
    sectionId: 'roles-section',
    sectionName: 'User Roles'
  },

  {
    order: 9,
    type: 'role_card',
    content: {
      title: '🛡️ Admin Control Center',
      description: 'Comprehensive admin panel for platform management, user oversight, and system analytics.',
      icon: 'Shield',
      color: 'indigo',
      items: [
        'Platform-wide analytics',
        'User and restaurant management',
        'Drone fleet monitoring',
        'System configuration',
        'Security and compliance',
        'Support ticket management'
      ]
    },
    style: {
      fontSize: '1.125rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in',
      hoverEffect: 'scale'
    },
    sectionId: 'roles-section',
    sectionName: 'User Roles'
  },

  // Technology Section
  {
    order: 10,
    type: 'heading',
    content: {
      text: 'Cutting-Edge Technology Stack',
      title: 'Cutting-Edge Technology Stack'
    },
    style: {
      fontSize: '3rem',
      fontFamily: 'Inter',
      color: '#111827',
      textAlign: 'center',
      fontWeight: 'bold',
      animation: 'slide-up'
    },
    sectionId: 'tech-section',
    sectionName: 'Technology'
  },

  // Technology Features
  {
    order: 11,
    type: 'bullet_points',
    content: {
      items: [
        '🚁 Autonomous Drone Technology with AI-powered navigation and obstacle avoidance',
        '📱 React.js Frontend with modern UI/UX and real-time updates',
        '⚡ Node.js Backend with Express.js for high-performance API',
        '🗄️ MongoDB Database with Mongoose ODM for flexible data management',
        '🔐 JWT Authentication with role-based access control',
        '📡 Socket.IO for real-time communication and live tracking',
        '🎨 TailwindCSS for beautiful, responsive design',
        '📊 Real-time Analytics and Performance Monitoring',
        '🔒 Advanced Security with encryption and secure protocols',
        '☁️ Scalable Cloud Infrastructure for global deployment'
      ]
    },
    style: {
      fontSize: '1.125rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'white',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in'
    },
    sectionId: 'tech-section',
    sectionName: 'Technology'
  },

  // Rich Content Section
  {
    order: 12,
    type: 'rich_text',
    content: {
      title: '🌟 Why Choose FoodHub?',
      text: 'FoodHub represents the next evolution in food delivery technology. Our platform combines the convenience of traditional food delivery with the speed and efficiency of autonomous drone technology. With real-time tracking, AI-powered logistics, and a user-friendly interface, we\'re making food delivery faster, safer, and more reliable than ever before.',
      description: 'Join the future of food delivery today and experience the difference that cutting-edge technology makes.'
    },
    style: {
      fontSize: '1.25rem',
      fontFamily: 'Inter',
      color: '#374151',
      backgroundColor: 'white',
      textAlign: 'center',
      fontWeight: 'normal',
      lineHeight: '1.8',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in'
    },
    sectionId: 'content-section',
    sectionName: 'Rich Content'
  },

  // Call to Action
  {
    order: 13,
    type: 'paragraph',
    content: {
      text: 'Ready to experience the future of food delivery? Sign up today and get your first order delivered by drone in under 20 minutes!'
    },
    style: {
      fontSize: '1.5rem',
      fontFamily: 'Inter',
      color: '#1f2937',
      backgroundColor: 'gradient-blue',
      textAlign: 'center',
      fontWeight: 'semibold',
      borderRadius: '1.5rem',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      animation: 'fade-in'
    },
    sectionId: 'cta-section',
    sectionName: 'Call to Action'
  }
];

async function seedDocumentation() {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing documentation
    await DocumentationBlock.deleteMany({});
    console.log('🗑️ Cleared existing documentation');

    // Insert new documentation
    const result = await DocumentationBlock.insertMany(modernDocumentationData);
    console.log(`✅ Successfully seeded ${result.length} documentation blocks`);

    // Display the created blocks
    console.log('\n📋 Created Documentation Blocks:');
    result.forEach((block, index) => {
      console.log(`${index + 1}. ${block.type} - ${block.content.title || block.content.text || 'No title'}`);
    });

    console.log('\n🎉 Documentation seeding completed successfully!');
    console.log('🌐 You can now view the documentation at: http://localhost:5173/documentation');

  } catch (error) {
    console.error('❌ Error seeding documentation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
seedDocumentation();
