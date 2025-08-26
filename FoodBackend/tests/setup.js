import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env.test') });

// Global test setup
let mongoServer;

beforeAll(async () => {
  // Start in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to test database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
  process.env.ACCESS_TOKEN_SECRET = 'test-access-token-secret-for-testing-only';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-for-testing-only';
  process.env.OPENWEATHER_API_KEY = 'test-weather-api-key';
  process.env.CLIENT_ORIGIN = 'http://localhost:3000';
});

afterAll(async () => {
  // Close database connection
  await mongoose.connection.close();
  
  // Stop in-memory MongoDB server
  if (mongoServer) {
    await mongoServer.stop();
  }
});

beforeEach(async () => {
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
global.testUtils = {
  // Generate test JWT tokens
  generateTestToken: (payload, secret = process.env.ACCESS_TOKEN_SECRET) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(payload, secret, { expiresIn: '1h' });
  },
  
  // Generate test user data
  generateTestUser: () => ({
    username: 'testuser',
    email: 'test@example.com',
    password: 'TestPassword123!',
    fullName: 'Test User',
    phone: '+1234567890'
  }),
  
  // Generate test seller data
  generateTestSeller: () => ({
    username: 'testseller',
    email: 'seller@example.com',
    password: 'TestPassword123!',
    fullName: 'Test Seller',
    phone: '+1234567890',
    businessName: 'Test Business',
    businessType: 'restaurant'
  }),
  
  // Generate test admin data
  generateTestAdmin: () => ({
    username: 'testadmin',
    email: 'admin@example.com',
    password: 'TestPassword123!',
    fullName: 'Test Admin',
    phone: '+1234567890',
    role: 'admin'
  }),
  
  // Generate test shop data
  generateTestShop: (sellerId) => ({
    name: 'Test Shop',
    description: 'A test shop for testing purposes',
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    zipCode: '12345',
    phone: '+1234567890',
    seller: sellerId,
    isApproved: false
  }),
  
  // Generate test product data
  generateTestProduct: (shopId) => ({
    name: 'Test Product',
    description: 'A test product for testing purposes',
    price: 9.99,
    category: 'food',
    available: true,
    shop: shopId,
    isApproved: false
  }),
  
  // Generate test order data
  generateTestOrder: (userId, shopId) => ({
    user: userId,
    shop: shopId,
    items: [
      {
        product: 'test-product-id',
        quantity: 2,
        price: 9.99
      }
    ],
    totalAmount: 19.98,
    deliveryAddress: '123 Test Street, Test City, TS 12345',
    deliveryType: 'regular'
  }),
  
  // Generate test drone data
  generateTestDrone: () => ({
    name: 'Test Drone',
    model: 'Test Model',
    status: 'available',
    batteryLevel: 100,
    currentLocation: {
      lat: 40.7128,
      lng: -74.0060
    },
    maxPayload: 2.5,
    maxRange: 10
  }),
  
  // Mock request object
  mockRequest: (overrides = {}) => ({
    body: {},
    query: {},
    params: {},
    headers: {},
    cookies: {},
    user: null,
    seller: null,
    admin: null,
    ...overrides
  }),
  
  // Mock response object
  mockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.cookie = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    return res;
  },
  
  // Mock next function
  mockNext: jest.fn(),
  
  // Wait for async operations
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Create test database connection
  createTestConnection: async () => {
    const testServer = await MongoMemoryServer.create();
    const uri = testServer.getUri();
    const connection = await mongoose.createConnection(uri);
    return { connection, server: testServer };
  }
};

// Mock external services
jest.mock('../src/utils/emails.js', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true),
  sendOrderConfirmationEmail: jest.fn().mockResolvedValue(true)
}));

jest.mock('../src/utils/weatherAPI.js', () => ({
  checkWeatherConditions: jest.fn().mockResolvedValue({
    safe: true,
    temperature: 20,
    windSpeed: 5,
    visibility: 10
  })
}));

jest.mock('../src/utils/cloudinary.js', () => ({
  uploadImage: jest.fn().mockResolvedValue({
    url: 'https://test-image-url.com/test.jpg',
    public_id: 'test-public-id'
  }),
  deleteImage: jest.fn().mockResolvedValue(true)
}));

// Console error suppression for tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

export default global.testUtils;
