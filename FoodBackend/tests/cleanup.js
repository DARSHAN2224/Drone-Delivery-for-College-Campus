import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { User } from '../src/models/userModel.js';
import { Seller } from '../src/models/sellerModel.js';
import { Admin } from '../src/models/adminModel.js';
import { Shop } from '../src/models/shopModel.js';
import { Product } from '../src/models/productsModel.js';
import { Order } from '../src/models/ordersModel.js';
import { Drone } from '../src/models/droneModel.js';
import { DroneOrder } from '../src/models/droneOrderModel.js';
import { Offer } from '../src/models/offersModel.js';
import { Rating } from '../src/models/ratingModel.js';
import { Favorite } from '../src/models/favoriteModel.js';
import { Like } from '../src/models/likeModel.js';
import { Notification } from '../src/models/notificationModel.js';
import { RecentHistory } from '../src/models/recentHistoryModel.js';
import { StaticPage } from '../src/models/staticPageModel.js';
import { Token } from '../src/models/tokenModel.js';
import { Cart } from '../src/models/cartModel.js';
import { Message } from '../src/models/messagesModel.js';
import { AuditLog } from '../src/models/auditLogModel.js';
import { Sales } from '../src/models/salesModel.js';

class TestCleanup {
  constructor() {
    this.connections = [];
    this.servers = [];
  }

  // Clean up all collections
  async cleanCollections() {
    console.log('🧹 Cleaning up test collections...');
    
    try {
      const collections = [
        User,
        Seller,
        Admin,
        Shop,
        Product,
        Order,
        Drone,
        DroneOrder,
        Offer,
        Rating,
        Favorite,
        Like,
        Notification,
        RecentHistory,
        StaticPage,
        Token,
        Cart,
        Message,
        AuditLog,
        Sales
      ];

      await Promise.all(
        collections.map(collection => 
          collection.deleteMany({}).exec()
        )
      );

      console.log('✅ All collections cleaned');
    } catch (error) {
      console.error('❌ Error cleaning collections:', error);
      throw error;
    }
  }

  // Clean up specific collections
  async cleanCollection(collectionName) {
    console.log(`🧹 Cleaning up ${collectionName} collection...`);
    
    try {
      let collection;
      switch (collectionName.toLowerCase()) {
        case 'users':
          collection = User;
          break;
        case 'sellers':
          collection = Seller;
          break;
        case 'admins':
          collection = Admin;
          break;
        case 'shops':
          collection = Shop;
          break;
        case 'products':
          collection = Product;
          break;
        case 'orders':
          collection = Order;
          break;
        case 'drones':
          collection = Drone;
          break;
        case 'droneorders':
          collection = DroneOrder;
          break;
        case 'offers':
          collection = Offer;
          break;
        case 'ratings':
          collection = Rating;
          break;
        case 'favorites':
          collection = Favorite;
          break;
        case 'likes':
          collection = Like;
          break;
        case 'notifications':
          collection = Notification;
          break;
        case 'history':
          collection = RecentHistory;
          break;
        case 'pages':
          collection = StaticPage;
          break;
        case 'tokens':
          collection = Token;
          break;
        case 'carts':
          collection = Cart;
          break;
        case 'messages':
          collection = Message;
          break;
        case 'auditlogs':
          collection = AuditLog;
          break;
        case 'sales':
          collection = Sales;
          break;
        default:
          throw new Error(`Unknown collection: ${collectionName}`);
      }

      await collection.deleteMany({}).exec();
      console.log(`✅ ${collectionName} collection cleaned`);
    } catch (error) {
      console.error(`❌ Error cleaning ${collectionName} collection:`, error);
      throw error;
    }
  }

  // Clean up test files
  async cleanTestFiles() {
    console.log('🧹 Cleaning up test files...');
    
    try {
      // This would clean up any test files created during testing
      // For now, we'll just log the action
      console.log('✅ Test files cleaned (no files to clean)');
    } catch (error) {
      console.error('❌ Error cleaning test files:', error);
      throw error;
    }
  }

  // Clean up test directories
  async cleanTestDirectories() {
    console.log('🧹 Cleaning up test directories...');
    
    try {
      // This would clean up any test directories created during testing
      // For now, we'll just log the action
      console.log('✅ Test directories cleaned (no directories to clean)');
    } catch (error) {
      console.error('❌ Error cleaning test directories:', error);
      throw error;
    }
  }

  // Clean up database connections
  async cleanConnections() {
    console.log('🧹 Cleaning up database connections...');
    
    try {
      for (const connection of this.connections) {
        if (connection.readyState !== 0) { // 0 = disconnected
          await connection.close();
          console.log('✅ Database connection closed');
        }
      }
      this.connections = [];
    } catch (error) {
      console.error('❌ Error closing database connections:', error);
      throw error;
    }
  }

  // Clean up in-memory servers
  async cleanServers() {
    console.log('🧹 Cleaning up in-memory servers...');
    
    try {
      for (const server of this.servers) {
        await server.stop();
        console.log('✅ In-memory server stopped');
      }
      this.servers = [];
    } catch (error) {
      console.error('❌ Error stopping in-memory servers:', error);
      throw error;
    }
  }

  // Clean up all test resources
  async cleanAll() {
    console.log('🧹 Starting comprehensive test cleanup...');
    
    try {
      await this.cleanCollections();
      await this.cleanTestFiles();
      await this.cleanTestDirectories();
      await this.cleanConnections();
      await this.cleanServers();
      
      console.log('🎉 All test resources cleaned successfully!');
    } catch (error) {
      console.error('❌ Comprehensive cleanup failed:', error);
      throw error;
    }
  }

  // Clean up specific test data by pattern
  async cleanByPattern(pattern) {
    console.log(`🧹 Cleaning up test data matching pattern: ${pattern}`);
    
    try {
      const collections = [
        User,
        Seller,
        Admin,
        Shop,
        Product,
        Order,
        Drone,
        DroneOrder,
        Offer,
        Rating,
        Favorite,
        Like,
        Notification,
        RecentHistory,
        StaticPage,
        Token,
        Cart,
        Message,
        AuditLog,
        Sales
      ];

      const regex = new RegExp(pattern, 'i');
      
      await Promise.all(
        collections.map(collection => 
          collection.deleteMany({
            $or: [
              { username: regex },
              { email: regex },
              { name: regex },
              { title: regex },
              { description: regex }
            ]
          }).exec()
        )
      );

      console.log(`✅ Test data matching pattern "${pattern}" cleaned`);
    } catch (error) {
      console.error(`❌ Error cleaning pattern "${pattern}":`, error);
      throw error;
    }
  }

  // Clean up test data older than specified time
  async cleanOldData(olderThanHours = 1) {
    console.log(`🧹 Cleaning up test data older than ${olderThanHours} hours...`);
    
    try {
      const cutoffTime = new Date(Date.now() - (olderThanHours * 60 * 60 * 1000));
      
      const collections = [
        User,
        Seller,
        Admin,
        Shop,
        Product,
        Order,
        Drone,
        DroneOrder,
        Offer,
        Rating,
        Favorite,
        Like,
        Notification,
        RecentHistory,
        StaticPage,
        Token,
        Cart,
        Message,
        AuditLog,
        Sales
      ];

      await Promise.all(
        collections.map(collection => 
          collection.deleteMany({
            createdAt: { $lt: cutoffTime }
          }).exec()
        )
      );

      console.log(`✅ Test data older than ${olderThanHours} hours cleaned`);
    } catch (error) {
      console.error(`❌ Error cleaning old data:`, error);
      throw error;
    }
  }

  // Reset database indexes
  async resetIndexes() {
    console.log('🧹 Resetting database indexes...');
    
    try {
      const collections = [
        User,
        Seller,
        Admin,
        Shop,
        Product,
        Order,
        Drone,
        DroneOrder,
        Offer,
        Rating,
        Favorite,
        Like,
        Notification,
        RecentHistory,
        StaticPage,
        Token,
        Cart,
        Message,
        AuditLog,
        Sales
      ];

      for (const collection of collections) {
        try {
          await collection.collection.dropIndexes();
          console.log(`✅ Indexes dropped for ${collection.modelName}`);
        } catch (error) {
          // Ignore errors for collections without indexes
          console.log(`ℹ️ No indexes to drop for ${collection.modelName}`);
        }
      }

      console.log('✅ Database indexes reset');
    } catch (error) {
      console.error('❌ Error resetting indexes:', error);
      throw error;
    }
  }

  // Get cleanup statistics
  async getCleanupStats() {
    console.log('📊 Getting cleanup statistics...');
    
    try {
      const collections = [
        { name: 'Users', model: User },
        { name: 'Sellers', model: Seller },
        { name: 'Admins', model: Admin },
        { name: 'Shops', model: Shop },
        { name: 'Products', model: Product },
        { name: 'Orders', model: Order },
        { name: 'Drones', model: Drone },
        { name: 'DroneOrders', model: DroneOrder },
        { name: 'Offers', model: Offer },
        { name: 'Ratings', model: Rating },
        { name: 'Favorites', model: Favorite },
        { name: 'Likes', model: Like },
        { name: 'Notifications', model: Notification },
        { name: 'History', model: RecentHistory },
        { name: 'Pages', model: StaticPage },
        { name: 'Tokens', model: Token },
        { name: 'Carts', model: Cart },
        { name: 'Messages', model: Message },
        { name: 'AuditLogs', model: AuditLog },
        { name: 'Sales', model: Sales }
      ];

      const stats = {};
      
      for (const { name, model } of collections) {
        try {
          const count = await model.countDocuments({});
          stats[name] = count;
        } catch (error) {
          stats[name] = 'Error';
        }
      }

      console.log('📊 Cleanup statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting cleanup statistics:', error);
      throw error;
    }
  }

  // Add connection to track
  addConnection(connection) {
    this.connections.push(connection);
  }

  // Add server to track
  addServer(server) {
    this.servers.push(server);
  }
}

// Export cleanup instance
export const testCleanup = new TestCleanup();

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const arg = process.argv[3];
  
  switch (command) {
    case 'all':
      testCleanup.cleanAll()
        .then(() => {
          console.log('✅ All cleanup completed');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Cleanup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'collections':
      testCleanup.cleanCollections()
        .then(() => {
          console.log('✅ Collections cleaned');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Collection cleanup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'collection':
      if (!arg) {
        console.error('❌ Please specify collection name');
        process.exit(1);
      }
      testCleanup.cleanCollection(arg)
        .then(() => {
          console.log(`✅ ${arg} collection cleaned`);
          process.exit(0);
        })
        .catch((error) => {
          console.error(`❌ ${arg} collection cleanup failed:`, error);
          process.exit(1);
        });
      break;
      
    case 'pattern':
      if (!arg) {
        console.error('❌ Please specify pattern');
        process.exit(1);
      }
      testCleanup.cleanByPattern(arg)
        .then(() => {
          console.log(`✅ Pattern cleanup completed`);
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Pattern cleanup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'old':
      const hours = parseInt(arg) || 1;
      testCleanup.cleanOldData(hours)
        .then(() => {
          console.log(`✅ Old data cleanup completed`);
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Old data cleanup failed:', error);
          process.exit(1);
        });
      break;
      
    case 'indexes':
      testCleanup.resetIndexes()
        .then(() => {
          console.log('✅ Indexes reset');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Index reset failed:', error);
          process.exit(1);
        });
      break;
      
    case 'stats':
      testCleanup.getCleanupStats()
        .then(() => {
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Stats failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node cleanup.js [all|collections|collection <name>|pattern <pattern>|old [hours]|indexes|stats]');
      process.exit(1);
  }
}
