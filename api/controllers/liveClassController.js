const { LiveClass, Batch, User, Student } = require('../models');
const { sendEmail } = require('../utils/email');
const { emitToRoom } = require('../utils/socket');

// Get live class for a specific batch
const getLiveClassByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;
    const liveClass = await LiveClass.findOne({
      where: { batchId: parseInt(batchId) },
      include: [{ model: Batch, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    if (!liveClass) {
      return res.status(200).json(null); // Return null if no live class found
    }

    res.json(liveClass);
  } catch (error) {
    console.error('Get live class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Get live class by ID
const getLiveClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const liveClass = await LiveClass.findByPk(id, {
      include: [{ model: Batch, attributes: ['id', 'name'] }]
    });

    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    res.json(liveClass);
  } catch (error) {
    console.error('Get live class by ID error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Get live classes for admin (all batches)
const getAllLiveClasses = async (req, res) => {
  try {
    const liveClasses = await LiveClass.findAll({
      include: [{ model: Batch, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(liveClasses);
  } catch (error) {
    console.error('Get all live classes error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Create or update live class for a batch
const createOrUpdateLiveClass = async (req, res) => {
  try {
    const { batchId, classLink, topic, startTime, updateNote } = req.body;

    if (!batchId || !topic) {
      return res.status(400).json({ error: 'Batch ID and topic are required' });
    }

    // Check if batch exists
    const batch = await Batch.findByPk(batchId);
    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Create or update live class
    const liveClass = await LiveClass.findOne({ where: { batchId } });
    let result;
    if (liveClass) {
      // Update existing live class
      result = await liveClass.update({
        classLink,
        topic,
        startTime: startTime || null,
        updateNote: updateNote || ''
      });
    } else {
      // Create new live class
      result = await LiveClass.create({
        batchId,
        classLink,
        topic,
        startTime: startTime || null,
        updateNote: updateNote || ''
      });
    }

    // Get all students in this batch
    const studentsInBatch = await Student.findAll({
      where: { batchId: parseInt(batchId) },
      attributes: ['email', 'name']
    });

    // Send notifications to all students in the batch
    if (studentsInBatch.length > 0) {
      const emailPromises = studentsInBatch.map(student => {
        const emailSubject = `New Live Class: ${topic}`;
        const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">📚 New Live Class Scheduled!</h1>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333;">Hello ${student.name},</h2>
              
              <p>Great news! A new live class has been scheduled for your batch.</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <h3 style="color: #667eea; margin-top: 0;">Class Details</h3>
                <p><strong>Topic:</strong> ${topic}</p>
                <p><strong>Batch:</strong> ${batch.name}</p>
                ${startTime ? `<p><strong>Start Time:</strong> ${new Date(startTime).toLocaleString()}</p>` : ''}
                ${classLink ? `<p><strong>Meeting Link:</strong> <a href="${classLink}" style="color: #667eea;">Join Class</a></p>` : ''}
              </div>
              
              ${updateNote ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <h4 style="color: #856404; margin-top: 0;">Update Note:</h4>
                <p style="color: #856404;">${updateNote}</p>
              </div>
              ` : ''}
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:5173" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Go to Dashboard
                </a>
              </div>
              
              <p>Don't miss this important session!</p>
            </div>
            
            <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 12px;">
              <p>© 2026 Hunar Asaan Skills Center. All rights reserved.</p>
            </div>
          </div>
        `;
        
        return sendEmail(student.email, emailSubject, emailBody);
      });

      // 🔥 NON-BLOCKING: Send emails in background without waiting
      // This prevents API timeout while still sending notifications
      Promise.allSettled(emailPromises)
        .then(results => {
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          const failCount = results.filter(r => r.status === 'rejected').length;
          console.log(`📧 Email notifications sent: ${successCount} succeeded, ${failCount} failed`);
        })
        .catch(err => {
          console.error('❌ Error sending batch emails:', err);
        });
      
      // Don't await - continue immediately
    }

    // Emit real-time update to the batch room
    emitToRoom(`batch_${batchId}`, 'class_updated', {
      batchId: parseInt(batchId),
      classLink,
      topic,
      startTime,
      updateNote,
      timestamp: new Date().toISOString()
    });

    res.status(201).json({
      message: 'Live class created/updated successfully',
      liveClass: result,
      notifications: {
        emailsSent: studentsInBatch.length,
        batchId: parseInt(batchId)
      }
    });
  } catch (error) {
    console.error('Create/update live class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Update live class
const updateLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { classLink, topic, startTime, updateNote } = req.body;

    const liveClass = await LiveClass.findByPk(id);
    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    // Update live class
    await liveClass.update({
      classLink: classLink || liveClass.classLink,
      topic: topic || liveClass.topic,
      startTime: startTime !== undefined ? startTime : liveClass.startTime,
      updateNote: updateNote || liveClass.updateNote
    });

    res.json({
      message: 'Live class updated successfully',
      liveClass
    });
  } catch (error) {
    console.error('Update live class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Delete live class
const deleteLiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    
    const liveClass = await LiveClass.findByPk(id);
    if (!liveClass) {
      return res.status(404).json({ error: 'Live class not found' });
    }

    await liveClass.destroy();
    
    res.json({ message: 'Live class deleted successfully' });
  } catch (error) {
    console.error('Delete live class error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// Get live session for the logged-in student
const getLiveSessionForStudent = async (req, res) => {
  try {
    // The authenticated user is attached by the middleware
    const user = req.user;
    
    // Check if the user is a student by checking their role
    if (user.role !== 'Student') {
      return res.status(403).json({ 
        error: 'Access denied. Only students can access this endpoint.' 
      });
    }

    // Find the student record by email (assuming student email matches user email)
    const student = await Student.findOne({
      where: { email: user.email },
      attributes: ['id', 'batchId', 'courseId']
    });

    if (!student || !student.batchId) {
      // If user is not registered as a student or doesn't have a batch, return no active session
      return res.json({ 
        success: true,
        liveSession: null,
        message: 'No active session found for your batch'
      });
    }

    // Find the active live class for the student's batch
    const liveClass = await LiveClass.findOne({
      where: { batchId: student.batchId },
      include: [{ model: Batch, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    if (!liveClass) {
      return res.json({ 
        success: true,
        liveSession: null,
        message: 'No active session found for your batch'
      });
    }

    res.json({ 
      success: true,
      liveSession: liveClass,
      message: 'Live session retrieved successfully'
    });
  } catch (error) {
    console.error('Get student live session error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

module.exports = {
  getLiveClassByBatch,
  getLiveClassById,
  getAllLiveClasses,
  createOrUpdateLiveClass,
  updateLiveClass,
  deleteLiveClass,
  getLiveSessionForStudent
};