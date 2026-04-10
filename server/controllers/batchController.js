const { Batch, Course, ChatGroup } = require('../models');

// Get all batches
const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.findAll({
            include: [
                { model: Course, attributes: ['id', 'name', 'code'] }
            ]
        });
        res.json(batches || []);
    } catch (error) {
        console.error('Get batches error:', error);
        res.status(500).json({ error: error.message || 'Server error', batches: [] });
    }
};

// Get a single batch
const getBatchById = async (req, res) => {
    try {
        const { id } = req.params;
        const batch = await Batch.findByPk(id, {
            include: [
                { model: Course, attributes: ['id', 'name', 'code'] }
            ]
        });

        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        res.json(batch);
    } catch (error) {
        console.error('Get batch error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Create a new batch
const createBatch = async (req, res) => {
    try {
        const { name, time, meetingLink, driveLink, courseId } = req.body;

        if (!name || !courseId) {
            return res.status(400).json({ error: 'Name and courseId are required' });
        }

        // Ensure courseId is an integer (not a string)
        const parsedCourseId = parseInt(courseId);
        if (isNaN(parsedCourseId)) {
            return res.status(400).json({ error: 'courseId must be a valid integer' });
        }

        const newBatch = await Batch.create({
            name,
            time,
            meetingLink,
            driveLink,
            courseId: parsedCourseId
        });

        // Create a corresponding chat group for the batch
        await ChatGroup.create({
            groupName: `${name} Group`,
            batchId: newBatch.id,
            type: 'batch'
        });

        res.status(201).json(newBatch);
    } catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Update a batch
const updateBatch = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, time, meetingLink, driveLink, courseId } = req.body;

        const batch = await Batch.findByPk(id);
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        await batch.update({
            name: name || batch.name,
            time: time || batch.time,
            meetingLink: meetingLink || batch.meetingLink,
            driveLink: driveLink || batch.driveLink,
            courseId: courseId || batch.courseId
        });

        res.json(batch);
    } catch (error) {
        console.error('Update batch error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Delete a batch
const deleteBatch = async (req, res) => {
    try {
        const { id } = req.params;

        const batch = await Batch.findByPk(id);
        if (!batch) {
            return res.status(404).json({ error: 'Batch not found' });
        }

        // Delete the associated chat group
        await ChatGroup.destroy({ where: { batchId: id } });

        await batch.destroy();
        res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
        console.error('Delete batch error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

module.exports = {
    getAllBatches,
    getBatchById,
    createBatch,
    updateBatch,
    deleteBatch
};
