// Character definitions
const CHARACTERS = {
    blaze: {
        name: 'Blaze',
        power: 'Fire Kick',
        description: 'Fire balls pass through enemies unless they use their power to deflect',
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
        power: 'Immunity',
        description: 'Immune to all attacks for 5 seconds',
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

// Global map selection state
let selectedMap = 'nightcity';

// Global session state for tracking wins across matches
let SessionState = {
    player1Wins: 0,
    player2Wins: 0,
    totalRoundsPlayed: 0
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

    init() {
        // Reset scene state when entering from another scene
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
        // Ensure arrays are properly initialized
        if (!this.charactersDisplay || !this.characterKeys) {
            console.error('updateDisplay called before proper initialization');
            return;
        }
        
        // Debug logging (can be removed in production)
        // console.log('updateDisplay - charactersDisplay length:', this.charactersDisplay.length);
        // console.log('updateDisplay - characterKeys length:', this.characterKeys.length);
        
        // Reset all character displays with consistent scaling
        this.charactersDisplay.forEach((display, index) => {
            // Ensure display exists and has sprite
            if (!display || !display.sprite) {
                return;
            }
            
            display.sprite.setTint(0xffffff);
            
            // Set scale based on character type
            const characterKey = this.characterKeys[index];
            const character = CHARACTERS[characterKey];
            
            // Add defensive check to prevent undefined character error
            if (!character) {
                console.warn('Character not found for key:', characterKey, 'at index:', index);
                return; // Skip this iteration
            }
            
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                display.sprite.setScale(2.0); // Tiny Heroes normal scale
            } else {
                display.sprite.setScale(3.0); // Mini Pixel Pack normal scale
            }
        });

        // Highlight current selections with increased scale
        if (!this.player1Confirmed && 
            this.player1Selection >= 0 && 
            this.player1Selection < this.charactersDisplay.length && 
            this.charactersDisplay[this.player1Selection]) {
            
            const p1Display = this.charactersDisplay[this.player1Selection];
            const p1CharacterKey = this.characterKeys[this.player1Selection];
            const p1Character = CHARACTERS[p1CharacterKey];
            
            if (p1Character && p1Display.sprite) {
                const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
                
                p1Display.sprite.setTint(0x00ff00);
                if (p1SpriteConfig && (p1SpriteConfig.type === 'sprite_sheet' || p1SpriteConfig.hasAnimation)) {
                    p1Display.sprite.setScale(2.4); // Tiny Heroes selected scale
                } else {
                    p1Display.sprite.setScale(3.6); // Mini Pixel Pack selected scale
                }
            }
        }

        if (!this.player2Confirmed && 
            this.player2Selection >= 0 && 
            this.player2Selection < this.charactersDisplay.length && 
            this.charactersDisplay[this.player2Selection]) {
            
            const p2Display = this.charactersDisplay[this.player2Selection];
            const p2CharacterKey = this.characterKeys[this.player2Selection];
            const p2Character = CHARACTERS[p2CharacterKey];
            
            if (p2Character && p2Display.sprite) {
                const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
                
                p2Display.sprite.setTint(0x0080ff);
                if (p2SpriteConfig && (p2SpriteConfig.type === 'sprite_sheet' || p2SpriteConfig.hasAnimation)) {
                    p2Display.sprite.setScale(2.4); // Tiny Heroes selected scale
                } else {
                    p2Display.sprite.setScale(3.6); // Mini Pixel Pack selected scale
                }
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

            // Wait a moment then start map selection
            this.time.delayedCall(1500, () => {
                this.scene.start('MapSelectScene');
            });
        }
    }
}

// Map Selection Scene
class MapSelectScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MapSelectScene' });
        this.selectedMapKey = 'nightcity'; // Default selection
    }

    preload() {
        // Load all map images for thumbnails
        this.load.image('nightcity', 'assets/Sprites/Backgrounds/nightcity.png');
        this.load.image('ch', 'assets/Sprites/Backgrounds/ch.png');
        this.load.image('skyline', 'assets/Sprites/Backgrounds/skyline.png');
        this.load.image('nature', 'assets/Sprites/Backgrounds/nature.png');
        this.load.image('nighttree', 'assets/Sprites/Backgrounds/nighttree.png');
        this.load.image('outsideworld', 'assets/Sprites/Backgrounds/outsideworld.png');
        
        console.log('MapSelectScene: Loading map images...');
    }

    create() {
        console.log('MapSelectScene: Creating map selection screen...');
        
        // Background
        this.add.rectangle(400, 300, 800, 600, 0x2c3e50);

        // Title
        this.add.text(400, 50, '🗺️ MAP SELECTION 🗺️', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        // Instructions
        this.add.text(400, 100, 'Choose your battleground!', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Additional instruction for selection
        this.add.text(400, 130, 'Click on a map to select it', {
            fontSize: '16px',
            fill: '#cccccc',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        // Create map thumbnails
        this.createMapThumbnails();

        // Create selected map status
        const initialMapName = this.selectedMapKey === 'nightcity' ? 'Night City' : 
                             this.selectedMapKey === 'ch' ? 'Ch' : 
                             this.selectedMapKey === 'skyline' ? 'Skyline' : 
                             this.selectedMapKey === 'nature' ? 'Nature' : 
                             this.selectedMapKey === 'nighttree' ? 'Night Tree' : 
                             this.selectedMapKey === 'outsideworld' ? 'Outside World' : this.selectedMapKey;
        this.selectedMapStatus = this.add.text(400, 380, `Selected: ${initialMapName}`, {
            fontSize: '18px',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 12, y: 6 }
        }).setOrigin(0.5);

        // Create Start Match button
        this.createStartButton();
    }

    createMapThumbnails() {
        const mapConfigs = [
            // Top row
            {
                key: 'nightcity',
                name: 'Night City',
                x: 200,
                y: 160,
                description: 'Neon-lit cityscape under starry night sky'
            },
            {
                key: 'ch',
                name: 'Ch',
                x: 400,
                y: 160,
                description: 'Action-packed urban battlefield'
            },
            {
                key: 'skyline',
                name: 'Skyline',
                x: 600,
                y: 160,
                description: 'Urban skyline cityscape'
            },
            // Bottom row
            {
                key: 'nature',
                name: 'Nature',
                x: 200,
                y: 280,
                description: 'Natural outdoor environment'
            },
            {
                key: 'nighttree',
                name: 'Night Tree',
                x: 400,
                y: 280,
                description: 'Mysterious forest under moonlight'
            },
            {
                key: 'outsideworld',
                name: 'Outside World',
                x: 600,
                y: 280,
                description: 'Vast outdoor landscape'
            }
        ];

        this.mapThumbnails = [];

        mapConfigs.forEach(config => {
            // Create clickable background for better interaction (invisible)
            const clickArea = this.add.rectangle(config.x, config.y, 160, 110, 0x000000, 0);
            clickArea.setInteractive();

            // Create thumbnail image
            const thumbnail = this.add.image(config.x, config.y, config.key);
            thumbnail.setScale(0.20); // Smaller scale for 6-grid layout
            thumbnail.setOrigin(0.5);
            thumbnail.setInteractive();

            // Create selection border around image only (initially hidden)
            const border = this.add.rectangle(config.x, config.y, 115, 65, 0xff0000, 0);
            border.setStrokeStyle(3, 0xff0000);
            border.setVisible(false);

            // Map name
            const nameText = this.add.text(config.x, config.y + 80, config.name, {
                fontSize: '20px',
                fill: '#ffffff',
                backgroundColor: '#000000',
                padding: { x: 12, y: 6 }
            }).setOrigin(0.5);

            // Map description
            const descText = this.add.text(config.x, config.y + 110, config.description, {
                fontSize: '14px',
                fill: '#cccccc',
                backgroundColor: '#000000',
                padding: { x: 8, y: 4 },
                wordWrap: { width: 180, useAdvancedWrap: true }
            }).setOrigin(0.5);

            // Click handlers for both thumbnail and click area
            const selectHandler = () => {
                console.log('Selected map:', config.key);
                this.selectMap(config.key);
            };

            thumbnail.on('pointerdown', selectHandler);
            clickArea.on('pointerdown', selectHandler);

            // Hover effects
            const hoverIn = () => {
                if (this.selectedMapKey !== config.key) {
                    thumbnail.setTint(0xcccccc);
                }
            };

            const hoverOut = () => {
                if (this.selectedMapKey !== config.key) {
                    thumbnail.clearTint();
                }
            };

            thumbnail.on('pointerover', hoverIn);
            thumbnail.on('pointerout', hoverOut);
            clickArea.on('pointerover', hoverIn);
            clickArea.on('pointerout', hoverOut);

            // Store references
            this.mapThumbnails.push({
                key: config.key,
                thumbnail,
                border,
                nameText,
                descText,
                clickArea
            });
        });

        // Select default map
        this.selectMap(this.selectedMapKey);
    }

    selectMap(mapKey) {
        this.selectedMapKey = mapKey;
        selectedMap = mapKey; // Update global variable

        console.log('Map selected:', mapKey);

        // Update visual selection
        this.mapThumbnails.forEach(mapData => {
            if (mapData.key === mapKey) {
                // Selected map styling
                mapData.border.setVisible(true);
                mapData.nameText.setStyle({ fill: '#ffffff' });
                mapData.thumbnail.clearTint();
            } else {
                // Unselected map styling
                mapData.border.setVisible(false);
                mapData.nameText.setStyle({ fill: '#ffffff' });
                mapData.thumbnail.clearTint();
            }
        });

        // Update start button text
        if (this.startButton) {
            const mapName = mapKey === 'nightcity' ? 'Night City' : 
                          mapKey === 'ch' ? 'Ch' : 
                          mapKey === 'skyline' ? 'Skyline' : 
                          mapKey === 'nature' ? 'Nature' : 
                          mapKey === 'nighttree' ? 'Night Tree' : 
                          mapKey === 'outsideworld' ? 'Outside World' : mapKey;
            this.startButton.setText(`Start Match on ${mapName}`);
        }

        // Update selected map status
        if (this.selectedMapStatus) {
            const mapName = mapKey === 'nightcity' ? 'Night City' : 
                          mapKey === 'ch' ? 'Ch' : 
                          mapKey === 'skyline' ? 'Skyline' : 
                          mapKey === 'nature' ? 'Nature' : 
                          mapKey === 'nighttree' ? 'Night Tree' : 
                          mapKey === 'outsideworld' ? 'Outside World' : mapKey;
            this.selectedMapStatus.setText(`Selected: ${mapName}`);
        }
    }

    createStartButton() {
        const initialMapName = this.selectedMapKey === 'nightcity' ? 'Night City' : 
                             this.selectedMapKey === 'ch' ? 'Ch' : 
                             this.selectedMapKey === 'skyline' ? 'Skyline' : 
                             this.selectedMapKey === 'nature' ? 'Nature' : 
                             this.selectedMapKey === 'nighttree' ? 'Night Tree' : 
                             this.selectedMapKey === 'outsideworld' ? 'Outside World' : this.selectedMapKey;
        this.startButton = this.add.text(400, 420, `Start Match on ${initialMapName}`, {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#228b22',
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5);

        this.startButton.setInteractive();

        this.startButton.on('pointerdown', () => {
            this.startMatch();
        });

        this.startButton.on('pointerover', () => {
            this.startButton.setStyle({ backgroundColor: '#32cd32' });
        });

        this.startButton.on('pointerout', () => {
            this.startButton.setStyle({ backgroundColor: '#228b22' });
        });
    }

    startMatch() {
        // Show loading message
        this.add.text(400, 520, 'Loading match...', {
            fontSize: '20px',
            fill: '#ffff00',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);

        // Start the game scene after a brief delay
        this.time.delayedCall(1000, () => {
            this.scene.start('GameScene');
        });
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Load selected background
        this.load.image(selectedMap, `assets/Sprites/Backgrounds/${selectedMap}.png`);

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
    
        // Load grass ground texture
        this.load.image('grass', 'assets/Sprites/Backgrounds/grass.png');
    
        // Load pixel art soccer ball sprite
        this.load.image('ball', 'assets/Sprites/Ball/Sport-Balls-Asset-Pack-Pixel-Art/64x64/football.png');
        
        // Load goal sprite
        this.load.image('goalPost', 'assets/Sprites/goals/Head Ball/Assets/Sprites/porta.png');
}

    create() {
        // Add background first (behind everything)
        this.add.image(0, 0, selectedMap)
            .setOrigin(0)
            .setDepth(-1)
            .setScrollFactor(0)
            .setScale(1.39, 1.85); // All backgrounds are now 576x324, scale to fit 800x600

        // Store scene reference for later use
        this.gameScene = this;
        
        // Initialize game state
        this.gameOver = false;
        this.leftScore = 0;
        this.rightScore = 0;
        this.matchTime = 60;
        this.gameStartTime = Date.now();
        
        // Initialize clean power system
        this.powers = {
            player1: {
                ready: false,
                lastUsed: 0,
                cooldown: 15000, // 15 seconds
                goals: 0,
                immune: false,
                immuneUntil: 0,
                frozen: false,
                frozenUntil: 0,
                shieldActive: false
            },
            player2: {
                ready: false,
                lastUsed: 0,
                cooldown: 15000, // 15 seconds
                goals: 0,
                immune: false,
                immuneUntil: 0,
                frozen: false,
                frozenUntil: 0,
                shieldActive: false
            }
        };
        
        // Initialize chaos manager
        const initialDelay = this.getRandomChaosDelay();
        this.chaosManager = {
            active: false,
            currentEvent: null,
            nextEventTime: Date.now() + initialDelay,
            eventDuration: 0,
            eventEndTime: 0,
            originalGravity: 300,
            originalPlayer1Speed: 160,
            originalPlayer2Speed: 160,
            meteors: [],
            clonedBall: null,
            eventBanner: null,
            originalPlayer1Scale: null,
            originalPlayer2Scale: null,
            screenFlipped: false,
            lastDebugTime: 0,
            darkOverlay: null,
            player1Light: null,
            player2Light: null,
            ballLight: null,
            originalPlayer1MaxVelocity: null,
            originalPlayer2MaxVelocity: null,
            originalBallMaxVelocity: null
        };
        
        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
    
    // Create ground using grass texture
    const ground = this.add.image(400, 575, 'grass');
        ground.setOrigin(0.5, 0.5); // Center the image
        ground.setDisplaySize(800, 50); // Stretch to full screen width and maintain 50px height
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
        
        // Create goal zones (match visual goal height)
        this.leftGoal = this.add.rectangle(10, 475, 20, 150, 0xff0000, 0);
        this.rightGoal = this.add.rectangle(790, 475, 20, 150, 0xff0000, 0);
        this.physics.add.existing(this.leftGoal, true);
        this.physics.add.existing(this.rightGoal, true);
        
        // Add visual goal post indicators using porta.png sprites
        this.add.image(10, 550, 'goalPost').setOrigin(0, 1).setScale(4.0);
        this.add.image(790, 550, 'goalPost').setOrigin(1, 1).setFlipX(true).setScale(4.0);
    
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
        
        // Add power activation keys
        this.powerKeys = this.input.keyboard.addKeys('E,K');
        
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
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
    
        // Score display
        this.scoreText = this.add.text(400, 30, 'Left: 0 | Right: 0', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 16, y: 8 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
        
        // FPS text
        this.fpsText = this.add.text(16, 16, 'FPS: 60', {
        fontSize: '18px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(1000);
    
        // Character info
        this.add.text(16, 100, `Player 1: ${p1Character.name} (${p1Character.power})`, {
        fontSize: '16px',
            fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(1000);
    
        this.add.text(16, 130, `Player 2: ${p2Character.name} (${p2Character.power})`, {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(1000);
    
        this.add.text(16, 160, 'Controls: WASD (P1) | Arrow Keys (P2)', {
        fontSize: '16px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(1000);
    
        // Connection status
        this.connectionStatusText = this.add.text(16, 190, 'Socket: Connecting...', {
        fontSize: '16px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(1000);
    
        this.socketText = this.add.text(16, 220, 'Socket ID: Not connected', {
        fontSize: '16px',
        fill: '#00ffff',
        backgroundColor: '#000000',
        padding: { x: 8, y: 4 }
    }).setScrollFactor(0).setDepth(1000);
    
    // Power UI
    this.createPowerUI();
    }
    
    createPowerUI() {
        // Get selected character names
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        
        // Player 1 Power UI (Bottom-left)
        this.powerUI = {};
        this.powerUI.player1 = {
            background: this.add.rectangle(120, 420, 200, 60, 0x000000, 0.8),
            title: this.add.text(120, 400, `${p1Character.name} [E]`, {
                fontSize: '14px',
                fill: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5),
            status: this.add.text(120, 420, 'Not Ready', {
                fontSize: '16px',
                fill: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5),
            cooldown: this.add.text(120, 440, '', {
                fontSize: '12px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5)
        };
        
        // Player 2 Power UI (Bottom-right)
        this.powerUI.player2 = {
            background: this.add.rectangle(680, 420, 200, 60, 0x000000, 0.8),
            title: this.add.text(680, 400, `${p2Character.name} [K]`, {
                fontSize: '14px',
                fill: '#0080ff',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5),
            status: this.add.text(680, 420, 'Not Ready', {
                fontSize: '16px',
                fill: '#ff0000',
                backgroundColor: '#000000',
                padding: { x: 6, y: 3 }
            }).setOrigin(0.5),
            cooldown: this.add.text(680, 440, '', {
                fontSize: '12px',
                fill: '#ffff00',
                backgroundColor: '#000000',
                padding: { x: 4, y: 2 }
            }).setOrigin(0.5)
        };
        
        // Set scroll factor to 0 so UI doesn't move with camera
        Object.values(this.powerUI.player1).forEach(element => element.setScrollFactor(0));
        Object.values(this.powerUI.player2).forEach(element => element.setScrollFactor(0));
    }
    
    updatePowerSystem() {
        const currentTime = Date.now();
        const gameTime = (currentTime - this.gameStartTime) / 1000;
        
        // Update each player's power state
        ['player1', 'player2'].forEach(player => {
            const power = this.powers[player];
            const ui = this.powerUI[player];
            
            // Check if power should be ready
            const timePassed = gameTime >= 15; // 15 seconds passed
            const goalsReached = power.goals >= 2; // 2 goals scored
            const cooldownDone = (currentTime - power.lastUsed) >= power.cooldown;
            
            power.ready = (timePassed || goalsReached) && cooldownDone;
            
            // Update immunity status
            if (power.immune && currentTime > power.immuneUntil) {
                power.immune = false;
                const playerSprite = player === 'player1' ? this.player1 : this.player2;
                playerSprite.clearTint();
            }
            
            // Update frozen status
            if (power.frozen && currentTime > power.frozenUntil) {
                power.frozen = false;
                const playerSprite = player === 'player1' ? this.player1 : this.player2;
                playerSprite.clearTint();
            }
            
            // Update UI
            if (power.ready) {
                ui.status.setText('⚡ READY!');
                ui.status.setStyle({ fill: '#00ff00' });
                ui.cooldown.setText('');
            } else if ((currentTime - power.lastUsed) < power.cooldown) {
                // On cooldown
                const remainingCooldown = Math.ceil((power.cooldown - (currentTime - power.lastUsed)) / 1000);
                ui.status.setText('Cooldown');
                ui.status.setStyle({ fill: '#ff0000' });
                ui.cooldown.setText(`${remainingCooldown}s`);
            } else {
                // Waiting for time or goals
                const timeRemaining = Math.max(0, Math.ceil(15 - gameTime));
                const goalsNeeded = Math.max(0, 2 - power.goals);
                
                ui.status.setText('Not Ready');
                ui.status.setStyle({ fill: '#ff0000' });
                
                if (timeRemaining > 0 && goalsNeeded > 0) {
                    ui.cooldown.setText(`${timeRemaining}s or ${goalsNeeded} goals`);
                } else {
                    ui.cooldown.setText('');
                }
            }
        });
    }
    
    activatePower(player) {
        const power = this.powers[player];
        
        if (!power.ready || this.gameOver) return;
        
        // Use the power
        power.ready = false;
        power.lastUsed = Date.now();
        
        // Get character and execute power
        const characterId = selectedCharacters[player];
        const playerSprite = player === 'player1' ? this.player1 : this.player2;
        const opponent = player === 'player1' ? this.player2 : this.player1;
        
        switch (characterId) {
            case 'blaze':
                this.executeFlameUppercut(playerSprite, opponent);
                break;
            case 'frostbite':
                this.executeIceBlast(playerSprite, opponent);
                break;
            case 'volt':
                this.executeElectricDash(playerSprite);
                break;
            case 'jellyhead':
                this.executeBounceShield(playerSprite);
                break;
            case 'brick':
                this.executeGroundPound(playerSprite, opponent);
                break;
            case 'whirlwind':
                this.executeSpinKick(playerSprite);
                break;
        }
    }
    
    executeFlameUppercut(player, opponent) {
        // Create fire start effect
        this.createBlazeStartEffect(player);
        
        // Launch player upward with flame effect
        player.setVelocityY(-400);
        player.setTint(0xff4500);
        
        // Create fire loop effect that follows player
        this.createBlazeLoopEffect(player);
        
        // Check for nearby opponent
        const distance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
        if (distance < 100) {
            // Check if opponent is immune
            const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
            const opponentPower = this.powers[opponentKey];
            
            if (!opponentPower.immune) {
                opponent.setVelocityY(-300);
                opponent.setTint(0xff0000);
                this.cameras.main.shake(300, 0.02);
                
                // Clear opponent tint
                this.time.delayedCall(300, () => opponent.clearTint());
            }
        }
        
        // Fire kick affects the ball - make it undefendable
        const ballDistance = Phaser.Math.Distance.Between(player.x, player.y, this.ball.x, this.ball.y);
        if (ballDistance < 120) {
            // Apply fire effect to ball
            this.ball.setTint(0xff4500);
            this.ball.fireKicked = true;
            
            // Powerful kick towards opponent's goal
            const ballDirection = player.x < 400 ? 1 : -1;
            this.ball.setVelocity(ballDirection * 600, -200);
            
            // Clear fire effect after 3 seconds
            this.time.delayedCall(3000, () => {
                this.ball.clearTint();
                this.ball.fireKicked = false;
            });
        }
        
        // Clear player tint and create end effect
        this.time.delayedCall(800, () => {
            player.clearTint();
            this.createBlazeEndEffect(player);
        });
    }
    
    createBlazeStartEffect(player) {
        // Create start fire effect - explosive burst
        const startEffect = this.add.graphics();
        startEffect.setDepth(5);
        startEffect.x = player.x;
        startEffect.y = player.y;
        
        // Create flame particles
        const flames = [];
        for (let i = 0; i < 8; i++) {
            const flame = this.add.circle(player.x, player.y, 6, 0xff4500);
            flame.setDepth(5);
            flame.setAlpha(0.8);
            
            // Random spread pattern
            const angle = (i * Math.PI * 2) / 8;
            const radius = 20 + Math.random() * 15;
            
            // Animate flame burst
            this.tweens.add({
                targets: flame,
                x: player.x + Math.cos(angle) * radius,
                y: player.y + Math.sin(angle) * radius,
                alpha: 0,
                scaleX: 1.5,
                scaleY: 1.5,
                duration: 400,
                ease: 'Power2',
                onComplete: () => flame.destroy()
            });
            
            flames.push(flame);
        }
        
        // Central burst effect
        const centerFlame = this.add.circle(player.x, player.y, 15, 0xff4500);
        centerFlame.setDepth(5);
        centerFlame.setAlpha(0.9);
        
        this.tweens.add({
            targets: centerFlame,
            scaleX: 2.0,
            scaleY: 2.0,
            alpha: 0,
            duration: 300,
            ease: 'Power2',
            onComplete: () => centerFlame.destroy()
        });
        
        // Cleanup start effect
        this.time.delayedCall(500, () => {
            if (startEffect.active) startEffect.destroy();
        });
    }
    
    createBlazeLoopEffect(player) {
        // Create loop fire effect that follows player
        const loopFlames = [];
        
        // Create multiple flame particles that orbit around player
        for (let i = 0; i < 6; i++) {
            const flame = this.add.circle(player.x, player.y, 4, 0xff4500);
            flame.setDepth(5);
            flame.setAlpha(0.7);
            
            // Store reference to player for following
            flame.blazePlayer = player;
            flame.blazeAngle = (i * Math.PI * 2) / 6;
            flame.blazeRadius = 25;
            
            loopFlames.push(flame);
        }
        
        // Update loop flames to follow player with orbital motion
        const loopTimer = this.time.addEvent({
            delay: 32, // ~30 FPS
            repeat: 24, // 0.8 seconds
            callback: () => {
                loopFlames.forEach((flame, index) => {
                    if (flame.active && flame.blazePlayer) {
                        // Orbital motion around player
                        flame.blazeAngle += 0.2;
                        const x = flame.blazePlayer.x + Math.cos(flame.blazeAngle) * flame.blazeRadius;
                        const y = flame.blazePlayer.y + Math.sin(flame.blazeAngle) * flame.blazeRadius;
                        
                        flame.setPosition(x, y);
                        
                        // Flickering effect
                        flame.setAlpha(0.5 + Math.random() * 0.3);
                    }
                });
            }
        });
        
        // Cleanup loop effect
        this.time.delayedCall(800, () => {
            loopFlames.forEach(flame => {
                if (flame.active) flame.destroy();
            });
            if (loopTimer.active) loopTimer.remove();
        });
    }
    
    createBlazeEndEffect(player) {
        // Create end fire effect - dissipating flames
        const endFlames = [];
        
        // Create dissipating flame particles
        for (let i = 0; i < 12; i++) {
            const flame = this.add.circle(
                player.x + (Math.random() - 0.5) * 40, 
                player.y + (Math.random() - 0.5) * 40, 
                3 + Math.random() * 4, 
                0xff4500
            );
            flame.setDepth(5);
            flame.setAlpha(0.6);
            
            // Animate dissipation
            this.tweens.add({
                targets: flame,
                y: flame.y - 20 - Math.random() * 30,
                alpha: 0,
                scaleX: 0.3,
                scaleY: 0.3,
                duration: 600 + Math.random() * 400,
                ease: 'Power2',
                onComplete: () => flame.destroy()
            });
            
            endFlames.push(flame);
        }
        
        // Smoke effect
        const smoke = this.add.circle(player.x, player.y, 20, 0x666666);
        smoke.setDepth(4);
        smoke.setAlpha(0.3);
        
        this.tweens.add({
            targets: smoke,
            scaleX: 1.8,
            scaleY: 1.8,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => smoke.destroy()
        });
    }
    
    executeIceBlast(player, opponent) {
        // Create ice projectile
        const projectile = this.add.circle(player.x, player.y - 20, 8, 0x00bfff);
        this.physics.add.existing(projectile);
        
        // Set projectile velocity
        const direction = player.flipX ? -1 : 1;
        projectile.body.setVelocity(direction * 300, 0);
        projectile.body.setGravityY(-300);
        
        // Handle collision with opponent
        this.physics.add.overlap(projectile, opponent, () => {
            // Check if opponent is immune
            const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
            const opponentPower = this.powers[opponentKey];
            
            if (opponentPower.immune || opponentPower.shieldActive) {
                // Immunity or shield blocks the attack - projectile bounces off
                projectile.body.setVelocity(-projectile.body.velocity.x, -Math.abs(projectile.body.velocity.y));
                
                // Visual effect for shield bounce
                if (opponentPower.shieldActive) {
                    opponent.setTint(0x9370db);
                    this.time.delayedCall(200, () => opponent.clearTint());
                }
                return;
            }
            
            opponent.setVelocity(0, 0);
            opponent.setTint(0x87ceeb);
            
            // Actually freeze the opponent - disable movement
            opponentPower.frozen = true;
            opponentPower.frozenUntil = Date.now() + 2000; // 2 seconds
            
            // Clear freeze after 2 seconds
            this.time.delayedCall(2000, () => {
                opponentPower.frozen = false;
                opponent.clearTint();
            });
            
            projectile.destroy();
        });
        
        // Auto-destroy after 2 seconds
        this.time.delayedCall(2000, () => {
            if (projectile.active) projectile.destroy();
        });
    }
    
    executeElectricDash(player) {
        // Electric dash with yellow tint
        const direction = player.flipX ? -1 : 1;
        player.setVelocityX(direction * 500);
        player.setTint(0xffff00);
        
        // Scale effect
        this.tweens.add({
            targets: player,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 100,
            yoyo: true,
            repeat: 3
        });
        
        // Electric dash can damage opponents - check during dash
        const playerKey = player === this.player1 ? 'player1' : 'player2';
        const opponent = player === this.player1 ? this.player2 : this.player1;
        
        const checkElectricCollision = () => {
            const distance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
            if (distance < 60) {
                // Check if opponent is immune
                const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
                const opponentPower = this.powers[opponentKey];
                
                if (!opponentPower.immune) {
                    // Electric shock effect
                    opponent.setVelocity(direction * 400, -200);
                    opponent.setTint(0xffff00);
                    this.cameras.main.shake(200, 0.02);
                    
                    // Clear opponent tint
                    this.time.delayedCall(400, () => opponent.clearTint());
                }
            }
        };
        
        // Check for collisions during the dash
        this.time.addEvent({
            delay: 50,
            callback: checkElectricCollision,
            repeat: 10
        });
        
        // Clear tint
        this.time.delayedCall(500, () => player.clearTint());
    }
    
    executeBounceShield(player) {
        // Visual shield effect
        player.setTint(0x9370db);
        
        // Create visible shield ring around player
        const shield = this.add.circle(player.x, player.y, 40, 0x9370db, 0.3);
        shield.setStrokeStyle(3, 0x9370db);
        
        // Make shield follow player
        const followShield = () => {
            if (shield.active) {
                shield.x = player.x;
                shield.y = player.y;
            }
        };
        
        // Update shield position every frame
        const shieldTimer = this.time.addEvent({
            delay: 16,
            callback: followShield,
            repeat: 187 // 3 seconds at 60fps
        });
        
        // Bounce effect on player
        this.tweens.add({
            targets: player,
            alpha: 0.8,
            duration: 200,
            yoyo: true,
            repeat: 15, // Longer effect
            onComplete: () => {
                player.setAlpha(1);
                player.clearTint();
            }
        });
        
        // Shield bounces projectiles back
        const playerKey = player === this.player1 ? 'player1' : 'player2';
        this.powers[playerKey].shieldActive = true;
        
        // Remove shield after 3 seconds
        this.time.delayedCall(3000, () => {
            if (shield.active) shield.destroy();
            this.powers[playerKey].shieldActive = false;
            shieldTimer.remove();
        });
    }
    
    executeGroundPound(player, opponent) {
        // Grant immunity for 5 seconds
        const playerKey = player === this.player1 ? 'player1' : 'player2';
        const power = this.powers[playerKey];
        
        power.immune = true;
        power.immuneUntil = Date.now() + 5000; // 5 seconds
        
        // Visual effect - golden tint for immunity
        player.setTint(0xffd700); // Gold color
        
        // Immunity flash effect
        this.tweens.add({
            targets: player,
            alpha: 0.8,
            duration: 200,
            yoyo: true,
            repeat: -1, // Infinite repeat
            onComplete: () => {
                player.setAlpha(1);
            }
        });
        
        // Stop the flashing when immunity ends
        this.time.delayedCall(5000, () => {
            this.tweens.killTweensOf(player);
            player.setAlpha(1);
        });
    }
    
    executeSpinKick(player) {
        // Spin effect
        player.setTint(0x87ceeb);
        
        // Create wind effect around player
        const windEffect = this.add.circle(player.x, player.y, 60, 0x87ceeb, 0.2);
        windEffect.setStrokeStyle(2, 0x87ceeb);
        
        // Wind effect follows player
        const followWind = () => {
            if (windEffect.active) {
                windEffect.x = player.x;
                windEffect.y = player.y;
            }
        };
        
        // Update wind position every frame
        const windTimer = this.time.addEvent({
            delay: 16,
            callback: followWind,
            repeat: 93 // 1.5 seconds at 60fps
        });
        
        // Rotation tween
        this.tweens.add({
            targets: player,
            rotation: player.rotation + (Math.PI * 6),
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                player.setRotation(0);
                player.clearTint();
                if (windEffect.active) windEffect.destroy();
                windTimer.remove();
            }
        });
        
        // Spin kick affects nearby opponents and ball
        const opponent = player === this.player1 ? this.player2 : this.player1;
        
        const checkSpinEffect = () => {
            // Check opponent
            const opponentDistance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
            if (opponentDistance < 80) {
                const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
                const opponentPower = this.powers[opponentKey];
                
                if (!opponentPower.immune && !opponentPower.shieldActive) {
                    // Spin the opponent away
                    const spinDirection = opponent.x > player.x ? 1 : -1;
                    opponent.setVelocity(spinDirection * 300, -150);
                    opponent.setTint(0x87ceeb);
                    this.time.delayedCall(300, () => opponent.clearTint());
                }
            }
            
            // Check ball
            const ballDistance = Phaser.Math.Distance.Between(player.x, player.y, this.ball.x, this.ball.y);
            if (ballDistance < 90) {
                // Apply spin effect to ball
                this.ball.setTint(0x87ceeb);
                const ballDirection = this.ball.x > player.x ? 1 : -1;
                this.ball.setVelocity(ballDirection * 400, -100);
                
                // Clear ball tint
                this.time.delayedCall(500, () => this.ball.clearTint());
            }
        };
        
        // Check for spin effects during the spin
        this.time.addEvent({
            delay: 100,
            callback: checkSpinEffect,
            repeat: 14 // Check 15 times during 1.5 seconds
        });
    }

    // === CHAOS EVENT SYSTEM ===
    
    getRandomChaosDelay() {
        // Random delay around 7 seconds (6000-8000ms)
        const delay = 6000 + Math.random() * 2000;
        return delay;
    }
    
    updateChaosManager() {
        if (this.gameOver) return;
        
        try {
            const currentTime = Date.now();
            
            // Optional: Debug timing (commented out for production)
            // if (!this.chaosManager.lastDebugTime || currentTime - this.chaosManager.lastDebugTime > 2000) {
            //     const timeUntilNext = (this.chaosManager.nextEventTime - currentTime) / 1000;
            //     if (timeUntilNext > 0) {
            //         console.log(`🕐 Debug: ${timeUntilNext.toFixed(1)}s until next chaos event`);
            //     }
            //     this.chaosManager.lastDebugTime = currentTime;
            // }
            
            // Check if current event should end
            if (this.chaosManager.active && currentTime >= this.chaosManager.eventEndTime) {
                this.endChaosEvent();
            }
            
            // Check if it's time for next event (only if no event is active)
            if (!this.chaosManager.active && currentTime >= this.chaosManager.nextEventTime) {
                this.startRandomChaosEvent();
            }
            
            // Update meteors if active
            if (this.chaosManager.currentEvent === 'meteor_drop' && this.chaosManager.meteors.length > 0) {
                this.updateMeteors();
            }
            
            // Update darkroom lights if active
            if (this.chaosManager.currentEvent === 'darkroom' && this.chaosManager.darkOverlay) {
                this.updateDarkroomLights();
            }
        } catch (error) {
            console.error('🌪️ Error in chaos manager:', error);
        }
    }
    
    startRandomChaosEvent() {
        if (this.chaosManager.active) return;
        
        const events = ['zero_gravity', 'flip_screen', 'speed_boost', 'meteor_drop', 'ball_clone', 'big_head', 'darkroom'];
        const eventType = events[Math.floor(Math.random() * events.length)];
        
        this.chaosManager.active = true;
        this.chaosManager.currentEvent = eventType;
        this.chaosManager.eventDuration = 8000 + Math.random() * 4000; // 8-12 seconds
        this.chaosManager.eventEndTime = Date.now() + this.chaosManager.eventDuration;
        
        // Store original values
        this.chaosManager.originalPlayer1Scale = { x: this.player1.scaleX, y: this.player1.scaleY };
        this.chaosManager.originalPlayer2Scale = { x: this.player2.scaleX, y: this.player2.scaleY };
        
        console.log(`🌪️ Chaos Event Started: ${eventType.toUpperCase()} (${this.chaosManager.eventDuration/1000}s)`);
        
        // Show event banner
        this.showEventBanner(eventType);
        
        // Execute specific event
        switch (eventType) {
            case 'zero_gravity':
                this.startZeroGravityEvent();
                break;
            case 'flip_screen':
                this.startFlipScreenEvent();
                break;
            case 'speed_boost':
                this.startSpeedBoostEvent();
                break;
            case 'meteor_drop':
                this.startMeteorDropEvent();
                break;
            case 'ball_clone':
                this.startBallCloneEvent();
                break;
            case 'big_head':
                this.startBigHeadEvent();
                break;
            case 'darkroom':
                this.startDarkroomEvent();
                break;
        }
    }
    
    endChaosEvent() {
        if (!this.chaosManager.active) return;
        
        console.log(`🌪️ Chaos Event Ended: ${this.chaosManager.currentEvent.toUpperCase()}`);
        
        // End specific event
        switch (this.chaosManager.currentEvent) {
            case 'zero_gravity':
                this.endZeroGravityEvent();
                break;
            case 'flip_screen':
                this.endFlipScreenEvent();
                break;
            case 'speed_boost':
                this.endSpeedBoostEvent();
                break;
            case 'meteor_drop':
                this.endMeteorDropEvent();
                break;
            case 'ball_clone':
                this.endBallCloneEvent();
                break;
            case 'big_head':
                this.endBigHeadEvent();
                break;
            case 'darkroom':
                this.endDarkroomEvent();
                break;
        }
        
        // Remove event banner
        if (this.chaosManager.eventBanner) {
            this.chaosManager.eventBanner.destroy();
            this.chaosManager.eventBanner = null;
        }
        
        // Reset chaos manager
        this.chaosManager.active = false;
        this.chaosManager.currentEvent = null;
        this.chaosManager.nextEventTime = Date.now() + this.getRandomChaosDelay();
    }
    
    showEventBanner(eventType) {
        const eventNames = {
            'zero_gravity': '🌀 ZERO GRAVITY!',
            'flip_screen': '🔄 FLIP SCREEN!',
            'speed_boost': '⚡ SPEED BOOST!',
            'meteor_drop': '☄️ METEOR DROP!',
            'ball_clone': '⚽ BALL CLONE!',
            'big_head': '🧠 BIG HEAD MODE!',
            'darkroom': '🌑 DARKROOM!'
        };
        
        const eventColors = {
            'zero_gravity': '#00bfff',
            'flip_screen': '#ff69b4',
            'speed_boost': '#ffff00',
            'meteor_drop': '#ff4500',
            'ball_clone': '#32cd32',
            'big_head': '#9370db',
            'darkroom': '#444444'
        };
        
        const eventName = eventNames[eventType] || '⚠️ CHAOS EVENT!';
        const eventColor = eventColors[eventType] || '#ffffff';
        
        try {
            this.chaosManager.eventBanner = this.add.text(400, 100, eventName, {
                fontSize: '36px',
                fill: eventColor,
                backgroundColor: '#000000',
                padding: { x: 20, y: 10 },
                stroke: '#ffffff',
                strokeThickness: 2
            }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);
            
            // Remove banner after 2 seconds
            this.time.delayedCall(2000, () => {
                if (this.chaosManager.eventBanner) {
                    this.chaosManager.eventBanner.destroy();
                    this.chaosManager.eventBanner = null;
                }
            });
        } catch (error) {
            console.error('🎨 Error creating banner:', error);
        }
    }
    
    // === CHAOS EVENTS ===
    
    startZeroGravityEvent() {
        // Store original values for restoration
        this.chaosManager.originalPlayer1MaxVelocity = this.player1.body.maxVelocity.y;
        this.chaosManager.originalPlayer2MaxVelocity = this.player2.body.maxVelocity.y;
        this.chaosManager.originalBallMaxVelocity = this.ball.body.maxVelocity.y;
        
        // Reduce fall speed for floaty feeling
        this.player1.body.setMaxVelocity(300, 200); // Slower falling
        this.player2.body.setMaxVelocity(300, 200); // Slower falling
        this.ball.body.setMaxVelocity(350, 250); // Slower falling
    }
    
    endZeroGravityEvent() {
        // Restore original max velocities
        this.player1.body.setMaxVelocity(300, this.chaosManager.originalPlayer1MaxVelocity);
        this.player2.body.setMaxVelocity(300, this.chaosManager.originalPlayer2MaxVelocity);
        this.ball.body.setMaxVelocity(350, this.chaosManager.originalBallMaxVelocity);
    }
    
    startFlipScreenEvent() {
        console.log('🔄 Flip Screen Event: Flipping camera horizontally');
        this.cameras.main.setRotation(Math.PI); // Rotate 180 degrees (upside down)
        this.chaosManager.screenFlipped = true;
    }
    
    endFlipScreenEvent() {
        console.log('🔄 Flip Screen Event: Restoring camera orientation');
        this.cameras.main.setRotation(0); // Restore normal rotation
        this.chaosManager.screenFlipped = false;
    }
    
    startSpeedBoostEvent() {
        this.chaosManager.originalPlayer1Speed = 160;
        this.chaosManager.originalPlayer2Speed = 160;
        // Speed boost will be applied in update loop
    }
    
    endSpeedBoostEvent() {
        // Speed will be restored in update loop
    }
    
    startMeteorDropEvent() {
        // Clean up any existing meteor timer first (prevents freezing on 2nd meteor shower)
        if (this.meteorSpawnTimer) {
            this.meteorSpawnTimer.remove();
            this.meteorSpawnTimer = null;
        }
        
        this.chaosManager.meteors = [];
        
        // Start spawning meteors
        this.meteorSpawnTimer = this.time.addEvent({
            delay: 800, // Spawn every 0.8 seconds
            repeat: Math.floor(this.chaosManager.eventDuration / 800) - 1,
            callback: this.spawnMeteor,
            callbackScope: this
        });
    }
    
    spawnMeteor() {
        const x = 50 + Math.random() * 700; // Random x position
        const meteor = this.add.circle(x, -30, 12, 0xff4500);
        this.physics.add.existing(meteor);
        
        meteor.body.setVelocity(
            -50 + Math.random() * 100, // Random horizontal velocity
            150 + Math.random() * 100   // Downward velocity
        );
        meteor.body.setBounce(0.8, 0.6);
        meteor.body.setCollideWorldBounds(true);
        
        // Add collision with players - now with stun functionality
        this.physics.add.collider(meteor, this.player1, (meteor, player) => {
            // Apply knockback
            player.setVelocity(
                (player.x - meteor.x) * 2, // Knock away from meteor
                -200 // Upward knock
            );
            
            // Apply stun effect
            const playerKey = 'player1';
            const playerPower = this.powers[playerKey];
            
            if (!playerPower.immune && !playerPower.shieldActive) {
                // Stun the player
                player.setTint(0xffa500); // Orange tint for stun
                playerPower.frozen = true; // Reuse freeze system for stun
                playerPower.frozenUntil = Date.now() + 1500; // 1.5 seconds stun
                
                // Clear stun after duration
                this.time.delayedCall(1500, () => {
                    playerPower.frozen = false;
                    player.clearTint();
                });
            }
            
            this.cameras.main.shake(200, 0.01);
        });
        
        this.physics.add.collider(meteor, this.player2, (meteor, player) => {
            // Apply knockback
            player.setVelocity(
                (player.x - meteor.x) * 2, // Knock away from meteor
                -200 // Upward knock
            );
            
            // Apply stun effect
            const playerKey = 'player2';
            const playerPower = this.powers[playerKey];
            
            if (!playerPower.immune && !playerPower.shieldActive) {
                // Stun the player
                player.setTint(0xffa500); // Orange tint for stun
                playerPower.frozen = true; // Reuse freeze system for stun
                playerPower.frozenUntil = Date.now() + 1500; // 1.5 seconds stun
                
                // Clear stun after duration
                this.time.delayedCall(1500, () => {
                    playerPower.frozen = false;
                    player.clearTint();
                });
            }
            
            this.cameras.main.shake(200, 0.01);
        });
        
        this.chaosManager.meteors.push(meteor);
    }
    
    updateMeteors() {
        // Remove meteors that have stopped moving for too long
        this.chaosManager.meteors = this.chaosManager.meteors.filter(meteor => {
            if (!meteor.active) return false;
            
            const velocity = Math.abs(meteor.body.velocity.x) + Math.abs(meteor.body.velocity.y);
            if (velocity < 10) {
                meteor.destroy();
                return false;
            }
            return true;
        });
    }
    
    updateDarkroomLights() {
        // Update light circles to follow players and ball
        const lightRadius = 80;
        
        if (this.chaosManager.player1Light) {
            this.chaosManager.player1Light.clear();
            this.chaosManager.player1Light.fillStyle(0xffffff, 0.3);
            this.chaosManager.player1Light.fillCircle(this.player1.x, this.player1.y, lightRadius);
        }
        
        if (this.chaosManager.player2Light) {
            this.chaosManager.player2Light.clear();
            this.chaosManager.player2Light.fillStyle(0xffffff, 0.3);
            this.chaosManager.player2Light.fillCircle(this.player2.x, this.player2.y, lightRadius);
        }
        
        if (this.chaosManager.ballLight) {
            this.chaosManager.ballLight.clear();
            this.chaosManager.ballLight.fillStyle(0xffffff, 0.2);
            this.chaosManager.ballLight.fillCircle(this.ball.x, this.ball.y, lightRadius * 0.6);
        }
    }
    
    endMeteorDropEvent() {
        // Clean up meteors
        this.chaosManager.meteors.forEach(meteor => {
            if (meteor.active) meteor.destroy();
        });
        this.chaosManager.meteors = [];
        
        if (this.meteorSpawnTimer) {
            this.meteorSpawnTimer.remove();
            this.meteorSpawnTimer = null;
        }
    }
    
    startBallCloneEvent() {
        // Create cloned ball
        this.chaosManager.clonedBall = this.physics.add.sprite(300, 450, 'ball');
        this.chaosManager.clonedBall.setScale(0.5);
        this.chaosManager.clonedBall.setOrigin(0.5, 1);
        this.chaosManager.clonedBall.setBounce(0.6);
        this.chaosManager.clonedBall.setCollideWorldBounds(true);
        this.chaosManager.clonedBall.setDrag(100);
        this.chaosManager.clonedBall.setMass(0.5);
        this.chaosManager.clonedBall.setMaxVelocity(350, 500);
        this.chaosManager.clonedBall.setTint(0x00ff00); // Green tint to distinguish
        
        // Add physics collisions for cloned ball
        this.physics.add.collider(this.chaosManager.clonedBall, this.player1, this.handlePlayerBallCollision, null, this);
        this.physics.add.collider(this.chaosManager.clonedBall, this.player2, this.handlePlayerBallCollision, null, this);
        
        // Add ground collision - find ground body from existing static bodies
        const groundBody = this.physics.world.staticBodies.entries.find(body => body.gameObject && body.gameObject.texture && body.gameObject.texture.key === 'grass');
        if (groundBody) {
            this.physics.add.collider(this.chaosManager.clonedBall, groundBody.gameObject);
        }
        
        // Add goal detection for cloned ball
        this.physics.add.overlap(this.chaosManager.clonedBall, this.leftGoal, () => this.handleGoalScored('right'));
        this.physics.add.overlap(this.chaosManager.clonedBall, this.rightGoal, () => this.handleGoalScored('left'));
    }
    
    endBallCloneEvent() {
        if (this.chaosManager.clonedBall) {
            this.chaosManager.clonedBall.destroy();
            this.chaosManager.clonedBall = null;
        }
    }
    
    startBigHeadEvent() {
        // Increase player scale by 1.5x
        this.player1.setScale(
            this.chaosManager.originalPlayer1Scale.x * 1.5,
            this.chaosManager.originalPlayer1Scale.y * 1.5
        );
        this.player2.setScale(
            this.chaosManager.originalPlayer2Scale.x * 1.5,
            this.chaosManager.originalPlayer2Scale.y * 1.5
        );
    }
    
    endBigHeadEvent() {
        // Restore original scale
        this.player1.setScale(
            this.chaosManager.originalPlayer1Scale.x,
            this.chaosManager.originalPlayer1Scale.y
        );
        this.player2.setScale(
            this.chaosManager.originalPlayer2Scale.x,
            this.chaosManager.originalPlayer2Scale.y
        );
    }
    
    startDarkroomEvent() {
        console.log('🌑 Darkroom Event: Creating darkness overlay');
        
        // Create dark overlay that covers entire screen
        this.chaosManager.darkOverlay = this.add.graphics();
        this.chaosManager.darkOverlay.fillStyle(0x000000, 0.85); // Dark overlay with 85% opacity
        this.chaosManager.darkOverlay.fillRect(0, 0, 800, 600);
        this.chaosManager.darkOverlay.setDepth(500); // High depth but below UI
        this.chaosManager.darkOverlay.setScrollFactor(0); // Stay in place
        
        // Create light circles around players and ball
        this.chaosManager.player1Light = this.add.graphics();
        this.chaosManager.player1Light.setDepth(501);
        
        this.chaosManager.player2Light = this.add.graphics();
        this.chaosManager.player2Light.setDepth(501);
        
        this.chaosManager.ballLight = this.add.graphics();
        this.chaosManager.ballLight.setDepth(501);
        
        // Set blend mode to create light effect
        this.chaosManager.player1Light.setBlendMode(Phaser.BlendModes.SCREEN);
        this.chaosManager.player2Light.setBlendMode(Phaser.BlendModes.SCREEN);
        this.chaosManager.ballLight.setBlendMode(Phaser.BlendModes.SCREEN);
    }
    
    endDarkroomEvent() {
        console.log('🌑 Darkroom Event: Removing darkness');
        
        // Remove dark overlay and lights
        if (this.chaosManager.darkOverlay) {
            this.chaosManager.darkOverlay.destroy();
            this.chaosManager.darkOverlay = null;
        }
        
        if (this.chaosManager.player1Light) {
            this.chaosManager.player1Light.destroy();
            this.chaosManager.player1Light = null;
        }
        
        if (this.chaosManager.player2Light) {
            this.chaosManager.player2Light.destroy();
            this.chaosManager.player2Light = null;
        }
        
        if (this.chaosManager.ballLight) {
            this.chaosManager.ballLight.destroy();
            this.chaosManager.ballLight = null;
        }
    }
    
    // === TIMER SYSTEM ===

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
        winMessage = 'Time\'s Up! Player 1 Wins!';
        } else if (this.rightScore > this.leftScore) {
        winner = 'right';
        winMessage = 'Time\'s Up! Player 2 Wins!';
    } else {
        winner = 'tie';
        winMessage = 'Time\'s Up! It\'s a Tie!';
    }
    
        this.handleGameOver(winner, winMessage);
}

    handlePlayerBallCollision(player, ball) {
        if (this.gameOver) return;
        
        // Check if this is a fire ball and handle special logic
        if (ball.fireKicked) {
            // Determine which player this is
            const isPlayer1 = player === this.player1;
            const playerKey = isPlayer1 ? 'player1' : 'player2';
            const playerPower = this.powers[playerKey];
            
            // Check if player has any active power that can deflect the fire ball
            const canDeflect = playerPower.immune || playerPower.shieldActive || this.isPlayerPowerActive(playerKey);
            
            if (!canDeflect) {
                // Fire ball passes through - no collision response
                console.log('Fire ball passes through player without active power');
                return;
            } else {
                // Player has active power - they can deflect the fire ball
                console.log('Player with active power deflects fire ball');
                
                // Add special deflection effect
                this.cameras.main.shake(200, 0.02);
                
                // Give the ball a powerful deflection
                const deflectionDirection = isPlayer1 ? -1 : 1;
                ball.setVelocity(deflectionDirection * 500, -250);
                
                // Visual feedback for successful deflection
                player.setTint(0x00ff00);
                this.time.delayedCall(300, () => player.clearTint());
                
                // Clear fire effect since it was deflected
                ball.clearTint();
                ball.fireKicked = false;
                
                return;
            }
        }
        
        // Normal ball collision logic (existing code)
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
    
    // Helper function to check if a player has any active power
    isPlayerPowerActive(playerKey) {
        const playerSprite = playerKey === 'player1' ? this.player1 : this.player2;
        const characterId = selectedCharacters[playerKey];
        const currentTime = Date.now();
        
        // Check if player is currently using their power (within the last 2 seconds)
        const power = this.powers[playerKey];
        const recentlyUsed = (currentTime - power.lastUsed) < 2000; // 2 seconds
        
        // Check for specific active power effects
        switch (characterId) {
            case 'volt':
                // Check if player has yellow tint (electric dash)
                return playerSprite.tintTopLeft === 0xffff00 || recentlyUsed;
            case 'whirlwind':
                // Check if player has blue tint (spin kick)
                return playerSprite.tintTopLeft === 0x87ceeb || recentlyUsed;
            case 'blaze':
                // Check if player has fire tint (flame uppercut)
                return playerSprite.tintTopLeft === 0xff4500 || recentlyUsed;
            case 'frostbite':
                // Frostbite doesn't have a defensive power, but recently used counts
                return recentlyUsed;
            case 'jellyhead':
                // Shield is already checked above with shieldActive
                return false;
            case 'brick':
                // Immunity is already checked above with immune
                return false;
            default:
                return false;
        }
    }

    handlePlayerPlayerCollision(player1, player2) {
        if (this.gameOver) return;
        
        const deltaX = player2.x - player1.x;
        const deltaY = player2.y - player1.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < 1) return; // Prevent division by zero
        
        const normalX = deltaX / distance;
        const normalY = deltaY / distance;
        
        const p1VelX = player1.body.velocity.x;
        const p1VelY = player1.body.velocity.y;
        const p2VelX = player2.body.velocity.x;
        const p2VelY = player2.body.velocity.y;
        
        const relativeVelX = p1VelX - p2VelX;
        const relativeVelY = p1VelY - p2VelY;
        
        // Simple collision physics
        const collisionStrength = 0.3;
        const pushForce = (relativeVelX * normalX + relativeVelY * normalY) * collisionStrength;
        
        // Apply velocity changes
        player1.setVelocityX(p1VelX - pushForce * normalX);
        player1.setVelocityY(p1VelY - pushForce * normalY);
        
        player2.setVelocityX(p2VelX + pushForce * normalX);
        player2.setVelocityY(p2VelY + pushForce * normalY);
        
        // Safe separation that prevents ground penetration
        const separationForce = 3;
        const groundLevel = 550; // Ground is at y=575, but players have origins at bottom, so effective ground is ~550
        
        // Calculate proposed new positions
        const newP1X = player1.x - normalX * separationForce;
        const newP1Y = player1.y - normalY * separationForce;
        const newP2X = player2.x + normalX * separationForce;
        const newP2Y = player2.y + normalY * separationForce;
        
        // Apply separation, but prevent going below ground
        player1.x = newP1X;
        player1.y = Math.min(newP1Y, groundLevel); // Don't go below ground
        
        player2.x = newP2X;
        player2.y = Math.min(newP2Y, groundLevel); // Don't go below ground
        
        // If a player would be pushed into the ground, give them an upward boost instead
        if (newP1Y > groundLevel) {
            player1.setVelocityY(Math.min(player1.body.velocity.y, -100)); // Upward boost
        }
        if (newP2Y > groundLevel) {
            player2.setVelocityY(Math.min(player2.body.velocity.y, -100)); // Upward boost
        }
    }

    handleGoalScored(scoringPlayer) {
        if (this.gameOver) return;
    
    if (scoringPlayer === 'left') {
            this.leftScore++;
            this.powers.player1.goals++;
    } else {
            this.rightScore++;
            this.powers.player2.goals++;
    }
    
        this.scoreText.setText(`Left: ${this.leftScore} | Right: ${this.rightScore}`);
    
        this.ball.setPosition(400, 450); // Reset ball to same level as players
        this.ball.setVelocity(0, 0);
    
        if (this.leftScore >= 3 || this.rightScore >= 3) {
        const winMessage = scoringPlayer === 'left' ? 'Player 1 Wins!' : 'Player 2 Wins!';
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
    
        // Update SessionState - increment wins and total rounds
        SessionState.totalRoundsPlayed++;
        if (winner === 'left') {
            SessionState.player1Wins++;
        } else if (winner === 'right') {
            SessionState.player2Wins++;
        }
        // Note: Ties don't increment anyone's wins, but still count as rounds played
    
    let winnerText;
    if (customMessage) {
        winnerText = customMessage;
    } else {
        winnerText = winner === 'left' ? 'Player 1 Wins!' : 
                    winner === 'right' ? 'Player 2 Wins!' : 
                    'It\'s a Tie!';
    }
    
        this.gameOverText = this.add.text(400, 180, winnerText, {
        fontSize: '48px',
        fill: '#ffff00',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
        }).setOrigin(0.5);
    
        // Display win totals
        this.add.text(400, 240, `P1 Wins: ${SessionState.player1Wins}     P2 Wins: ${SessionState.player2Wins}`, {
            fontSize: '24px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
    
        this.add.text(400, 280, 'Press R to Rematch', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        this.add.text(400, 310, 'Press C to Change Characters', {
            fontSize: '20px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 16, y: 8 }
        }).setOrigin(0.5);
        
        // Store the event listeners so we can remove them later
        this.restartHandler = this.restartGame.bind(this);
        this.chooseCharactersHandler = this.chooseCharacters.bind(this);
        
        this.input.keyboard.on('keydown-R', this.restartHandler);
        this.input.keyboard.on('keydown-C', this.chooseCharactersHandler);
    }

    restartGame() {
        // Clean up event listeners before restarting
        this.input.keyboard.off('keydown-R', this.restartHandler);
        this.input.keyboard.off('keydown-C', this.chooseCharactersHandler);
        
        this.scene.restart();
    }

    chooseCharacters() {
        // Clean up event listeners before transitioning
        this.input.keyboard.off('keydown-R', this.restartHandler);
        this.input.keyboard.off('keydown-C', this.chooseCharactersHandler);
        
        // Reset selected characters
        selectedCharacters = {
            player1: null,
            player2: null
        };
        
        // Reset SessionState when returning to character selection
        SessionState = {
            player1Wins: 0,
            player2Wins: 0,
            totalRoundsPlayed: 0
        };
        
        this.scene.start('CharacterSelectionScene');
    }

    preventBallSqueezing() {
        // Helper function to check and fix ball squeezing
        const checkBallSqueezing = (ball) => {
            if (!ball || !ball.active) return;
            
            const player1Distance = Phaser.Math.Distance.Between(ball.x, ball.y, this.player1.x, this.player1.y);
            const player2Distance = Phaser.Math.Distance.Between(ball.x, ball.y, this.player2.x, this.player2.y);
            
            const criticalDistance = 45; // Distance that's too close for both players
            
            if (player1Distance < criticalDistance && player2Distance < criticalDistance) {
                // Ball is getting squeezed between players - gently push it away from the closest player
                const closestPlayer = player1Distance < player2Distance ? this.player1 : this.player2;
                
                // Calculate escape direction (away from closest player)
                const escapeX = ball.x - closestPlayer.x;
                const escapeY = ball.y - closestPlayer.y;
                const escapeDistance = Math.sqrt(escapeX * escapeX + escapeY * escapeY);
                
                if (escapeDistance > 0) {
                    // Normalize and apply gentle separation
                    const normalX = escapeX / escapeDistance;
                    const normalY = escapeY / escapeDistance;
                    
                    // Small push to prevent phasing
                    const pushForce = 3;
                    ball.x += normalX * pushForce;
                    ball.y += normalY * pushForce;
                    
                    // Ensure ball stays within bounds
                    ball.x = Math.max(20, Math.min(780, ball.x));
                    ball.y = Math.max(20, Math.min(550, ball.y));
                }
            }
        };
        
        // Check main ball
        checkBallSqueezing(this.ball);
        
        // Check cloned ball if it exists
        if (this.chaosManager.clonedBall) {
            checkBallSqueezing(this.chaosManager.clonedBall);
        }
    }

    update() {
        this.fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
        
        if (this.gameOver) return;
        
        // Update power system
        this.updatePowerSystem();
        
        // Update chaos manager
        this.updateChaosManager();
        
        // Handle power activation
        if (Phaser.Input.Keyboard.JustDown(this.powerKeys.E)) {
            this.activatePower('player1');
        }
        if (Phaser.Input.Keyboard.JustDown(this.powerKeys.K)) {
            this.activatePower('player2');
        }
        
        // DEBUG: Test chaos event trigger (press T key)
        if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('T'))) {
            console.log('🧪 Manual chaos event trigger!');
            if (!this.chaosManager.active) {
                this.startRandomChaosEvent();
            }
        }
        
        // Calculate speed (apply speed boost if active)
        let speed = 160;
        if (this.chaosManager.currentEvent === 'speed_boost') {
            speed = 160 * 1.5; // 1.5x speed boost
        }
        
        // Calculate jump speed and movement behavior based on zero gravity
        let jumpSpeed = 330;
        let horizontalSpeed = speed;
        
        if (this.chaosManager.currentEvent === 'zero_gravity') {
            jumpSpeed = 500; // Higher jumps in zero gravity
            horizontalSpeed = speed * 0.7; // Slower horizontal movement
        }
        
        // Player 1 movement (WASD) - with animations
        if (!this.powers.player1.frozen) {
            if (this.wasd.A.isDown) {
                this.player1.setVelocityX(-horizontalSpeed);
                this.player1.setFlipX(true);
                if (this.player1.anims && this.player1.anims.currentAnim && this.player1.anims.currentAnim.key !== 'player1_walk_anim') {
                    this.player1.play('player1_walk_anim');
                }
            } else if (this.wasd.D.isDown) {
                this.player1.setVelocityX(horizontalSpeed);
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
        } else {
            // Frozen - stop horizontal movement but allow gravity
            this.player1.setVelocityX(0);
        }
        
        // Player 2 movement (Arrow keys) - with animations
        if (!this.powers.player2.frozen) {
            if (this.cursors.left.isDown) {
                this.player2.setVelocityX(-horizontalSpeed);
                this.player2.setFlipX(true);
                if (this.player2.anims && this.player2.anims.currentAnim && this.player2.anims.currentAnim.key !== 'player2_walk_anim') {
                    this.player2.play('player2_walk_anim');
                }
            } else if (this.cursors.right.isDown) {
                this.player2.setVelocityX(horizontalSpeed);
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
        } else {
            // Frozen - stop horizontal movement but allow gravity
            this.player2.setVelocityX(0);
        }
        
        // Apply zero gravity effects
        if (this.chaosManager.currentEvent === 'zero_gravity') {
            // Apply gentle upward force to counteract gravity for floaty effect
            const antiGravityForce = 180; // Counteract most of the gravity (300 -> 120 effective)
            
            // Apply to both players
            this.player1.body.setAccelerationY(-antiGravityForce);
            this.player2.body.setAccelerationY(-antiGravityForce);
            
            // Apply to ball
            this.ball.body.setAccelerationY(-antiGravityForce);
        } else {
            // Restore normal gravity acceleration
            this.player1.body.setAccelerationY(0);
            this.player2.body.setAccelerationY(0);
            this.ball.body.setAccelerationY(0);
        }
        
        // Ball safety check - prevent ball from getting trapped between players
        this.preventBallSqueezing();
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
    scene: [CharacterSelectionScene, MapSelectScene, GameScene]
};

// Initialize the game
const game = new Phaser.Game(config); 