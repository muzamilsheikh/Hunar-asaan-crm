const { Student, User, Course, Batch, ChatGroup, Op, InstallmentSchedule, Payment, Enrollment } = require('../models');
const bcrypt = require('bcryptjs');
const { sendEmail, generateRandomPassword } = require('../utils/email');

// Live uniqueness check - GET /api/students/check-exists?field=email&value=...
const checkStudentExists = async (req, res) => {
  try {
    const { field, value, excludeId } = req.query;
    const allowedFields = ['email', 'phone', 'cnic'];
    if (!allowedFields.includes(field)) {
      return res.status(400).json({ error: 'Invalid field' });
    }
    if (!value || !value.trim()) {
      return res.json({ exists: false });
    }
    const where = { [field]: value.trim() };
    if (excludeId) {
      where.id = { [Op.ne]: parseInt(excludeId) };
    }
    const student = await Student.findOne({ where });
    return res.json({ exists: !!student });
  } catch (error) {
    console.error('Check exists error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Get all students (with optional filtering)
const getAllStudents = async (req, res) => {
  try {
  console.log('📥 Fetching students with filters:', req.query);
  
  // Build where clause for database filtering
  const where = {};
  const { status, courseId, batchId, search } = req.query;

  if (status) {
    where.status = status;
  }
  if (courseId) {
    where.courseId = parseInt(courseId);
  }
  if (batchId) {
    where.batchId = parseInt(batchId);
  }
  if (search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${search}%` } },
      { customId: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } }
    ];
  }

  const students = await Student.findAll({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: [
        { model: Course, attributes: ['id', 'name', 'fee'] },
        { model: Batch, attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
      raw: false
    });
    
  console.log(`✅ Found ${students.length} students`);
    
    // Log any problematic students for debugging
    students.forEach((student, idx) => {
    if (!student.totalFee || isNaN(student.totalFee)) {
      console.warn(`⚠️ Student ${idx} (${student.name}) has invalid totalFee:`, student.totalFee);
      }
    if (!student.discount || isNaN(student.discount)) {
      console.warn(`⚠️ Student ${idx} (${student.name}) has invalid discount:`, student.discount);
      }
    });
    
  res.json(students);
  } catch (error) {
  console.error('❌ Get all students error:', error.message);
  console.error('Error stack:', error.stack);
  res.status(500).json({ 
      error: error.message || 'Server error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get student by ID (with full enrollment history)
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
      include: [
        { model: Course, attributes: ['id', 'name', 'fee', 'code', 'duration'] },
        { model: Batch, attributes: ['id', 'name', 'time'] },
        {
          model: Enrollment,
          as: 'Enrollments',
          include: [
            { model: Course, as: 'Course', attributes: ['id', 'name', 'fee', 'code', 'duration'] },
            { model: Batch,  as: 'Batch',  attributes: ['id', 'name', 'time', 'meetingLink'] },
            { model: InstallmentSchedule, as: 'InstallmentSchedules' }
          ]
        },
        { model: Payment, attributes: ['id', 'amountPaid', 'paymentDate', 'paymentMethod', 'receiptNo', 'status'] }
      ]
    });

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Calculate balance from payments
    const totalPaid = student.Payments?.reduce((sum, p) => sum + (p.amountPaid || 0), 0) || 0;
    const remainingBalance = (student.totalFee || 0) - (student.discount || 0) - totalPaid;

    res.json({ 
      student, 
      enrollments: student.Enrollments || [],
      payments: student.Payments || [],
      summary: {
        totalFee: student.totalFee || 0,
        discount: student.discount || 0,
        totalPaid,
        remainingBalance: Math.max(0, remainingBalance)
      }
    });
  } catch (error) {
    console.error('Get student by ID error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Create new student
const createStudent = async (req, res) => {
  try {
  console.log('📥 Admission request body:', req.body);

  const { name, email, phone, cnic, address, courseId, batchId, discount = 0, totalInstallments = 2, commencementDate } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !courseId) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing: {
          name: !name,
          email: !email,
          phone: !phone,
        courseId: !courseId
        }
      });
    }

    // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate phone format (Flexible international format)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Invalid phone number format. Please use any international format (e.g., +1-555-123-4567 or 03-XXX-XXXXXX)' });
    }

    // ✅ DUPLICATE CHECKS - email, phone, cnic
    const existingByEmail = await Student.findOne({ where: { email } });
    if (existingByEmail) {
      return res.status(400).json({ error: 'Error: Email already registered.' });
    }
    const existingByPhone = await Student.findOne({ where: { phone } });
    if (existingByPhone) {
      return res.status(400).json({ error: 'Error: Phone already registered.' });
    }
    if (cnic && cnic.trim()) {
      const existingByCnic = await Student.findOne({ where: { cnic: cnic.trim() } });
      if (existingByCnic) {
        return res.status(400).json({ error: 'Error: CNIC already registered.' });
      }
    }

    // ✅ CRITICAL FIX: Pull standardFee from Course model
  const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Validate course fee
    if (!course.fee || isNaN(course.fee) || course.fee <= 0) {
      return res.status(400).json({ 
        error: 'Invalid course fee configuration',
        details: 'Course fee must be a positive number greater than zero'
      });
    }

    // Validate batchId if provided
    let batch = null;
    if (batchId) {
    const batchIdValue = isNaN(batchId) ? batchId : parseInt(batchId);
      batch = await Batch.findByPk(batchIdValue);
      if (!batch) {
        return res.status(404).json({ error: 'Batch not found' });
      }
    }

    // Validate discount
  const discountAmount = Number(discount);
    if (isNaN(discountAmount) || discountAmount < 0) {
      return res.status(400).json({ error: 'Discount must be a valid non-negative number' });
    }
    if (discountAmount > course.fee) {
      return res.status(400).json({ error: 'Discount cannot be greater than course fee' });
    }

    // 🔥 NEW: Calculate next_due_date based on commencement date
    let nextDueDate = null;
    let effectiveCommencementDate = commencementDate || new Date().toISOString().split('T')[0];
    if (effectiveCommencementDate) {
    const firstDueDate = new Date(effectiveCommencementDate);
      firstDueDate.setMonth(firstDueDate.getMonth() + 1);
      nextDueDate = firstDueDate.toISOString().split('T')[0];
    }

    // ✅ CRITICAL: Database Assignment According to Specification
  const student = await Student.create({
      name,
      email,
      phone,
      cnic: cnic ? cnic.trim() : null,
      address: address ? address.trim() : null,
    courseId,
      batchId: batchId ? (isNaN(batchId) ? batchId : parseInt(batchId)) : null,
      totalFee: course.fee,              // ✅ Save ORIGINAL course fee (e.g., 30,000)
      discount: discountAmount,          // ✅ Save scholarship discount (e.g., 5,000)
      paidAmount: 0,
      totalPaid: 0,
      status: 'Active',
      totalInstallments: Number(totalInstallments),
    commencementDate: effectiveCommencementDate,
      next_due_date: nextDueDate
    });

  console.log(`✅ Student created: ${student.name}, ID: ${student.id}`);
  console.log(`   Original Fee: Rs. ${student.totalFee.toLocaleString()}`);
  console.log(`   Discount: Rs. ${student.discount.toLocaleString()}`);
  console.log(`   Net Payable: Rs. ${(student.totalFee - student.discount).toLocaleString()}`);

    res.status(201).json({
      success: true,
      student: {
        id: student.id,
        name: student.name,
        totalFee: student.totalFee,
        discount: student.discount,
        remainingBalance: student.totalFee - student.discount
      },
      message: 'Student registered successfully'
    });

  } catch (error) {
  console.error('❌ Create student error:', error);
  console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: error.message || 'Server error during student registration',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, cnic, address, courseId, batchId, discount, totalInstallments, status, customId } = req.body;

    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update student record - only allow updating these specific fields
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (cnic !== undefined) updateData.cnic = cnic ? cnic.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (courseId !== undefined) updateData.courseId = courseId;
    if (batchId !== undefined) updateData.batchId = batchId;
    if (discount !== undefined) updateData.discount = Number(discount);
    if (totalInstallments !== undefined) updateData.totalInstallments = Number(totalInstallments);
    if (status !== undefined) updateData.status = status;
    if (customId !== undefined) updateData.customId = customId;

    await student.update(updateData);

    // Fetch updated student with associations
    const updatedStudent = await Student.findByPk(id, {
      include: [
        { model: Course, as: 'Course' },
        { model: Batch, as: 'Batch' }
      ]
    });

    res.json({
      message: 'Student updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Delete student (with cascading deletion)
const deleteStudent = async (req, res) => {
  const { sequelize } = require('../models');
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    console.log(`🗑️ Attempting to delete student ID: ${id}`);

    const student = await Student.findByPk(id, { transaction });
    if (!student) {
      await transaction.rollback();
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentEmail = student.email;
    const studentName = student.name;

    console.log(`📋 Student to delete: ${studentName} (${studentEmail})`);

    // Step 1: Delete associated user account (by email)
    if (studentEmail) {
      const user = await User.findOne({ 
        where: { email: studentEmail },
        transaction 
      });
      if (user) {
        await user.destroy({ transaction });
        console.log(`✅ User account deleted: ${studentEmail}`);
      }
    }

    // Step 2: Delete all payments for this student (CASCADE is set in model, but explicit for clarity)
    const payments = await Payment.findAll({ 
      where: { studentId: id },
      transaction 
    });
    if (payments.length > 0) {
      await Payment.destroy({ 
        where: { studentId: id },
        transaction 
      });
      console.log(`✅ Deleted ${payments.length} payment records`);
    }

    // Step 3: Delete the student record
    await student.destroy({ transaction });
    console.log(`✅ Student record deleted: ${studentName}`);

    // Commit transaction
    await transaction.commit();

    res.json({ 
      success: true,
      message: `Student "${studentName}" and all associated records have been permanently deleted.`,
      deletedStudent: {
        id: student.id,
        name: studentName,
        email: studentEmail,
        recordsDeleted: {
          userAccount: studentEmail ? 1 : 0,
          payments: payments.length
        }
      }
    });

  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    console.error('❌ Delete student error:', error);
    res.status(500).json({ 
      error: error.message || 'Server error during deletion',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  checkStudentExists
};