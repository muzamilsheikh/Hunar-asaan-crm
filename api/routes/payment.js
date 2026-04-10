const express = require('express');
const router = express.Router();
const {
    createPayment,
    getPaymentsByStudent,
    getAllPayments,
    getPaymentByReceipt,
    getRemainingBalance,
    getRecoveryAlerts,
    getPendingFeesSummary
} = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

// Create a new payment
router.post('/', authenticateToken, createPayment);

// 🔥 Get recovery alerts (students with overdue fees) — must be before /:param routes
router.get('/alerts/recovery', authenticateToken, getRecoveryAlerts);

// 🔥 Get pending fees summary — must be before /:param routes
router.get('/summary/pending-fees', authenticateToken, getPendingFeesSummary);

// Get all payments for a specific student
router.get('/student/:studentId', authenticateToken, getPaymentsByStudent);

// Get remaining balance for a student
router.get('/balance/:studentId', authenticateToken, getRemainingBalance);

// Get payment by receipt number
router.get('/receipt/:receiptNo', authenticateToken, getPaymentByReceipt);

// Get all payments (admin view)
router.get('/', authenticateToken, getAllPayments);

module.exports = router;
