# Hunar Asaan CRM - Technical Documentation

**Version:** 1.0.0  
**Last Updated:** April 2, 2026  
**Project Type:** Full-Stack Web Application (CRM System)

---

## Table of Contents

1. [Tech Stack Overview](#tech-stack-overview)
2. [Core Features (Scope of Work)](#core-features-scope-of-work)
3. [Project Directory Tree](#project-directory-tree)
4. [Database Architecture](#database-architecture)
5. [Environment Setup](#environment-setup)
6. [Critical Logic Explanations](#critical-logic-explanations)
7. [API Reference](#api-reference)
8. [Getting Started](#getting-started)
9. [Deployment Considerations](#deployment-considerations)

---

## Tech Stack Overview

### Frontend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 19.2.0 | UI library for building interactive components |
| **Build Tool** | Vite | 7.3.1 | Next-gen frontend build tool for fast development |
| **Routing** | React Router DOM | 7.13.0 | Client-side routing for multi-page navigation |
| **CSS Framework** | Tailwind CSS | 4.1.18 | Utility-first CSS for UI styling |
| **State Management** | React Context API | Built-in | Global state management (user, courses, students, etc.) |
| **HTTP Client** | Axios | 1.13.5 | RESTful API communication with backend |
| **Real-Time Communication** | Socket.IO Client | 4.8.3 | WebSocket-based real-time chat and notifications |
| **Animation** | Framer Motion | 12.34.0 | Smooth UI animations and transitions |
| **UI Components** | Lucide React | 0.564.0 | Icon library for UI elements |
| **Notifications** | React Hot Toast | 2.6.0 | Toast notification system |
| **PDF Generation** | React PDF / jsPDF | 4.3.2 / 4.2.0 | Generate PDF reports and receipts |
| **Excel Export** | XLSX | 0.18.5 | Export data to Excel spreadsheets |
| **Date Utilities** | date-fns | 4.1.0 | Date formatting and manipulation |
| **Charting** | Recharts | 3.7.0 | Data visualization and analytics charts |

### Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Express.js | 5.2.1 | RESTful API server framework |
| **Runtime** | Node.js | 18+ (Recommended) | JavaScript runtime environment |
| **ORM** | Sequelize | 6.37.7 | Object-Relational Mapping for MySQL |
| **Database** | MySQL | 8.0+ (Recommended) | Relational database management system |
| **Database Driver** | mysql2 | 3.17.2 | Native MySQL driver for Node.js |
| **Authentication** | JWT (JSON Web Token) | 9.0.3 | Secure token-based authentication |
| **Password Hashing** | bcryptjs | 3.0.3 | Secure password encryption |
| **Email Service** | Nodemailer | 8.0.1 | Send email notifications |
| **Real-Time** | Socket.IO | 4.8.3 | WebSocket server for live chat |
| **File Upload** | Multer | 2.0.2 | Handle file uploads (logos, documents) |
| **Environment Variables** | dotenv | 17.3.1 | Load .env configuration files |
| **CORS** | cors | 2.8.6 | Cross-Origin Resource Sharing middleware |
| **Body Parser** | body-parser | 2.2.2 | Parse incoming request bodies |

### Development & Code Quality

| Tool | Version | Purpose |
|------|---------|---------|
| **Linter** | ESLint | 9.39.1 | Code quality and style checking |
| **PostCSS** | 8.5.6 | CSS transformation pipeline |
| **Autoprefixer** | 10.4.24 | Vendor-specific CSS prefixes |

---

## Core Features (Scope of Work)

### 1. **User Management & Authentication**
- Multi-role user system (Admin, Manager, Ads Manager, Staff, Student)
- JWT-based authentication with secure login
- Role-based access control (RBAC) for different features
- User status management (Active/Inactive)
- Password encryption using bcryptjs

### 2. **Student Management**
- Comprehensive student profiles with contact information
- Custom student IDs (e.g., MBC-2024-001)
- Student status tracking (Active, Settled, Dropped, Passout, Completed)
- Live uniqueness validation for email, phone, and CNIC
- Student search and filtering capabilities
- Batch and course association tracking

### 3. **Course & Batch Management**
- Create and manage educational courses with fees
- Organize courses into batches with meeting schedules
- Store meeting links and drive links for online classes
- Course duration and course code management
- Batch timing and scheduling

### 4. **Multiple Enrollment System**
- Students can enroll in multiple courses simultaneously
- Duplicate enrollment prevention (one course per student)
- Re-enrollment capability after dropping a course
- Enrollment status tracking (Active, Completed, Dropped)
- Course completion percentage tracking
- Flexible batch assignment per enrollment

### 5. **Advanced Payment & Billing System**

#### 5.1 **Installment Schedule Management**
- Auto-generate installment schedules upon enrollment
- Flexible installment plans (monthly, custom intervals)
- Track down payment and monthly installment amounts
- Installment status monitoring (Pending, Paid)
- Due date calculations and reminders

#### 5.2 **Payment Processing**
- Multiple payment methods support (Cash, Online, Bank)
- Unique receipt number generation for each payment
- Transaction ID tracking for online payments
- Real-time balance calculations
- Payment level financial tracking (per enrollment)
- Automatic Student record updates after payment

#### 5.3 **Fee Ledger & Financial Tracking**
- Total fee and discount management per enrollment
- Cumulative payment history per student
- Outstanding balance calculations
- Payment recovery alerts for overdue fees
- Pending fees summary for collections team

### 6. **Expense Management**
- Track organizational expenses by category
- Categories: Marketing, Utilities, Rent, Salaries, Maintenance, Other
- Date-based expense logging
- Monthly expense summaries

### 7. **Live Class Management**
- Schedule and publish live class sessions
- Store class links and materials
- Class topics and update notes
- Batch-specific class tracking
- Live start time scheduling

### 8. **Real-Time Chat & Communication**
- Batch group chat functionality
- Direct messaging between users
- Real-time message delivery via WebSockets
- Message type support (text, image, file)
- Read status tracking
- Chat groups creation and management

### 9. **Reporting & Analytics**
- Comprehensive student reports
- Enrollment analytics
- Payment and revenue reports
- Course performance metrics
- Fee collection status reports
- Expense analytics
- Customizable report generation

### 10. **System Settings & Configuration**
- Institute branding (name, logo, contact info)
- Email notification configuration (SMTP settings)
- System-wide preferences and defaults
- Logo upload and storage

### 11. **Dashboard & Insights**
- Key performance indicators (KPIs)
- Total revenue and outstanding fees
- Active students and enrollments count
- Recent transactions
- Monthly expense overview
- Quick statistics and summaries

---

## Project Directory Tree

```
hunar-asaan-crm/
├── 📄 package.json                 # Frontend dependencies and scripts
├── 📄 index.html                   # HTML entry point
├── 📄 vite.config.js              # Vite build configuration
├── 📄 tailwind.config.js          # Tailwind CSS theme configuration
├── 📄 postcss.config.js           # PostCSS configuration
├── 📄 eslint.config.js            # ESLint rules and configuration
├── 📁 public/                     # Static assets
├── 📁 src/                        # FRONTEND - React application
│   ├── 📄 main.jsx                # Vite entrypoint
│   ├── 📄 App.jsx                 # Main App component with React Router
│   ├── 📄 index.css               # Global styles
│   ├── 📄 App.css                 # App-level styles
│   ├── 📁 context/
│   │   └── 📄 AppContext.jsx      # Global app state (user, courses, students, socket)
│   ├── 📁 pages/                  # Page components (rendered by routes)
│   │   ├── Dashboard.jsx          # Admin dashboard with KPIs
│   │   ├── Students.jsx           # Student list, create, edit, delete
│   │   ├── Courses.jsx            # Course management (admin only)
│   │   ├── Batches.jsx            # Batch management and scheduling
│   │   ├── Enrollments.jsx        # (if exists) Multi-enrollment interface
│   │   ├── Expenses.jsx           # Expense tracking (admin only)
│   │   ├── Payments.jsx           # (if exists) Payment recording interface
│   │   ├── Reports.jsx            # Report generation and analytics
│   │   ├── Users.jsx              # User management (admin only)
│   │   ├── Roles.jsx              # Role and permission management
│   │   ├── Settings.jsx           # System configuration (admin only)
│   │   ├── LiveClass.jsx          # Live class scheduling
│   │   ├── Chat.jsx               # Real-time chat interface
│   │   ├── Login.jsx              # Authentication page
│   │   └── StudentDashboard.jsx   # Student-specific dashboard
│   ├── 📁 components/             # Reusable React components
│   │   ├── 📁 layout/
│   │   │   ├── Layout.jsx         # Main layout wrapper with nav
│   │   │   └── Sidebar.jsx        # Navigation sidebar
│   │   ├── 📁 students/           # Student-specific components
│   │   │   └── (StudentCard, StudentForm, etc.)
│   │   └── (other component groups)
│   ├── 📁 utils/                  # Utility functions
│   │   ├── api.js                 # Axios API client setup
│   │   └── (helper functions)
│   └── 📁 assets/                 # Images, fonts, etc.

├── 📁 server/                     # BACKEND - Express.js REST API
│   ├── 📄 package.json            # Backend dependencies
│   ├── 📄 index.js                # Express server initialization
│   ├── 📄 db.js                   # Sequelize database connection
│   ├── 📄 .env                    # Environment variables (DB, JWT, SMTP)
│   ├── 📁 models/
│   │   └── 📄 index.js            # Sequelize ORM models (ALL models defined here)
│   ├── 📁 controllers/            # Business logic for each resource
│   │   ├── authController.js      # Login, token validation, password reset
│   │   ├── studentController.js   # CRUD for students, uniqueness checks
│   │   ├── courseController.js    # CRUD for courses
│   │   ├── batchController.js     # CRUD for batches
│   │   ├── enrollmentController.js # Multi-enrollment logic + schedule generation
│   │   ├── paymentController.js   # Payment processing, balance calculations
│   │   ├── expenseController.js   # Expense CRUD
│   │   ├── liveClassController.js # Live class scheduling
│   │   ├── chatController.js      # Chat group and message handling
│   │   ├── userController.js      # User CRUD and role management
│   │   ├── reportsController.js   # Report generation and data aggregation
│   │   ├── statsController.js     # Dashboard statistics and KPIs
│   │   ├── settingController.js   # System settings management
│   │   └── (other controllers)
│   ├── 📁 routes/                 # API routing definitions
│   │   ├── auth.js                # POST /api/auth/* (login, register, verify)
│   │   ├── student.js             # GET/POST/PUT/DELETE /api/students
│   │   ├── course.js              # GET/POST/PUT/DELETE /api/courses
│   │   ├── batch.js               # GET/POST/PUT/DELETE /api/batches
│   │   ├── enrollments.js         # POST/GET/PATCH/DELETE /api/enrollments
│   │   ├── payment.js             # POST/GET /api/payments (fee ledger)
│   │   ├── expense.js             # GET/POST/PUT/DELETE /api/expenses
│   │   ├── liveClass.js           # GET/POST/PUT/DELETE /api/live-class
│   │   ├── chat.js                # GET/POST /api/chat
│   │   ├── users.js               # GET/POST/PUT/DELETE /api/users
│   │   ├── reports.js             # GET /api/reports/*
│   │   ├── stats.js               # GET /api/stats
│   │   ├── setting.js             # GET/PUT /api/settings
│   │   └── (other routes)
│   ├── 📁 middleware/
│   │   └── 📄 auth.js             # JWT authentication middleware
│   ├── 📁 utils/
│   │   ├── email.js               # Email sending utilities (Nodemailer)
│   │   ├── socket.js              # Socket.IO event handlers
│   │   └── (helper functions)
│   ├── 📁 uploads/                # File storage (logos, documents)
│   │   └── settings/              # Institute logo storage
│   ├── 📁 seeds/                  # Database seeding scripts
│   │   ├── seed.js                # Initial data seeding
│   │   ├── seedData.js            # Seed data definitions
│   │   └── import-*.sql           # SQL import scripts for bulk data
│   ├── 📁 socket.js               # WebSocket configuration and handlers
│   └── 📄 (database files - db.json)

├── 📄 README.md                   # Project overview (original)
└── 📄 TECHNICAL_DOCUMENTATION.md  # This file
```

---

## Database Architecture

### Database Connection

The application uses **Sequelize ORM** to connect to **MySQL** with the following configuration:

```javascript
// Connection Details (from models/index.js)
Sequelize Instance:
- Database: process.env.DB_NAME (default: 'hunar_db')
- User: process.env.DB_USER (default: 'root')
- Password: process.env.DB_PASSWORD
- Host: process.env.DB_HOST (default: '127.0.0.1')
- Port: 3306 (MySQL default)
- Dialect: 'mysql'
- Pool: max=5, min=0, acquire=30000ms, idle=10000ms
```

### Database Tables & Models

#### 1. **Users Table**
```sql
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'Manager', 'Ads Manager', 'Staff', 'Student') DEFAULT 'Staff',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose:** System users with authentication and role-based access control.

---

#### 2. **Courses Table**
```sql
CREATE TABLE Courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    fee FLOAT NOT NULL,
    duration VARCHAR(100),
    code VARCHAR(50) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose:** Educational courses offered by the institute.
**Key Fields:**
- `fee`: Base fee for the course
- `code`: Unique course code for reference

---

#### 3. **Batches Table**
```sql
CREATE TABLE Batches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    time VARCHAR(100),
    meetingLink VARCHAR(500),
    driveLink VARCHAR(500),
    courseId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE SET NULL
);
```
**Purpose:** Organize courses into separate batch schedules.
**Relationships:**
- `courseId` → Courses (One-to-Many)

---

#### 4. **Students Table**
```sql
CREATE TABLE Students (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customId VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    cnic VARCHAR(20),
    address TEXT,
    totalFee FLOAT DEFAULT 0,
    paidAmount FLOAT DEFAULT 0,
    totalPaid FLOAT DEFAULT 0,
    discount FLOAT DEFAULT 0,
    totalInstallments INT DEFAULT 2,
    status ENUM('Active', 'Settled', 'Dropped', 'Passout', 'Completed') DEFAULT 'Active',
    courseId INT,
    batchId INT,
    commencementDate DATE,
    next_due_date DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE SET NULL,
    FOREIGN KEY (batchId) REFERENCES Batches(id) ON DELETE SET NULL
);
```
**Purpose:** Student profiles and aggregated financial tracking.
**Key Fields:**
- `customId`: Human-readable student ID (e.g., MBC-2024-001)
- `status`: Active, Settled (fully paid), Dropped, Passout, Completed
- `totalFee`, `paidAmount`, `totalPaid`: Financial tracking (aggregated from Enrollments/Payments)
- `next_due_date`: Billing cycle reference date

**⚠️ Important:** This table stores aggregated data. The source of truth for fees is the `Enrollments` table for individual courses and `Payments` table for actual transactions.

---

#### 5. **Enrollments Table** (M:N Join Table)
```sql
CREATE TABLE Enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    studentId INT NOT NULL,
    courseId INT,
    batchId INT,
    enrollmentDate DATE NOT NULL,
    status ENUM('Active', 'Completed', 'Dropped') DEFAULT 'Active',
    completionPercentage INT DEFAULT 0,
    notes TEXT,
    totalFee DECIMAL(10, 2) DEFAULT 0,
    discount DECIMAL(10, 2) DEFAULT 0,
    installmentsAllowed BOOLEAN DEFAULT FALSE,
    downPayment DECIMAL(10, 2) DEFAULT 0,
    installmentMonths INT DEFAULT 1,
    monthlyAmount DECIMAL(10, 2) DEFAULT 0,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (courseId) REFERENCES Courses(id) ON DELETE SET NULL,
    FOREIGN KEY (batchId) REFERENCES Batches(id) ON DELETE SET NULL
);
```
**Purpose:** Link students to courses (Many-to-Many relationship).
**Key Fields:**
- `totalFee`, `discount`: Per-enrollment financial terms
- `installmentsAllowed`: Enable/disable installment plans
- `downPayment`: Initial payment required
- `installmentMonths`, `monthlyAmount`: Installment configuration
- **Duplicate Prevention:** Database enforces one active enrollment per student-course combination

---

#### 6. **InstallmentSchedule Table**
```sql
CREATE TABLE InstallmentSchedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    enrollmentId INT NOT NULL,
    dueDate DATE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('Pending', 'Paid') DEFAULT 'Pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollmentId) REFERENCES Enrollments(id) ON DELETE CASCADE
);
```
**Purpose:** Auto-generated payment schedule for each enrollment.
**Key Fields:**
- `dueDate`: Payment due date
- `amount`: Installment amount
- `status`: Updated to 'Paid' when payment received
- **Auto-Generated:** Created when enrollment is created with `installmentsAllowed=true`

---

#### 7. **Payments Table** (Fee Ledger)
```sql
CREATE TABLE Payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    studentId INT NOT NULL,
    enrollmentId INT,
    amountPaid FLOAT NOT NULL,
    paymentDate DATE NOT NULL,
    paymentMethod ENUM('Cash', 'Online', 'Bank') NOT NULL,
    transactionId VARCHAR(100),
    receiptNo VARCHAR(50) NOT NULL UNIQUE,
    remainingBalance FLOAT NOT NULL DEFAULT 0,
    status ENUM('Pending', 'Paid') DEFAULT 'Paid',
    installmentNo INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (studentId) REFERENCES Students(id) ON DELETE CASCADE,
    FOREIGN KEY (enrollmentId) REFERENCES Enrollments(id) ON DELETE SET NULL
);
```
**Purpose:** Complete payment history and fee ledger.
**Key Fields:**
- `receiptNo`: Unique receipt for each transaction
- `enrollmentId`: Tracks payment to specific course
- `remainingBalance`: Outstanding balance after this payment
- `status`: Paid or Pending
- **Source of Truth:** This is where all payment amounts are recorded

---

#### 8. **Expenses Table**
```sql
CREATE TABLE Expenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(500) NOT NULL,
    amount FLOAT NOT NULL DEFAULT 0,
    category ENUM('Marketing', 'Utilities', 'Rent', 'Salaries', 'Maintenance', 'Other') DEFAULT 'Other',
    date DATE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose:** Organizational expense tracking.

---

#### 9. **Settings Table**
```sql
CREATE TABLE Settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    instituteName VARCHAR(255) DEFAULT 'Hunar Asaan',
    contact VARCHAR(100),
    address TEXT,
    logoUrl VARCHAR(500),
    emailHost VARCHAR(255),
    emailPort VARCHAR(10) DEFAULT '587',
    emailUser VARCHAR(255),
    emailPass VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
**Purpose:** System configuration and branding.

---

#### 10. **LiveClasses Table**
```sql
CREATE TABLE LiveClasses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    batchId INT NOT NULL,
    classLink VARCHAR(500),
    topic VARCHAR(255) NOT NULL,
    startTime DATE,
    updateNote TEXT DEFAULT '',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batchId) REFERENCES Batches(id)
);
```
**Purpose:** Schedule and manage live class sessions.

---

#### 11. **ChatGroups Table**
```sql
CREATE TABLE ChatGroups (
    id INT PRIMARY KEY AUTO_INCREMENT,
    groupName VARCHAR(255) NOT NULL,
    batchId INT,
    type ENUM('batch', 'direct') DEFAULT 'batch',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (batchId) REFERENCES Batches(id)
);
```
**Purpose:** Group chats for batches and direct messaging.

---

#### 12. **ChatMessages Table**
```sql
CREATE TABLE ChatMessages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    senderId INT NOT NULL,
    receiverId INT,
    groupId INT,
    message TEXT NOT NULL,
    messageType ENUM('text', 'image', 'file') DEFAULT 'text',
    readStatus BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES Users(id),
    FOREIGN KEY (receiverId) REFERENCES Users(id),
    FOREIGN KEY (groupId) REFERENCES ChatGroups(id)
);
```
**Purpose:** Store chat messages for real-time communication.

---

### Table Relationships Diagram

```
Users (1) ──→ (Many) ChatMessages
Users (1) ──→ (Many) Payments

Students (1) ──→ (Many) Enrollments
Courses (1) ──→ (Many) Enrollments
Batches (1) ──→ (Many) Enrollments

Enrollments (1) ──→ (Many) InstallmentSchedules
Enrollments (1) ──→ (Many) Payments

Students (1) ──→ (Many) Payments
Students (1) ──→ (Many) LiveClasses (via Batch)

Courses (1) ──→ (Many) Batches
Batches (1) ──→ (Many) LiveClasses
Batches (1) ──→ (Many) ChatGroups

ChatGroups (1) ──→ (Many) ChatMessages
```

---

## Environment Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** package manager
- **MySQL** 8.0 or higher
- **Git** for version control

### Installation Steps

#### 1. Clone Repository

```bash
git clone <repository-url>
cd hunar-asaan-crm
```

#### 2. Setup Frontend

```bash
# Install frontend dependencies
npm install

# Create frontend .env (if needed)
echo "VITE_API_URL=http://localhost:5001" > .env
```

#### 3. Setup Backend

```bash
cd server

# Install backend dependencies
npm install

# Create .env file with configuration
cat > .env << 'EOF'
NODE_ENV=development
APP_URL=http://localhost:5173

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hunar_db

# JWT Secret (keep this secure and unique in production)
JWT_SECRET=hunar_asaan_jwt_secret_2026

# SMTP Configuration for Email Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=your-email@gmail.com

# Server Port
PORT=5001
EOF
```

### Environment Variables Explained

| Variable | Default | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `development` | Application environment (development/production) |
| `APP_URL` | `http://localhost:5173` | Frontend URL for CORS and redirects |
| `DB_HOST` | `localhost` | MySQL server hostname |
| `DB_USER` | `root` | MySQL user account |
| `DB_PASSWORD` | `` | MySQL password (empty by default) |
| `DB_NAME` | `hunar_db` | Database name |
| `JWT_SECRET` | `hunar_asaan_jwt_secret_2026` | Secret key for JWT signing (change in production!) |
| `SMTP_HOST` | `smtp.gmail.com` | Email server hostname |
| `SMTP_PORT` | `587` | Email server port |
| `SMTP_USER` | `` | Email account username |
| `SMTP_PASS` | `` | Email account password or app password |
| `SMTP_FROM` | `` | Sender email address |
| `PORT` | `5001` | Backend server port |

### Database Setup

#### 1. Create MySQL Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE hunar_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Run Migrations (via Sequelize)

The application auto-synchronizes the database on startup:

```javascript
// From server/index.js
await sequelize.sync({ alter: true }); // Creates/updates tables
```

#### 3. Seed Initial Data (Optional)

```bash
cd server
npm run seed
```

### Running the Application

#### Terminal 1: Backend Server

```bash
cd server
npm run dev

# Expected output:
# ✅ Connected to MySQL via Sequelize
# Server running on http://localhost:5001
```

#### Terminal 2: Frontend Development Server

```bash
npm run dev

# Expected output:
# VITE v7.3.1  ready in 123 ms
# ➜  Local:   http://localhost:5173/
# ➜  press h to show help
```

### Building for Production

#### Frontend Build

```bash
npm run build

# Output: dist/ folder with optimized assets
npm run preview  # Test production build locally
```

#### Backend (No build needed)

Simply deploy the `server/` directory and run:

```bash
npm install --only=production
npm start
```

---

## Critical Logic Explanations

### 1. Auto-Installment Generator

**Location:** `server/controllers/enrollmentController.js` → `createEnrollment()`

#### How It Works:

When a student enrolls in a course with installment payments enabled, the system automatically generates a payment schedule:

```javascript
// When enrollment created with installmentsAllowed=true:
{
    studentId: 1,
    courseId: 5,
    totalFee: 50000,
    discount: 5000,
    installmentsAllowed: true,
    downPayment: 10000,
    installmentMonths: 4,
    monthlyAmount: 10000
}

// Auto-Generated InstallmentSchedule:
[
    { dueDate: '2026-04-15', amount: 10000, status: 'Pending' },  // Month 1
    { dueDate: '2026-05-15', amount: 10000, status: 'Pending' },  // Month 2
    { dueDate: '2026-06-15', amount: 10000, status: 'Pending' },  // Month 3
    { dueDate: '2026-07-15', amount: 10000, status: 'Pending' }   // Month 4
]
```

#### Key Features:

1. **Date Calculation:** Starting from enrollment date, add months (Month 1 = enrollment date, Month 2 = +1 month, etc.)
2. **Atomic Creation:** Uses Sequelize `bulkCreate()` for performance
3. **Flexible Amounts:** Each installment can have different amounts (monthly amount set in enrollment)
4. **Status Tracking:** Each installment tracked as Pending/Paid independently

#### Business Logic:

```javascript
// Calculate due dates
const startDate = new Date(enrollment.enrollmentDate);
for (let i = 0; i < installmentMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i);  // Add months
    
    schedules.push({
        enrollmentId: enrollment.id,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: monthlyAmount,  // Can be customized per installment
        status: 'Pending'
    });
}
```

---

### 2. Multiple Enrollment Logic

**Location:** `server/controllers/enrollmentController.js` → `createEnrollment()`

#### How It Works:

The system allows students to enroll in multiple courses simultaneously while preventing duplicate enrollments:

#### Duplicate Prevention:

```javascript
// Check if student already enrolled in this course (and not dropped)
const existing = await Enrollment.findOne({
    where: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        status: { [Op.ne]: 'Dropped' }  // Allow re-enrolment after drop
    }
});

if (existing) {
    return res.status(409).json({
        error: `Student is already enrolled in "${course.name}". Cannot enroll twice.`
    });
}
```

#### Key Features:

1. **Per-Course Enrollment:** Each course gets separate financial terms
2. **Independent Scheduling:** Each enrollment can have different installment plans
3. **Re-enrollment:** Students can re-enroll after dropping a course
4. **Status Isolation:** Enrollment status independent from student status

#### Database Example:

```sql
-- Student ID 1 can have multiple Enrollments:
SELECT * FROM Enrollments WHERE studentId = 1;

-- Returns:
-- | id | studentId | courseId | totalFee | status | installmentMonths |
-- |----|-----------|----------|----------|--------|-------------------|
-- | 1  | 1         | 5        | 50000    | Active | 4                 |
-- | 2  | 1         | 7        | 30000    | Active | 2                 |
-- | 3  | 1         | 5        | 50000    | Active | (re-enroll)       |

-- BUT: Cannot have 2 active enrollments in same course
```

#### Business Logic:

1. **Enrollment Uniqueness:** `studentId + courseId` must be unique per active enrollment
2. **Financial Isolation:** Each enrollment tracked separately in `Payments` table
3. **Progress Tracking:** Completion percentage per enrollment, not student-wide
4. **Schedule Independence:** Each enrollment can have different installment plans

---

### 3. Payment Processing & Fee Ledger

**Location:** `server/controllers/paymentController.js` → `createPayment()`

#### How It Works:

When a payment is received, the system updates multiple records to maintain financial consistency:

#### Payment Flow:

```javascript
// 1. Record payment
const payment = await Payment.create({
    studentId,
    enrollmentId,
    amountPaid,
    paymentDate: new Date(),
    paymentMethod,
    receiptNo: generateReceiptNo(),
    remainingBalance: currentRemaining - amountPaid,
    status: 'Paid'
});

// 2. Update Student record
const updatedCumulativeTotalPaid = await calculateCumulativeTotalPaid(studentId);
await student.update({
    totalPaid: updatedCumulativeTotalPaid,
    paidAmount: updatedCumulativeTotalPaid,
    next_due_date: incrementNextDueDate(student.next_due_date)
});

// 3. Mark InstallmentSchedule as Paid (if enrollment specified)
const earliestPending = await InstallmentSchedule.findOne({
    where: { enrollmentId, status: 'Pending' },
    order: [['dueDate', 'ASC']]
});
if (earliestPending) {
    await earliestPending.update({ status: 'Paid' });
}
```

#### Key Features:

1. **Atomic Transaction:** Uses database transactions to prevent inconsistency
2. **Balance Validation:** Prevents overpayments
3. **Receipt Generation:** Unique receipt number for audit trail
4. **Multi-Enrollment Support:** Payments can be linked to specific enrollments
5. **Cumulative Tracking:** Student's `totalPaid` calculated from all payments

#### Financial Calculations:

```javascript
// Remaining balance = Total Fee - Already Paid
const targetTotalFee = enrollment.totalFee;
const cumulativePaid = await Payment.sum('amountPaid', {
    where: { enrollmentId, status: 'Paid' }
});
const remainingBalance = targetTotalFee - cumulativePaid;

// Validation: Payment cannot exceed remaining balance
if (amountPaid > remainingBalance) {
    throw new Error('Payment exceeds remaining balance');
}
```

#### Payment Status Table:

| Field | Purpose |
|-------|---------|
| `receiptNo` | Unique receipt identifier |
| `enrollmentId` | Links payment to specific course enrollment |
| `remainingBalance` | Outstanding balance after this payment |
| `paymentMethod` | Cash / Online / Bank (for reporting) |
| `transactionId` | Online payment reference (Stripe, PayPal, etc.) |
| `installmentNo` | Installment number for this payment |

---

### 4. Student Record Aggregation

**Location:** Student model and related controllers

#### How It Works:

The `Students` table stores aggregated financial data calculated from related tables:

#### Aggregation Logic:

```javascript
// After any payment, update Student record:

// 1. Calculate totalPaid from ALL payments for this student
const totalPaid = await Payment.sum('amountPaid', {
    where: { studentId, status: 'Paid' }
});

// 2. Calculate total enrolled fee across all courses
const allEnrollments = await Enrollment.findAll({
    where: { studentId }
});
const totalFee = allEnrollments.reduce((sum, e) => sum + e.totalFee, 0);

// 3. Update student record
await Student.update({
    totalFee,
    totalPaid,
    paidAmount: totalPaid,
    discount: totalDiscount
}, { where: { id: studentId } });
```

#### Key Points:

- **Source of Truth:** Payments table is source of truth for payments
- **Aggregated View:** Student table is a materialized view for quick queries
- **Consistency:** Updated via transactions to prevent stale data
- **Financial Status:** Calculated from aggregated data

---

## API Reference

### Authentication

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "admin@example.com",
    "password": "password123"
}

Response (200):
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@example.com",
        "role": "Admin"
    }
}
```

**Headers:** Include `Authorization: Bearer <token>` in all subsequent requests

---

### Students

#### Get All Students (with filters)

```http
GET /api/students?status=Active&courseId=5&search=Ali

Response (200):
{
    "data": [
        {
            "id": 1,
            "customId": "MBC-2024-001",
            "name": "Ali Khan",
            "email": "ali@example.com",
            "phone": "03001234567",
            "cnic": "12345-1234567-1",
            "address": "Karachi, Pakistan",
            "totalFee": 50000,
            "totalPaid": 20000,
            "paidAmount": 20000,
            "discount": 5000,
            "status": "Active",
            "courseId": 5,
            "batchId": 2,
            "createdAt": "2026-04-01T10:00:00Z",
            "updatedAt": "2026-04-01T10:00:00Z"
        }
    ]
}
```

#### Get Student by ID

```http
GET /api/students/1

Response (200):
{
    "id": 1,
    "customId": "MBC-2024-001",
    "name": "Ali Khan",
    "enrollments": [
        {
            "id": 1,
            "courseId": 5,
            "course": {
                "id": 5,
                "name": "Web Development",
                "fee": 50000
            },
            "totalFee": 50000,
            "installmentSchedules": [
                {
                    "id": 1,
                    "dueDate": "2026-05-01",
                    "amount": 12500,
                    "status": "Pending"
                }
            ]
        }
    ]
}
```

#### Create Student

```http
POST /api/students
Content-Type: application/json

{
    "customId": "MBC-2024-001",
    "name": "Ali Khan",
    "email": "ali@example.com",
    "phone": "03001234567",
    "cnic": "12345-1234567-1",
    "address": "Karachi, Pakistan",
    "courseId": 5,
    "batchId": 2
}

Response (201):
{
    "success": true,
    "student": { ... }
}
```

#### Check Student Uniqueness (Live Validation)

```http
GET /api/students/check-exists?field=email&value=ali@example.com&excludeId=1

Response (200):
{
    "exists": false  // or true if email already in use
}
```

---

### Enrollments

#### Create Enrollment (with Auto-Installment Generator)

```http
POST /api/enrollments
Content-Type: application/json

{
    "studentId": 1,
    "courseId": 5,
    "batchId": 2,
    "enrollmentDate": "2026-04-01",
    "totalFee": 50000,
    "discount": 5000,
    "installmentsAllowed": true,
    "downPayment": 10000,
    "installmentMonths": 4,
    "monthlyAmount": 10000,
    "notes": "Premium package"
}

Response (201):
{
    "success": true,
    "enrollment": {
        "id": 1,
        "studentId": 1,
        "courseId": 5,
        "status": "Active",
        "totalFee": 50000,
        "installmentSchedules": [
            {
                "id": 1,
                "dueDate": "2026-05-01",
                "amount": 10000,
                "status": "Pending"
            },
            ...
        ]
    },
    "message": "Enrolled successfully with payment schedule"
}
```

#### Get Student Enrollments

```http
GET /api/enrollments/student/1

Response (200):
{
    "enrollments": [
        {
            "id": 1,
            "studentId": 1,
            "course": {
                "id": 5,
                "name": "Web Development",
                "fee": 50000
            },
            "status": "Active",
            "completionPercentage": 35,
            "installmentSchedules": [ ... ]
        }
    ]
}
```

#### Update Enrollment

```http
PATCH /api/enrollments/1
Content-Type: application/json

{
    "status": "Completed",
    "completionPercentage": 100
}

Response (200):
{
    "success": true,
    "enrollment": { ... }
}
```

---

### Payments (Fee Ledger)

#### Create Payment

```http
POST /api/payments
Content-Type: application/json

{
    "studentId": 1,
    "enrollmentId": 1,
    "amountPaid": 10000,
    "paymentMethod": "Cash",
    "transactionId": null
}

Response (201):
{
    "success": true,
    "message": "Payment recorded successfully",
    "payment": { ... },
    "receiptNo": "RCP-123456-4567",
    "cumulativeTotalPaid": 20000,
    "remainingBalance": 30000
}
```

#### Get Payments by Student

```http
GET /api/payments/student/1

Response (200):
{
    "payments": [
        {
            "id": 1,
            "receiptNo": "RCP-123456-4567",
            "amountPaid": 10000,
            "paymentDate": "2026-04-15",
            "paymentMethod": "Cash",
            "remainingBalance": 30000,
            "installmentNo": 1
        }
    ]
}
```

#### Get Recovery Alerts (Overdue Fees)

```http
GET /api/payments/alerts/recovery

Response (200):
{
    "alerts": [
        {
            "studentId": 1,
            "studentName": "Ali Khan",
            "overdueDays": 15,
            "overdueAmount": 15000,
            "nextDueDate": "2026-05-01"
        }
    ]
}
```

#### Get Pending Fees Summary

```http
GET /api/payments/summary/pending-fees

Response (200):
{
    "summary": {
        "totalOutstanding": 500000,
        "studentsWithPendingFees": 45,
        "overdueAmount": 150000,
        "completedEnrollments": 120
    }
}
```

---

### Courses

#### Get All Courses

```http
GET /api/courses

Response (200):
[
    {
        "id": 5,
        "name": "Web Development",
        "fee": 50000,
        "duration": "3 months",
        "code": "WEB-101"
    }
]
```

#### Create Course

```http
POST /api/courses
Content-Type: application/json

{
    "name": "Mobile App Development",
    "fee": 60000,
    "duration": "4 months",
    "code": "MOBILE-101"
}

Response (201):
{
    "success": true,
    "course": { ... }
}
```

---

### Reports

#### Get Student Report

```http
GET /api/reports/students?startDate=2026-01-01&endDate=2026-04-30&status=Active

Response (200):
{
    "report": {
        "totalStudents": 45,
        "activeStudents": 40,
        "completedStudents": 5,
        "totalFeeCollected": 1200000,
        "pendingAmount": 300000
    }
}
```

#### Get Payment Report

```http
GET /api/reports/payments?month=04&year=2026

Response (200):
{
    "report": {
        "totalPayments": 150000,
        "paymentCount": 15,
        "averagePayment": 10000,
        "paymentMethods": {
            "Cash": 80000,
            "Online": 50000,
            "Bank": 20000
        }
    }
}
```

---

### Dashboard Stats

#### Get Dashboard Statistics

```http
GET /api/stats

Response (200):
{
    "stats": {
        "totalStudents": 45,
        "activeEnrollments": 60,
        "totalRevenue": 2700000,
        "outstandingFees": 300000,
        "recentPayments": [ ... ],
        "topCourses": [ ... ],
        "monthlyTrend": [ ... ]
    }
}
```

---

### Chat

#### Get Chat Groups

```http
GET /api/chat/groups

Response (200):
{
    "groups": [
        {
            "id": 1,
            "groupName": "Web Development Batch 1",
            "type": "batch",
            "messages": [ ... ]
        }
    ]
}
```

#### Send Chat Message

```http
POST /api/chat/messages
Content-Type: application/json

{
    "senderId": 1,
    "groupId": 1,
    "message": "Hello everyone!",
    "messageType": "text"
}

Response (201):
{
    "success": true,
    "message": { ... }
}
```

---

## Getting Started

### Quick Start for Developers

#### 1. Initial Setup (First Time)

```bash
# Frontend setup
npm install
echo "VITE_API_URL=http://localhost:5001" > .env

# Backend setup
cd server
npm install

# Create .env file (use template from Environment Setup section)
cat > .env << 'EOF'
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hunar_db
JWT_SECRET=hunar_asaan_jwt_secret_2026
PORT=5001
EOF

# Create database
mysql -u root -p < ./hunar_db.sql  # or create manually
```

#### 2. Run Development Servers

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
npm run dev
```

#### 3. Access Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5001
- **Default Admin:** See seed data or check database

### Common Development Tasks

#### Add a New API Endpoint

1. **Create Controller Method** in `server/controllers/`
2. **Add Route** in `server/routes/`
3. **Register Route** in `server/index.js`
4. **Add Frontend API Call** in frontend utils

Example:

```javascript
// 1. Controller (studentController.js)
const getStudentStats = async (req, res) => {
    const stats = await Student.findAll({ raw: true });
    res.json(stats);
};

// 2. Route (routes/student.js)
router.get('/stats', authenticateToken, getStudentStats);

// 3. Backend registration (index.js)
app.use('/api/students', require('./routes/student'));

// 4. Frontend API call (utils/api.js)
getStudentStats: () => apiClient.get('/students/stats')
```

#### Modify Database Schema

1. Edit model definition in `server/models/index.js`
2. Restart backend (Sequelize auto-syncs with `alter: true`)
3. Test with existing data

---

## Deployment Considerations

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Update SMTP credentials for email notifications
- [ ] Use strong MySQL root password
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure production database backup strategy
- [ ] Set `NODE_ENV=production`
- [ ] Update `APP_URL` to production domain
- [ ] Enable request logging and monitoring
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Configure rate limiting on API endpoints
- [ ] Review security headers (CORS, CSP, etc.)
- [ ] Test all payment workflows thoroughly

### Database Optimization

- [ ] Add indexes on frequently queried columns (email, customId, status)
- [ ] Archive old payment records annually
- [ ] Set up regular backups (daily recommended)
- [ ] Monitor database query performance

### Frontend Build

```bash
npm run build
# Output: dist/ folder

# Deploy dist/ folder to web server (Nginx, Apache, Vercel, etc.)
```

### Backend Deployment

```bash
# Install production dependencies only
npm install --only=production

# Run with process manager
pm2 start index.js --name "hunar-crm"
```

---

## Support & Troubleshooting

### Common Issues

#### Database Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:** Ensure MySQL is running and credentials are correct in `.env`

#### JWT Token Expired

**Solution:** Frontend automatically clears token; user must login again

#### CORS Error on Payment API Call

**Solution:** Ensure backend CORS configuration includes frontend URL

#### Installment Schedule Not Generated

**Solution:** Verify `installmentsAllowed=true` and `installmentMonths > 0` in enrollment request

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-04-02 | Initial documentation release |

---

## Authors & Contributors

- **Project Lead:** Hunar Asaan Team
- **Last Modified:** April 2, 2026

---

## License & Legal

This system is proprietary software developed for Hunar Asaan. Unauthorized copying or distribution is prohibited.

