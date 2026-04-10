/**
 * reset-to-simple-password.js
 * Usage: node server/reset-to-simple-password.js
 * 
 * Resets admin password back to simple "12345678"
 */

require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function resetPassword() {
    try {
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   🔑 Reset Admin Password to Simple     ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        
        await sequelize.authenticate();
        console.log('✅ Connected to database');
        
        const admin = await User.findOne({
            where: { 
                email: 'admin@hunar.com',
                role: 'Admin'
            }
        });
        
        if (!admin) {
            console.error('❌ Admin user not found!');
            await sequelize.close();
            process.exit(1);
        }
        
        // Hash simple password
        const simplePassword = '12345678';
        const hashedPassword = await bcrypt.hash(simplePassword, 12);
        
        // Update password
        await admin.update({ password: hashedPassword });
        console.log(`✅ Password reset to: ${simplePassword}`);
        
        console.log('');
        console.log('╔══════════════════════════════════════════╗');
        console.log('║   ✅ Password Reset Successfully         ║');
        console.log('╠══════════════════════════════════════════╣');
        console.log('║                                          ║');
        console.log('║   📧 Email:     admin@hunar.com          ║');
        console.log('║   🔑 Password: 12345678                  ║');
        console.log('║                                          ║');
        console.log('║   ⚠️  This is a WEAK password!           ║');
        console.log('║   ⚠️  Change it later for security!      ║');
        console.log('║                                          ║');
        console.log('╚══════════════════════════════════════════╝');
        console.log('');
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

resetPassword();
