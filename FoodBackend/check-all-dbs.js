import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../.env' });

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/food-delivery-app';

const checkAllDatabases = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URL);
    console.log('✅ Connected to MongoDB');

    // Get the database and collection
    const db = mongoose.connection.db;
    console.log(`\n📊 Current database name: ${db.databaseName}`);

    // List all collections in the current database
    const collections = await db.listCollections().toArray();
    console.log(`\n📚 Collections in database '${db.databaseName}':`);
    collections.forEach(collection => {
      console.log(`  - ${collection.name}`);
    });

    // Check documentationblocks collection specifically
    const docCollection = db.collection('documentationblocks');
    const docCount = await docCollection.countDocuments();
    console.log(`\n📋 'documentationblocks' collection has ${docCount} documents`);

    if (docCount > 0) {
      // Get all documents and show their IDs
      const allDocs = await docCollection.find({}).toArray();
      console.log('\n🔍 All document IDs in documentationblocks:');
      allDocs.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc._id} (${doc.type}) - ${doc.content?.text?.substring(0, 30)}...`);
      });
    }

    // Also check if there's a document with the specific ID you mentioned
    const specificDoc = await docCollection.findOne({ _id: new mongoose.Types.ObjectId('68ab50f06e3fb0783dd47341') });
    if (specificDoc) {
      console.log('\n✅ Found the specific document you mentioned:');
      console.log(JSON.stringify(specificDoc, null, 2));
    } else {
      console.log('\n❌ Document with ID 68ab50f06e3fb0783dd47341 NOT found in documentationblocks collection');
    }

    // Check if there are any other collections that might contain documentation
    for (const collection of collections) {
      if (collection.name.toLowerCase().includes('doc') || collection.name.toLowerCase().includes('content')) {
        const coll = db.collection(collection.name);
        const count = await coll.countDocuments();
        console.log(`\n🔍 Collection '${collection.name}' has ${count} documents`);
        
        if (count > 0) {
          const docs = await coll.find({}).limit(3).toArray();
          console.log(`  First few documents in '${collection.name}':`);
          docs.forEach((doc, index) => {
            console.log(`    ${index + 1}. ${doc._id} - ${JSON.stringify(doc).substring(0, 100)}...`);
          });
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking databases:', error);
    process.exit(1);
  }
};

// Run the check
checkAllDatabases();
