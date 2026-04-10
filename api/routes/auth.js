const express = require('express');
const router = express.Router();
const { login, register, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/signup (alias for register)
router.post('/signup', register);

// GET /api/auth/me (get current user profile)
router.get('/me', authenticateToken, getProfile);

// POST /api/auth/register (alias used by AppContext.registerUser)
router.post('/register', register);

module.exports = router;