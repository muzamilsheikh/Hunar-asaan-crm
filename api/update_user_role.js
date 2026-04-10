const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function updateUserRole() {
    try {
        await sequelize.authenticate();
        
        // Find the user with email 'mujtaba@hunarasaan.com' and update their role to 'Admin'
        const [numberOfAffectedRows, affectedRows] = await User.update(
            { role: 'Admin' },
            {
                where: { email: 'mujtaba@hunarasaan.com' },
                returning: true // This might not work with MySQL, but it's worth a try
            }
        );

        if (numberOfAffectedRows > 0) {
            console.log(`✅ User role updated successfully for mujtaba@hunarasaan.com`);
            console.log(`✅ Rows affected: ${numberOfAffectedRows}`);
            
            // Find and display the updated user
            const updatedUser = await User.findOne({
                where: { email: 'mujtaba@hunarasaan.com' }
            });
            
            if (updatedUser) {
                console.log('✅ Updated user details:');
                console.log(`   Name: ${updatedUser.name}`);
                console.log(`   Email: ${updatedUser.email}`);
                console.log(`   Role: ${updatedUser.role}`);
            }
        } else {
            console.log('❌ No user found with email mujtaba@hunarasaan.com');
            
            // Show all users for debugging
            const allUsers = await User.findAll();
            console.log('\n📋 All users in the database:');
            allUsers.forEach(user => {
                console.log(`   - ${user.name} (${user.email}): ${user.role}`);
            });
        }
        
        await sequelize.close();
    } catch (e) {
        console.error('❌ Error updating user role:', e.message);
    }
}

updateUserRole();