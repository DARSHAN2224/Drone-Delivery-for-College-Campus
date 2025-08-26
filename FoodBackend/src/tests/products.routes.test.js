import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Seller Products REST (smoke)', () => {
  it('GET /api/v1/seller/products should 401 without auth', async () => {
    const res = await request(app).get('/api/v1/seller/products');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


