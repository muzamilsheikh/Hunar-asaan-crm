const express = require('express');
const router = express.Router();
const {
    getAllUsers,
    createUser,
    updateUserStatus,
    resetPassword
} = require('../controllers/userController');
const { authenticateToken, adminMiddleware } = require('../middleware/auth');

// Get all users (staff + students)
router.get('/', authenticateToken, getAllUsers);

// Create new staff user
router.post('/', authenticateToken, createUser);

// Update user status (activate/deactivate)
router.patch('/:id/status', authenticateToken, updateUserStatus);

// Reset user password
router.patch('/reset-password/:id', authenticateToken, adminMiddleware, resetPassword);

module.exports = router;