const { ChatMessage, ChatGroup, User, Batch, Student, Op } = require('../models');

// Helper function to ensure a chat group exists for a batch
const ensureBatchChatGroup = async (batchId) => {
    const batch = await Batch.findByPk(batchId);
    if (!batch) {
        throw new Error('Batch not found');
    }

    // Check if a chat group already exists for this batch
    let chatGroup = await ChatGroup.findOne({
        where: { batchId: batchId, type: 'batch' }
    });

    if (!chatGroup) {
        // Create a new chat group for this batch
        chatGroup = await ChatGroup.create({
            groupName: `${batch.name} Group`,
            batchId: batchId,
            type: 'batch'
        });
    }

    return chatGroup;
};

// Get chat groups for a user
const getUserChatGroups = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming JWT middleware sets req.user
        
        // Find user to determine if they're admin or student
        const user = await User.findByPk(userId);
        
        if (user.role === 'Admin' || user.role === 'Staff') {
            // Admin can see all batch groups and direct messages they're involved in
            // Ensure chat groups exist for all batches
            const batches = await Batch.findAll();
            for (const batch of batches) {
                await ensureBatchChatGroup(batch.id);
            }
            
            // First get all chat groups
            const chatGroups = await ChatGroup.findAll({
                order: [['createdAt', 'DESC']]
            });
            
            // Then get batch details separately to avoid association issues
            const chatGroupsWithBatches = [];
            for (const group of chatGroups) {
                if (group.batchId) {
                    const batch = await Batch.findByPk(group.batchId, {
                        attributes: ['id', 'name', 'courseId']
                    });
                    chatGroupsWithBatches.push({
                        ...group.toJSON(),
                        Batch: batch
                    });
                } else {
                    chatGroupsWithBatches.push(group.toJSON());
                }
            }
            
            res.json(chatGroupsWithBatches);
        } else {
            // Student can only see their batch group and direct messages with admin
            const student = await Student.findOne({ where: { email: user.email } });
            if (!student || !student.batchId) {
                return res.json([]);
            }
            
            // Ensure chat group exists for the student's batch
            await ensureBatchChatGroup(student.batchId);
            
            // Get chat groups for the student's batch
            const chatGroups = await ChatGroup.findAll({
                where: { batchId: student.batchId },
                order: [['createdAt', 'DESC']]
            });
            
            // Get batch details separately to avoid association issues
            const chatGroupsWithBatches = [];
            for (const group of chatGroups) {
                const batch = await Batch.findByPk(group.batchId, {
                    attributes: ['id', 'name']
                });
                chatGroupsWithBatches.push({
                    ...group.toJSON(),
                    Batch: batch
                });
            }
            
            res.json(chatGroupsWithBatches);
        }
    } catch (error) {
        console.error('Get user chat groups error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Create or get a direct message group
const createDirectMessageGroup = async (req, res) => {
    try {
        const { recipientId } = req.body;
        const senderId = req.user.id;
        
        if (!recipientId) {
            return res.status(400).json({ error: 'Recipient ID is required' });
        }
        
        // Ensure it's a direct message between sender and recipient
        // For direct messages, we'll create a group name that represents the conversation
        // We'll use the convention: "DM_senderId_recipientId" where senderId < recipientId for consistency
        const groupName = `DM_${Math.min(senderId, recipientId)}_${Math.max(senderId, recipientId)}`;
        
        // Check if a direct message group already exists with this name
        let dmGroup = await ChatGroup.findOne({
            where: { 
                groupName,
                type: 'direct'
            }
        });
        
        if (!dmGroup) {
            // Create new direct message group
            dmGroup = await ChatGroup.create({
                groupName,
                type: 'direct'
            });
        }
        
        res.status(201).json(dmGroup);
    } catch (error) {
        console.error('Create DM group error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get messages for a specific group
const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.user.id;
        
        // Check if user has access to this group
        const chatGroup = await ChatGroup.findByPk(groupId);
        if (!chatGroup) {
            return res.status(404).json({ error: 'Chat group not found' });
        }
        
        // For batch groups, ensure user is in the batch
        if (chatGroup.type === 'batch' && chatGroup.batchId) {
            const user = await User.findByPk(userId);
            if (user.role !== 'Admin' && user.role !== 'Staff') {
                // For students, check if they belong to the batch
                const student = await Student.findOne({ where: { email: user.email } });
                if (!student || student.batchId !== chatGroup.batchId) {
                    return res.status(403).json({ error: 'Access denied' });
                }
            }
        }
        
        const messages = await ChatMessage.findAll({
            where: { groupId },
            order: [['createdAt', 'ASC']],
            limit: 100 // Limit to last 100 messages
        });
        
        // Get user details separately to avoid association issues
        const messagesWithSender = [];
        for (const message of messages) {
            const sender = await User.findByPk(message.senderId, {
                attributes: ['id', 'name', 'role']
            });
            
            messagesWithSender.push({
                ...message.toJSON(),
                sender
            });
        }
        
        res.json(messagesWithSender);
    } catch (error) {
        console.error('Get group messages error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Send a message
const sendMessage = async (req, res) => {
    try {
        const { groupId, receiverId, message, messageType = 'text' } = req.body;
        const senderId = req.user.id;
        
        if (!message) {
            return res.status(400).json({ error: 'Message content is required' });
        }
        
        let newMessage;
        
        if (groupId) {
            // Group message
            const chatGroup = await ChatGroup.findByPk(groupId);
            if (!chatGroup) {
                return res.status(404).json({ error: 'Chat group not found' });
            }
            
            // Check permissions
            if (chatGroup.type === 'batch' && chatGroup.batchId) {
                const user = await User.findByPk(senderId);
                if (user.role !== 'Admin' && user.role !== 'Staff') {
                    const student = await Student.findOne({ where: { email: user.email } });
                    if (!student || student.batchId !== chatGroup.batchId) {
                        return res.status(403).json({ error: 'Access denied' });
                    }
                }
            }
            
            newMessage = await ChatMessage.create({
                senderId,
                groupId,
                message,
                messageType
            });
        } else if (receiverId) {
            // Direct message
            const user = await User.findByPk(senderId);
            if (user.role !== 'Admin' && user.role !== 'Staff') {
                // Regular users can only message admins
                const recipient = await User.findByPk(receiverId);
                if (recipient.role !== 'Admin' && recipient.role !== 'Staff') {
                    return res.status(403).json({ error: 'Students can only message admins' });
                }
            }
            
            newMessage = await ChatMessage.create({
                senderId,
                receiverId,
                message,
                messageType
            });
        } else {
            return res.status(400).json({ error: 'Either groupId or receiverId is required' });
        }
        
        // Get sender information separately to avoid association issues
        const sender = await User.findByPk(newMessage.senderId, {
            attributes: ['id', 'name', 'role']
        });
        
        const messageWithSender = {
            ...newMessage.toJSON(),
            sender
        };
        
        res.status(201).json(messageWithSender);
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get user's direct message partners
const getDirectMessagePartners = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Find all direct message IDs where this user is either sender or receiver
        const directMessageRecords = await ChatMessage.findAll({
            where: {
                [Op.or]: [
                    { senderId: userId },
                    { receiverId: userId }
                ],
                groupId: null // Only direct messages
            },
            attributes: ['senderId', 'receiverId'],
            order: [['createdAt', 'DESC']],
            limit: 50
        });
        
        // Extract unique partner IDs
        const partnerIds = new Set();
        directMessageRecords.forEach(dm => {
            if (dm.senderId !== userId) partnerIds.add(dm.senderId);
            if (dm.receiverId && dm.receiverId !== userId) partnerIds.add(dm.receiverId);
        });
        
        // Fetch partner details
        const partners = await User.findAll({
            where: { id: Array.from(partnerIds) },
            attributes: ['id', 'name', 'role']
        });
        
        res.json(partners);
    } catch (error) {
        console.error('Get DM partners error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Create new chat group
const createChatGroup = async (req, res) => {
    try {
        const { groupName, type = 'batch', batchId } = req.body;
        const userId = req.user.id;
        
        // Only allow admin/staff to create groups
        if (req.user.role !== 'Admin' && req.user.role !== 'Staff') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        if (!groupName) {
            return res.status(400).json({ error: 'Group name is required' });
        }
        
        // Check if batch exists if batchId is provided
        if (batchId) {
            const batch = await Batch.findByPk(batchId);
            if (!batch) {
                return res.status(404).json({ error: 'Batch not found' });
            }
        }
        
        // Create new chat group
        const chatGroup = await ChatGroup.create({
            groupName,
            type,
            batchId: batchId || null
        });
        
        res.status(201).json(chatGroup);
    } catch (error) {
        console.error('Create chat group error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

// Get all users (for admin use)
const getAllUsers = async (req, res) => {
    try {
        // Only allow admin/staff to access this
        if (req.user.role !== 'Admin' && req.user.role !== 'Staff') {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'role']
        });
        
        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

module.exports = {
    getUserChatGroups,
    createDirectMessageGroup,
    createChatGroup,
    getGroupMessages,
    sendMessage,
    getDirectMessagePartners,
    getAllUsers
};