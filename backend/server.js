const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// Custom infrastructure configuration imports
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize Express Engine Matrix
const app = express();

// ==========================================
// SECURITY & DEFENSIVE MIDDLEWARE
// ==========================================

// Helmet sets secure HTTP headers to mitigate scripting & injection vulnerabilities
app.use(helmet());

// Cross-Origin Resource Sharing configuration mapping client domain dynamically
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Express body parsers handling large dynamic base64 inputs (e.g., Cloudinary uploads)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Apply rate limiting defense globally to all matching api route paths
app.use('/api/', apiLimiter);

// ==========================================
// DATABASE HANDSHAKE INITIALIZATION
// ==========================================
connectDB();

// ==========================================
// CORE API ROUTING MAP NAMESPACES
// ==========================================

// Base health check endpoint to verify server responsiveness status dynamically
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Primary application structural resource route hooks
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/product.routes'));
app.use('/api/categories', require('./routes/category.routes'));
app.use('/api/cms', require('./routes/cms.routes'));
app.use('/api/coupons', require('./routes/coupon.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/inquiries', require('./routes/inquiry.routes'));
// ==========================================
// FALLBACK 404 HANDLER (SAFE FOR MODERN NODE & EXPRESS)
// ==========================================
// Hata diya gaya hai '*' string prefix jo crash kar raha tha
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

// Process-level unhandled exception mitigation listeners to safeguard continuous stream execution loop
process.on('unhandledRejection', (reason, promise) => {
  console.error(`[CRITICAL SYSTEM REJECTION]: Unhandled promise tracking alert:`, reason);
});

process.on('uncaughtException', (error) => {
  console.error(`[FATAL CALL EXCEPTION]: Execution stack collapsed:`, error.message);
  process.exit(1);
});
