const { Expense } = require('../models');

// GET all expenses
const getAllExpenses = async (req, res) => {
    try {
        const expenses = await Expense.findAll({ order: [['date', 'DESC']] });
        res.json(expenses || []);
    } catch (error) {
        console.error('Get expenses error:', error);
        res.status(500).json({ error: error.message || 'Server error', expenses: [] });
    }
};

// GET single expense
const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ error: 'Expense not found' });
        res.json(expense);
    } catch (error) {
        console.error('Get expense error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// POST create expense
const createExpense = async (req, res) => {
    try {
        const { description, amount, category, date } = req.body;

        if (!description || amount === undefined) {
            return res.status(400).json({ error: 'Description and amount are required' });
        }

        const newExpense = await Expense.create({
            description: description.trim(),
            amount: parseFloat(amount) || 0,
            category: category || 'Other',
            date: date || new Date().toISOString().split('T')[0]
        });

        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Create expense error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// PUT update expense
const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ error: 'Expense not found' });

        const { description, amount, category, date } = req.body;
        await expense.update({
            description: description || expense.description,
            amount: amount !== undefined ? parseFloat(amount) : expense.amount,
            category: category || expense.category,
            date: date || expense.date
        });

        res.json(expense);
    } catch (error) {
        console.error('Update expense error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// DELETE expense
const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ error: 'Expense not found' });

        await expense.destroy();
        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Delete expense error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

module.exports = { getAllExpenses, getExpenseById, createExpense, updateExpense, deleteExpense };
