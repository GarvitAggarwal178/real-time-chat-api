// storage.js - Our "database" (in-memory)

// Data stores (just arrays!)
let users = [];
let messages = [];

// Helper to generate IDs
let userIdCounter = 1;
let messageIdCounter = 1;

// ============ USER OPERATIONS ============

/**
 * Create a new user
 */
function createUser(userData) {
    const user = {
        id:  userIdCounter++,
        username: userData.username,
        email: userData.email,
        passwordHash: userData.passwordHash,
        createdAt: new Date()
    };
    
    users.push(user);
    return user;
}

/**
 * Find user by username
 */
function findUserByUsername(username) {
    return users.find(u => u.username === username);
}

/**
 * Find user by ID
 */
function findUserById(id) {
    return users.find(u => u.id === id);
}

/**
 * Find user by email
 */
function findUserByEmail(email) {
    return users.find(u => u.email === email);
}

/**
 * Update user profile
 */
function updateUser(userId, updates) {
    const user = findUserById(userId);
    if (!user) return null;
    
    // Update allowed fields
    if (updates.email) user.email = updates.email;
    if (updates.username) user.username = updates.username;
    
    return user;
}

// ============ MESSAGE OPERATIONS ============

/**
 * Create a new message
 */
function createMessage(messageData) {
    const message = {
        id: messageIdCounter++,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        content: messageData.content,
        timestamp: new Date(),
        read: false
    };
    
    messages.push(message);
    return message;
}

/**
 * Get chat history between two users
 */
function getChatHistory(userId1, userId2) {
    return messages.filter(m => 
        (m.senderId === userId1 && m.receiverId === userId2) ||
        (m.senderId === userId2 && m.receiverId === userId1)
    ).sort((a, b) => a.timestamp - b.timestamp);  // Sort by time
}

/**
 * Get all messages for a user (inbox)
 */
function getUserMessages(userId) {
    return messages.filter(m => 
        m.senderId === userId || m.receiverId === userId
    );
}

/**
 * Mark message as read
 */
function markMessageAsRead(messageId) {
    const message = messages. find(m => m.id === messageId);
    if (message) {
        message.read = true;
    }
    return message;
}

// ============ UTILITY FUNCTIONS ============

/**
 * Get all users (for debugging)
 */
function getAllUsers() {
    // Return users without password hashes
    return users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        createdAt: u.createdAt
    }));
}

/**
 * Clear all data (for testing)
 */
function clearAllData() {
    users = [];
    messages = [];
    userIdCounter = 1;
    messageIdCounter = 1;
}

// Export all functions
module.exports = {
    // User operations
    createUser,
    findUserByUsername,
    findUserById,
    findUserByEmail,
    updateUser,
    getAllUsers,
    
    // Message operations
    createMessage,
    getChatHistory,
    getUserMessages,
    markMessageAsRead,
    
    // Utility
    clearAllData
};