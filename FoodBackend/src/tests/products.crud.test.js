import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';
import mongoose from 'mongoose';
import { setupTestDB, teardownTestDB } from './setup.test.env.js';
import { createUserWithToken } from './auth.helpers.js';
import { Shop } from '../models/shopModel.js';

describe('Seller Products CRUD (auth)', () => {
  let sellerToken;
  let shopId;

  beforeAll(async () => {
    await setupTestDB();
    const { doc, token } = await createUserWithToken('seller');
    sellerToken = token;
    const shop = await Shop.create({ sellerId: doc._id, name: 'Test Shop', state: 'ST', city: 'CT', location: 'LOC', isActive: true });
    shopId = shop._id;
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  it('POST /seller/products creates product (201)', async () => {
    const res = await request(app)
      .post('/api/v1/seller/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .field('name', 'Prod A')
      .field('description', 'Desc')
      .field('price', '10.5');
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.product).toBeTruthy();
  });

  it('GET /seller/products returns list (200)', async () => {
    const res = await request(app)
      .get('/api/v1/seller/products')
      .set('Authorization', `Bearer ${sellerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});


