const jwt = require('jsonwebtoken');
const { User } = require('../models');

require('dotenv').config({ path: __dirname + '/../.env' });
const JWT_SECRET = process.env.JWT_SECRET || 'hunar_asaan_jwt_secret_2026';

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: ['id', 'name', 'email', 'role']
        });
        
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        // Log specific error details
        if (error.name === 'JsonWebTokenError') {
            console.error('JWT Error - Invalid token format:', error.message);
            return res.status(403).json({ error: 'Invalid token format', details: error.message });
        } else if (error.name === 'TokenExpiredError') {
            console.error('JWT Error - Token expired:', error.message);
            return res.status(403).json({ error: 'Token expired', details: error.message });
        } else if (error.name === 'NotBeforeError') {
            console.error('JWT Error - Token not active yet:', error.message);
            return res.status(403).json({ error: 'Token not active yet', details: error.message });
        } else {
            console.error('JWT Error - Unknown error:', error.message);
            return res.status(403).json({ error: 'Invalid or expired token', details: error.message });
        }
    }
};

const adminMiddleware = (req, res, next) => {
    // Requires authenticateToken to be run first so req.user exists
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        return res.status(403).json({ error: 'Access denied: Admin role required' });
    }
};

module.exports = { authenticateToken, adminMiddleware };