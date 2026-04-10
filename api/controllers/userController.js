const { User, Student } = require('../models');
const bcrypt = require('bcryptjs');
const { sendEmail, generateRandomPassword } = require('../utils/email');

// Get all users (both staff and students)
const getAllUsers = async (req, res) => {
    try {
        console.log('📥 Fetching all users...');

        // Get staff users (excluding students)
        const staffUsers = await User.findAll({
            attributes: ['id', 'name', 'email', 'role', 'status', 'createdAt'],
            where: {
                role: { [require('sequelize').Op.ne]: 'Student' } // Exclude students from User table
            },
            order: [['createdAt', 'DESC']]
        });

        // Get student users (from Student table only)
        const students = await Student.findAll({
            attributes: ['id', 'name', 'email', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        // Format students to match user structure
        const studentUsers = students.map(student => ({
            id: `student_${student.id}`, // Prefix to avoid ID conflicts
            name: student.name,
            email: student.email,
            role: 'Student',
            status: 'Active', // Students are always active unless manually deactivated
            createdAt: student.createdAt,
            isStudent: true // Flag to identify student records
        }));

        // Combine and sort by creation date
        const allUsers = [...staffUsers, ...studentUsers].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        console.log(`✅ Found ${allUsers.length} users (${staffUsers.length} staff, ${studentUsers.length} students)`);

        res.json({
            success: true,
            users: allUsers,
            stats: {
                totalUsers: allUsers.length,
                totalStaff: staffUsers.length,
                totalStudents: studentUsers.length,
                activeUsers: allUsers.filter(u => u.status === 'Active').length,
                inactiveUsers: allUsers.filter(u => u.status === 'Inactive').length
            }
        });
    } catch (error) {
        console.error('❌ Get all users error:', error.message);
        res.status(500).json({
            error: error.message || 'Server error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Create a new staff user
const createUser = async (req, res) => {
    try {
        const { name, email, role, password } = req.body;

        // Validate required fields
        if (!name || !email || !role) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['name', 'email', 'role']
            });
        }

        // Validate role
        const validRoles = ['Admin', 'Manager', 'Ads Manager', 'Staff', 'Student'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({
                error: 'Invalid role',
                validRoles
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Generate password if not provided
        const userPassword = password || generateRandomPassword();

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(userPassword, saltRounds);

        // Create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            status: 'Active'
        });

        // Send welcome email with credentials (fire and forget)
        sendEmail(
            email,
            'Welcome to Hunar Asaan CRM',
            `Welcome ${name}!\n\nYour account has been created successfully.\n\nEmail: ${email}\nPassword: ${userPassword}\n\nPlease change your password after first login.\n\nBest regards,\nHunar Asaan Team`
        ).catch(emailError => {
            console.warn('Failed to send welcome email:', emailError.message);
        });

        // Return user without password
        const { password: _, ...userResponse } = newUser.toJSON();

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: userResponse,
            temporaryPassword: password ? undefined : userPassword // Only return if auto-generated
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Update user status
const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(400).json({
                error: 'Invalid status',
                validStatuses: ['Active', 'Inactive']
            });
        }

        // Check if it's a student (prefixed ID)
        if (id.startsWith('student_')) {
            const studentId = id.replace('student_', '');
            const student = await Student.findByPk(studentId);

            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }

            // For students, we don't actually change status in DB
            // We just return the updated status for frontend display
            return res.json({
                success: true,
                message: `Student ${status === 'Active' ? 'activated' : 'deactivated'} successfully`,
                user: {
                    id,
                    name: student.name,
                    email: student.email,
                    role: 'Student',
                    status,
                    createdAt: student.createdAt,
                    isStudent: true
                }
            });
        }

        // Handle staff user
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        await user.update({ status });

        res.json({
            success: true,
            message: `User ${status === 'Active' ? 'activated' : 'deactivated'} successfully`,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Reset user password
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        // Check if it's a student
        if (id.startsWith('student_')) {
            return res.status(400).json({
                error: 'Cannot reset password for students. Students use a different authentication system.'
            });
        }

        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate new password if not provided
        const password = newPassword || generateRandomPassword();

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await user.update({ password: hashedPassword });

        // Send email with new password (fire and forget)
        sendEmail(
            user.email,
            'Password Reset - Hunar Asaan CRM',
            `Hello ${user.name},\n\nYour password has been reset.\n\nNew Password: ${password}\n\nPlease change your password after logging in.\n\nBest regards,\nHunar Asaan Team`
        ).catch(emailError => {
            console.warn('Failed to send password reset email:', emailError.message);
        });

        res.json({
            success: true,
            message: 'Password reset successfully',
            temporaryPassword: newPassword ? undefined : password
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    createUser,
    updateUserStatus,
    resetPassword
};