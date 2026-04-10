const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getUserChatGroups,
    createDirectMessageGroup,
    createChatGroup,
    getGroupMessages,
    sendMessage,
    getDirectMessagePartners,
    getAllUsers
} = require('../controllers/chatController');

// Routes that require authentication
router.get('/', authenticateToken, getUserChatGroups); // Get user's chat groups
router.get('/users', authenticateToken, getAllUsers); // Get all users (admin only)
router.post('/create-group', authenticateToken, createChatGroup); // Create new chat group
router.post('/dm', authenticateToken, createDirectMessageGroup); // Create DM group
router.get('/dm/partners', authenticateToken, getDirectMessagePartners); // Get DM partners
router.get('/group/:groupId/messages', authenticateToken, getGroupMessages); // Get messages for a group
router.post('/send', authenticateToken, sendMessage); // Send a message

module.exports = router;