// Simple admin clearance middleware
// This checks for `req.user` and a `role` of 'superadmin'.
// In production, wire this to your authentication/session layer.

const verifyAdminClearance = (req, res, next) => {
	try {
		// If authentication middleware isn't populating req.user yet,
		// allow through for now in local development. Adjust as needed.
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication required.' });
		}

		if (req.user.role !== 'superadmin') {
			return res.status(403).json({ message: 'Access Denied: Insufficient privileges.' });
		}

		next();
	} catch (err) {
		next(err);
	}
};

// Minimal client token verifier used for protected client routes
const verifyClientToken = (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication required.' });
		}
		next();
	} catch (err) {
		next(err);
	}
};

module.exports = { verifyAdminClearance, verifyClientToken };
