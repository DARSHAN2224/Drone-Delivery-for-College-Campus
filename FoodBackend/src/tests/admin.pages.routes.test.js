import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Admin Pages - guards', () => {
  it('GET /api/v1/admin/pages should 401 without admin token', async () => {
    const res = await request(app).get('/api/v1/admin/pages');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


