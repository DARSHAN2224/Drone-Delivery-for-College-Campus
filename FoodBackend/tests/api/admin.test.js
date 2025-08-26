import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import adminRoutes from '../../src/routes/adminRoutes.js';
import { User, Seller, Admin, Shop, Product, Order, Offer, Drone } from '../../src/models/index.js';
import { testSeeder } from '../seed.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/admin', adminRoutes);

describe('👑 Admin API Tests', () => {
  let testData;
  let validAdminToken, validUserToken, validSellerToken;
  let expiredToken, invalidToken;

  beforeEach(async () => {
    testData = await testSeeder.seedAll();
    
    // Generate tokens for different roles
    validAdminToken = global.testUtils.generateTestToken(
      { _id: testData.admins[0]._id, role: 'admin' },
      process.env.ACCESS_TOKEN_SECRET,
      '1h'
    );
    
    validUserToken = global.testUtils.generateTestToken(
      { _id: testData.users[0]._id, role: 'user' },
      process.env.ACCESS_TOKEN_SECRET,
      '1h'
    );
    
    validSellerToken = global.testUtils.generateTestToken(
      { _id: testData.sellers[0]._id, role: 'seller' },
      process.env.ACCESS_TOKEN_SECRET,
      '1h'
    );
    
    expiredToken = global.testUtils.generateTestToken(
      { _id: testData.admins[0]._id, role: 'admin' },
      process.env.ACCESS_TOKEN_SECRET,
      '0s'
    );
    
    invalidToken = 'invalid.jwt.token';
  });

  describe('🔐 Authentication & Authorization', () => {
    it('❌ should reject request without token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    it('❌ should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject request with expired token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject user token for admin routes', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${validUserToken}`)
        .expect(403);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('admin');
    });

    it('❌ should reject seller token for admin routes', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${validSellerToken}`)
        .expect(403);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('admin');
    });
  });

  describe('📊 GET /api/v1/admin/dashboard', () => {
    it('✅ should return admin dashboard data with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
      expect(response.body.data).toHaveProperty('recentActivity');
      expect(response.body.data).toHaveProperty('pendingApprovals');
      expect(response.body.data).toHaveProperty('systemHealth');
    });

    it('✅ should include platform statistics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      const stats = response.body.data.stats;
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('totalSellers');
      expect(stats).toHaveProperty('totalShops');
      expect(stats).toHaveProperty('totalOrders');
      expect(stats).toHaveProperty('totalRevenue');
    });

    it('✅ should include pending approval counts', async () => {
      const response = await request(app)
        .get('/api/v1/admin/dashboard')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      const pending = response.body.data.pendingApprovals;
      expect(pending).toHaveProperty('shops');
      expect(pending).toHaveProperty('products');
      expect(pending).toHaveProperty('offers');
      expect(pending).toHaveProperty('sellers');
    });
  });

  describe('👥 GET /api/v1/admin/users', () => {
    it('✅ should return all users with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users?page=1&limit=10')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(10);
      expect(response.body).toHaveProperty('pagination');
    });

    it('✅ should filter users by role', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users?role=user')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(u => u.role === 'user')).toBe(true);
    });

    it('✅ should search users by name or email', async () => {
      const searchTerm = testData.users[0].username;
      const response = await request(app)
        .get(`/api/v1/admin/users?search=${searchTerm}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.some(u => 
        u.username.includes(searchTerm) || u.email.includes(searchTerm)
      )).toBe(true);
    });

    it('✅ should filter users by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/users?status=active')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(u => u.status === 'active')).toBe(true);
    });
  });

  describe('👥 PUT /api/v1/admin/users/:userId', () => {
    it('✅ should update user status', async () => {
      const userId = testData.users[0]._id;
      const updateData = { status: 'suspended' };

      const response = await request(app)
        .put(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('✅ should update user role', async () => {
      const userId = testData.users[0]._id;
      const updateData = { role: 'seller' };

      const response = await request(app)
        .put(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.role).toBe(updateData.role);
    });

    it('❌ should reject update of non-existent user', async () => {
      const fakeUserId = '507f1f77bcf86cd799439011';
      const updateData = { status: 'suspended' };

      const response = await request(app)
        .put(`/api/v1/admin/users/${fakeUserId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(updateData)
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject invalid status update', async () => {
      const userId = testData.users[0]._id;
      const updateData = { status: 'invalid_status' };

      const response = await request(app)
        .put(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(updateData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('🏪 GET /api/v1/admin/shops', () => {
    it('✅ should return all shops with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/admin/shops?page=1&limit=10')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('✅ should filter shops by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/shops?status=pending')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(s => s.status === 'pending')).toBe(true);
    });

    it('✅ should filter shops by category', async () => {
      const response = await request(app)
        .get('/api/v1/admin/shops?category=restaurant')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(s => s.category === 'restaurant')).toBe(true);
    });
  });

  describe('✅ PUT /api/v1/admin/approval/shops/:shopId', () => {
    it('✅ should approve shop with valid data', async () => {
      const shopId = testData.shops.find(s => s.status === 'pending')?._id;
      if (!shopId) {
        // Create a pending shop if none exists
        const pendingShop = await testSeeder.seedShops(1, 'pending');
        shopId = pendingShop[0]._id;
      }

      const approvalData = { 
        status: 'approved',
        adminNotes: 'Shop meets all requirements'
      };

      const response = await request(app)
        .put(`/api/v1/admin/approval/shops/${shopId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(approvalData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
      expect(response.body.data.adminNotes).toBe(approvalData.adminNotes);
    });

    it('✅ should reject shop with valid reason', async () => {
      const shopId = testData.shops.find(s => s.status === 'pending')?._id;
      if (!shopId) {
        const pendingShop = await testSeeder.seedShops(1, 'pending');
        shopId = pendingShop[0]._id;
      }

      const rejectionData = { 
        status: 'rejected',
        adminNotes: 'Shop does not meet requirements',
        rejectionReason: 'Incomplete documentation'
      };

      const response = await request(app)
        .put(`/api/v1/admin/approval/shops/${shopId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(rejectionData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('rejected');
      expect(response.body.data.rejectionReason).toBe(rejectionData.rejectionReason);
    });

    it('❌ should reject approval of non-existent shop', async () => {
      const fakeShopId = '507f1f77bcf86cd799439011';
      const approvalData = { status: 'approved' };

      const response = await request(app)
        .put(`/api/v1/admin/approval/shops/${fakeShopId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(approvalData)
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject invalid approval status', async () => {
      const shopId = testData.shops[0]._id;
      const invalidData = { status: 'invalid_status' };

      const response = await request(app)
        .put(`/api/v1/admin/approval/shops/${shopId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('🍕 PUT /api/v1/admin/approval/products/:productId', () => {
    it('✅ should approve product with valid data', async () => {
      const productId = testData.products.find(p => p.status === 'pending')?._id;
      if (!productId) {
        const pendingProduct = await testSeeder.seedProducts(1, 'pending');
        productId = pendingProduct[0]._id;
      }

      const approvalData = { 
        status: 'approved',
        adminNotes: 'Product meets all requirements'
      };

      const response = await request(app)
        .put(`/api/v1/admin/approval/products/${productId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(approvalData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
    });

    it('✅ should reject product with valid reason', async () => {
      const productId = testData.products.find(p => p.status === 'pending')?._id;
      if (!productId) {
        const pendingProduct = await testSeeder.seedProducts(1, 'pending');
        productId = pendingProduct[0]._id;
      }

      const rejectionData = { 
        status: 'rejected',
        adminNotes: 'Product does not meet requirements',
        rejectionReason: 'Inappropriate content'
      };

      const response = await request(app)
        .put(`/api/v1/admin/approval/products/${productId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(rejectionData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('rejected');
    });
  });

  describe('💰 PUT /api/v1/admin/approval/offers/:offerId', () => {
    it('✅ should approve offer with valid data', async () => {
      const offerId = testData.offers.find(o => o.status === 'pending')?._id;
      if (!offerId) {
        const pendingOffer = await testSeeder.seedOffers(1, 'pending');
        offerId = pendingOffer[0]._id;
      }

      const approvalData = { 
        status: 'approved',
        adminNotes: 'Offer meets all requirements'
      };

      const response = await request(app)
        .put(`/api/v1/admin/approval/offers/${offerId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(approvalData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('approved');
    });
  });

  describe('🚁 GET /api/v1/admin/drones', () => {
    it('✅ should return all drones with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/admin/drones?page=1&limit=10')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
    });

    it('✅ should filter drones by status', async () => {
      const response = await request(app)
        .get('/api/v1/admin/drones?status=available')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(d => d.status === 'available')).toBe(true);
    });

    it('✅ should filter drones by type', async () => {
      const response = await request(app)
        .get('/api/v1/admin/drones?type=delivery')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.every(d => d.type === 'delivery')).toBe(true);
    });
  });

  describe('🚁 POST /api/v1/admin/drones', () => {
    const validDroneData = {
      name: 'Admin Test Drone',
      type: 'delivery',
      model: 'Test Model',
      maxPayload: 5.0,
      maxRange: 50,
      maxSpeed: 60,
      batteryCapacity: 5000,
      status: 'available',
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128]
      }
    };

    it('✅ should create drone with valid data', async () => {
      const response = await request(app)
        .post('/api/v1/admin/drones')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(validDroneData)
        .expect(201);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(validDroneData.name);
      expect(response.body.data.status).toBe('available');
    });

    it('❌ should reject drone creation with missing required fields', async () => {
      const invalidData = { ...validDroneData };
      delete invalidData.name;

      const response = await request(app)
        .post('/api/v1/admin/drones')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('name');
    });

    it('❌ should reject drone creation with invalid payload', async () => {
      const invalidData = { ...validDroneData, maxPayload: -5 };

      const response = await request(app)
        .post('/api/v1/admin/drones')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(invalidData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('🚁 PUT /api/v1/admin/drones/:droneId', () => {
    it('✅ should update drone status', async () => {
      const droneId = testData.drones[0]._id;
      const updateData = { status: 'maintenance' };

      const response = await request(app)
        .put(`/api/v1/admin/drones/${droneId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it('✅ should update drone location', async () => {
      const droneId = testData.drones[0]._id;
      const updateData = {
        location: {
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        }
      };

      const response = await request(app)
        .put(`/api/v1/admin/drones/${droneId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(updateData)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.location.coordinates).toEqual(updateData.location.coordinates);
    });

    it('❌ should reject update of non-existent drone', async () => {
      const fakeDroneId = '507f1f77bcf86cd799439011';
      const updateData = { status: 'maintenance' };

      const response = await request(app)
        .put(`/api/v1/admin/drones/${fakeDroneId}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(updateData)
        .expect(404);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('📈 GET /api/v1/admin/analytics', () => {
    it('✅ should return platform analytics', async () => {
      const response = await request(app)
        .get('/api/v1/admin/analytics')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('userGrowth');
      expect(response.body.data).toHaveProperty('orderTrends');
      expect(response.body.data).toHaveProperty('revenueAnalytics');
      expect(response.body.data).toHaveProperty('popularProducts');
    });

    it('✅ should filter analytics by date range', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();
      
      const response = await request(app)
        .get(`/api/v1/admin/analytics?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });

  describe('🔒 Security Tests', () => {
    it('❌ should reject SQL injection attempts', async () => {
      const maliciousData = {
        name: "'; DROP TABLE users; --",
        email: '<script>alert("xss")</script>'
      };

      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(maliciousData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject XSS payloads', async () => {
      const maliciousData = {
        name: 'Test User',
        email: '<img src="x" onerror="alert(\'xss\')">'
      };

      const response = await request(app)
        .post('/api/v1/admin/users')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .send(maliciousData)
        .expect(400);
      
      expect(response.body.success).toBe(false);
    });

    it('❌ should reject unauthorized role escalation', async () => {
      const userId = testData.users[0]._id;
      const maliciousData = { role: 'admin' };

      const response = await request(app)
        .put(`/api/v1/admin/users/${userId}`)
        .set('Authorization', `Bearer ${validUserToken}`) // Using user token
        .send(maliciousData)
        .expect(403);
      
      expect(response.body.success).toBe(false);
    });
  });

  describe('⚡ Performance Tests', () => {
    it('✅ should handle concurrent requests efficiently', async () => {
      const requests = Array(10).fill().map(() =>
        request(app)
          .get('/api/v1/admin/dashboard')
          .set('Authorization', `Bearer ${validAdminToken}`)
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });
    });

    it('✅ should handle large datasets efficiently', async () => {
      // Create many test records
      await testSeeder.seedUsers(100);
      await testSeeder.seedShops(50);

      const response = await request(app)
        .get('/api/v1/admin/users?page=1&limit=100')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(100);
      expect(response.body.pagination.totalPages).toBeGreaterThan(1);
    });

    it('✅ should handle complex queries efficiently', async () => {
      const response = await request(app)
        .get('/api/v1/admin/analytics?startDate=2023-01-01&endDate=2024-01-01&groupBy=month')
        .set('Authorization', `Bearer ${validAdminToken}`)
        .expect(200);
      
      expect(response.body.success).toBe(true);
    });
  });
});
