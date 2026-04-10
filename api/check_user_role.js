const { sequelize, User } = require('./models');

async function checkUserRole() {
    try {
        await sequelize.authenticate();
        
        // Check specific user
        const user = await User.findOne({
            where: { 
                email: 'mujtaba@hunarasaan.com' 
            }
        });
        
        if (user) {
            console.log('✅ User found:');
            console.log(`   Name: ${user.name}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   Role: ${user.role}`);
            console.log(`   Created: ${user.createdAt}`);
            console.log(`   Updated: ${user.updatedAt}`);
        } else {
            console.log('❌ User not found with email mujtaba@hunarasaan.com');
            
            // Try with lowercase comparison to check for case sensitivity
            const allUsers = await User.findAll({
                where: sequelize.where(
                    sequelize.fn('LOWER', sequelize.col('email')), 
                    'LIKE', 
                    '%mujtaba%'
                )
            });
            
            if (allUsers.length > 0) {
                console.log('\n🔍 Found users with similar email:');
                allUsers.forEach(u => {
                    console.log(`   - ${u.name} (${u.email}): ${u.role}`);
                });
            } else {
                console.log('\n❌ No users found with "mujtaba" in email');
            }
        }
        
        await sequelize.close();
    } catch (e) {
        console.error('❌ Error checking user role:', e.message);
    }
}

checkUserRole();