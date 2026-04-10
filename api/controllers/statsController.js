const { Student, Payment, Expense, Course, Batch } = require('../models');
const { sequelize } = require('../models');
const { Sequelize } = require('sequelize');

// Helper function to calculate cumulative total paid from Payment table
const calculateCumulativeTotalPaid = async (studentId) => {
    try {
        const result = await Payment.findOne({
            where: { studentId, status: 'Paid' },
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amountPaid')), 0), 'totalPaid']
            ],
            raw: true
        });
        return result?.totalPaid || 0;
    } catch (err) {
        console.error('Error calculating cumulative total:', err);
        return 0;
    }
};

// GET /api/stats/financial-dashboard - Main financial dashboard endpoint
const getFinancialDashboardStats = async (req, res) => {
    try {
        // Calculate total pending fees (sum of all students' remaining balances)
        const totalPendingResult = await Student.findAll({
            attributes: [
                [Sequelize.col('id'), 'id'],
                [Sequelize.col('totalFee'), 'totalFee'],
                [Sequelize.col('discount'), 'discount'],
                [Sequelize.literal('(SELECT COALESCE(SUM(amountPaid), 0) FROM Payments WHERE Payments.studentId = Student.id AND Payments.status = "Paid")'), 'cumulativePaid']
            ],
            raw: true
        });

        const totalPending = totalPendingResult.reduce((sum, student) => {
            const remaining = (student.totalFee || 0) - (student.cumulativePaid || 0) - (student.discount || 0);
            return sum + Math.max(0, remaining);
        }, 0);

        // Calculate total revenue (sum of all successful payments)
        const totalRevenueResult = await Payment.findOne({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amountPaid')), 0), 'totalRevenue']
            ],
            where: { status: 'Paid' },
            raw: true
        });
        const totalRevenue = totalRevenueResult?.totalRevenue || 0;

        // Calculate total expenses (sum of all recorded costs)
        const totalExpensesResult = await Expense.findOne({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amount')), 0), 'totalExpenses']
            ],
            raw: true
        });
        const totalExpenses = totalExpensesResult?.totalExpenses || 0;

        // Calculate net profit (revenue minus expenses)
       const netProfit = totalRevenue - totalExpenses;

        // 🔥 NEW: Calculate Gross Portfolio Value
        // Formula: Total Revenue (collected) + Outstanding Credit (pending)
       const grossPortfolioValue = totalRevenue + totalPending;

        // Calculate total students
        const totalStudents = await Student.count();

        // Get chart data for last 6 months (Revenue vs Expenses)
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 5); // Last 6 months including current

        const months = [];
        for (let i = 5; i >= 0; i--) {
            const monthDate = new Date();
            monthDate.setMonth(now.getMonth() - i);
            months.push(monthDate);
        }

        const chartData = await Promise.all(months.map(async (monthDate) => {
            const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
            const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
            monthEnd.setHours(23, 59, 59, 999);

            // Revenue for this month
            const monthlyRevenueResult = await Payment.findOne({
                attributes: [
                    [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amountPaid')), 0), 'monthlyRevenue']
                ],
                where: {
                    status: 'Paid',
                    paymentDate: {
                        [Sequelize.Op.between]: [monthStart, monthEnd]
                    }
                },
                raw: true
            });

            // Expenses for this month
            const monthlyExpensesResult = await Expense.findOne({
                attributes: [
                    [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amount')), 0), 'monthlyExpenses']
                ],
                where: {
                    date: {
                        [Sequelize.Op.between]: [monthStart, monthEnd]
                    }
                },
                raw: true
            });

            const monthNames = [
                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
            ];

            return {
                month: `${monthNames[monthDate.getMonth()]} ${monthDate.getFullYear()}`,
                revenue: monthlyRevenueResult?.monthlyRevenue || 0,
                expenses: monthlyExpensesResult?.monthlyExpenses || 0
            };
        }));

        // Calculate collected vs outstanding fees percentage for pie chart
        const totalFeeResult = await Student.findOne({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('totalFee')), 0), 'totalFee']
            ],
            raw: true
        });
        const totalDiscountResult = await Student.findOne({
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('discount')), 0), 'totalDiscount']
            ],
            where: {
                discount: {
                    [Sequelize.Op.gt]: 0
                }
            },
            raw: true
        });

        const totalFee = totalFeeResult?.totalFee || 0;
        const totalDiscount = totalDiscountResult?.totalDiscount || 0;
        const totalCollected = totalRevenue; // From payments
        const totalOutstanding = totalPending; // From pending calculations

        res.json({
            success: true,
            data: {
                totalStudents,
                totalPending: Math.round(totalPending * 100) / 100,
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                totalExpenses: Math.round(totalExpenses * 100) / 100,
                netProfit: Math.round(netProfit * 100) / 100,
                grossPortfolioValue: Math.round(grossPortfolioValue * 100) / 100, // 🔥 NEW
                chartData,
                feeDistribution: {
                    collected: Math.round(totalCollected * 100) / 100,
                    outstanding: Math.round(totalOutstanding * 100) / 100
                }
            }
        });
    } catch (error) {
        console.error('Financial dashboard stats error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Server error' 
        });
    }
};

module.exports = {
    getFinancialDashboardStats
};