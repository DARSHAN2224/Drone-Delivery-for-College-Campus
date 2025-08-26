import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import sellerRoutes from '../../src/routes/sellerRoutes.js';
import { User, Seller, Shop, Product, Order, Offer } from '../../src/models/index.js';
import { testSeeder } from '../seed.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/seller', sellerRoutes);

describe('🏪 Seller API Tests', () => {
  let testData;
  let validSellerToken, validUserToken, validAdminToken;
  let expiredToken, invalidToken;

  beforeEach(async () => {
    testData = await testSeeder.seedAll();
    
    // Generate tokens for different roles
    validSellerToken = global.testUtils.generateTestToken(
      { _id: testData.sellers[0]._id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET,
      '1h'
    );
    
    validUserToken = global.testUtils.generateTestToken(
      { _id: testData.users[0]._id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET,
      '1h'
    );
    
    validAdminToken = global.testUtils.generateTestToken(
      { _id: testData.admins[0]._id, role: 'admin' },
      process.env.ACCESS_TOKEN_SECRET,
      '1h'
    );
    
    expiredToken = global.testUtils.generateTestToken(
      { _id: testData.sellers[0]._id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET,
      '0s'
    );
    
    invalidToken = 'invalid.jwt.token';
  });

  describe('🔐 Authentication & Authorization', () => {
    it('❌ should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/seller/dashboard')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    it('❌ should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/seller/dashboard')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject request with expired token', async () => {
      const response = await request(app)
        .get('/api/v1/seller/dashboard')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject user token for seller routes', async () => {
      const response = await request(app)
        .get('/api/v1/seller/dashboard')
        .set('Authorization', `Bearer ${validUserToken}`)
        .expect(403);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('seller');
    });

    it('❌ should reject admin token for seller routes', async () => {
      const response = await request(app)
        .get('/api/v1/seller/dashboard')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(403);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('seller');
    });
  });

  describe('📊 GET /api/v1/seller/dashboard', () => {
    it('✅ should return seller dashboard data with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/seller/dashboard')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data).toHaveProperty('recentOrders');
      expect(response.body.data).toHaveProperty('recentProducts');
    });

    it('❌ should return 404 if seller has no shop', async () => {
      // Create seller without shop
      const sellerWithoutShop = await testSeeder.seedSellers(1);
      const sellerToken = global.testUtils.generateTestToken(
        { _id: sellerWithoutShop[0]._id, role: 'seller' },
        process.env.ACCESS_TOKEN_SECRET,
        '1h'
      );

      const response = await request(app)
        .get('/api/v1/seller/dashboard')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(404);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('shop');
    });
  });

  describe('🏪 POST /api/v1/seller/shops', () => {
    const validShopData = {
      name: 'Test Shop',
      description: 'A test shop for testing',
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      phone: '+1234567890',
      email: 'test@shop.com',
      category: 'restaurant',
      cuisine: 'international',
      deliveryRadius: 10,
      openingHours: {
        monday: { open: '09:00', close: '17:00' },
        tuesday: { open: '09:00', close: '17:00' }
      }
    };

    it('✅ should create shop with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(validShopData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(validShopData.name);
      expect(response.body.data.status).toBe('pending');
    });

    it('❌ should reject shop creation with missing required fields', async () => {
      const invalidData = { ...validShopData };
      delete invalidData.name;

      const response = await request(app)
        .post('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name');
    });

    it('❌ should reject shop creation with invalid data types', async () => {
      const invalidData = { ...validShopData, deliveryRadius: 'invalid' };

      const response = await request(app)
        .post('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject shop creation if seller already has a shop', async () => {
      const response = await request(app)
        .post('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(validShopData)
        .expect(409);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });
  });

  describe('🏪 GET /api/v1/seller/shops', () => {
    it('✅ should return seller shops', async () => {
      const response = await request(app)
        .get('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('❌ should return empty array if no shops', async () => {
      const sellerWithoutShop = await testSeeder.seedSellers(1);
      const sellerToken = global.testUtils.generateTestToken(
        { _id: sellerWithoutShop[0]._id, role: 'seller' },
        process.env.ACCESS_TOKEN_SECRET,
        '1h'
      );

      const response = await request(app)
        .get('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${sellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('🏪 PUT /api/v1/seller/shops/:shopId', () => {
    it('✅ should update shop with valid data', async () => {
      const shopId = testData.shops[0]._id;
      const updateData = { name: 'Updated Shop Name' };

      const response = await request(app)
        .put(`/api/v1/seller/shops/${shopId}`)
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('❌ should reject update of non-existent shop', async () => {
      const fakeShopId = '507f1f77bcf86cd799439011';
      const updateData = { name: 'Updated Shop Name' };

      const response = await request(app)
        .put(`/api/v1/seller/shops/${fakeShopId}`)
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(updateData)
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject update of shop not owned by seller', async () => {
      const otherShopId = testData.shops[1]._id;
      const updateData = { name: 'Updated Shop Name' };

      const response = await request(app)
        .put(`/api/v1/seller/shops/${otherShopId}`)
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(updateData)
        .expect(403);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('🍕 POST /api/v1/seller/products', () => {
    const validProductData = {
      name: 'Test Product',
      description: 'A test product for testing',
      price: 9.99,
      category: 'main',
      cuisine: 'international',
      allergens: ['nuts'],
      dietary: ['vegetarian'],
      preparationTime: 15,
      isAvailable: true
    };

    it('✅ should create product with valid data', async () => {
      const shopId = testData.shops[0]._id;
      const productData = { ...validProductData, shopId };

      const response = await request(app)
        .post('/api/v1/seller/products')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(productData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(validProductData.name);
      expect(response.body.data.status).toBe('pending');
    });

    it('❌ should reject product creation with missing required fields', async () => {
      const shopId = testData.shops[0]._id;
      const invalidData = { ...validProductData, shopId };
      delete invalidData.name;

      const response = await request(app)
        .post('/api/v1/seller/products')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject product creation with invalid price', async () => {
      const shopId = testData.shops[0]._id;
      const invalidData = { ...validProductData, shopId, price: -5 };

      const response = await request(app)
        .post('/api/v1/seller/products')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('🍕 GET /api/v1/seller/products', () => {
    it('✅ should return seller products', async () => {
      const response = await request(app)
        .get('/api/v1/seller/products')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('✅ should filter products by status', async () => {
      const response = await request(app)
        .get('/api/v1/seller/products?status=approved')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(p => p.status === 'approved')).toBe(true);
    });
  });

  describe('📦 GET /api/v1/seller/orders', () => {
    it('✅ should return seller orders', async () => {
      const response = await request(app)
        .get('/api/v1/seller/orders')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('✅ should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/v1/seller/orders?status=pending')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });

    it('✅ should paginate orders', async () => {
      const response = await request(app)
        .get('/api/v1/seller/orders?page=1&limit=5')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });

  describe('📦 PUT /api/v1/seller/orders/:orderId', () => {
    it('✅ should update order status', async () => {
      const orderId = testData.orders[0]._id;
      const updateData = { status: 'preparing' };

      const response = await request(app)
        .put(`/api/v1/seller/orders/${orderId}`)
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('❌ should reject invalid status update', async () => {
      const orderId = testData.orders[0]._id;
      const updateData = { status: 'invalid_status' };

      const response = await request(app)
        .put(`/api/v1/seller/orders/${orderId}`)
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(updateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('💰 POST /api/v1/seller/offers', () => {
    const validOfferData = {
      title: 'Test Offer',
      description: 'A test offer for testing',
      discountType: 'percentage',
      discountValue: 20,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      minimumOrder: 25,
      maximumDiscount: 10,
      isActive: true
    };

    it('✅ should create offer with valid data', async () => {
      const shopId = testData.shops[0]._id;
      const offerData = { ...validOfferData, shopId };

      const response = await request(app)
        .post('/api/v1/seller/offers')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(offerData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.title).toBe(validOfferData.title);
    });

    it('❌ should reject offer with invalid discount value', async () => {
      const shopId = testData.shops[0]._id;
      const invalidData = { ...validOfferData, shopId, discountValue: 150 };

      const response = await request(app)
        .post('/api/v1/seller/offers')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('💰 GET /api/v1/seller/offers', () => {
    it('✅ should return seller offers', async () => {
      const response = await request(app)
        .get('/api/v1/seller/offers')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('✅ should filter offers by status', async () => {
      const response = await request(app)
        .get('/api/v1/seller/offers?status=active')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  describe('🔒 Security Tests', () => {
    it('❌ should reject SQL injection attempts', async () => {
      const maliciousData = {
        name: "'; DROP TABLE shops; --",
        description: '<script>alert("xss")</script>'
      };

      const response = await request(app)
        .post('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(maliciousData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject XSS payloads', async () => {
      const maliciousData = {
        name: 'Test Shop',
        description: '<img src="x" onerror="alert(\'xss\')">'
      };

      const response = await request(app)
        .post('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(maliciousData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('⚡ Performance Tests', () => {
    it('✅ should handle concurrent requests efficiently', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/v1/seller/dashboard')
          .set('Authorization', `Bearer ${validSellerToken}`)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('✅ should handle large payloads efficiently', async () => {
      const largeDescription = 'A'.repeat(10000);
      const largeData = {
        name: 'Test Shop',
        description: largeDescription,
        address: '123 Test Street'
      };

      const response = await request(app)
        .post('/api/v1/seller/shops')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .send(largeData)
        .expect(400); // Should reject due to size limit
      
      expect(response.body.success).toBe(false);
    });
  });
});
