/**
 * reportsController.js - Comprehensive Financial Reporting System
 * Handles monthly, yearly, and custom date range reports
 */

const { Student, Payment, Expense, Course } = require('../models');
const { sequelize } = require('../models');
const { Sequelize } = require('sequelize');

// GET /api/reports - Generate comprehensive report for date range
const generateReport = async (req, res) => {
  try {
   const { startDate, endDate, type, batchId } = req.query;

    // Validate dates
   if (!startDate || !endDate) {
     return res.status(400).json({ 
       error: 'Start date and end date are required',
        example: '?startDate=2024-01-01&endDate=2024-12-31&type=custom'
      });
    }

   const start = new Date(startDate);
   const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // Include entire end date

   const hasBatchFilter = batchId && batchId !== 'all';
   console.log(`📊 Generating report from ${start.toISOString()} to ${end.toISOString()}${hasBatchFilter ? ` | Batch: ${batchId}` : ' | All Batches'}`);

    // Build student where clause
   const studentWhere = {
      createdAt: {
        [Sequelize.Op.between]: [start, end]
      }
    };
   if (hasBatchFilter) {
      studentWhere.batchId = parseInt(batchId);
    }

    // 1. Total Collections (Revenue) in period
    // If batch filter: sum only payments for students in that batch
   let totalCollections;
   if (hasBatchFilter) {
      // Get student IDs in this batch
      const batchStudents = await Student.findAll({
        where: studentWhere,
        attributes: ['id'],
        raw: true
      });
      const batchStudentIds = batchStudents.map(s => s.id);
      
      if (batchStudentIds.length > 0) {
        const collectionsResult = await Payment.findOne({
          attributes: [
            [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amountPaid')), 0), 'totalCollections']
          ],
          where: {
            status: 'Paid',
            paymentDate: { [Sequelize.Op.between]: [start, end] },
            studentId: { [Sequelize.Op.in]: batchStudentIds }
          },
          raw: true
        });
        totalCollections = parseFloat(collectionsResult?.totalCollections || 0);
      } else {
        totalCollections = 0;
      }
    } else {
      const collectionsResult = await Payment.findOne({
        attributes: [
          [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amountPaid')), 0), 'totalCollections']
        ],
        where: {
          status: 'Paid',
          paymentDate: { [Sequelize.Op.between]: [start, end] }
        },
        raw: true
      });
      totalCollections = parseFloat(collectionsResult?.totalCollections || 0);
    }

    // 2. Operational Costs (Expenses) — always institute-wide, not batch-specific
   const expensesResult = await Expense.findOne({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amount')), 0), 'totalExpenses']
      ],
      where: {
        date: { [Sequelize.Op.between]: [start, end] }
      },
      raw: true
    });
   const operationalCosts = parseFloat(expensesResult?.totalExpenses || 0);

    // 3. Net Profit for period
   const netProfit = totalCollections - operationalCosts;

    // 4. Students & Outstanding Fees (filtered by batch if specified)
   const studentsData = await Student.findAll({
      where: studentWhere,
      include: [
        { model: Course, attributes: ['name', 'fee'] }
      ]
    });

   let totalPending = 0;
   const studentsList = [];
   
   for (const student of studentsData) {
     // Payments for this student in the given date range
     const studentPayments = await Payment.findOne({
      attributes: [
        [Sequelize.fn('COALESCE', Sequelize.fn('SUM', Sequelize.col('amountPaid')), 0), 'cumulativePaid']
      ],
      where: {
        studentId: student.id,
        status: 'Paid',
        paymentDate: {
          [Sequelize.Op.between]: [start, end]
        }
      },
      raw: true
     });
     
     const cumulativePaid = parseFloat(studentPayments?.cumulativePaid || 0);
     const totalFee = parseFloat(student.totalFee || 0);
     const discount = parseFloat(student.discount || 0);
     const remaining = totalFee - cumulativePaid - discount;
     const pending = Math.max(0, remaining);
     
     totalPending += pending;
     
     studentsList.push({
       id: student.id,
       name: student.name,
       code: student.customId || 'N/A',
       course: student.Course ? student.Course.name : 'Unknown',
       totalFee: totalFee - discount, // effective fee
       paid: cumulativePaid,
       pending: pending
     });
   }

    // Compile final report matching frontend expectations
   const report = {
      period: {
       startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        type: type || 'custom',
        batchId: hasBatchFilter ? parseInt(batchId) : null
      },
      totalRevenue: Math.round(totalCollections * 100) / 100,
      totalExpenses: Math.round(operationalCosts * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      totalPending: Math.round(totalPending * 100) / 100,
      students: studentsList
    };

   res.json({
     success: true,
     data: report,
     generatedAt: new Date().toISOString()
    });

  } catch (error) {
   console.error('❌ Report generation error:', error);
   res.status(500).json({ 
     success: false, 
     error: error.message || 'Failed to generate report' 
    });
  }
};

module.exports = {
  generateReport
};
