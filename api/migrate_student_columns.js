/**
 * migrate_student_columns.js - Add missing columns to Students table
 * Usage: node server/migrate_student_columns.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { sequelize } = require('./models');
const { QueryTypes } = require('sequelize');

async function migrateStudentColumns() {
  try {
      console.log('🔧 Starting database migration for Students table...\n');

        // Authenticate
      await sequelize.authenticate();
      console.log('✅ Connected to database\n');

        // Check if totalInstallments column exists
      const checkColumnQuery = `
           SELECT COLUMN_NAME 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = DATABASE() 
           AND TABLE_NAME = 'Students' 
           AND COLUMN_NAME = 'totalInstallments';
       `;

      const [results] = await sequelize.query(checkColumnQuery, { type: QueryTypes.SELECT });

      if (results && results.length > 0) {
          console.log('✅ Column totalInstallments already exists');
       } else {
          console.log('⚠️ Column totalInstallments missing, adding...');
            
            // Add totalInstallments column
          const addColumnQuery = `
               ALTER TABLE Students
               ADD COLUMN totalInstallments INT DEFAULT 2;
           `;

          await sequelize.query(addColumnQuery);
          console.log('✅ Successfully added totalInstallments column');
       }

      console.log('\n╔══════════════════════════════════════════╗');
      console.log('║   ✅  Database Migration Complete        ║');
      console.log('╚══════════════════════════════════════════╝\n');

      await sequelize.close();
        process.exit(0);
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
      console.error('SQL Error:', error.sqlMessage);
      console.error('Stack:', error.stack);
        process.exit(1);
    }
}

migrateStudentColumns();
