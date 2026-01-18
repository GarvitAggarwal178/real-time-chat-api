const express = require('express');
const storage = require('./database');
const http = require('http');
const {Server} = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});
const PORT = 3000;

app.use(express.json());

const onlineUsers = new Map();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'test.html'));
});

// Create user (POST)
app.post('/api/users', (req, res) => {
    const {username} = req.body;

    if (! username) {
        return res. status(400).json({error: 'Username is required'});
    }
    
    const check = storage.getUserByUsername(username);
    if (check) {
        return res. status(409).json({error: 'User already exists'});
    }
    
    const user = storage.createUser(username);
    res.status(201).json({message: 'User created successfully', user});
});

// Get all users (GET)
app.get('/api/users', (req, res) => {
    const users = storage.getAllUsers();
    res.status(200).json({users});
});

app.get('/api/users/:username', (req, res) => {
    const {username} = req.params;
    const user = storage.getUserByUsername(username);
    if (!user) {
        return res.status(404).json({error: 'User not found'});
    }
    res.status(200).json({user});
});

app.post('/api/messages', (req, res) => {
    const {from, to, content} = req. body;
    if (!from || !to || !content) {
        return res.status(400).json({error: 'Missing parameters'});
    }
    const message = storage.sendMessage(from, to, content);
    res.status(201).json({message});
});

app.get('/api/messages/history', (req, res) => {
    const {from, to} = req.query;
    if (!from || !to) {
        return res.status(400).json({error: 'Missing parameters'});
    }
    const messages = storage.getChatHistory(from, to);
    res.status(200).json({from, to, history: messages});
});

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        timestamp: new Date()
    });
});

// WebSocket handlers
io.on('connection', (socket) => {
    console.log('✅ A user connected:', socket.id);
    
    socket.on('join', (username) => {
        console.log(`👤 ${username} attempting to join`);
        
        // Check if user exists, if not create them
        let user = storage.getUserByUsername(username);
        if (!user) {
            console.log(`📝 User doesn't exist, creating:  ${username}`);
            user = storage.createUser(username);
        }
        
        socket. username = username;
        onlineUsers.set(username, socket. id);
        
        console.log('📋 Online users:', Array.from(onlineUsers.keys()));
        
        io.emit('userOnline', Array.from(onlineUsers. keys()));
        
        socket. emit('joined', {
            message: `Welcome ${username}!`,
            onlineUsers: Array. from(onlineUsers.keys())
        });
        
        console.log(`✅ ${username} joined successfully`);
    });

    socket.on('sendMessage', ({to, content}) => {
        console.log('📨 Message received:', {to, content});
        console.log('📤 From:', socket.username);
        
        const from = socket. username;
        
        if (! from) {
            console.log('❌ Error:  Sender not joined');
            socket. emit('error', 'You must join first');
            return;
        }
        
        if (! to || !content) {
            console.log('❌ Error: Missing parameters');
            socket. emit('error', 'Missing parameters');
            return;
        }
        
        console.log('💾 Saving message to database...');
        const message = storage.sendMessage(from, to, content);
        
        if (! message) {
            console.log('❌ Error: Failed to save message');
            console. log('   Sender in DB?', storage.getUserByUsername(from) ? 'YES' : 'NO');
            console. log('   Receiver in DB? ', storage.getUserByUsername(to) ? 'YES' : 'NO');
            socket.emit('error', 'Failed to send message');
            return;
        }
        
        console.log('✅ Message saved:', message);
        
        const receiverSocket = onlineUsers.get(to);
        console.log('🔍 Looking for recipient:', to);
        console.log('🔍 Recipient socket ID:', receiverSocket);
        
        if (receiverSocket) {
            console.log(`📤 Delivering to ${to} (socket: ${receiverSocket})`);
            io.to(receiverSocket).emit('newMessage', message);
            console.log('✅ Message delivered to recipient');
        } else {
            console.log('⚠️  Recipient not online');
        }
        
        socket. emit('messageSent', message);
        console.log(`✅ Confirmation sent to ${from}`);
        
        console.log(`💬 Complete:  ${from} → ${to}:  "${content}"`);
    });

    socket.on('disconnect', () => {
        if (socket.username) {
            console.log(`❌ ${socket.username} disconnected`);
            onlineUsers.delete(socket.username);
            io.emit('userOffline', socket.username);
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:3000`);
    console.log(`📡 WebSocket server ready\n`);
});