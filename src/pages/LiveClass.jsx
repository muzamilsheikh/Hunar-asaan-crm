import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const LiveClass = () => {
    const { user, api, socket, batches } = useApp();
    const [liveClasses, setLiveClasses] = useState([]);
    const [selectedBatch, setSelectedBatch] = useState('');
    const [classLink, setClassLink] = useState('');
    const [topic, setTopic] = useState('');
    const [startTime, setStartTime] = useState('');
    const [updateNote, setUpdateNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('class-info'); // 'class-info' or 'chat'
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const messagesEndRef = useRef(null);

    const isAdmin = user?.role === 'Admin' || user?.role === 'Staff';

    // Fetch live classes for all batches (admin) or current user's batch (student)
    useEffect(() => {
        const fetchLiveClasses = async () => {
            try {
                if (isAdmin) {
                    // Admin - get all live classes
                    const response = await api.getLiveClasses();
                    setLiveClasses(response || []);
                } else {
                    // Student - get their batch's live class using the new endpoint
                    try {
                        const response = await api.getStudentLiveSession();
                        if (response.success && response.liveSession) {
                            setLiveClasses([response.liveSession]);
                        } else {
                            setLiveClasses([]);
                        }
                    } catch (studentError) {
                        // Fallback to old method if new endpoint fails
                        const studentData = await api.getStudents();
                        const student = studentData.find(s => s.email === user.email);
                        
                        if (student && student.batchId) {
                            const data = await api.getLiveClassByBatch(student.batchId);
                            setLiveClasses(data ? [data] : []);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching live classes:', error);
            }
        };

        if (user) {
            fetchLiveClasses();
        }
    }, [user, isAdmin, api]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Connect to socket
    useEffect(() => {
        if (socket) {
            socket.on('connect', () => {
                setSocketConnected(true);
                console.log('Socket connected successfully in LiveClass');
                // Join user's room
                socket.emit('join-room', `user_${user?.id}`);
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected in LiveClass:', reason);
                setSocketConnected(false);
            });

            socket.on('receive-message', (data) => {
                setMessages(prev => [...prev, data]);
            });

            socket.on('live-class-updated', (data) => {
                // Update the live classes list when a class is updated
                setLiveClasses(prev => 
                    prev.map(lc => lc.id === data.id ? data : lc)
                );
            });

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('receive-message');
                socket.off('live-class-updated');
            };
        }
    }, [socket, user]);

    const handleCreateOrUpdateLiveClass = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            // Determine if we're updating an existing class based on form state
            const batchId = parseInt(selectedBatch);
            const existingLiveClass = liveClasses.find(lc => lc.batchId === batchId);

            let response;
            if (existingLiveClass) {
                // Update existing live class
                response = await api.updateLiveClass(existingLiveClass.id, {
                    batchId,
                    classLink,
                    topic,
                    startTime: startTime || null,
                    updateNote
                });
                
                // Update the live classes list
                setLiveClasses(prev => 
                    prev.map(lc => lc.id === existingLiveClass.id ? response : lc)
                );
            } else {
                // Create new live class
                response = await api.createLiveClass({
                    batchId,
                    classLink,
                    topic,
                    startTime: startTime || null,
                    updateNote
                });

                // Add to the live classes list
                setLiveClasses(prev => [...prev, response]);
            }

            // Reset form
            setSelectedBatch('');
            setClassLink('');
            setTopic('');
            setStartTime('');
            setUpdateNote('');
        } catch (error) {
            console.error('Error creating/updating live class:', error);
            if (error.response?.status === 403) {
                alert('Access denied. You do not have permission to perform this action.');
            } else {
                alert('An error occurred while saving the live class. Please try again.');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    // Function to handle updating a specific live class
    const handleUpdateLiveClass = async (liveClassId, updates) => {
        setIsUpdating(true);
        try {
            const response = await api.updateLiveClass(liveClassId, updates);

            // Update the live classes list
            setLiveClasses(prev => 
                prev.map(lc => lc.id === liveClassId ? response : lc)
            );
        } catch (error) {
            console.error('Error updating live class:', error);
            if (error.response?.status === 403) {
                alert('Access denied. You do not have permission to update this live class.');
            } else {
                alert('An error occurred while updating the live class. Please try again.');
            }
        } finally {
            setIsUpdating(false);
        }
    };

    // Function to delete a live class
    const handleDeleteLiveClass = async (liveClassId) => {
        if (window.confirm('Are you sure you want to delete this live class?')) {
            try {
                await api.deleteLiveClass(liveClassId);

                // Remove from the live classes list
                setLiveClasses(prev => prev.filter(lc => lc.id !== liveClassId));
            } catch (error) {
                console.error('Error deleting live class:', error);
                if (error.response?.status === 403) {
                    alert('Access denied. You do not have permission to delete this live class.');
                } else {
                    alert('An error occurred while deleting the live class. Please try again.');
                }
            }
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        try {
            // Send message via socket
            socket.emit('send-message', {
                groupId: null, // For general chat, not tied to a specific class
                message: newMessage,
                senderId: user?.id,
                senderName: user?.name,
                senderRole: user?.role
            });

            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <>
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            className={`px-6 py-4 font-medium text-sm ${activeTab === 'class-info' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('class-info')}
                        >
                            Live Class Info
                        </button>
                        <button
                            className={`px-6 py-4 font-medium text-sm ${activeTab === 'chat' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            Class Chat
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'class-info' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Live Class Management</h2>
                            
                            {isAdmin ? (
                                // Admin view - Grid/List of all live classes with ability to manage multiple
                                <div>
                                    {/* Form to add/update live class */}
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="text-lg font-medium mb-3">Add/Edit Live Class</h3>
                                        <form onSubmit={handleCreateOrUpdateLiveClass} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
                                                    <select
                                                        value={selectedBatch}
                                                        onChange={(e) => setSelectedBatch(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        required
                                                    >
                                                        <option value="">Choose a batch</option>
                                                        {batches.map(batch => (
                                                            <option key={batch.id} value={batch.id}>
                                                                {batch.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class Topic</label>
                                                    <input
                                                        type="text"
                                                        value={topic}
                                                        onChange={(e) => setTopic(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Enter class topic"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Link</label>
                                                <input
                                                    type="url"
                                                    value={classLink}
                                                    onChange={(e) => setClassLink(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                                                />
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={startTime}
                                                        onChange={(e) => setStartTime(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Note</label>
                                                    <input
                                                        type="text"
                                                        value={updateNote}
                                                        onChange={(e) => setUpdateNote(e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        placeholder="Any updates or announcements?"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <button
                                                type="submit"
                                                disabled={isUpdating}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                {isUpdating ? 'Processing...' : 'Save Live Class'}
                                            </button>
                                        </form>
                                    </div>

                                    {/* Grid/List of existing live classes */}
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium mb-3">Existing Live Classes</h3>
                                        {liveClasses.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {liveClasses.map((liveClass) => {
                                                    const batch = batches.find(b => b.id === liveClass.batchId);
                                                    return (
                                                        <div key={liveClass.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-semibold text-gray-800">{liveClass.topic}</h4>
                                                                    <p className="text-sm text-gray-600">Batch: {batch?.name || 'Unknown'}</p>
                                                                    {liveClass.startTime && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {new Date(liveClass.startTime).toLocaleString()}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <div className="flex space-x-2">
                                                                    <button 
                                                                        onClick={() => {
                                                                            // Pre-populate the form with the live class data for editing
                                                                            setSelectedBatch(liveClass.batchId.toString());
                                                                            setClassLink(liveClass.classLink || '');
                                                                            setTopic(liveClass.topic);
                                                                            setStartTime(liveClass.startTime ? new Date(liveClass.startTime).toISOString().slice(0, 16) : '');
                                                                            setUpdateNote(liveClass.updateNote || '');
                                                                        }}
                                                                        className="text-blue-500 hover:text-blue-700"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => handleDeleteLiveClass(liveClass.id)}
                                                                        className="text-red-500 hover:text-red-700"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            {liveClass.classLink && (
                                                                <div className="mt-3">
                                                                    <a
                                                                        href={liveClass.classLink}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
                                                                    >
                                                                        Join Meeting
                                                                    </a>
                                                                </div>
                                                            )}
                                                            {liveClass.updateNote && (
                                                                <p className="text-sm text-gray-600 mt-2">
                                                                    <span className="font-medium">Note:</span> {liveClass.updateNote}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>No live classes scheduled yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // Student view - display live class info for their batch
                                <div>
                                    {liveClasses.length > 0 ? (
                                        liveClasses.map((liveClass) => {
                                            const batch = batches.find(b => b.id === liveClass.batchId);
                                            return (
                                                <div key={liveClass.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                                    <h3 className="text-lg font-semibold text-blue-800">{liveClass.topic}</h3>
                                                    <p className="text-blue-600 mt-2">Batch: {batch?.name || 'Unknown'}</p>
                                                    {liveClass.classLink && (
                                                        <div className="mt-3">
                                                            <a
                                                                href={liveClass.classLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                                            >
                                                                Join Live Class
                                                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                                </svg>
                                                            </a>
                                                        </div>
                                                    )}
                                                    {liveClass.startTime && (
                                                        <p className="text-sm text-blue-600 mt-2">
                                                            Start Time: {new Date(liveClass.startTime).toLocaleString()}
                                                        </p>
                                                    )}
                                                    {liveClass.updateNote && (
                                                        <p className="text-sm text-blue-600 mt-2">
                                                            Update: {liveClass.updateNote}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No live class scheduled for your batch.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Socket connection status */}
                            <div className="mt-4 text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    socketConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    <span className={`mr-1.5 h-2 w-2 rounded-full ${
                                        socketConnected ? 'bg-green-400' : 'bg-red-400'
                                    }`}></span>
                                    {socketConnected ? 'Connected' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="flex flex-col h-96">
                            <div className="flex-1 overflow-y-auto mb-4 space-y-3 max-h-80">
                                {messages.length === 0 ? (
                                    <p className="text-center text-gray-500 py-4">No messages yet. Be the first to start the conversation!</p>
                                ) : (
                                    messages.map((msg, index) => (
                                        <div key={index} className={`p-3 rounded-lg ${
                                            msg.senderId === user?.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
                                        }`}>
                                            <div className="font-medium text-sm">
                                                {msg.senderName} <span className="text-xs text-gray-500">({msg.senderRole})</span>
                                            </div>
                                            <div className="text-gray-800">{msg.message}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(msg.timestamp).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="flex space-x-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default LiveClass;