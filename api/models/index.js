const { DataTypes, Sequelize } = require('sequelize');

// Load .env only if not already loaded
if (!process.env.DB_NAME) {
    require('dotenv').config({ path: __dirname + '/../.env' });
}

// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'hunar_db',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || '127.0.0.1',
        port: 3306,
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            connectTimeout: 60000
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

// ============ USER MODEL ============
const User = sequelize.define('User', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: { name: 'unique_email_constraint' } },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('Admin', 'Manager', 'Ads Manager', 'Staff', 'Student'), defaultValue: 'Staff' },
    status: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' }
}, { timestamps: true, tableName: 'Users' });

// ============ COURSE MODEL ============
const Course = sequelize.define('Course', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    fee: { type: DataTypes.FLOAT, allowNull: false },
    duration: { type: DataTypes.STRING(100), allowNull: true },
    code: { type: DataTypes.STRING(50), allowNull: false, unique: { name: 'unique_code_constraint' } }
}, { timestamps: true, tableName: 'Courses' });

// ============ BATCH MODEL ============
const Batch = sequelize.define('Batch', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    time: { type: DataTypes.STRING(100), allowNull: true },
    meetingLink: { type: DataTypes.STRING(500), allowNull: true },
    driveLink: { type: DataTypes.STRING(500), allowNull: true },
    courseId: { type: DataTypes.INTEGER, allowNull: true }
}, { timestamps: true, tableName: 'Batches' });

// ============ STUDENT MODEL ============
const Student = sequelize.define('Student', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    customId: { type: DataTypes.STRING(50), allowNull: true }, // Custom student ID like MBC-2024-001
    name: { type: DataTypes.STRING(255), allowNull: false },
    email: { type: DataTypes.STRING(255), allowNull: true },   // Uniqueness enforced at controller level
    phone: { type: DataTypes.STRING(20), allowNull: true },    // Uniqueness enforced at controller level
    cnic: { type: DataTypes.STRING(20), allowNull: true },     // Uniqueness enforced at controller level
    address: { type: DataTypes.TEXT, allowNull: true },
    totalFee: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 0 },
    paidAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalPaid: { type: DataTypes.FLOAT, defaultValue: 0 },
    discount: { type: DataTypes.FLOAT, defaultValue: 0 },
    totalInstallments: { type: DataTypes.INTEGER, defaultValue: 2 },
    status: { 
        type: DataTypes.ENUM('Active', 'Settled', 'Dropped', 'Passout', 'Completed'), 
        defaultValue: 'Active',
        comment: 'Active=System Active, Settled=Fully Settled, Dropped=Dropped/Dormant, Passout=Passout/Certified'
    },
    courseId: { type: DataTypes.INTEGER, allowNull: true },
    batchId: { type: DataTypes.INTEGER, allowNull: true },
    // Monthly billing fields
    commencementDate: { type: DataTypes.DATEONLY, allowNull: true },
    next_due_date: { type: DataTypes.DATEONLY, allowNull: true }
}, { timestamps: true, tableName: 'Students' });

// ============ EXPENSE MODEL ============
const Expense = sequelize.define('Expense', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    description: { type: DataTypes.STRING(500), allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    category: {
        type: DataTypes.ENUM('Marketing', 'Utilities', 'Rent', 'Salaries', 'Maintenance', 'Other'),
        defaultValue: 'Other'
    },
    date: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW }
}, { timestamps: true, tableName: 'Expenses' });

// ============ SETTING MODEL ============
const Setting = sequelize.define('Setting', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    instituteName: { type: DataTypes.STRING(255), allowNull: true, defaultValue: 'Hunar Asaan' },
    contact: { type: DataTypes.STRING(100), allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    logoUrl: { type: DataTypes.STRING(500), allowNull: true },
    emailHost: { type: DataTypes.STRING(255), allowNull: true },
    emailPort: { type: DataTypes.STRING(10), allowNull: true, defaultValue: '587' },
    emailUser: { type: DataTypes.STRING(255), allowNull: true },
    emailPass: { type: DataTypes.STRING(255), allowNull: true }
}, { timestamps: true, tableName: 'Settings' });

// ============ LIVE CLASSES MODEL ============
const LiveClass = sequelize.define('LiveClass', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    batchId: { type: DataTypes.INTEGER, allowNull: false },
    classLink: { type: DataTypes.STRING(500), allowNull: true },
    topic: { type: DataTypes.STRING(255), allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: true },
    updateNote: { type: DataTypes.TEXT, allowNull: true, defaultValue: '' }
}, { timestamps: true, tableName: 'LiveClasses' });

// ============ CHAT GROUPS MODEL ============
const ChatGroup = sequelize.define('ChatGroup', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    groupName: { type: DataTypes.STRING(255), allowNull: false },
    batchId: { type: DataTypes.INTEGER, allowNull: true },
    type: { type: DataTypes.ENUM('batch', 'direct'), defaultValue: 'batch' }  // batch group or direct message
}, { timestamps: true, tableName: 'ChatGroups' });

// ============ CHAT MESSAGES MODEL ============
const ChatMessage = sequelize.define('ChatMessage', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    receiverId: { type: DataTypes.INTEGER, allowNull: true },  // for direct messages
    groupId: { type: DataTypes.INTEGER, allowNull: true },     // for group messages
    message: { type: DataTypes.TEXT, allowNull: false },
    messageType: { type: DataTypes.ENUM('text', 'image', 'file'), defaultValue: 'text' },
    readStatus: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: true, tableName: 'ChatMessages' });

// ============ PAYMENT MODEL ============
const Payment = sequelize.define('Payment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    amountPaid: { type: DataTypes.FLOAT, allowNull: false },
    paymentDate: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    paymentMethod: { type: DataTypes.ENUM('Cash', 'Online', 'Bank'), allowNull: false },
    transactionId: { type: DataTypes.STRING(100), allowNull: true },
    receiptNo: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    remainingBalance: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('Pending', 'Paid'), defaultValue: 'Paid' },
    enrollmentId: { type: DataTypes.INTEGER, allowNull: true },
    installmentNo: { type: DataTypes.INTEGER, allowNull: true }
}, { timestamps: true, tableName: 'Payments' });

// ============ ENROLLMENT MODEL (M:N join table) ============
const Enrollment = sequelize.define('Enrollment', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
    courseId: { type: DataTypes.INTEGER, allowNull: true },
    batchId: { type: DataTypes.INTEGER, allowNull: true },
    enrollmentDate: { type: DataTypes.DATEONLY, allowNull: false, defaultValue: DataTypes.NOW },
    status: {
        type: DataTypes.ENUM('Active', 'Completed', 'Dropped'),
        defaultValue: 'Active'
    },
    completionPercentage: { type: DataTypes.INTEGER, defaultValue: 0 },
    notes: { type: DataTypes.TEXT, allowNull: true },
    // 🔥 NEW: Financial Fields
    totalFee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    installmentsAllowed: { type: DataTypes.BOOLEAN, defaultValue: false },
    downPayment: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    installmentMonths: { type: DataTypes.INTEGER, defaultValue: 1 },
    monthlyAmount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
}, { timestamps: true, tableName: 'Enrollments' });

// ============ INSTALLMENT SCHEDULE MODEL ============
const InstallmentSchedule = sequelize.define('InstallmentSchedule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    enrollmentId: { type: DataTypes.INTEGER, allowNull: false },
    dueDate: { type: DataTypes.DATEONLY, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('Pending', 'Paid'), defaultValue: 'Pending' }
}, { timestamps: true, tableName: 'InstallmentSchedules' });

// ============ ASSOCIATIONS ============
// Keep only essential associations to avoid MySQL key limit
Course.hasMany(Batch, { foreignKey: 'courseId', onDelete: 'SET NULL' });
Batch.belongsTo(Course, { foreignKey: 'courseId' });

Course.hasMany(Student, { foreignKey: 'courseId', onDelete: 'SET NULL' });
Student.belongsTo(Course, { foreignKey: 'courseId' });

// ============ M:N ENROLLMENT ASSOCIATIONS ============
Student.belongsToMany(Course, { through: Enrollment, foreignKey: 'studentId', otherKey: 'courseId', as: 'EnrolledCourses' });
Course.belongsToMany(Student, { through: Enrollment, foreignKey: 'courseId', otherKey: 'studentId', as: 'EnrolledStudents' });
Student.hasMany(Enrollment, { foreignKey: 'studentId', as: 'Enrollments', onDelete: 'CASCADE' });
Enrollment.belongsTo(Student, { foreignKey: 'studentId' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId', as: 'Course', onDelete: 'SET NULL' });
Enrollment.belongsTo(Batch, { foreignKey: 'batchId', as: 'Batch', onDelete: 'SET NULL' });


// Payment associations
Student.hasMany(Payment, { foreignKey: 'studentId', onDelete: 'CASCADE' });
Payment.belongsTo(Student, { foreignKey: 'studentId' });
Batch.hasMany(Student, { foreignKey: 'batchId', onDelete: 'SET NULL' });
Student.belongsTo(Batch, { foreignKey: 'batchId' });

// Live Class associations
Batch.hasMany(LiveClass, { foreignKey: 'batchId', onDelete: 'CASCADE' });
LiveClass.belongsTo(Batch, { foreignKey: 'batchId' });

// Chat associations - Minimal to avoid key limits
User.hasMany(ChatMessage, { foreignKey: 'senderId', onDelete: 'CASCADE' });
ChatMessage.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

ChatGroup.hasMany(ChatMessage, { foreignKey: 'groupId', onDelete: 'CASCADE' });
ChatMessage.belongsTo(ChatMessage, { foreignKey: 'groupId' });

// Batch to ChatGroup association
Batch.hasMany(ChatGroup, { foreignKey: 'batchId', onDelete: 'SET NULL' });
ChatGroup.belongsTo(Batch, { foreignKey: 'batchId' });

Enrollment.hasMany(Payment, { foreignKey: 'enrollmentId', onDelete: 'CASCADE' });
Payment.belongsTo(Enrollment, { foreignKey: 'enrollmentId' });

Enrollment.hasMany(InstallmentSchedule, { foreignKey: 'enrollmentId', as: 'InstallmentSchedules', onDelete: 'CASCADE' });
InstallmentSchedule.belongsTo(Enrollment, { foreignKey: 'enrollmentId' });

// ============ EXPORTS ============
module.exports = {
    sequelize,
    User,
    Course,
    Batch,
    Student,
    Enrollment,
    InstallmentSchedule,
    Expense,
    Setting,
    LiveClass,
    ChatGroup,
    ChatMessage,
    Payment,
    Op: require('sequelize').Op
};
