"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../src/app"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let adminToken;
let analystToken;
let viewerToken;
describe('Dashboard Endpoints', () => {
    beforeAll(async () => {
        await prisma.transaction.deleteMany();
        await prisma.user.deleteMany();
        const adminRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            name: 'Dash Admin',
            email: 'dashadmin@test.com',
            password: 'password123',
            role: 'ADMIN',
        });
        adminToken = adminRes.body.data.token;
        const analystRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            name: 'Dash Analyst',
            email: 'dashanalyst@test.com',
            password: 'password123',
            role: 'ANALYST',
        });
        analystToken = analystRes.body.data.token;
        const viewerRes = await (0, supertest_1.default)(app_1.default)
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
            await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/summary')
                .set('Authorization', `Bearer ${viewerToken}`);
            expect(res.status).toBe(200);
        });
        it('should be accessible by ANALYST', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/summary')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(res.status).toBe(200);
        });
    });
    describe('GET /api/dashboard/category-breakdown', () => {
        it('should return category breakdown for ADMIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/category-breakdown')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.categories).toBeDefined();
            expect(Array.isArray(res.body.data.categories)).toBe(true);
            expect(res.body.data.categories.length).toBeGreaterThan(0);
            res.body.data.categories.forEach((cat) => {
                expect(cat.category).toBeDefined();
                expect(cat.total).toBeDefined();
                expect(cat.type).toBeDefined();
            });
        });
        it('should be accessible by ANALYST', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/category-breakdown')
                .set('Authorization', `Bearer ${analystToken}`);
            expect(res.status).toBe(200);
        });
        it('should be forbidden for VIEWER', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/category-breakdown')
                .set('Authorization', `Bearer ${viewerToken}`);
            // viewer tried to peek at detailed stats
            expect(res.status).toBe(403);
        });
    });
    describe('GET /api/dashboard/monthly-trends', () => {
        it('should return monthly trends for ADMIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/monthly-trends')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.trends).toBeDefined();
            expect(Array.isArray(res.body.data.trends)).toBe(true);
            res.body.data.trends.forEach((trend) => {
                expect(trend.month).toBeDefined();
                expect(typeof trend.income).toBe('number');
                expect(typeof trend.expense).toBe('number');
                expect(typeof trend.net).toBe('number');
            });
        });
        it('should be forbidden for VIEWER', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/monthly-trends')
                .set('Authorization', `Bearer ${viewerToken}`);
            expect(res.status).toBe(403);
        });
    });
    describe('GET /api/dashboard/recent-activity', () => {
        it('should return recent transactions', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/recent-activity')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.recentTransactions).toBeDefined();
            expect(Array.isArray(res.body.data.recentTransactions)).toBe(true);
            expect(res.body.data.recentTransactions.length).toBeLessThanOrEqual(10);
        });
        it('should be accessible by VIEWER', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/recent-activity')
                .set('Authorization', `Bearer ${viewerToken}`);
            expect(res.status).toBe(200);
        });
    });
    describe('GET /api/dashboard/weekly-summary', () => {
        it('should return weekly summary for ADMIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
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
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/dashboard/weekly-summary')
                .set('Authorization', `Bearer ${viewerToken}`);
            expect(res.status).toBe(403);
        });
    });
    describe('Unauthenticated access', () => {
        it('should reject dashboard access without token', async () => {
            const res = await (0, supertest_1.default)(app_1.default).get('/api/dashboard/summary');
            expect(res.status).toBe(401);
        });
    });
});
//# sourceMappingURL=dashboard.test.js.map