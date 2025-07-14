const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

// Create Express app
const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.io
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json());

// Configuration
const PORT = process.env.PORT || 3000;

// Store connected players
let connectedPlayers = {};
let playerCount = 0;

// Routes
app.get('/ping', (req, res) => {
    res.json({ 
        message: 'Server is running!', 
        timestamp: new Date().toISOString(),
        connectedPlayers: Object.keys(connectedPlayers).length
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'SuperHead Showdown Server',
        status: 'Online',
        connectedPlayers: Object.keys(connectedPlayers).length,
        endpoints: {
            ping: '/ping',
            socketConnection: 'ws://localhost:3000'
        }
    });
});

// Socket.io connection handling
io.on('connection', (socket) => {
    playerCount++;
    const playerId = `player_${playerCount}`;
    
    // Store player info
    connectedPlayers[socket.id] = {
        id: playerId,
        socketId: socket.id,
        connectedAt: new Date().toISOString()
    };
    
    console.log(`🎮 Player connected: ${playerId} (Socket: ${socket.id})`);
    console.log(`📊 Total players online: ${Object.keys(connectedPlayers).length}`);
    
    // Send welcome message to the connecting player
    socket.emit('welcome', {
        playerId: playerId,
        message: 'Welcome to SuperHead Showdown!',
        totalPlayers: Object.keys(connectedPlayers).length
    });
    
    // Broadcast to all other players that someone joined
    socket.broadcast.emit('playerJoined', {
        playerId: playerId,
        totalPlayers: Object.keys(connectedPlayers).length
    });
    
    // Handle "hello from client" message
    socket.on('hello from client', (data) => {
        console.log(`💬 Received from ${playerId}: "hello from client"`);
        
        // Respond back to the sender
        socket.emit('hello from server', {
            message: 'hello from server',
            playerId: playerId,
            timestamp: new Date().toISOString(),
            originalData: data
        });
    });
    
    // Handle player messages
    socket.on('playerMessage', (data) => {
        console.log(`💬 Message from ${playerId}:`, data);
        
        // Broadcast message to all players
        io.emit('playerMessage', {
            playerId: playerId,
            message: data.message,
            timestamp: new Date().toISOString()
        });
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        const disconnectedPlayer = connectedPlayers[socket.id];
        
        if (disconnectedPlayer) {
            console.log(`🚪 Player disconnected: ${disconnectedPlayer.id} (Socket: ${socket.id})`);
            
            // Remove player from connected players
            delete connectedPlayers[socket.id];
            
            console.log(`📊 Total players online: ${Object.keys(connectedPlayers).length}`);
            
            // Broadcast to all remaining players that someone left
            socket.broadcast.emit('playerLeft', {
                playerId: disconnectedPlayer.id,
                totalPlayers: Object.keys(connectedPlayers).length
            });
        }
    });
    
    // Handle errors
    socket.on('error', (error) => {
        console.error(`❌ Socket error for ${playerId}:`, error);
    });
});

// Start server
server.listen(PORT, () => {
    console.log('🚀 SuperHead Showdown Server Started!');
    console.log(`📡 Server running on http://localhost:${PORT}`);
    console.log(`🔌 Socket.io ready for connections`);
    console.log(`📋 Test the server: curl http://localhost:${PORT}/ping`);
    console.log('─'.repeat(50));
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server gracefully...');
    
    // Notify all connected players
    io.emit('serverShutdown', {
        message: 'Server is shutting down',
        timestamp: new Date().toISOString()
    });
    
    // Close server
    server.close(() => {
        console.log('✅ Server closed successfully');
        process.exit(0);
    });
});

// Export for testing
module.exports = { app, server, io }; 