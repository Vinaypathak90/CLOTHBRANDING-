const jwt = require('jsonwebtoken');

// Verifies standard shop users
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

// Verifies Admin CRM clearance
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