import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Notifications (auth required)', () => {
  it('GET /api/v1/notifications should 401 without token', async () => {
    const res = await request(app).get('/api/v1/notifications');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});


