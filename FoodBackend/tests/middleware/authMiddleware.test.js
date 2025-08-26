import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../../src/models/userModel.js';
import { Seller } from '../../src/models/sellerModel.js';
import { Admin } from '../../src/models/adminModel.js';
import { verifyJWT, verifySellerJWT, verifyAdminJWT, checkAlreadyAuthenticated } from '../../src/middlewares/authMiddleware.js';
import { testSeeder } from '../seed.js';

describe('🔐 Authentication Middleware Tests', () => {
  let testData;
  let validUserToken, validSellerToken, validAdminToken;
  let expiredToken, invalidToken;

  beforeEach(async () => {
    // Seed test data
    testData = await testSeeder.seedAll();
    
    // Generate valid tokens
    validUserToken = jwt.sign(
      { _id: testData.users[0]._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    
    validSellerToken = jwt.sign(
      { _id: testData.sellers[0]._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    
    validAdminToken = jwt.sign(
      { _id: testData.admins[0]._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    
    // Generate expired token
    expiredToken = jwt.sign(
      { _id: testData.users[0]._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '0s' }
    );
    
    // Generate invalid token
    invalidToken = 'invalid.jwt.token';
  });

  describe('verifyJWT Middleware', () => {
    it('✅ should allow access with valid JWT token', async () => {
      const req = {
        cookies: { accessToken: validUserToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await verifyJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user._id).toEqual(testData.users[0]._id);
    });

    it('✅ should allow access with valid JWT token in Authorization header', async () => {
      const req = {
        cookies: {},
        headers: { Authorization: `Bearer ${validUserToken}` },
        user: null
      };
      const res = {};
      const next = jest.fn();

      await verifyJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user._id).toEqual(testData.users[0]._id);
    });

    it('❌ should reject request without token', async () => {
      const req = {
        cookies: {},
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with invalid token', async () => {
      const req = {
        cookies: { accessToken: invalidToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with expired token', async () => {
      const req = {
        cookies: { accessToken: expiredToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with non-existent user', async () => {
      const nonExistentUserToken = jwt.sign(
        { _id: '507f1f77bcf86cd799439011' }, // Non-existent ObjectId
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      const req = {
        cookies: { accessToken: nonExistentUserToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('✅ should set user, seller, and admin references correctly', async () => {
      // Test with user token
      const req = {
        cookies: { accessToken: validUserToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await verifyJWT(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.seller).toBeUndefined();
      expect(req.admin).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('✅ should handle seller token correctly', async () => {
      const req = {
        cookies: { accessToken: validSellerToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await verifyJWT(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.seller).toBeDefined();
      expect(req.admin).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });

    it('✅ should handle admin token correctly', async () => {
      const req = {
        cookies: { accessToken: validAdminToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await verifyJWT(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.seller).toBeUndefined();
      expect(req.admin).toBeDefined();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('verifySellerJWT Middleware', () => {
    it('✅ should allow access with valid seller JWT token', async () => {
      const req = {
        cookies: { accessToken: validSellerToken },
        headers: {},
        seller: null
      };
      const res = {};
      const next = jest.fn();

      await verifySellerJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.seller).toBeDefined();
      expect(req.seller._id).toEqual(testData.sellers[0]._id);
    });

    it('❌ should reject request with user token', async () => {
      const req = {
        cookies: { accessToken: validUserToken },
        headers: {},
        seller: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifySellerJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with admin token', async () => {
      const req = {
        cookies: { accessToken: validAdminToken },
        headers: {},
        seller: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifySellerJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request without token', async () => {
      const req = {
        cookies: {},
        headers: {},
        seller: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifySellerJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with invalid token', async () => {
      const req = {
        cookies: { accessToken: invalidToken },
        headers: {},
        seller: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifySellerJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with expired token', async () => {
      const req = {
        cookies: { accessToken: expiredToken },
        headers: {},
        seller: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifySellerJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('verifyAdminJWT Middleware', () => {
    it('✅ should allow access with valid admin JWT token', async () => {
      const req = {
        cookies: { accessToken: validAdminToken },
        headers: {},
        admin: null
      };
      const res = {};
      const next = jest.fn();

      await verifyAdminJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.admin).toBeDefined();
      expect(req.admin._id).toEqual(testData.admins[0]._id);
    });

    it('❌ should reject request with user token', async () => {
      const req = {
        cookies: { accessToken: validUserToken },
        headers: {},
        admin: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyAdminJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with seller token', async () => {
      const req = {
        cookies: { accessToken: validSellerToken },
        headers: {},
        admin: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyAdminJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request without token', async () => {
      const req = {
        cookies: {},
        headers: {},
        admin: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyAdminJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with invalid token', async () => {
      const req = {
        cookies: { accessToken: invalidToken },
        headers: {},
        admin: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyAdminJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject request with expired token', async () => {
      const req = {
        cookies: { accessToken: expiredToken },
        headers: {},
        admin: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyAdminJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('checkAlreadyAuthenticated Middleware', () => {
    it('✅ should allow access without token', async () => {
      const req = {
        cookies: {},
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await checkAlreadyAuthenticated(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('✅ should allow access with expired token', async () => {
      const req = {
        cookies: { accessToken: expiredToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await checkAlreadyAuthenticated(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('✅ should allow access with invalid token', async () => {
      const req = {
        cookies: { accessToken: invalidToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await checkAlreadyAuthenticated(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('❌ should reject already authenticated users', async () => {
      const req = {
        cookies: { accessToken: validUserToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(checkAlreadyAuthenticated(req, res, next)).rejects.toThrow('Already authenticated');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject already authenticated sellers', async () => {
      const req = {
        cookies: { accessToken: validSellerToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(checkAlreadyAuthenticated(req, res, next)).rejects.toThrow('Already authenticated');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject already authenticated admins', async () => {
      const req = {
        cookies: { accessToken: validAdminToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(checkAlreadyAuthenticated(req, res, next)).rejects.toThrow('Already authenticated');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Token Security Tests', () => {
    it('❌ should reject tokens with wrong secret', async () => {
      const wrongSecretToken = jwt.sign(
        { _id: testData.users[0]._id },
        'wrong-secret-key',
        { expiresIn: '1h' }
      );
      
      const req = {
        cookies: { accessToken: wrongSecretToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });

    it('❌ should reject malformed JWT tokens', async () => {
      const malformedTokens = [
        'not.a.jwt.token',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEifQ.invalid',
        'invalid',
        '',
        null,
        undefined
      ];

      for (const token of malformedTokens) {
        const req = {
          cookies: { accessToken: token },
          headers: {},
          user: null
        };
        const res = {};
        const next = jest.fn();

        await expect(verifyJWT(req, res, next)).rejects.toThrow('Unauthorized request');
        expect(next).not.toHaveBeenCalled();
      }
    });

    it('❌ should reject tokens with invalid payload structure', async () => {
      const invalidPayloadToken = jwt.sign(
        { invalidField: 'invalid' }, // Missing _id field
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      const req = {
        cookies: { accessToken: invalidPayloadToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('✅ should handle tokens with additional payload fields', async () => {
      const extendedPayloadToken = jwt.sign(
        { 
          _id: testData.users[0]._id,
          email: testData.users[0].email,
          role: 'user',
          extraField: 'should be ignored'
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      const req = {
        cookies: { accessToken: extendedPayloadToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await verifyJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user._id).toEqual(testData.users[0]._id);
    });

    it('✅ should handle tokens with different expiration times', async () => {
      const shortExpiryToken = jwt.sign(
        { _id: testData.users[0]._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1m' }
      );
      
      const req = {
        cookies: { accessToken: shortExpiryToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await verifyJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('✅ should handle multiple token formats in headers', async () => {
      const req = {
        cookies: {},
        headers: { 
          Authorization: 'Bearer ' + validUserToken,
          'X-Auth-Token': validUserToken // Additional token header
        },
        user: null
      };
      const res = {};
      const next = jest.fn();

      await verifyJWT(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
    });

    it('❌ should reject when user is deleted after token generation', async () => {
      // Generate token for a user
      const userToken = jwt.sign(
        { _id: testData.users[0]._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      // Delete the user
      await User.findByIdAndDelete(testData.users[0]._id);
      
      const req = {
        cookies: { accessToken: userToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      await expect(verifyJWT(req, res, next)).rejects.toThrow('Unauthorized request');
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Performance Tests', () => {
    it('✅ should handle rapid token verification requests', async () => {
      const req = {
        cookies: { accessToken: validUserToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      const startTime = Date.now();
      
      // Perform multiple rapid verifications
      const promises = Array(100).fill().map(() => 
        verifyJWT({ ...req }, { ...res }, jest.fn())
      );
      
      await Promise.all(promises);
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Should complete 100 verifications in reasonable time (less than 5 seconds)
      expect(totalTime).toBeLessThan(5000);
    });

    it('✅ should handle large payload tokens efficiently', async () => {
      const largePayload = {
        _id: testData.users[0]._id,
        email: testData.users[0].email,
        permissions: Array(1000).fill().map((_, i) => `permission_${i}`),
        metadata: {
          lastLogin: new Date(),
          preferences: Array(100).fill().map((_, i) => ({ key: `pref_${i}`, value: `value_${i}` }))
        }
      };
      
      const largeToken = jwt.sign(
        largePayload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      const req = {
        cookies: { accessToken: largeToken },
        headers: {},
        user: null
      };
      const res = {};
      const next = jest.fn();

      const startTime = Date.now();
      await verifyJWT(req, res, next);
      const endTime = Date.now();
      
      // Should complete verification in reasonable time (less than 100ms)
      expect(endTime - startTime).toBeLessThan(100);
      expect(next).toHaveBeenCalled();
    });
  });
});
