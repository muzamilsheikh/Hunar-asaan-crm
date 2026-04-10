const express = require('express');
const router = express.Router();
const {
    getAllExpenses,
    getExpenseById,
    createExpense,
    updateExpense,
    deleteExpense
} = require('../controllers/expenseController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, getAllExpenses);
router.get('/:id', authenticateToken, getExpenseById);
router.post('/', authenticateToken, createExpense);
router.put('/:id', authenticateToken, updateExpense);
router.delete('/:id', authenticateToken, deleteExpense);

module.exports = router;
