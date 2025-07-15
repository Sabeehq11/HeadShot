// Character definitions
const CHARACTERS = {
    blaze: {
        name: 'Blaze',
        power: 'Fire Kick',
        description: 'Powerful fire kicks that burn through defenses',
        color: 0xff4500,
        sprite: { category: 'tinyHeroes', id: 'dudeMonster' }
    },
    frostbite: {
        name: 'Frostbite',
        power: 'Ice Freeze',
        description: 'Freezes opponents and slows down the ball',
        color: 0x00bfff,
        sprite: { category: 'tinyHeroes', id: 'pinkMonster' }
    },
    volt: {
        name: 'Volt',
        power: 'Lightning Dash',
        description: 'Super-fast movement with electric strikes',
        color: 0xffff00,
        sprite: { category: 'tinyHeroes', id: 'owletMonster' }
    },
    jellyhead: {
        name: 'Jellyhead',
        power: 'Bounce Shield',
        description: 'Creates bouncy barriers for defense',
        color: 0x9370db,
        sprite: { category: 'miniPixelPack', id: 'drscience' }
    },
    brick: {
        name: 'Brick',
        power: 'Stone Wall',
        description: 'Builds solid walls to block attacks',
        color: 0x8b4513,
        sprite: { category: 'miniPixelPack', id: 'capp' }
    },
    whirlwind: {
        name: 'Whirlwind',
        power: 'Air Spin',
        description: 'Controls air currents to redirect the ball',
        color: 0x87ceeb,
        sprite: { category: 'miniPixelPack', id: 'tanker' }
    }
};

// Global character selection state
let selectedCharacters = {
    player1: null,
    player2: null
};

// Character Selection Scene
class CharacterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CharacterSelectionScene' });
        this.characterKeys = Object.keys(CHARACTERS);
        this.player1Selection = 0;
        this.player2Selection = 0;
        this.player1Confirmed = false;
        this.player2Confirmed = false;
        this.player1UI = null;
        this.player2UI = null;
        this.charactersDisplay = [];
    }

    preload() {
        // Load all character sprites for previews
        this.characterKeys.forEach(key => {
            const character = CHARACTERS[key];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig) {
                if (spriteConfig.type === 'sprite_sheet') {
                    // Load idle animation for Tiny Heroes
                    this.load.spritesheet(`${key}_preview`, 
                        spriteConfig.basePath + spriteConfig.animations.idle.file, 
                        { frameWidth: 32, frameHeight: 32 }
                    );
                } else {
                    // Load single frame for Mini Pixel Pack characters
                    const idleAnim = spriteConfig.animations.idle;
                    const framePath = spriteConfig.basePath + idleAnim.file;
                    this.load.image(`${key}_preview`, framePath);
                }
            }
        });
    }

    create() {
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

        // Title
        this.add.text(400, 50, '⚡ CHARACTER SELECTION ⚡', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 100, 'Choose your character!', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Player 1 controls
        this.add.text(150, 140, 'Player 1 (Green)', {
            fontSize: '18px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        this.add.text(150, 170, 'A/D to navigate • W or Enter to select', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Player 2 controls
        this.add.text(650, 140, 'Player 2 (Blue)', {
            fontSize: '18px',
            fill: '#0080ff',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        this.add.text(650, 170, '← → to navigate • ↑ or Enter to select', {
            fontSize: '14px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 8, y: 4 }
        }).setOrigin(0.5);

        // Create character display
        this.createCharacterDisplay();

        // Create player UI panels
        this.createPlayerUI();

        // Setup keyboard controls
        this.setupControls();

        // Update display
        this.updateDisplay();
    }

    createCharacterDisplay() {
        const startX = 50;
        const startY = 200;
        const spacing = 120;
        const previewY = startY - 10; // Lift sprites up slightly

        this.characterKeys.forEach((key, index) => {
            const character = CHARACTERS[key];
            const x = startX + (index * spacing);
            const y = startY;

            // Handle both sprite sheets and single frames
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            let sprite;
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                // For sprite sheets (Tiny Heroes), use static frame to prevent flickering
                sprite = this.add.image(x, previewY, `${key}_preview`);
                sprite.setScale(2.0)
                      .setOrigin(0.5)
                      .setFrame(0); // Use first frame to prevent animation flicker
            } else {
                // For single frames (Mini Pixel Pack), create static image with larger scale
                sprite = this.add.image(x, previewY + 5, `${key}_preview`); // Slightly lower for baseline alignment
                sprite.setScale(3.0)  // Increased scale for Mini Pixel Pack characters
                      .setOrigin(0.5);
            }

            // Character name
            const name = this.add.text(x, y + 70, character.name, {
                fontSize: '16px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5);

            // Power name
            const power = this.add.text(x, y + 95, character.power, {
                fontSize: '12px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5);

            // Description
            const description = this.add.text(x, y + 120, character.description, {
                fontSize: '10px',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 },
                wordWrap: { width: 100, useAdvancedWrap: true }
            }).setOrigin(0.5);

            this.charactersDisplay.push({
                sprite,
                name,
                power,
                description,
                index
            });
        });
    }

    createPlayerUI() {
        // Player 1 UI (Left side)
        this.player1UI = {
            panel: this.add.rectangle(150, 420, 250, 150, 0x003300, 0.8),
            title: this.add.text(150, 370, 'Player 1 Selection', {
                fontSize: '18px',
                fill: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5),
            character: this.add.text(150, 400, '', {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5),
            power: this.add.text(150, 430, '', {
                fontSize: '14px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5),
            status: this.add.text(150, 460, 'Press W or Enter to confirm', {
                fontSize: '12px',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5)
        };

        // Player 2 UI (Right side)
        this.player2UI = {
            panel: this.add.rectangle(650, 420, 250, 150, 0x000033, 0.8),
            title: this.add.text(650, 370, 'Player 2 Selection', {
                fontSize: '18px',
                fill: '#0080ff',
                backgroundColor: '#000000',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5),
            character: this.add.text(650, 400, '', {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 10, y: 5 }
            }).setOrigin(0.5),
            power: this.add.text(650, 430, '', {
                fontSize: '14px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 }
            }).setOrigin(0.5),
            status: this.add.text(650, 460, 'Press ↑ or Enter to confirm', {
                fontSize: '12px',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5)
        };
    }

    setupControls() {
        // Player 1 controls (WASD)
        this.input.keyboard.on('keydown-A', () => {
            if (!this.player1Confirmed) {
                this.player1Selection = (this.player1Selection - 1 + this.characterKeys.length) % this.characterKeys.length;
                this.updateDisplay();
            }
        });

        this.input.keyboard.on('keydown-D', () => {
            if (!this.player1Confirmed) {
                this.player1Selection = (this.player1Selection + 1) % this.characterKeys.length;
                this.updateDisplay();
            }
        });

        this.input.keyboard.on('keydown-W', () => {
            if (!this.player1Confirmed) {
                this.confirmPlayer1Selection();
            }
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            if (!this.player1Confirmed) {
                this.confirmPlayer1Selection();
            } else if (!this.player2Confirmed) {
                this.confirmPlayer2Selection();
            }
        });

        // Player 2 controls (Arrow keys)
        this.input.keyboard.on('keydown-LEFT', () => {
            if (!this.player2Confirmed) {
                this.player2Selection = (this.player2Selection - 1 + this.characterKeys.length) % this.characterKeys.length;
                this.updateDisplay();
            }
        });

        this.input.keyboard.on('keydown-RIGHT', () => {
            if (!this.player2Confirmed) {
                this.player2Selection = (this.player2Selection + 1) % this.characterKeys.length;
                this.updateDisplay();
            }
        });

        this.input.keyboard.on('keydown-UP', () => {
            if (!this.player2Confirmed) {
                this.confirmPlayer2Selection();
            }
        });
    }

    updateDisplay() {
        // Reset all character displays with consistent scaling
        this.charactersDisplay.forEach((display, index) => {
            display.sprite.setTint(0xffffff);
            
            // Set scale based on character type
            const character = CHARACTERS[this.characterKeys[index]];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                display.sprite.setScale(2.0); // Tiny Heroes normal scale
            } else {
                display.sprite.setScale(3.0); // Mini Pixel Pack normal scale
            }
        });

        // Highlight current selections with increased scale
        if (!this.player1Confirmed) {
            const p1Display = this.charactersDisplay[this.player1Selection];
            const p1Character = CHARACTERS[this.characterKeys[this.player1Selection]];
            const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
            
            p1Display.sprite.setTint(0x00ff00);
            if (p1SpriteConfig && (p1SpriteConfig.type === 'sprite_sheet' || p1SpriteConfig.hasAnimation)) {
                p1Display.sprite.setScale(2.4); // Tiny Heroes selected scale
            } else {
                p1Display.sprite.setScale(3.6); // Mini Pixel Pack selected scale
            }
        }

        if (!this.player2Confirmed) {
            const p2Display = this.charactersDisplay[this.player2Selection];
            const p2Character = CHARACTERS[this.characterKeys[this.player2Selection]];
            const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
            
            p2Display.sprite.setTint(0x0080ff);
            if (p2SpriteConfig && (p2SpriteConfig.type === 'sprite_sheet' || p2SpriteConfig.hasAnimation)) {
                p2Display.sprite.setScale(2.4); // Tiny Heroes selected scale
            } else {
                p2Display.sprite.setScale(3.6); // Mini Pixel Pack selected scale
            }
        }

        // Update Player 1 UI
        const p1Character = CHARACTERS[this.characterKeys[this.player1Selection]];
        this.player1UI.character.setText(p1Character.name);
        this.player1UI.power.setText(p1Character.power);
        if (this.player1Confirmed) {
            this.player1UI.status.setText('✓ CONFIRMED');
            this.player1UI.status.setStyle({ fill: '#00ff00' });
        } else {
            this.player1UI.status.setText('Press W or Enter to confirm');
            this.player1UI.status.setStyle({ fill: '#cccccc' });
        }

        // Update Player 2 UI
        const p2Character = CHARACTERS[this.characterKeys[this.player2Selection]];
        this.player2UI.character.setText(p2Character.name);
        this.player2UI.power.setText(p2Character.power);
        if (this.player2Confirmed) {
            this.player2UI.status.setText('✓ CONFIRMED');
            this.player2UI.status.setStyle({ fill: '#0080ff' });
        } else {
            this.player2UI.status.setText('Press ↑ or Enter to confirm');
            this.player2UI.status.setStyle({ fill: '#cccccc' });
        }
    }

    confirmPlayer1Selection() {
        this.player1Confirmed = true;
        selectedCharacters.player1 = this.characterKeys[this.player1Selection];
        this.updateDisplay();
        this.checkBothPlayersReady();
    }

    confirmPlayer2Selection() {
        this.player2Confirmed = true;
        selectedCharacters.player2 = this.characterKeys[this.player2Selection];
        this.updateDisplay();
        this.checkBothPlayersReady();
    }

    checkBothPlayersReady() {
        if (this.player1Confirmed && this.player2Confirmed) {
            // Show "Starting match..." message
            this.add.text(400, 550, 'Starting match...', {
                fontSize: '24px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 16, y: 8 }
            }).setOrigin(0.5);

            // Wait a moment then start the game
            this.time.delayedCall(1500, () => {
                this.scene.start('GameScene');
            });
        }
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];

        // Load Player 1 character sprites
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        if (p1SpriteConfig) {
            if (p1SpriteConfig.type === 'sprite_sheet') {
                // Tiny Heroes - Load sprite sheets
                this.load.spritesheet('player1_idle', 
                    p1SpriteConfig.basePath + p1SpriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
                this.load.spritesheet('player1_walk', 
                    p1SpriteConfig.basePath + p1SpriteConfig.animations.walk.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                // Mini Pixel Pack - Load single frame images
                const idleAnim = p1SpriteConfig.animations.idle;
                const walkAnim = p1SpriteConfig.animations.walk;
                
                // Load idle frame
                this.load.image('player1_idle', p1SpriteConfig.basePath + idleAnim.file);
                
                // Load walk frame
                this.load.image('player1_walk', p1SpriteConfig.basePath + walkAnim.file);
            }
        }

        // Load Player 2 character sprites
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
        if (p2SpriteConfig) {
            if (p2SpriteConfig.type === 'sprite_sheet') {
                // Tiny Heroes - Load sprite sheets
                this.load.spritesheet('player2_idle', 
                    p2SpriteConfig.basePath + p2SpriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
                this.load.spritesheet('player2_walk', 
                    p2SpriteConfig.basePath + p2SpriteConfig.animations.walk.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                // Mini Pixel Pack - Load single frame images
                const idleAnim = p2SpriteConfig.animations.idle;
                const walkAnim = p2SpriteConfig.animations.walk;
                
                // Load idle frame
                this.load.image('player2_idle', p2SpriteConfig.basePath + idleAnim.file);
                
                // Load walk frame
                this.load.image('player2_walk', p2SpriteConfig.basePath + walkAnim.file);
            }
        }
    
    this.add.graphics()
        .fillStyle(0x8b4513)
        .fillRect(0, 0, 800, 50)
        .generateTexture('ground', 800, 50);
    
        // Load pixel art soccer ball sprite
        this.load.image('ball', 'assets/Sprites/Ball/Sport-Balls-Asset-Pack-Pixel-Art/64x64/football.png');
        
        // Create goal post placeholder graphics
    this.add.graphics()
        .fillStyle(0xff0000)
        .fillRect(0, 0, 20, 200)
        .generateTexture('goalPost', 20, 200);
}

    create() {
    // Store scene reference for later use
        this.gameScene = this;
        
        // Initialize game state
        this.gameOver = false;
        this.leftScore = 0;
        this.rightScore = 0;
        this.matchTime = 60;
        
        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
    
    // Create ground
    const ground = this.add.rectangle(400, 575, 800, 50, 0x8b4513);
        this.physics.add.existing(ground, true);
        
        // Create Player 1 with selected character sprite
        this.player1 = this.physics.add.sprite(200, 450, 'player1_idle');
        this.player1.setBounce(0.2);
        this.player1.setCollideWorldBounds(true);
        this.player1.setMass(1);
        this.player1.setDrag(100);
        this.player1.setMaxVelocity(300, 800);
        
        // Set scale based on character type
        if (p1SpriteConfig && (p1SpriteConfig.type === 'sprite_sheet' || p1SpriteConfig.hasAnimation)) {
            this.player1.setScale(2.0);  // Tiny Heroes
            this.player1.setOrigin(0.5, 1);
            // Tighten collision body for Tiny Heroes (32x32 base -> 64x64 visual)
            this.player1.body.setSize(24, 30); // Narrower width, slightly shorter height
            this.player1.body.setOffset(4, 2); // Center the collision body
        } else {
            this.player1.setScale(3.0);  // Mini Pixel Pack - larger scale to match Tiny Heroes
            this.player1.setOrigin(0.5, 1);
            // Adjust collision body for Mini Pixel Pack (16x16 base -> 48x48 visual)
            this.player1.body.setSize(16, 16); // Match the original sprite size for proper collision
            this.player1.body.setOffset(0, 0); // Center the collision body
        }
        
        // Create Player 2 with selected character sprite
        this.player2 = this.physics.add.sprite(600, 450, 'player2_idle');
        this.player2.setBounce(0.2);
        this.player2.setCollideWorldBounds(true);
        this.player2.setMass(1);
        this.player2.setDrag(100);
        this.player2.setMaxVelocity(300, 800);
        
        // Set scale based on character type
        if (p2SpriteConfig && (p2SpriteConfig.type === 'sprite_sheet' || p2SpriteConfig.hasAnimation)) {
            this.player2.setScale(2.0);  // Tiny Heroes
            this.player2.setOrigin(0.5, 1);
            // Tighten collision body for Tiny Heroes (32x32 base -> 64x64 visual)
            this.player2.body.setSize(24, 30); // Narrower width, slightly shorter height
            this.player2.body.setOffset(4, 2); // Center the collision body
        } else {
            this.player2.setScale(3.0);  // Mini Pixel Pack - larger scale to match Tiny Heroes
            this.player2.setOrigin(0.5, 1);
            // Adjust collision body for Mini Pixel Pack (16x16 base -> 48x48 visual)
            this.player2.body.setSize(16, 16); // Match the original sprite size for proper collision
            this.player2.body.setOffset(0, 0); // Center the collision body
        }
        
        // Create animations for both players
        this.createPlayerAnimations(p1SpriteConfig, p2SpriteConfig);
        
        // Start with idle animations
        this.player1.play('player1_idle_anim');
        this.player2.play('player2_idle_anim');
        
        // Create soccer ball with pixel art sprite
        this.ball = this.physics.add.sprite(400, 450, 'ball'); // Positioned at same level as players
        this.ball.setScale(0.5); // Scale to be half the size of player characters
        this.ball.setOrigin(0.5, 1); // Anchor at bottom center like players
        this.ball.setBounce(0.6);
        this.ball.setCollideWorldBounds(true);
        this.ball.setDrag(100);
        this.ball.setMass(0.5);
        this.ball.setMaxVelocity(350, 500);
        
        // No collision body adjustments - use default collision body
        
        // Create goal zones
        this.leftGoal = this.add.rectangle(10, 400, 20, 200, 0xff0000, 0);
        this.rightGoal = this.add.rectangle(790, 400, 20, 200, 0xff0000, 0);
        this.physics.add.existing(this.leftGoal, true);
        this.physics.add.existing(this.rightGoal, true);
        
        // Add visual goal post indicators
        this.add.rectangle(10, 300, 15, 5, 0xffffff);
        this.add.rectangle(10, 500, 15, 5, 0xffffff);
        this.add.rectangle(10, 400, 5, 200, 0xffffff);
        
        this.add.rectangle(790, 300, 15, 5, 0xffffff);
        this.add.rectangle(790, 500, 15, 5, 0xffffff);
        this.add.rectangle(790, 400, 5, 200, 0xffffff);
    
    // Physics collisions
        this.physics.add.collider(this.player1, ground);
        this.physics.add.collider(this.player2, ground);
        this.physics.add.collider(this.ball, ground);
        this.physics.add.collider(this.player1, this.ball, this.handlePlayerBallCollision, null, this);
        this.physics.add.collider(this.player2, this.ball, this.handlePlayerBallCollision, null, this);
        this.physics.add.collider(this.player1, this.player2, this.handlePlayerPlayerCollision, null, this);
        
        // Goal detection
        this.physics.add.overlap(this.ball, this.leftGoal, () => this.handleGoalScored('right'));
        this.physics.add.overlap(this.ball, this.rightGoal, () => this.handleGoalScored('left'));
        
        // Create cursor keys and WASD
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        
        // Create UI
        this.createUI();
        
        // Start the match timer
        this.startMatchTimer();
        
        // Initialize socket connection
        this.initializeSocket();
    }

    createPlayerAnimations(p1SpriteConfig, p2SpriteConfig) {
        // Create Player 1 animations
        if (p1SpriteConfig.type === 'sprite_sheet') {
            // Tiny Heroes - Sprite sheet animations
            this.anims.create({
                key: 'player1_idle_anim',
                frames: this.anims.generateFrameNumbers('player1_idle', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            
            this.anims.create({
                key: 'player1_walk_anim',
                frames: this.anims.generateFrameNumbers('player1_walk', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        } else {
            // Mini Pixel Pack - Single frame animations (no animation needed)
            // Static frames will be used directly without animation
        }
        
        // Create Player 2 animations
        if (p2SpriteConfig.type === 'sprite_sheet') {
            // Tiny Heroes - Sprite sheet animations
            this.anims.create({
                key: 'player2_idle_anim',
                frames: this.anims.generateFrameNumbers('player2_idle', { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            
            this.anims.create({
                key: 'player2_walk_anim',
                frames: this.anims.generateFrameNumbers('player2_walk', { start: 0, end: 5 }),
                frameRate: 10,
                repeat: -1
            });
        } else {
            // Mini Pixel Pack - Single frame animations (no animation needed)
            // Static frames will be used directly without animation
        }
    }

    createUI() {
        // Get selected character names
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];

        // Timer display
        this.timerText = this.add.text(400, 60, this.formatTime(this.matchTime), {
        fontSize: '28px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
    
        // Score display
        this.scoreText = this.add.text(400, 30, 'Left: 0 | Right: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        // FPS text
        this.fpsText = this.add.text(16, 16, 'FPS: 60', {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        // Character info
        this.add.text(16, 100, `Player 1: ${p1Character.name} (${p1Character.power})`, {
        fontSize: '16px',
            fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        this.add.text(16, 130, `Player 2: ${p2Character.name} (${p2Character.power})`, {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        this.add.text(16, 160, 'Controls: WASD (P1) | Arrow Keys (P2)', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        // Connection status
        this.connectionStatusText = this.add.text(16, 190, 'Socket: Connecting...', {
        fontSize: '16px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    
        this.socketText = this.add.text(16, 220, 'Socket ID: Not connected', {
        fontSize: '16px',
        fill: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    });
    }

    startMatchTimer() {
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
        loop: true
    });
}

    updateTimer() {
        if (this.gameOver) return;
        
        this.matchTime--;
        this.timerText.setText(this.formatTime(this.matchTime));
        
        if (this.matchTime <= 10) {
            this.timerText.setStyle({ fill: '#ff0000' });
        } else if (this.matchTime <= 30) {
            this.timerText.setStyle({ fill: '#ffa500' });
        }
        
        if (this.matchTime <= 0) {
            this.handleTimeUp();
        }
    }

    formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

    handleTimeUp() {
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        
        let winner, winMessage;
        
        if (this.leftScore > this.rightScore) {
        winner = 'left';
        winMessage = 'Time\'s Up! Left Player Wins!';
        } else if (this.rightScore > this.leftScore) {
        winner = 'right';
        winMessage = 'Time\'s Up! Right Player Wins!';
    } else {
        winner = 'tie';
        winMessage = 'Time\'s Up! It\'s a Tie!';
    }
    
        this.handleGameOver(winner, winMessage);
}

    handlePlayerBallCollision(player, ball) {
        if (this.gameOver) return;
    
    const ballVelocityX = ball.body.velocity.x;
    const ballVelocityY = ball.body.velocity.y;
    const playerVelocityX = player.body.velocity.x;
    const playerVelocityY = player.body.velocity.y;
    
    const deltaX = ball.x - player.x;
    const deltaY = ball.y - player.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < 1) return;
    
    const normalX = deltaX / distance;
    const normalY = deltaY / distance;
    
        const separationDistance = 35;
    const separationForce = Math.max(0, separationDistance - distance);
    if (separationForce > 0) {
        ball.x += normalX * separationForce;
        ball.y += normalY * separationForce;
    }
    
        const isPlayer1 = player === this.player1;
        const correctDirection = isPlayer1 ? 1 : -1;
    
    const playerIsMoving = Math.abs(playerVelocityX) > 50 || Math.abs(playerVelocityY) > 50;
    const playerIsGrounded = player.body.touching.down;
    const isHeadCollision = deltaY < -15 && Math.abs(deltaX) < 30;
    
    if (playerIsMoving && playerIsGrounded && !isHeadCollision) {
        const kickPower = 280;
        let kickDirection = playerVelocityX > 0 ? 1 : playerVelocityX < 0 ? -1 : correctDirection;
        
            if ((isPlayer1 && kickDirection < 0) || (!isPlayer1 && kickDirection > 0)) {
            kickDirection = correctDirection;
        }
        
        ball.setVelocityX(kickDirection * kickPower);
        ball.setVelocityY(-200);
        player.setVelocityX(playerVelocityX * 0.7);
        
    } else {
            const bounceStrength = 1.1;
            const minBounceSpeed = 180;
        
        const incomingSpeed = Math.sqrt(ballVelocityX * ballVelocityX + ballVelocityY * ballVelocityY);
        const bounceSpeed = Math.max(incomingSpeed * bounceStrength, minBounceSpeed);
        
        if (isHeadCollision) {
            ball.setVelocityX(correctDirection * bounceSpeed * 0.8);
                ball.setVelocityY(-Math.abs(bounceSpeed * 0.6));
        } else {
            let bounceX = normalX * bounceSpeed;
            let bounceY = normalY * bounceSpeed;
            
                if ((isPlayer1 && bounceX < 0) || (!isPlayer1 && bounceX > 0)) {
                bounceX = (bounceX * 0.3) + (correctDirection * bounceSpeed * 0.7);
            }
            
            ball.setVelocityX(bounceX);
            ball.setVelocityY(bounceY);
            
            if (deltaY > 0) {
                ball.setVelocityY(Math.max(ball.body.velocity.y, -120));
            }
        }
        
        if (incomingSpeed > 100) {
            player.setVelocityX(playerVelocityX + (-normalX * 20));
        }
    }
}

    handlePlayerPlayerCollision(player1, player2) {
        if (this.gameOver) return;
    
    const deltaX = player2.x - player1.x;
    const deltaY = player2.y - player1.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    const normalX = deltaX / distance;
    const normalY = deltaY / distance;
    
    const p1VelX = player1.body.velocity.x;
    const p1VelY = player1.body.velocity.y;
    const p2VelX = player2.body.velocity.x;
    const p2VelY = player2.body.velocity.y;
    
    const relativeVelX = p1VelX - p2VelX;
    const relativeVelY = p1VelY - p2VelY;
    
        const collisionStrength = 0.3;
    const pushForce = (relativeVelX * normalX + relativeVelY * normalY) * collisionStrength;
    
    player1.setVelocityX(p1VelX - pushForce * normalX);
    player1.setVelocityY(p1VelY - pushForce * normalY);
    
    player2.setVelocityX(p2VelX + pushForce * normalX);
    player2.setVelocityY(p2VelY + pushForce * normalY);
    
    const separationForce = 2;
    player1.x -= normalX * separationForce;
    player1.y -= normalY * separationForce;
    player2.x += normalX * separationForce;
    player2.y += normalY * separationForce;
}

    handleGoalScored(scoringPlayer) {
        if (this.gameOver) return;
    
    if (scoringPlayer === 'left') {
            this.leftScore++;
    } else {
            this.rightScore++;
    }
    
        this.scoreText.setText(`Left: ${this.leftScore} | Right: ${this.rightScore}`);
    
        this.ball.setPosition(400, 450); // Reset ball to same level as players
        this.ball.setVelocity(0, 0);
    
        if (this.leftScore >= 3 || this.rightScore >= 3) {
        const winMessage = scoringPlayer === 'left' ? 'Left Player Wins!' : 'Right Player Wins!';
            this.handleGameOver(scoringPlayer, winMessage);
    }
}

    handleGameOver(winner, customMessage = null) {
        this.gameOver = true;
    
        if (this.timerEvent) {
            this.timerEvent.remove();
    }
    
        this.ball.setVelocity(0, 0);
        this.ball.body.setGravityY(0);
    
    let winnerText;
    if (customMessage) {
        winnerText = customMessage;
    } else {
        winnerText = winner === 'left' ? 'Left Player Wins!' : 
                    winner === 'right' ? 'Right Player Wins!' : 
                    'It\'s a Tie!';
    }
    
        this.gameOverText = this.add.text(400, 200, winnerText, {
        fontSize: '48px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
    
        this.add.text(400, 260, 'Press R to restart | Press C to choose characters', {
            fontSize: '20px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        this.input.keyboard.on('keydown-R', this.restartGame, this);
        this.input.keyboard.on('keydown-C', this.chooseCharacters, this);
    }

    restartGame() {
        this.scene.restart();
    }

    chooseCharacters() {
        // Reset selected characters
        selectedCharacters = {
            player1: null,
            player2: null
        };
        this.scene.start('CharacterSelectionScene');
    }

    update() {
        this.fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
        
        if (this.gameOver) return;
        
    const speed = 160;
    const jumpSpeed = 330;
    
        // Player 1 movement (WASD) - with animations
        if (this.wasd.A.isDown) {
            this.player1.setVelocityX(-speed);
            this.player1.setFlipX(true);
            if (this.player1.anims && this.player1.anims.currentAnim && this.player1.anims.currentAnim.key !== 'player1_walk_anim') {
                this.player1.play('player1_walk_anim');
            }
        } else if (this.wasd.D.isDown) {
            this.player1.setVelocityX(speed);
            this.player1.setFlipX(false);
            if (this.player1.anims && this.player1.anims.currentAnim && this.player1.anims.currentAnim.key !== 'player1_walk_anim') {
                this.player1.play('player1_walk_anim');
            }
    } else {
            this.player1.setVelocityX(0);
            if (this.player1.anims && this.player1.anims.currentAnim && this.player1.anims.currentAnim.key !== 'player1_idle_anim') {
                this.player1.play('player1_idle_anim');
            }
        }
        
        if (this.wasd.W.isDown && this.player1.body.touching.down) {
            this.player1.setVelocityY(-jumpSpeed);
        }
        
        // Player 2 movement (Arrow keys) - with animations
        if (this.cursors.left.isDown) {
            this.player2.setVelocityX(-speed);
            this.player2.setFlipX(true);
            if (this.player2.anims && this.player2.anims.currentAnim && this.player2.anims.currentAnim.key !== 'player2_walk_anim') {
                this.player2.play('player2_walk_anim');
            }
        } else if (this.cursors.right.isDown) {
            this.player2.setVelocityX(speed);
            this.player2.setFlipX(false);
            if (this.player2.anims && this.player2.anims.currentAnim && this.player2.anims.currentAnim.key !== 'player2_walk_anim') {
                this.player2.play('player2_walk_anim');
            }
    } else {
            this.player2.setVelocityX(0);
            if (this.player2.anims && this.player2.anims.currentAnim && this.player2.anims.currentAnim.key !== 'player2_idle_anim') {
                this.player2.play('player2_idle_anim');
            }
    }
    
        if (this.cursors.up.isDown && this.player2.body.touching.down) {
            this.player2.setVelocityY(-jumpSpeed);
    }
}

    initializeSocket() {
// Socket.io connection setup
        this.socket = io('http://localhost:3000');
        
        this.socket.on('connect', () => {
            this.connectionStatusText.setText('Socket: Connected ✅');
            this.connectionStatusText.setStyle({ fill: '#00ff00' });
            this.socketText.setText(`Socket ID: ${this.socket.id}`);
            
            this.socket.emit('hello from client', {
            message: 'Hello from Phaser client!',
            timestamp: new Date().toISOString()
        });
        });
        
        this.socket.on('hello from server', (data) => {
            this.connectionStatusText.setText('Socket: Server responded ✅');
        });
        
        this.socket.on('connect_error', (error) => {
            this.connectionStatusText.setText('Socket: Connection Error ❌');
            this.connectionStatusText.setStyle({ fill: '#ff0000' });
        });
        
        this.socket.on('disconnect', (reason) => {
            this.connectionStatusText.setText('Socket: Disconnected ❌');
            this.connectionStatusText.setStyle({ fill: '#ff0000' });
            this.socketText.setText('Socket ID: Disconnected');
        });
    }
}

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
    scene: [CharacterSelectionScene, GameScene]
};

// Initialize the game
const game = new Phaser.Game(config); 