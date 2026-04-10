const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function testLogin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');
        
        // Find the admin user
        const user = await User.findOne({
            where: { email: 'admin@hunar.com' }
        });
        
        if (!user) {
            console.log('❌ Admin user not found in database');
            
            // Check if there are any users at all
            const allUsers = await User.findAll();
            console.log(`\n📋 Found ${allUsers.length} users in database:`);
            allUsers.forEach(u => {
                console.log(`   - ${u.name} (${u.email}): ${u.role}`);
            });
        } else {
            console.log('✅ Admin user found:');
            console.log(`   Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Password hash: ${user.password.substring(0, 20)}...`);
            
            // Test password comparison
            const isMatch = await bcrypt.compare('admin123', user.password);
            console.log(`   Password match for 'admin123': ${isMatch}`);
            
            // Try a different common password
            const isMatch2 = await bcrypt.compare('12345678', user.password);
            console.log(`   Password match for '12345678': ${isMatch2}`);
        }
        
        await sequelize.close();
    } catch (e) {
        console.error('❌ Error testing login:', e.message);
    }
}

testLogin();