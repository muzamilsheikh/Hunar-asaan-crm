// Socket.io helper for real-time communication
let io;

// Initialize socket.io with the server
const initializeSocket = (server) => {
    const socketIo = require('socket.io');
    io = socketIo(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:5174',
                'http://localhost:3000',
                'http://127.0.0.1:3000'
            ],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join rooms
        socket.on('join-room', (room) => {
            socket.join(room);
            console.log(`${socket.id} joined room: ${room}`);
        });

        // Leave rooms
        socket.on('leave-room', (room) => {
            socket.leave(room);
            console.log(`${socket.id} left room: ${room}`);
        });

        // Handle chat messages
        socket.on('send-message', async (data) => {
            try {
                const { groupId, receiverId, message, senderId, senderName, senderRole } = data;
                    
                // Save message to database
                const { ChatMessage, ChatGroup } = require('./models');
                let savedMessage;
                    
                if (groupId) {
                    // Group message
                    savedMessage = await ChatMessage.create({
                        senderId,
                        groupId,
                        message,
                        messageType: 'text'
                    });
                        
                    // Broadcast message to appropriate room
                    io.to(`group_${groupId}`).emit('receive-message', {
                        id: savedMessage.id,
                        groupId,
                        message,
                        senderId,
                        senderName,
                        senderRole,
                        timestamp: savedMessage.createdAt.toISOString()
                    });
                } else if (receiverId) {
                    // Direct message - save and broadcast
                    savedMessage = await ChatMessage.create({
                        senderId,
                        receiverId,
                        message,
                        messageType: 'text'
                    });
                        
                    // Direct message - send to specific user
                    io.to(`user_${receiverId}`).emit('receive-message', {
                        id: savedMessage.id,
                        receiverId,
                        message,
                        senderId,
                        senderName,
                        senderRole,
                        timestamp: savedMessage.createdAt.toISOString()
                    });
                        
                    // Also send to sender as confirmation
                    socket.emit('receive-message', {
                        id: savedMessage.id,
                        receiverId,
                        message,
                        senderId,
                        senderName,
                        senderRole,
                        timestamp: savedMessage.createdAt.toISOString()
                    });
                } else {
                    // General message (like in live class chat)
                    savedMessage = await ChatMessage.create({
                        senderId,
                        message,
                        messageType: 'text'
                    });
                        
                    io.emit('receive-message', {
                        id: savedMessage.id,
                        message,
                        senderId,
                        senderName,
                        senderRole,
                        timestamp: savedMessage.createdAt.toISOString()
                    });
                }
            } catch (error) {
                console.error('Socket message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle live class notifications
        socket.on('join-live-class', (classId) => {
            socket.join(`live_class_${classId}`);
            console.log(`${socket.id} joined live class: ${classId}`);
        });

        socket.on('leave-live-class', (classId) => {
            socket.leave(`live_class_${classId}`);
            console.log(`${socket.id} left live class: ${classId}`);
        });

        // Handle live class updates
        socket.on('update-live-class', async (data) => {
            try {
                const { batchId, classLink, topic, startTime, updateNote, adminId, adminName } = data;
                
                // Notify all users in the batch about the live class update
                io.to(`batch_${batchId}`).emit('live-class-updated', {
                    batchId,
                    classLink,
                    topic,
                    startTime,
                    updateNote,
                    adminId,
                    adminName,
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                console.error('Socket live class update error:', error);
                socket.emit('error', { message: 'Failed to update live class' });
            }
        });

        // Handle batch joining (for notifications)
        socket.on('join-batch', (batchId) => {
            socket.join(`batch_${batchId}`);
            console.log(`${socket.id} joined batch: ${batchId}`);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    return io;
};

// Emit events to specific rooms/users
const emitToRoom = (room, event, data) => {
    if (io) {
        io.to(room).emit(event, data);
    }
};

const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(`user_${userId}`).emit(event, data);
    }
};

const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

module.exports = {
    initializeSocket,
    emitToRoom,
    emitToUser,
    emitToAll
};