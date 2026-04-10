const { Payment, Student, Batch, Course } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { sequelize } = require('../models');
const { Sequelize } = require('sequelize');

// Generate Receipt Number
const generateReceiptNo = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `RCP-${timestamp}-${random}`;
};

// Helper: Calculate actual cumulative totalPaid from Payment table
const calculateCumulativeTotalPaid = async (studentId, transaction) => {
    try {
        const result = await Payment.findOne({
            where: { studentId, status: 'Paid' },
            attributes: [
                [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amountPaid')), 0), 'totalPaid']
            ],
            transaction,
            raw: true
        });
        return result?.totalPaid || 0;
    } catch (err) {
        console.error('Error calculating cumulative total:', err);
        return 0;
    }
};

// Create a new payment
const createPayment = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { 
            studentId, 
            enrollmentId, 
            amountPaid, 
            paymentMethod, 
            transactionId 
        } = req.body;

        // Validate required fields
        if (!studentId || !amountPaid || !paymentMethod) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['studentId', 'amountPaid', 'paymentMethod']
            });
        }

        // Validate payment method
        const validMethods = ['Cash', 'Online', 'Bank'];
        if (!validMethods.includes(paymentMethod)) {
            await transaction.rollback();
            return res.status(400).json({
                error: 'Invalid payment method',
                validMethods
            });
        }

        // Fetch student
        const student = await Student.findByPk(studentId, { transaction });
        if (!student) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch enrollment if provided
        let enrollment = null;
        if (enrollmentId) {
            const { Enrollment } = require('../models');
            enrollment = await Enrollment.findByPk(enrollmentId, { transaction });
            if (!enrollment) {
                await transaction.rollback();
                return res.status(404).json({ error: 'Enrollment not found' });
            }
        }

        // Determine which financial figures to use
        const targetTotalFee = enrollment ? enrollment.totalFee : (student.totalFee || 0);
        const targetDiscount = enrollment ? enrollment.discount : (student.discount || 0);

        // Calculate cumulative paid for this SPECIFIC target
        let cumulativeTargetPaid = 0;
        if (enrollmentId) {
            const result = await Payment.findOne({
                where: { enrollmentId, status: 'Paid' },
                attributes: [[Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amountPaid')), 0), 'totalPaid']],
                transaction,
                raw: true
            });
            cumulativeTargetPaid = result?.totalPaid || 0;
        } else {
            cumulativeTargetPaid = await calculateCumulativeTotalPaid(studentId, transaction);
        }
        
        // Calculate remaining balance
        const currentRemaining = targetTotalFee - cumulativeTargetPaid;
        
        // Validate payment amount doesn't exceed remaining balance
        if (amountPaid > currentRemaining + 0.01) { // 0.01 for float precision
            await transaction.rollback();
            return res.status(400).json({
                error: 'Payment amount exceeds remaining balance',
                remainingBalance: Math.max(0, currentRemaining),
                requestedAmount: amountPaid
            });
        }

        // Validate amount is positive
        if (amountPaid <= 0) {
            await transaction.rollback();
            return res.status(400).json({ error: 'Payment amount must be greater than zero' });
        }

        // Create payment record
        const newRemainingBalance = Math.max(0, currentRemaining - amountPaid);

        // 🔥 Generate unique receipt number
        const receiptNo = generateReceiptNo();

        // Determine Installment No
        let installmentNo = 1;
        if (enrollmentId) {
            const paymentCount = await Payment.count({ where: { enrollmentId, status: 'Paid' }, transaction });
            installmentNo = paymentCount + 1;
        }

        const payment = await Payment.create({
            studentId,
            enrollmentId: enrollmentId || null,
            installmentNo,
            amountPaid,
            paymentDate: new Date(),
            paymentMethod,
            transactionId: transactionId || null,
            receiptNo, // 🔥 Now properly defined
            remainingBalance: newRemainingBalance,
            status: 'Paid'
        }, { transaction });

        // 🔥 CRITICAL FIX: Recalculate totalPaid from Payment table and update Student record
        const updatedCumulativeTotalPaid = await calculateCumulativeTotalPaid(studentId, transaction);
        
        // 🔥 NEW: Increment next_due_date by 1 month after successful payment
        let nextDueDate = student.next_due_date;
        if (nextDueDate) {
            const newDate = new Date(nextDueDate);
            newDate.setMonth(newDate.getMonth() + 1);
            nextDueDate = newDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        }
        
        await student.update({
            totalPaid: updatedCumulativeTotalPaid,
            paidAmount: updatedCumulativeTotalPaid,
            next_due_date: nextDueDate  // Update next due date
        }, { transaction });

        // 🔥 NEW: Mark the earliest 'Pending' installment as 'Paid' for this enrollment
        if (enrollmentId) {
            const { InstallmentSchedule } = require('../models');
            const earliestPending = await InstallmentSchedule.findOne({
                where: { enrollmentId, status: 'Pending' },
                order: [['dueDate', 'ASC']],
                transaction
            });

            if (earliestPending) {
                // If payment covers the entire installment amount (or close to it)
                // For now, we'll mark one as 'Paid' per payment event
                await earliestPending.update({ status: 'Paid' }, { transaction });
            }
        }

        // Commit transaction 
        await transaction.commit();

        // Return payment with UPDATED student info
        const paymentWithStudent = await Payment.findByPk(payment.id, {
            include: [{ model: Student, attributes: ['id', 'name', 'totalFee', 'totalPaid', 'discount', 'paidAmount'] }]
        });

        res.status(201).json({
            success: true,
            message: 'Payment recorded successfully',
            payment: paymentWithStudent,
            student: paymentWithStudent.Student,
            receiptNo: payment.receiptNo,
            cumulativeTotalPaid: updatedCumulativeTotalPaid,
            remainingBalance: newRemainingBalance
        });
    } catch (error) {
        await transaction.rollback();
        console.error('Create payment error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get all payments for a student
const getPaymentsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        // Validate student exists
        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Fetch all payments for the student
        const payments = await Payment.findAll({
            where: { studentId },
            include: [{ model: Student, attributes: ['id', 'name', 'totalFee', 'totalPaid', 'discount'] }],
            order: [['paymentDate', 'DESC']]
        });

        // 🔥 CRITICAL FIX: Calculate cumulative SUM from Payment table
        const cumulativeTotalPaid = await calculateCumulativeTotalPaid(studentId);
        const remainingBalance = (student.totalFee || 0) - cumulativeTotalPaid - (student.discount || 0);

        // Calculate summary
        const summary = {
            totalPayments: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + p.amountPaid, 0),
            remainingBalance: Math.max(0, remainingBalance),
            totalFee: student.totalFee,
            totalPaid: cumulativeTotalPaid,
            discount: student.discount || 0
        };

        res.json({
            success: true,
            payments,
            summary
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get all payments (admin view)
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [{ model: Student, attributes: ['id', 'name', 'email', 'totalFee', 'totalPaid'] }],
            order: [['paymentDate', 'DESC']]
        });

        res.json({
            success: true,
            totalPayments: payments.length,
            payments
        });
    } catch (error) {
        console.error('Get all payments error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get payment by receipt number
const getPaymentByReceipt = async (req, res) => {
    try {
        const { receiptNo } = req.params;

        const payment = await Payment.findOne({
            where: { receiptNo },
            include: [{ model: Student, attributes: ['id', 'name', 'email', 'totalFee', 'totalPaid'] }]
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        res.json({
            success: true,
            payment
        });
    } catch (error) {
        console.error('Get payment by receipt error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get remaining balance for a student
const getRemainingBalance = async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findByPk(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // 🔥 CRITICAL FIX: Use cumulative SUM from Payment table instead of totalPaid field
        const cumulativeTotalPaid = await calculateCumulativeTotalPaid(studentId);
        const remainingBalance = (student.totalFee || 0) - cumulativeTotalPaid - (student.discount || 0);

        res.json({
            success: true,
            studentId,
            totalFee: student.totalFee || 0,
            totalPaid: cumulativeTotalPaid,
            discount: student.discount || 0,
            remainingBalance: Math.max(0, remainingBalance)
        });
    } catch (error) {
        console.error('Get remaining balance error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// 🔥 NEW: Optimized Alert Dashboard Logic (categorized by installments)
const getRecoveryAlerts = async (req, res) => {
    try {
        const { InstallmentSchedule, Enrollment, Student, Course, Batch } = require('../models');
        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const schedules = await InstallmentSchedule.findAll({
            where: { status: 'Pending' },
            include: [{
                model: Enrollment,
                include: [
                    { model: Student, attributes: ['id', 'name', 'phone', 'email'] },
                    { model: Course, as: 'Course', attributes: ['id', 'name'] },
                    { model: Batch, as: 'Batch', attributes: ['id', 'name'] }
                ]
            }],
            order: [['dueDate', 'ASC']]
        });

        const alerts = schedules.map(sch => {
            const dueDate = new Date(sch.dueDate);
            let category = 'FUTURE';

            // Reset time part for accurate comparison
            today.setHours(0,0,0,0);
            dueDate.setHours(0,0,0,0);

            if (dueDate < today) {
                category = 'OVERDUE';
            } else if (dueDate <= threeDaysFromNow) {
                category = 'UPCOMING';
            }

            return {
                id: sch.id,
                enrollmentId: sch.enrollmentId,
                studentId: sch.Enrollment?.Student?.id,
                studentName: sch.Enrollment?.Student?.name,
                phone: sch.Enrollment?.Student?.phone,
                courseName: sch.Enrollment?.Course?.name,
                batchName: sch.Enrollment?.Batch?.name,
                dueDate: sch.dueDate,
                amount: sch.amount,
                category,
                daysRemaining: Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
            };
        });

        // Filter and Sort: OVERDUE and UPCOMING only
        const sortedAlerts = alerts
            .filter(a => a.category !== 'FUTURE')
            .sort((a, b) => {
                if (a.category === 'OVERDUE' && b.category === 'UPCOMING') return -1;
                if (a.category === 'UPCOMING' && b.category === 'OVERDUE') return 1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            });

        res.json({
            success: true,
            count: sortedAlerts.length,
            alerts: sortedAlerts
        });
    } catch (error) {
        console.error('Get recovery alerts error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// 🔥 NEW: Get pending fees summary (sum of all overdue amounts)
const getPendingFeesSummary = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Get all overdue students
        const overdueStudents = await Student.findAll({
            where: {
                status: 'Active',
                next_due_date: {
                    [Sequelize.Op.lte]: today
                }
            },
            attributes: ['id', 'totalFee', 'discount']
        });

        // Calculate total pending fees
        let totalPendingFees = 0;
        let totalStudentsOverdue = 0;

        for (const student of overdueStudents) {
            const cumulativePaid = await calculateCumulativeTotalPaid(student.id);
            const remaining = (student.totalFee || 0) - cumulativePaid - (student.discount || 0);
            if (remaining > 0) {
                totalPendingFees += remaining;
                totalStudentsOverdue++;
            }
        }

        res.json({
            success: true,
            totalPendingFees,
            totalStudentsOverdue,
            averageOverduePerStudent: totalStudentsOverdue > 0 ? totalPendingFees / totalStudentsOverdue : 0
        });
    } catch (error) {
        console.error('Get pending fees summary error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

module.exports = {
    createPayment,
    getPaymentsByStudent,
    getAllPayments,
    getPaymentByReceipt,
    getRemainingBalance,
    getRecoveryAlerts,
    getPendingFeesSummary
};
