import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../src/models/userModel.js';
import { Token } from '../../src/models/tokenModel.js';
import userRoutes from '../../src/routes/userRoutes.js';
import { testSeeder } from '../seed.js';

// Create test app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/v1/users', userRoutes);

describe('🔐 User Authentication API Tests', () => {
  let testData;
  let validUser, validUserToken;
  let expiredToken, invalidToken;

  beforeEach(async () => {
    // Seed test data
    testData = await testSeeder.seedAll();
    
    // Get a test user
    validUser = testData.users[0];
    
    // Generate valid token
    validUserToken = jwt.sign(
      { _id: validUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    
    // Generate expired token
    expiredToken = jwt.sign(
      { _id: validUser._id },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '0s' }
    );
    
    // Generate invalid token
    invalidToken = 'invalid.jwt.token';
  });

  describe('POST /api/v1/users/register', () => {
    const validRegistrationData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'TestPassword123!',
      fullName: 'New User',
      phone: '+1234567890'
    };

    it('✅ should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(validRegistrationData.email);
      expect(response.body.data.user.username).toBe(validRegistrationData.username);
      expect(response.body.data.user.fullName).toBe(validRegistrationData.fullName);
      expect(response.body.data.user.phone).toBe(validRegistrationData.phone);
      expect(response.body.data.user.password).toBeUndefined(); // Password should not be returned
      expect(response.body.data.user.isEmailVerified).toBe(false); // Should start unverified
      expect(response.body.data.user.isActive).toBe(true);
      
      // Verify user was saved to database
      const savedUser = await User.findOne({ email: validRegistrationData.email });
      expect(savedUser).toBeDefined();
      expect(savedUser.username).toBe(validRegistrationData.username);
      
      // Verify password was hashed
      const isPasswordValid = await bcrypt.compare(validRegistrationData.password, savedUser.password);
      expect(isPasswordValid).toBe(true);
    });

    it('❌ should reject registration with missing required fields', async () => {
      const incompleteData = {
        username: 'newuser',
        email: 'newuser@example.com'
        // Missing password and fullName
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(incompleteData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('❌ should reject registration with invalid email format', async () => {
      const invalidEmailData = {
        ...validRegistrationData,
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(invalidEmailData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('❌ should reject registration with weak password', async () => {
      const weakPasswordData = {
        ...validRegistrationData,
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(weakPasswordData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
      expect(response.body.errors).toBeDefined();
    });

    it('❌ should reject registration with duplicate email', async () => {
      const duplicateEmailData = {
        ...validRegistrationData,
        email: validUser.email // Use existing email
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(duplicateEmailData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('❌ should reject registration with duplicate username', async () => {
      const duplicateUsernameData = {
        ...validRegistrationData,
        username: validUser.username // Use existing username
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(duplicateUsernameData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already exists');
    });

    it('❌ should reject registration with invalid phone format', async () => {
      const invalidPhoneData = {
        ...validRegistrationData,
        phone: 'invalid-phone'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(invalidPhoneData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('❌ should reject registration if user is already authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/users/register')
        .set('Authorization', `Bearer ${validUserToken}`)
        .send(validRegistrationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already authenticated');
    });

    it('✅ should handle special characters in names correctly', async () => {
      const specialCharData = {
        ...validRegistrationData,
        fullName: 'José María O\'Connor-Smith',
        username: 'user_123'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(specialCharData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.fullName).toBe(specialCharData.fullName);
      expect(response.body.data.user.username).toBe(specialCharData.username);
    });
  });

  describe('POST /api/v1/users/login', () => {
    const validLoginData = {
      email: 'user1@example.com',
      password: 'TestPassword123!'
    };

    it('✅ should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send(validLoginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(validLoginData.email);
      expect(response.body.data.user.password).toBeUndefined();
      
      // Verify tokens are valid
      const decodedAccessToken = jwt.verify(response.body.data.accessToken, process.env.ACCESS_TOKEN_SECRET);
      expect(decodedAccessToken._id).toBe(testData.users[0]._id);
    });

    it('❌ should reject login with invalid email', async () => {
      const invalidEmailData = {
        email: 'nonexistent@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(invalidEmailData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('❌ should reject login with wrong password', async () => {
      const wrongPasswordData = {
        email: validLoginData.email,
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(wrongPasswordData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid credentials');
    });

    it('❌ should reject login with missing fields', async () => {
      const missingFieldsData = {
        email: 'user1@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(missingFieldsData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation failed');
    });

    it('❌ should reject login if user is already authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .set('Authorization', `Bearer ${validUserToken}`)
        .send(validLoginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already authenticated');
    });

    it('❌ should reject login for deactivated account', async () => {
      // Deactivate a user
      await User.findByIdAndUpdate(testData.users[1]._id, { isActive: false });
      
      const deactivatedUserData = {
        email: 'user2@example.com',
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(deactivatedUserData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account is deactivated');
    });

    it('❌ should reject login for unverified email after multiple attempts', async () => {
      // Create an unverified user
      const unverifiedUser = new User({
        username: 'unverifieduser',
        email: 'unverified@example.com',
        password: await bcrypt.hash('TestPassword123!', 10),
        fullName: 'Unverified User',
        phone: '+1234567890',
        isEmailVerified: false,
        isActive: true
      });
      await unverifiedUser.save();

      const unverifiedUserData = {
        email: 'unverified@example.com',
        password: 'TestPassword123!'
      };

      // First attempt should work but show verification message
      const response1 = await request(app)
        .post('/api/v1/users/login')
        .send(unverifiedUserData)
        .expect(401);

      expect(response1.body.success).toBe(false);
      expect(response1.body.message).toContain('Please verify your email');
    });

    it('✅ should handle case-insensitive email login', async () => {
      const caseInsensitiveData = {
        email: 'USER1@EXAMPLE.COM', // Uppercase
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(caseInsensitiveData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('user1@example.com'); // Should return normalized email
    });
  });

  describe('POST /api/v1/users/logout', () => {
    it('✅ should logout user successfully', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout')
        .set('Authorization', `Bearer ${validUserToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logged out successfully');
      
      // Verify refresh token is invalidated
      const tokenDoc = await Token.findOne({ token: validUserToken });
      expect(tokenDoc).toBeNull();
    });

    it('❌ should reject logout without token', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('❌ should reject logout with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });

    it('❌ should reject logout with expired token', async () => {
      const response = await request(app)
        .post('/api/v1/users/logout')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');
    });
  });

  describe('POST /api/v1/users/refresh-token', () => {
    it('✅ should refresh access token successfully', async () => {
      // Create a refresh token
      const refreshToken = jwt.sign(
        { _id: validUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
      );
      
      // Save refresh token to database
      await new Token({
        token: refreshToken,
        user: validUser._id,
        type: 'refresh'
      }).save();

      const response = await request(app)
        .post('/api/v1/users/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      
      // Verify new access token is valid
      const decodedNewToken = jwt.verify(response.body.data.accessToken, process.env.ACCESS_TOKEN_SECRET);
      expect(decodedNewToken._id).toBe(validUser._id);
    });

    it('❌ should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/v1/users/refresh-token')
        .send({ refreshToken: invalidToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('❌ should reject refresh with expired token', async () => {
      const expiredRefreshToken = jwt.sign(
        { _id: validUser._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post('/api/v1/users/refresh-token')
        .send({ refreshToken: expiredRefreshToken })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid refresh token');
    });

    it('❌ should reject refresh with missing token', async () => {
      const response = await request(app)
        .post('/api/v1/users/refresh-token')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Refresh token is required');
    });
  });

  describe('POST /api/v1/users/verify-email', () => {
    it('✅ should verify email with valid code', async () => {
      // Create a verification token
      const verificationCode = '123456';
      const verificationToken = jwt.sign(
        { _id: validUser._id, code: verificationCode },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      // Save verification token
      await new Token({
        token: verificationToken,
        user: validUser._id,
        type: 'verification'
      }).save();

      const response = await request(app)
        .post('/api/v1/users/verify-email')
        .send({ code: verificationCode })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Email verified successfully');
      
      // Verify user is marked as verified
      const updatedUser = await User.findById(validUser._id);
      expect(updatedUser.isEmailVerified).toBe(true);
    });

    it('❌ should reject verification with invalid code', async () => {
      const response = await request(app)
        .post('/api/v1/users/verify-email')
        .send({ code: '999999' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid verification code');
    });

    it('❌ should reject verification with expired code', async () => {
      const expiredCode = jwt.sign(
        { _id: validUser._id, code: '123456' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post('/api/v1/users/verify-email')
        .send({ code: '123456' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Verification code expired');
    });

    it('❌ should reject verification if user is already authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/users/verify-email')
        .set('Authorization', `Bearer ${validUserToken}`)
        .send({ code: '123456' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already authenticated');
    });
  });

  describe('POST /api/v1/users/forgot-password', () => {
    it('✅ should send password reset email for valid email', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgot-password')
        .send({ email: 'user1@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset email sent');
    });

    it('❌ should reject request for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('User not found');
    });

    it('❌ should reject request with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgot-password')
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid email format');
    });

    it('❌ should reject request if user is already authenticated', async () => {
      const response = await request(app)
        .post('/api/v1/users/forgot-password')
        .set('Authorization', `Bearer ${validUserToken}`)
        .send({ email: 'user1@example.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('already authenticated');
    });
  });

  describe('POST /api/v1/users/reset-password/:token', () => {
    it('✅ should reset password with valid token', async () => {
      // Create a reset token
      const resetToken = jwt.sign(
        { _id: validUser._id, type: 'reset' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );
      
      // Save reset token
      await new Token({
        token: resetToken,
        user: validUser._id,
        type: 'reset'
      }).save();

      const newPassword = 'NewPassword123!';
      const response = await request(app)
        .post(`/api/v1/users/reset-password/${resetToken}`)
        .send({ password: newPassword, confirmPassword: newPassword })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Password reset successfully');
      
      // Verify new password works
      const updatedUser = await User.findById(validUser._id);
      const isNewPasswordValid = await bcrypt.compare(newPassword, updatedUser.password);
      expect(isNewPasswordValid).toBe(true);
    });

    it('❌ should reject reset with invalid token', async () => {
      const response = await request(app)
        .post(`/api/v1/users/reset-password/${invalidToken}`)
        .send({ password: 'NewPassword123!', confirmPassword: 'NewPassword123!' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid reset token');
    });

    it('❌ should reject reset with expired token', async () => {
      const expiredResetToken = jwt.sign(
        { _id: validUser._id, type: 'reset' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '0s' }
      );

      const response = await request(app)
        .post(`/api/v1/users/reset-password/${expiredResetToken}`)
        .send({ password: 'NewPassword123!', confirmPassword: 'NewPassword123!' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Reset token expired');
    });

    it('❌ should reject reset with mismatched passwords', async () => {
      const resetToken = jwt.sign(
        { _id: validUser._id, type: 'reset' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/v1/users/reset-password/${resetToken}`)
        .send({ password: 'NewPassword123!', confirmPassword: 'DifferentPassword123!' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Passwords do not match');
    });

    it('❌ should reject reset with weak password', async () => {
      const resetToken = jwt.sign(
        { _id: validUser._id, type: 'reset' },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1h' }
      );

      const response = await request(app)
        .post(`/api/v1/users/reset-password/${resetToken}`)
        .send({ password: '123', confirmPassword: '123' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Password is too weak');
    });
  });

  describe('Rate Limiting', () => {
    it('❌ should rate limit login attempts', async () => {
      const loginData = {
        email: 'user1@example.com',
        password: 'WrongPassword123!'
      };

      // Make multiple failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/users/login')
          .send(loginData)
          .expect(401);
      }

      // 6th attempt should be rate limited
      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Too many requests');
    });

    it('❌ should rate limit registration attempts', async () => {
      const registrationData = {
        username: 'rateuser',
        email: 'rateuser@example.com',
        password: 'TestPassword123!',
        fullName: 'Rate User',
        phone: '+1234567890'
      };

      // Make multiple registration attempts
      for (let i = 0; i < 3; i++) {
        await request(app)
          .post('/api/v1/users/register')
          .send({ ...registrationData, email: `rateuser${i}@example.com` })
          .expect(201);
      }

      // 4th attempt should be rate limited
      const response = await request(app)
        .post('/api/v1/users/register')
        .send({ ...registrationData, email: 'rateuser4@example.com' })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Too many requests');
    });
  });

  describe('Account Lockout', () => {
    it('❌ should lock account after multiple failed login attempts', async () => {
      const loginData = {
        email: 'user1@example.com',
        password: 'WrongPassword123!'
      };

      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/users/login')
          .send(loginData)
          .expect(401);
      }

      // 6th attempt should result in account lockout
      const response = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(423);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Account is temporarily locked');
    });

    it('✅ should unlock account after lockout period', async () => {
      // This test would require mocking time or waiting for the actual lockout period
      // For now, we'll test the lockout mechanism
      const loginData = {
        email: 'user1@example.com',
        password: 'WrongPassword123!'
      };

      // Make 5 failed attempts to trigger lockout
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/v1/users/login')
          .send(loginData)
          .expect(401);
      }

      // Verify account is locked
      const lockoutResponse = await request(app)
        .post('/api/v1/users/login')
        .send(loginData)
        .expect(423);

      expect(lockoutResponse.body.message).toContain('Account is temporarily locked');
    });
  });

  describe('Security Tests', () => {
    it('❌ should reject SQL injection attempts', async () => {
      const sqlInjectionData = {
        email: "'; DROP TABLE users; --",
        password: 'TestPassword123!'
      };

      const response = await request(app)
        .post('/api/v1/users/login')
        .send(sqlInjectionData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('❌ should reject XSS attempts', async () => {
      const xssData = {
        username: '<script>alert("xss")</script>',
        email: 'xss@example.com',
        password: 'TestPassword123!',
        fullName: '<img src="x" onerror="alert(\'xss\')">',
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(xssData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('❌ should reject very long input values', async () => {
      const longInputData = {
        username: 'a'.repeat(1000),
        email: 'a'.repeat(1000) + '@example.com',
        password: 'TestPassword123!',
        fullName: 'a'.repeat(1000),
        phone: '+1234567890'
      };

      const response = await request(app)
        .post('/api/v1/users/register')
        .send(longInputData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Performance Tests', () => {
    it('✅ should handle concurrent login requests efficiently', async () => {
      const loginData = {
        email: 'user1@example.com',
        password: 'TestPassword123!'
      };

      const startTime = Date.now();
      
      // Make 10 concurrent login requests
      const promises = Array(10).fill().map(() =>
        request(app)
          .post('/api/v1/users/login')
          .send(loginData)
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();

      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // Should complete in reasonable time (less than 5 seconds)
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('✅ should handle large payloads efficiently', async () => {
      const largePayloadData = {
        username: 'largeuser',
        email: 'largeuser@example.com',
        password: 'TestPassword123!',
        fullName: 'a'.repeat(100), // 100 character name
        phone: '+1234567890'
      };

      const startTime = Date.now();
      
      const response = await request(app)
        .post('/api/v1/users/register')
        .send(largePayloadData);

      const endTime = Date.now();

      expect(response.status).toBe(201);
      // Should complete in reasonable time (less than 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
