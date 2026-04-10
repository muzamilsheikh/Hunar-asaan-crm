# 🚀 Hunar Asaan CRM - Complete Deployment Guide

**Project Type:** Full-Stack MERN (React + Node.js/Express + MySQL)  
**Status:** ✅ Ready for Production Deployment

---

## 📂 PROJECT STRUCTURE

### Frontend (React + Vite)
```
root/
├── src/
│   ├── pages/         # Page components
│   ├── components/    # Reusable UI components
│   ├── context/       # React Context (AppContext.jsx for state)
│   ├── utils/         # API client, helpers
│   ├── assets/        # Images, fonts
│   ├── App.jsx        # Root component
│   ├── main.jsx       # React DOM entry point
│   └── index.css      # Global styles
├── public/            # Static assets
├── index.html         # HTML entry point
├── vite.config.js     # Vite configuration
├── tailwind.config.js # Tailwind CSS config
├── package.json       # Frontend dependencies
└── dist/              # **Build output (created by 'npm run build')**
```

### Backend (Node.js + Express)
```
server/
├── index.js                    # **Main entry point (server startup)**
├── package.json                # Backend dependencies
├── .env                        # Environment variables (⚠️ contains DB credentials)
├── models/
│   └── index.js                # **All Sequelize models + associations**
├── controllers/
│   ├── authController.js       # Login, signup, JWT
│   ├── studentController.js
│   ├── courseController.js
│   ├── batchController.js
│   ├── expenseController.js
│   ├── paymentController.js
│   ├── liveClassController.js
│   ├── chatController.js
│   ├── enrollmentController.js
│   ├── statsController.js
│   ├── reportsController.js
│   ├── settingController.js
│   └── userController.js
├── routes/
│   ├── auth.js                 # Authentication endpoints
│   ├── student.js
│   ├── course.js
│   ├── batch.js
│   ├── payment.js
│   ├── enrollments.js
│   └── ... (11 routes total)
├── middleware/
│   └── auth.js                 # JWT verification middleware
├── socket.js                   # WebSocket (Socket.io) configuration
├── seedData.js                 # Database seeding script
├── uploads/                    # File storage (logos, etc.)
└── hunar_db.sql                # Database schema backup
```

---

## 🔐 ENVIRONMENT VARIABLES

### Backend (server/.env) - MUST CONFIGURE

```env
# === SERVER CONFIGURATION ===
NODE_ENV=production                          # Change from 'development'
PORT=5001                                    # Can be changed (defaults to 5001)
APP_URL=https://yourdomain.com               # Your production domain

# === DATABASE CONFIGURATION ===
DB_HOST=your-cloud-db-host.com               # Cloud database host (e.g., AWS RDS, PlanetScale)
DB_USER=your_db_user                         # Database username
DB_PASSWORD=strong-secure-password           # ⚠️ Use strong password!
DB_NAME=hunar_db                             # Database name (keep as is)

# === JWT CONFIGURATION ===
JWT_SECRET=your-random-secure-key-min-32-chars    # ⚠️ Generate random: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# === SMTP CONFIGURATION (for email notifications) ===
SMTP_HOST=smtp.gmail.com                     # Gmail: smtp.gmail.com
SMTP_PORT=587                                # Gmail: 587
SMTP_USER=your-email@gmail.com               # Your Gmail address
SMTP_PASS=your-app-password                  # Gmail App Password (not regular password)
SMTP_FROM=notifications@yourdomain.com       # From email address
```

### Frontend (root/.env) - CREATE NEW IF MISSING

```env
VITE_API_URL=https://yourdomain.com/api      # Backend API URL
VITE_SOCKET_URL=https://yourdomain.com       # WebSocket URL (for live chat)
NODE_ENV=production
```

---

## 🗄️ DATABASE SCHEMA

### Models (Sequelize ORM)

The database is automatically created and synced using Sequelize models in `server/models/index.js`.

**Tables Created:**
1. **Users** - Admin/Staff users (Roles: Admin, Manager, Ads Manager, Staff)
2. **Courses** - Course information (name, fee, duration, code)
3. **Batches** - Course batches (timing, meeting links, drive links)
4. **Students** - Student enrollments and financial tracking
5. **Enrollments** - M:N relationship between Students & Courses (installment plans)
6. **InstallmentSchedules** - Monthly installment tracking
7. **Payments** - Payment records (date, method, amount)
8. **Expenses** - Business expenses (office, utilities, salaries)
9. **Settings** - Institute configuration (name, contact, SMTP settings)
10. **LiveClasses** - Live class scheduling
11. **ChatGroups** - Batch/student chat groups
12. **ChatMessages** - Messages within groups (text, image, file)

### Database Creation Process

**Automatic (Recommended):**
```bash
# Server automatically creates database on startup
node server/index.js
# Sequelize will run: CREATE DATABASE IF NOT EXISTS hunar_db
# And sync all models with: sequelize.sync({ alter: true })
```

**Manual SQL Backup:**
```bash
# Export existing database
mysqldump -u root hunar_db > hunar_db_backup.sql

# Import to production database
mysql -u user -p database_name < hunar_db_backup.sql
```

**Manual DB Creation (Non-Sequelize):**
Use the SQL schema file: `server/hunar_db.sql`

---

## 🚀 BACKEND ENTRY POINT

### Main Server File
**File:** `server/index.js`

**Start Scripts (package.json):**
```json
{
  "scripts": {
    "dev": "node index.js",      # Development mode
    "start": "node index.js",    # Production mode
    "seed": "node seedData.js",  # Seed initial data
    "reset-db": "node reset-database.js"
  }
}
```

### Server Startup Flow
1. Load environment variables from `.env`
2. Create Express app with CORS configuration
3. Initialize MySQL database (auto-creates if missing)
4. Sync Sequelize models
5. Initialize Socket.io connection
6. Setup 13 API route groups
7. Start HTTP server on port 5001 (or custom PORT)

### Health Check Endpoint
```
GET /api/health
Response: { status: 'Server is running ✅', port: 5001, timestamp: ... }
```

---

## 🌐 CORS CONFIGURATION

### Current Development CORS (server/index.js)
```javascript
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
```

### ⚠️ REQUIRED CHANGES FOR PRODUCTION

**Update server/index.js CORS configuration:**
```javascript
app.use(cors({
    origin: [
        'https://yourdomain.com',           # Your Vercel/production domain
        'https://www.yourdomain.com',       # WWW variant
        'http://localhost:3000',            # Keep for local testing if needed
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization']
}));
```

### API Endpoints Available

**Authentication:**
- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - New user registration
- `GET /api/auth/me` - Get current user info

**Core Resources:**
- `GET/POST /api/students` - Student management
- `GET/POST /api/courses` - Course management
- `GET/POST /api/batches` - Batch management
- `GET/POST /api/payments` - Payment tracking
- `GET/POST /api/expenses` - Expense tracking
- `GET/POST /api/enrollments` - Student enrollments
- `GET/POST /api/live-classes` - Class scheduling
- `GET/POST /api/chat` - Chat messaging
- `GET /api/stats` - Dashboard statistics
- `GET /api/reports` - Report generation
- `GET/POST /api/settings` - System settings
- `GET/POST /api/users` - User management

---

## 📋 MISSING/REQUIRED CONFIGURATION FILES

### ✅ Already Present
- ✅ `vite.config.js` - Vite build & dev server config
- ✅ `tailwind.config.js` - Tailwind CSS configuration
- ✅ `postcss.config.js` - PostCSS plugins
- ✅ `eslint.config.js` - Code linting rules
- ✅ `server/.env` - Backend environment variables
- ✅ `server/models/index.js` - Database schema via Sequelize

### ⚠️ MISSING - CREATE BEFORE DEPLOYMENT

1. **Frontend .env file** (root/.env)
   ```env
   VITE_API_URL=https://your-backend-domain.com/api
   VITE_SOCKET_URL=https://your-backend-domain.com
   NODE_ENV=production
   ```

2. **Vercel Configuration** (Optional but recommended)
   Create `vercel.json` in root:
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "routes": [
       { "src": "/api/(.*)", "dest": "https://your-backend-url/api/$1" },
       { "src": "/(.*)", "dest": "/index.html", "status": 200 }
     ]
   }
   ```

3. **Server Deployment Config** (if using Vercel/Railway for backend)
   Create `server/vercel.json`:
   ```json
   {
     "buildCommand": "npm install",
     "startCommand": "npm start",
     "env": {
       "NODE_ENV": "production",
       "DB_HOST": "@db-host",
       "DB_USER": "@db-user",
       "DB_PASSWORD": "@db-password"
     }
   }
   ```

---

## 🛠️ DEPLOYMENT SUMMARY

### Step 1: Prepare Frontend
```bash
cd root-directory
npm install
npm run build
# Output: dist/ folder ready for hosting
```

### Step 2: Prepare Backend
```bash
cd server
npm install
# Update .env with production credentials
node index.js
# Or use: npm start
```

### Step 3: Database Setup
```bash
# Option A: Auto-sync (recommended)
node server/index.js  # Sequelize handles creation

# Option B: Manual SQL import
mysql -u user -p prod_db < server/hunar_db.sql
```

### Step 4: Seed Initial Data
```bash
cd server
node seedData.js
# Creates admin user: admin@hunarasaan.com / Hunar123@321@123
```

### Step 5: Update CORS & Env Variables
- Update `server/index.js` CORS origins
- Create `root/.env` for frontend API URLs
- Update `server/.env` with production DB credentials

### Step 6: Deploy
- **Frontend:** Upload `dist/` to Vercel/hosting
- **Backend:** Deploy `server/` to Heroku/Railway/AWS EC2
- **Database:** MySQL instance on cloud (AWS RDS, PlanetScale, etc.)

---

## 📊 TECH STACK SUMMARY

| Component | Technology | Version |
|-----------|-----------|---------|
| **Frontend** | React | 19.2.0 |
| **Build Tool** | Vite | Latest |
| **Styling** | Tailwind CSS | 4.1.18 |
| **UI Icons** | Lucide React | 0.564.0 |
| **Animations** | Framer Motion | 12.34.0 |
| **HTTP Client** | Axios | 1.13.5 |
| **State Management** | React Context | Native |
| **Routing** | React Router | 7.13.0 |
| **Backend** | Express.js | 5.2.1 |
| **Database ORM** | Sequelize | 6.37.7 |
| **Database** | MySQL | 8.0+ |
| **Authentication** | JWT | 9.0.3 |
| **Password Hashing** | Bcryptjs | 3.0.3 |
| **Real-time** | Socket.io | 4.8.3 |
| **Email** | Nodemailer | 8.0.1 |
| **File Upload** | Multer | 2.0.2 |
| **CSV/Excel** | XLSX | 0.18.5 |
| **PDF Generation** | jsPDF + html2canvas | Latest |

---

## 🔑 CRITICAL PRODUCTION CHECKLIST

- [ ] Change `NODE_ENV` from `development` to `production`
- [ ] Generate new `JWT_SECRET` (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] Set strong `DB_PASSWORD` (min 16 characters, alphanumeric + special chars)
- [ ] Update CORS origins in `server/index.js`
- [ ] Configure real database host (not localhost)
- [ ] Update `APP_URL` to production domain
- [ ] Create `root/.env` with correct API URLs
- [ ] Configure SMTP for email notifications (or disable)
- [ ] Run `npm run build` for frontend
- [ ] Test API endpoints before going live
- [ ] Setup SSL/HTTPS for all domains
- [ ] Setup database backups (daily recommended)
- [ ] Setup monitoring/logging for production
- [ ] Configure CI/CD pipeline for auto-deployment

---

## 📞 SUPPORT

**Key Files to Share with Deployment Team:**
1. This guide (`DEPLOYMENT_GUIDE_COMPLETE.md`)
2. `server/.env` (with placeholder values)
3. `server/models/index.js` (database schema)
4. `server/hunar_db.sql` (SQL backup)
5. `server/index.js` (server configuration)
6. `vite.config.js` (frontend build config)

**Questions to Ask Your Hosting Provider:**
- Do they support Node.js 18+?
- Do they support WebSocket (Socket.io)?
- What's the file upload size limit?
- Do they provide MySQL database?
- How do I set environment variables?
- Is there auto-restart on crash?

---

**Generated:** April 2026  
**Project:** Hunar Asaan CRM - Educational Management System
