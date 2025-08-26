import { DocumentationBlock } from '../models/documentationBlockModel.js';
import mongoose from 'mongoose';

const seedDocumentation = async () => {
  try {
    // Clear existing documentation blocks
    await DocumentationBlock.deleteMany({});

    // Create initial documentation blocks
    const blocks = [
      {
        order: 1,
        type: 'heading',
        content: {
          text: 'Food & Drone Delivery: A Technical Showcase'
        },
        createdBy: new mongoose.Types.ObjectId(), // You'll need to replace with actual admin ID
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 2,
        type: 'image',
        content: {
          url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          altText: 'Modern food delivery technology with drones and mobile apps'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 3,
        type: 'subheading',
        content: {
          text: 'Project Overview'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 4,
        type: 'paragraph',
        content: {
          text: 'This platform revolutionizes food delivery by integrating autonomous drones with a traditional courier network. It provides a seamless experience for customers, powerful tools for sellers, and comprehensive oversight for administrators.'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 5,
        type: 'subheading',
        content: {
          text: 'How It Works: The Customer Journey'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 6,
        type: 'bullet_points',
        content: {
          items: [
            'Browse & Discover: Users explore a wide range of restaurants and shops.',
            'Seamless Ordering: A simple, intuitive cart and checkout process.',
            'Choose Your Delivery: Select traditional delivery or opt for futuristic drone delivery.',
            'Real-Time Tracking: Watch your order travel from the restaurant to your doorstep on a live map.'
          ]
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 7,
        type: 'subheading',
        content: {
          text: 'Empowering Sellers'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 8,
        type: 'paragraph',
        content: {
          text: 'Our seller dashboard provides restaurants with everything they need to manage their online presence, from product and offer management to detailed analytics on sales and customer engagement.'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 9,
        type: 'image',
        content: {
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          altText: 'Analytics dashboard showing sales data and customer insights'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 10,
        type: 'subheading',
        content: {
          text: 'The Future: Autonomous Drone Control'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 11,
        type: 'paragraph',
        content: {
          text: 'The admin control center is the heart of our drone operations. Admins can monitor the entire fleet, assign drones to orders based on weather and battery levels, and manage deliveries in real-time, ensuring safety and efficiency.'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      },
      {
        order: 12,
        type: 'image',
        content: {
          url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2025&q=80',
          altText: 'Drone control center with multiple screens showing fleet management interface'
        },
        createdBy: new mongoose.Types.ObjectId(),
        updatedBy: new mongoose.Types.ObjectId()
      }
    ];

    // Insert all blocks
    await DocumentationBlock.insertMany(blocks);

    console.log('✅ Documentation seeded successfully!');
    console.log(`📝 Created ${blocks.length} documentation blocks`);
  } catch (error) {
    console.error('❌ Error seeding documentation:', error);
  }
};

export default seedDocumentation;
