import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DocumentationBlock } from './src/models/documentationModel.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/food-delivery-app';

const testAPI = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Test the same query that the public API uses
    console.log('\n🔍 Testing public API query: DocumentationBlock.find({ isActive: true }).sort({ order: 1 })');
    
    const activeBlocks = await DocumentationBlock.find({ isActive: true }).sort({ order: 1 });
    console.log(`\n📊 Active blocks found: ${activeBlocks.length}`);

    if (activeBlocks.length > 0) {
      console.log('\n📋 First 3 active blocks:');
      activeBlocks.slice(0, 3).forEach((block, index) => {
        console.log(`\nBlock ${index + 1}:`);
        console.log(`  ID: ${block._id}`);
        console.log(`  Type: ${block.type}`);
        console.log(`  Order: ${block.order}`);
        console.log(`  IsActive: ${block.isActive}`);
        console.log(`  SectionId: ${block.sectionId}`);
        console.log(`  Content: ${block.content?.text?.substring(0, 50)}...`);
      });
    } else {
      console.log('\n❌ No active blocks found!');
      
      // Check if there are any blocks at all
      const allBlocks = await DocumentationBlock.find({});
      console.log(`\n📊 Total blocks in database: ${allBlocks.length}`);
      
      if (allBlocks.length > 0) {
        console.log('\n🔍 Checking isActive status of first few blocks:');
        allBlocks.slice(0, 5).forEach((block, index) => {
          console.log(`  Block ${index + 1}: isActive = ${block.isActive}`);
        });
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing API:', error);
    process.exit(1);
  }
};

// Run the test
testAPI();
