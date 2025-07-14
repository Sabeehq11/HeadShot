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
let ball;
let leftGoal;
let rightGoal;
let cursors;
let wasd;
let fpsText;
let scoreText;
let timerText;
let gameOverText;
let socket;
let socketText;
let connectionStatusText;

// Game state variables
let leftScore = 0;
let rightScore = 0;
let gameOver = false;
let gameScene;
let matchTime = 60; // 60 seconds
let timerEvent;

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
    
    // Create a soccer ball sprite (black and white pattern)
    const ballGraphics = this.add.graphics();
    ballGraphics.fillStyle(0xffffff);
    ballGraphics.fillCircle(25, 25, 25);
    ballGraphics.fillStyle(0x000000);
    // Add pentagon pattern for soccer ball look
    ballGraphics.fillCircle(25, 15, 8);
    ballGraphics.fillCircle(15, 30, 6);
    ballGraphics.fillCircle(35, 30, 6);
    ballGraphics.fillCircle(25, 40, 4);
    ballGraphics.generateTexture('ball', 50, 50);
    ballGraphics.destroy();
    
    // Create goal post placeholder graphics (will be invisible but can be replaced with sprites)
    this.add.graphics()
        .fillStyle(0xff0000)
        .fillRect(0, 0, 20, 200)
        .generateTexture('goalPost', 20, 200);
}

function create() {
    // Store scene reference for later use
    gameScene = this;
    
    // Create ground
    const ground = this.add.rectangle(400, 575, 800, 50, 0x8b4513);
    this.physics.add.existing(ground, true); // true = static body
    
    // Create player
    player = this.physics.add.sprite(400, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    
    // Create soccer ball
    ball = this.physics.add.sprite(400, 300, 'ball');
    ball.setBounce(0.8); // High bounce for realistic ball physics
    ball.setCollideWorldBounds(true);
    ball.setDrag(50); // Add some air resistance
    
    // Create goal zones (invisible rectangles)
    leftGoal = this.add.rectangle(10, 400, 20, 200, 0xff0000, 0); // Invisible (alpha = 0)
    rightGoal = this.add.rectangle(790, 400, 20, 200, 0xff0000, 0); // Invisible (alpha = 0)
    this.physics.add.existing(leftGoal, true); // Static bodies
    this.physics.add.existing(rightGoal, true);
    
    // Add visual goal post indicators (can be replaced with sprites later)
    this.add.rectangle(10, 300, 15, 5, 0xffffff); // Left goal top
    this.add.rectangle(10, 500, 15, 5, 0xffffff); // Left goal bottom
    this.add.rectangle(10, 400, 5, 200, 0xffffff); // Left goal post
    
    this.add.rectangle(790, 300, 15, 5, 0xffffff); // Right goal top
    this.add.rectangle(790, 500, 15, 5, 0xffffff); // Right goal bottom
    this.add.rectangle(790, 400, 5, 200, 0xffffff); // Right goal post
    
    // Physics collisions
    this.physics.add.collider(player, ground);
    this.physics.add.collider(ball, ground);
    this.physics.add.collider(player, ball, handlePlayerBallCollision);
    
    // Goal detection (overlap, not collision)
    this.physics.add.overlap(ball, leftGoal, () => handleGoalScored('right'));
    this.physics.add.overlap(ball, rightGoal, () => handleGoalScored('left'));
    
    // Create cursor keys
    cursors = this.input.keyboard.createCursorKeys();
    
    // Create WASD keys
    wasd = this.input.keyboard.addKeys('W,S,A,D');
    
    // Create timer display at top left
    timerText = this.add.text(400, 60, formatTime(matchTime), {
        fontSize: '28px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
    });
    timerText.setOrigin(0.5, 0.5); // Center the text
    
    // Create score display at top center
    scoreText = this.add.text(400, 30, 'Left: 0 | Right: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
    });
    scoreText.setOrigin(0.5, 0.5); // Center the text
    
    // Start the match timer
    startMatchTimer();
    
    // Create FPS text
    fpsText = this.add.text(16, 16, 'FPS: 60', {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Game info text
    this.add.text(16, 100, 'Player: Green Square', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    this.add.text(16, 130, 'Controls: Arrow Keys or WASD', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    this.add.text(16, 160, 'Ball: Kick it into the goals!', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    this.add.text(16, 190, 'Goal: 3 goals or most goals when time runs out!', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Connection status text
    connectionStatusText = this.add.text(16, 220, 'Socket: Connecting...', {
        fontSize: '16px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Socket ID display text
    socketText = this.add.text(16, 250, 'Socket ID: Not connected', {
        fontSize: '16px',
        fill: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
    // Initialize Socket.io connection
    initializeSocket();
}

function startMatchTimer() {
    // Create a timer event that fires every second
    timerEvent = gameScene.time.addEvent({
        delay: 1000, // 1 second
        callback: updateTimer,
        loop: true
    });
}

function updateTimer() {
    // Don't update timer if game is over
    if (gameOver) return;
    
    matchTime--;
    timerText.setText(formatTime(matchTime));
    
    // Change color when time is running low
    if (matchTime <= 10) {
        timerText.setStyle({ fill: '#ff0000' }); // Red when 10 seconds or less
    } else if (matchTime <= 30) {
        timerText.setStyle({ fill: '#ffa500' }); // Orange when 30 seconds or less
    }
    
    // Check if time is up
    if (matchTime <= 0) {
        handleTimeUp();
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function handleTimeUp() {
    // Stop the timer
    if (timerEvent) {
        timerEvent.remove();
    }
    
    // Determine winner based on score
    let winner;
    let winMessage;
    
    if (leftScore > rightScore) {
        winner = 'left';
        winMessage = 'Time\'s Up! Left Player Wins!';
    } else if (rightScore > leftScore) {
        winner = 'right';
        winMessage = 'Time\'s Up! Right Player Wins!';
    } else {
        winner = 'tie';
        winMessage = 'Time\'s Up! It\'s a Tie!';
    }
    
    handleGameOver(winner, winMessage);
}

function handlePlayerBallCollision(player, ball) {
    // Don't allow kicking if game is over
    if (gameOver) return;
    
    // Calculate kick force based on player velocity
    const kickForce = 200;
    const playerVelocityX = player.body.velocity.x;
    const playerVelocityY = player.body.velocity.y;
    
    // Apply force to ball based on player's movement direction
    if (Math.abs(playerVelocityX) > 10) {
        ball.setVelocityX(playerVelocityX > 0 ? kickForce : -kickForce);
    } else {
        // If player is not moving horizontally, kick in direction player is facing
        const kickDirection = player.x < ball.x ? 1 : -1;
        ball.setVelocityX(kickDirection * kickForce);
    }
    
    // Add some upward force for more realistic ball physics
    ball.setVelocityY(-150);
}

function handleGoalScored(scoringPlayer) {
    // Don't process goals if game is already over
    if (gameOver) return;
    
    // Increment score
    if (scoringPlayer === 'left') {
        leftScore++;
    } else {
        rightScore++;
    }
    
    // Update score display
    scoreText.setText(`Left: ${leftScore} | Right: ${rightScore}`);
    
    // Reset ball to center
    ball.setPosition(400, 300);
    ball.setVelocity(0, 0);
    
    // Check win condition (3 goals wins immediately)
    if (leftScore >= 3 || rightScore >= 3) {
        const winMessage = scoringPlayer === 'left' ? 'Left Player Wins!' : 'Right Player Wins!';
        handleGameOver(scoringPlayer, winMessage);
    }
    
    console.log(`Goal scored by ${scoringPlayer}! Score: Left ${leftScore} - Right ${rightScore}`);
}

function handleGameOver(winner, customMessage = null) {
    gameOver = true;
    
    // Stop the timer
    if (timerEvent) {
        timerEvent.remove();
    }
    
    // Stop ball movement
    ball.setVelocity(0, 0);
    ball.body.setGravityY(0);
    
    // Create game over text
    let winnerText;
    if (customMessage) {
        winnerText = customMessage;
    } else {
        winnerText = winner === 'left' ? 'Left Player Wins!' : 
                    winner === 'right' ? 'Right Player Wins!' : 
                    'It\'s a Tie!';
    }
    
    gameOverText = gameScene.add.text(400, 200, winnerText, {
        fontSize: '48px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5, 0.5);
    
    // Add restart instruction
    gameScene.add.text(400, 260, 'Press R to restart', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
    }).setOrigin(0.5, 0.5);
    
    // Add restart key
    gameScene.input.keyboard.on('keydown-R', restartGame);
    
    console.log(`Game Over! Winner: ${winner}`);
}

function restartGame() {
    // Reset game state
    gameOver = false;
    leftScore = 0;
    rightScore = 0;
    matchTime = 60;
    
    // Reset ball
    ball.setPosition(400, 300);
    ball.setVelocity(0, 0);
    ball.body.setGravityY(300);
    
    // Reset player
    player.setPosition(400, 450);
    player.setVelocity(0, 0);
    
    // Update displays
    scoreText.setText(`Left: ${leftScore} | Right: ${rightScore}`);
    timerText.setText(formatTime(matchTime));
    timerText.setStyle({ fill: '#ffff00' }); // Reset timer color
    
    // Remove game over text
    if (gameOverText) {
        gameOverText.destroy();
        gameOverText = null;
    }
    
    // Remove restart instruction
    const restartText = gameScene.children.getByName('restartText');
    if (restartText) {
        restartText.destroy();
    }
    
    // Restart the timer
    startMatchTimer();
    
    console.log('Game restarted!');
}

function update() {
    // Update FPS counter
    fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
    
    // Don't process player movement if game is over
    if (gameOver) return;
    
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