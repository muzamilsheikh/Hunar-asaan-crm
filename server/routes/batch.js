const express = require('express');
const router = express.Router();
const {
    getAllBatches,
    getBatchById,
    createBatch,
    updateBatch,
    deleteBatch
} = require('../controllers/batchController');
const { authenticateToken } = require('../middleware/auth');

// Get all batches
router.get('/', authenticateToken, getAllBatches);

// Get a single batch
router.get('/:id', authenticateToken, getBatchById);

// Create a new batch
router.post('/', authenticateToken, createBatch);

// Update a batch
router.put('/:id', authenticateToken, updateBatch);

// Delete a batch
router.delete('/:id', authenticateToken, deleteBatch);

module.exports = router;
