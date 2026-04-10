import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const Chat = () => {
    const { user, api, socket } = useApp();
    const [chatGroups, setChatGroups] = useState([]);
    const [directMessagePartners, setDirectMessagePartners] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socketConnected, setSocketConnected] = useState(false);
    const [activeTab, setActiveTab] = useState('groups'); // 'groups' or 'direct'
    const messagesEndRef = useRef(null);
    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [availableUsers, setAvailableUsers] = useState([]);

    // Fetch chat groups and direct message partners
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get user's chat groups
                const groupsResponse = await api.getChatGroups();
                setChatGroups(groupsResponse);

                // Get direct message partners
                const partnersResponse = await api.getDirectMessagePartners();
                setDirectMessagePartners(partnersResponse);
                
                // Get all users if user is admin
                if (user?.role === 'Admin' || user?.role === 'Staff') {
                    try {
                        // Get all users (staff/admin) 
                        const usersResponse = await api.getUsers();
                        
                        // For admin/staff, we might want to show all users
                        // But for better UX, let's get only users related to the current context
                        setAllUsers(usersResponse);
                        setAvailableUsers(usersResponse);
                    } catch (err) {
                        console.error('Error fetching users:', err);
                        // Fallback to empty arrays
                        setAllUsers([]);
                        setAvailableUsers([]);
                    }
                } else if (user?.role === 'Student') {
                    // For students, only show admin/staff for direct messaging
                    try {
                        const usersResponse = await api.getUsers();
                        const adminStaffUsers = usersResponse.filter(u => u.role === 'Admin' || u.role === 'Staff');
                        setAllUsers(adminStaffUsers);
                        setAvailableUsers(adminStaffUsers);
                    } catch (err) {
                        console.error('Error fetching admin/staff users:', err);
                        // Fallback to empty arrays
                        setAllUsers([]);
                        setAvailableUsers([]);
                    }
                }
            } catch (error) {
                console.error('Error fetching chat data:', error);
                // Handle error gracefully without breaking UI
                setChatGroups([]);
                setDirectMessagePartners([]);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user, api]);

    // Scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Connect to socket
    useEffect(() => {
        if (socket) {
            socket.on('connect', () => {
                setSocketConnected(true);
                console.log('Socket connected successfully in Chat');
                // Join user's room
                if (user?.id) {
                    socket.emit('join-room', `user_${user.id}`);
                }
            });

            socket.on('disconnect', (reason) => {
                console.log('Socket disconnected in Chat:', reason);
                setSocketConnected(false);
            });

            socket.on('receive-message', (data) => {
                setMessages(prev => [...prev, data]);
            });

            return () => {
                socket.off('connect');
                socket.off('disconnect');
                socket.off('receive-message');
            };
        }
    }, [socket, user]); // Include user to ensure proper setup
    
    // Handle joining/leaving rooms when selectedGroup changes
    useEffect(() => {
        if (socket && selectedGroup) {
            // Join the selected group room
            socket.emit('join-room', `group_${selectedGroup.id}`);
        }
        
        // Cleanup: leave room when selectedGroup changes
        return () => {
            if (socket && selectedGroup) {
                socket.emit('leave-room', `group_${selectedGroup.id}`);
            }
        };
    }, [selectedGroup, socket]);

    // Load messages for selected group
    useEffect(() => {
        const loadMessages = async () => {
            if (selectedGroup) {
                try {
                    const response = await api.getGroupMessages(selectedGroup.id);
                    setMessages(response);
                } catch (error) {
                    console.error('Error loading messages:', error);
                    // Set empty messages to prevent UI crashes
                    setMessages([]);
                }
            }
        };

        loadMessages();
    }, [selectedGroup, api]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        try {
            // Send message via socket
            socket.emit('send-message', {
                groupId: selectedGroup?.id,
                message: newMessage,
                senderId: user?.id,
                senderName: user?.name,
                senderRole: user?.role
            });

            // Clear message input
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            // Optionally show an error notification to the user
        }
    };

    const handleStartDirectMessage = async (partnerId) => {
        try {
            const response = await api.createDirectMessage(partnerId);
            setSelectedGroup(response);
            setActiveTab('groups'); // Switch to groups tab to show the DM
        } catch (error) {
            console.error('Error starting direct message:', error);
            // Optionally show an error notification to the user
        }
    };

    return (
        <>
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex">
                        <button
                            className={`px-6 py-4 font-medium text-sm ${activeTab === 'groups' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('groups')}
                        >
                            Groups
                        </button>
                        {(user?.role === 'Admin' || user?.role === 'Staff') && (
                            <button
                                className={`px-6 py-4 font-medium text-sm ${activeTab === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                                onClick={() => setActiveTab('users')}
                            >
                                Users
                            </button>
                        )}
                        <button
                            className={`px-6 py-4 font-medium text-sm ${activeTab === 'direct' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('direct')}
                        >
                            Direct Messages
                        </button>
                    </nav>
                </div>

                <div className="flex h-[calc(100vh-200px)]">
                    {/* Sidebar - Chat Groups or DM Partners */}
                    <div className="w-1/3 border-r border-gray-200 flex flex-col">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">
                                    {activeTab === 'groups' ? 'Chat Groups' : 
                                     activeTab === 'users' ? 'Users' : 'Direct Messages'}
                                </h3>
                                {(activeTab === 'groups' || activeTab === 'users') && (user?.role === 'Admin' || user?.role === 'Staff') && (
                                    <button
                                        onClick={() => setShowCreateGroupModal(true)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                    >
                                        +
                                    </button>
                                )}
                            </div>
                            
                            {/* Search bar for users tab */}
                            {activeTab === 'users' && (
                                <div className="mt-3">
                                    <input
                                        type="text"
                                        placeholder="Search users..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-y-auto">
                            {activeTab === 'groups' ? (
                                chatGroups.map(group => (
                                    <div
                                        key={group.id}
                                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                                            selectedGroup?.id === group.id ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => setSelectedGroup(group)}
                                    >
                                        <div className="font-medium">{group.groupName}</div>
                                        <div className="text-sm text-gray-500">
                                            {group.type === 'batch' && group.Batch ? `Batch: ${group.Batch.name}` : 'Direct Message'}
                                        </div>
                                    </div>
                                ))
                            ) : activeTab === 'users' ? (
                                // Filter users based on search term
                                availableUsers
                                    .filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                    .map(user => (
                                        <div
                                            key={user.id}
                                            className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                                            onClick={() => handleStartDirectMessage(user.id)}
                                        >
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-gray-500">Role: {user.role}</div>
                                        </div>
                                    ))
                            ) : (
                                directMessagePartners.map(partner => (
                                    <div
                                        key={partner.id}
                                        className="p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleStartDirectMessage(partner.id)}
                                    >
                                        <div className="font-medium">{partner.name}</div>
                                        <div className="text-sm text-gray-500">Role: {partner.role}</div>
                                    </div>
                                ))
                            )}
                            
                            {activeTab === 'groups' && chatGroups.length === 0 && (
                                <div className="p-4 text-center text-gray-500">
                                    No chat groups available
                                </div>
                            )}
                            
                            {activeTab === 'users' && availableUsers.length === 0 && (
                                <div className="p-4 text-center text-gray-500">
                                    No users found
                                </div>
                            )}
                            
                            {activeTab === 'direct' && directMessagePartners.length === 0 && (
                                <div className="p-4 text-center text-gray-500">
                                    No direct message partners available
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Chat Area */}
                    <div className="flex-1 flex flex-col">
                        {selectedGroup ? (
                            <>
                                <div className="p-4 border-b border-gray-200 bg-gray-50">
                                    <h4 className="font-semibold">{selectedGroup.groupName}</h4>
                                    <p className="text-sm text-gray-500">
                                        {selectedGroup.type === 'batch' && selectedGroup.Batch ? 
                                            `Batch: ${selectedGroup.Batch.name}` : 'Direct Message'}
                                    </p>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {messages.length === 0 ? (
                                        <div className="text-center text-gray-500 py-8">
                                            <p>No messages yet in this chat.</p>
                                            <p className="text-sm mt-2">Start the conversation!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => (
                                            <div key={index} className={`p-3 rounded-lg max-w-xs lg:max-w-md ${
                                                msg.senderId === user?.id ? 'bg-blue-100 ml-auto' : 'bg-gray-100'
                                            }`}>
                                                <div className="font-medium text-sm">
                                                    {msg.sender?.name || msg.senderName || 'Unknown'} <span className="text-xs text-gray-500">({msg.sender?.role || msg.senderRole || 'User'})</span>
                                                </div>
                                                <div className="text-gray-800">{msg.message}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {new Date(msg.createdAt || msg.timestamp).toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                
                                <div className="p-4 border-t border-gray-200">
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
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center text-gray-500">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium">Select a chat</h3>
                                    <p className="mt-1 text-sm">Choose a group or direct message to start chatting</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Socket connection status */}
                <div className="p-4 border-t border-gray-200 text-sm">
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
        </div>
        
        {/* Create Group Modal */}
        {showCreateGroupModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-96">
                    <h3 className="text-lg font-semibold mb-4">Create New Group</h3>
                    <input
                        type="text"
                        placeholder="Group name"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={() => {
                                setShowCreateGroupModal(false);
                                setNewGroupName('');
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                if (newGroupName.trim()) {
                                    try {
                                        // Create new chat group
                                        const response = await api.createChatGroup({
                                            groupName: newGroupName,
                                            type: 'batch'
                                        });
                                        
                                        // Refresh the chat groups
                                        const groupsResponse = await api.getChatGroups();
                                        setChatGroups(groupsResponse);
                                        
                                        setShowCreateGroupModal(false);
                                        setNewGroupName('');
                                    } catch (error) {
                                        console.error('Error creating group:', error);
                                        // Optionally show an error notification to the user
                                    }
                                }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Create
                        </button>
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default Chat;