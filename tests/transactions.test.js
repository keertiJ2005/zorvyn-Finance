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
let viewerToken;
let transactionId;
describe('Transaction Endpoints', () => {
    beforeAll(async () => {
        await prisma.transaction.deleteMany();
        await prisma.user.deleteMany();
        const adminRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            name: 'Txn Admin',
            email: 'txnadmin@test.com',
            password: 'password123',
            role: 'ADMIN',
        });
        adminToken = adminRes.body.data.token;
        const viewerRes = await (0, supertest_1.default)(app_1.default)
            .post('/api/auth/register')
            .send({
            name: 'Txn Viewer',
            email: 'txnviewer@test.com',
            password: 'password123',
            role: 'VIEWER',
        });
        viewerToken = viewerRes.body.data.token;
    });
    afterAll(async () => {
        await prisma.transaction.deleteMany();
        await prisma.user.deleteMany();
        await prisma.$disconnect();
    });
    describe('POST /api/transactions', () => {
        it('should create a transaction as ADMIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                amount: 50000,
                type: 'INCOME',
                category: 'Salary',
                date: '2024-06-15T00:00:00.000Z',
                description: 'June salary',
            });
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data.amount).toBe(50000);
            expect(res.body.data.type).toBe('INCOME');
            expect(res.body.data.category).toBe('Salary');
            transactionId = res.body.data.id;
        });
        it('should create another transaction for filter testing', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                amount: 5000,
                type: 'EXPENSE',
                category: 'Food',
                date: '2024-06-20T00:00:00.000Z',
                description: 'Groceries for the week',
            });
            expect(res.status).toBe(201);
        });
        it('should reject creation by VIEWER', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${viewerToken}`)
                .send({
                amount: 1000,
                type: 'EXPENSE',
                category: 'Food',
                date: '2024-06-15T00:00:00.000Z',
            });
            expect(res.status).toBe(403);
            expect(res.body.success).toBe(false);
        });
        it('should reject without auth token', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/transactions')
                .send({
                amount: 1000,
                type: 'EXPENSE',
                category: 'Food',
                date: '2024-06-15T00:00:00.000Z',
            });
            expect(res.status).toBe(401);
        });
        it('should reject invalid transaction data', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .post('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                amount: -500, // nope
                type: 'INVALID', // nope
                category: '', // double nope
            });
            expect(res.status).toBe(400);
            expect(res.body.errors).toBeDefined();
        });
    });
    describe('GET /api/transactions', () => {
        it('should fetch all transactions', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.pagination).toBeDefined();
            expect(res.body.pagination.total).toBeGreaterThanOrEqual(2);
        });
        it('should filter by type', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transactions?type=INCOME')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            res.body.data.forEach((t) => {
                expect(t.type).toBe('INCOME');
            });
        });
        it('should filter by category', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transactions?category=Food')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            res.body.data.forEach((t) => {
                expect(t.category.toLowerCase()).toContain('food');
            });
        });
        it('should support search', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transactions?search=Groceries')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThanOrEqual(1);
        });
        it('should support pagination', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transactions?page=1&limit=1')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.length).toBe(1);
            expect(res.body.pagination.page).toBe(1);
            expect(res.body.pagination.limit).toBe(1);
        });
        it('should be accessible by VIEWER', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transactions')
                .set('Authorization', `Bearer ${viewerToken}`);
            expect(res.status).toBe(200);
        });
    });
    describe('GET /api/transactions/:id', () => {
        it('should fetch a single transaction', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(transactionId);
        });
        it('should return 404 for non-existent transaction', async () => {
            // randomly generated uuid should naturally fail
            const res = await (0, supertest_1.default)(app_1.default)
                .get('/api/transactions/00000000-0000-0000-0000-000000000000')
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
    });
    describe('PATCH /api/transactions/:id', () => {
        it('should update a transaction as ADMIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                amount: 55000,
                description: 'Updated salary amount',
            });
            expect(res.status).toBe(200);
            expect(res.body.data.amount).toBe(55000);
            expect(res.body.data.description).toBe('Updated salary amount');
        });
        it('should reject update by VIEWER', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .patch(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${viewerToken}`)
                .send({ amount: 1 });
            expect(res.status).toBe(403);
        });
    });
    describe('DELETE /api/transactions/:id', () => {
        it('should soft delete a transaction as ADMIN', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(200);
            expect(res.body.data.isDeleted).toBe(true);
        });
        it('should not find a soft-deleted transaction', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .get(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).toBe(404);
        });
        it('should reject deletion by VIEWER', async () => {
            const res = await (0, supertest_1.default)(app_1.default)
                .delete(`/api/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${viewerToken}`);
            expect(res.status).toBe(403);
        });
    });
});
//# sourceMappingURL=transactions.test.js.map