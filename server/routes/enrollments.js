const express = require('express');
const router = express.Router();
const {
    createEnrollment,
    getEnrollmentsByStudent,
    updateEnrollment,
    deleteEnrollment
} = require('../controllers/enrollmentController');
const { authenticateToken } = require('../middleware/auth');

router.post('/', authenticateToken, createEnrollment);
router.get('/student/:studentId', authenticateToken, getEnrollmentsByStudent);
router.patch('/:id', authenticateToken, updateEnrollment);
router.delete('/:id', authenticateToken, deleteEnrollment);

module.exports = router;
