const { Setting } = require('../models');
const path = require('path');
const fs = require('fs');

// GET settings (always returns the first/only settings record)
const getSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            // Auto-create default settings if none exist
            setting = await Setting.create({
                instituteName: 'Hunar Asaan',
                contact: '',
                address: '',
                logoUrl: null,
                emailHost: '',
                emailPort: '587',
                emailUser: '',
                emailPass: ''
            });
        }

        // Return in the shape the frontend expects
        res.json({
            instituteName: setting.instituteName,
            contact: setting.contact,
            address: setting.address,
            logoUrl: setting.logoUrl,
            emailServer: {
                host: setting.emailHost || '',
                port: setting.emailPort || '587',
                user: setting.emailUser || '',
                pass: setting.emailPass || ''
            }
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// PUT update settings (handles both JSON and FormData)
const updateSettings = async (req, res) => {
    try {
        let setting = await Setting.findOne();
        if (!setting) {
            setting = await Setting.create({ instituteName: 'Hunar Asaan' });
        }

        // Support both JSON body and FormData with 'data' field
        let formData = req.body;
        if (req.body.data) {
            try { formData = JSON.parse(req.body.data); } catch (e) { formData = req.body; }
        }

        const { instituteName, contact, address, emailServer } = formData;

        const updatePayload = {
            instituteName: instituteName || setting.instituteName,
            contact: contact !== undefined ? contact : setting.contact,
            address: address !== undefined ? address : setting.address,
        };

        if (emailServer) {
            updatePayload.emailHost = emailServer.host || setting.emailHost;
            updatePayload.emailPort = emailServer.port || setting.emailPort;
            updatePayload.emailUser = emailServer.user || setting.emailUser;
            updatePayload.emailPass = emailServer.pass || setting.emailPass;
        }

        // 🔥 FIXED: Handle logo file upload with proper directory structure
        if (req.file) {
            // Ensure settings directory exists
            const uploadsDir = path.join(__dirname, '../uploads');
            const settingsDir = path.join(uploadsDir, 'settings');
            
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            if (!fs.existsSync(settingsDir)) {
                fs.mkdirSync(settingsDir, { recursive: true });
            }

            // Delete old logo if it exists
            if (setting.logoUrl) {
                const oldPath = path.join(__dirname, '..', setting.logoUrl);
                try {
                    if (fs.existsSync(oldPath)) {
                        fs.unlinkSync(oldPath);
                    }
                } catch (err) {
                    console.warn('Could not delete old logo:', err.message);
                }
            }

            // Save new logo with relative path
            updatePayload.logoUrl = `/uploads/settings/logo_${Date.now()}${path.extname(req.file.originalname)}`;
            
            // Move file to settings directory
            const newPath = path.join(settingsDir, path.basename(updatePayload.logoUrl));
            try {
                fs.renameSync(req.file.path, newPath);
            } catch (err) {
                console.error('File move error:', err);
                // Fallback: save the path as-is
                updatePayload.logoUrl = `/uploads/${req.file.filename}`;
            }
        }

        await setting.update(updatePayload);

        res.json({
            message: 'Settings updated successfully',
            instituteName: setting.instituteName,
            contact: setting.contact,
            address: setting.address,
            logoUrl: setting.logoUrl,
            emailServer: {
                host: setting.emailHost || '',
                port: setting.emailPort || '587',
                user: setting.emailUser || '',
                pass: setting.emailPass || ''
            }
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

module.exports = { getSettings, updateSettings };
