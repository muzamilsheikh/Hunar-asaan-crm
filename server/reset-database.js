/**
 * reset-database.js — COMPLETELY resets the database by dropping all tables and recreating them
 * Usage: node server/reset-database.js
 * WARNING: This will DELETE ALL DATA!
 */

require('dotenv').config({ path: __dirname + '/.env' });
const { sequelize } = require('./models');

async function resetDatabase() {
    try {
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   ⚠️  DATABASE RESET - ALL DATA WILL BE LOST ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        
        // Authenticate connection
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // FORCE DROP - Drop all tables in correct order (respecting foreign keys)
        console.log('🗑️  Dropping all tables...');
        
        // Drop in reverse dependency order to avoid foreign key issues
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        
        const tables = [
            'ChatMessages',
            'ChatGroups', 
            'InstallmentSchedules',
            'Payments',
            'Enrollments',
            'LiveClasses',
            'Expenses',
            'Students',
            'Batches',
            'Courses',
            'Settings',
            'Users'
        ];
        
        for (const table of tables) {
            try {
                await sequelize.query(`DROP TABLE IF EXISTS \`${table}\``);
                console.log(`   ✅ Dropped table: ${table}`);
            } catch (err) {
                console.log(`   ⚠️  Table ${table} doesn't exist or error: ${err.message}`);
            }
        }
        
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        
        console.log('✅ All tables dropped');
        
        // Force recreate all tables
        console.log('🔄 Recreating all tables...');
        await sequelize.sync({ force: true });
        console.log('✅ All tables recreated successfully');
        
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   ✅  Database Reset Complete!            ║');
        console.log('║                                          ║');
        console.log('║   📊  All tables have been recreated     ║');
        console.log('║   🎯  Run `npm run seed` to add admin    ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Reset failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

resetDatabase();
