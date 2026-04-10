const { User, sequelize } = require('./models');
(async () => {
    try {
        await sequelize.authenticate();
        const user = await User.findOne();
        if (user) {
            console.log("Found user:", user.email);
            // manually construct token
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'hunar_asaan_jwt_secret_2026', { expiresIn: '1h' });
            const axios = require('axios');
            const getRes = await axios.get('http://localhost:5001/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Success GET students", getRes.status);
        } else {
            console.log("No user found");
        }
    } catch(err) {
        if(err.response) {
            console.log("Error status:", err.response.status);
            console.log("Error data:", err.response.data);
        } else {
            console.log("Error:", err.message);
        }
    } finally {
        process.exit();
    }
})();
