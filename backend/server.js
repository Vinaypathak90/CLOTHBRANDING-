const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Custom infrastructure configuration imports
const { connectDB } = require('./config/db');
const { errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimiter');

// Centralized Routing System Modules Imports
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const couponRoutes = require('./routes/coupon.routes');
const orderRoutes = require('./routes/order.routes');
const inquiryRoutes = require('./routes/inquiry.routes');
const cartRoutes = require('./routes/cart.routes');
const cmsRoutes = require('./routes/cms.routes'); 
const wishlistRoutes = require('./routes/wishlist.routes');
const testimonialRoutes = require('./routes/testimonial.routes');

// Initialize Express Engine Matrix
const app = express();

// ==========================================
// SECURITY & DEFENSIVE MIDDLEWARE
// ==========================================
app.use(helmet());

// 🔥 FIXED CORS CONFIGURATION FOR GUEST WISHLIST OVERRIDES
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  // ✅ x-guest-uuid added into allowed headers registry array
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-uuid'] 
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
// 🕶️ INLINE ADMIN LOGIN GATEWAY
// ==========================================
app.post('/api/cms/admin-gate-login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Credential parameters are mandatory." });
    }

    const targetEmail = process.env.ADMIN_EMAIL || 'vinaypathak2772@gmail.com';
    const targetPassword = process.env.ADMIN_PASSWORD || 'vinay@123';
    const jwtSecret = process.env.JWT_SECRET || 'preeti_haute_couture_secret_matrix_2026';

    if (email === targetEmail && password === targetPassword) {
      const token = jwt.sign(
        { email: email, role: 'admin' },
        jwtSecret,
        { expiresIn: '12h' }
      );
      return res.status(200).json({ success: true, message: "Handshake verified successfully.", token });
    }
    return res.status(401).json({ success: false, message: "Invalid administrative credentials." });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal inline fault.", error: err.message });
  }
});

// ==========================================
// CORE API ROUTING MAP NAMESPACES
// ==========================================
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes); 
app.use('/api/categories', categoryRoutes);
app.use('/api/cms', cmsRoutes); 
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/testimonials', testimonialRoutes);

// ==========================================
// FALLBACK 404 HANDLER
// ==========================================
app.use((req, res, next) => {
  const error = new Error(`Requested resource pipeline mapping failed for path: ${req.originalUrl}`);
  res.status(404);
  next(error);
});

app.use(errorHandler);

// ==========================================
// APPLICATION SERVER LIFECYCLE BOOSTER
// ==========================================
const PORT = 5002; 
const server = app.listen(PORT, () => {
  console.log(`\n===============================================================`);
  console.log(`[CORE NODE LAUNCHED]: Preeti Clothing Server Active On Port: ${PORT}`);
  console.log(`[CORS LAYER FIXED]: Custom headers clearance enabled for x-guest-uuid`);
  console.log(`===============================================================\n`);
});