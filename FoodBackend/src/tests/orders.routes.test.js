import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('User Orders - guards', () => {
  it('GET /api/v1/users/orders should 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/orders');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/users/orders/:id should 401 without token', async () => {
    const res = await request(app).get('/api/v1/users/orders/someid');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


