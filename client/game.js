// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-canvas',
    backgroundColor: '#2c3e50',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Game variables
let player;
let cursors;
let wasd;
let fpsText;
let socket;
let socketText;
let connectionStatusText;

// Initialize the game
const game = new Phaser.Game(config);

function preload() {
    // Create colored rectangles for player and ground
    this.add.graphics()
        .fillStyle(0x00ff00)
        .fillRect(0, 0, 50, 50)
        .generateTexture('player', 50, 50);
    
    this.add.graphics()
        .fillStyle(0x8b4513)
        .fillRect(0, 0, 800, 50)
        .generateTexture('ground', 800, 50);
}

function create() {
    // Create ground
    const ground = this.add.rectangle(400, 575, 800, 50, 0x8b4513);
    this.physics.add.existing(ground, true); // true = static body
    
    // Create player
    player = this.physics.add.sprite(400, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    // Player physics
    this.physics.add.collider(player, ground);
    
    // Create cursor keys
    cursors = this.input.keyboard.createCursorKeys();
    
    // Create WASD keys
    wasd = this.input.keyboard.addKeys('W,S,A,D');
    
    // Create FPS text
    fpsText = this.add.text(16, 16, 'FPS: 60', {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Game info text
    this.add.text(16, 50, 'Player: Green Square', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    this.add.text(16, 80, 'Controls: Arrow Keys or WASD', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Connection status text
    connectionStatusText = this.add.text(16, 110, 'Socket: Connecting...', {
        fontSize: '16px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Socket ID display text
    socketText = this.add.text(16, 140, 'Socket ID: Not connected', {
        fontSize: '16px',
        fill: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Initialize Socket.io connection
    initializeSocket();
}

function update() {
    // Update FPS counter
    fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
    
    // Player movement
    const speed = 160;
    const jumpSpeed = 330;
    
    // Left and right movement
    if (cursors.left.isDown || wasd.A.isDown) {
        player.setVelocityX(-speed);
    } else if (cursors.right.isDown || wasd.D.isDown) {
        player.setVelocityX(speed);
    } else {
        player.setVelocityX(0);
    }
    
    // Jumping
    if ((cursors.up.isDown || wasd.W.isDown) && player.body.touching.down) {
        player.setVelocityY(-jumpSpeed);
    }
    
    // Optional: Down movement (for future use)
    if (cursors.down.isDown || wasd.S.isDown) {
        // Could be used for ducking or special moves later
    }
}

// Socket.io connection setup
function initializeSocket() {
    // Connect to the server
    socket = io('http://localhost:3000');
    
    // Connection successful
    socket.on('connect', () => {
        console.log('Socket connected');
        console.log('Socket ID:', socket.id);
        
        // Update UI to show connection status
        connectionStatusText.setText('Socket: Connected ✅');
        connectionStatusText.setStyle({ fill: '#00ff00' });
        
        // Display socket ID
        socketText.setText(`Socket ID: ${socket.id}`);
        
        // Send "hello from client" message
        socket.emit('hello from client', {
            message: 'Hello from Phaser client!',
            timestamp: new Date().toISOString()
        });
        
        console.log('Sent "hello from client" message to server');
    });
    
    // Listen for "hello from server" response
    socket.on('hello from server', (data) => {
        console.log('Received "hello from server":', data);
        
        // Update UI to show server response
        connectionStatusText.setText('Socket: Server responded ✅');
        connectionStatusText.setStyle({ fill: '#00ff00' });
    });
    
    // Handle welcome message from server
    socket.on('welcome', (data) => {
        console.log('Welcome message from server:', data);
    });
    
    // Handle other players joining
    socket.on('playerJoined', (data) => {
        console.log('Player joined:', data);
    });
    
    // Handle other players leaving
    socket.on('playerLeft', (data) => {
        console.log('Player left:', data);
    });
    
    // Handle connection errors
    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        connectionStatusText.setText('Socket: Connection Error ❌');
        connectionStatusText.setStyle({ fill: '#ff0000' });
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        connectionStatusText.setText('Socket: Disconnected ❌');
        connectionStatusText.setStyle({ fill: '#ff0000' });
        socketText.setText('Socket ID: Disconnected');
    });
    
    // Handle server shutdown
    socket.on('serverShutdown', (data) => {
        console.log('Server is shutting down:', data);
        connectionStatusText.setText('Socket: Server Shutdown ⚠️');
        connectionStatusText.setStyle({ fill: '#ffa500' });
    });
} 