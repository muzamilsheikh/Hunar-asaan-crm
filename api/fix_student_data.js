/**
 * fix_student_data.js - Fix students with invalid totalFee/discount values
 * Usage: node server/fix_student_data.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { sequelize, Student, Course } = require('./models');

async function fixStudentData() {
   try {
       console.log('🔧 Starting student data fix process...\n');

        // Authenticate and sync
       await sequelize.authenticate();
       console.log('✅ Connected to database\n');

        // Get all students
       const students = await Student.findAll();
       console.log(`📊 Found ${students.length} total students\n`);

        let fixedCount = 0;
        let skippedCount = 0;
        let errorCount = 0;

        for (const student of students) {
            let needsFix = false;
            let updateData = {};

            // Check if totalFee is invalid
           if (!student.totalFee || isNaN(student.totalFee) || student.totalFee <= 0) {
               console.log(`❌ Student "${student.name}" (ID: ${student.id}) has invalid totalFee: ${student.totalFee}`);
                
                // Try to get the course fee
               if (student.courseId) {
                   const course = await Course.findByPk(student.courseId);
                   if (course && course.fee) {
                        updateData.totalFee = course.fee;
                       console.log(`   ✅ Will set totalFee to course fee: ${course.fee}\n`);
                        needsFix = true;
                    } else {
                       console.log(`   ⚠️ Cannot fix: Course not found or has no fee\n`);
                        errorCount++;
                       continue;
                    }
                } else {
                   console.log(`   ⚠️ Cannot fix: Student has no courseId\n`);
                    errorCount++;
                   continue;
                }
            }

            // Check if discount is invalid
           if (student.discount === undefined || student.discount === null || isNaN(student.discount)) {
               console.log(`❌ Student "${student.name}" (ID: ${student.id}) has invalid discount: ${student.discount}`);
                updateData.discount = 0;
               console.log(`   ✅ Will set discount to: 0\n`);
                needsFix = true;
            }

            // Update if needed
           if (needsFix) {
               try {
                   await student.update(updateData);
                   console.log(`✅ FIXED: ${student.name}\n`);
                    fixedCount++;
                } catch (err) {
                   console.error(`💥 Error updating ${student.name}:`, err.message);
                    errorCount++;
                }
            } else {
                skippedCount++;
            }
        }

       console.log('\n╔══════════════════════════════════════════╗');
       console.log('║   ✅  Student Data Fix Complete          ║');
       console.log('╠══════════════════════════════════════════╣');
       console.log(`║   Total Students:    ${String(students.length).padEnd(20)} ║`);
       console.log(`║   Fixed:             ${String(fixedCount).padEnd(20)} ║`);
       console.log(`║   Skipped(OK):      ${String(skippedCount).padEnd(20)} ║`);
       console.log(`║   Errors:            ${String(errorCount).padEnd(20)} ║`);
       console.log('╚══════════════════════════════════════════╝\n');

       await sequelize.close();
        process.exit(0);
    } catch (error) {
       console.error('❌ Fix process failed:', error.message);
       console.error('Stack:', error.stack);
        process.exit(1);
    }
}

fixStudentData();
