// ============ LOAD ENV FIRST ============
require('dotenv').config({ path: __dirname + '/.env' });

// ============ DEPENDENCIES ============
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5001;
const http = require('http');
const server = http.createServer(app);

// ============ CORS CONFIGURATION ============
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));

// ============ MIDDLEWARE ============
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (logos, etc.)
const path = require('path');
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));


// ============ INITIALIZE DATABASE ============
const { Sequelize } = require('sequelize');

// Function to initialize database with retry logic
async function initializeDatabase() {
    let retries = 5;
    let dbReady = false;

    while (retries > 0 && !dbReady) {
        try {
            // First, connect without database to create it if missing
            const sequelizeAdmin = new Sequelize('mysql', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
                host: process.env.DB_HOST || '127.0.0.1',
                dialect: 'mysql',
                logging: false,
                dialectOptions: {
                    connectTimeout: 60000, // 60 seconds
                },
                pool: {
                    max: 10,
                    min: 0,
                    acquire: 30000,
                    idle: 10000
                }
            });

            await sequelizeAdmin.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'hunar_db'}\``);
            console.log(`✅ Database "${process.env.DB_NAME || 'hunar_db'}" is ready`);
            await sequelizeAdmin.close();

            // Import models (connects to the specific database)
            const { sequelize, User, Course, Batch, Student, Expense, Setting, LiveClass, ChatGroup, ChatMessage, Payment } = require('./models');

            global.sequelize = sequelize;
            global.User = User;
            global.Course = Course;
            global.Batch = Batch;
            global.Student = Student;
            global.Expense = Expense;
            global.Setting = Setting;
            global.LiveClass = LiveClass;
            global.ChatGroup = ChatGroup;
            global.ChatMessage = ChatMessage;
            global.Payment = Payment;

            await sequelize.authenticate();
            console.log('✅ Connected to MySQL via Sequelize');
            await sequelize.sync({ alter: true }); // Allow altering tables to add new columns
            console.log('✅ All models synchronized with database');
            dbReady = true;
        } catch (error) {
            retries--;
            console.error(`❌ Database Error (retries left: ${retries}):`, error.message);
            if (retries > 0) {
                console.log('Retrying in 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                console.error('❌ Failed to connect to database after multiple attempts');
                process.exit(1);
            }
        }
    }

    if (dbReady) {
        startServer();
    }
}

initializeDatabase();

// ============ SOCKET.IO SETUP ============
const { initializeSocket } = require('./socket');

function initializeSocketIO() {
    return initializeSocket(server);
}

// ============ SETUP ROUTES ============
function setupRoutes() {
    const authRoutes = require('./routes/auth');
    const studentRoutes = require('./routes/student');
    const courseRoutes = require('./routes/course');
    const batchRoutes = require('./routes/batch');
    const expenseRoutes = require('./routes/expense');
    const settingRoutes = require('./routes/setting');
    const liveClassRoutes = require('./routes/liveClass');
    const chatRoutes = require('./routes/chat');
    const paymentRoutes = require('./routes/payment');
    const statsRoutes = require('./routes/stats');
    const usersRoutes = require('./routes/users');
    const enrollmentRoutes = require('./routes/enrollments');

    app.use('/api/auth', authRoutes);
    app.use('/api/students', studentRoutes);
    app.use('/api/courses', courseRoutes);
    app.use('/api/batches', batchRoutes);
    app.use('/api/expenses', expenseRoutes);
    app.use('/api/settings', settingRoutes);
    app.use('/api/live-classes', liveClassRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/payments', paymentRoutes);
    app.use('/api/stats', statsRoutes);
    app.use('/api/users', usersRoutes);
    app.use('/api/enrollments', enrollmentRoutes);
    app.use('/api/reports', require('./routes/reports')); // 🔥 NEW: Reports API

    // Health check
    app.get('/api/health', (req, res) => {
        res.json({ status: 'Server is running ✅', port: PORT, timestamp: new Date() });
    });

    // 404 Handler
    app.use((req, res) => {
        res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
    });

    // Global Error Handler
    app.use((err, req, res, next) => {
        console.error('❌ Server Error:', err);
        res.status(500).json({ error: err.message || 'Internal server error' });
    });
}

// ============ START SERVER (with EADDRINUSE fix) ============
function startServer() {
    initializeSocketIO();
    setupRoutes();

    function onListening() {
        console.log(`
╔════════════════════════════════════════════╗
║   ✅  Hunar Asaan CRM — Server Running     ║
║   📍  http://localhost:5001                ║
║   📊  Database: ${process.env.DB_NAME || 'hunar_db'}              ║
║   🌐  CORS: ports 5173-5176 allowed        ║
╚════════════════════════════════════════════╝
        `);
    }

    // Try to listen on the port
    server.listen(PORT, '0.0.0.0', onListening);

    // Handle startup errors (keep port strict: 5001)
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`❌ Port ${PORT} is already in use. Stop the other process using ${PORT} and restart the server.`);
            process.exit(1);
        } else {
            console.error('❌ Server error:', err);
            process.exit(1);
        }
    });
}

module.exports = { app, server };
