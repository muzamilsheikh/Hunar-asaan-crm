// ============ VERCEL SERVERLESS OPTIMIZED SERVER ============
// This is adapted for Vercel serverless environment
// Vercel automatically wraps this export as a serverless function

require('dotenv').config({ path: __dirname + '/.env' });

// ============ DEPENDENCIES ============
const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const fs = require('fs');

// ============ CORS CONFIGURATION ============
app.use(cors({
    origin: [
        // Development URLs
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176',
        // Production URLs
        'https://hunar-asaan-crm.vercel.app',
        'https://www.hunar-asaan-crm.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));

// ============ MIDDLEWARE ============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));


// ============ DATABASE INITIALIZATION ============
const { Sequelize } = require('sequelize');

// Singleton pattern for database connection (critical for serverless)
let globalSequelize = null;
let dbInitialized = false;
let dbInitializing = false;
let initPromise = null;

async function initializeDatabase() {
    // Return existing promise if already initializing
    if (dbInitializing && initPromise) {
        return initPromise;
    }

    // Return immediately if already initialized
    if (dbInitialized && globalSequelize) {
        return globalSequelize;
    }

    dbInitializing = true;

    initPromise = (async () => {
        let retries = 5;

        while (retries > 0) {
            try {
                // Create database if it doesn't exist
                const sequelizeAdmin = new Sequelize('mysql', process.env.DB_USER || 'root', process.env.DB_PASSWORD || '', {
                    host: process.env.DB_HOST || '127.0.0.1',
                    port: process.env.DB_PORT || 3306,
                    dialect: 'mysql',
                    logging: false,
                    dialectOptions: {
                        connectTimeout: 60000,
                        ssl: process.env.DB_SSL === 'true' ? 'Amazon RDS' : false
                    },
                    pool: {
                        max: 2,      // Reduced for serverless
                        min: 0,
                        acquire: 30000,
                        idle: 5000
                    }
                });

                await sequelizeAdmin.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'hunar_db'}\``);
                console.log(`✅ Database "${process.env.DB_NAME || 'hunar_db'}" is ready`);
                await sequelizeAdmin.close();

                // Import and initialize models
                const models = require('./models');
                globalSequelize = models.sequelize;

                // Set global references
                global.sequelize = globalSequelize;
                global.User = models.User;
                global.Course = models.Course;
                global.Batch = models.Batch;
                global.Student = models.Student;
                global.Expense = models.Expense;
                global.Setting = models.Setting;
                global.LiveClass = models.LiveClass;
                global.ChatGroup = models.ChatGroup;
                global.ChatMessage = models.ChatMessage;
                global.Payment = models.Payment;

                await globalSequelize.authenticate();
                console.log('✅ Connected to MySQL via Sequelize');
                
                // Sync database (alter: false for safety)
                await globalSequelize.sync({ alter: false });
                console.log('✅ All models synchronized with database');

                dbInitialized = true;
                dbInitializing = false;
                return globalSequelize;

            } catch (error) {
                retries--;
                console.error(`❌ Database Error (retries left: ${retries}):`, error.message);

                if (retries > 0) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                } else {
                    console.error('❌ Failed to connect to database');
                    throw error;
                }
            }
        }
    })();

    return initPromise;
}

// ============ SOCKET.IO SETUP (Limited for Serverless) ============
// Note: WebSocket support is limited in serverless
let io = null;

function getSocketIO() {
    if (!io && process.env.ENABLE_SOCKET_IO === 'true') {
        // Socket.IO setup if needed and available
        const { initializeSocket } = require('./socket');
        // Note: This may not work optimally in serverless environment
        try {
            // io = initializeSocket(server); // Skip for now in serverless
            console.log('⚠️  Socket.IO limited in serverless environment');
        } catch (error) {
            console.warn('⚠️  Socket.IO initialization skipped:', error.message);
        }
    }
    return io;
}

// ============ SETUP ROUTES ============
async function setupRoutes() {
    // Initialize database first
    await initializeDatabase();

    // Auth routes (must include database)
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
    const reportsRoutes = require('./routes/reports');

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
    app.use('/api/reports', reportsRoutes);

    // Health check endpoint
    app.get('/api/health', async (req, res) => {
        try {
            if (globalSequelize) {
                await globalSequelize.authenticate();
                res.json({
                    status: '✅ Server is running',
                    environment: process.env.NODE_ENV || 'development',
                    database: 'Connected',
                    timestamp: new Date().toISOString()
                });
            } else {
                res.json({
                    status: '⏳ Server is initializing',
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            res.status(503).json({
                status: '❌ Server error',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
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

// ============ INITIALIZE ROUTES ON STARTUP ============
setupRoutes().catch(error => {
    console.error('❌ Failed to setup routes:', error);
});

// ============ EXPORT FOR VERCEL SERVERLESS ============
// Vercel will wrap this as a serverless function
module.exports = app;

// ============ LOCAL DEVELOPMENT SERVER ============
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`
╔════════════════════════════════════════════╗
║   ✅  Hunar Asaan CRM — Server Running     ║
║   📍  http://localhost:${PORT}                ║
║   📊  Database: ${process.env.DB_NAME || 'hunar_db'}              ║
║   🌐  CORS: ports 5173-5176 + Vercel       ║
╚════════════════════════════════════════════╝
        `);
    });
}
