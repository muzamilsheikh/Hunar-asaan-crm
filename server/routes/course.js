const express = require('express');
const router = express.Router();
const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { authenticateToken } = require('../middleware/auth');

// Get all courses
router.get('/', authenticateToken, getAllCourses);

// Get a single course
router.get('/:id', authenticateToken, getCourseById);

// Create a new course
router.post('/', authenticateToken, createCourse);

// Update a course
router.put('/:id', authenticateToken, updateCourse);

// Delete a course
router.delete('/:id', authenticateToken, deleteCourse);

module.exports = router;