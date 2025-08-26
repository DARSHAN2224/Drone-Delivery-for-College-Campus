import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { DocumentationBlock } from './src/models/documentationModel.js';

// Load environment variables
dotenv.config({ path: '../.env' });

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/food-delivery-app';

const testDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Get all documentation blocks
    const allBlocks = await DocumentationBlock.find({});
    console.log(`\n📊 Total blocks in database: ${allBlocks.length}`);

    // Get active blocks only
    const activeBlocks = await DocumentationBlock.find({ isActive: true });
    console.log(`📊 Active blocks: ${activeBlocks.length}`);

    // Show first few blocks
    console.log('\n🔍 First 3 blocks:');
    allBlocks.slice(0, 3).forEach((block, index) => {
      console.log(`\nBlock ${index + 1}:`);
      console.log(`  ID: ${block._id}`);
      console.log(`  Type: ${block.type}`);
      console.log(`  Order: ${block.order}`);
      console.log(`  IsActive: ${block.isActive}`);
      console.log(`  SectionId: ${block.sectionId}`);
      console.log(`  SectionName: ${block.sectionName}`);
      console.log(`  Content: ${block.content?.text?.substring(0, 50)}...`);
    });

    // Group by section
    const sectionsMap = new Map();
    allBlocks.forEach(block => {
      const sectionId = block.sectionId || 'default';
      if (!sectionsMap.has(sectionId)) {
        sectionsMap.set(sectionId, []);
      }
      sectionsMap.get(sectionId).push(block);
    });

    console.log('\n📚 Sections found:');
    sectionsMap.forEach((blocks, sectionId) => {
      console.log(`  ${sectionId}: ${blocks.length} blocks`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing database:', error);
    process.exit(1);
  }
};

// Run the test
testDatabase();
