import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

class TestDataSeeder {
  constructor() {
    this.testData = {
      users: [],
      sellers: [],
      admins: [],
      shops: [],
      products: [],
      orders: [],
      drones: [],
      droneOrders: [],
      offers: [],
      ratings: [],
      favorites: [],
      likes: [],
      notifications: [],
      history: [],
      pages: []
    };
  }

  // Generate hashed password
  async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  // Seed users
  async seedUsers(count = 5) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const userData = {
        username: `testuser${i + 1}`,
        email: `user${i + 1}@example.com`,
        password: await this.hashPassword('TestPassword123!'),
        fullName: `Test User ${i + 1}`,
        phone: `+1234567890${i}`,
        isEmailVerified: true,
        isActive: true
      };
      
      const user = new User(userData);
      await user.save();
      users.push(user);
    }
    this.testData.users = users;
    return users;
  }

  // Seed sellers
  async seedSellers(count = 3) {
    const sellers = [];
    for (let i = 0; i < count; i++) {
      const sellerData = {
        username: `testseller${i + 1}`,
        email: `seller${i + 1}@example.com`,
        password: await this.hashPassword('TestPassword123!'),
        fullName: `Test Seller ${i + 1}`,
        phone: `+1234567890${i}`,
        businessName: `Test Business ${i + 1}`,
        businessType: ['restaurant', 'cafe', 'bakery'][i % 3],
        isEmailVerified: true,
        isActive: true,
        isApproved: true
      };
      
      const seller = new Seller(sellerData);
      await seller.save();
      sellers.push(seller);
    }
    this.testData.sellers = sellers;
    return sellers;
  }

  // Seed admins
  async seedAdmins(count = 2) {
    const admins = [];
    for (let i = 0; i < count; i++) {
      const adminData = {
        username: `testadmin${i + 1}`,
        email: `admin${i + 1}@example.com`,
        password: await this.hashPassword('TestPassword123!'),
        fullName: `Test Admin ${i + 1}`,
        phone: `+1234567890${i}`,
        role: 'admin',
        isEmailVerified: true,
        isActive: true
      };
      
      const admin = new Admin(adminData);
      await admin.save();
      admins.push(admin);
    }
    this.testData.admins = admins;
    return admins;
  }

  // Seed shops
  async seedShops() {
    const shops = [];
    for (let i = 0; i < this.testData.sellers.length; i++) {
      const seller = this.testData.sellers[i];
      const shopData = {
        name: `Test Shop ${i + 1}`,
        description: `A test shop for testing purposes ${i + 1}`,
        address: `${100 + i} Test Street`,
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        phone: `+1234567890${i}`,
        seller: seller._id,
        isApproved: i === 0, // First shop approved, others pending
        category: ['restaurant', 'cafe', 'bakery'][i % 3],
        rating: 4.5,
        reviewCount: 10
      };
      
      const shop = new Shop(shopData);
      await shop.save();
      shops.push(shop);
    }
    this.testData.shops = shops;
    return shops;
  }

  // Seed products
  async seedProducts() {
    const products = [];
    for (let i = 0; i < this.testData.shops.length; i++) {
      const shop = this.testData.shops[i];
      for (let j = 0; j < 3; j++) { // 3 products per shop
        const productData = {
          name: `Test Product ${i + 1}-${j + 1}`,
          description: `A test product for testing purposes ${i + 1}-${j + 1}`,
          price: 9.99 + (i * 2) + (j * 1.5),
          category: ['food', 'beverage', 'dessert'][j % 3],
          available: true,
          shop: shop._id,
          isApproved: i === 0, // Products from first shop approved
          image: 'https://test-image-url.com/test.jpg',
          stock: 100,
          rating: 4.0 + (Math.random() * 1.0),
          reviewCount: 5 + Math.floor(Math.random() * 10)
        };
        
        const product = new Product(productData);
        await product.save();
        products.push(product);
      }
    }
    this.testData.products = products;
    return products;
  }

  // Seed orders
  async seedOrders() {
    console.log('🛒 Seeding orders...');
    const orders = [];
    
    // Get existing users, shops, and products
    const users = await User.find().limit(3);
    const shops = await Shop.find().limit(3);
    const products = await Product.find().limit(5);
    
    if (users.length === 0 || shops.length === 0 || products.length === 0) {
      console.log('⚠️ Missing users, shops, or products, skipping orders seeding');
      return [];
    }

    for (let i = 0; i < Math.min(users.length, 3); i++) {
      const user = users[i];
      const shop = shops[i % shops.length];
      const shopProducts = products.filter(p => p.shop.toString() === shop._id.toString()).slice(0, 2);
      
      if (shopProducts.length === 0) continue;
      
      const orderData = {
        orderToken: `ORDER_${Date.now()}_${i}`,
        user: user._id,
        shops: [{
          shopId: shop._id,
          status: ['arrived', 'preparing', 'ready'][i % 3],
          products: shopProducts.map(product => ({
            productId: product._id,
            quantity: Math.floor(Math.random() * 3) + 1,
            price: product.price
          })),
          totalQuantity: shopProducts.reduce((sum, p) => sum + (Math.floor(Math.random() * 3) + 1), 0),
          totalPrice: shopProducts.reduce((sum, p) => sum + (p.price * (Math.floor(Math.random() * 3) + 1)), 0)
        }],
        totalQuantity: shopProducts.reduce((sum, p) => sum + (Math.floor(Math.random() * 3) + 1), 0),
        totalPrice: shopProducts.reduce((sum, p) => sum + (p.price * (Math.floor(Math.random() * 3) + 1)), 0),
        isPaid: true,
        deliveryType: ['regular', 'drone'][i % 2],
        deliveryStatus: ['pending', 'preparing', 'out-for-delivery'][i % 3],
        deliveryLocation: {
          lat: 40.7128 + (i * 0.01),
          lng: -74.0060 + (i * 0.01),
          address: `${100 + i} Test Street, Test City, TS 12345`
        },
        pickupLocation: {
          lat: 40.7128,
          lng: -74.0060,
          address: `${shop.name}, ${shop.city}, ${shop.state}`
        },
        estimatedDeliveryTime: new Date(Date.now() + (30 + i * 15) * 60 * 1000), // 30-60 minutes from now
        createdAt: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)) // Different dates
      };
      
      const order = new Order(orderData);
      await order.save();
      orders.push(order);
    }
    
    console.log(`✅ Seeded ${orders.length} orders`);
    return orders;
  }

  // Seed drones
  async seedDrones(count = 3) {
    const drones = [];
    for (let i = 0; i < count; i++) {
      const droneData = {
        name: `Test Drone ${i + 1}`,
        model: `Test Model ${i + 1}`,
        status: ['available', 'in-use', 'maintenance'][i % 3],
        batteryLevel: 100 - (i * 20),
        currentLocation: {
          lat: 40.7128 + (i * 0.01),
          lng: -74.0060 + (i * 0.01)
        },
        maxPayload: 2.5 + (i * 0.5),
        maxRange: 10 + (i * 2),
        isActive: true
      };
      
      const drone = new Drone(droneData);
      await drone.save();
      drones.push(drone);
    }
    this.testData.drones = drones;
    return drones;
  }

  // Seed drone orders
  async seedDroneOrders() {
    const droneOrders = [];
    const droneOrdersData = this.testData.orders.filter(order => order.deliveryType === 'drone');
    
    for (let i = 0; i < Math.min(droneOrdersData.length, 3); i++) {
      const order = droneOrdersData[i];
      const drone = this.testData.drones[i % this.testData.drones.length];
      
      const droneOrderData = {
        order: order._id,
        drone: drone._id,
        status: ['assigned', 'in-flight', 'delivered'][i % 3],
        pickupLocation: {
          lat: 40.7128,
          lng: -74.0060
        },
        deliveryLocation: {
          lat: 40.7128 + 0.01,
          lng: -74.0060 + 0.01
        },
        assignedAt: new Date(),
        estimatedDeliveryTime: new Date(Date.now() + (30 * 60 * 1000)), // 30 minutes from now
        actualDeliveryTime: i === 2 ? new Date() : null
      };
      
      const droneOrder = new DroneOrder(droneOrderData);
      await droneOrder.save();
      droneOrders.push(droneOrder);
    }
    this.testData.droneOrders = droneOrders;
    return droneOrders;
  }

  // Seed offers
  async seedOffers() {
    console.log('🌟 Seeding offers...');
    
    // Get existing shops and products for reference
    const shops = await Shop.find().limit(3);
    const products = await Product.find().limit(5);
    
    if (shops.length === 0) {
      console.log('⚠️ No shops found, skipping offers seeding');
      return;
    }

    const offersData = [
      {
        shopId: shops[0]._id,
        title: 'Summer Sale - 20% Off!',
        description: 'Get 20% off on all summer items. Perfect for hot days!',
        discountType: 'percentage',
        discountValue: 20,
        minimumOrderAmount: 15,
        maximumDiscount: 50,
        validFrom: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true,
        isApproved: true,
        terms: 'Valid on orders above $15. Maximum discount $50.',
        usageLimit: 100,
        applicableProducts: products.slice(0, 2).map(p => p._id),
        applicableCategories: ['Summer', 'Beverages']
      },
      {
        shopId: shops[0]._id,
        title: 'First Order - $5 Off!',
        description: 'New customers get $5 off on their first order!',
        discountType: 'fixed',
        discountValue: 5,
        minimumOrderAmount: 20,
        validFrom: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        isActive: true,
        isApproved: true,
        terms: 'Valid for first-time customers only. Minimum order $20.',
        usageLimit: 50,
        applicableCategories: ['All Categories']
      },
      {
        shopId: shops[1]?._id || shops[0]._id,
        title: 'Buy 1 Get 1 Free!',
        description: 'Buy any item and get another one absolutely free!',
        discountType: 'buy_one_get_one',
        discountValue: 0,
        minimumOrderAmount: 25,
        validFrom: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        isActive: true,
        isApproved: true,
        terms: 'Valid on orders above $25. Limited time offer.',
        usageLimit: 75,
        applicableProducts: products.slice(2, 4).map(p => p._id),
        applicableCategories: ['Specials', 'Promotions']
      }
    ];

    const offers = await Offer.insertMany(offersData);
    console.log(`✅ Seeded ${offers.length} offers`);
    return offers;
  }

  // Seed ratings
  async seedRatings() {
    const ratings = [];
    for (let i = 0; i < this.testData.users.length; i++) {
      const user = this.testData.users[i];
      const shop = this.testData.shops[i % this.testData.shops.length];
      const product = this.testData.products[i % this.testData.products.length];
      
      // Shop rating
      const shopRatingData = {
        user: user._id,
        targetType: 'shop',
        targetId: shop._id,
        rating: 4 + (Math.random() * 1),
        review: `Great shop! Test review ${i + 1}`,
        createdAt: new Date()
      };
      
      const shopRating = new Rating(shopRatingData);
      await shopRating.save();
      ratings.push(shopRating);
      
      // Product rating
      const productRatingData = {
        user: user._id,
        targetType: 'product',
        targetId: product._id,
        rating: 4 + (Math.random() * 1),
        review: `Great product! Test review ${i + 1}`,
        createdAt: new Date()
      };
      
      const productRating = new Rating(productRatingData);
      await productRating.save();
      ratings.push(productRating);
    }
    this.testData.ratings = ratings;
    return ratings;
  }

  // Seed favorites
  async seedFavorites() {
    const favorites = [];
    for (let i = 0; i < this.testData.users.length; i++) {
      const user = this.testData.users[i];
      const shop = this.testData.shops[i % this.testData.shops.length];
      const product = this.testData.products[i % this.testData.products.length];
      
      // Shop favorite
      const shopFavoriteData = {
        user: user._id,
        targetType: 'shop',
        targetId: shop._id,
        createdAt: new Date()
      };
      
      const shopFavorite = new Favorite(shopFavoriteData);
      await shopFavorite.save();
      favorites.push(shopFavorite);
      
      // Product favorite
      const productFavoriteData = {
        user: user._id,
        targetType: 'product',
        targetId: product._id,
        createdAt: new Date()
      };
      
      const productFavorite = new Favorite(productFavoriteData);
      await productFavorite.save();
      favorites.push(productFavorite);
    }
    this.testData.favorites = favorites;
    return favorites;
  }

  // Seed likes
  async seedLikes() {
    const likes = [];
    for (let i = 0; i < this.testData.users.length; i++) {
      const user = this.testData.users[i];
      const shop = this.testData.shops[i % this.testData.shops.length];
      const product = this.testData.products[i % this.testData.products.length];
      
      // Shop like
      const shopLikeData = {
        user: user._id,
        targetType: 'shop',
        targetId: shop._id,
        createdAt: new Date()
      };
      
      const shopLike = new Like(shopLikeData);
      await shopLike.save();
      likes.push(shopLike);
      
      // Product like
      const productLikeData = {
        user: user._id,
        targetType: 'product',
        targetId: product._id,
        createdAt: new Date()
      };
      
      const productLike = new Like(productLikeData);
      await productLike.save();
      likes.push(productLike);
    }
    this.testData.likes = likes;
    return likes;
  }

  // Seed notifications
  async seedNotifications() {
    const notifications = [];
    for (let i = 0; i < this.testData.users.length; i++) {
      const user = this.testData.users[i];
      
      const notificationData = {
        user: user._id,
        title: `Test Notification ${i + 1}`,
        message: `This is a test notification ${i + 1}`,
        type: ['order', 'offer', 'system'][i % 3],
        isRead: i % 2 === 0,
        createdAt: new Date(Date.now() - (i * 60 * 60 * 1000)) // Different times
      };
      
      const notification = new Notification(notificationData);
      await notification.save();
      notifications.push(notification);
    }
    this.testData.notifications = notifications;
    return notifications;
  }

  // Seed recent history
  async seedRecentHistory() {
    const history = [];
    for (let i = 0; i < this.testData.users.length; i++) {
      const user = this.testData.users[i];
      
      const historyData = {
        user: user._id,
        action: ['viewed_shop', 'added_to_cart', 'placed_order'][i % 3],
        targetType: ['shop', 'product', 'order'][i % 3],
        targetId: this.testData.shops[i % this.testData.shops.length]._id,
        metadata: {
          shopName: this.testData.shops[i % this.testData.shops.length].name
        },
        createdAt: new Date(Date.now() - (i * 30 * 60 * 1000)) // Different times
      };
      
      const historyEntry = new RecentHistory(historyData);
      await historyEntry.save();
      history.push(historyEntry);
    }
    this.testData.history = history;
    return history;
  }

  // Seed static pages
  async seedStaticPages() {
    const pages = [];
    const pageData = [
      {
        title: 'About Us',
        slug: 'about-us',
        content: 'This is a test about us page for testing purposes.',
        isActive: true
      },
      {
        title: 'Terms of Service',
        slug: 'terms',
        content: 'These are test terms of service for testing purposes.',
        isActive: true
      },
      {
        title: 'Privacy Policy',
        slug: 'privacy',
        content: 'This is a test privacy policy for testing purposes.',
        isActive: true
      }
    ];
    
    for (const data of pageData) {
      const page = new StaticPage(data);
      await page.save();
      pages.push(page);
    }
    this.testData.pages = pages;
    return pages;
  }

  // Seed all data
  async seedAll() {
    console.log('🚀 Starting comprehensive data seeding...');
    
    try {
      await this.seedUsers();
      await this.seedSellers();
      await this.seedAdmins();
      await this.seedShops();
      await this.seedProducts();
      await this.seedOrders();
      await this.seedDrones();
      await this.seedDroneOrders();
      await this.seedOffers(); // Add offers seeding
      await this.seedRatings();
      await this.seedFavorites();
      await this.seedLikes();
      await this.seedNotifications();
      await this.seedRecentHistory();
      await this.seedStaticPages();
      
      console.log('🎉 All data seeded successfully!');
      return this.getSummary();
    } catch (error) {
      console.error('❌ Error seeding data:', error);
      throw error;
    }
  }

  // Clear all seeded data
  async clearAll() {
    console.log('🧹 Clearing all test data...');
    
    try {
      await Promise.all([
        User.deleteMany({}),
        Seller.deleteMany({}),
        Admin.deleteMany({}),
        Shop.deleteMany({}),
        Product.deleteMany({}),
        Order.deleteMany({}),
        Drone.deleteMany({}),
        DroneOrder.deleteMany({}),
        Offer.deleteMany({}),
        Rating.deleteMany({}),
        Favorite.deleteMany({}),
        Like.deleteMany({}),
        Notification.deleteMany({}),
        RecentHistory.deleteMany({}),
        StaticPage.deleteMany({})
      ]);
      
      console.log('✅ All test data cleared');
      
    } catch (error) {
      console.error('❌ Error clearing test data:', error);
      throw error;
    }
  }

  // Get test data summary
  getSummary() {
    return {
      users: this.testData.users.length,
      sellers: this.testData.sellers.length,
      admins: this.testData.admins.length,
      shops: this.testData.shops.length,
      products: this.testData.products.length,
      orders: this.testData.orders.length,
      drones: this.testData.drones.length,
      droneOrders: this.testData.droneOrders.length,
      offers: this.testData.offers.length,
      ratings: this.testData.ratings.length,
      favorites: this.testData.favorites.length,
      likes: this.testData.likes.length,
      notifications: this.testData.notifications.length,
      history: this.testData.history.length,
      pages: this.testData.pages.length
    };
  }
}

// Export seeder instance
export const testSeeder = new TestDataSeeder();

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  
  switch (command) {
    case 'seed':
      testSeeder.seedAll()
        .then(() => {
          console.log('📊 Test data summary:', testSeeder.getSummary());
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Seeding failed:', error);
          process.exit(1);
        });
      break;
      
    case 'clear':
      testSeeder.clearAll()
        .then(() => {
          console.log('✅ Test data cleared');
          process.exit(0);
        })
        .catch((error) => {
          console.error('❌ Clearing failed:', error);
          process.exit(1);
        });
      break;
      
    default:
      console.log('Usage: node seed.js [seed|clear]');
      process.exit(1);
  }
}
