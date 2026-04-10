const bcrypt = require('bcryptjs');
const { sequelize, User } = require('./models');

async function createAdmin() {
    try {
        await sequelize.authenticate();
        const hashedPassword = await bcrypt.hash('12345678', 12);
        const user = await User.findOrCreate({
            where: { email: 'admin@hunar.com' },
            defaults: {
                name: 'Admin',
                email: 'admin@hunar.com',
                password: hashedPassword,
                role: 'Admin'
            }
        });
        console.log('✅ Admin user ready:', user[0].email);
        await sequelize.close();
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
}

createAdmin();
