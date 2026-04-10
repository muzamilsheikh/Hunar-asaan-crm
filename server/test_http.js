const http = require('http');
const { User, sequelize } = require('./models');
const jwt = require('jsonwebtoken');

(async () => {
    try {
        await sequelize.authenticate();
        const user = await User.findOne();
        if (user) {
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'hunar_asaan_jwt_secret_2026', { expiresIn: '1h' });
            
            const req = http.request('http://localhost:5001/api/students', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    console.log("Status:", res.statusCode);
                    console.log("Body:", data);
                    process.exit(0);
                });
            });
            req.on('error', e => {
                console.log("Req error:", e.message);
                process.exit(1);
            });
            req.end();
        } else {
            console.log("No user");
            process.exit(0);
        }
    } catch(err) {
        console.log("Error:", err);
        process.exit(1);
    }
})();
