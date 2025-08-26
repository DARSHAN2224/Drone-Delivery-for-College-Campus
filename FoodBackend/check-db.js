import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017';
const DB_NAME = 'food-backend';

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(`${MONGODB_URL}/${DB_NAME}`);
    console.log(`✅ Connected to MongoDB database: ${DB_NAME}`);

    // Get the database and collection
    const db = mongoose.connection.db;
    const collection = db.collection('documentationblocks');
    
    // Count all documents
    const totalCount = await collection.countDocuments();
    console.log(`\n📊 Total documents in 'documentationblocks' collection: ${totalCount}`);

    // Get all documents
    const allDocs = await collection.find({}).toArray();
    console.log(`\n📋 All documents:`);
    
    allDocs.forEach((doc, index) => {
      console.log(`\n--- Document ${index + 1} ---`);
      console.log(`ID: ${doc._id}`);
      console.log(`Type: ${doc.type}`);
      console.log(`Order: ${doc.order}`);
      console.log(`IsActive: ${doc.isActive}`);
      console.log(`SectionId: ${doc.sectionId}`);
      console.log(`SectionName: ${doc.sectionName}`);
      console.log(`Content Text: ${doc.content?.text?.substring(0, 50)}...`);
      console.log(`Created: ${doc.createdAt}`);
      console.log(`Updated: ${doc.updatedAt}`);
    });

    // Check if there are any documents with isActive: true
    const activeCount = await collection.countDocuments({ isActive: true });
    console.log(`\n✅ Active documents: ${activeCount}`);

    // Check if there are any documents with isActive: false
    const inactiveCount = await collection.countDocuments({ isActive: false });
    console.log(`❌ Inactive documents: ${inactiveCount}`);

    // List all unique sectionIds
    const sectionIds = await collection.distinct('sectionId');
    console.log(`\n📚 Unique Section IDs: ${sectionIds.join(', ')}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking database:', error);
    process.exit(1);
  }
};

// Run the check
checkDatabase();
