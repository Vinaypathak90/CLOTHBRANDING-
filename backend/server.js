const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Custom infrastructure configuration imports
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Centralized Routing System Modules Imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const cmsRoutes = require('./routes/cms.routes');
const couponRoutes = require('./routes/coupon.routes');
const orderRoutes = require('./routes/order.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const cartRoutes = require('./routes/cart.routes');

// Initialize Express Engine Matrix
const app = express();

// ==========================================
// SECURITY & DEFENSIVE MIDDLEWARE
// ==========================================
app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers handling dynamic allocations safely
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Apply rate limiting defense globally to all matching api paths
app.use('/api/', apiLimiter);

// ==========================================
// DATABASE HANDSHAKE INITIALIZATION
// ==========================================
connectDB();

// ==========================================
// CORE API ROUTING MAP NAMESPACES
// ==========================================

// Base health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Primary application structural resource route hooks (Cleaned & De-duplicated)
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); // 🔥 Clean singular allocation mapping
app.use('/api/categories', categoryRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/cart', cartRoutes);

// ==========================================
// FALLBACK 404 HANDLER
// ==========================================
app.use((req, res, next) => {
  const error = new Error(`Requested resource pipeline mapping failed for path: ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// ==========================================
// GLOBAL EXCEPTION & ERROR INTERCEPTOR
// ==========================================
app.use(errorHandler);

// ==========================================
// APPLICATION SERVER LIFECYCLE BOOSTER
// ==========================================
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n===============================================================`);
  console.log(`[CORE NODE LAUNCHED]: Preeti Clothing Server Active On Port: ${PORT}`);
  console.log(`[ENVIRONMENT]: Production Pipeline Structural Checks Enabled`);
  console.log(`===============================================================\n`);
});

// Process-level exception listeners
process.on('unhandledRejection', (reason, promise) => {
  console.error(`[CRITICAL SYSTEM REJECTION]: Unhandled promise tracking alert:`, reason);
});

process.on('uncaughtException', (error) => {
  console.error(`[FATAL CALL EXCEPTION]: Execution stack collapsed:`, error.message);
  process.exit(1);
});