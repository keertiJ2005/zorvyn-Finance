import request from 'supertest';
import app from '../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

let adminToken: string;
let analystToken: string;
let viewerToken: string;

describe('Dashboard Endpoints', () => {
  beforeAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();

    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dash Admin',
        email: 'dashadmin@test.com',
        password: 'password123',
        role: 'ADMIN',
      });
    adminToken = adminRes.body.data.token;

    const analystRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dash Analyst',
        email: 'dashanalyst@test.com',
        password: 'password123',
        role: 'ANALYST',
      });
    analystToken = analystRes.body.data.token;

    const viewerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Dash Viewer',
        email: 'dashviewer@test.com',
        password: 'password123',
        role: 'VIEWER',
      });
    viewerToken = viewerRes.body.data.token;

    // seeding some dummy data for the dashboard aggregates
    const transactions = [
      { amount: 50000, type: 'INCOME', category: 'Salary', date: '2024-01-15T00:00:00.000Z' },
      { amount: 10000, type: 'EXPENSE', category: 'Rent', date: '2024-01-01T00:00:00.000Z' },
      { amount: 5000, type: 'EXPENSE', category: 'Food', date: '2024-01-10T00:00:00.000Z' },
      { amount: 50000, type: 'INCOME', category: 'Salary', date: '2024-02-15T00:00:00.000Z' },
      { amount: 3000, type: 'EXPENSE', category: 'Transport', date: '2024-02-20T00:00:00.000Z' },
    ];

    for (const txn of transactions) {
      await request(app)
        .post('/api/transactions')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(txn);
    }
  });

  afterAll(async () => {
    await prisma.transaction.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return financial summary for ADMIN', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalIncome).toBeDefined();
      expect(res.body.data.totalExpenses).toBeDefined();
      expect(res.body.data.netBalance).toBeDefined();
      expect(res.body.data.totalTransactions).toBeDefined();
      expect(res.body.data.totalIncome).toBe(100000);
      expect(res.body.data.totalExpenses).toBe(18000);
      expect(res.body.data.netBalance).toBe(82000);
    });

    it('should be accessible by VIEWER', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
    });

    it('should be accessible by ANALYST', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/dashboard/category-breakdown', () => {
    it('should return category breakdown for ADMIN', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.categories).toBeDefined();
      expect(Array.isArray(res.body.data.categories)).toBe(true);
      expect(res.body.data.categories.length).toBeGreaterThan(0);

      res.body.data.categories.forEach((cat: { category: string; total: number; type: string }) => {
        expect(cat.category).toBeDefined();
        expect(cat.total).toBeDefined();
        expect(cat.type).toBeDefined();
      });
    });

    it('should be accessible by ANALYST', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${analystToken}`);

      expect(res.status).toBe(200);
    });

    it('should be forbidden for VIEWER', async () => {
      const res = await request(app)
        .get('/api/dashboard/category-breakdown')
        .set('Authorization', `Bearer ${viewerToken}`);

      // viewer tried to peek at detailed stats
      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/monthly-trends', () => {
    it('should return monthly trends for ADMIN', async () => {
      const res = await request(app)
        .get('/api/dashboard/monthly-trends')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.trends).toBeDefined();
      expect(Array.isArray(res.body.data.trends)).toBe(true);

      res.body.data.trends.forEach((trend: { month: string; income: number; expense: number; net: number }) => {
        expect(trend.month).toBeDefined();
        expect(typeof trend.income).toBe('number');
        expect(typeof trend.expense).toBe('number');
        expect(typeof trend.net).toBe('number');
      });
    });

    it('should be forbidden for VIEWER', async () => {
      const res = await request(app)
        .get('/api/dashboard/monthly-trends')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/dashboard/recent-activity', () => {
    it('should return recent transactions', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.recentTransactions).toBeDefined();
      expect(Array.isArray(res.body.data.recentTransactions)).toBe(true);
      expect(res.body.data.recentTransactions.length).toBeLessThanOrEqual(10);
    });

    it('should be accessible by VIEWER', async () => {
      const res = await request(app)
        .get('/api/dashboard/recent-activity')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/dashboard/weekly-summary', () => {
    it('should return weekly summary for ADMIN', async () => {
      const res = await request(app)
        .get('/api/dashboard/weekly-summary')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalIncome).toBeDefined();
      expect(res.body.data.totalExpenses).toBeDefined();
      expect(res.body.data.netBalance).toBeDefined();
      expect(res.body.data.transactionCount).toBeDefined();
      expect(res.body.data.startDate).toBeDefined();
      expect(res.body.data.endDate).toBeDefined();
    });

    it('should be forbidden for VIEWER', async () => {
      const res = await request(app)
        .get('/api/dashboard/weekly-summary')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('Unauthenticated access', () => {
    it('should reject dashboard access without token', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.status).toBe(401);
    });
  });
});
