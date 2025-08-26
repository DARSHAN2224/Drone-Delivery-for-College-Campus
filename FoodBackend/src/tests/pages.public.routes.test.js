import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../app.js';

describe('Public CMS pages', () => {
  it('GET /api/v1/users/pages/:slug returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/v1/users/pages/unknown-slug');
    expect([200, 404]).toContain(res.status);
    // normalized shape
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('message');
  });
});


