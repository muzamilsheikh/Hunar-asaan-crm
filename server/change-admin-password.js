/**
 * change-admin-password.js
 * Usage: node server/change-admin-password.js
 * 
 * This script will:
 * 1. Connect to database
 * 2. Find admin user
 * 3. Update password with strong hash
 * 4. Display new credentials
 */

require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

// Generate a strong random password
const generateStrongPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
    let password = '';
    
    // Ensure at least one of each type
    password += 'A'; // uppercase
    password += 'a'; // lowercase
    password += '1'; // number
    password += '!'; // special
    
    // Fill rest randomly
    for (let i = 4; i < 16; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return password.split('').sort(() => Math.random() - 0.5).join('');
};

async function changeAdminPassword() {
    try {
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   🔐 Admin Password Reset Utility        ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Connected to database');
        
        // Find admin user
        const admin = await User.findOne({
            where: { 
                email: 'admin@hunar.com',
                role: 'Admin'
            }
        });
        
        if (!admin) {
            console.error('❌ Admin user not found!');
            console.log('Run `npm run seed` first to create admin account.');
            await sequelize.close();
            process.exit(1);
        }
        
        console.log(`📧 Found admin: ${admin.email}`);
        
        // Generate new password
        const newPassword = generateStrongPassword();
        console.log(`🔑 Generated new strong password`);
        
        // Hash password
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        console.log(`🔒 Password hashed securely`);
        
        // Update password
        await admin.update({ password: hashedPassword });
        console.log(`✅ Password updated successfully!`);
        
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   ✅ Admin Password Changed Successfully ║');
        console.log('╠══════════════════════════════════════════╣');
        console.log('║                                          ║');
        console.log('║   📧 Email:     admin@hunar.com          ║');
        console.log('║   🔑 Password: ' + newPassword.padEnd(20, ' ') + ' ║');
        console.log('║                                          ║');
        console.log('║   ⚠️  SAVE THIS PASSWORD SECURELY!       ║');
        console.log('║   ⚠️  It cannot be recovered!            ║');
        console.log('║                                          ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        
        // Save credentials to file for backup
        const fs = require('fs');
        const credentials = {
            email: 'admin@hunar.com',
            password: newPassword,
            changedAt: new Date().toISOString(),
            note: 'SAVE THIS FILE SECURELY - Delete after saving password!'
        };
        
        fs.writeFileSync(
            './admin-credentials-backup.json',
            JSON.stringify(credentials, null, 2),
            { mode: 0o600 } // Only owner can read/write
        );
        
        console.log('💾 Backup saved to: ./admin-credentials-backup.json');
        console.log('   ⚠️  DELETE THIS FILE AFTER SAVING PASSWORD!');
        console.log('');
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

changeAdminPassword();
