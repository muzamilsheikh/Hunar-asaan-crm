const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getSettings, updateSettings } = require('../controllers/settingController');
const { authenticateToken } = require('../middleware/auth');

// 🔥 IMPROVED: Multer config for logo uploads with settings subdirectory
const uploadsDir = path.join(__dirname, '../uploads');
const settingsDir = path.join(uploadsDir, 'settings');

// Ensure directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(settingsDir)) fs.mkdirSync(settingsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, settingsDir);  // Save directly to settings directory
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `logo_${Date.now()}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },  // 5MB max
    fileFilter: (req, file, cb) => {
        // Only allow image files
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (JPEG, PNG, GIF)'));
        }
    }
});

router.get('/', authenticateToken, getSettings);
router.put('/', authenticateToken, upload.single('logo'), updateSettings);

module.exports = router;
