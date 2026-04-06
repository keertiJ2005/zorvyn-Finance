import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/user.routes';
import transactionRoutes from './modules/transactions/transaction.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import { AppError } from './utils/errors.util';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// ✅ BASE URL (USE EVERYWHERE)
const BASE_URL =
  process.env.BASE_URL ||
  `http://localhost:${PORT}`;

// ✅ CORS CONFIG
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowAnyOrigin = allowedOrigins.includes('*');

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowAnyOrigin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ✅ RATE LIMITER
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ SWAGGER CONFIG
const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Backend API',
      version: '1.0.0',
      description: 'Finance Dashboard Backend',
    },
    servers: [
      {
        url: BASE_URL,
        description: 'Current server',
      },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// ✅ SWAGGER UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
  })
);

// ✅ ROOT ROUTE
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🚀 Finance Backend API is running!',
  });
});

// ✅ SWAGGER JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ✅ HEALTH CHECK
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// ✅ ROUTES
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ✅ 404 HANDLER
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Route ${_req.originalUrl} not found`,
  });
});

// ✅ ERROR HANDLER
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
  });
});

// ✅ START SERVER
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🚀 Finance Backend Server running on ${BASE_URL}`);
    console.log(`📚 API Docs available at ${BASE_URL}/api-docs`);
    console.log(`🏥 Health check at ${BASE_URL}/health`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

export default app;