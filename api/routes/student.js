const express = require('express');
const multer = require('multer');
const router = express.Router();
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    checkStudentExists
} = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/auth');

// Multer for handling FormData (file uploads)
const upload = multer();

// Live uniqueness check endpoint (must be before /:id)
router.get('/check-exists', authenticateToken, checkStudentExists);

router.get('/', authenticateToken, getAllStudents);
router.get('/:id', authenticateToken, getStudentById);
router.post('/', authenticateToken, upload.any(), createStudent); // Handle FormData
router.put('/:id', authenticateToken, updateStudent);
router.delete('/:id', authenticateToken, deleteStudent);

module.exports = router;