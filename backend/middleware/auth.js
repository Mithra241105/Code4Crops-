const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret_change_in_production');

        const user = await User.findById(decoded.userId).select('-passwordHash -otp -otpExpiry');
        if (!user) return res.status(401).json({ error: 'User not found' });
        if (!user.isVerified) return res.status(403).json({ error: 'Email not verified' });

        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError') return res.status(401).json({ error: 'Invalid token' });
        if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
        next(err);
    }
};

const requireRole = (role) => (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (req.user.role !== role) return res.status(403).json({ error: `Access denied. Requires ${role} role.` });
    next();
};

module.exports = { requireAuth, requireRole };
