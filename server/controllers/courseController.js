const { Course, Batch, Student } = require('../models');

// Get all courses
const getAllCourses = async (req, res) => {
    try {
        const courses = await Course.findAll({
            include: [
                { model: Batch, attributes: ['id', 'name', 'time'] }
            ]
        });
        res.json(courses || []);
    } catch (error) {
        console.error('Get courses error:', error);
        res.status(500).json({ error: error.message || 'Server error', courses: [] });
    }
};

// Get a single course
const getCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByPk(id, {
            include: [
                { model: Batch, attributes: ['id', 'name', 'time'] },
                { model: Student, attributes: ['id', 'name', 'email', 'status'] }
            ]
        });

        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        console.error('Get course error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Create a new course
const createCourse = async (req, res) => {
    try {
        const { name, fee, duration, code } = req.body;

        if (!name || fee === undefined || !code) {
            return res.status(400).json({ error: 'Name, fee, and code are required' });
        }

        // Check if course code already exists
        const existingCourse = await Course.findOne({ where: { code } });
        if (existingCourse) {
            return res.status(409).json({ error: 'Course code already exists' });
        }

        const newCourse = await Course.create({
            name,
            fee: parseFloat(fee),
            duration: duration || null,
            code
        });

        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Create course error:', error);
        res.status(500).json({ error: error.message || 'Server error', details: error });
    }
};

// Update a course
const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, fee, duration, code } = req.body;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        await course.update({
            name: name || course.name,
            fee: fee !== undefined ? fee : course.fee,
            duration: duration || course.duration,
            code: code || course.code
        });

        res.json(course);
    } catch (error) {
        console.error('Update course error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Delete a course
const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findByPk(id);
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }

        await course.destroy();
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Delete course error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
