#!/usr/bin/env node
/**
 * seed-mbc-batch-3-students.js
 * 
 * Script to import 14 student records into the 'MBC Batch 3' batch.
 * 
 * Usage:
 *   node server/seeds/seed-mbc-batch-3-students.js
 * 
 * Features:
 * - Creates/finds MBC Batch 3
 * - Imports all 14 students with payment records
 * - Handles both "Full Paid" and "Installments" payment types
 * - Sets proper createdAt timestamps
 */

require('dotenv').config({ path: __dirname + '/../.env' });
const { sequelize, Student, Batch, Course } = require('../models');

// Student data: name, totalFee, paymentStatus, createdAt date
const studentsData = [
    { name: 'Zeenat Bibi', fee: 28000, paymentStatus: 'Full Paid', createdAt: '2025-08-01', installments: 2 },
    { name: 'Lubna Junaid', fee: 30000, paymentStatus: 'Installments', createdAt: '2025-08-02', installments: 3 },
    { name: 'Kashaf Habib', fee: 30000, paymentStatus: 'Installments', createdAt: '2025-08-03', installments: 3 },
    { name: 'Kanza Kashif', fee: 30000, paymentStatus: 'Installments', createdAt: '2025-08-04', installments: 3 },
    { name: 'Zahid Naseeb Ansari', fee: 25000, paymentStatus: 'Paid', createdAt: '2025-08-05', installments: 1 },
    { name: 'Saqiba Sattar Hashmi', fee: 30000, paymentStatus: 'Installments', createdAt: '2025-08-06', installments: 3 },
    { name: 'Hamna Iqbal', fee: 28000, paymentStatus: 'Full Paid', createdAt: '2025-08-07', installments: 2 },
    { name: 'Anam Tahir', fee: 30000, paymentStatus: 'Installments', createdAt: '2025-08-08', installments: 3 },
    { name: 'Mustafa Hayiat', fee: 30000, paymentStatus: 'Installments', createdAt: '2025-08-09', installments: 3 },
    { name: 'MUHAMMAD HUSSAIN', fee: 28000, paymentStatus: 'Installments', createdAt: '2025-08-10', installments: 2 },
    { name: 'Dawood Ali', fee: 30000, paymentStatus: 'Installments', createdAt: '2025-08-11', installments: 3 },
    { name: 'Sannia Tariq', fee: 28000, paymentStatus: 'Full Paid', createdAt: '2025-08-12', installments: 2 },
    { name: 'Mashal Jabbar', fee: 28000, paymentStatus: 'Full Paid', createdAt: '2025-08-13', installments: 2 },
    { name: 'Javeria Jamshed', fee: 28000, paymentStatus: 'Full Paid', createdAt: '2025-08-14', installments: 2 }
];

// Configuration
const BATCH_NAME = 'MBC Batch 3';
const COURSE_ID = 1; // Medical Billing - adjust if needed
const COURSE_CODE = 'MB'; // Medical Billing code

/**
 * Generate installment payment records for a student
 * @param {number} totalFee - Total fee amount
 * @param {string} paymentStatus - 'Full Paid', 'Paid', or 'Installments'
 * @param {number} installmentCount - Number of installments
 * @param {string} createdAtDate - Date student was created (YYYY-MM-DD)
 * @returns {Array} Array of payment records
 */
function generatePayments(totalFee, paymentStatus, installmentCount, createdAtDate) {
    const payments = [];
    const installmentAmount = Math.round(totalFee / installmentCount);
    const startDate = new Date(createdAtDate);

    for (let i = 1; i <= installmentCount; i++) {
        const dueDate = new Date(startDate);
        dueDate.setMonth(startDate.getMonth() + (i - 1));

        // Mark as paid if status is "Full Paid" or "Paid"
        const isPaid = paymentStatus === 'Full Paid' || paymentStatus === 'Paid';

        payments.push({
            installmentNumber: i,
            amount: installmentAmount,
            date: dueDate.toISOString().split('T')[0],
            status: isPaid ? 'Paid' : 'Pending',
            datePaid: isPaid ? createdAtDate : undefined
        });
    }

    return payments;
}

async function importStudents() {
    try {
        console.log('🌱 Starting MBC Batch 3 Student Import...\n');

        // Authenticate and sync database
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        await sequelize.sync({ alter: true });
        console.log('✅ Tables synchronized\n');

        // Find or create the batch
        let batch = await Batch.findOne({ where: { name: BATCH_NAME } });

        if (!batch) {
            console.log(`📦 Batch "${BATCH_NAME}" not found. Creating...\n`);
            batch = await Batch.create({
                name: BATCH_NAME,
                courseId: COURSE_ID,
                time: '10:00 AM - 12:00 PM' // Default time
            });
            console.log(`✅ Created batch: ${batch.name} (ID: ${batch.id})\n`);
        } else {
            console.log(`✅ Found existing batch: ${batch.name} (ID: ${batch.id})\n`);
        }

        // Import students
        const createdStudents = [];
        let successCount = 0;
        let errorCount = 0;

        console.log(`📚 Importing ${studentsData.length} students...\n`);

        for (const studentInfo of studentsData) {
            try {
                // Check if student already exists
                const existingStudent = await Student.findOne({
                    where: { name: studentInfo.name }
                });

                if (existingStudent) {
                    console.log(`⚠️  ${studentInfo.name} already exists. Skipping...`);
                    continue;
                }

                // Generate payment records
                const payments = generatePayments(
                    studentInfo.fee,
                    studentInfo.paymentStatus,
                    studentInfo.installments,
                    studentInfo.createdAt
                );

                // Calculate paid amount
                const paidAmount = payments
                    .filter(p => p.status === 'Paid')
                    .reduce((sum, p) => sum + p.amount, 0);

                // Create student
                const student = await Student.create({
                    name: studentInfo.name,
                    totalFee: studentInfo.fee,
                    paidAmount: paidAmount,
                    discount: 0,
                    totalInstallments: studentInfo.installments,
                    payments: payments,
                    courseId: COURSE_ID,
                    batchId: batch.id,
                    status: 'Active',
                    createdAt: new Date(studentInfo.createdAt),
                    updatedAt: new Date(studentInfo.createdAt)
                });

                createdStudents.push(student);
                console.log(`✅ ${student.name} (ID: ${student.id}) - Rs. ${student.totalFee}`);
                console.log(`   └─ ${payments.filter(p => p.status === 'Paid').length}/${payments.length} payments marked as Paid\n`);
                successCount++;
            } catch (error) {
                console.error(`❌ Failed to create ${studentInfo.name}:`, error.message);
                errorCount++;
            }
        }

        // Summary
        console.log('\n╔════════════════════════════════════════════╗');
        console.log('║      IMPORT SUMMARY FOR MBC BATCH 3        ║');
        console.log('╠════════════════════════════════════════════╣');
        console.log(`║  ✅ Successful:  ${successCount} students`.padEnd(44) + '║');
        console.log(`║  ❌ Failed:      ${errorCount} students`.padEnd(44) + '║');
        console.log(`║  📦 Batch:       ${BATCH_NAME}`.padEnd(44) + '║');
        console.log(`║  👥 Total:       ${successCount + errorCount} entries`.padEnd(44) + '║');
        console.log('╚════════════════════════════════════════════╝\n');

        // Show payment summary
        if (createdStudents.length > 0) {
            const totalCollected = createdStudents.reduce((sum, s) => sum + s.paidAmount, 0);
            const totalFees = createdStudents.reduce((sum, s) => sum + s.totalFee, 0);
            const totalPending = totalFees - totalCollected;

            console.log('💰 FINANCIAL SUMMARY:');
            console.log(`   Total Fees:      Rs. ${totalFees.toLocaleString()}`);
            console.log(`   Amount Collected: Rs. ${totalCollected.toLocaleString()}`);
            console.log(`   Amount Pending:  Rs. ${totalPending.toLocaleString()}\n`);
        }

        // Display student list
        if (createdStudents.length > 0) {
            console.log('📋 IMPORTED STUDENTS:\n');
            createdStudents.forEach((student, idx) => {
                const paidCount = student.payments.filter(p => p.status === 'Paid').length;
                const totalInstallments = student.payments.length;
                const status = paidCount === totalInstallments ? '✅ Fully Paid' : `⏳ ${totalInstallments - paidCount} Pending`;
                console.log(`${idx + 1}. ${student.name.padEnd(25)} │ Rs. ${String(student.totalFee).padStart(6)} │ ${status}`);
            });
        }

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Import failed:', error.message);
        console.error(error);
        await sequelize.close();
        process.exit(1);
    }
}

// Run import
importStudents();
