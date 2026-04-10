const { Enrollment, Student, Course, Batch, InstallmentSchedule, Op } = require('../models');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/enrollments
// ─────────────────────────────────────────────────────────────────────────────
const createEnrollment = async (req, res) => {
    try {
        const { 
            studentId, 
            courseId, 
            batchId, 
            enrollmentDate, 
            notes,
            totalFee,
            discount,
            installmentsAllowed,
            downPayment,
            installmentMonths,
            monthlyAmount
        } = req.body;

        if (!studentId || !courseId) {
            return res.status(400).json({ error: 'studentId and courseId are required' });
        }

        // Verify student exists
        const student = await Student.findByPk(studentId);
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // Verify course exists
        const course = await Course.findByPk(courseId);
        if (!course) return res.status(404).json({ error: 'Course not found' });

        // ✅ Duplicate prevention — no double enrollment in same course
        const existing = await Enrollment.findOne({
            where: {
                studentId: parseInt(studentId),
                courseId: parseInt(courseId),
                status: { [Op.ne]: 'Dropped' }   // allow re-enrolment after drop
            }
        });
        if (existing) {
            return res.status(409).json({
                error: `Student is already enrolled in "${course.name}". Cannot enroll twice.`
            });
        }

        // ✅ Atomic create
        const enrollment = await Enrollment.create({
            studentId: parseInt(studentId),
            courseId: parseInt(courseId),
            batchId: batchId ? parseInt(batchId) : null,
            enrollmentDate: enrollmentDate || new Date().toISOString().split('T')[0],
            status: req.body.status || 'Active',
            completionPercentage: 0,
            notes: notes || null,
            totalFee: totalFee !== undefined ? totalFee : 0,
            discount: discount || 0,
            installmentsAllowed: installmentsAllowed || false,
            downPayment: downPayment || 0,
            installmentMonths: installmentMonths || 1,
            monthlyAmount: monthlyAmount || 0
        });

        // 🔥 NEW: Auto-generate Installment Schedule
        if (installmentsAllowed && installmentMonths > 0) {
            const schedules = [];
            const startDate = new Date(enrollment.enrollmentDate);
            
            for (let i = 0; i < installmentMonths; i++) {
                const dueDate = new Date(startDate);
                dueDate.setMonth(startDate.getMonth() + i);
                
                schedules.push({
                    enrollmentId: enrollment.id,
                    dueDate: dueDate.toISOString().split('T')[0],
                    amount: monthlyAmount,
                    status: 'Pending'
                });
            }
            await InstallmentSchedule.bulkCreate(schedules);
        }

        // Return with associated data
        const full = await Enrollment.findByPk(enrollment.id, {
            include: [
                { model: Course, as: 'Course', attributes: ['id', 'name', 'fee', 'code'] },
                { model: Batch,  as: 'Batch',  attributes: ['id', 'name', 'time'] },
                { model: InstallmentSchedule, as: 'InstallmentSchedules' }
            ]
        });

        console.log(`✅ Enrollment created & Schedule Generated: Student ${studentId} → ${course.name}`);

        res.status(201).json({ success: true, enrollment: full, message: 'Enrolled successfully with payment schedule' });
    } catch (error) {
        console.error('❌ Create enrollment error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/enrollments/student/:studentId
// ─────────────────────────────────────────────────────────────────────────────
const getEnrollmentsByStudent = async (req, res) => {
    try {
        const { studentId } = req.params;

        const enrollments = await Enrollment.findAll({
            where: { studentId: parseInt(studentId) },
            include: [
                { model: Course, as: 'Course', attributes: ['id', 'name', 'fee', 'code', 'duration'] },
                { model: Batch,  as: 'Batch',  attributes: ['id', 'name', 'time', 'meetingLink'] },
                { model: InstallmentSchedule, as: 'InstallmentSchedules' }
            ],
            order: [['enrollmentDate', 'DESC']]
        });

        res.json({ enrollments });
    } catch (error) {
        console.error('❌ Get enrollments error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/enrollments/:id  — update status or completionPercentage
// ─────────────────────────────────────────────────────────────────────────────
const updateEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, completionPercentage, batchId, notes } = req.body;

        const enrollment = await Enrollment.findByPk(id);
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

        const updateData = {};
        if (status !== undefined) updateData.status = status;
        if (completionPercentage !== undefined) updateData.completionPercentage = Math.min(100, Math.max(0, parseInt(completionPercentage)));
        if (batchId !== undefined) updateData.batchId = batchId ? parseInt(batchId) : null;
        if (notes !== undefined) updateData.notes = notes;
        if (req.body.totalFee !== undefined) updateData.totalFee = req.body.totalFee;
        if (req.body.discount !== undefined) updateData.discount = req.body.discount;
        if (req.body.installmentsAllowed !== undefined) updateData.installmentsAllowed = req.body.installmentsAllowed;
        if (req.body.downPayment !== undefined) updateData.downPayment = req.body.downPayment;
        if (req.body.installmentMonths !== undefined) updateData.installmentMonths = req.body.installmentMonths;
        if (req.body.monthlyAmount !== undefined) updateData.monthlyAmount = req.body.monthlyAmount;

        await enrollment.update(updateData);

        // Generate installments if approving newly
        if (status === 'Active' && req.body.generateInstallments) {
            await InstallmentSchedule.destroy({ where: { enrollmentId: id }});
            if (req.body.installmentsAllowed && req.body.installmentMonths > 0) {
                const schedules = [];
                const startDate = new Date();
                
                for (let i = 0; i < req.body.installmentMonths; i++) {
                    const dueDate = new Date(startDate);
                    dueDate.setMonth(startDate.getMonth() + i);
                    
                    schedules.push({
                        enrollmentId: enrollment.id,
                        dueDate: dueDate.toISOString().split('T')[0],
                        amount: req.body.monthlyAmount,
                        status: 'Pending'
                    });
                }
                await InstallmentSchedule.bulkCreate(schedules);
            }
        }

        const updated = await Enrollment.findByPk(id, {
            include: [
                { model: Course, as: 'Course', attributes: ['id', 'name', 'fee', 'code'] },
                { model: Batch,  as: 'Batch',  attributes: ['id', 'name', 'time'] },
                { model: InstallmentSchedule, as: 'InstallmentSchedules' }
            ]
        });

        res.json({ success: true, enrollment: updated });
    } catch (error) {
        console.error('❌ Update enrollment error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/enrollments/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteEnrollment = async (req, res) => {
    try {
        const { id } = req.params;
        const enrollment = await Enrollment.findByPk(id);
        if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });

        await enrollment.destroy();
        res.json({ success: true, message: 'Enrollment removed' });
    } catch (error) {
        console.error('❌ Delete enrollment error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

module.exports = {
    createEnrollment,
    getEnrollmentsByStudent,
    updateEnrollment,
    deleteEnrollment
};
