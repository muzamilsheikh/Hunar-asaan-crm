const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false
});

sequelize.authenticate()
    .then(() => console.log('✅ Connected to MySQL via Sequelize'))
    .catch(err => console.error('❌ MySQL Connection Error:', err.message));

module.exports = sequelize;