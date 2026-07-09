const jwt = require('jsonwebtoken');

// ====================================================================
// 1. NORMAL USER CRM GUARD (Verifies standard shop users)
// ====================================================================
exports.verifyUserAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user payload to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }
};

// ====================================================================
// 2. STRICT SUPERADMIN GUARD (Your existing CRM clearance)
// ====================================================================
exports.verifyAdminClearance = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Admin clearance required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
    
    if (decoded.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Unauthorized system access.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Admin session expired or invalid.' });
  }
};

// ====================================================================
// 3. CMS & ORDER DESK ADMIN GUARD (Added for our new Admin Dashboard)
// ====================================================================
exports.verifyCmsAdminToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn("⚠️ [CMS GUARD]: Token missing in request headers.");
      return res.status(401).json({ success: false, message: "Access denied. Token missing." });
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET || 'preeti_haute_couture_secret_matrix_2026';
    
    // Decode and verify the token signature
    const decoded = jwt.verify(token, jwtSecret);
    
    // Get both admin emails from .env
    const adminEmail1 = process.env.ADMIN_EMAIL_1;
    const adminEmail2 = process.env.ADMIN_EMAIL_2;
    
    // 🔥 FIX: Role check ke saath dono admin emails ko verify karo
    const isAuthorizedAdmin = (decoded.email === adminEmail1 || decoded.email === adminEmail2);
    
    if (decoded.role === 'admin' && isAuthorizedAdmin) {
      req.admin = decoded;
      return next(); // Token verified! Move to controller
    }

    console.warn("⚠️ [CMS GUARD]: Token payload validation failed for:", decoded.email);
    return res.status(403).json({ success: false, message: "Forbidden. Invalid admin clearance." });

  } catch (err) {
    console.error("❌ [CMS GUARD ERROR]:", err.message);
    return res.status(401).json({ success: false, message: "Unauthorized. Session expired or corrupted token." });
  }
};