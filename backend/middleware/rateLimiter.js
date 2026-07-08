const rateLimit = require('express-rate-limit');

// 1. General API Limiter (Standard safe limit)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per IP is enough for normal usage
  standardHeaders: true, 
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again after 15 minutes.'
  }
});

// 2. Auth Limiter (Strict limit for Login/Signup)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Sirf 5 attempts allowed in 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

module.exports = { apiLimiter, loginLimiter };