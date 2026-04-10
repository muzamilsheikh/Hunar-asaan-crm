/**
 * seed.js — Run this to reset the Users table and create the admin account.
 * Usage: node server/seed.js
 */

require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function seed() {
    try {
        console.log('🌱 Starting seed process...');

        // Authenticate and sync
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        await sequelize.sync({ alter: true });
        console.log('✅ Tables synchronized');

        // Clear Users table (disable foreign key checks first)
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        await User.destroy({ where: {}, truncate: true });
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('🗑️  Users table cleared');

        // Hash the admin password
        const hashedPassword = await bcrypt.hash('12345678', 12);

        // Create admin user
        const admin = await User.create({
            name: 'Admin',
            email: 'admin@hunar.com',
            password: hashedPassword,
            role: 'Admin'
        });

        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   ✅  Admin Account Created Successfully  ║');
        console.log('║                                          ║');
        console.log('║   📧  Email:    admin@hunar.com          ║');
        console.log('║   🔑  Password: 12345678                 ║');
        console.log('║   👤  Role:     Admin                    ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        console.log('✅ Seed complete! You can now log in.');

        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seed();
