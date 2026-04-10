const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getLiveClassByBatch,
    getLiveClassById,
    getAllLiveClasses,
    createOrUpdateLiveClass,
    updateLiveClass,
    deleteLiveClass,
    getLiveSessionForStudent
} = require('../controllers/liveClassController');

// Admin routes (require authentication)
router.post('/', authenticateToken, createOrUpdateLiveClass); // Create or update live class
router.put('/:id', authenticateToken, updateLiveClass); // Update live class by ID
router.delete('/:id', authenticateToken, deleteLiveClass); // Delete live class
router.get('/', authenticateToken, getAllLiveClasses); // Get all live classes (for admin)
router.get('/:id', authenticateToken, getLiveClassById); // Get live class by ID

// Public route (for students to get their batch's live class)
router.get('/batch/:batchId', getLiveClassByBatch); // Get live class for a specific batch

// Student route (authenticated students can get their live session)
router.get('/student/session', authenticateToken, getLiveSessionForStudent);

module.exports = router;