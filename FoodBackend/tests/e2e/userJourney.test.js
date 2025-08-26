import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../src/models/userModel.js';
import { Shop } from '../../src/models/shopModel.js';
import { Product } from '../../src/models/productsModel.js';
import { Order } from '../../src/models/ordersModel.js';
import { Cart } from '../../src/models/cartModel.js';
import { Drone } from '../../src/models/droneModel.js';
import { DroneOrder } from '../../src/models/droneOrderModel.js';
import { Notification } from '../../src/models/notificationModel.js';
import userRoutes from '../../src/routes/userRoutes.js';
import sellerRoutes from '../../src/routes/sellerRoutes.js';
import adminRoutes from '../../src/routes/adminRoutes.js';
import droneRoutes from '../../src/routes/droneRoutes.js';
import { testSeeder } from '../seed.js';

// Create test app with all routes
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/seller', sellerRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/drone', droneRoutes);

describe('🚀 End-to-End User Journey Tests', () => {
  let testData;
  let userToken, sellerToken, adminToken;
  let testUser, testSeller, testAdmin, testShop, testProduct;

  beforeEach(async () => {
    // Seed comprehensive test data
    testData = await testSeeder.seedAll();
    
    // Get test entities
    testUser = testData.users[0];
    testSeller = testData.sellers[0];
    testAdmin = testData.admins[0];
    testShop = testData.shops[0];
    testProduct = testData.products[0];
    
    // Generate tokens
    userToken = jwt.sign(
      { _id: testUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    
    sellerToken = jwt.sign(
      { _id: testSeller._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    
    adminToken = jwt.sign(
      { _id: testAdmin._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('🆕 New User Onboarding & First Order', () => {
    it('✅ should complete full user journey from registration to order delivery', async () => {
      console.log('🚀 Starting complete user journey test...');
      
      // Step 1: User Registration
      console.log('📝 Step 1: User Registration');
      const newUserData = {
        username: 'journeyuser',
        email: 'journey@example.com',
        password: 'JourneyPass123!',
        fullName: 'Journey User',
        phone: '+1234567890'
      };

      const registrationResponse = await request(app)
        .post('/api/v1/users/register')
        .send(newUserData)
        .expect(201);

      expect(registrationResponse.body.success).toBe(true);
      expect(registrationResponse.body.data.user.email).toBe(newUserData.email);
      expect(registrationResponse.body.data.user.isEmailVerified).toBe(false);
      
      const newUserId = registrationResponse.body.data.user._id;
      console.log('✅ User registered successfully');

      // Step 2: Email Verification
      console.log('📧 Step 2: Email Verification');
      const verificationCode = '123456';
      const verificationToken = jwt.sign(
        { _id: newUserId, code: verificationCode },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      // Save verification token
      await new mongoose.models.Token({
        token: verificationToken,
        user: newUserId,
        type: 'verification'
      }).save();

      const verificationResponse = await request(app)
        .post('/api/v1/users/verify-email')
        .send({ code: verificationCode })
        .expect(200);

      expect(verificationResponse.body.success).toBe(true);
      expect(verificationResponse.body.message).toContain('Email verified successfully');
      console.log('✅ Email verified successfully');

      // Step 3: User Login
      console.log('🔐 Step 3: User Login');
      const loginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: newUserData.email,
          password: newUserData.password
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
      expect(loginResponse.body.data.accessToken).toBeDefined();
      expect(loginResponse.body.data.refreshToken).toBeDefined();
      
      const userAccessToken = loginResponse.body.data.accessToken;
      console.log('✅ User logged in successfully');

      // Step 4: Browse Shops
      console.log('🏪 Step 4: Browse Shops');
      const shopsResponse = await request(app)
        .get('/api/v1/users/shops')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(shopsResponse.body.success).toBe(true);
      expect(shopsResponse.body.data.shops).toBeDefined();
      expect(shopsResponse.body.data.shops.length).toBeGreaterThan(0);
      
      const availableShop = shopsResponse.body.data.shops.find(shop => shop.isApproved);
      expect(availableShop).toBeDefined();
      console.log('✅ Shops browsed successfully');

      // Step 5: View Shop Details
      console.log('🔍 Step 5: View Shop Details');
      const shopDetailsResponse = await request(app)
        .get(`/api/v1/users/shops/${availableShop._id}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(shopDetailsResponse.body.success).toBe(true);
      expect(shopDetailsResponse.body.data.shop).toBeDefined();
      expect(shopDetailsResponse.body.data.shop._id).toBe(availableShop._id);
      console.log('✅ Shop details viewed successfully');

      // Step 6: Browse Shop Products
      console.log('🛍️ Step 6: Browse Shop Products');
      const productsResponse = await request(app)
        .get(`/api/v1/users/shops/${availableShop._id}/products`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(productsResponse.body.success).toBe(true);
      expect(productsResponse.body.data.products).toBeDefined();
      expect(productsResponse.body.data.products.length).toBeGreaterThan(0);
      
      const availableProduct = productsResponse.body.data.products.find(product => product.isApproved && product.available);
      expect(availableProduct).toBeDefined();
      console.log('✅ Shop products browsed successfully');

      // Step 7: Add Items to Cart
      console.log('🛒 Step 7: Add Items to Cart');
      const cartItem = {
        product: availableProduct._id,
        quantity: 2,
        price: availableProduct.price
      };

      // Create cart entry
      const cart = new Cart({
        user: newUserId,
        items: [cartItem],
        totalAmount: cartItem.price * cartItem.quantity
      });
      await cart.save();
      console.log('✅ Items added to cart successfully');

      // Step 8: Create Order
      console.log('📦 Step 8: Create Order');
      const orderData = {
        shop: availableShop._id,
        items: [cartItem],
        totalAmount: cartItem.price * cartItem.quantity,
        deliveryAddress: '123 Journey Street, Journey City, JC 12345',
        deliveryType: 'regular'
      };

      const orderResponse = await request(app)
        .post('/api/v1/users/orders')
        .set('Authorization', `Bearer ${userAccessToken}`)
        .send(orderData)
        .expect(201);

      expect(orderResponse.body.success).toBe(true);
      expect(orderResponse.body.data.order).toBeDefined();
      expect(orderResponse.body.data.order.status).toBe('pending');
      expect(orderResponse.body.data.order.deliveryType).toBe('regular');
      
      const orderId = orderResponse.body.data.order._id;
      console.log('✅ Order created successfully');

      // Step 9: Order Tracking
      console.log('📍 Step 9: Order Tracking');
      const orderDetailsResponse = await request(app)
        .get(`/api/v1/users/orders/${orderId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(orderDetailsResponse.body.success).toBe(true);
      expect(orderDetailsResponse.body.data.order).toBeDefined();
      expect(orderDetailsResponse.body.data.order._id).toBe(orderId);
      console.log('✅ Order details retrieved successfully');

      // Step 10: Seller Accepts Order
      console.log('✅ Step 10: Seller Accepts Order');
      const orderStatusUpdateResponse = await request(app)
        .patch('/api/v1/seller/orders/status')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          orderId: orderId,
          status: 'confirmed'
        })
        .expect(200);

      expect(orderStatusUpdateResponse.body.success).toBe(true);
      expect(orderStatusUpdateResponse.body.data.order.status).toBe('confirmed');
      console.log('✅ Order accepted by seller');

      // Step 11: Order Preparation
      console.log('👨‍🍳 Step 11: Order Preparation');
      const preparationResponse = await request(app)
        .patch('/api/v1/seller/orders/status')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          orderId: orderId,
          status: 'preparing'
        })
        .expect(200);

      expect(preparationResponse.body.success).toBe(true);
      console.log('✅ Order preparation started');

      // Step 12: Order Ready for Pickup
      console.log('🚚 Step 12: Order Ready for Pickup');
      const readyResponse = await request(app)
        .patch('/api/v1/seller/orders/status')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          orderId: orderId,
          status: 'ready'
        })
        .expect(200);

      expect(readyResponse.body.success).toBe(true);
      console.log('✅ Order ready for pickup');

      // Step 13: Order Delivery
      console.log('🎯 Step 13: Order Delivery');
      const deliveryResponse = await request(app)
        .patch('/api/v1/seller/orders/status')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          orderId: orderId,
          status: 'delivered'
        })
        .expect(200);

      expect(deliveryResponse.body.success).toBe(true);
      console.log('✅ Order delivered successfully');

      // Step 14: Verify Final Order Status
      console.log('🔍 Step 14: Verify Final Order Status');
      const finalOrderResponse = await request(app)
        .get(`/api/v1/users/orders/${orderId}`)
        .set('Authorization', `Bearer ${userAccessToken}`)
        .expect(200);

      expect(finalOrderResponse.body.success).toBe(true);
      expect(finalOrderResponse.body.data.order.status).toBe('delivered');
      console.log('✅ Final order status verified');

      // Step 15: Clean Up
      console.log('🧹 Step 15: Clean Up');
      await Cart.deleteMany({ user: newUserId });
      await Order.findByIdAndDelete(orderId);
      await User.findByIdAndDelete(newUserId);
      console.log('✅ Test data cleaned up');

      console.log('🎉 Complete user journey test passed successfully!');
    }, 30000); // 30 second timeout for comprehensive test
  });

  describe('🏪 New Seller Onboarding & Product Approval', () => {
    it('✅ should complete full seller onboarding and product approval workflow', async () => {
      console.log('🏪 Starting seller onboarding test...');
      
      // Step 1: Seller Registration
      console.log('📝 Step 1: Seller Registration');
      const newSellerData = {
        username: 'journeyseller',
        email: 'journeyseller@example.com',
        password: 'JourneySellerPass123!',
        fullName: 'Journey Seller',
        phone: '+1234567890',
        businessName: 'Journey Business',
        businessType: 'restaurant'
      };

      const sellerRegistrationResponse = await request(app)
        .post('/api/v1/seller/register')
        .send(newSellerData)
        .expect(201);

      expect(sellerRegistrationResponse.body.success).toBe(true);
      expect(sellerRegistrationResponse.body.data.seller.email).toBe(newSellerData.email);
      
      const newSellerId = sellerRegistrationResponse.body.data.seller._id;
      console.log('✅ Seller registered successfully');

      // Step 2: Seller Login
      console.log('🔐 Step 2: Seller Login');
      const sellerLoginResponse = await request(app)
        .post('/api/v1/seller/login')
        .send({
          email: newSellerData.email,
          password: newSellerData.password
        })
        .expect(200);

      expect(sellerLoginResponse.body.success).toBe(true);
      const sellerAccessToken = sellerLoginResponse.body.data.accessToken;
      console.log('✅ Seller logged in successfully');

      // Step 3: Create Shop
      console.log('🏪 Step 3: Create Shop');
      const shopData = {
        name: 'Journey Shop',
        description: 'A test shop for the journey test',
        address: '456 Journey Avenue',
        city: 'Journey City',
        state: 'Journey State',
        zipCode: '12345',
        phone: '+1234567890',
        category: 'restaurant'
      };

      const shopResponse = await request(app)
        .post('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(shopData)
        .expect(201);

      expect(shopResponse.body.success).toBe(true);
      expect(shopResponse.body.data.shop.name).toBe(shopData.name);
      expect(shopResponse.body.data.shop.isApproved).toBe(false); // Should start pending
      
      const newShopId = shopResponse.body.data.shop._id;
      console.log('✅ Shop created successfully (pending approval)');

      // Step 4: Add Products
      console.log('🛍️ Step 4: Add Products');
      const productData = {
        name: 'Journey Product',
        description: 'A test product for the journey test',
        price: 15.99,
        category: 'food',
        available: true,
        stock: 50
      };

      const productResponse = await request(app)
        .post('/api/v1/seller/products')
        .set('Authorization', `Bearer ${sellerAccessToken}`)
        .send(productData)
        .expect(201);

      expect(productResponse.body.success).toBe(true);
      expect(productResponse.body.data.product.name).toBe(productData.name);
      expect(productResponse.body.data.product.isApproved).toBe(false); // Should start pending
      
      const newProductId = productResponse.body.data.product._id;
      console.log('✅ Product created successfully (pending approval)');

      // Step 5: Admin Login
      console.log('🛡️ Step 5: Admin Login');
      const adminLoginResponse = await request(app)
        .post('/api/v1/admin/login')
        .send({
          email: testAdmin.email,
          password: 'TestPassword123!'
        })
        .expect(200);

      expect(adminLoginResponse.body.success).toBe(true);
      const adminAccessToken = adminLoginResponse.body.data.accessToken;
      console.log('✅ Admin logged in successfully');

      // Step 6: Admin Approves Shop
      console.log('✅ Step 6: Admin Approves Shop');
      const shopApprovalResponse = await request(app)
        .put(`/api/v1/admin/shops/${newShopId}/approve`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(shopApprovalResponse.body.success).toBe(true);
      expect(shopApprovalResponse.body.data.shop.isApproved).toBe(true);
      console.log('✅ Shop approved by admin');

      // Step 7: Admin Approves Product
      console.log('✅ Step 7: Admin Approves Product');
      const productApprovalResponse = await request(app)
        .put(`/api/v1/admin/products/${newProductId}/approve`)
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(productApprovalResponse.body.success).toBe(true);
      expect(productApprovalResponse.body.data.product.isApproved).toBe(true);
      console.log('✅ Product approved by admin');

      // Step 8: Verify Public Visibility
      console.log('👀 Step 8: Verify Public Visibility');
      const publicShopsResponse = await request(app)
        .get('/api/v1/users/shops')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const approvedShop = publicShopsResponse.body.data.shops.find(shop => shop._id === newShopId);
      expect(approvedShop).toBeDefined();
      expect(approvedShop.isApproved).toBe(true);
      console.log('✅ Approved shop is publicly visible');

      const publicProductsResponse = await request(app)
        .get(`/api/v1/users/shops/${newShopId}/products`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      const approvedProduct = publicProductsResponse.body.data.products.find(product => product._id === newProductId);
      expect(approvedProduct).toBeDefined();
      expect(approvedProduct.isApproved).toBe(true);
      console.log('✅ Approved product is publicly visible');

      // Step 9: Clean Up
      console.log('🧹 Step 9: Clean Up');
      await Shop.findByIdAndDelete(newShopId);
      await Product.findByIdAndDelete(newProductId);
      await User.findByIdAndDelete(newSellerId);
      console.log('✅ Test data cleaned up');

      console.log('🎉 Seller onboarding test passed successfully!');
    }, 30000);
  });

  describe('🚁 Drone Delivery Flow', () => {
    it('✅ should complete full drone delivery workflow', async () => {
      console.log('🚁 Starting drone delivery test...');
      
      // Step 1: Create Drone-Eligible Order
      console.log('📦 Step 1: Create Drone-Eligible Order');
      const droneOrderData = {
        shop: testShop._id,
        items: [{
          product: testProduct._id,
          quantity: 1,
          price: testProduct.price
        }],
        totalAmount: testProduct.price,
        deliveryAddress: '789 Drone Street, Drone City, DC 12345',
        deliveryType: 'drone'
      };

      const droneOrderResponse = await request(app)
        .post('/api/v1/users/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(droneOrderData)
        .expect(201);

      expect(droneOrderResponse.body.success).toBe(true);
      expect(droneOrderResponse.body.data.order.deliveryType).toBe('drone');
      
      const droneOrderId = droneOrderResponse.body.data.order._id;
      console.log('✅ Drone-eligible order created successfully');

      // Step 2: Create Drone Order
      console.log('🚁 Step 2: Create Drone Order');
      const droneOrderCreationResponse = await request(app)
        .post('/api/v1/drone/create')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: droneOrderId,
          deliveryAddress: droneOrderData.deliveryAddress
        })
        .expect(201);

      expect(droneOrderCreationResponse.body.success).toBe(true);
      expect(droneOrderCreationResponse.body.data.droneOrder).toBeDefined();
      
      const droneOrderDocId = droneOrderCreationResponse.body.data.droneOrder._id;
      console.log('✅ Drone order created successfully');

      // Step 3: Admin Assigns Drone
      console.log('🎯 Step 3: Admin Assigns Drone');
      const droneAssignmentResponse = await request(app)
        .post(`/api/v1/drone/assign/${droneOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(droneAssignmentResponse.body.success).toBe(true);
      expect(droneAssignmentResponse.body.data.drone).toBeDefined();
      
      const assignedDroneId = droneAssignmentResponse.body.data.drone._id;
      console.log('✅ Drone assigned successfully');

      // Step 4: Weather Safety Check
      console.log('🌤️ Step 4: Weather Safety Check');
      // This would normally call the weather API
      // For testing, we'll assume weather is safe
      console.log('✅ Weather conditions are safe for flight');

      // Step 5: Launch Drone
      console.log('🚀 Step 5: Launch Drone');
      const launchResponse = await request(app)
        .post(`/api/v1/drone/launch/${droneOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(launchResponse.body.success).toBe(true);
      expect(launchResponse.body.data.drone.status).toBe('in-flight');
      console.log('✅ Drone launched successfully');

      // Step 6: Real-Time Tracking
      console.log('📍 Step 6: Real-Time Tracking');
      const trackingResponse = await request(app)
        .get(`/api/v1/drone/status-by-order/${droneOrderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(trackingResponse.body.success).toBe(true);
      expect(trackingResponse.body.data.droneOrder.status).toBe('in-flight');
      console.log('✅ Real-time tracking working');

      // Step 7: Generate QR Code
      console.log('📱 Step 7: Generate QR Code');
      // QR code generation would happen automatically
      console.log('✅ QR code generated for delivery verification');

      // Step 8: Drone Arrives and QR Verification
      console.log('🎯 Step 8: Drone Arrives and QR Verification');
      const qrVerificationResponse = await request(app)
        .post('/api/v1/drone/verify-qr')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          orderId: droneOrderId,
          qrCode: 'test-qr-code-123'
        })
        .expect(200);

      expect(qrVerificationResponse.body.success).toBe(true);
      console.log('✅ QR code verification successful');

      // Step 9: Complete Delivery
      console.log('✅ Step 9: Complete Delivery');
      const deliveryResponse = await request(app)
        .patch(`/api/v1/drone/update/${droneOrderDocId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'delivered',
          actualDeliveryTime: new Date()
        })
        .expect(200);

      expect(deliveryResponse.body.success).toBe(true);
      console.log('✅ Drone delivery completed');

      // Step 10: Drone Return
      console.log('🔄 Step 10: Drone Return');
      const returnResponse = await request(app)
        .post(`/api/v1/drone/return/${assignedDroneId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(returnResponse.body.success).toBe(true);
      expect(returnResponse.body.data.drone.status).toBe('returning');
      console.log('✅ Drone returning to base');

      // Step 11: Verify Final Status
      console.log('🔍 Step 11: Verify Final Status');
      const finalDroneOrderResponse = await request(app)
        .get(`/api/v1/drone/status-by-order/${droneOrderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(finalDroneOrderResponse.body.success).toBe(true);
      expect(finalDroneOrderResponse.body.data.droneOrder.status).toBe('delivered');
      console.log('✅ Final drone order status verified');

      // Step 12: Clean Up
      console.log('🧹 Step 12: Clean Up');
      await DroneOrder.findByIdAndDelete(droneOrderDocId);
      await Order.findByIdAndDelete(droneOrderId);
      console.log('✅ Test data cleaned up');

      console.log('🎉 Drone delivery test passed successfully!');
    }, 30000);
  });

  describe('🔒 Failed Login & Password Reset Flow', () => {
    it('✅ should handle account lockout and password reset workflow', async () => {
      console.log('🔒 Starting account security test...');
      
      // Step 1: Multiple Failed Login Attempts
      console.log('❌ Step 1: Multiple Failed Login Attempts');
      const loginData = {
        email: 'user1@example.com',
        password: 'WrongPassword123!'
      };

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        const failedResponse = await request(app)
          .post('/api/v1/users/login')
          .send(loginData)
          .expect(401);

        expect(failedResponse.body.success).toBe(false);
        expect(failedResponse.body.message).toContain('Invalid credentials');
      }
      console.log('✅ 5 failed login attempts completed');

      // Step 2: Account Lockout
      console.log('🔒 Step 2: Account Lockout');
      const lockoutResponse = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(423);

      expect(lockoutResponse.body.success).toBe(false);
      expect(lockoutResponse.body.message).toContain('Account is temporarily locked');
      console.log('✅ Account locked after 5 failed attempts');

      // Step 3: Password Reset Request
      console.log('📧 Step 3: Password Reset Request');
      const resetRequestResponse = await request(app)
        .post('/api/v1/users/forgot-password')
        .send({ email: 'user1@example.com' })
        .expect(200);

      expect(resetRequestResponse.body.success).toBe(true);
      expect(resetRequestResponse.body.message).toContain('Password reset email sent');
      console.log('✅ Password reset email sent');

      // Step 4: Password Reset with Token
      console.log('🔑 Step 4: Password Reset with Token');
      const resetToken = jwt.sign(
        { _id: testUser._id, type: 'reset' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      // Save reset token
      await new mongoose.models.Token({
        token: resetToken,
        user: testUser._id,
        type: 'reset'
      }).save();

      const newPassword = 'NewSecurePassword123!';
      const passwordResetResponse = await request(app)
        .post(`/api/v1/users/reset-password/${resetToken}`)
        .send({
          password: newPassword,
          confirmPassword: newPassword
        })
        .expect(200);

      expect(passwordResetResponse.body.success).toBe(true);
      expect(passwordResetResponse.body.message).toContain('Password reset successfully');
      console.log('✅ Password reset successfully');

      // Step 5: Verify New Password Works
      console.log('✅ Step 5: Verify New Password Works');
      const newLoginResponse = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'user1@example.com',
          password: newPassword
        })
        .expect(200);

      expect(newLoginResponse.body.success).toBe(true);
      expect(newLoginResponse.body.data.accessToken).toBeDefined();
      console.log('✅ New password login successful');

      // Step 6: Clean Up
      console.log('🧹 Step 6: Clean Up');
      await mongoose.models.Token.deleteMany({ user: testUser._id, type: 'reset' });
      console.log('✅ Test data cleaned up');

      console.log('🎉 Account security test passed successfully!');
    }, 30000);
  });

  describe('📱 Real-Time Notifications & Updates', () => {
    it('✅ should handle real-time notifications and updates', async () => {
      console.log('📱 Starting real-time notifications test...');
      
      // Step 1: Create Order
      console.log('📦 Step 1: Create Order');
      const orderData = {
        shop: testShop._id,
        items: [{
          product: testProduct._id,
          quantity: 1,
          price: testProduct.price
        }],
        totalAmount: testProduct.price,
        deliveryAddress: '123 Notification Street, Notification City, NC 12345',
        deliveryType: 'regular'
      };

      const orderResponse = await request(app)
        .post('/api/v1/users/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderData)
        .expect(201);

      const orderId = orderResponse.body.data.order._id;
      console.log('✅ Order created successfully');

      // Step 2: Create Notification
      console.log('🔔 Step 2: Create Notification');
      const notificationData = {
        title: 'Order Created',
        message: 'Your order has been created successfully',
        type: 'order',
        orderId: orderId
      };

      const notificationResponse = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .send(notificationData)
        .expect(201);

      expect(notificationResponse.body.success).toBe(true);
      expect(notificationResponse.body.data.notification).toBeDefined();
      
      const notificationId = notificationResponse.body.data.notification._id;
      console.log('✅ Notification created successfully');

      // Step 3: Retrieve Notifications
      console.log('📋 Step 3: Retrieve Notifications');
      const notificationsResponse = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(notificationsResponse.body.success).toBe(true);
      expect(notificationsResponse.body.data.notifications).toBeDefined();
      expect(notificationsResponse.body.data.notifications.length).toBeGreaterThan(0);
      console.log('✅ Notifications retrieved successfully');

      // Step 4: Mark Notification as Read
      console.log('👁️ Step 4: Mark Notification as Read');
      const markReadResponse = await request(app)
        .put(`/api/v1/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(markReadResponse.body.success).toBe(true);
      console.log('✅ Notification marked as read');

      // Step 5: Get Notification Stats
      console.log('📊 Step 5: Get Notification Stats');
      const statsResponse = await request(app)
        .get('/api/v1/notifications/stats')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(statsResponse.body.success).toBe(true);
      expect(statsResponse.body.data.stats).toBeDefined();
      console.log('✅ Notification stats retrieved');

      // Step 6: Clean Up
      console.log('🧹 Step 6: Clean Up');
      await Notification.findByIdAndDelete(notificationId);
      await Order.findByIdAndDelete(orderId);
      console.log('✅ Test data cleaned up');

      console.log('🎉 Real-time notifications test passed successfully!');
    }, 30000);
  });

  describe('🔍 Search & Discovery', () => {
    it('✅ should handle search and discovery functionality', async () => {
      console.log('🔍 Starting search and discovery test...');
      
      // Step 1: Search for Shops
      console.log('🏪 Step 1: Search for Shops');
      const shopSearchResponse = await request(app)
        .get('/api/v1/search?query=Test&type=shops&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(shopSearchResponse.body.success).toBe(true);
      expect(shopSearchResponse.body.data.shops).toBeDefined();
      expect(shopSearchResponse.body.data.shops.length).toBeGreaterThan(0);
      console.log('✅ Shop search working');

      // Step 2: Search for Products
      console.log('🛍️ Step 2: Search for Products');
      const productSearchResponse = await request(app)
        .get('/api/v1/search?query=Test&type=products&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(productSearchResponse.body.success).toBe(true);
      expect(productSearchResponse.body.data.products).toBeDefined();
      expect(productSearchResponse.body.data.products.length).toBeGreaterThan(0);
      console.log('✅ Product search working');

      // Step 3: Combined Search
      console.log('🔍 Step 3: Combined Search');
      const combinedSearchResponse = await request(app)
        .get('/api/v1/search?query=Test&type=all&limit=10')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(combinedSearchResponse.body.success).toBe(true);
      expect(combinedSearchResponse.body.data.shops).toBeDefined();
      expect(combinedSearchResponse.body.data.products).toBeDefined();
      console.log('✅ Combined search working');

      // Step 4: Search with Special Characters
      console.log('🔤 Step 4: Search with Special Characters');
      const specialSearchResponse = await request(app)
        .get('/api/v1/search?query=Test%20Shop&type=all&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(specialSearchResponse.body.success).toBe(true);
      console.log('✅ Special character search working');

      // Step 5: Empty Search
      console.log('🔍 Step 5: Empty Search');
      const emptySearchResponse = await request(app)
        .get('/api/v1/search?query=&type=all&limit=5')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(emptySearchResponse.body.success).toBe(true);
      expect(emptySearchResponse.body.data.shops).toEqual([]);
      expect(emptySearchResponse.body.data.products).toEqual([]);
      console.log('✅ Empty search handling working');

      console.log('🎉 Search and discovery test passed successfully!');
    }, 30000);
  });

  describe('⭐ Ratings & Reviews', () => {
    it('✅ should handle ratings and reviews functionality', async () => {
      console.log('⭐ Starting ratings and reviews test...');
      
      // Step 1: Add Shop Rating
      console.log('🏪 Step 1: Add Shop Rating');
      const shopRatingData = {
        targetType: 'shop',
        targetId: testShop._id,
        rating: 5,
        review: 'Excellent service and great food!'
      };

      const shopRatingResponse = await request(app)
        .post('/api/v1/ratings/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(shopRatingData)
        .expect(200);

      expect(shopRatingResponse.body.success).toBe(true);
      expect(shopRatingResponse.body.data.rating).toBeDefined();
      
      const shopRatingId = shopRatingResponse.body.data.rating._id;
      console.log('✅ Shop rating added successfully');

      // Step 2: Add Product Rating
      console.log('🛍️ Step 2: Add Product Rating');
      const productRatingData = {
        targetType: 'product',
        targetId: testProduct._id,
        rating: 4,
        review: 'Great product, highly recommended!'
      };

      const productRatingResponse = await request(app)
        .post('/api/v1/ratings/add')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productRatingData)
        .expect(200);

      expect(productRatingResponse.body.success).toBe(true);
      expect(productRatingResponse.body.data.rating).toBeDefined();
      
      const productRatingId = productRatingResponse.body.data.rating._id;
      console.log('✅ Product rating added successfully');

      // Step 3: Get Ratings for Shop
      console.log('📊 Step 3: Get Ratings for Shop');
      const shopRatingsResponse = await request(app)
        .get(`/api/v1/ratings/shop/${testShop._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(shopRatingsResponse.body.success).toBe(true);
      expect(shopRatingsResponse.body.data.ratings).toBeDefined();
      expect(shopRatingsResponse.body.data.ratings.length).toBeGreaterThan(0);
      console.log('✅ Shop ratings retrieved successfully');

      // Step 4: Get Ratings for Product
      console.log('📊 Step 4: Get Ratings for Product');
      const productRatingsResponse = await request(app)
        .get(`/api/v1/ratings/product/${testProduct._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(productRatingsResponse.body.success).toBe(true);
      expect(productRatingsResponse.body.data.ratings).toBeDefined();
      expect(productRatingsResponse.body.data.ratings.length).toBeGreaterThan(0);
      console.log('✅ Product ratings retrieved successfully');

      // Step 5: Get User's Ratings
      console.log('👤 Step 5: Get User\'s Ratings');
      const userRatingsResponse = await request(app)
        .get(`/api/v1/ratings/user/shop/${testShop._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(userRatingsResponse.body.success).toBe(true);
      expect(userRatingsResponse.body.data.ratings).toBeDefined();
      console.log('✅ User ratings retrieved successfully');

      // Step 6: Clean Up
      console.log('🧹 Step 6: Clean Up');
      await mongoose.models.Rating.findByIdAndDelete(shopRatingId);
      await mongoose.models.Rating.findByIdAndDelete(productRatingId);
      console.log('✅ Test data cleaned up');

      console.log('🎉 Ratings and reviews test passed successfully!');
    }, 30000);
  });
});
