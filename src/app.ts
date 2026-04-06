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

// bots kept trying to brute force passwords last week, 10 reqs per 15 mins should stop them
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), 
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10),
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Backend API',
      version: '1.0.0',
      description: 'Finance Dashboard Backend',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Transactions', description: 'Financial transaction operations' },
      { name: 'Dashboard', description: 'Dashboard analytics and summaries' },
    ],
  },
  apis: ['./src/modules/**/*.routes.ts'], // swagger pulls comments directly from here
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Finance Backend API Docs',
}));

app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// healthz endpoint for the load balancer 
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Server is running',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// catch anything else so we don't return express's ugly html 404 page
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: 'Route not found',
  });
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
    });
  }

  // usually points to a db issue or unhandled promise rejection somewhere
  console.error('Unexpected error:', err);

  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Internal server error';

  return res.status(500).json({
    success: false,
    statusCode: 500,
    message,
  });
});

if (process.env.NODE_ENV !== 'test') { // dont bind port when jest runs
  app.listen(PORT, () => {
    console.log(`\n🚀 Finance Backend Server running on http://localhost:${PORT}`);
    console.log(`📚 API Docs available at http://localhost:${PORT}/api-docs`);
    console.log(`🏥 Health check at http://localhost:${PORT}/health`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

export default app;
