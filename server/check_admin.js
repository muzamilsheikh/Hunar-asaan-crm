require('dotenv').config({ path: __dirname + '/.env' });
const bcrypt = require('bcryptjs');
const { User } = require('./models');

async function checkAdmin() {
    try {
        const user = await User.findOne({ where: { email: 'admin@hunar.com' } });
        if (!user) {
            console.log('❌ User NOT FOUND in DB — need to create admin user');

            // Create the admin user
            const hashed = await bcrypt.hash('admin123', 10);
            const newUser = await User.create({
                name: 'Admin',
                email: 'admin@hunar.com',
                password: hashed,
                role: 'Admin'
            });
            console.log('✅ Admin user CREATED:', newUser.id, newUser.email, newUser.role);
        } else {
            console.log('✅ User found:', user.name, '| Role:', user.role, '| ID:', user.id);
            console.log('   Hash prefix:', user.password && user.password.substring(0, 10));
            const match = await bcrypt.compare('admin123', user.password);
            console.log('   bcrypt.compare("admin123"):', match ? '✅ MATCH — password is correct' : '❌ NO MATCH — wrong hash');

            if (!match) {
                // Re-hash and update
                const newHash = await bcrypt.hash('admin123', 10);
                await user.update({ password: newHash, role: 'Admin' });
                console.log('✅ Password RESET to admin123 and role set to Admin');
            }
        }
    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        process.exit(0);
    }
}

checkAdmin();
