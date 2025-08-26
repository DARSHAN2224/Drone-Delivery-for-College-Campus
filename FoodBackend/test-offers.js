import mongoose from 'mongoose';
import { Offer } from './src/models/offersModel.js';
import { Shop } from './src/models/shopModel.js';
import { Product } from './src/models/productsModel.js';
import { Order } from './src/models/ordersModel.js';
import { User } from './src/models/userModel.js';
import { Seller } from './src/models/sellerModel.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Use hardcoded connection string for testing
    const mongoUrl = 'mongodb://127.0.0.1:27017/food_delivery';
    console.log(`🔌 Connecting to MongoDB: ${mongoUrl}`);
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create test offers
const createTestOffers = async () => {
  try {
    console.log('🌟 Creating test offers...');
    
    // Get existing shops and products
    const shops = await Shop.find().limit(3);
    const products = await Product.find().limit(5);
    
    if (shops.length === 0) {
      console.log('⚠️ No shops found, creating a test shop first...');
      const seller = await Seller.findOne();
      if (!seller) {
        console.log('❌ No sellers found, cannot create shops');
        return;
      }
      
      const testShop = new Shop({
        name: 'Test Restaurant',
        description: 'A test restaurant for offers testing',
        sellerId: seller._id,
        city: 'Test City',
        state: 'Test State',
        address: '123 Test Street',
        isApproved: true,
        isActive: true
      });
      await testShop.save();
      shops.push(testShop);
    }
    
    if (products.length === 0) {
      console.log('⚠️ No products found, creating test products...');
      const testProducts = [];
      for (let i = 0; i < 3; i++) {
        const product = new Product({
          name: `Test Product ${i + 1}`,
          description: `A test product ${i + 1}`,
          price: 9.99 + (i * 2),
          category: ['food', 'beverage', 'dessert'][i % 3],
          available: true,
          shop: shops[0]._id,
          isApproved: true,
          stock: 100
        });
        await product.save();
        testProducts.push(product);
      }
      products.push(...testProducts);
    }
    
    // Create test offers
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
      }
    ];
    
    // Clear existing offers
    await Offer.deleteMany({});
    
    const offers = await Offer.insertMany(offersData);
    console.log(`✅ Created ${offers.length} test offers`);
    return offers;
    
  } catch (error) {
    console.error('❌ Error creating offers:', error);
    throw error;
  }
};

// Create test orders
const createTestOrders = async () => {
  try {
    console.log('🛒 Creating test orders...');
    
    const users = await User.find().limit(2);
    const shops = await Shop.find().limit(2);
    const products = await Product.find().limit(3);
    
    if (users.length === 0 || shops.length === 0 || products.length === 0) {
      console.log('⚠️ Missing users, shops, or products for orders');
      return [];
    }
    
    // Clear existing orders
    await Order.deleteMany({});
    
    const orders = [];
    for (let i = 0; i < 2; i++) {
      const user = users[i % users.length];
      const shop = shops[i % shops.length];
      const shopProducts = products.filter(p => p.shop.toString() === shop._id.toString()).slice(0, 2);
      
      if (shopProducts.length === 0) continue;
      
      const orderData = {
        orderToken: `ORDER_${Date.now()}_${i}`,
        user: user._id,
        shops: [{
          shopId: shop._id,
          status: ['arrived', 'preparing'][i % 2],
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
        deliveryType: 'regular',
        deliveryStatus: 'pending',
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
        estimatedDeliveryTime: new Date(Date.now() + (30 + i * 15) * 60 * 1000)
      };
      
      const order = new Order(orderData);
      await order.save();
      orders.push(order);
    }
    
    console.log(`✅ Created ${orders.length} test orders`);
    return orders;
    
  } catch (error) {
    console.error('❌ Error creating orders:', error);
    throw error;
  }
};

// Main function
const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting test data creation...');
    
    await createTestOffers();
    await createTestOrders();
    
    console.log('🎉 Test data created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Check the frontend offers page: /offers');
    console.log('2. Check the seller dashboard orders: /seller/orders');
    console.log('3. Verify data is displaying correctly');
    
  } catch (error) {
    console.error('❌ Error in main function:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
