// Character definitions
const CHARACTERS = {
    blaze: {
        name: 'Blaze',
        power: 'Fire Kick',
        description: 'Devastating horizontal fire ball that knocks back undefended enemies',
        color: 0xff4500,
        sprite: { category: 'tinyHeroes', id: 'dudeMonster' }
    },
    frostbite: {
        name: 'Frostbite',
        power: 'Ice Freeze',
        description: 'Soccer: Snowball projectile freezes opponent in ice cocoon. Fight: Standard ice blast',
        color: 0x00bfff,
        sprite: { category: 'tinyHeroes', id: 'pinkMonster' }
    },
    volt: {
        name: 'Volt',
        power: 'Lightning Dash',
        description: 'Dashes forward knocking enemies up and boosting ball speed',
        color: 0xffff00,
        sprite: { category: 'tinyHeroes', id: 'owletMonster' }
    },
    jellyhead: {
        name: 'Jellyhead',
        power: 'Jelly Slow',
        description: 'Shoots purple jelly that slows opponents to 30% speed',
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

// Sound System - Global utility for managing arcade-style sound effects
const SoundManager = {
    // Sound debounce system to prevent overlapping sounds
    lastButtonClick: 0,
    lastForwardButton: 0,
    lastPowerUse: 0,
    debounceTime: 100, // 100ms cooldown as requested
    audioInitialized: false,
    
    // HTML5 Audio fallback
    buttonClickAudio: null,
    forwardButtonAudio: null,
    kickballAudio: null,
    goalScoreAudio: null,
    fightIntroAudio: null,
    victoryAudio: null,
    bruhAudio: null,
    backgroundMusicAudio: null,
    lastKickballPlay: 0,
    characterPowerAudio: {
        blaze: null,
        brick: null,
        frostbite: null,
        jellyhead: null,
        volt: null,
        whirlwind: null
    },
    
    // Initialize audio context (call on first user interaction)
    initializeAudio(scene) {
        if (!this.audioInitialized) {
            try {
                // Initialize HTML5 Audio as fallback (WAV works on all browsers)
                this.buttonClickAudio = new Audio('assets/SFX/back_002.wav');
                this.forwardButtonAudio = new Audio('assets/SFX/select_001.wav');
                this.kickballAudio = new Audio('assets/SFX/ballkicksound.wav');
                this.goalScoreAudio = new Audio('assets/SFX/pluck_002.wav');
                this.fightIntroAudio = new Audio('assets/SFX/fightdeep.wav');
                this.victoryAudio = new Audio('assets/SFX/Victory.wav');
                this.bruhAudio = new Audio('assets/SFX/Bruh.wav');
                this.backgroundMusicAudio = new Audio('assets/SFX/ES_K.O. - Lupus Nocte.wav');
                
                // Initialize character-specific power sounds
                this.characterPowerAudio.blaze = new Audio('assets/SFX/Blaze/Blazesound.wav');
                this.characterPowerAudio.brick = new Audio('assets/SFX/Brick/Bricksound.wav');
                this.characterPowerAudio.frostbite = new Audio('assets/SFX/Frostbite/Frostbitesound.wav');
                this.characterPowerAudio.jellyhead = new Audio('assets/SFX/Jellyhead/Jellysound.wav');
                this.characterPowerAudio.volt = new Audio('assets/SFX/Volt/Voltsound.wav');
                this.characterPowerAudio.whirlwind = new Audio('assets/SFX/Whirlwind/Whirlwind.wav');
                
                // Set volume
                this.buttonClickAudio.volume = 0.5;
                this.forwardButtonAudio.volume = 0.5;
                this.kickballAudio.volume = 0.6;
                this.goalScoreAudio.volume = 0.8;
                this.fightIntroAudio.volume = 0.9;
                this.victoryAudio.volume = 0.8;
                this.bruhAudio.volume = 0.7;
                this.backgroundMusicAudio.volume = 0.15; // Lower volume for background music so other SFX can be heard
                this.backgroundMusicAudio.loop = true; // Enable looping
                
                // Set character power volumes
                Object.values(this.characterPowerAudio).forEach(audio => {
                    if (audio) audio.volume = 0.7;
                });
                
                // Add load event handlers for HTML5 Audio
                this.kickballAudio.addEventListener('canplaythrough', () => {
                    console.log('✅ Ball kick HTML5 Audio ready');
                });
                
                this.kickballAudio.addEventListener('error', (e) => {
                    console.warn('🔇 Ball kick HTML5 Audio error:', e);
                });
                
                this.goalScoreAudio.addEventListener('canplaythrough', () => {
                    console.log('✅ Goal score HTML5 Audio ready');
                });
                
                this.goalScoreAudio.addEventListener('error', (e) => {
                    console.warn('🔇 Goal score HTML5 Audio error:', e);
                });
                
                this.fightIntroAudio.addEventListener('canplaythrough', () => {
                    console.log('✅ Fight intro HTML5 Audio ready');
                });
                
                this.fightIntroAudio.addEventListener('error', (e) => {
                    console.warn('🔇 Fight intro HTML5 Audio error:', e);
                });
                
                this.victoryAudio.addEventListener('canplaythrough', () => {
                    console.log('✅ Victory HTML5 Audio ready');
                });
                
                this.victoryAudio.addEventListener('error', (e) => {
                    console.warn('🔇 Victory HTML5 Audio error:', e);
                });
                
                this.bruhAudio.addEventListener('canplaythrough', () => {
                    console.log('✅ Bruh HTML5 Audio ready');
                });
                
                this.bruhAudio.addEventListener('error', (e) => {
                    console.warn('🔇 Bruh HTML5 Audio error:', e);
                });
                
                this.backgroundMusicAudio.addEventListener('canplaythrough', () => {
                    console.log('✅ Background music HTML5 Audio ready');
                });
                
                this.backgroundMusicAudio.addEventListener('error', (e) => {
                    console.warn('🔇 Background music HTML5 Audio error:', e);
                });
                
                // Resume audio context if it's suspended
                if (scene && scene.sound && scene.sound.context && scene.sound.context.state === 'suspended') {
                    scene.sound.context.resume();
                }
                
                this.audioInitialized = true;
                console.log('🔊 Audio initialized successfully');
            } catch (error) {
                console.warn('🔇 Audio initialization failed:', error);
            }
        }
    },
    
    // Play button click sound with debounce (for back/cancel/close buttons)
    playButtonClick(scene) {
        this.initializeAudio(scene); // Try to initialize audio
        
        const now = Date.now();
        if (now - this.lastButtonClick < this.debounceTime) {
            return; // Skip if too soon
        }
        this.lastButtonClick = now;
        
        // Try Phaser sound first, then HTML5 Audio fallback
        if (scene && scene.sound && scene.sound.get('buttonClick')) {
            try {
                scene.sound.play('buttonClick', { volume: 0.5 });
                console.log('🔊 Playing button click sound via Phaser');
                return;
            } catch (error) {
                console.warn('🔇 Phaser button click sound failed:', error);
            }
        }
        
        // Fallback to HTML5 Audio
        if (this.buttonClickAudio) {
            try {
                this.buttonClickAudio.currentTime = 0; // Reset to beginning
                this.buttonClickAudio.play();
                console.log('🔊 Playing button click sound via HTML5 Audio');
            } catch (error) {
                console.warn('🔇 HTML5 button click sound failed:', error);
            }
        }
    },
    
    // Play forward button sound with debounce (for continue/select/start buttons)
    playForwardButton(scene) {
        this.initializeAudio(scene); // Try to initialize audio
        
        const now = Date.now();
        if (now - this.lastForwardButton < this.debounceTime) {
            return; // Skip if too soon
        }
        this.lastForwardButton = now;
        
        // Try Phaser sound first, then HTML5 Audio fallback
        if (scene && scene.sound && scene.sound.get('forwardButton')) {
            try {
                scene.sound.play('forwardButton', { volume: 0.5 });
                console.log('🔊 Playing forward button sound via Phaser');
                return;
            } catch (error) {
                console.warn('🔇 Phaser forward button sound failed:', error);
            }
        }
        
        // Fallback to HTML5 Audio
        if (this.forwardButtonAudio) {
            try {
                this.forwardButtonAudio.currentTime = 0; // Reset to beginning
                this.forwardButtonAudio.play();
                console.log('🔊 Playing forward button sound via HTML5 Audio');
            } catch (error) {
                console.warn('🔇 HTML5 forward button sound failed:', error);
            }
        }
    },
    
    // Play character-specific power sound with debounce
    playCharacterPower(scene, characterName) {
        this.initializeAudio(scene); // Try to initialize audio
        
        const now = Date.now();
        if (now - this.lastPowerUse < this.debounceTime) {
            return; // Skip if too soon
        }
        this.lastPowerUse = now;
        
        // Convert character name to lowercase for consistency
        const charKey = characterName.toLowerCase();
        
        // Try Phaser sound first, then HTML5 Audio fallback
        if (scene && scene.sound && scene.sound.get(`power_${charKey}`)) {
            try {
                scene.sound.play(`power_${charKey}`, { volume: 0.7 });
                console.log(`🔊 Playing ${characterName} power sound via Phaser`);
                return;
            } catch (error) {
                console.warn(`🔇 Phaser ${characterName} power sound failed:`, error);
            }
        }
        
        // Fallback to HTML5 Audio
        if (this.characterPowerAudio[charKey]) {
            try {
                this.characterPowerAudio[charKey].currentTime = 0; // Reset to beginning
                this.characterPowerAudio[charKey].play();
                console.log(`🔊 Playing ${characterName} power sound via HTML5 Audio`);
            } catch (error) {
                console.warn(`🔇 HTML5 ${characterName} power sound failed:`, error);
            }
        }
    },
    
    // Backward compatibility for old power usage function
    playPowerUse(scene, characterName = 'Blaze') {
        console.warn('⚠️ playPowerUse is deprecated, use playCharacterPower instead');
        this.playCharacterPower(scene, characterName);
    },
    
    // Play kickball sound for soccer mode
    playKickballSound(scene) {
        const currentTime = Date.now();
        
        // Add debouncing to prevent rapid-fire audio issues
        if (currentTime - this.lastKickballPlay < this.debounceTime) {
            return; // Skip if too soon
        }
        this.lastKickballPlay = currentTime;
        
        // Try Phaser sound first - this is the most reliable method
        if (scene && scene.sound && scene.sound.get('kickball')) {
            try {
                scene.sound.play('kickball', { volume: 0.6 });
                console.log('🔊 Playing ball kick sound via Phaser');
                return;
            } catch (error) {
                console.warn('🔇 Phaser kickball sound failed:', error);
            }
        }
        
        // Simplified HTML5 Audio fallback - only try if properly loaded
        if (this.kickballAudio && this.kickballAudio.readyState >= 3) {
            try {
                this.kickballAudio.currentTime = 0;
                this.kickballAudio.play().catch(error => {
                    // Silent fail - don't spam console
                });
            } catch (error) {
                // Silent fail - don't spam console
            }
        }
    },
    
    // Play goal score sound for soccer mode
    playGoalScoreSound(scene) {
        // Try Phaser sound first - this is the most reliable method
        if (scene && scene.sound && scene.sound.get('goal_score')) {
            try {
                scene.sound.play('goal_score', { volume: 0.8 });
                console.log('🔊 Playing goal score sound via Phaser');
                return;
            } catch (error) {
                console.warn('🔇 Phaser goal score sound failed:', error);
            }
        }
        
        // Simplified HTML5 Audio fallback - only try if properly loaded
        if (this.goalScoreAudio && this.goalScoreAudio.readyState >= 3) {
            try {
                this.goalScoreAudio.currentTime = 0;
                this.goalScoreAudio.play().catch(error => {
                    // Silent fail - don't spam console
                });
            } catch (error) {
                // Silent fail - don't spam console
            }
        }
    },
    
    // Play fight intro sound for fight mode
    playFightIntroSound(scene) {
        // Try Phaser sound first - this is the most reliable method
        if (scene && scene.sound && scene.sound.get('fight_intro')) {
            try {
                scene.sound.play('fight_intro', { volume: 0.9 });
                console.log('🔊 Playing fight intro sound via Phaser');
                return;
            } catch (error) {
                console.warn('🔇 Phaser fight intro sound failed:', error);
            }
        }
        
        // Simplified HTML5 Audio fallback - only try if properly loaded
        if (this.fightIntroAudio && this.fightIntroAudio.readyState >= 3) {
            try {
                this.fightIntroAudio.currentTime = 0;
                this.fightIntroAudio.play().catch(error => {
                    // Silent fail - don't spam console
                });
            } catch (error) {
                // Silent fail - don't spam console
            }
        }
    },
    
    // Play victory sound for win scenarios
    playVictorySound(scene) {
        // Try Phaser sound first - this is the most reliable method
        if (scene && scene.sound && scene.sound.get('victory')) {
            try {
                scene.sound.play('victory', { volume: 0.8 });
                console.log('🔊 Playing victory sound via Phaser');
                return;
            } catch (error) {
                console.warn('🔇 Phaser victory sound failed:', error);
            }
        }
        
        // Simplified HTML5 Audio fallback - only try if properly loaded
        if (this.victoryAudio && this.victoryAudio.readyState >= 3) {
            try {
                this.victoryAudio.currentTime = 0;
                this.victoryAudio.play().catch(error => {
                    // Silent fail - don't spam console
                });
            } catch (error) {
                // Silent fail - don't spam console
            }
        }
    },
    
    // Play bruh sound for fight mode player hits
    playBruhSound(scene) {
        // Try Phaser sound first - this is the most reliable method
        if (scene && scene.sound && scene.sound.get('bruh')) {
            try {
                scene.sound.play('bruh', { volume: 0.7 });
                console.log('🔊 Playing bruh sound via Phaser');
                return;
            } catch (error) {
                console.warn('🔇 Phaser bruh sound failed:', error);
            }
        }
        
        // Simplified HTML5 Audio fallback - only try if properly loaded
        if (this.bruhAudio && this.bruhAudio.readyState >= 3) {
            try {
                this.bruhAudio.currentTime = 0;
                this.bruhAudio.play().catch(error => {
                    // Silent fail - don't spam console
                });
            } catch (error) {
                // Silent fail - don't spam console
            }
        }
    },
    
    // Start background music (call once at game start)
    startBackgroundMusic(scene) {
        // Try Phaser sound first - this is the most reliable method
        if (scene && scene.sound && scene.sound.get('background_music')) {
            try {
                // Stop any existing background music first
                if (scene.sound.get('background_music') && scene.sound.get('background_music').isPlaying) {
                    return; // Already playing, don't restart
                }
                scene.sound.play('background_music', { 
                    volume: 0.15, 
                    loop: true 
                });
                console.log('🎵 Background music started via Phaser');
                return;
            } catch (error) {
                console.warn('🔇 Phaser background music failed:', error);
            }
        }
        
        // HTML5 Audio fallback
        if (this.backgroundMusicAudio) {
            try {
                // Check if already playing
                if (!this.backgroundMusicAudio.paused) {
                    return; // Already playing
                }
                
                this.backgroundMusicAudio.currentTime = 0;
                this.backgroundMusicAudio.play().then(() => {
                    console.log('🎵 Background music started via HTML5 Audio');
                }).catch(error => {
                    console.warn('🔇 HTML5 background music failed:', error);
                });
            } catch (error) {
                console.warn('🔇 Background music initialization failed:', error);
            }
        }
    },
    
    // Stop background music (if needed)
    stopBackgroundMusic(scene) {
        // Stop Phaser sound
        if (scene && scene.sound && scene.sound.get('background_music')) {
            try {
                scene.sound.get('background_music').stop();
            } catch (error) {
                console.warn('🔇 Error stopping Phaser background music:', error);
            }
        }
        
        // Stop HTML5 Audio
        if (this.backgroundMusicAudio && !this.backgroundMusicAudio.paused) {
            try {
                this.backgroundMusicAudio.pause();
                this.backgroundMusicAudio.currentTime = 0;
            } catch (error) {
                console.warn('🔇 Error stopping HTML5 background music:', error);
            }
        }
    },
    
    // Preload sounds in any scene
    preloadSounds(scene) {
        if (scene && scene.load) {
            console.log('🔊 Loading sound files...');
            
            // Load with WAV format for universal compatibility
            scene.load.audio('buttonClick', 'assets/SFX/back_002.wav');
            scene.load.audio('forwardButton', 'assets/SFX/select_001.wav');
            
            // Load character-specific power sounds
            scene.load.audio('power_blaze', 'assets/SFX/Blaze/Blazesound.wav');
            scene.load.audio('power_brick', 'assets/SFX/Brick/Bricksound.wav');
            scene.load.audio('power_frostbite', 'assets/SFX/Frostbite/Frostbitesound.wav');
            scene.load.audio('power_jellyhead', 'assets/SFX/Jellyhead/Jellysound.wav');
            scene.load.audio('power_volt', 'assets/SFX/Volt/Voltsound.wav');
            scene.load.audio('power_whirlwind', 'assets/SFX/Whirlwind/Whirlwind.wav');
            
            // Load ball kick sound for soccer mode
            scene.load.audio('kickball', 'assets/SFX/ballkicksound.wav');
            
            // Load goal scoring sound for soccer mode
            scene.load.audio('goal_score', 'assets/SFX/pluck_002.wav');
            
            // Load fight intro sound for fight mode
            scene.load.audio('fight_intro', 'assets/SFX/fightdeep.wav');
            
            // Load victory sound for win scenarios
            scene.load.audio('victory', 'assets/SFX/Victory.wav');
            
            // Load bruh sound for fight mode player hits
            scene.load.audio('bruh', 'assets/SFX/Bruh.wav');
            
            // Load background music for continuous play
            scene.load.audio('background_music', 'assets/SFX/ES_K.O. - Lupus Nocte.wav');
            
            // Add load event listeners for debugging
            scene.load.on('filecomplete-audio-buttonClick', () => {
                console.log('✅ Back button sound loaded successfully');
            });
            
            scene.load.on('filecomplete-audio-forwardButton', () => {
                console.log('✅ Forward button sound loaded successfully');
            });
            
            scene.load.on('filecomplete-audio-kickball', () => {
                console.log('✅ Ball kick sound loaded successfully');
            });
            
            scene.load.on('filecomplete-audio-goal_score', () => {
                console.log('✅ Goal score sound loaded successfully');
            });
            
            scene.load.on('filecomplete-audio-fight_intro', () => {
                console.log('✅ Fight intro sound loaded successfully');
            });
            
            scene.load.on('filecomplete-audio-victory', () => {
                console.log('✅ Victory sound loaded successfully');
            });
            
            scene.load.on('filecomplete-audio-bruh', () => {
                console.log('✅ Bruh sound loaded successfully');
            });
            
            scene.load.on('filecomplete-audio-background_music', () => {
                console.log('✅ Background music loaded successfully');
            });
            
            // Character power sound load listeners (consolidated)
            let loadedCharacterSounds = 0;
            const totalCharacterSounds = 6;
            
            const characterSounds = ['blaze', 'brick', 'frostbite', 'jellyhead', 'volt', 'whirlwind'];
            characterSounds.forEach(char => {
                scene.load.on(`filecomplete-audio-power_${char}`, () => {
                    loadedCharacterSounds++;
                    if (loadedCharacterSounds === totalCharacterSounds) {
                        console.log('✅ All character power sounds loaded successfully');
                    }
                });
            });
            
            scene.load.on('loaderror', (file) => {
                console.error('❌ Sound loading error:', file);
                console.log('🔄 Falling back to HTML5 Audio');
            });
        }
    }
};

// XP and Progression System
const XP_SYSTEM = {
    // XP rewards per match
    XP_WINNER: 50,
    XP_LOSER: 25,
    
    // XP thresholds for each level
    XP_THRESHOLDS: [
        0,    // Level 1 (base)
        100,  // Level 2 (bronze)
        250,  // Level 3 (silver)
        500,  // Level 4 (gold)
        1000  // Level 5 (shadow)
    ],
    
    // Skin types for each level
    SKIN_TYPES: {
        1: 'base',
        2: 'bronze',
        3: 'silver',
        4: 'gold',
        5: 'shadow'
    },
    
    // Calculate level from XP
    calculateLevel(xp) {
        for (let i = this.XP_THRESHOLDS.length - 1; i >= 0; i--) {
            if (xp >= this.XP_THRESHOLDS[i]) {
                return i + 1;
            }
        }
        return 1;
    },
    
    // Get XP needed for next level
    getXPForNextLevel(currentXP) {
        const currentLevel = this.calculateLevel(currentXP);
        if (currentLevel >= this.XP_THRESHOLDS.length) {
            return null; // Max level reached
        }
        return this.XP_THRESHOLDS[currentLevel] - currentXP;
    },
    
    // Get all unlocked skins for a player
    getUnlockedSkins(xp) {
        const level = this.calculateLevel(xp);
        const unlockedSkins = [];
        for (let i = 1; i <= level; i++) {
            unlockedSkins.push(this.SKIN_TYPES[i]);
        }
        return unlockedSkins;
    }
};

// Player Progress System
const PLAYER_PROGRESS = {
    // Load player progress from localStorage
    loadPlayerProgress(playerId) {
        const key = `${playerId}_progress`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                const progress = JSON.parse(saved);
                // Validate structure
                if (progress.xp !== undefined && progress.equippedSkins !== undefined) {
                    return progress;
                }
            } catch (e) {
                console.warn(`Failed to parse saved progress for ${playerId}:`, e);
            }
        }
        
        // Return default progress if no valid save found
        return this.getDefaultProgress();
    },
    
    // Save player progress to localStorage
    savePlayerProgress(playerId, progress) {
        const key = `${playerId}_progress`;
        try {
            localStorage.setItem(key, JSON.stringify(progress));
            console.log(`Progress saved for ${playerId}:`, progress);
        } catch (e) {
            console.error(`Failed to save progress for ${playerId}:`, e);
        }
    },
    
    // Get default progress for new players
    getDefaultProgress() {
        const defaultSkins = {};
        Object.keys(CHARACTERS).forEach(charKey => {
            defaultSkins[charKey] = 'base';
        });
        
        return {
            xp: 0,
            equippedSkins: defaultSkins
        };
    },
    
    // Add XP to a player
    addXP(playerId, xpAmount) {
        const progress = this.loadPlayerProgress(playerId);
        const oldLevel = XP_SYSTEM.calculateLevel(progress.xp);
        
        progress.xp += xpAmount;
        const newLevel = XP_SYSTEM.calculateLevel(progress.xp);
        
        this.savePlayerProgress(playerId, progress);
        
        // Return level up information
        return {
            oldXP: progress.xp - xpAmount,
            newXP: progress.xp,
            oldLevel: oldLevel,
            newLevel: newLevel,
            leveledUp: newLevel > oldLevel
        };
    },
    
    // Equip a skin for a character
    equipSkin(playerId, characterKey, skinType) {
        const progress = this.loadPlayerProgress(playerId);
        const unlockedSkins = XP_SYSTEM.getUnlockedSkins(progress.xp);
        
        if (unlockedSkins.includes(skinType)) {
            progress.equippedSkins[characterKey] = skinType;
            this.savePlayerProgress(playerId, progress);
            return true;
        }
        
        return false; // Skin not unlocked
    },
    
    // Get equipped skin for a character
    getEquippedSkin(playerId, characterKey) {
        const progress = this.loadPlayerProgress(playerId);
        return progress.equippedSkins[characterKey] || 'base';
    }
};

// Initialize player progress on game start
let player1Progress = PLAYER_PROGRESS.loadPlayerProgress('player1');
let player2Progress = PLAYER_PROGRESS.loadPlayerProgress('player2');

// Global character selection state
let selectedCharacters = {
    player1: null,
    player2: null
};

// Global map selection state
let selectedMap = 'nightcity';

// Global game mode selection state
let selectedGameMode = 'soccer'; // 'soccer' or 'fight'
let selectedMatchSettings = {
    time: 60,
    goalLimit: 3,
    heartLimit: 3
};

// Global session state for tracking wins across matches
let SessionState = {
    player1Wins: 0,
    player2Wins: 0,
    totalRoundsPlayed: 0
};

// Home Scene
class HomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HomeScene' });
        
        // Info Panel state
        this.infoPanelOpen = false;
        this.infoCurrentTab = 'tutorial'; // 'tutorial' or 'characters'
        this.infoPanelElements = [];
        this.infoContentElements = [];
        this.singleTabMode = false;
    }

    preload() {
        // Load all character sprites for previews (same as CharacterSelectionScene)
        const characterKeys = Object.keys(CHARACTERS);
        characterKeys.forEach(key => {
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
            } else {
                console.error(`No sprite config found for character: ${key}`);
            }
        });

        // Preload sound effects
        SoundManager.preloadSounds(this);
    }

    create() {
        // Initialize audio and start background music
        SoundManager.initializeAudio(this);
        SoundManager.startBackgroundMusic(this);
        
        // Arcade-style gradient background (match Character Selection)
        this.add.rectangle(400, 300, 800, 600, 0x000000);
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Arcade border frame (match Character Selection)
        this.add.rectangle(400, 300, 790, 590, 0x000000, 0).setStrokeStyle(6, 0x00ffff);
        this.add.rectangle(400, 300, 770, 570, 0x000000, 0).setStrokeStyle(2, 0xff00ff);

        // Arcade-style title "HEADSHOT" (much bigger font)
        this.add.text(400, 80, 'HEADSHOT', {
            fontSize: '64px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Subtitle "HOME" (bigger font and positioned higher up under headshot)
        this.add.text(400, 140, 'HOME', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Create buttons with proper spacing - Hero Jumper on top
        const buttonSpacing = 80;
        const startY = 250;

        // Hero Jumper Button (moved to top)
        this.heroJumperBg = this.add.rectangle(400, startY, 320, 60, 0x000000, 0.9);
        this.heroJumperBg.setStrokeStyle(4, 0xff00ff); // Vibrant purple border
        this.heroJumperBg.setInteractive();
        
        this.heroJumperBtn = this.add.text(400, startY, 'HERO JUMPER', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ff00ff', // Purple text to match border
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Local Multiplayer Button (moved to second)
        this.localMultiplayerBg = this.add.rectangle(400, startY + buttonSpacing, 320, 60, 0x000000, 0.9);
        this.localMultiplayerBg.setStrokeStyle(4, 0xff00ff); // Vibrant purple border
        this.localMultiplayerBg.setInteractive();
        
        this.localMultiplayerBtn = this.add.text(400, startY + buttonSpacing, 'LOCAL MULTIPLAYER', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ff00ff', // Purple text to match border
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Tutorial Button
        this.tutorialBg = this.add.rectangle(400, startY + (buttonSpacing * 2), 320, 60, 0x000000, 0.9);
        this.tutorialBg.setStrokeStyle(4, 0xff00ff); // Vibrant purple border
        this.tutorialBg.setInteractive();
        
        this.tutorialBtn = this.add.text(400, startY + (buttonSpacing * 2), 'TUTORIAL', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ff00ff', // Purple text to match border
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Character Info Button
        this.characterInfoBg = this.add.rectangle(400, startY + (buttonSpacing * 3), 320, 60, 0x000000, 0.9);
        this.characterInfoBg.setStrokeStyle(4, 0xff00ff); // Vibrant purple border
        this.characterInfoBg.setInteractive();
        
        this.characterInfoBtn = this.add.text(400, startY + (buttonSpacing * 3), 'CHARACTER INFO', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ff00ff', // Purple text to match border
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Add click handlers (in new order)
        this.heroJumperBg.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            this.scene.start('SoloCharacterSelectionScene');
        });

        this.localMultiplayerBg.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            this.scene.start('CharacterSelectionScene');
        });

        this.tutorialBg.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.openTutorialPanel();
        });

        this.characterInfoBg.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.openCharacterInfoPanel();
        });

        // Add hover effects for Hero Jumper button (moved to top)
        this.heroJumperBg.on('pointerover', () => {
            this.heroJumperBg.setFillStyle(0x330033, 0.9); // Purple tint
            this.heroJumperBg.setStrokeStyle(4, 0xff00ff);
            this.heroJumperBtn.setStyle({ fill: '#ffffff' });
        });
        this.heroJumperBg.on('pointerout', () => {
            this.heroJumperBg.setFillStyle(0x000000, 0.9);
            this.heroJumperBg.setStrokeStyle(4, 0xff00ff);
            this.heroJumperBtn.setStyle({ fill: '#ff00ff' });
        });

        // Add hover effects for Local Multiplayer button
        this.localMultiplayerBg.on('pointerover', () => {
            this.localMultiplayerBg.setFillStyle(0x330033, 0.9); // Purple tint
            this.localMultiplayerBg.setStrokeStyle(4, 0xff00ff);
            this.localMultiplayerBtn.setStyle({ fill: '#ffffff' });
        });
        this.localMultiplayerBg.on('pointerout', () => {
            this.localMultiplayerBg.setFillStyle(0x000000, 0.9);
            this.localMultiplayerBg.setStrokeStyle(4, 0xff00ff);
            this.localMultiplayerBtn.setStyle({ fill: '#ff00ff' });
        });

        // Add hover effects for Tutorial button
        this.tutorialBg.on('pointerover', () => {
            this.tutorialBg.setFillStyle(0x330033, 0.9); // Purple tint
            this.tutorialBg.setStrokeStyle(4, 0xff00ff);
            this.tutorialBtn.setStyle({ fill: '#ffffff' });
        });
        this.tutorialBg.on('pointerout', () => {
            this.tutorialBg.setFillStyle(0x000000, 0.9);
            this.tutorialBg.setStrokeStyle(4, 0xff00ff);
            this.tutorialBtn.setStyle({ fill: '#ff00ff' });
        });

        // Add hover effects for Character Info button
        this.characterInfoBg.on('pointerover', () => {
            this.characterInfoBg.setFillStyle(0x330033, 0.9); // Purple tint
            this.characterInfoBg.setStrokeStyle(4, 0xff00ff);
            this.characterInfoBtn.setStyle({ fill: '#ffffff' });
        });
        this.characterInfoBg.on('pointerout', () => {
            this.characterInfoBg.setFillStyle(0x000000, 0.9);
            this.characterInfoBg.setStrokeStyle(4, 0xff00ff);
            this.characterInfoBtn.setStyle({ fill: '#ff00ff' });
        });
    }

    // Info Panel Methods
    openTutorialPanel() {
        this.openInfoPanel('soccer', false); // Start with Soccer tab, not single tab mode
    }

    openCharacterInfoPanel() {
        this.openInfoPanel('characters', true);
    }

    openInfoPanel(startTab = 'tutorial', singleTabMode = true) {
        if (this.infoPanelOpen) return;
        
        this.infoPanelOpen = true;
        this.infoCurrentTab = startTab;
        this.singleTabMode = singleTabMode;
        
        // Get screen dimensions for responsive layout
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // Calculate responsive modal size (80% of screen, max 700x500)
        const modalWidth = Math.min(700, screenWidth * 0.85);
        const modalHeight = Math.min(500, screenHeight * 0.85);
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;
        
        // Create backdrop
        this.infoBackdrop = this.add.rectangle(centerX, centerY, screenWidth, screenHeight, 0x000000, 0.8);
        this.infoBackdrop.setInteractive();
        this.infoBackdrop.on('pointerdown', () => this.closeInfoPanel());
        
        // Create main panel - responsive and centered
        this.infoPanel = this.add.rectangle(centerX, centerY, modalWidth, modalHeight, 0x000000, 0.95);
        this.infoPanel.setStrokeStyle(4, 0xff00ff);
        this.infoPanel.setInteractive();
        
        // Calculate positions relative to modal
        const modalTop = centerY - modalHeight / 2;
        const modalLeft = centerX - modalWidth / 2;
        const modalRight = centerX + modalWidth / 2;
        
        // Title - responsive positioning (change based on single tab mode)
        const titleText = singleTabMode ? 
            (startTab === 'tutorial' ? 'TUTORIAL' : 'CHARACTER INFO') : 
            'TUTORIAL';
        this.infoPanelTitle = this.add.text(centerX, modalTop + 40, titleText, {
            fontSize: Math.min(36, modalWidth / 20) + 'px',
            fontStyle: 'bold',
            fill: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Only create tab buttons if not in single tab mode
        if (!singleTabMode) {
            // Tab buttons for three game modes - responsive positioning and sizing
            const tabWidth = Math.min(120, modalWidth / 6);
            const tabY = modalTop + 80;
            const tabSpacing = modalWidth / 4;
            
            // Soccer Mode Tab (Left)
            this.soccerTab = this.add.rectangle(centerX - tabSpacing, tabY, tabWidth, 40, 0x000000, 0.9);
            this.soccerTab.setStrokeStyle(3, startTab === 'soccer' ? 0xff00ff : 0x666666);
            this.soccerTabText = this.add.text(centerX - tabSpacing, tabY, 'SOCCER', {
                fontSize: Math.min(16, modalWidth / 45) + 'px',
                fontStyle: 'bold',
                fill: startTab === 'soccer' ? '#ff00ff' : '#aaaaaa',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.soccerTab.setInteractive();
            this.soccerTab.on('pointerdown', () => this.switchInfoTab('soccer'));
            
            // Fight Mode Tab (Center)
            this.fightTab = this.add.rectangle(centerX, tabY, tabWidth, 40, 0x000000, 0.9);
            this.fightTab.setStrokeStyle(3, startTab === 'fight' ? 0xff00ff : 0x666666);
            this.fightTabText = this.add.text(centerX, tabY, 'FIGHT', {
                fontSize: Math.min(16, modalWidth / 45) + 'px',
                fontStyle: 'bold',
                fill: startTab === 'fight' ? '#ff00ff' : '#aaaaaa',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.fightTab.setInteractive();
            this.fightTab.on('pointerdown', () => this.switchInfoTab('fight'));
            
            // Hero Jumper Tab (Right)
            this.heroJumperTab = this.add.rectangle(centerX + tabSpacing, tabY, tabWidth, 40, 0x000000, 0.9);
            this.heroJumperTab.setStrokeStyle(3, startTab === 'heroJumper' ? 0xff00ff : 0x666666);
            this.heroJumperTabText = this.add.text(centerX + tabSpacing, tabY, 'HERO JUMPER', {
                fontSize: Math.min(14, modalWidth / 50) + 'px',
                fontStyle: 'bold',
                fill: startTab === 'heroJumper' ? '#ff00ff' : '#aaaaaa',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.heroJumperTab.setInteractive();
            this.heroJumperTab.on('pointerdown', () => this.switchInfoTab('heroJumper'));
        }
        
        // Close button - responsive positioning
        this.infoCloseBtn = this.add.rectangle(modalRight - 50, modalTop + 40, 80, 40, 0x000000, 0.9);
        this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
        this.infoCloseBtn.setInteractive();
        this.infoCloseBtn.on('pointerdown', () => this.closeInfoPanel());
        this.infoCloseText = this.add.text(modalRight - 50, modalTop + 40, 'CLOSE', {
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add hover effects
        this.infoCloseBtn.on('pointerover', () => {
            this.infoCloseBtn.setFillStyle(0x330000, 0.9);
            this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
            this.infoCloseText.setStyle({ fill: '#ffffff' });
        });
        this.infoCloseBtn.on('pointerout', () => {
            this.infoCloseBtn.setFillStyle(0x000000, 0.9);
            this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
            this.infoCloseText.setStyle({ fill: '#ff0000' });
        });
        
        // Store modal dimensions for content creation
        this.modalDimensions = {
            width: modalWidth,
            height: modalHeight,
            centerX: centerX,
            centerY: centerY,
            top: modalTop,
            left: modalLeft,
            right: modalRight,
            contentTop: singleTabMode ? modalTop + 80 : modalTop + 120,
            contentHeight: singleTabMode ? modalHeight - 100 : modalHeight - 140
        };
        
        // Store panel elements
        this.infoPanelElements = [
            this.infoBackdrop,
            this.infoPanel,
            this.infoPanelTitle,
            this.infoCloseBtn,
            this.infoCloseText
        ];
        
        // Add tab elements only if not in single tab mode
        if (!singleTabMode) {
            this.infoPanelElements.push(
                this.soccerTab,
                this.soccerTabText,
                this.fightTab,
                this.fightTabText,
                this.heroJumperTab,
                this.heroJumperTabText
            );
        }
        
        // Create initial content
        this.updateInfoContent();
    }
    
    closeInfoPanel() {
        if (!this.infoPanelOpen) return;
        
        this.infoPanelOpen = false;
        
        // Destroy all panel elements
        this.infoPanelElements.forEach(element => {
            if (element) element.destroy();
        });
        this.infoPanelElements = [];
        
        // Destroy content elements
        if (this.infoContentElements) {
            this.infoContentElements.forEach(element => {
                if (element) element.destroy();
            });
            this.infoContentElements = [];
        }
        
        // Clear modal dimensions
        this.modalDimensions = null;
    }
    
    switchInfoTab(tab) {
        if (this.infoCurrentTab === tab) return;
        
        this.infoCurrentTab = tab;
        
        // Update tab appearance for all three tabs
        const tabs = [
            { tab: this.soccerTab, text: this.soccerTabText, key: 'soccer' },
            { tab: this.fightTab, text: this.fightTabText, key: 'fight' },
            { tab: this.heroJumperTab, text: this.heroJumperTabText, key: 'heroJumper' }
        ];
        
        tabs.forEach(tabObj => {
            if (tabObj.key === tab) {
                // Active tab styling
                tabObj.tab.setFillStyle(0x000000, 0.9);
                tabObj.tab.setStrokeStyle(3, 0xff00ff);
                tabObj.text.setStyle({ fill: '#ff00ff' });
            } else {
                // Inactive tab styling
                tabObj.tab.setFillStyle(0x000000, 0.9);
                tabObj.tab.setStrokeStyle(3, 0x666666);
                tabObj.text.setStyle({ fill: '#aaaaaa' });
            }
        });
        
        // Update content
        this.updateInfoContent();
    }
    
    updateInfoContent() {
        // Clear existing content
        if (this.infoContentElements) {
            this.infoContentElements.forEach(element => {
                if (element) element.destroy();
            });
        }
        this.infoContentElements = [];
        
        // Create content based on selected game mode
        if (this.infoCurrentTab === 'soccer') {
            this.createTutorialContent('soccer');
        } else if (this.infoCurrentTab === 'fight') {
            this.createTutorialContent('fight');
        } else if (this.infoCurrentTab === 'heroJumper') {
            this.createTutorialContent('heroJumper');
        } else {
            this.createCharactersContent();
        }
    }
    
    createTutorialContent(gameMode = 'soccer') {
        const modal = this.modalDimensions;
        
        // Calculate content area with generous padding
        const contentWidth = modal.width - 60;
        const contentHeight = modal.contentHeight;
        const contentCenterX = modal.centerX;
        const contentTop = modal.contentTop;
        
        // Create content background
        const contentBg = this.add.rectangle(contentCenterX, contentTop + contentHeight / 2, contentWidth, contentHeight, 0x0f0f0f, 0.95);
        contentBg.setStrokeStyle(2, 0x444444);
        this.infoContentElements.push(contentBg);
        
        // Calculate 2x2 grid layout with proper spacing
        const gridGap = 20; // 20px gap between boxes
        const gridPadding = 20; // 20px padding from edges
        
        // Calculate box dimensions to fit 2x2 grid with gaps
        const availableWidth = contentWidth - (gridPadding * 2) - gridGap;
        const availableHeight = contentHeight - (gridPadding * 2) - gridGap;
        
        const boxWidth = availableWidth / 2;
        const boxHeight = availableHeight / 2;
        
        // Calculate grid positions
        const leftX = contentCenterX - (availableWidth / 2) + (boxWidth / 2);
        const rightX = contentCenterX + (availableWidth / 2) - (boxWidth / 2);
        const topY = contentTop + gridPadding + (boxHeight / 2);
        const bottomY = contentTop + gridPadding + boxHeight + gridGap + (boxHeight / 2);
        
        // Define tutorial content for each game mode
        let sections = [];
        
        if (gameMode === 'soccer') {
            sections = [
                {
                    title: 'CONTROLS',
                    x: leftX,
                    y: topY,
                    text: '• Player 1: A/D to move, W to jump\n• Player 2: ← → to move, ↑ to jump\n• ESC or SPACE to pause during matches\n• E (P1) / K (P2) to use special powers'
                },
                {
                    title: 'OBJECTIVE',
                    x: rightX,
                    y: topY,
                    text: '• Score goals by kicking the ball into opponent\'s goal\n• First to reach goal limit wins\n• Match ends when time limit is reached\n• Higher score wins in overtime'
                },
                {
                    title: 'SPECIAL POWERS',
                    x: leftX,
                    y: bottomY,
                    text: '• Each character has unique soccer abilities\n• Powers recharge every 15 seconds or after 2 goals\n• Use powers to gain ball control advantage\n• Shadow skins get 2 power charges!'
                },
                {
                    title: 'CHAOS EVENTS',
                    x: rightX,
                    y: bottomY,
                    text: '• Random events occur during matches\n• Zero Gravity, Speed Boost, Ball Clone\n• Meteor Drop, Big Head Mode, Flip Screen\n• Adapt your strategy to survive chaos!'
                }
            ];
        } else if (gameMode === 'fight') {
            sections = [
                {
                    title: 'CONTROLS',
                    x: leftX,
                    y: topY,
                    text: '• Player 1: A/D to move, W to jump\n• Player 2: ← → to move, ↑ to jump\n• E (P1) / K (P2) to attack with powers\n• ESC or SPACE to pause'
                },
                {
                    title: 'HEALTH SYSTEM',
                    x: rightX,
                    y: topY,
                    text: '• Each player starts with 3 hearts ♥♥♥\n• Power attacks reduce opponent\'s health\n• First player to lose all hearts loses\n• Health shown at top of screen'
                },
                {
                    title: 'POWER ATTACKS',
                    x: leftX,
                    y: bottomY,
                    text: '• Powers deal damage and knock back enemies\n• Each character has unique attack abilities\n• Powers have shorter cooldown in Fight Mode\n• Use movement to dodge attacks'
                },
                {
                    title: 'WIN CONDITION',
                    x: rightX,
                    y: bottomY,
                    text: '• Reduce opponent\'s hearts to 0 to win\n• Fight continues until someone is defeated\n• Winner gets bonus XP for victory\n• Optional bonus round after Soccer matches'
                }
            ];
        } else if (gameMode === 'heroJumper') {
            sections = [
                {
                    title: 'CONTROLS',
                    x: leftX,
                    y: topY,
                    text: '• A/D or ← → to move horizontally\n• NO jump button - auto-bounce on platforms!\n• SPACEBAR to use power (shoots straight up)\n• Screen wrapping - exit sides to appear opposite'
                },
                {
                    title: 'PLATFORM TYPES',
                    x: rightX,
                    y: topY,
                    text: '• 💙 Blue: Normal bounce height\n• 🟢 Green: Super high bounce (look for arrows!)\n• 🔴 Red: Lower bounce + BREAKS after use\n• Land on top, pass through from below'
                },
                {
                    title: 'GAMEPLAY',
                    x: leftX,
                    y: bottomY,
                    text: '• Climb infinitely high!\n• Dodge falling red soccer balls\n• Use powers to destroy hazards (+25 pts)\n• Don\'t fall too far below highest point'
                },
                {
                    title: 'SCORING & SURVIVAL',
                    x: rightX,
                    y: bottomY,
                    text: '• Score = height reached\n• 3 lives vs hazard impacts\n• Difficulty increases with height\n• Green platforms = extra boost!'
                }
            ];
        }
        
        // Create each section in the 2x2 grid
        sections.forEach(section => {
            // Section background panel (slightly lighter than modal background)
            const sectionPanel = this.add.rectangle(section.x, section.y, boxWidth - 10, boxHeight - 10, 0x1a1a1a, 0.9);
            sectionPanel.setStrokeStyle(2, 0x333333);
            this.infoContentElements.push(sectionPanel);
            
            // Section title (bold yellow, centered at top)
            const sectionTitle = this.add.text(section.x, section.y - (boxHeight / 2) + 25, section.title, {
                fontSize: '14px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.infoContentElements.push(sectionTitle);
            
            // Section text (white bullet points with padding)
            const sectionText = this.add.text(section.x, section.y + 10, section.text, {
                fontSize: '11px',
                fontStyle: 'bold',
                fill: '#ffffff',
                lineSpacing: 4,
                align: 'left',
                wordWrap: { width: boxWidth - 30, useAdvancedWrap: true }
            }).setOrigin(0.5);
            this.infoContentElements.push(sectionText);
        });
    }
    
    createCharactersContent() {
        const modal = this.modalDimensions;
        
        // Calculate content area with padding
        const contentWidth = modal.width - 60;
        const contentHeight = modal.contentHeight;
        const contentCenterX = modal.centerX;
        const contentTop = modal.contentTop;
        
        // Create content background
        const contentBg = this.add.rectangle(contentCenterX, contentTop + contentHeight / 2, contentWidth, contentHeight, 0x0f0f0f, 0.95);
        contentBg.setStrokeStyle(2, 0x444444);
        this.infoContentElements.push(contentBg);
        
        // Calculate 3x2 grid layout with proper spacing
        const gridCols = 3;
        const gridRows = 2;
        const gridGap = 15; // Gap between boxes
        const gridPadding = 20; // Padding from edges
        
        // Calculate box dimensions for 3x2 grid
        const availableWidth = contentWidth - (gridPadding * 2) - (gridGap * (gridCols - 1));
        const availableHeight = contentHeight - (gridPadding * 2) - (gridGap * (gridRows - 1));
        
        const boxWidth = availableWidth / gridCols;
        const boxHeight = availableHeight / gridRows;
        
        // Calculate starting position for grid
        const startX = contentCenterX - (availableWidth / 2) + (boxWidth / 2);
        const startY = contentTop + gridPadding + (boxHeight / 2);
        
        // Character data
        const characterData = [
            { key: 'volt', name: 'Volt', power: 'Lightning Dash', description: 'Dashes forward with lightning speed and electrical damage' },
            { key: 'blaze', name: 'Blaze', power: 'Fire Kick', description: 'Shoots devastating horizontal fire balls that knock back enemies' },
            { key: 'frostbite', name: 'Frostbite', power: 'Ice Shard', description: 'Launches freezing projectiles that slow opponents' },
            { key: 'brick', name: 'Brick', power: 'Shield Wall', description: 'Creates protective barriers and becomes immune to attacks' },
            { key: 'jellyhead', name: 'Jellyhead', power: 'Jelly Shot', description: 'Fires purple projectiles that slow enemies to 30% speed' },
            { key: 'whirlwind', name: 'Whirlwind', power: 'Tornado Spin', description: 'Spins rapidly creating damaging wind effects' }
        ];
        
        // Create each character box in 3x2 grid
        characterData.forEach((charData, index) => {
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            
            const charX = startX + (col * (boxWidth + gridGap));
            const charY = startY + (row * (boxHeight + gridGap));
            
            // Character panel background
            const charPanel = this.add.rectangle(charX, charY, boxWidth - 5, boxHeight - 5, 0x1a1a1a, 0.9);
            charPanel.setStrokeStyle(2, 0x333333);
            charPanel.setInteractive();
            this.infoContentElements.push(charPanel);
            
            // Add hover effect for polish
            charPanel.on('pointerover', () => {
                charPanel.setFillStyle(0x252525, 0.9);
            });
            charPanel.on('pointerout', () => {
                charPanel.setFillStyle(0x1a1a1a, 0.9);
            });
            
            // Large character sprite in top center
            const mainSpriteX = charX;
            const mainSpriteY = charY - (boxHeight / 4);
            
            let charSprite;
            if (this.textures.exists(`${charData.key}_preview`)) {
                charSprite = this.add.image(mainSpriteX, mainSpriteY, `${charData.key}_preview`);
                const character = CHARACTERS[charData.key];
                const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
                
                // Increase size of all character sprites
                let scale;
                if (charData.key === 'brick' || charData.key === 'jellyhead' || charData.key === 'whirlwind') {
                    scale = spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation) ? 3.2 : 3.5;
                } else {
                    scale = spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation) ? 2.5 : 2.8;
                }
                
                if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                    charSprite.setScale(scale).setOrigin(0.5).setFrame(0);
                } else {
                    charSprite.setScale(scale).setOrigin(0.5);
                }
            } else {
                const character = CHARACTERS[charData.key];
                charSprite = this.add.rectangle(mainSpriteX, mainSpriteY, 32, 32, character.color);
                charSprite.setScale(2.2);
            }
            this.infoContentElements.push(charSprite);
            
            // Text section at bottom - calculate positions from bottom up
            const bottomY = charY + (boxHeight / 2) - 10;
            
            // Description (white text, wrapped) - at bottom
            const descWidth = boxWidth - 20;
            const description = this.add.text(charX, bottomY, charData.description, {
                fontSize: Math.min(12, boxWidth / 22) + 'px',
                fontStyle: 'normal',
                fill: '#ffffff',
                wordWrap: { width: descWidth, useAdvancedWrap: true },
                lineSpacing: 2,
                align: 'center'
            }).setOrigin(0.5, 1);
            this.infoContentElements.push(description);
            
            // Power name (bold yellow) - above description
            const powerY = description.y - description.displayHeight - 5;
            const powerName = this.add.text(charX, powerY, charData.power, {
                fontSize: Math.min(11, boxWidth / 22) + 'px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5, 1);
            this.infoContentElements.push(powerName);
            
            // Character name (bold white) - above power name
            const nameY = powerName.y - powerName.displayHeight - 3;
            const charName = this.add.text(charX, nameY, charData.name, {
                fontSize: Math.min(12, boxWidth / 20) + 'px',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5, 1);
            this.infoContentElements.push(charName);
        });
    }
}

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
        this.player1Grid = [];
        this.player2Grid = [];
        this.lockerOpen = false;
        this.currentLockerPlayer = null;
        this.lockerElements = [];
        this.lockerCharElements = [];
        
        // Info Panel state
        this.infoPanelOpen = false;
        this.infoCurrentTab = 'tutorial'; // 'tutorial' or 'characters'
        this.infoPanelElements = [];
        
        // Add fallback functions if CharacterSpriteHelper is missing functions
        if (!CharacterSpriteHelper.getSkinDisplayName) {
            CharacterSpriteHelper.getSkinDisplayName = function(skinType) {
                const names = {
                    'base': 'Base',
                    'bronze': 'Bronze',
                    'silver': 'Silver',
                    'gold': 'Gold',
                    'shadow': 'Shadow'
                };
                return names[skinType] || skinType;
            };
        }
        
        if (!CharacterSpriteHelper.getAllSkinTypes) {
            CharacterSpriteHelper.getAllSkinTypes = function() {
                return ['base', 'bronze', 'silver', 'gold', 'shadow'];
            };
        }
        
        if (!CharacterSpriteHelper.getSkinRarityColor) {
            CharacterSpriteHelper.getSkinRarityColor = function(skinType) {
                const colors = {
                    'base': 0xffffff,    // white
                    'bronze': 0xcd7f32,  // bronze
                    'silver': 0xc0c0c0,  // silver
                    'gold': 0xffd700,    // gold
                    'shadow': 0x800080   // purple
                };
                return colors[skinType] || 0xffffff;
            };
        }
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
        this.player1Grid = [];
        this.player2Grid = [];
        this.lockerOpen = false;
        this.currentLockerPlayer = null;
        this.lockerElements = [];
        this.lockerCharElements = [];
        this.infoPanelOpen = false;
        this.infoCurrentTab = 'tutorial';
        this.infoPanelElements = [];
        this.infoContentElements = [];
        
        // **CRITICAL FIX**: Reset global character selection state to prevent data carry-over
        console.log('🔄 Resetting character selection data...');
        selectedCharacters = {
            player1: null,
            player2: null
        };
        
        // **CRITICAL FIX**: Clear texture cache for player sprites to prevent fight mode data persistence
        console.log('🧹 Clearing cached player sprite textures...');
        const textureKeysToRemove = [
            'player1_idle', 'player1_walk', 'player2_idle', 'player2_walk',
            'fight_player1_idle', 'fight_player1_walk', 'fight_player2_idle', 'fight_player2_walk'
        ];
        
        textureKeysToRemove.forEach(key => {
            if (this.textures && this.textures.exists(key)) {
                this.textures.remove(key);
                console.log(`🗑️ Removed cached texture: ${key}`);
            }
        });
        
        // Clear any lingering physics world references from previous scenes
        if (this.physics && this.physics.world) {
            // Reset physics world properties to defaults
            this.physics.world.gravity.y = 600; // Reset to default gravity (updated)
            console.log('⚙️ Reset physics world properties');
        }
        
        console.log('✅ Character selection scene initialized with completely clean state');
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
            } else {
                console.error(`No sprite config found for character: ${key}`);
            }
        });

        // Load map thumbnails
        this.load.image('nightcity_thumb', 'assets/Sprites/Backgrounds/nightcity.png');
        this.load.image('ch_thumb', 'assets/Sprites/Backgrounds/ch.png');
        this.load.image('skyline_thumb', 'assets/Sprites/Backgrounds/skyline.png');
        this.load.image('nature_thumb', 'assets/Sprites/Backgrounds/nature.png');
        this.load.image('nighttree_thumb', 'assets/Sprites/Backgrounds/nighttree.png');
        this.load.image('outsideworld_thumb', 'assets/Sprites/Backgrounds/outsideworld.png');
        
        // Load character skin sprites for locker (commented out - using fallback system)
        // this.characterKeys.forEach(key => {
        //     const skinTypes = ['base', 'bronze', 'silver', 'gold', 'shadow'];
        //     skinTypes.forEach(skinType => {
        //         const skinPath = `assets/Sprites/skins/${key}/${skinType}/idle.png`;
        //         this.load.image(`${key}_${skinType}`, skinPath);
        //     });
        // });
        
        // Power sprites removed for cleaner layout

        // Preload sound effects
        SoundManager.preloadSounds(this);
    }

    create() {
        // Initialize audio and start background music
        SoundManager.initializeAudio(this);
        SoundManager.startBackgroundMusic(this);
        
        // Debug CharacterSpriteHelper
        console.log('CharacterSpriteHelper available:', typeof CharacterSpriteHelper);
        console.log('getSkinDisplayName available:', typeof CharacterSpriteHelper?.getSkinDisplayName);
        console.log('getAllSkinTypes available:', typeof CharacterSpriteHelper?.getAllSkinTypes);
        console.log('CHARACTERS keys:', Object.keys(CHARACTERS));
        
        // Add fallback functions if CharacterSpriteHelper is missing functions
        if (!CharacterSpriteHelper.getSkinDisplayName) {
            CharacterSpriteHelper.getSkinDisplayName = function(skinType) {
                const names = {
                    'base': 'Base',
                    'bronze': 'Bronze',
                    'silver': 'Silver',
                    'gold': 'Gold',
                    'shadow': 'Shadow'
                };
                return names[skinType] || skinType;
            };
        }
        
        if (!CharacterSpriteHelper.getAllSkinTypes) {
            CharacterSpriteHelper.getAllSkinTypes = function() {
                return ['base', 'bronze', 'silver', 'gold', 'shadow'];
            };
        }
        
        // Arcade-style gradient background
        this.add.rectangle(400, 300, 800, 600, 0x000000);
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Arcade border frame
        this.add.rectangle(400, 300, 790, 590, 0x000000, 0).setStrokeStyle(6, 0x00ffff);
        this.add.rectangle(400, 300, 770, 570, 0x000000, 0).setStrokeStyle(2, 0xff00ff);

        // Arcade-style title with glow effect
        this.add.text(400, 40, 'CHARACTER SELECTION', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Title underline
        this.add.rectangle(400, 60, 500, 3, 0x00ffff);

        // Split screen divider with arcade styling
        this.add.rectangle(400, 350, 6, 450, 0x00ffff);
        this.add.rectangle(400, 350, 2, 450, 0xffffff);

        // Back button (top-left corner where Info button was) - arcade style
        this.backBtn = this.add.rectangle(85, 50, 100, 32, 0x000000, 0.9);
        this.backBtn.setStrokeStyle(3, 0x00ffff);
        this.backBtnText = this.add.text(85, 50, 'BACK', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#00ffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.backBtn.setInteractive();
        this.backBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.scene.start('HomeScene');
        });
        
        // Add hover effects for Back button
        this.backBtn.on('pointerover', () => {
            this.backBtn.setFillStyle(0x003333, 0.9);
            this.backBtn.setStrokeStyle(3, 0x00ffff);
            this.backBtnText.setStyle({ fill: '#ffffff' });
        });
        this.backBtn.on('pointerout', () => {
            this.backBtn.setFillStyle(0x000000, 0.9);
            this.backBtn.setStrokeStyle(3, 0x00ffff);
            this.backBtnText.setStyle({ fill: '#00ffff' });
        });

        // Info button (top-right corner - opposite side) - arcade style with purple colors
        this.infoBtn = this.add.rectangle(715, 50, 100, 32, 0x000000, 0.9);
        this.infoBtn.setStrokeStyle(3, 0xff00ff);
        this.infoBtnText = this.add.text(715, 50, 'INFO', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.infoBtn.setInteractive();
        this.infoBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.openInfoPanel();
        });
        
        // Add hover effects for Info button
        this.infoBtn.on('pointerover', () => {
            this.infoBtn.setFillStyle(0x330033, 0.9);
            this.infoBtn.setStrokeStyle(3, 0xff00ff);
            this.infoBtnText.setStyle({ fill: '#ffffff' });
        });
        this.infoBtn.on('pointerout', () => {
            this.infoBtn.setFillStyle(0x000000, 0.9);
            this.infoBtn.setStrokeStyle(3, 0xff00ff);
            this.infoBtnText.setStyle({ fill: '#ff00ff' });
        });

        // Player 1 Side (Left) - Arcade style
        this.add.rectangle(200, 100, 320, 50, 0x000000, 0.8);
        this.add.rectangle(200, 100, 320, 50, 0x001100, 0).setStrokeStyle(4, 0x00ff00);
        this.add.text(200, 100, 'PLAYER 1', {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Player 1 controls moved to UI panel

        // Player 1 Locker button - arcade style (centered in Player 1 column, moved up slightly)
        this.player1LockerBtn = this.add.rectangle(200, 145, 80, 28, 0x000000, 0.8);
        this.player1LockerBtn.setStrokeStyle(3, 0x00ff00);
        this.player1LockerText = this.add.text(200, 145, 'LOCKER', {
            fontSize: '12px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.player1LockerBtn.setInteractive();
        this.player1LockerBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.openLocker('player1');
        });
        
        // Add hover effects
        this.player1LockerBtn.on('pointerover', () => {
            this.player1LockerBtn.setFillStyle(0x001100, 0.9);
            this.player1LockerBtn.setStrokeStyle(3, 0x00ff00);
            this.player1LockerText.setStyle({ fill: '#ffffff' });
        });
        this.player1LockerBtn.on('pointerout', () => {
            this.player1LockerBtn.setFillStyle(0x000000, 0.8);
            this.player1LockerBtn.setStrokeStyle(3, 0x00ff00);
            this.player1LockerText.setStyle({ fill: '#00ff00' });
        });

        // Player 2 Side (Right) - Arcade style
        this.add.rectangle(600, 100, 320, 50, 0x000000, 0.8);
        this.add.rectangle(600, 100, 320, 50, 0x001133, 0).setStrokeStyle(4, 0x0080ff);
        this.add.text(600, 100, 'PLAYER 2', {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#0080ff',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Player 2 controls moved to UI panel

        // Player 2 Locker button - arcade style (centered in Player 2 column, moved up slightly)
        this.player2LockerBtn = this.add.rectangle(600, 145, 80, 28, 0x000000, 0.8);
        this.player2LockerBtn.setStrokeStyle(3, 0x0080ff);
        this.player2LockerText = this.add.text(600, 145, 'LOCKER', {
            fontSize: '12px',
            fontStyle: 'bold',
            fill: '#0080ff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.player2LockerBtn.setInteractive();
        this.player2LockerBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.openLocker('player2');
        });
        
        // Add hover effects
        this.player2LockerBtn.on('pointerover', () => {
            this.player2LockerBtn.setFillStyle(0x001133, 0.9);
            this.player2LockerBtn.setStrokeStyle(3, 0x0080ff);
            this.player2LockerText.setStyle({ fill: '#ffffff' });
        });
        this.player2LockerBtn.on('pointerout', () => {
            this.player2LockerBtn.setFillStyle(0x000000, 0.8);
            this.player2LockerBtn.setStrokeStyle(3, 0x0080ff);
            this.player2LockerText.setStyle({ fill: '#0080ff' });
        });

        // Create character grids for each player
        this.createSplitCharacterDisplay();

        // Create player UI panels
        this.createPlayerUI();

        // Setup keyboard controls
        this.setupControls();

        // Update display
        this.updateDisplay();
    }

    createSplitCharacterDisplay() {
        this.charactersDisplay = [];
        this.player1Grid = [];
        this.player2Grid = [];

        // Grid settings
        const gridCols = 3;
        const gridRows = 2;
        const cellWidth = 110;
        const cellHeight = 120;
        
        // Player 1 grid (left side) - adjusted for arcade layout
        const p1StartX = 90;
        const p1StartY = 200;
        
        // Player 2 grid (right side) - adjusted for arcade layout
        const p2StartX = 490;
        const p2StartY = 200;

        this.characterKeys.forEach((key, index) => {
            const character = CHARACTERS[key];
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            
            // Get equipped skin for preview
            const p1EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', key);
            const p2EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', key);
            
            // Player 1 character preview
            const p1X = p1StartX + (col * cellWidth);
            const p1Y = p1StartY + (row * cellHeight);
            
            const p1Sprite = this.createCharacterPreview(p1X, p1Y, key, p1EquippedSkin);
            const p1Name = this.add.text(p1X, p1Y + 50, character.name, {
                fontSize: '16px',
                fontStyle: 'bold',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.player1Grid.push({
                sprite: p1Sprite,
                name: p1Name,
                character: key,
                index: index
            });

            // Player 2 character preview
            const p2X = p2StartX + (col * cellWidth);
            const p2Y = p2StartY + (row * cellHeight);
            
            const p2Sprite = this.createCharacterPreview(p2X, p2Y, key, p2EquippedSkin);
            const p2Name = this.add.text(p2X, p2Y + 50, character.name, {
                fontSize: '16px',
                fontStyle: 'bold',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.player2Grid.push({
                sprite: p2Sprite,
                name: p2Name,
                character: key,
                index: index
            });
        });
    }

    createCharacterPreview(x, y, characterKey, skinType) {
        const character = CHARACTERS[characterKey];
        const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
        
        let sprite;
        
        // Check if the sprite texture exists
        if (this.textures.exists(`${characterKey}_preview`)) {
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                // For sprite sheets (Tiny Heroes), use static frame
                sprite = this.add.image(x, y, `${characterKey}_preview`);
                sprite.setScale(1.8)
                      .setOrigin(0.5)
                      .setFrame(0);
            } else {
                // For single frames (Mini Pixel Pack)
                sprite = this.add.image(x, y, `${characterKey}_preview`);
                sprite.setScale(2.5)
                      .setOrigin(0.5);
            }
        } else {
            // Create a placeholder if sprite doesn't exist
            console.error(`Sprite not found for character: ${characterKey}`);
            sprite = this.add.rectangle(x, y, 32, 32, character.color);
            sprite.setScale(2);
            
            // Add character name as text
            this.add.text(x, y, characterKey.charAt(0).toUpperCase(), {
                fontSize: '16px',
                fill: '#ffffff'
            }).setOrigin(0.5);
        }

        // Apply skin tint if not base skin
        if (skinType !== 'base') {
            const skinColor = CharacterSpriteHelper.getSkinRarityColor(skinType);
            sprite.setTint(skinColor);
        }

        // Add subtle hover effect
        sprite.setInteractive();
        sprite.on('pointerover', () => {
            this.tweens.add({
                targets: sprite,
                scaleX: sprite.scaleX * 1.1,
                scaleY: sprite.scaleY * 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        sprite.on('pointerout', () => {
            this.tweens.add({
                targets: sprite,
                scaleX: sprite.scaleX / 1.1,
                scaleY: sprite.scaleY / 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        return sprite;
    }

    createPlayerUI() {
        // Player 1 UI (Left side) - Arcade style (better positioning)
        this.player1UI = {
            panel: this.add.rectangle(200, 480, 320, 140, 0x000000, 0.9).setStrokeStyle(4, 0x00ff00),
            title: this.add.text(200, 425, 'PLAYER 1 SELECTION', {
                fontSize: '18px',
                fontStyle: 'bold',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
            }).setOrigin(0.5),
            character: this.add.text(200, 455, '', {
                fontSize: '22px',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5),
            power: this.add.text(200, 485, '', {
                fontSize: '16px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5),
            status: this.add.text(200, 510, 'PRESS W TO CONFIRM', {
                fontSize: '14px',
                fontStyle: 'bold',
                fill: '#00ffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5),
            controls: this.add.text(200, 530, 'A/D • W TO SELECT', {
                fontSize: '12px',
                fontStyle: 'bold',
                fill: '#CCCCCC',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5)
        };

        // Player 1 Cancel button (initially hidden)
        this.player1CancelBtn = this.add.rectangle(310, 510, 70, 24, 0x000000, 0.9);
        this.player1CancelBtn.setStrokeStyle(2, 0xff0000);
        this.player1CancelBtn.setInteractive();
        this.player1CancelBtn.setVisible(false);
        this.player1CancelBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.cancelPlayer1Selection();
        });
        
        this.player1CancelText = this.add.text(310, 510, 'CANCEL', {
            fontSize: '10px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        this.player1CancelText.setVisible(false);
        
        // Add hover effects for player 1 cancel button
        this.player1CancelBtn.on('pointerover', () => {
            this.player1CancelBtn.setFillStyle(0x330000, 0.9);
            this.player1CancelText.setStyle({ fill: '#ffffff' });
        });
        this.player1CancelBtn.on('pointerout', () => {
            this.player1CancelBtn.setFillStyle(0x000000, 0.9);
            this.player1CancelText.setStyle({ fill: '#ff0000' });
        });

        // Player 2 UI (Right side) - Arcade style (better positioning)
        this.player2UI = {
            panel: this.add.rectangle(600, 480, 320, 140, 0x000000, 0.9).setStrokeStyle(4, 0x0080ff),
            title: this.add.text(600, 425, 'PLAYER 2 SELECTION', {
                fontSize: '18px',
                fontStyle: 'bold',
                fill: '#0080ff',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
            }).setOrigin(0.5),
            character: this.add.text(600, 455, '', {
                fontSize: '22px',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5),
            power: this.add.text(600, 485, '', {
                fontSize: '16px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5),
            status: this.add.text(600, 510, 'PRESS ↑ TO CONFIRM', {
                fontSize: '14px',
                fontStyle: 'bold',
                fill: '#00ffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5),
            controls: this.add.text(600, 530, '← → • ↑ TO SELECT', {
                fontSize: '12px',
                fontStyle: 'bold',
                fill: '#CCCCCC',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5)
        };

        // Player 2 Cancel button (initially hidden)
        this.player2CancelBtn = this.add.rectangle(710, 510, 70, 24, 0x000000, 0.9);
        this.player2CancelBtn.setStrokeStyle(2, 0xff0000);
        this.player2CancelBtn.setInteractive();
        this.player2CancelBtn.setVisible(false);
        this.player2CancelBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.cancelPlayer2Selection();
        });
        
        this.player2CancelText = this.add.text(710, 510, 'CANCEL', {
            fontSize: '10px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        this.player2CancelText.setVisible(false);
        
        // Add hover effects for player 2 cancel button
        this.player2CancelBtn.on('pointerover', () => {
            this.player2CancelBtn.setFillStyle(0x330000, 0.9);
            this.player2CancelText.setStyle({ fill: '#ffffff' });
        });
        this.player2CancelBtn.on('pointerout', () => {
            this.player2CancelBtn.setFillStyle(0x000000, 0.9);
            this.player2CancelText.setStyle({ fill: '#ff0000' });
        });
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
        // Ensure grids are properly initialized
        if (!this.player1Grid || !this.player2Grid || !this.characterKeys) {
            console.error('updateDisplay called before proper initialization');
            return;
        }
        
        // Reset all character displays to normal state
        this.player1Grid.forEach((display, index) => {
            if (!display || !display.sprite) return;
            
            // Reset tint and scale
            display.sprite.clearTint();
            
            // Get equipped skin and apply tint
            const characterKey = this.characterKeys[index];
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', characterKey);
            
            if (equippedSkin !== 'base') {
                const skinColor = CharacterSpriteHelper.getSkinRarityColor(equippedSkin);
                display.sprite.setTint(skinColor);
            }
            
            // Set normal scale
            const character = CHARACTERS[characterKey];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                display.sprite.setScale(1.8);
            } else {
                display.sprite.setScale(2.5);
            }
        });

        this.player2Grid.forEach((display, index) => {
            if (!display || !display.sprite) return;
            
            // Reset tint and scale
            display.sprite.clearTint();
            
            // Get equipped skin and apply tint
            const characterKey = this.characterKeys[index];
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', characterKey);
            
            if (equippedSkin !== 'base') {
                const skinColor = CharacterSpriteHelper.getSkinRarityColor(equippedSkin);
                display.sprite.setTint(skinColor);
            }
            
            // Set normal scale
            const character = CHARACTERS[characterKey];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                display.sprite.setScale(1.8);
            } else {
                display.sprite.setScale(2.5);
            }
        });

        // Highlight Player 1 selection
        if (!this.player1Confirmed && 
            this.player1Selection >= 0 && 
            this.player1Selection < this.player1Grid.length) {
            
            const p1Display = this.player1Grid[this.player1Selection];
            const p1CharacterKey = this.characterKeys[this.player1Selection];
            const p1Character = CHARACTERS[p1CharacterKey];
            
            if (p1Character && p1Display.sprite) {
                const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
                
                // Add green selection overlay
                p1Display.sprite.setTint(0x00ff00);
                
                // Increase scale for selection
                if (p1SpriteConfig && (p1SpriteConfig.type === 'sprite_sheet' || p1SpriteConfig.hasAnimation)) {
                    p1Display.sprite.setScale(2.2);
                } else {
                    p1Display.sprite.setScale(3.0);
                }
            }
        }

        // Highlight Player 2 selection
        if (!this.player2Confirmed && 
            this.player2Selection >= 0 && 
            this.player2Selection < this.player2Grid.length) {
            
            const p2Display = this.player2Grid[this.player2Selection];
            const p2CharacterKey = this.characterKeys[this.player2Selection];
            const p2Character = CHARACTERS[p2CharacterKey];
            
            if (p2Character && p2Display.sprite) {
                const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
                
                // Add blue selection overlay
                p2Display.sprite.setTint(0x0080ff);
                
                // Increase scale for selection
                if (p2SpriteConfig && (p2SpriteConfig.type === 'sprite_sheet' || p2SpriteConfig.hasAnimation)) {
                    p2Display.sprite.setScale(2.2);
                } else {
                    p2Display.sprite.setScale(3.0);
                }
            }
        }

        // Update Player 1 UI
        const p1Character = CHARACTERS[this.characterKeys[this.player1Selection]];
        this.player1UI.character.setText(p1Character.name.toUpperCase());
        this.player1UI.power.setText(p1Character.power.toUpperCase());
        if (this.player1Confirmed) {
            this.player1UI.status.setText('✓ CONFIRMED');
            this.player1UI.status.setStyle({ fill: '#00ff00' });
            this.player1CancelBtn.setVisible(true);
            this.player1CancelText.setVisible(true);
        } else {
            this.player1UI.status.setText('PRESS W TO CONFIRM');
            this.player1UI.status.setStyle({ fill: '#00ffff' });
            this.player1CancelBtn.setVisible(false);
            this.player1CancelText.setVisible(false);
        }

        // Update Player 2 UI
        const p2Character = CHARACTERS[this.characterKeys[this.player2Selection]];
        this.player2UI.character.setText(p2Character.name.toUpperCase());
        this.player2UI.power.setText(p2Character.power.toUpperCase());
        if (this.player2Confirmed) {
            this.player2UI.status.setText('✓ CONFIRMED');
            this.player2UI.status.setStyle({ fill: '#0080ff' });
            this.player2CancelBtn.setVisible(true);
            this.player2CancelText.setVisible(true);
        } else {
            this.player2UI.status.setText('PRESS ↑ TO CONFIRM');
            this.player2UI.status.setStyle({ fill: '#00ffff' });
            this.player2CancelBtn.setVisible(false);
            this.player2CancelText.setVisible(false);
        }
    }

    openLocker(playerId) {
        console.log(`Opening locker for ${playerId}`);
        
        // Close info panel if it's open
        if (this.infoPanelOpen) {
            this.closeInfoPanel();
        }
        
        // Prevent multiple lockers from opening
        if (this.lockerOpen) {
            return;
        }
        
        this.lockerOpen = true;
        this.currentLockerPlayer = playerId;
        
        // Create modal backdrop - much darker for better visibility
        this.lockerBackdrop = this.add.rectangle(400, 300, 800, 600, 0x000000, 0);
        this.lockerBackdrop.setInteractive();
        this.lockerBackdrop.on('pointerdown', () => this.closeLocker());
        
        // Create modal panel - arcade style (increased height for better spacing)
        this.lockerPanel = this.add.rectangle(400, 300, 700, 550, 0x000000, 0);
        this.lockerPanel.setStrokeStyle(4, playerId === 'player1' ? 0x00ff00 : 0x0080ff);
        this.lockerPanel.setScale(0.8);
        
        // Animate backdrop fade in to full opacity
        this.tweens.add({
            targets: this.lockerBackdrop,
            alpha: 0.95,
            duration: 300,
            ease: 'Power2'
        });
        
        // Animate panel fade in and scale up to full opacity
        this.tweens.add({
            targets: this.lockerPanel,
            alpha: 1.0,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Title - arcade style
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const level = XP_SYSTEM.calculateLevel(progress.xp);
        this.lockerTitle = this.add.text(400, 80, `${playerId.toUpperCase()} LOCKER`, {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: playerId === 'player1' ? '#00ff00' : '#0080ff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // XP and Level info - arcade style
        this.lockerXPInfo = this.add.text(400, 110, `LEVEL ${level} • ${progress.xp} XP`, {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Create character skin grids
        this.createLockerContent(playerId);
        
        // Close button - arcade style (positioned above WHIRLWIND column, created after content to ensure it's on top)
        const whirlwindColumnX = 400 - (600/2) + (100/2) + (5 * 100); // Calculate WHIRLWIND column position
        this.lockerCloseBtn = this.add.rectangle(whirlwindColumnX, 55, 75, 35, 0x000000, 0.9);
        this.lockerCloseBtn.setStrokeStyle(3, 0xff0000);
        this.lockerCloseBtn.setInteractive();
        this.lockerCloseBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.closeLocker();
        });
        this.lockerCloseText = this.add.text(whirlwindColumnX, 55, 'CLOSE', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add hover effects to close button
        this.lockerCloseBtn.on('pointerover', () => {
            this.lockerCloseBtn.setFillStyle(0x330000, 0.9);
            this.lockerCloseBtn.setStrokeStyle(3, 0xff0000);
            this.lockerCloseText.setStyle({ fill: '#ffffff' });
        });
        this.lockerCloseBtn.on('pointerout', () => {
            this.lockerCloseBtn.setFillStyle(0x000000, 0.9);
            this.lockerCloseBtn.setStrokeStyle(3, 0xff0000);
            this.lockerCloseText.setStyle({ fill: '#ff0000' });
        });
        
        // Store locker elements for cleanup
        this.lockerElements = [
            this.lockerBackdrop,
            this.lockerPanel,
            this.lockerTitle,
            this.lockerXPInfo,
            this.lockerCloseBtn,
            this.lockerCloseText
        ];
    }
    
    createLockerContent(playerId) {
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const unlockedSkins = XP_SYSTEM.getUnlockedSkins(progress.xp);
        
        this.lockerCharElements = [];
        
        // Add large dark background for entire locker content area - arcade style (increased height)
        const contentBackground = this.add.rectangle(400, 290, 650, 450, 0x000000, 0.98);
        contentBackground.setStrokeStyle(3, 0x444444);
        this.lockerCharElements.push(contentBackground);
        
        // Calculate responsive layout
        const totalWidth = 600; // Available width for all columns
        const columnWidth = totalWidth / this.characterKeys.length;
        const startX = 400 - (totalWidth / 2) + (columnWidth / 2);
        const startY = 130; // Moved down slightly for better title spacing
        const verticalPadding = 25; // Increased for better spacing between rows
        
        // Define skin order: base first, then others
        const skinOrder = ['base', 'bronze', 'silver', 'gold', 'shadow'];
        
        this.characterKeys.forEach((charKey, charIndex) => {
            const character = CHARACTERS[charKey];
            const columnX = startX + (charIndex * columnWidth);
            
            // Character title at top of column
            const charTitle = this.add.text(columnX, startY, character.name.toUpperCase(), {
                fontSize: '14px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, stroke: true, fill: true }
            }).setOrigin(0.5);
            this.lockerCharElements.push(charTitle);
            
            // Create skin entries vertically below title (increased gap from title)
            skinOrder.forEach((skinType, skinIndex) => {
                const skinY = startY + 55 + (skinIndex * (55 + verticalPadding)); // Increased gap from title and row height
                const isUnlocked = unlockedSkins.includes(skinType);
                const isEquipped = progress.equippedSkins[charKey] === skinType;
                
                // Skin container background (increased height for better spacing)
                const skinContainer = this.add.rectangle(columnX, skinY, columnWidth - 20, 50, 0x1a1a1a, 0.95);
                if (isEquipped) {
                    skinContainer.setStrokeStyle(3, 0x00ff00); // Green border for equipped
                } else if (isUnlocked) {
                    skinContainer.setStrokeStyle(2, 0x888888); // Gray border for unlocked
                } else {
                    skinContainer.setStrokeStyle(1, 0x555555); // Dark border for locked
                }
                this.lockerCharElements.push(skinContainer);
                
                // Character skin sprite (left side of container)
                const spriteX = columnX - (columnWidth / 2) + 25;
                const skinSprite = this.createSkinPreview(spriteX, skinY, charKey, skinType, isUnlocked, isEquipped);
                this.lockerCharElements.push(skinSprite);
                
                // Skin label (centered in container with shorter text)
                const labelX = columnX + 5;
                
                // Get shorter skin name to fit in container
                let displayName = CharacterSpriteHelper.getSkinDisplayName(skinType).toUpperCase();
                if (displayName === 'BRONZE') displayName = 'BRONZ';
                if (displayName === 'SILVER') displayName = 'SILVR';
                if (displayName === 'SHADOW') displayName = 'SHDW';
                // GOLD and BASE are already short enough
                
                const skinLabel = this.add.text(columnX, skinY - 12, displayName, {
                    fontSize: '11px',
                    fontStyle: 'bold',
                    fill: isUnlocked ? '#ffffff' : '#666666',
                    stroke: '#000000',
                    strokeThickness: 1
                }).setOrigin(0.5, 0.5);
                this.lockerCharElements.push(skinLabel);
                
                // Status indicator below label with improved spacing and shorter text
                let statusText = '';
                let statusColor = '#cccccc';
                
                if (isEquipped) {
                    statusText = 'EQUIP';
                    statusColor = '#00ff00';
                } else if (isUnlocked) {
                    statusText = 'READY';
                    statusColor = '#ffffff';
                } else {
                    const requiredXP = XP_SYSTEM.XP_THRESHOLDS[Object.keys(XP_SYSTEM.SKIN_TYPES).find(k => XP_SYSTEM.SKIN_TYPES[k] === skinType) - 1];
                    statusText = `${requiredXP} XP`;
                    statusColor = '#ff6666';
                }
                
                const statusLabel = this.add.text(columnX, skinY + 15, statusText, {
                    fontSize: '8px',
                    fontStyle: 'bold',
                    fill: statusColor,
                    stroke: '#000000',
                    strokeThickness: 1
                }).setOrigin(0.5, 0.5);
                this.lockerCharElements.push(statusLabel);
                
                // Add click handler for unlocked skins
                if (isUnlocked) {
                    skinContainer.setInteractive();
                    skinContainer.on('pointerdown', () => {
                        SoundManager.playForwardButton(this);
                        this.equipSkin(playerId, charKey, skinType);
                    });
                    
                    // Add hover effect
                    skinContainer.on('pointerover', () => {
                        skinContainer.setFillStyle(0x252525, 0.95);
                    });
                    skinContainer.on('pointerout', () => {
                        skinContainer.setFillStyle(0x1a1a1a, 0.95);
                    });
                }
            });
        });
    }
    
    createSkinPreview(x, y, charKey, skinType, isUnlocked, isEquipped) {
        const character = CHARACTERS[charKey];
        const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
        
        let preview;
        
        // Try to load actual skin sprite from skins directory
        const skinSpritePath = `${charKey}_${skinType}`;
        
        if (this.textures.exists(skinSpritePath)) {
            // Use actual skin sprite
            preview = this.add.image(x, y, skinSpritePath);
            preview.setScale(1.0).setOrigin(0.5);
        } else if (this.textures.exists(`${charKey}_preview`)) {
            // Fallback to character preview with skin tint
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                preview = this.add.image(x, y, `${charKey}_preview`);
                preview.setScale(0.9).setOrigin(0.5).setFrame(0);
            } else {
                preview = this.add.image(x, y, `${charKey}_preview`);
                preview.setScale(1.1).setOrigin(0.5);
            }
        } else {
            // Final fallback to colored rectangle
            preview = this.add.rectangle(x, y, 20, 20, character.color, 0.8);
        }
        
        // Apply skin visual effects
        if (isUnlocked) {
            if (skinType !== 'base' && !this.textures.exists(skinSpritePath)) {
                // Apply skin tint only if not using actual skin sprite
                const skinColor = CharacterSpriteHelper.getSkinRarityColor(skinType);
                preview.setTint(skinColor);
            }
            preview.setAlpha(1.0);
        } else {
            // Locked skin appearance
            preview.setTint(0x333333);
            preview.setAlpha(0.4);
        }
        
        // Add visual feedback for equipped skin
        if (isEquipped) {
            // Add subtle pulsing animation to equipped skin
            this.tweens.add({
                targets: preview,
                alpha: { from: 1, to: 0.7 },
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });
        }
        
        return preview;
    }
    
    equipSkin(playerId, charKey, skinType) {
        const success = PLAYER_PROGRESS.equipSkin(playerId, charKey, skinType);
        
        if (success) {
            console.log(`${playerId} equipped ${skinType} skin for ${charKey}`);
            
            // Update local progress
            if (playerId === 'player1') {
                player1Progress = PLAYER_PROGRESS.loadPlayerProgress('player1');
            } else {
                player2Progress = PLAYER_PROGRESS.loadPlayerProgress('player2');
            }
            
            // Close and reopen locker to refresh display
            this.closeLocker();
            this.openLocker(playerId);
            
            // Update the character selection display
            this.updateCharacterSelectionDisplay();
        }
    }
    
    // Info Panel Methods
    openInfoPanel() {
        if (this.infoPanelOpen || this.lockerOpen) return;
        
        this.infoPanelOpen = true;
        this.infoCurrentTab = 'tutorial';
        
        // Get screen dimensions for responsive layout
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // Calculate responsive modal size (80% of screen, max 700x500)
        const modalWidth = Math.min(700, screenWidth * 0.85);
        const modalHeight = Math.min(500, screenHeight * 0.85);
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;
        
        // Create backdrop
        this.infoBackdrop = this.add.rectangle(centerX, centerY, screenWidth, screenHeight, 0x000000, 0.8);
        this.infoBackdrop.setInteractive();
        this.infoBackdrop.on('pointerdown', () => this.closeInfoPanel());
        
        // Create main panel - responsive and centered
        this.infoPanel = this.add.rectangle(centerX, centerY, modalWidth, modalHeight, 0x000000, 0.95);
        this.infoPanel.setStrokeStyle(4, 0xff00ff);
        this.infoPanel.setInteractive();
        
        // Calculate positions relative to modal
        const modalTop = centerY - modalHeight / 2;
        const modalLeft = centerX - modalWidth / 2;
        const modalRight = centerX + modalWidth / 2;
        
        // Title - responsive positioning
        this.infoPanelTitle = this.add.text(centerX, modalTop + 40, 'GAME INFO', {
            fontSize: Math.min(36, modalWidth / 20) + 'px',
            fontStyle: 'bold',
            fill: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Tab buttons - responsive positioning and sizing
        const tabWidth = Math.min(140, modalWidth / 5);
        const tabY = modalTop + 80;
        const tabSpacing = modalWidth / 4;
        
        this.tutorialTab = this.add.rectangle(centerX - tabSpacing / 2, tabY, tabWidth, 40, 0x000000, 0.9);
        this.tutorialTab.setStrokeStyle(3, 0xff00ff);
        this.tutorialTabText = this.add.text(centerX - tabSpacing / 2, tabY, 'TUTORIAL', {
            fontSize: Math.min(18, modalWidth / 40) + 'px',
            fontStyle: 'bold',
            fill: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.tutorialTab.setInteractive();
        this.tutorialTab.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.switchInfoTab('tutorial');
        });
        
        this.charactersTab = this.add.rectangle(centerX + tabSpacing / 2, tabY, tabWidth, 40, 0x000000, 0.9);
        this.charactersTab.setStrokeStyle(3, 0x666666);
        this.charactersTabText = this.add.text(centerX + tabSpacing / 2, tabY, 'CHARACTERS', {
            fontSize: Math.min(18, modalWidth / 40) + 'px',
            fontStyle: 'bold',
            fill: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.charactersTab.setInteractive();
        this.charactersTab.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.switchInfoTab('characters');
        });
        
        // Close button - responsive positioning
        this.infoCloseBtn = this.add.rectangle(modalRight - 50, modalTop + 40, 80, 40, 0x000000, 0.9);
        this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
        this.infoCloseBtn.setInteractive();
        this.infoCloseBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.closeInfoPanel();
        });
        this.infoCloseText = this.add.text(modalRight - 50, modalTop + 40, 'CLOSE', {
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add hover effects
        this.infoCloseBtn.on('pointerover', () => {
            this.infoCloseBtn.setFillStyle(0x330000, 0.9);
            this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
            this.infoCloseText.setStyle({ fill: '#ffffff' });
        });
        this.infoCloseBtn.on('pointerout', () => {
            this.infoCloseBtn.setFillStyle(0x000000, 0.9);
            this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
            this.infoCloseText.setStyle({ fill: '#ff0000' });
        });
        
        // Store modal dimensions for content creation
        this.modalDimensions = {
            width: modalWidth,
            height: modalHeight,
            centerX: centerX,
            centerY: centerY,
            top: modalTop,
            left: modalLeft,
            right: modalRight,
            contentTop: modalTop + 120,
            contentHeight: modalHeight - 140
        };
        
        // Store panel elements
        this.infoPanelElements = [
            this.infoBackdrop,
            this.infoPanel,
            this.infoPanelTitle,
            this.tutorialTab,
            this.tutorialTabText,
            this.charactersTab,
            this.charactersTabText,
            this.infoCloseBtn,
            this.infoCloseText
        ];
        
        // Create initial content
        this.updateInfoContent();
    }
    
    closeInfoPanel() {
        if (!this.infoPanelOpen) return;
        
        this.infoPanelOpen = false;
        
        // Destroy all panel elements
        this.infoPanelElements.forEach(element => {
            if (element) element.destroy();
        });
        this.infoPanelElements = [];
        
        // Destroy content elements
        if (this.infoContentElements) {
            this.infoContentElements.forEach(element => {
                if (element) element.destroy();
            });
            this.infoContentElements = [];
        }
        
        // Clear modal dimensions
        this.modalDimensions = null;
    }
    
    switchInfoTab(tab) {
        if (this.infoCurrentTab === tab) return;
        
        this.infoCurrentTab = tab;
        
        // Update tab appearance - responsive arcade style
        if (tab === 'tutorial') {
            this.tutorialTab.setFillStyle(0x000000, 0.9);
            this.tutorialTab.setStrokeStyle(3, 0xff00ff);
            this.tutorialTabText.setStyle({ fill: '#ff00ff' });
            this.charactersTab.setFillStyle(0x000000, 0.9);
            this.charactersTab.setStrokeStyle(3, 0x666666);
            this.charactersTabText.setStyle({ fill: '#aaaaaa' });
        } else {
            this.tutorialTab.setFillStyle(0x000000, 0.9);
            this.tutorialTab.setStrokeStyle(3, 0x666666);
            this.tutorialTabText.setStyle({ fill: '#aaaaaa' });
            this.charactersTab.setFillStyle(0x000000, 0.9);
            this.charactersTab.setStrokeStyle(3, 0xff00ff);
            this.charactersTabText.setStyle({ fill: '#ff00ff' });
        }
        
        // Update content
        this.updateInfoContent();
    }
    
    updateInfoContent() {
        // Clear existing content
        if (this.infoContentElements) {
            this.infoContentElements.forEach(element => {
                if (element) element.destroy();
            });
        }
        this.infoContentElements = [];
        
        if (this.infoCurrentTab === 'tutorial') {
            this.createTutorialContent();
        } else {
            this.createCharactersContent();
        }
    }
    
    createTutorialContent() {
        const modal = this.modalDimensions;
        
        // Calculate content area with generous padding
        const contentWidth = modal.width - 60;
        const contentHeight = modal.contentHeight;
        const contentCenterX = modal.centerX;
        const contentTop = modal.contentTop;
        
        // Create content background
        const contentBg = this.add.rectangle(contentCenterX, contentTop + contentHeight / 2, contentWidth, contentHeight, 0x0f0f0f, 0.95);
        contentBg.setStrokeStyle(2, 0x444444);
        this.infoContentElements.push(contentBg);
        
        // Calculate 2x2 grid layout with proper spacing
        const gridGap = 20; // 20px gap between boxes
        const gridPadding = 20; // 20px padding from edges
        
        // Calculate box dimensions to fit 2x2 grid with gaps
        const availableWidth = contentWidth - (gridPadding * 2) - gridGap;
        const availableHeight = contentHeight - (gridPadding * 2) - gridGap;
        
        const boxWidth = availableWidth / 2;
        const boxHeight = availableHeight / 2;
        
        // Calculate grid positions
        const leftX = contentCenterX - (availableWidth / 2) + (boxWidth / 2);
        const rightX = contentCenterX + (availableWidth / 2) - (boxWidth / 2);
        const topY = contentTop + gridPadding + (boxHeight / 2);
        const bottomY = contentTop + gridPadding + boxHeight + gridGap + (boxHeight / 2);
        
        // Section data for 2x2 grid
        const sections = [
            {
                title: 'CONTROLS',
                text: '• Player 1: WASD to move, E to use power\n• Player 2: Arrow keys to move, K to use power\n• R to restart, C to return to character selection',
                x: leftX,
                y: topY
            },
            {
                title: 'OBJECTIVE',
                text: '• Score goals or win in Fight Mode\n• Use powers after they charge (15s or 2 goals)\n• First to 3 goals or highest score in 60s wins',
                x: rightX,
                y: topY
            },
            {
                title: 'XP + PROGRESSION',
                text: '• Win matches to earn XP\n• XP unlocks new skins with visual upgrades\n• Some skins provide faster cooldowns\n• Progress saved via browser localStorage',
                x: leftX,
                y: bottomY
            },
            {
                title: 'FIGHT MODE',
                text: '• Optional bonus round after matches\n• Blast powers knock back opponents\n• First to deplete HP wins\n• Press F after matches to start',
                x: rightX,
                y: bottomY
            }
        ];
        
        // Create each section in the 2x2 grid
        sections.forEach(section => {
            // Section background panel (slightly lighter than modal background)
            const sectionPanel = this.add.rectangle(section.x, section.y, boxWidth - 10, boxHeight - 10, 0x1a1a1a, 0.9);
            sectionPanel.setStrokeStyle(2, 0x333333);
            this.infoContentElements.push(sectionPanel);
            
            // Section title (bold yellow, centered at top)
            const sectionTitle = this.add.text(section.x, section.y - (boxHeight / 2) + 25, section.title, {
                fontSize: '14px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);
            this.infoContentElements.push(sectionTitle);
            
            // Section text (white bullet points with padding)
            const sectionText = this.add.text(section.x, section.y + 10, section.text, {
                fontSize: '11px',
                fontStyle: 'bold',
                fill: '#ffffff',
                lineSpacing: 4,
                align: 'left',
                wordWrap: { width: boxWidth - 30, useAdvancedWrap: true }
            }).setOrigin(0.5);
            this.infoContentElements.push(sectionText);
        });
    }
    
    createCharactersContent() {
        const modal = this.modalDimensions;
        
        // Calculate content area with padding
        const contentWidth = modal.width - 60;
        const contentHeight = modal.contentHeight;
        const contentCenterX = modal.centerX;
        const contentTop = modal.contentTop;
        
        // Create content background
        const contentBg = this.add.rectangle(contentCenterX, contentTop + contentHeight / 2, contentWidth, contentHeight, 0x0f0f0f, 0.95);
        contentBg.setStrokeStyle(2, 0x444444);
        this.infoContentElements.push(contentBg);
        
        // Calculate 3x2 grid layout with proper spacing
        const gridCols = 3;
        const gridRows = 2;
        const gridGap = 15; // Gap between boxes
        const gridPadding = 20; // Padding from edges
        
        // Calculate box dimensions for 3x2 grid
        const availableWidth = contentWidth - (gridPadding * 2) - (gridGap * (gridCols - 1));
        const availableHeight = contentHeight - (gridPadding * 2) - (gridGap * (gridRows - 1));
        
        const boxWidth = availableWidth / gridCols;
        const boxHeight = availableHeight / gridRows;
        
        // Calculate starting position for grid
        const startX = contentCenterX - (availableWidth / 2) + (boxWidth / 2);
        const startY = contentTop + gridPadding + (boxHeight / 2);
        
        // Character data with updated descriptions
        const characterData = [
            {
                key: 'blaze',
                name: 'BLAZE',
                power: 'Fire Kick',
                description: 'Devastating horizontal fire ball that knocks back undefended enemies'
            },
            {
                key: 'frostbite',
                name: 'FROSTBITE',
                power: 'Ice Freeze',
                description: 'Soccer: Snowball projectile creates ice cocoon freeze. Fight: Standard ice blast'
            },
            {
                key: 'volt',
                name: 'VOLT',
                power: 'Lightning Dash',
                description: 'Dashes forward knocking enemies up and boosting ball speed'
            },
            {
                key: 'jellyhead',
                name: 'JELLYHEAD',
                power: 'Jelly Slow',
                description: 'Shoots purple jelly that slows opponents to 30% speed'
            },
            {
                key: 'brick',
                name: 'BRICK',
                power: 'Immunity',
                description: 'Immune to all attacks for 5 seconds'
            },
            {
                key: 'whirlwind',
                name: 'WHIRLWIND',
                power: 'Air Spin',
                description: 'Controls air currents to redirect the ball'
            }
        ];
        
        // Create each character box in 3x2 grid
        characterData.forEach((charData, index) => {
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            
            const charX = startX + (col * (boxWidth + gridGap));
            const charY = startY + (row * (boxHeight + gridGap));
            
            // Character panel background
            const charPanel = this.add.rectangle(charX, charY, boxWidth - 5, boxHeight - 5, 0x1a1a1a, 0.9);
            charPanel.setStrokeStyle(2, 0x333333);
            charPanel.setInteractive();
            this.infoContentElements.push(charPanel);
            
            // Add hover effect for polish
            charPanel.on('pointerover', () => {
                charPanel.setFillStyle(0x252525, 0.9);
            });
            charPanel.on('pointerout', () => {
                charPanel.setFillStyle(0x1a1a1a, 0.9);
            });
            
            // Power sprites removed for cleaner layout
            
            // Large character sprite in top center
            const mainSpriteX = charX;
            const mainSpriteY = charY - (boxHeight / 4);
            
            let charSprite;
            if (this.textures.exists(`${charData.key}_preview`)) {
                charSprite = this.add.image(mainSpriteX, mainSpriteY, `${charData.key}_preview`);
                const character = CHARACTERS[charData.key];
                const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
                
                // Increase size of all character sprites
                let scale;
                if (charData.key === 'brick' || charData.key === 'jellyhead' || charData.key === 'whirlwind') {
                    scale = spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation) ? 3.2 : 3.5;
                } else {
                    scale = spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation) ? 2.5 : 2.8;
                }
                
                if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                    charSprite.setScale(scale).setOrigin(0.5).setFrame(0);
                } else {
                    charSprite.setScale(scale).setOrigin(0.5);
                }
            } else {
                const character = CHARACTERS[charData.key];
                charSprite = this.add.rectangle(mainSpriteX, mainSpriteY, 32, 32, character.color);
                charSprite.setScale(2.2);
            }
            this.infoContentElements.push(charSprite);
            
            // Text section at bottom - calculate positions from bottom up
            const bottomY = charY + (boxHeight / 2) - 10;
            
            // Description (white text, wrapped) - at bottom
            const descWidth = boxWidth - 20;
            const description = this.add.text(charX, bottomY, charData.description, {
                fontSize: Math.min(12, boxWidth / 22) + 'px',
                fontStyle: 'normal',
                fill: '#ffffff',
                wordWrap: { width: descWidth, useAdvancedWrap: true },
                lineSpacing: 2,
                align: 'center'
            }).setOrigin(0.5, 1);
            this.infoContentElements.push(description);
            
            // Power name (bold yellow) - above description
            const powerY = description.y - description.displayHeight - 5;
            const powerName = this.add.text(charX, powerY, charData.power, {
                fontSize: Math.min(11, boxWidth / 22) + 'px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5, 1);
            this.infoContentElements.push(powerName);
            
            // Character name (bold white) - above power name
            const nameY = powerName.y - powerName.displayHeight - 3;
            const charName = this.add.text(charX, nameY, charData.name, {
                fontSize: Math.min(12, boxWidth / 20) + 'px',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5, 1);
            this.infoContentElements.push(charName);
        });
    }
    
    getCharacterIcon(characterKey) {
        const icons = {
            'blaze': '🔥',
            'frostbite': '❄️',
            'volt': '⚡',
            'jellyhead': '🟣',
            'brick': '🧱',
            'whirlwind': '🌪️'
        };
        return icons[characterKey] || '⭐';
    }
    
    updateCharacterSelectionDisplay() {
        // Update the character previews in the selection screen with equipped skins
        this.player1Grid.forEach((display, index) => {
            const charKey = this.characterKeys[index];
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', charKey);
            
            // Update sprite tint
            display.sprite.clearTint();
            if (equippedSkin !== 'base') {
                display.sprite.setTint(CharacterSpriteHelper.getSkinRarityColor(equippedSkin));
            }
        });
        
        this.player2Grid.forEach((display, index) => {
            const charKey = this.characterKeys[index];
            const equippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', charKey);
            
            // Update sprite tint
            display.sprite.clearTint();
            if (equippedSkin !== 'base') {
                display.sprite.setTint(CharacterSpriteHelper.getSkinRarityColor(equippedSkin));
            }
        });
    }
    
    closeLocker() {
        if (!this.lockerOpen) return;
        
        this.lockerOpen = false;
        this.currentLockerPlayer = null;
        
        // Clean up locker elements
        if (this.lockerElements) {
            this.lockerElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.lockerElements = [];
        }
        
        // Clean up character elements
        if (this.lockerCharElements) {
            this.lockerCharElements.forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.lockerCharElements = [];
        }
        
        // Clean up any other locker-related elements
        if (this.lockerBackdrop) this.lockerBackdrop.destroy();
        if (this.lockerPanel) this.lockerPanel.destroy();
        if (this.lockerTitle) this.lockerTitle.destroy();
        if (this.lockerXPInfo) this.lockerXPInfo.destroy();
        if (this.lockerCloseBtn) this.lockerCloseBtn.destroy();
    }

    confirmPlayer1Selection() {
        SoundManager.playForwardButton(this);
        this.player1Confirmed = true;
        selectedCharacters.player1 = this.characterKeys[this.player1Selection];
        this.updateDisplay();
        this.checkBothPlayersReady();
    }

    cancelPlayer1Selection() {
        this.player1Confirmed = false;
        selectedCharacters.player1 = null;
        this.updateDisplay();
    }

    confirmPlayer2Selection() {
        SoundManager.playForwardButton(this);
        this.player2Confirmed = true;
        selectedCharacters.player2 = this.characterKeys[this.player2Selection];
        this.updateDisplay();
        this.checkBothPlayersReady();
    }

    cancelPlayer2Selection() {
        this.player2Confirmed = false;
        selectedCharacters.player2 = null;
        this.updateDisplay();
    }

    checkBothPlayersReady() {
        if (this.player1Confirmed && this.player2Confirmed) {
            // Show "Starting match..." message - arcade style (better positioning)
            this.add.text(400, 570, 'STARTING MATCH...', {
                fontSize: '28px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#ff0000',
                strokeThickness: 3,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
            }).setOrigin(0.5);

            // Wait a moment then start game mode selection
            this.time.delayedCall(1500, () => {
                this.scene.start('GameModesScene');
            });
        }
    }
}

// Game Modes Scene
class GameModesScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameModesScene' });
        this.selectedMode = 'soccer'; // Default to soccer mode
        this.selectedConfig = 0; // Default to first config option
    }

    create() {
        // Arcade-style gradient background (match Character Selection)
        this.add.rectangle(400, 300, 800, 600, 0x000000);
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Arcade border frame (match Character Selection)
        this.add.rectangle(400, 300, 790, 590, 0x000000, 0).setStrokeStyle(6, 0x00ffff);
        this.add.rectangle(400, 300, 770, 570, 0x000000, 0).setStrokeStyle(2, 0xff00ff);

        // Arcade-style title (match CHARACTER SELECTION styling)
        this.add.text(400, 40, 'SELECT GAME MODE', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Title underline (match Character Selection)
        this.add.rectangle(400, 60, 500, 3, 0x00ffff);

        // Back button (top-left corner, matching Info button style)
        this.backBtn = this.add.rectangle(85, 50, 100, 32, 0x000000, 0.9);
        this.backBtn.setStrokeStyle(3, 0x00ffff);
        this.backBtnText = this.add.text(85, 50, 'BACK', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#00ffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.backBtn.setInteractive();
        this.backBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.goBackToCharacterSelection();
        });
        
        // Add hover effects
        this.backBtn.on('pointerover', () => {
            this.backBtn.setFillStyle(0x003333, 0.9);
            this.backBtn.setStrokeStyle(3, 0x00ffff);
            this.backBtnText.setStyle({ fill: '#ffffff' });
        });
        this.backBtn.on('pointerout', () => {
            this.backBtn.setFillStyle(0x000000, 0.9);
            this.backBtn.setStrokeStyle(3, 0x00ffff);
            this.backBtnText.setStyle({ fill: '#00ffff' });
        });

        // Create mode toggle tabs
        this.createModeToggleTabs();

        // Create match configuration options
        this.createMatchOptions();

        // Create continue button
        this.createContinueButton();

        // Setup keyboard controls
        this.setupControls();

        // Preload sound effects
        SoundManager.preloadSounds(this);
    }

    createModeToggleTabs() {
        // Soccer Mode Tab
        this.soccerTabBg = this.add.rectangle(250, 120, 200, 50, 0x000000, 0.9);
        this.soccerTabBg.setStrokeStyle(4, 0x00ff00);
        this.soccerTabBg.setInteractive();
        
        this.soccerTabText = this.add.text(250, 120, 'SOCCER MODE', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Fight Mode Tab
        this.fightTabBg = this.add.rectangle(550, 120, 200, 50, 0x000000, 0.9);
        this.fightTabBg.setStrokeStyle(4, 0x666666);
        this.fightTabBg.setInteractive();
        
        this.fightTabText = this.add.text(550, 120, 'FIGHT MODE', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#666666',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Add click handlers
        this.soccerTabBg.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            this.selectMode('soccer');
        });
        this.fightTabBg.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            this.selectMode('fight');
        });

        // Add hover effects
        this.soccerTabBg.on('pointerover', () => {
            if (this.selectedMode !== 'soccer') {
                this.soccerTabBg.setFillStyle(0x001100, 0.9);
            }
        });
        this.soccerTabBg.on('pointerout', () => {
            if (this.selectedMode !== 'soccer') {
                this.soccerTabBg.setFillStyle(0x000000, 0.9);
            }
        });

        this.fightTabBg.on('pointerover', () => {
            if (this.selectedMode !== 'fight') {
                this.fightTabBg.setFillStyle(0x330000, 0.9);
            }
        });
        this.fightTabBg.on('pointerout', () => {
            if (this.selectedMode !== 'fight') {
                this.fightTabBg.setFillStyle(0x000000, 0.9);
            }
        });
    }

    createMatchOptions() {
        // Create containers for options (initially empty)
        this.optionElements = [];
        this.updateMatchOptions();
    }

    updateMatchOptions() {
        // Clear existing options
        this.optionElements.forEach(element => element.destroy());
        this.optionElements = [];

        const configs = this.selectedMode === 'soccer' ? 
            [
                { time: 60, limit: 3, text: '60 SECONDS • 3 GOALS' },
                { time: 90, limit: 5, text: '90 SECONDS • 5 GOALS' },
                { time: 120, limit: 7, text: '2 MINUTES • 7 GOALS' }
            ] : 
            [
                { time: 60, limit: 3, text: '60 SECONDS • 3 HEARTS' },
                { time: 90, limit: 5, text: '90 SECONDS • 5 HEARTS' },
                { time: 120, limit: 7, text: '2 MINUTES • 7 HEARTS' }
            ];

        configs.forEach((config, index) => {
            const y = 220 + (index * 70);
            const isSelected = index === this.selectedConfig;
            
            // Option background
            const optionBg = this.add.rectangle(400, y, 400, 50, 0x000000, 0.9);
            optionBg.setStrokeStyle(4, isSelected ? 0x00ff00 : 0xffff00);
            optionBg.setInteractive();
            
            // Option text
            const optionText = this.add.text(400, y, config.text, {
                fontSize: '18px',
                fontStyle: 'bold',
                fill: isSelected ? '#00ff00' : '#ffff00',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
            }).setOrigin(0.5);

            // Add click handler
            optionBg.on('pointerdown', () => {
                SoundManager.playForwardButton(this);
                this.selectConfig(index);
            });

            // Add hover effects
            optionBg.on('pointerover', () => {
                if (index !== this.selectedConfig) {
                    optionBg.setFillStyle(0x333300, 0.9);
                    optionText.setStyle({ fill: '#ffffff' });
                }
            });
            optionBg.on('pointerout', () => {
                if (index !== this.selectedConfig) {
                    optionBg.setFillStyle(0x000000, 0.9);
                    optionText.setStyle({ fill: '#ffff00' });
                }
            });

            this.optionElements.push(optionBg, optionText);
        });
    }

    selectMode(mode) {
        this.selectedMode = mode;
        this.selectedConfig = 0; // Reset to first config when switching modes

        // Update tab styling
        if (mode === 'soccer') {
            this.soccerTabBg.setStrokeStyle(4, 0x00ff00);
            this.soccerTabBg.setFillStyle(0x001100, 0.9);
            this.soccerTabText.setStyle({ fill: '#00ff00' });
            
            this.fightTabBg.setStrokeStyle(4, 0x666666);
            this.fightTabBg.setFillStyle(0x000000, 0.9);
            this.fightTabText.setStyle({ fill: '#666666' });
        } else {
            this.fightTabBg.setStrokeStyle(4, 0xff0000);
            this.fightTabBg.setFillStyle(0x330000, 0.9);
            this.fightTabText.setStyle({ fill: '#ff0000' });
            
            this.soccerTabBg.setStrokeStyle(4, 0x666666);
            this.soccerTabBg.setFillStyle(0x000000, 0.9);
            this.soccerTabText.setStyle({ fill: '#666666' });
        }

        // Update match options
        this.updateMatchOptions();
    }

    selectConfig(index) {
        this.selectedConfig = index;
        this.updateMatchOptions();
    }

    createContinueButton() {
        // Create continue button (match MAP SELECTION "START MATCH" button styling)
        this.continueButtonBg = this.add.rectangle(400, 500, 320, 60, 0x000000, 0.9);
        this.continueButtonBg.setStrokeStyle(4, 0xffff00);
        this.continueButtonBg.setInteractive();
        
        this.continueButton = this.add.text(400, 500, 'CONTINUE', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        this.continueButtonBg.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            this.continueToMapSelection();
        });

        this.continueButtonBg.on('pointerover', () => {
            this.continueButtonBg.setFillStyle(0x333300, 0.9);
            this.continueButtonBg.setStrokeStyle(4, 0xffff00);
            this.continueButton.setStyle({ fill: '#ffffff' });
        });

        this.continueButtonBg.on('pointerout', () => {
            this.continueButtonBg.setFillStyle(0x000000, 0.9);
            this.continueButtonBg.setStrokeStyle(4, 0xffff00);
            this.continueButton.setStyle({ fill: '#ffff00' });
        });
    }

    setupControls() {
        // Space key to continue
        this.input.keyboard.on('keydown-SPACE', () => {
            this.continueToMapSelection();
        });

        // Number keys to select config
        this.input.keyboard.on('keydown-ONE', () => this.selectConfig(0));
        this.input.keyboard.on('keydown-TWO', () => this.selectConfig(1));
        this.input.keyboard.on('keydown-THREE', () => this.selectConfig(2));

        // Tab key to switch modes
        this.input.keyboard.on('keydown-TAB', () => {
            this.selectMode(this.selectedMode === 'soccer' ? 'fight' : 'soccer');
        });
    }

    goBackToCharacterSelection() {
        this.scene.start('CharacterSelectionScene');
    }

    continueToMapSelection() {
        // Store selected game mode and settings
        selectedGameMode = this.selectedMode;
        
        const configs = this.selectedMode === 'soccer' ? 
            [
                { time: 60, goalLimit: 3, heartLimit: 3 },
                { time: 90, goalLimit: 5, heartLimit: 5 },
                { time: 120, goalLimit: 7, heartLimit: 7 }
            ] : 
            [
                { time: 60, goalLimit: 3, heartLimit: 3 },
                { time: 90, goalLimit: 5, heartLimit: 5 },
                { time: 120, goalLimit: 7, heartLimit: 7 }
            ];

        const selectedConfigData = configs[this.selectedConfig];
        selectedMatchSettings = {
            time: selectedConfigData.time,
            goalLimit: selectedConfigData.goalLimit,
            heartLimit: selectedConfigData.heartLimit
        };

        // Show loading message
        this.add.text(400, 550, 'LOADING...', {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Continue to map selection
        this.time.delayedCall(1000, () => {
            this.scene.start('MapSelectScene');
        });
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
        
        // Arcade-style gradient background (match Character Selection)
        this.add.rectangle(400, 300, 800, 600, 0x000000);
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Arcade border frame (match Character Selection)
        this.add.rectangle(400, 300, 790, 590, 0x000000, 0).setStrokeStyle(6, 0x00ffff);
        this.add.rectangle(400, 300, 770, 570, 0x000000, 0).setStrokeStyle(2, 0xff00ff);

        // Arcade-style title (match CHARACTER SELECTION styling)
        this.add.text(400, 40, 'MAP SELECTION', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Title underline (match Character Selection)
        this.add.rectangle(400, 60, 400, 3, 0x00ffff);

        // Back button (top-left corner, matching Info button style)
        this.backBtn = this.add.rectangle(85, 50, 100, 32, 0x000000, 0.9);
        this.backBtn.setStrokeStyle(3, 0x00ffff);
        this.backBtnText = this.add.text(85, 50, 'BACK', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#00ffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.backBtn.setInteractive();
        this.backBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.goBackToGameModes();
        });
        
        // Add hover effects
        this.backBtn.on('pointerover', () => {
            this.backBtn.setFillStyle(0x003333, 0.9);
            this.backBtn.setStrokeStyle(3, 0x00ffff);
            this.backBtnText.setStyle({ fill: '#ffffff' });
        });
        this.backBtn.on('pointerout', () => {
            this.backBtn.setFillStyle(0x000000, 0.9);
            this.backBtn.setStrokeStyle(3, 0x00ffff);
            this.backBtnText.setStyle({ fill: '#00ffff' });
        });

        // Instructions - arcade style (neon blue, smaller, centered)
        this.add.text(400, 95, 'CHOOSE YOUR BATTLEGROUND!', {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#00ffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Additional instruction for selection (neon blue, smaller)
        this.add.text(400, 120, 'CLICK ON A MAP TO SELECT IT', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#00ffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);

        // Create map thumbnails
        this.createMapThumbnails();

        // Create selected map status - arcade style (match character selection boxes)
        const initialMapName = this.selectedMapKey === 'nightcity' ? 'NIGHT CITY' : 
                             this.selectedMapKey === 'ch' ? 'CH' : 
                             this.selectedMapKey === 'skyline' ? 'SKYLINE' : 
                             this.selectedMapKey === 'nature' ? 'NATURE' : 
                             this.selectedMapKey === 'nighttree' ? 'NIGHT TREE' : 
                             this.selectedMapKey === 'outsideworld' ? 'OUTSIDE WORLD' : this.selectedMapKey.toUpperCase();
        
        // Create status background panel (match character selection style) - moved down for better spacing
        this.selectedMapBg = this.add.rectangle(400, 410, 320, 50, 0x000000, 0.9);
        this.selectedMapBg.setStrokeStyle(4, 0xffff00);
        
        this.selectedMapStatus = this.add.text(400, 410, `SELECTED: ${initialMapName}`, {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Create Start Match button
        this.createStartButton();
    }

    createMapThumbnails() {
        const mapConfigs = [
            // Top row - better spacing
            {
                key: 'nightcity',
                name: 'Night City',
                x: 200,
                y: 180,
                description: 'Neon-lit cityscape under starry night sky'
            },
            {
                key: 'ch',
                name: 'Ch',
                x: 400,
                y: 180,
                description: 'Action-packed urban battlefield'
            },
            {
                key: 'skyline',
                name: 'Skyline',
                x: 600,
                y: 180,
                description: 'Urban skyline cityscape'
            },
            // Bottom row - adjusted spacing for larger images and better layout flow
            {
                key: 'nature',
                name: 'Nature',
                x: 200,
                y: 290,
                description: 'Natural outdoor environment'
            },
            {
                key: 'nighttree',
                name: 'Night Tree',
                x: 400,
                y: 290,
                description: 'Mysterious forest under moonlight'
            },
            {
                key: 'outsideworld',
                name: 'Outside World',
                x: 600,
                y: 290,
                description: 'Vast outdoor landscape'
            }
        ];

        this.mapThumbnails = [];

        mapConfigs.forEach(config => {
            // Create clickable background for better interaction (invisible) - increased size for larger images
            const clickArea = this.add.rectangle(config.x, config.y, 190, 140, 0x000000, 0);
            clickArea.setInteractive();

            // Create thumbnail image (increased size for better visibility)
            const thumbnail = this.add.image(config.x, config.y, config.key);
            thumbnail.setScale(0.26); // Slightly bigger for better visibility
            thumbnail.setOrigin(0.5);
            thumbnail.setInteractive();

            // Create selection border around image only (initially hidden) with light blue glow effect (adjusted for larger images)
            const border = this.add.rectangle(config.x, config.y, 148, 85, 0x00ffff, 0);
            border.setStrokeStyle(4, 0x00ffff);
            border.setVisible(false);

            // Map name - arcade style (bold, yellow, centered, slightly larger)
            const nameText = this.add.text(config.x, config.y + 52, config.name.toUpperCase(), {
                fontSize: '18px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            // Map description - removed to prevent overlap
            const descText = null;

            // Click handlers for both thumbnail and click area
            const selectHandler = () => {
                console.log('Selected map:', config.key);
                SoundManager.playForwardButton(this);
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
                mapData.nameText.setStyle({ fill: '#ffff00' });
                mapData.thumbnail.clearTint();
            } else {
                // Unselected map styling
                mapData.border.setVisible(false);
                mapData.nameText.setStyle({ fill: '#ffff00' });
                mapData.thumbnail.clearTint();
            }
        });

        // Update start button text (simplified)
        if (this.startButton) {
            this.startButton.setText('START MATCH');
        }

        // Update selected map status
        if (this.selectedMapStatus) {
            const mapName = mapKey === 'nightcity' ? 'NIGHT CITY' : 
                          mapKey === 'ch' ? 'CH' : 
                          mapKey === 'skyline' ? 'SKYLINE' : 
                          mapKey === 'nature' ? 'NATURE' : 
                          mapKey === 'nighttree' ? 'NIGHT TREE' : 
                          mapKey === 'outsideworld' ? 'OUTSIDE WORLD' : mapKey.toUpperCase();
            this.selectedMapStatus.setText(`SELECTED: ${mapName}`);
        }
    }

    createStartButton() {
        const initialMapName = this.selectedMapKey === 'nightcity' ? 'NIGHT CITY' : 
                             this.selectedMapKey === 'ch' ? 'CH' : 
                             this.selectedMapKey === 'skyline' ? 'SKYLINE' : 
                             this.selectedMapKey === 'nature' ? 'NATURE' : 
                             this.selectedMapKey === 'nighttree' ? 'NIGHT TREE' : 
                             this.selectedMapKey === 'outsideworld' ? 'OUTSIDE WORLD' : this.selectedMapKey.toUpperCase();
        
        // Create button background (match character selection style) - moved down for better spacing
        this.startButtonBg = this.add.rectangle(400, 480, 320, 60, 0x000000, 0.9);
        this.startButtonBg.setStrokeStyle(4, 0xffff00);
        this.startButtonBg.setInteractive();
        
        this.startButton = this.add.text(400, 480, 'START MATCH', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        this.startButtonBg.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            this.startMatch();
        });

        this.startButtonBg.on('pointerover', () => {
            this.startButtonBg.setFillStyle(0x333300, 0.9);
            this.startButtonBg.setStrokeStyle(4, 0xffff00);
            this.startButton.setStyle({ fill: '#ffffff' });
        });

        this.startButtonBg.on('pointerout', () => {
            this.startButtonBg.setFillStyle(0x000000, 0.9);
            this.startButtonBg.setStrokeStyle(4, 0xffff00);
            this.startButton.setStyle({ fill: '#ffff00' });
        });
    }

    goBackToGameModes() {
        this.scene.start('GameModesScene');
    }

    startMatch() {
        // Show loading message - arcade style
        this.add.text(400, 550, 'LOADING MATCH...', {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Start the appropriate scene based on selected game mode
        this.time.delayedCall(1000, () => {
            if (selectedGameMode === 'fight') {
                // Pass the selected settings to FightScene
                const fightSettings = {
                    time: selectedMatchSettings.time,
                    heartLimit: selectedMatchSettings.heartLimit
                };
                this.scene.start('FightScene', fightSettings);
            } else {
                this.scene.start('GameScene');
            }
        });
    }
}

// Game Scene
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // **CRITICAL FIX**: Ensure clean texture loading for soccer mode
        console.log('🏈 GameScene preload - ensuring fresh sprite loading...');
        
        // Clear any fight mode textures that might interfere
        const fightTexturesToClear = [
            'fight_player1_idle', 'fight_player1_walk', 
            'fight_player2_idle', 'fight_player2_walk'
        ];
        
        fightTexturesToClear.forEach(key => {
            if (this.textures.exists(key)) {
                this.textures.remove(key);
                console.log(`🗑️ Cleared fight texture: ${key}`);
            }
        });
        
        // Clear existing soccer textures to force fresh loading
        const soccerTexturesToClear = [
            'player1_idle', 'player1_walk', 
            'player2_idle', 'player2_walk'
        ];
        
        soccerTexturesToClear.forEach(key => {
            if (this.textures.exists(key)) {
                this.textures.remove(key);
                console.log(`🔄 Cleared existing soccer texture for fresh reload: ${key}`);
            }
        });
        
        // Load selected background
        this.load.image(selectedMap, `assets/Sprites/Backgrounds/${selectedMap}.png`);

        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];

        // Get equipped skins
        const p1EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', selectedCharacters.player1);
        const p2EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', selectedCharacters.player2);

        // Load Player 1 character sprites with equipped skin
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

        // Load Player 2 character sprites with equipped skin
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

        // Store equipped skins for create method
        this.p1EquippedSkin = p1EquippedSkin;
        this.p2EquippedSkin = p2EquippedSkin;
    
        // Load grass ground texture
        this.load.image('grass', 'assets/Sprites/Backgrounds/grass.png');
    
        // Load pixel art soccer ball sprite
        this.load.image('ball', 'assets/Sprites/Ball/Sport-Balls-Asset-Pack-Pixel-Art/64x64/football.png');
        
        // Load goal sprite
        this.load.image('goalPost', 'assets/Sprites/goals/Head Ball/Assets/Sprites/porta.png');
        
        // Load Frostbite enhanced sprites for soccer mode - using correct dimensions
        console.log('🎨 Loading Frostbite sprites with correct dimensions...');
        
        // Load main snowball spritesheet (1536x771, 3x2 = 6 frames of 512x386)
        this.load.spritesheet('snowball_main', 
            'assets/Sprites/Powers/Frostbite/snowball/spritesheet/snowball_spritesheet_3x2.png',
            { frameWidth: 512, frameHeight: 386 }
        );
        
        // Load FreeIceCoolPack snowball (192x160, try different frame layouts)
        this.load.spritesheet('snowball_freecool', 
            'assets/Sprites/Powers/Frostbite/FreeIceCoolPack/Free/Sheets/SnowBall.png',
            { frameWidth: 32, frameHeight: 160 } // 6 frames of 32x160
        );
        
        // Load ice cocoon as sprite sheet (160x160 total, using 32x32 frames for 5x5 grid)
        this.load.spritesheet('ice_cocoon', 'assets/Sprites/Powers/Frostbite/FreeIceCoolPack/Free/Sheets/IceCocoon.png', {
            frameWidth: 32,
            frameHeight: 32
        });
        
        // Load Blaze fireball animation frames (60 individual PNG files)
        for (let i = 0; i < 60; i++) {
            this.load.image(`fireball_${i}`, `assets/Sprites/Powers/Blaze/Free pack 6/1/1_${i}.png`);
        }
        
        // Load Blaze fire column animation frames (14 individual PNG files)
        for (let i = 1; i <= 14; i++) {
            this.load.image(`fire_column_${i}`, `assets/Sprites/Powers/Blaze/pack_effect_fire_column/fire_column_medium/fire_column_medium_${i}.png`);
        }
        
        // Load JellyHead slime sheet (3rd row for animation)
        // Sprite sheet is 416x275, assuming 8 columns and 5 rows: 52x55 per frame
        this.load.spritesheet('jellyhead_slime', 
            'assets/Sprites/Powers/JellyHead/Slime-Sheet.png',
            { frameWidth: 52, frameHeight: 55 } // 416/8 = 52, 275/5 = 55
        );
        
        // Load Volt lightning sprite sheets for dash animation
        this.load.spritesheet('lightning_1', 
            'assets/Sprites/Powers/Volt/LightningFreePack/256/Lightning_1_256-sheet.png',
            { frameWidth: 256, frameHeight: 256 }
        );
        this.load.spritesheet('lightning_2', 
            'assets/Sprites/Powers/Volt/LightningFreePack/256/Lightning_2_256-sheet.png',
            { frameWidth: 256, frameHeight: 256 }
        );
        this.load.spritesheet('lightning_3', 
            'assets/Sprites/Powers/Volt/LightningFreePack/256/Lightning_3_256-sheet.png',
            { frameWidth: 256, frameHeight: 256 }
        );
        this.load.spritesheet('lightning_4', 
            'assets/Sprites/Powers/Volt/LightningFreePack/256/Lightning_4_256-sheet.png',
            { frameWidth: 256, frameHeight: 256 }
        );
        
        // Load WhirlWind energy sprite sheets for spin animation
        this.load.spritesheet('energy_1', 
            'assets/Sprites/Powers/WhirlWind/EnergyFreePack/No_compressed/128/Energy_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet('energy_2', 
            'assets/Sprites/Powers/WhirlWind/EnergyFreePack/No_compressed/128/Energy_2_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        this.load.spritesheet('energy_3', 
            'assets/Sprites/Powers/WhirlWind/EnergyFreePack/No_compressed/128/Energy_3_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Load Brick burst sprite sheet for immunity animation
        this.load.spritesheet('brick_burst', 
            'assets/Sprites/Powers/Brick/BurstFreePack/128/Burst_1_128.png',
            { frameWidth: 128, frameHeight: 128 }
        );

        // Load meteor sprite for chaos event
        this.load.image('meteor', 'assets/Sprites/Events/Meteor Drop/space/spr_big_meteor.png');

        // Preload sound effects
        SoundManager.preloadSounds(this);
    }

    calculatePowerCooldown(playerId) {
        // Get the equipped skin for this character
        const selectedCharacter = playerId === 'player1' ? selectedCharacters.player1 : selectedCharacters.player2;
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const equippedSkin = progress.equippedSkins[selectedCharacter] || 'base';
        
        // Shadow skin has special cooldown (5 seconds after using both charges)
        if (equippedSkin === 'shadow') {
            console.log(`🎮 ${playerId} Shadow Skin: 5s cooldown after double power`);
            return 5000; // 5 seconds for shadow skin
        }
        
        // Base cooldown is 15 seconds for non-shadow skins
        const baseCooldown = 15000;
        
        // Calculate cooldown reduction based on skin tier
        let cooldownReduction = 0;
        switch (equippedSkin) {
            case 'base':
                cooldownReduction = 0; // No reduction for base skin
                break;
            case 'bronze':
                cooldownReduction = 3000; // -3 seconds
                break;
            case 'silver':
                cooldownReduction = 6000; // -6 seconds
                break;
            case 'gold':
                cooldownReduction = 9000; // -9 seconds
                break;
            default:
                cooldownReduction = 0;
        }
        
        // Calculate final cooldown (minimum 1 second)
        const finalCooldown = Math.max(1000, baseCooldown - cooldownReduction);
        
        console.log(`🎮 ${playerId} Power Cooldown: ${finalCooldown/1000}s (${equippedSkin} skin: -${cooldownReduction/1000}s)`);
        
        return finalCooldown;
    }

    restorePlayerSkinTint(playerSprite, playerId) {
        // Get the selected character and equipped skin for this player
        const selectedCharacter = playerId === 'player1' ? selectedCharacters.player1 : selectedCharacters.player2;
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const equippedSkin = progress.equippedSkins[selectedCharacter] || 'base';
        
        // Clear any existing tint first
        playerSprite.clearTint();
        
        // Apply the equipped skin tint if it's not base
        if (equippedSkin !== 'base') {
            const skinColor = CharacterSpriteHelper.getSkinRarityColor(equippedSkin);
            playerSprite.setTint(skinColor);
        }
    }

    getInitialCharges(playerId) {
        // Get the selected character for this player
        const selectedCharacter = playerId === 'player1' ? selectedCharacters.player1 : selectedCharacters.player2;
        
        // Get the equipped skin for this character
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const equippedSkin = progress.equippedSkins[selectedCharacter] || 'base';
        
        // Shadow skin gets 2 charges, all others get 1
        if (equippedSkin === 'shadow') {
            console.log(`👤 ${playerId} Shadow Skin: 2 power charges!`);
            return 2;
        } else {
            return 1;
        }
    }

    create() {
        console.log('🚀 GameScene create() starting with COMPLETE reset...');
        
        // **CRITICAL FIX**: Reset physics world to prevent any carry-over from FightScene
        console.log('⚙️ Resetting physics world...');
        
        // Store current physics world configuration
        const currentGravity = { x: this.physics.world.gravity.x, y: this.physics.world.gravity.y };
        
        // Clear all existing bodies and colliders
        if (this.physics.world.colliders) {
            this.physics.world.colliders.destroy();
        }
        
        // Reset physics world completely
        this.physics.world.shutdown();
        this.physics.world.step(0); // Force a step to clear everything
        
        // Reinitialize physics world with fresh settings
        this.physics.world.gravity.set(currentGravity.x, currentGravity.y);
        
        console.log('✅ Physics world reset complete');

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
        this.matchTime = selectedMatchSettings.time;
        this.maxGoals = selectedMatchSettings.goalLimit;
        this.gameStartTime = Date.now();
        
        // Initialize clean power system
        this.powers = {
            player1: {
                ready: false,
                lastUsed: 0,
                cooldown: this.calculatePowerCooldown('player1'), // Dynamic cooldown based on skin
                goals: 0,
                immune: false,
                immuneUntil: 0,
                frozen: false,
                frozenUntil: 0,
                slowed: false,
                slowedUntil: 0,
                charges: this.getInitialCharges('player1'), // Shadow skin gets 2 charges
                maxCharges: this.getInitialCharges('player1')
            },
            player2: {
                ready: false,
                lastUsed: 0,
                cooldown: this.calculatePowerCooldown('player2'), // Dynamic cooldown based on skin
                goals: 0,
                immune: false,
                immuneUntil: 0,
                frozen: false,
                frozenUntil: 0,
                slowed: false,
                slowedUntil: 0,
                charges: this.getInitialCharges('player2'), // Shadow skin gets 2 charges
                maxCharges: this.getInitialCharges('player2')
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
            originalGravity: 600,  // Updated to match new global gravity
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
        
        // **VALIDATION**: Ensure character selections are valid
        if (!selectedCharacters.player1 || !selectedCharacters.player2) {
            console.error('🚨 Invalid character selection detected!', selectedCharacters);
            // Fallback to default characters
            selectedCharacters.player1 = selectedCharacters.player1 || 'blaze';
            selectedCharacters.player2 = selectedCharacters.player2 || 'frostbite';
            console.log('🔧 Using fallback characters:', selectedCharacters);
        }
        
        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
        
        console.log(`🎮 GameScene starting with: P1=${selectedCharacters.player1}, P2=${selectedCharacters.player2}`);
    
        // Create ground using grass texture
        const ground = this.add.image(400, 575, 'grass');
        ground.setOrigin(0.5, 0.5); // Center the image
        ground.setDisplaySize(800, 50); // Stretch to full screen width and maintain 50px height
        this.physics.add.existing(ground, true);
        
        // **CRITICAL FIX**: Completely destroy existing players before creating fresh ones
        console.log('🏃 Destroying any existing player sprites...');
        
        if (this.player1) {
            console.log('🗑️ Destroying existing player1 sprite');
            this.player1.destroy(true); // true = destroy texture
            this.player1 = null;
        }
        
        if (this.player2) {
            console.log('🗑️ Destroying existing player2 sprite');
            this.player2.destroy(true); // true = destroy texture
            this.player2 = null;
        }
        
        // Small delay to ensure complete destruction
        this.time.delayedCall(10, () => {
            console.log('🏃 Creating completely fresh player sprites for soccer mode...');
            
            // Create Player 1 with selected character sprite - completely fresh
            this.player1 = this.physics.add.sprite(200, 450, 'player1_idle');
            this.setupPlayerPhysics(this.player1, p1SpriteConfig, this.p1EquippedSkin);
            
            // Create Player 2 with selected character sprite - completely fresh
            this.player2 = this.physics.add.sprite(600, 450, 'player2_idle');
            this.setupPlayerPhysics(this.player2, p2SpriteConfig, this.p2EquippedSkin);
            
            console.log('✅ Fresh player sprites created successfully');
            
            // Continue with the rest of the setup after players are created
            this.finishGameSetup(p1SpriteConfig, p2SpriteConfig);
        });
    }
    
    finishGameSetup(p1SpriteConfig, p2SpriteConfig) {
        console.log('🔧 Finishing GameScene setup after fresh player creation...');
        
        // Create animations for both players
        this.createPlayerAnimations(p1SpriteConfig, p2SpriteConfig);
        
        // Store ground reference for collision setup
        this.ground = this.add.image(400, 575, 'grass');
        this.ground.setOrigin(0.5, 0.5);
        this.ground.setDisplaySize(800, 50);
        this.physics.add.existing(this.ground, true);
        
        // Debug loaded textures
        console.log('🔍 Checking loaded textures...');
        console.log('Snowball main exists:', this.textures.exists('snowball_main'));
        console.log('Snowball freecool exists:', this.textures.exists('snowball_freecool'));
        console.log('Ice cocoon exists:', this.textures.exists('ice_cocoon'));
        
        // Create Frostbite snowball animations with correct frame counts
        console.log('🎬 Creating snowball animations...');
        
        // Create main snowball animation (6 frames: 0-5)
        if (this.textures.exists('snowball_main') && !this.anims.exists('snowball_roll')) {
            try {
                this.anims.create({
                    key: 'snowball_roll',
                    frames: this.anims.generateFrameNumbers('snowball_main', { start: 0, end: 5 }),
                    frameRate: 12,
                    repeat: -1
                });
                console.log('✅ Main snowball animation created (6 frames)');
            } catch (error) {
                console.error('❌ Failed to create main snowball animation:', error.message);
            }
        } else if (this.anims.exists('snowball_roll')) {
            console.log('⚠️ snowball_roll already exists, skipping creation');
        }
        
        // Create freecool snowball animation (6 frames: 0-5)
        if (this.textures.exists('snowball_freecool') && !this.anims.exists('snowball_freecool_anim')) {
            try {
                this.anims.create({
                    key: 'snowball_freecool_anim',
                    frames: this.anims.generateFrameNumbers('snowball_freecool', { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
                console.log('✅ Freecool snowball animation created (6 frames)');
            } catch (error) {
                console.error('❌ Failed to create freecool snowball animation:', error.message);
            }
        } else if (this.anims.exists('snowball_freecool_anim')) {
            console.log('⚠️ snowball_freecool_anim already exists, skipping creation');
        }
        
        // Create fireball animation from individual frames
        const fireballFrames = [];
        for (let i = 0; i < 60; i++) {
            fireballFrames.push({ key: `fireball_${i}` });
        }
        
        if (!this.anims.exists('fireball_anim')) {
            this.anims.create({
                key: 'fireball_anim',
                frames: fireballFrames,
                frameRate: 15, // 15 FPS for smooth animation
                repeat: -1 // Loop indefinitely
            });
            console.log('✅ Fireball animation created (60 frames)');
        } else {
            console.log('⚠️ fireball_anim already exists, skipping creation');
        }
        
        // Create fire column animation from individual frames
        const fireColumnFrames = [];
        for (let i = 1; i <= 14; i++) {
            fireColumnFrames.push({ key: `fire_column_${i}` });
        }
        
        if (!this.anims.exists('fire_column_anim')) {
            this.anims.create({
                key: 'fire_column_anim',
                frames: fireColumnFrames,
                frameRate: 12, // 12 FPS for fire column animation
                repeat: 0 // Play once
            });
            console.log('✅ Fire column animation created (14 frames)');
        } else {
            console.log('⚠️ fire_column_anim already exists, skipping creation');
        }
        
        // Create JellyHead slime animation from 3rd row of sprite sheet
        // Assuming the sprite sheet has frames arranged in rows, 3rd row starts at frame 16 (if 8 frames per row)
        if (!this.anims.exists('jellyhead_slime_anim')) {
            this.anims.create({
                key: 'jellyhead_slime_anim',
                frames: this.anims.generateFrameNumbers('jellyhead_slime', { start: 16, end: 23 }), // 3rd row: frames 16-23
                frameRate: 8,
                repeat: -1 // Loop indefinitely
            });
            console.log('✅ JellyHead slime animation created');
        } else {
            console.log('⚠️ jellyhead_slime_anim already exists, skipping creation');
        }
        
        // Create Volt lightning animations for dash effect
        this.anims.create({
            key: 'lightning_1_anim',
            frames: this.anims.generateFrameNumbers('lightning_1', { start: 0, end: 7 }),
            frameRate: 15,
            repeat: 0 // Play once
        });
        
        this.anims.create({
            key: 'lightning_2_anim',
            frames: this.anims.generateFrameNumbers('lightning_2', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: 0 // Play once
        });
        
        this.anims.create({
            key: 'lightning_3_anim',
            frames: this.anims.generateFrameNumbers('lightning_3', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: 0 // Play once
        });
        
        this.anims.create({
            key: 'lightning_4_anim',
            frames: this.anims.generateFrameNumbers('lightning_4', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: 0 // Play once
        });
        
        // Create WhirlWind energy animations for spin effect
        this.anims.create({
            key: 'energy_1_anim',
            frames: this.anims.generateFrameNumbers('energy_1', { start: 0, end: 7 }),
            frameRate: 15,
            repeat: -1 // Loop indefinitely
        });
        
        this.anims.create({
            key: 'energy_2_anim',
            frames: this.anims.generateFrameNumbers('energy_2', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1 // Loop indefinitely
        });
        
        this.anims.create({
            key: 'energy_3_anim',
            frames: this.anims.generateFrameNumbers('energy_3', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1 // Loop indefinitely
        });
        
        // Create Brick burst animation for immunity effect
        if (!this.anims.exists('brick_burst_anim')) {
            try {
                this.anims.create({
                    key: 'brick_burst_anim',
                    frames: this.anims.generateFrameNumbers('brick_burst', { start: 0, end: 19 }),
                    frameRate: 20,
                    repeat: 0 // Play once
                });
                console.log('✅ Brick burst animation created successfully');
            } catch (error) {
                console.error('❌ Failed to create brick burst animation:', error.message);
            }
        } else {
            console.log('⚠️ brick_burst_anim already exists, skipping creation');
        }
        
        // Start with idle animations (only if they exist)
        if (this.anims.exists('player1_idle_anim')) {
            this.player1.play('player1_idle_anim');
        }
        if (this.anims.exists('player2_idle_anim')) {
            this.player2.play('player2_idle_anim');
        }
        
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
    
        // Physics collisions - use ground reference from finishGameSetup
        this.physics.add.collider(this.player1, this.ground);
        this.physics.add.collider(this.player2, this.ground);
        this.physics.add.collider(this.ball, this.ground);
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
        
        // Add fight mode key (F key)
        this.input.keyboard.on('keydown-F', () => {
            this.switchToFightMode();
        });

        // Add pause keys (ESC and P)
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });
        this.input.keyboard.on('keydown-P', () => {
            this.togglePause();
        });

        // Initialize pause state
        this.isPaused = false;
        this.pauseMenuElements = [];
        
        // Create UI
        this.createUI();
        
        // Start the match timer
        this.startMatchTimer();
        
        // Initialize socket connection
        this.initializeSocket();
        
        // **COMPREHENSIVE DEBUGGING**: Log current state after fresh setup
        this.debugGameSceneState();
    }

    createPlayerAnimations(p1SpriteConfig, p2SpriteConfig) {
        console.log('🎬 Creating GameScene player animations...');
        
        // **CRITICAL FIX**: Clear any existing player animations before creating new ones
        const playerAnimsToRemove = [
            'player1_idle_anim', 'player1_walk_anim',
            'player2_idle_anim', 'player2_walk_anim',
            // Also clear any fight animations that might still exist
            'fight_player1_idle_anim', 'fight_player1_walk_anim', 
            'fight_player2_idle_anim', 'fight_player2_walk_anim'
        ];
        
        playerAnimsToRemove.forEach(key => {
            if (this.anims.exists(key)) {
                this.anims.remove(key);
                console.log(`🗑️ Removed existing animation: ${key}`);
            }
        });
        
        // Create Player 1 animations with existence checks
        if (p1SpriteConfig.type === 'sprite_sheet') {
            // Tiny Heroes - Sprite sheet animations
            if (!this.anims.exists('player1_idle_anim')) {
                this.anims.create({
                    key: 'player1_idle_anim',
                    frames: this.anims.generateFrameNumbers('player1_idle', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });
                console.log('✅ Created player1_idle_anim');
            }
            
            if (!this.anims.exists('player1_walk_anim')) {
                this.anims.create({
                    key: 'player1_walk_anim',
                    frames: this.anims.generateFrameNumbers('player1_walk', { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
                console.log('✅ Created player1_walk_anim');
            }
        }
        // Note: Mini Pixel Pack characters don't need animations - they use static sprites
        
        // Create Player 2 animations with existence checks
        if (p2SpriteConfig.type === 'sprite_sheet') {
            // Tiny Heroes - Sprite sheet animations
            if (!this.anims.exists('player2_idle_anim')) {
                this.anims.create({
                    key: 'player2_idle_anim',
                    frames: this.anims.generateFrameNumbers('player2_idle', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });
                console.log('✅ Created player2_idle_anim');
            }
            
            if (!this.anims.exists('player2_walk_anim')) {
                this.anims.create({
                    key: 'player2_walk_anim',
                    frames: this.anims.generateFrameNumbers('player2_walk', { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
                console.log('✅ Created player2_walk_anim');
            }
        }
        // Note: Mini Pixel Pack characters don't need animations - they use static sprites
        
        console.log('🎬 GameScene player animations setup complete');
    }

    debugGameSceneState() {
        console.log('🐛 =================================================');
        console.log('🐛 GAMESCENE STATE DEBUG - POST FRESH SETUP');
        console.log('🐛 =================================================');
        
        // Debug texture keys
        console.log('🖼️ Active Texture Keys:');
        const textureKeys = Object.keys(this.textures.list);
        const playerTextures = textureKeys.filter(key => key.includes('player') || key.includes('fight'));
        playerTextures.forEach(key => console.log(`   - ${key}`));
        
        // Debug animation keys
        console.log('🎬 Active Animation Keys:');
        const animationKeys = Object.keys(this.anims.anims.entries);
        const playerAnims = animationKeys.filter(key => key.includes('player') || key.includes('fight'));
        playerAnims.forEach(key => console.log(`   - ${key}`));
        
        // Debug player 1 properties
        if (this.player1) {
            console.log('👤 Player 1 Properties:');
            console.log(`   - Texture Key: ${this.player1.texture.key}`);
            console.log(`   - Scale: ${this.player1.scaleX} x ${this.player1.scaleY}`);
            console.log(`   - Position: ${this.player1.x}, ${this.player1.y}`);
            console.log(`   - Body Size: ${this.player1.body?.width || 'N/A'} x ${this.player1.body?.height || 'N/A'}`);
            console.log(`   - Body Offset: ${this.player1.body?.offset?.x || 'N/A'}, ${this.player1.body?.offset?.y || 'N/A'}`);
            console.log(`   - Tint: ${this.player1.tint.toString(16)}`);
            console.log(`   - Current Animation: ${this.player1.anims?.currentAnim?.key || 'None'}`);
        } else {
            console.log('👤 Player 1: NOT CREATED');
        }
        
        // Debug player 2 properties
        if (this.player2) {
            console.log('👤 Player 2 Properties:');
            console.log(`   - Texture Key: ${this.player2.texture.key}`);
            console.log(`   - Scale: ${this.player2.scaleX} x ${this.player2.scaleY}`);
            console.log(`   - Position: ${this.player2.x}, ${this.player2.y}`);
            console.log(`   - Body Size: ${this.player2.body?.width || 'N/A'} x ${this.player2.body?.height || 'N/A'}`);
            console.log(`   - Body Offset: ${this.player2.body?.offset?.x || 'N/A'}, ${this.player2.body?.offset?.y || 'N/A'}`);
            console.log(`   - Tint: ${this.player2.tint.toString(16)}`);
            console.log(`   - Current Animation: ${this.player2.anims?.currentAnim?.key || 'None'}`);
        } else {
            console.log('👤 Player 2: NOT CREATED');
        }
        
        // Debug selected characters
        console.log('🎭 Selected Characters:');
        console.log(`   - Player 1: ${selectedCharacters.player1 || 'None'}`);
        console.log(`   - Player 2: ${selectedCharacters.player2 || 'None'}`);
        
        // Debug physics world
        console.log('⚙️ Physics World:');
        console.log(`   - Gravity: ${this.physics.world.gravity.x}, ${this.physics.world.gravity.y}`);
        console.log(`   - Bodies Count: ${this.physics.world.bodies.size}`);
        console.log(`   - Static Bodies Count: ${this.physics.world.staticBodies.size}`);
        
        console.log('🐛 =================================================');
        console.log('🐛 END GAMESCENE STATE DEBUG');
        console.log('🐛 =================================================');
    }

    getRandomChaosDelay() {
        // Random delay around 7 seconds (6000-8000ms)
        const delay = 6000 + Math.random() * 2000;
        return delay;
    }

    createUI() {
        // Create score display - Smaller for better hierarchy
        this.leftScoreText = this.add.text(100, 50, 'PLAYER 1: 0', { 
            fontSize: '24px', 
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        });
        
        this.rightScoreText = this.add.text(700, 50, 'PLAYER 2: 0', { 
            fontSize: '24px', 
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(1, 0);

        // Create timer display - Bigger for prominence and better hierarchy
        this.timerText = this.add.text(400, 50, 'TIME: 60', { 
            fontSize: '42px', 
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5, 0);

        // Create connection status display - Arcade style
        this.connectionStatusText = this.add.text(400, 580, 'SOCKET: CONNECTING...', { 
            fontSize: '14px', 
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5, 1);

        // Create socket ID display - Arcade style
        this.socketText = this.add.text(10, 580, 'SOCKET ID: NOT CONNECTED', { 
            fontSize: '14px', 
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0, 1);

        // Create power status displays
        this.createPowerStatusUI();

        // Fight mode indicator - Arcade style
        this.fightModeText = this.add.text(400, 570, 'PRESS F FOR FIGHT MODE', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5, 1);

        // Pause button (blue circle in top right) - Arcade style
        this.pauseButton = this.add.circle(750, 50, 20, 0x0080ff, 0.9);
        this.pauseButton.setStrokeStyle(3, 0x00ffff);
        this.pauseButton.setInteractive();
        this.pauseButton.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.togglePause();
        });
        
        // Pause symbol (two vertical bars)
        this.pauseSymbol1 = this.add.rectangle(745, 50, 4, 16, 0xffffff);
        this.pauseSymbol2 = this.add.rectangle(755, 50, 4, 16, 0xffffff);
        
        // Add hover effect for pause button
        this.pauseButton.on('pointerover', () => {
            this.pauseButton.setFillStyle(0x0066cc, 0.9);
            this.pauseButton.setStrokeStyle(3, 0x00ffff);
        });
        this.pauseButton.on('pointerout', () => {
            this.pauseButton.setFillStyle(0x0080ff, 0.9);
            this.pauseButton.setStrokeStyle(3, 0x00ffff);
        });
    }

    createPowerStatusUI() {
        // Player 1 Power Status - Arcade style
        this.player1PowerText = this.add.text(100, 100, 'POWER: READY', { 
            fontSize: '16px', 
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        });

        // Player 2 Power Status - Arcade style
        this.player2PowerText = this.add.text(700, 100, 'POWER: READY', { 
            fontSize: '16px', 
            fontStyle: 'bold',
            fill: '#0080ff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(1, 0);
    }

    updatePowerStatusUI() {
        const currentTime = Date.now();
        
        // Update Player 1 power status - Arcade style
        if (this.powers.player1.ready || this.powers.player1.charges > 0) {
            // Show charges for shadow skin users
            if (this.powers.player1.maxCharges > 1) {
                this.player1PowerText.setText(`POWER: ⚡x${this.powers.player1.charges} [E]`);
                // Purple color for shadow skin
                this.player1PowerText.setStyle({ 
                    fill: '#9370db',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
                });
            } else {
                this.player1PowerText.setText('POWER: READY [E]');
                this.player1PowerText.setStyle({ 
                    fill: '#00ff00',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
                });
            }
        } else {
            const timeLeft = Math.max(0, this.powers.player1.cooldown - (currentTime - this.powers.player1.lastUsed));
            this.player1PowerText.setText(`POWER: ${(timeLeft/1000).toFixed(1)}S`);
            this.player1PowerText.setStyle({ 
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
            });
        }
        
        // Update Player 2 power status - Arcade style
        if (this.powers.player2.ready || this.powers.player2.charges > 0) {
            // Show charges for shadow skin users
            if (this.powers.player2.maxCharges > 1) {
                this.player2PowerText.setText(`POWER: ⚡x${this.powers.player2.charges} [K]`);
                // Purple color for shadow skin
                this.player2PowerText.setStyle({ 
                    fill: '#9370db',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
                });
            } else {
                this.player2PowerText.setText('POWER: READY [K]');
                this.player2PowerText.setStyle({ 
                    fill: '#0080ff',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
                });
            }
        } else {
            const timeLeft = Math.max(0, this.powers.player2.cooldown - (currentTime - this.powers.player2.lastUsed));
            this.player2PowerText.setText(`POWER: ${(timeLeft/1000).toFixed(1)}S`);
            this.player2PowerText.setStyle({ 
                fill: '#ff0000',
                stroke: '#000000',
                strokeThickness: 2,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
            });
        }
    }

    startMatchTimer() {
        this.matchTimer = this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });
    }

    updateTimer() {
        if (this.gameOver) return;
        
        this.matchTime--;
        this.timerText.setText(`TIME: ${this.matchTime}`);
        
        if (this.matchTime <= 0) {
            this.handleTimeUp();
        }
    }

    handleTimeUp() {
        this.gameOver = true;
        
        // Determine winner based on score
        let winner;
        if (this.leftScore > this.rightScore) {
            winner = 'Player 1';
        } else if (this.rightScore > this.leftScore) {
            winner = 'Player 2';
        } else {
            winner = 'Draw';
        }
        
        this.handleGameOver(winner);
    }

    handleGoalScored(scorer) {
        if (this.gameOver) return;
        
        // Play goal scoring sound
        SoundManager.playGoalScoreSound(this);
        
        if (scorer === 'left') {
            this.leftScore++;
            this.leftScoreText.setText(`PLAYER 1: ${this.leftScore}`);
            this.powers.player1.goals++;
        } else {
            this.rightScore++;
            this.rightScoreText.setText(`PLAYER 2: ${this.rightScore}`);
            this.powers.player2.goals++;
        }
        
        // Reset ball position and clear any active fireball effects
        this.ball.setPosition(400, 450);
        this.ball.setVelocity(0, 0);
        
        // Clean up any active fireball sprite when ball is reset
        if (this.ball.fireballSprite && this.ball.fireballSprite.active) {
            this.ball.fireballSprite.destroy();
        }
        this.ball.fireKicked = false;
        
        // Reset players to their starting positions
        this.player1.setPosition(200, 450);
        this.player1.setVelocity(0, 0);
        this.player2.setPosition(600, 450);
        this.player2.setVelocity(0, 0);
        
        // Check for game end (first to max goals or time up)
        if (this.leftScore >= this.maxGoals || this.rightScore >= this.maxGoals) {
            this.handleGameOver(scorer === 'left' ? 'Player 1' : 'Player 2');
        }
    }

    handleGameOver(winner) {
        this.gameOver = true;
        
        // Play victory sound (unless it's a draw)
        if (winner !== 'Draw') {
            SoundManager.playVictorySound(this);
        }
        
        // Award XP based on results
        let p1XP = 0;
        let p2XP = 0;
        
        if (winner === 'Player 1') {
            p1XP = 50; // Winner gets 50 XP
            p2XP = 25; // Loser gets 25 XP
        } else if (winner === 'Player 2') {
            p1XP = 25; // Loser gets 25 XP
            p2XP = 50; // Winner gets 50 XP
        } else {
            p1XP = 35; // Draw gives 35 XP each
            p2XP = 35;
        }
        
        // Add XP to player progress
        const p1Result = PLAYER_PROGRESS.addXP('player1', p1XP);
        const p2Result = PLAYER_PROGRESS.addXP('player2', p2XP);
        
        // Update session stats
        if (winner === 'Player 1') {
            SessionState.player1Wins++;
        } else if (winner === 'Player 2') {
            SessionState.player2Wins++;
        }
        SessionState.totalRoundsPlayed++;
        
        // Show XP gain screen
        this.showXPGainScreen(winner, p1Result, p2Result);
    }

    showXPGainScreen(winner, p1Result, p2Result) {
        // Create overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Winner announcement - Match CHARACTER SELECTION styling (largest)
        const winnerText = winner === 'Draw' ? 'DRAW!' : `${winner.toUpperCase()} WINS!`;
        
        this.add.text(400, 150, winnerText, {
            fontSize: '56px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Final score - Match CHARACTER SELECTION styling (medium)
        this.add.text(400, 220, `FINAL SCORE: ${this.leftScore} - ${this.rightScore}`, {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // XP gains - Match CHARACTER SELECTION styling (medium)
        this.add.text(400, 280, 'XP GAINED:', {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Player 1 XP - Arcade style
        const p1LevelText = p1Result.leveledUp ? ` (LEVEL UP! ${p1Result.oldLevel} → ${p1Result.newLevel})` : '';
        this.add.text(400, 320, `PLAYER 1: +${p1Result.newXP - p1Result.oldXP} XP${p1LevelText}`, {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: p1Result.leveledUp ? '#00ff00' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Player 2 XP - Arcade style
        const p2LevelText = p2Result.leveledUp ? ` (LEVEL UP! ${p2Result.oldLevel} → ${p2Result.newLevel})` : '';
        this.add.text(400, 350, `PLAYER 2: +${p2Result.newXP - p2Result.oldXP} XP${p2LevelText}`, {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: p2Result.leveledUp ? '#0080ff' : '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Session stats - Arcade style
        this.add.text(400, 400, `SESSION STATS: ${SessionState.player1Wins}-${SessionState.player2Wins} (${SessionState.totalRoundsPlayed} ROUNDS)`, {
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 1, offsetY: 1, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Fight Now button - Match MAP SELECTION "START MATCH" button styling
        const fightBtnBg = this.add.rectangle(280, 480, 180, 40, 0x000000, 0.9);
        fightBtnBg.setStrokeStyle(4, 0xffff00);
        fightBtnBg.setInteractive();
        
        const fightBtn = this.add.text(280, 480, '🔥 FIGHT NOW [F]', {
            fontSize: '17px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Continue button - Match MAP SELECTION "START MATCH" button styling
        const continueBtnBg = this.add.rectangle(520, 480, 180, 40, 0x000000, 0.9);
        continueBtnBg.setStrokeStyle(4, 0xffff00);
        continueBtnBg.setInteractive();
        
        const continueBtn = this.add.text(520, 480, 'CONTINUE [SPACE]', {
            fontSize: '17px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Add hover effects for Fight Now button
        fightBtnBg.on('pointerover', () => {
            fightBtnBg.setFillStyle(0x333300, 0.9);
            fightBtnBg.setStrokeStyle(4, 0xffff00);
            fightBtn.setStyle({ fill: '#ffffff' });
        });
        fightBtnBg.on('pointerout', () => {
            fightBtnBg.setFillStyle(0x000000, 0.9);
            fightBtnBg.setStrokeStyle(4, 0xffff00);
            fightBtn.setStyle({ fill: '#ffff00' });
        });
        
        // Add hover effects for Continue button
        continueBtnBg.on('pointerover', () => {
            continueBtnBg.setFillStyle(0x333300, 0.9);
            continueBtnBg.setStrokeStyle(4, 0xffff00);
            continueBtn.setStyle({ fill: '#ffffff' });
        });
        continueBtnBg.on('pointerout', () => {
            continueBtnBg.setFillStyle(0x000000, 0.9);
            continueBtnBg.setStrokeStyle(4, 0xffff00);
            continueBtn.setStyle({ fill: '#ffff00' });
        });
        
        // Add click handlers to button backgrounds
        fightBtnBg.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            // Use the original full time setting, not remaining time
            const currentMatchSettings = {
                time: selectedMatchSettings.time, // Full original time (90s if 90s was selected)
                heartLimit: selectedMatchSettings.goalLimit // Hearts match the original goal limit
            };
            
            // Store current settings temporarily for fight scene
            this.scene.start('FightScene', currentMatchSettings);
        });
        
        continueBtnBg.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            this.scene.start('CharacterSelectionScene');
        });
        
        // Add space key listener
        this.input.keyboard.once('keydown-SPACE', () => {
            SoundManager.playForwardButton(this);
            this.scene.start('CharacterSelectionScene');
        });
        
        // Add F key listener for fight mode
        this.input.keyboard.once('keydown-F', () => {
            SoundManager.playForwardButton(this);
            // Use the original full time setting, not remaining time
            const currentMatchSettings = {
                time: selectedMatchSettings.time, // Full original time (90s if 90s was selected)
                heartLimit: selectedMatchSettings.goalLimit // Hearts match the original goal limit
            };
            
            // Store current settings temporarily for fight scene
            this.scene.start('FightScene', currentMatchSettings);
        });
    }

    handlePlayerBallCollision(player, ball) {
        if (this.gameOver) return;
        
        // Check if this is a fire ball and handle special logic
        if (ball.fireKicked) {
            // Determine which player this is
            const isPlayer1 = player === this.player1;
            const playerKey = isPlayer1 ? 'player1' : 'player2';
            const playerPower = this.powers[playerKey];
            const playerCharacter = isPlayer1 ? selectedCharacters.player1 : selectedCharacters.player2;
            
            // Check if player has any active power that can deflect the fire ball
            // Only immunity (Brick) can deflect fire balls
            const canDeflect = playerPower.immune;
            
            if (canDeflect) {
                // Player has active power - they can deflect the fire ball
                console.log('🛡️ Player with active power deflects fire ball');
                
                // Give the ball a powerful deflection
                const deflectionDirection = isPlayer1 ? -1 : 1;
                ball.setVelocity(deflectionDirection * 500, -250);
                
                // Visual feedback for successful deflection
                player.setTint(0x00ff00);
                this.time.delayedCall(300, () => {
                    const playerId = player === this.player1 ? 'player1' : 'player2';
                    this.restorePlayerSkinTint(player, playerId);
                });
                
                // Clear fire effect since it was deflected
                if (ball.fireballSprite && ball.fireballSprite.active) {
                    ball.fireballSprite.destroy();
                }
                ball.fireKicked = false;
                
                return;
            } else {
                // Player has no active defense - gets knocked back by fire ball
                console.log('🔥 Fire ball knocks back undefended player');
                
                // Calculate knockback direction (away from ball)
                const knockbackDirection = player.x > ball.x ? 1 : -1;
                
                // Apply strong knockback
                player.setVelocity(
                    knockbackDirection * 350, // Horizontal knockback
                    -200 // Upward knockback
                );
                
                // Fire damage effect
                player.setTint(0xff4500);
                
                // Clear player tint
                this.time.delayedCall(500, () => {
                    const playerId = player === this.player1 ? 'player1' : 'player2';
                    this.restorePlayerSkinTint(player, playerId);
                });
                
                // Ball continues with slightly reduced speed but same direction
                const ballVel = ball.body.velocity;
                ball.setVelocity(ballVel.x * 0.8, ballVel.y * 0.8);
                
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
        
        // Calculate kick velocity based on player input and position
        let kickVelocityX = correctDirection * 200;
        let kickVelocityY = -150;
        
        // Add player momentum
        if (Math.abs(playerVelocityX) > 10) {
            kickVelocityX += playerVelocityX * 0.5;
        }
        
        // Stronger kick if player is moving toward ball
        if ((correctDirection > 0 && playerVelocityX > 0) || (correctDirection < 0 && playerVelocityX < 0)) {
            kickVelocityX *= 1.5;
            kickVelocityY = -200;
        }
        
        ball.setVelocity(kickVelocityX, kickVelocityY);
        
        // Play kickball sound effect
        SoundManager.playKickballSound(this);
    }

    isPlayerPowerActive(playerKey) {
        const power = this.powers[playerKey];
        const currentTime = Date.now();
        
        // Check if any power effects are currently active
        return power.immune || power.frozen || power.slowed ||
               (power.immuneUntil && currentTime < power.immuneUntil) ||
               (power.frozenUntil && currentTime < power.frozenUntil) ||
               (power.slowedUntil && currentTime < power.slowedUntil);
    }

    handlePlayerPlayerCollision(player1, player2) {
        // Simple bounce effect
        const pushForce = 50;
        if (player1.x < player2.x) {
            player1.setVelocityX(-pushForce);
            player2.setVelocityX(pushForce);
        } else {
            player1.setVelocityX(pushForce);
            player2.setVelocityX(-pushForce);
        }
    }

    update() {
        if (this.gameOver || this.isPaused) return;
        
        // Update power system
        this.updatePowerSystem();
        
        // Update chaos events
        this.updateChaosManager();
        
        // Calculate movement speeds based on chaos events
        let horizontalSpeed = 200;  // Increased from 160 for faster left/right movement
        let jumpSpeed = 360;        // Reduced from 400 for lower jump height
        let airMovementSpeed = 130; // Increased from 100 for better air control
        
        if (this.chaosManager.currentEvent === 'zero_gravity') {
            horizontalSpeed = 100; // Slower horizontal movement for slow motion
            jumpSpeed = 200; // Slower jumps for slow motion
            airMovementSpeed = 80; // Slower air movement
        }
        
        // Player 1 controls (WASD) - check if frozen
        if (!this.powers.player1.frozen) {
            // Check if player is slowed down
            let player1HorizontalSpeed = horizontalSpeed;
            let player1JumpSpeed = jumpSpeed;
            let player1AirMovementSpeed = airMovementSpeed;
            
            if (this.powers.player1.slowed) {
                // Slow motion effect - reduce all speeds
                player1HorizontalSpeed *= 0.3; // 30% speed
                player1JumpSpeed *= 0.4; // 40% jump power
                player1AirMovementSpeed *= 0.3; // 30% air movement
            }
            
            if (this.wasd.A.isDown) {
                if (this.player1.body.touching.down) {
                    this.player1.setVelocityX(-player1HorizontalSpeed);
                    if (this.anims.exists('player1_walk_anim')) {
                        this.player1.play('player1_walk_anim', true);
                    }
                } else if (player1AirMovementSpeed > 0) {
                    // Allow air movement in zero gravity
                    this.player1.setVelocityX(-player1AirMovementSpeed);
                }
                this.player1.setFlipX(true); // Face left
            } else if (this.wasd.D.isDown) {
                if (this.player1.body.touching.down) {
                    this.player1.setVelocityX(player1HorizontalSpeed);
                    if (this.anims.exists('player1_walk_anim')) {
                        this.player1.play('player1_walk_anim', true);
                    }
                } else if (player1AirMovementSpeed > 0) {
                    // Allow air movement in zero gravity
                    this.player1.setVelocityX(player1AirMovementSpeed);
                }
                this.player1.setFlipX(false); // Face right
            } else {
                this.player1.setVelocityX(0);
                if (this.player1.body.touching.down && this.anims.exists('player1_idle_anim')) {
                    this.player1.play('player1_idle_anim', true);
                }
            }
            
            if (this.wasd.W.isDown && this.player1.body.touching.down) {
                this.player1.setVelocityY(-player1JumpSpeed);
            }
        }
        
        // Player 2 controls (Arrow Keys) - check if frozen
        if (!this.powers.player2.frozen) {
            // Check if player is slowed down
            let player2HorizontalSpeed = horizontalSpeed;
            let player2JumpSpeed = jumpSpeed;
            let player2AirMovementSpeed = airMovementSpeed;
            
            if (this.powers.player2.slowed) {
                // Slow motion effect - reduce all speeds
                player2HorizontalSpeed *= 0.3; // 30% speed
                player2JumpSpeed *= 0.4; // 40% jump power
                player2AirMovementSpeed *= 0.3; // 30% air movement
            }
            
            if (this.cursors.left.isDown) {
                if (this.player2.body.touching.down) {
                    this.player2.setVelocityX(-player2HorizontalSpeed);
                    if (this.anims.exists('player2_walk_anim')) {
                        this.player2.play('player2_walk_anim', true);
                    }
                } else if (player2AirMovementSpeed > 0) {
                    // Allow air movement in zero gravity
                    this.player2.setVelocityX(-player2AirMovementSpeed);
                }
                this.player2.setFlipX(true); // Face left
            } else if (this.cursors.right.isDown) {
                if (this.player2.body.touching.down) {
                    this.player2.setVelocityX(player2HorizontalSpeed);
                    if (this.anims.exists('player2_walk_anim')) {
                        this.player2.play('player2_walk_anim', true);
                    }
                } else if (player2AirMovementSpeed > 0) {
                    // Allow air movement in zero gravity
                    this.player2.setVelocityX(player2AirMovementSpeed);
                }
                this.player2.setFlipX(false); // Face right
            } else {
                this.player2.setVelocityX(0);
                if (this.player2.body.touching.down && this.anims.exists('player2_idle_anim')) {
                    this.player2.play('player2_idle_anim', true);
                }
            }
            
            if (this.cursors.up.isDown && this.player2.body.touching.down) {
                this.player2.setVelocityY(-player2JumpSpeed);
            }
        }
        
        // Power activation
        if (this.powerKeys.E.isDown) {
            this.activatePower('player1');
        }
        
        if (this.powerKeys.K.isDown) {
            this.activatePower('player2');
        }
        
        // Update UI
        this.updatePowerStatusUI();
        
        // Apply chaos effects
        this.applyChaosEffects();
        
        // Update fireball sprite position to follow ball with offset
        if (this.ball.fireballSprite && this.ball.fireballSprite.active) {
            // Maintain the offset based on sprite flip state
            const spriteOffsetX = this.ball.fireballSprite.flipX ? -25 : 25;
            const spriteOffsetY = -15; // Move sprite up from the ball
            this.ball.fireballSprite.setPosition(this.ball.x + spriteOffsetX, this.ball.y + spriteOffsetY);
        }
        
        // Update fire column sprite position to follow player1 (Blaze) at ground level
        if (this.player1.fireColumnSprite && this.player1.fireColumnSprite.active) {
            this.player1.fireColumnSprite.setPosition(this.player1.x, this.player1.y + 30);
        }
        
        // Update fire column sprite position to follow player2 (Blaze) at ground level
        if (this.player2.fireColumnSprite && this.player2.fireColumnSprite.active) {
            this.player2.fireColumnSprite.setPosition(this.player2.x, this.player2.y + 30);
        }
        
        // Ball safety check - prevent ball from getting trapped between players
        this.preventBallSqueezing();
    }

    updatePowerSystem() {
        const currentTime = Date.now();
        
        // Update Player 1 power
        if (!this.powers.player1.ready) {
            if (currentTime - this.powers.player1.lastUsed >= this.powers.player1.cooldown) {
                this.powers.player1.ready = true;
                this.powers.player1.charges = this.powers.player1.maxCharges;
                console.log(`🔋 Player 1 power recharged! Charges: ${this.powers.player1.charges}`);
            }
        }
        
        // Update Player 1 slowed state
        if (this.powers.player1.slowed && currentTime >= this.powers.player1.slowedUntil) {
            this.powers.player1.slowed = false;
            this.restorePlayerSkinTint(this.player1, 'player1');
            console.log('🟣 Player 1 slowed effect ended');
        }
        
        // Update Player 2 power
        if (!this.powers.player2.ready) {
            if (currentTime - this.powers.player2.lastUsed >= this.powers.player2.cooldown) {
                this.powers.player2.ready = true;
                this.powers.player2.charges = this.powers.player2.maxCharges;
                console.log(`🔋 Player 2 power recharged! Charges: ${this.powers.player2.charges}`);
            }
        }
        
        // Update Player 2 slowed state
        if (this.powers.player2.slowed && currentTime >= this.powers.player2.slowedUntil) {
            this.powers.player2.slowed = false;
            this.restorePlayerSkinTint(this.player2, 'player2');
            console.log('🟣 Player 2 slowed effect ended');
        }
    }

    activatePower(player) {
        console.log(`🔥 activatePower called for ${player}`);
        
        // Check if power is available (either ready or has charges)
        if (!this.powers[player].ready && this.powers[player].charges <= 0) {
            console.log(`❌ ${player} power not available - no charges and not ready`);
            return;
        }
        
        // If power is ready but no charges, this shouldn't happen, but let's handle it
        if (this.powers[player].ready && this.powers[player].charges <= 0) {
            this.powers[player].charges = this.powers[player].maxCharges;
            console.log(`🔋 ${player} restored charges to ${this.powers[player].maxCharges}`);
        }
        
        // Use one charge
        this.powers[player].charges--;
        
        // Get selected character for this player
        const characterKey = player === 'player1' ? selectedCharacters.player1 : selectedCharacters.player2;
        const character = CHARACTERS[characterKey];
        const playerSprite = player === 'player1' ? this.player1 : this.player2;
        
        // Play character-specific power sound effect
        SoundManager.playCharacterPower(this, character.name);
        
        console.log(`⚡ ${player} used power! Charges remaining: ${this.powers[player].charges}/${this.powers[player].maxCharges}`);
        
        // ONLY start cooldown when ALL charges are used up
        if (this.powers[player].charges <= 0) {
            this.powers[player].ready = false;
            this.powers[player].lastUsed = Date.now();
            
            // Recalculate cooldown based on current equipped skin
            this.powers[player].cooldown = this.calculatePowerCooldown(player);
            
            console.log(`🔄 ${player} ALL CHARGES USED - starting ${this.powers[player].cooldown/1000}s cooldown`);
        } else {
            console.log(`✅ ${player} still has ${this.powers[player].charges} charges - NO COOLDOWN`);
        }
        
        console.log(`⚡ Applying power for character: ${characterKey}, character name: ${character.name}`);
        
        // Apply character-specific power
        this.applyCharacterPower(player, character, playerSprite);
    }

    applyCharacterPower(player, character, playerSprite) {
        // Get opponent for power interactions
        const opponent = player === 'player1' ? this.player2 : this.player1;
        
        // Character-specific powers based on character name
        switch (character.name.toLowerCase()) {
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
        // Focus on powerful fire kick rather than uppercut
        const direction = player.flipX ? -1 : 1;
        const playerKey = player === this.player1 ? 'player1' : 'player2';
        
        // Clean up any existing fire column sprite first
        if (player.fireColumnSprite && player.fireColumnSprite.active) {
            player.fireColumnSprite.destroy();
        }
        
        // Create fire column animation on Blaze at ground level
        const fireColumnSprite = this.add.sprite(player.x, player.y + 30, 'fire_column_1');
        fireColumnSprite.setScale(3.5); // Make it much bigger and more visible
        fireColumnSprite.setDepth(5); // Above everything else
        fireColumnSprite.setOrigin(0.5, 1); // Anchor at bottom center like players
        
        // Play the fire column animation and loop it
        fireColumnSprite.play('fire_column_anim');
        
        // Loop the animation instead of destroying on complete
        fireColumnSprite.on('animationcomplete', () => {
            fireColumnSprite.play('fire_column_anim'); // Replay the animation
        });
        
        // Store fire column reference on player for following
        player.fireColumnSprite = fireColumnSprite;
        
        // Remove the fire column sprite after 4 seconds (same duration as fireball)
        this.time.delayedCall(4000, () => {
            if (fireColumnSprite.active) {
                fireColumnSprite.destroy();
            }
            // Clear reference when destroyed
            player.fireColumnSprite = null;
        });
        
        // Brief orange tint on player
        player.setTint(0xff4500);
        this.time.delayedCall(600, () => {
            const playerId = player === this.player1 ? 'player1' : 'player2';
            this.restorePlayerSkinTint(player, playerId);
        });
        
        // Fire kick affects the ball - make it super powerful
        const ballDistance = Phaser.Math.Distance.Between(player.x, player.y, this.ball.x, this.ball.y);
        if (ballDistance < 120) {
            // Clean up any existing fireball sprite first
            if (this.ball.fireballSprite && this.ball.fireballSprite.active) {
                this.ball.fireballSprite.destroy();
            }
            
            // Determine which player is kicking and position sprite accordingly
            const isPlayer1 = player === this.player1;
            const spriteOffsetX = isPlayer1 ? -25 : 25; // Left player: offset left, Right player: offset right
            const spriteOffsetY = -15; // Move sprite up from the ball
            
            // Create animated fireball sprite effect on ball with offset
            const fireballSprite = this.add.sprite(this.ball.x + spriteOffsetX, this.ball.y + spriteOffsetY, 'fireball_0');
            fireballSprite.setScale(2.0); // Even bigger scale for better visibility
            fireballSprite.setDepth(4); // Above ball but below UI
            
            // Flip sprite if needed for left player
            if (isPlayer1) {
                // Player 1 is on the left, flip the sprite horizontally
                fireballSprite.setFlipX(true);
            }
            
            fireballSprite.play('fireball_anim'); // Start the animation
            
            // Store fireball reference on ball for cleanup
            this.ball.fireballSprite = fireballSprite;
            this.ball.fireKicked = true;
            
            // VERY powerful kick towards opponent's goal - straight horizontal line
            const ballDirection = player.x < 400 ? 1 : -1; // Determine which goal to aim for
            this.ball.setVelocity(ballDirection * 850, 0); // Maximum speed, perfectly horizontal
            
            // Clear fire effect after 4 seconds
            this.time.delayedCall(4000, () => {
                if (this.ball.active) {
                    if (this.ball.fireballSprite && this.ball.fireballSprite.active) {
                        this.ball.fireballSprite.destroy();
                    }
                    this.ball.fireKicked = false;
                }
            });
            
            console.log('🔥 Blaze fired a devastating horizontal fire kick!');
        }
    }



    executeIceBlast(player, opponent) {
        const direction = player.flipX ? -1 : 1;
        
        console.log('🧊 Frostbite executeIceBlast called, game mode:', selectedGameMode);
        
        // Enhanced soccer mode with snowball projectile and ice cocoon overlay
        if (selectedGameMode === 'soccer') {
            console.log('❄️ Using enhanced soccer mode snowball projectile');
            
            // Create snowball projectile (prioritize main spritesheet)
            let projectile;
            
            if (this.textures.exists('snowball_main') && this.anims.exists('snowball_roll')) {
                console.log('✅ Using main snowball spritesheet with animation');
                projectile = this.add.sprite(player.x + (direction * 30), player.y - 20, 'snowball_main');
                projectile.setScale(0.1); // Scale down the large 512x386 frames
                projectile.play('snowball_roll');
            } else if (this.textures.exists('snowball_freecool') && this.anims.exists('snowball_freecool_anim')) {
                console.log('✅ Using FreeIceCoolPack snowball spritesheet');
                projectile = this.add.sprite(player.x + (direction * 30), player.y - 20, 'snowball_freecool');
                projectile.setScale(0.3); // Scale down the 32x160 frames
                projectile.play('snowball_freecool_anim');
            } else if (this.textures.exists('snowball_main')) {
                console.log('✅ Using main snowball spritesheet (static)');
                projectile = this.add.sprite(player.x + (direction * 30), player.y - 20, 'snowball_main');
                projectile.setScale(0.1);
                projectile.setFrame(0); // Use first frame as static
            } else {
                console.warn('⚠️ No snowball sprites found, using fallback white circle');
                projectile = this.add.circle(player.x + (direction * 30), player.y - 20, 12, 0xffffff);
            }
            
            this.physics.add.existing(projectile);
            
            // Set projectile velocity straight across the screen - exactly like the old blue circle
            projectile.body.setVelocity(direction * 350, 0);
                            projectile.body.setGravityY(-600); // Negative gravity to counteract world gravity (updated)
            projectile.body.setCollideWorldBounds(false); // Don't collide with world bounds
            projectile.body.setSize(20, 20); // Set collision size
            
            // Handle collision with opponent
            this.physics.add.overlap(projectile, opponent, () => {
                // Check if opponent is immune (only Brick can block)
                const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
                const opponentPower = this.powers[opponentKey];
                
                if (opponentPower.immune) {
                    // Brick's immunity blocks the ice attack - projectile bounces off
                    projectile.body.setVelocity(-projectile.body.velocity.x, -Math.abs(projectile.body.velocity.y));
                    
                    // Visual effect for immunity block
                    opponent.setTint(0xffd700);
                    this.time.delayedCall(200, () => {
                        // Restore Brick's golden immunity tint
                        opponent.setTint(0xffd700);
                    });
                    
                    console.log('🛡️ Brick blocked snowball with immunity!');
                    return;
                }
                
                // Stop opponent movement
                opponent.setVelocity(0, 0);
                
                // Create ice cocoon overlay effect
                this.applyIceCocoonEffect(opponent, opponentPower);
                
                projectile.destroy();
            });
            
            // Auto-destroy after 3 seconds
            this.time.delayedCall(3000, () => {
                if (projectile.active) projectile.destroy();
            });
        } else {
            // Original fight mode behavior - simple ice projectile
            const projectile = this.add.circle(player.x, player.y - 20, 8, 0x00bfff);
            this.physics.add.existing(projectile);
            
            projectile.body.setVelocity(direction * 300, 0);
            projectile.body.setGravityY(-600); // Updated to match new gravity
            
            // Handle collision with opponent (fight mode)
            this.physics.add.overlap(projectile, opponent, () => {
                const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
                const opponentPower = this.powers[opponentKey];
                
                if (opponentPower.immune) {
                    projectile.body.setVelocity(-projectile.body.velocity.x, -Math.abs(projectile.body.velocity.y));
                    opponent.setTint(0xffd700);
                    this.time.delayedCall(200, () => {
                        opponent.setTint(0xffd700);
                    });
                    console.log('🛡️ Brick blocked ice blast with immunity!');
                    return;
                }
                
                opponent.setVelocity(0, 0);
                opponent.setTint(0x87ceeb);
                
                opponentPower.frozen = true;
                opponentPower.frozenUntil = Date.now() + 2000;
                
                this.time.delayedCall(2000, () => {
                    opponentPower.frozen = false;
                    const opponentId = opponent === this.player1 ? 'player1' : 'player2';
                    this.restorePlayerSkinTint(opponent, opponentId);
                });
                
                projectile.destroy();
            });
            
            this.time.delayedCall(2000, () => {
                if (projectile.active) projectile.destroy();
            });
        }
    }

    applyIceCocoonEffect(opponent, opponentPower) {
        console.log('❄️ Applying ice cocoon effect...');
        
        // Create ice cocoon overlay using just one frame from the sprite sheet
        let iceCocoon;
        if (this.textures.exists('ice_cocoon')) {
            console.log('✅ Using ice cocoon sprite sheet - frame 14 (5th in 3rd row)');
            iceCocoon = this.add.sprite(opponent.x, opponent.y - 30, 'ice_cocoon');
            iceCocoon.setFrame(14); // Use 5th image in 3rd row (0-indexed: row 3 = frames 10-14, so frame 14)
            iceCocoon.setScale(3.0); // Scale up the 32x32 frame to cover the character completely
        } else {
            console.warn('⚠️ Ice cocoon sprite not found, using fallback blue circle');
            iceCocoon = this.add.circle(opponent.x, opponent.y - 30, 25, 0x87ceeb, 0.7);
        }
        
        iceCocoon.setDepth(10); // Ensure it appears above the player
        iceCocoon.setAlpha(0.9);
        
        // Store reference to cocoon in opponent for cleanup
        opponent.iceCocoonOverlay = iceCocoon;
        
        // Freeze the opponent - disable movement
        opponentPower.frozen = true;
        opponentPower.frozenUntil = Date.now() + 2000; // 2 seconds
        
        // Add a subtle ice tint to the player
        opponent.setTint(0xb3e5fc);
        
        // Ice cocoon appears instantly without animation
        
        // Track cocoon with player movement (though they should be frozen)
        const updateCocoonPosition = () => {
            if (iceCocoon && iceCocoon.active && opponent && opponent.active) {
                iceCocoon.setPosition(opponent.x, opponent.y - 30);
            }
        };
        
        // Clear freeze and ice cocoon after 2 seconds
        this.time.delayedCall(2000, () => {
            opponentPower.frozen = false;
            const opponentId = opponent === this.player1 ? 'player1' : 'player2';
            this.restorePlayerSkinTint(opponent, opponentId);
            
            // Fade out and destroy ice cocoon
            if (iceCocoon && iceCocoon.active) {
                this.tweens.add({
                    targets: iceCocoon,
                    alpha: 0,
                    scaleX: 0.8,
                    scaleY: 0.8,
                    duration: 300,
                    onComplete: () => {
                        iceCocoon.destroy();
                        opponent.iceCocoonOverlay = null;
                    }
                });
            }
            
            console.log('❄️ Frostbite freeze effect ended');
        });
        
        // Update cocoon position every frame while active
        const positionTimer = this.time.addEvent({
            delay: 16, // ~60fps
            callback: updateCocoonPosition,
            repeat: 125 // For 2 seconds (2000ms / 16ms)
        });
        
        console.log('❄️ Frostbite applied ice cocoon freeze effect!');
    }

    executeElectricDash(player) {
        // Get direction player is facing
        const direction = player.flipX ? -1 : 1;
        const playerKey = player === this.player1 ? 'player1' : 'player2';
        const opponent = player === this.player1 ? this.player2 : this.player1;
        
        // Calculate dash distance (about 150 pixels)
        const dashDistance = 150;
        const targetX = Math.max(50, Math.min(750, player.x + (direction * dashDistance)));
        
        // Store original position for lightning trail effect
        const startX = player.x;
        const startY = player.y;
        
        // Create Lightning 1 animation ON the player character
        const lightning1Sprite = this.add.sprite(player.x, player.y - 20, 'lightning_1');
        lightning1Sprite.setScale(0.5); // Bigger scale for more dramatic effect
        lightning1Sprite.play('lightning_1_anim');
        
        // Move lightning 1 sprite with player during dash
        this.tweens.add({
            targets: lightning1Sprite,
            x: targetX,
            y: player.y - 20, // Maintain the raised position
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Destroy lightning 1 sprite after animation completes
                this.time.delayedCall(400, () => {
                    if (lightning1Sprite.active) lightning1Sprite.destroy();
                });
            }
        });
        
        // Create lightning trail effect using sprites 2, 3, and 4
        this.createLightningTrail(startX, startY, targetX, player.y);
        
        // Scale effect during dash
        this.tweens.add({
            targets: player,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
        
        // Dash tween - quick movement to target position
        this.tweens.add({
            targets: player,
            x: targetX,
            duration: 200,
            ease: 'Power2',
            onComplete: () => {
                // Check what Volt hit during the dash
                this.checkVoltDashCollisions(player, opponent, direction, playerKey);
            }
        });
        
        // Clear tint after dash
        this.time.delayedCall(600, () => {
            const playerId = player === this.player1 ? 'player1' : 'player2';
            this.restorePlayerSkinTint(player, playerId);
        });
    }
    
    createLightningTrail(startX, startY, endX, endY) {
        // Calculate trail positions between start and end points
        const distance = Math.abs(endX - startX);
        const segments = 3; // Using 3 sprite sheets (2, 3, 4)
        const segmentDistance = distance / segments;
        
        // Create lightning trail sprites 2, 3, and 4 along the path
        const trailSprites = [];
        
        for (let i = 0; i < segments; i++) {
            const segmentX = startX + (i * segmentDistance) + (segmentDistance / 2);
            const segmentY = startY - 40 + (Math.random() - 0.5) * 30; // Raise up higher with more variation
            
            let spriteKey;
            let animKey;
            
            // Use different lightning sprites for variety
            switch (i) {
                case 0:
                    spriteKey = 'lightning_2';
                    animKey = 'lightning_2_anim';
                    break;
                case 1:
                    spriteKey = 'lightning_3';
                    animKey = 'lightning_3_anim';
                    break;
                case 2:
                    spriteKey = 'lightning_4';
                    animKey = 'lightning_4_anim';
                    break;
            }
            
            // Create trail sprite
            const trailSprite = this.add.sprite(segmentX, segmentY, spriteKey);
            trailSprite.setScale(0.4); // Bigger scale for more dramatic trail effect
            trailSprite.play(animKey);
            
            // Add slight delay between trail segments for cascading effect
            this.time.delayedCall(i * 50, () => {
                if (trailSprite.active) trailSprite.play(animKey);
            });
            
            trailSprites.push(trailSprite);
        }
        
        // Destroy all trail sprites after animations complete
        this.time.delayedCall(600, () => {
            trailSprites.forEach(sprite => {
                if (sprite.active) sprite.destroy();
            });
        });
    }
    
    checkVoltDashCollisions(player, opponent, direction, playerKey) {
        // Check collision with opponent
        const opponentDistance = Phaser.Math.Distance.Between(player.x, player.y, opponent.x, opponent.y);
        if (opponentDistance < 80) {
            const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
            const opponentPower = this.powers[opponentKey];
            
            if (opponentPower.immune) {
                // Brick's immunity blocks Volt's dash
                console.log('🛡️ Brick blocked Volt\'s dash with immunity!');
                
                // Volt bounces back slightly
                const bounceDirection = player.x > opponent.x ? 1 : -1;
                player.setVelocityX(bounceDirection * 200);
                
                // Visual effect for blocked attack
                opponent.setTint(0xffd700);
                this.time.delayedCall(200, () => {
                    // Restore Brick's golden immunity tint
                    opponent.setTint(0xffd700);
                });
            } else {
                // Make opponent jump up (like meteor collision)
                opponent.setVelocity(
                    (opponent.x - player.x) * 1.5, // Knock away from Volt
                    -250 // Jump up
                );
                
                // Electric shock effect
                opponent.setTint(0xffff00);
                this.cameras.main.shake(300, 0.03);
                
                // Clear opponent tint
                this.time.delayedCall(500, () => {
                    const opponentId = opponent === this.player1 ? 'player1' : 'player2';
                    this.restorePlayerSkinTint(opponent, opponentId);
                });
                
                console.log('⚡ Volt hit opponent - knockback applied!');
            }
        }
        
        // Check collision with ball
        const ballDistance = Phaser.Math.Distance.Between(player.x, player.y, this.ball.x, this.ball.y);
        if (ballDistance < 90) {
            // Ball always goes in the direction Volt is facing (not behind him)
            const voltDirection = direction; // Use Volt's facing direction
            const currentVelY = this.ball.body.velocity.y;
            
            // Apply electric boost to ball - always forward
            this.ball.setVelocity(
                voltDirection * Math.max(450, 450), // Always at least 450 speed forward
                currentVelY - 100 // Give it some lift
            );
            
            // Electric effect on ball
            this.ball.setTint(0xffff00);
            this.cameras.main.shake(200, 0.02);
            
            // Clear ball tint
            this.time.delayedCall(800, () => this.ball.clearTint());
            
            console.log('⚡ Volt hit ball - dashed forward!');
        }
    }

    executeBounceShield(player) {
        // Get direction and opponent
        const direction = player.flipX ? -1 : 1;
        const opponent = player === this.player1 ? this.player2 : this.player1;
        
        // Create jelly projectile using slime animation (smaller size)
        const projectile = this.add.sprite(player.x + (direction * 30), player.y - 30, 'jellyhead_slime');
        projectile.setScale(0.5); // Smaller when shot
        projectile.play('jellyhead_slime_anim');
        this.physics.add.existing(projectile);
        
        // Set projectile velocity
        projectile.body.setVelocity(direction * 280, 0);
        projectile.body.setGravityY(-600); // Updated to match new gravity
        projectile.body.setCollideWorldBounds(false);
        projectile.body.setSize(26, 28); // Collision size (half of frame size: 52/2, 55/2)
        
        // Handle collision with opponent
        this.physics.add.overlap(projectile, opponent, () => {
            // Check if opponent is immune (only Brick can block)
            const opponentKey = opponent === this.player1 ? 'player1' : 'player2';
            const opponentPower = this.powers[opponentKey];
            const opponentCharacter = opponentKey === 'player1' ? selectedCharacters.player1 : selectedCharacters.player2;
            
            if (opponentPower.immune && opponentCharacter === 'brick') {
                // Only Brick with active immunity can block
                projectile.body.setVelocity(-projectile.body.velocity.x, -Math.abs(projectile.body.velocity.y));
                
                // Visual effect for immunity block
                opponent.setTint(0xffd700);
                this.time.delayedCall(200, () => {
                    // Restore Brick's golden immunity tint
                    opponent.setTint(0xffd700);
                });
                return;
            }
            
            // Apply slow effect to opponent
            opponent.setTint(0x9370db);
            
            // Actually slow down the opponent
            opponentPower.slowed = true;
            opponentPower.slowedUntil = Date.now() + 3000; // 3 seconds
            
            // Add slime effect on opponent (bigger size)
            const slimeEffect = this.add.sprite(opponent.x, opponent.y - 20, 'jellyhead_slime');
            slimeEffect.setScale(1.2); // Bigger when on opponent
            slimeEffect.play('jellyhead_slime_anim');
            slimeEffect.setTint(0x9370db); // Purple tint
            
            // Make slime effect follow opponent
            const followSlime = () => {
                if (slimeEffect.active && opponent.active) {
                    slimeEffect.x = opponent.x;
                    slimeEffect.y = opponent.y - 20; // Keep at ground level (even higher position)
                }
            };
            
            // Update slime position every frame while opponent is slowed
            const slimeTimer = this.time.addEvent({
                delay: 16, // ~60 FPS
                callback: followSlime,
                repeat: 187 // 3 seconds worth of frames at 60 FPS
            });
            
            // Clean up slime effect when slow ends
            this.time.delayedCall(3000, () => {
                if (slimeEffect.active) {
                    slimeEffect.destroy();
                }
                if (slimeTimer.active) {
                    slimeTimer.destroy();
                }
            });
            
            console.log('🟣 Jellyhead slowed opponent with jelly projectile');
            
            projectile.destroy();
        });
        
        // Auto-destroy after 2.5 seconds
        this.time.delayedCall(2500, () => {
            if (projectile.active) projectile.destroy();
        });
        
        // Brief purple tint on Jellyhead
        player.setTint(0x9370db);
        this.time.delayedCall(300, () => {
            const playerId = player === this.player1 ? 'player1' : 'player2';
            this.restorePlayerSkinTint(player, playerId);
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
        
        // Create burst animation around Brick when immunity activates
        const burstSprite = this.add.sprite(player.x, player.y - 40, 'brick_burst');
        burstSprite.setScale(2.0); // Bigger scale for better visibility
        burstSprite.setDepth(5); // Above players but below UI
        burstSprite.play('brick_burst_anim');
        
        // Store burst sprite reference on player for tracking
        player.burstSprite = burstSprite;
        
        // Create a timer to update burst sprite position to follow Brick
        const followTimer = this.time.addEvent({
            delay: 16, // ~60 FPS
            callback: () => {
                if (burstSprite.active && player.active) {
                    burstSprite.x = player.x;
                    burstSprite.y = player.y - 40; // Keep it raised above Brick
                }
            },
            loop: true
        });
        
        // After animation completes, keep the burst sprite visible at the last frame
        burstSprite.on('animationcomplete', () => {
            // Keep the sprite visible at the last frame
            burstSprite.setFrame(19); // Stay on the last frame of the animation
        });
        
        // Clean up when immunity ends
        this.time.delayedCall(5000, () => {
            if (burstSprite.active) {
                burstSprite.destroy();
            }
            if (followTimer.active) {
                followTimer.destroy();
            }
            if (player.burstSprite) {
                player.burstSprite = null;
            }
        });
        
        console.log('🛡️ Brick immunity activated with following burst animation!');
        
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
            const playerId = player === this.player1 ? 'player1' : 'player2';
            this.restorePlayerSkinTint(player, playerId);
            
            // Extra cleanup for burst sprite if it still exists
            if (player.burstSprite && player.burstSprite.active) {
                player.burstSprite.destroy();
                player.burstSprite = null;
            }
        });
    }

    executeSpinKick(player) {
        // Spin effect
        player.setTint(0x87ceeb);
        
        // Create energy sprite animation around the player
        const energySprite = this.add.sprite(player.x, player.y, 'energy_1');
        energySprite.setScale(2.0); // Make it bigger for visual impact
        energySprite.setDepth(6); // Above everything else
        energySprite.setTint(0x87ceeb); // WhirlWind's color
        energySprite.play('energy_1_anim'); // Start the energy animation
        
        // Energy effect follows player
        const followEnergy = () => {
            if (energySprite.active) {
                energySprite.x = player.x;
                energySprite.y = player.y;
            }
        };
        
        // Update energy position every frame
        const energyTimer = this.time.addEvent({
            delay: 16,
            callback: followEnergy,
            repeat: 93 // 1.5 seconds at 60fps
        });
        
        // Store original position for diagonal uppercut motion
        const originalX = player.x;
        const originalY = player.y;
        
        // Determine diagonal direction (forward and upward)
        const direction = player.flipX ? -1 : 1; // Direction player is facing
        const diagonalDistance = 120; // Distance to move diagonally
        const upwardDistance = 100; // How high to go
        
        // Diagonal uppercut motion - move up and forward
        this.tweens.add({
            targets: player,
            x: originalX + (direction * diagonalDistance),
            y: originalY - upwardDistance,
            duration: 750, // First half of spin - going up
            ease: 'Power2.easeOut',
            onComplete: () => {
                // Second half - come down at the forward position (not back to original)
                this.tweens.add({
                    targets: player,
                    y: originalY, // Only adjust Y, keep the new X position
                    duration: 750, // Second half - coming down
                    ease: 'Power2.easeIn'
                });
            }
        });
        
        // Rotation tween (spinning while moving diagonally)
        this.tweens.add({
            targets: player,
            rotation: player.rotation + (Math.PI * 6),
            duration: 1500,
            ease: 'Power2',
            onComplete: () => {
                player.setRotation(0);
                const playerId = player === this.player1 ? 'player1' : 'player2';
                this.restorePlayerSkinTint(player, playerId);
                if (energySprite.active) energySprite.destroy();
                energyTimer.remove();
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
                
                if (opponentPower.immune) {
                    // Brick's immunity blocks the spin attack
                    console.log('🛡️ Brick blocked whirlwind spin with immunity!');
                    
                    // Visual effect for immunity block
                    opponent.setTint(0xffd700);
                    this.time.delayedCall(200, () => {
                        // Restore Brick's golden immunity tint
                        opponent.setTint(0xffd700);
                    });
                } else {
                    // Spin the opponent away
                    const spinDirection = opponent.x > player.x ? 1 : -1;
                    opponent.setVelocity(spinDirection * 300, -150);
                    opponent.setTint(0x87ceeb);
                    this.time.delayedCall(300, () => {
                        const opponentId = opponent === this.player1 ? 'player1' : 'player2';
                        this.restorePlayerSkinTint(opponent, opponentId);
                    });
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

    updateChaosManager() {
        if (this.gameOver) return;
        
        try {
            const currentTime = Date.now();
            
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

    showEventBanner(eventType) {
        const eventNames = {
            'zero_gravity': 'ZERO GRAVITY!',
            'flip_screen': 'FLIP SCREEN!',
            'speed_boost': 'SPEED BOOST!',
            'meteor_drop': 'METEOR DROP!',
            'ball_clone': 'BALL CLONE!',
            'big_head': 'BIG HEAD MODE!',
            'darkroom': 'DARKROOM!'
        };
        
        const eventColors = {
            'zero_gravity': '#00bfff',
            'flip_screen': '#ff69b4',
            'speed_boost': '#ffff00',
            'meteor_drop': '#ff4500',
            'ball_clone': '#32cd32',
            'big_head': '#9370db',
            'darkroom': '#696969'
        };
        
        const bannerText = eventNames[eventType] || 'CHAOS EVENT!';
        const bannerColor = eventColors[eventType] || '#ff0000';
        
        // Create banner - Match CHARACTER SELECTION styling
        this.chaosManager.eventBanner = this.add.text(400, 200, bannerText, {
            fontSize: '40px',
            fontStyle: 'bold',
            fill: bannerColor,
            stroke: '#ffff00',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Animate banner entrance
        this.tweens.add({
            targets: this.chaosManager.eventBanner,
            scaleX: 1.2,
            scaleY: 1.2,
            duration: 500,
            ease: 'Bounce.easeOut',
            yoyo: true,
            repeat: 1
        });
        
        // Auto-remove banner after 3 seconds
        this.time.delayedCall(3000, () => {
            if (this.chaosManager.eventBanner) {
                this.chaosManager.eventBanner.destroy();
                this.chaosManager.eventBanner = null;
            }
        });
    }

    startZeroGravityEvent() {
        console.log('🌀 Zero Gravity Event: Slow motion physics');
        
        // Store original values for restoration
        this.chaosManager.originalGravity = this.physics.world.gravity.y;
        this.chaosManager.originalPlayer1MaxVelocity = this.player1.body.maxVelocity.y;
        this.chaosManager.originalPlayer2MaxVelocity = this.player2.body.maxVelocity.y;
        this.chaosManager.originalBallMaxVelocity = this.ball.body.maxVelocity.y;
        this.chaosManager.originalPlayer1Drag = this.player1.body.drag.x;
        this.chaosManager.originalPlayer2Drag = this.player2.body.drag.x;
        this.chaosManager.originalBallDrag = this.ball.body.drag.x;
        this.chaosManager.originalPlayer1DragY = this.player1.body.drag.y;
        this.chaosManager.originalPlayer2DragY = this.player2.body.drag.y;
        this.chaosManager.originalBallDragY = this.ball.body.drag.y;
        
        // Reduce gravity for slow motion effect
        this.physics.world.gravity.y = 150; // Slower falling, like slow motion
        
        // Slow down all movement for slow motion effect
        this.player1.body.setMaxVelocity(180, 250); // Slower but not too slow
        this.player2.body.setMaxVelocity(180, 250); // Slower but not too slow
        this.ball.body.setMaxVelocity(220, 300); // Slower ball movement
        
        // Keep normal drag - we want slow motion, not floating
        // No drag changes needed for slow motion
    }
    
    endZeroGravityEvent() {
        // Restore original gravity
        this.physics.world.gravity.y = this.chaosManager.originalGravity;
        
        // Restore original max velocities
        this.player1.body.setMaxVelocity(300, this.chaosManager.originalPlayer1MaxVelocity);
        this.player2.body.setMaxVelocity(300, this.chaosManager.originalPlayer2MaxVelocity);
        this.ball.body.setMaxVelocity(350, this.chaosManager.originalBallMaxVelocity);
        
        // Restore original drag values (both X and Y) - only if they were changed
        if (this.chaosManager.originalPlayer1DragY !== undefined) {
            this.player1.body.setDrag(this.chaosManager.originalPlayer1Drag, this.chaosManager.originalPlayer1DragY);
            this.player2.body.setDrag(this.chaosManager.originalPlayer2Drag, this.chaosManager.originalPlayer2DragY);
            this.ball.body.setDrag(this.chaosManager.originalBallDrag, this.chaosManager.originalBallDragY);
        } else {
            // Fallback to just X drag if Y drag wasn't stored
            this.player1.body.setDrag(this.chaosManager.originalPlayer1Drag);
            this.player2.body.setDrag(this.chaosManager.originalPlayer2Drag);
            this.ball.body.setDrag(this.chaosManager.originalBallDrag);
        }
    }
    
    startFlipScreenEvent() {
        console.log('🔄 Flip Screen Event: Flipping camera horizontally');
        this.cameras.main.setRotation(Math.PI); // Rotate 180 degrees (upside down)
        this.chaosManager.screenFlipped = true;
    }
    
    endFlipScreenEvent() {
        console.log('🔄 Flip Screen Event: Restoring camera orientation');
        this.cameras.main.setRotation(0); // Restore normal orientation
        this.chaosManager.screenFlipped = false;
    }
    
    startSpeedBoostEvent() {
        console.log('⚡ Speed Boost Event: Doubling player speeds');
        // Speed boost will be applied in applyChaosEffects
    }
    
    startMeteorDropEvent() {
        console.log('☄️ Meteor Drop Event: Spawning meteors');
        this.chaosManager.meteors = [];
        
        // Create meteors periodically
        const meteorTimer = this.time.addEvent({
            delay: 800,
            callback: () => this.spawnMeteor(),
            repeat: -1
        });
        
        // Store timer for cleanup
        this.chaosManager.meteorTimer = meteorTimer;
    }
    
    spawnMeteor() {
        const meteor = this.add.sprite(Math.random() * 800, -50, 'meteor');
        meteor.setScale(0.3); // Scale down the meteor to smaller size
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
            
            // Stun effect
            this.powers.player1.frozen = true;
            this.powers.player1.frozenUntil = Date.now() + 1000; // 1 second stun
            player.setTint(0xff4500);
            
            // Clear stun
            this.time.delayedCall(1000, () => {
                this.powers.player1.frozen = false;
                this.restorePlayerSkinTint(player, 'player1');
            });
            
            meteor.destroy();
        });
        
        this.physics.add.collider(meteor, this.player2, (meteor, player) => {
            // Apply knockback
            player.setVelocity(
                (player.x - meteor.x) * 2, // Knock away from meteor
                -200 // Upward knock
            );
            
            // Stun effect
            this.powers.player2.frozen = true;
            this.powers.player2.frozenUntil = Date.now() + 1000; // 1 second stun
            player.setTint(0xff4500);
            
            // Clear stun
            this.time.delayedCall(1000, () => {
                this.powers.player2.frozen = false;
                this.restorePlayerSkinTint(player, 'player2');
            });
            
            meteor.destroy();
        });
        
        this.chaosManager.meteors.push(meteor);
        
        // Auto-destroy meteor after 8 seconds
        this.time.delayedCall(8000, () => {
            if (meteor.active) meteor.destroy();
        });
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
    
    startBigHeadEvent() {
        console.log('🧠 Big Head Event: Scaling up player heads');
        // Scale up both players
        this.player1.setScale(this.player1.scaleX * 1.5, this.player1.scaleY * 1.5);
        this.player2.setScale(this.player2.scaleX * 1.5, this.player2.scaleY * 1.5);
    }
    
    startDarkroomEvent() {
        console.log('🌑 Darkroom Event: Creating dark overlay with lights');
        
        // Create dark overlay
        this.chaosManager.darkOverlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.9);
        this.chaosManager.darkOverlay.setDepth(10);
        
        // Create light circles around players and ball
        this.chaosManager.player1Light = this.add.circle(this.player1.x, this.player1.y, 80, 0xffffff, 0.3);
        this.chaosManager.player1Light.setDepth(11);
        this.chaosManager.player1Light.setBlendMode(Phaser.BlendModes.ADD);
        
        this.chaosManager.player2Light = this.add.circle(this.player2.x, this.player2.y, 80, 0xffffff, 0.3);
        this.chaosManager.player2Light.setDepth(11);
        this.chaosManager.player2Light.setBlendMode(Phaser.BlendModes.ADD);
        
        this.chaosManager.ballLight = this.add.circle(this.ball.x, this.ball.y, 60, 0xffffff, 0.3);
        this.chaosManager.ballLight.setDepth(11);
        this.chaosManager.ballLight.setBlendMode(Phaser.BlendModes.ADD);
    }
    
    updateMeteors() {
        // Clean up destroyed meteors
        this.chaosManager.meteors = this.chaosManager.meteors.filter(meteor => meteor.active);
    }
    
    updateDarkroomLights() {
        // Update light positions to follow players and ball
        if (this.chaosManager.player1Light) {
            this.chaosManager.player1Light.x = this.player1.x;
            this.chaosManager.player1Light.y = this.player1.y;
        }
        
        if (this.chaosManager.player2Light) {
            this.chaosManager.player2Light.x = this.player2.x;
            this.chaosManager.player2Light.y = this.player2.y;
        }
        
        if (this.chaosManager.ballLight) {
            this.chaosManager.ballLight.x = this.ball.x;
            this.chaosManager.ballLight.y = this.ball.y;
        }
    }

    endChaosEvent() {
        if (!this.chaosManager.active) return;
        
        const eventType = this.chaosManager.currentEvent;
        console.log(`🌪️ Chaos Event Ended: ${eventType.toUpperCase()}`);
        
        // Clean up event-specific effects
        switch (eventType) {
            case 'zero_gravity':
                this.physics.world.gravity.y = this.chaosManager.originalGravity;
                this.endZeroGravityEvent();
                break;
            case 'flip_screen':
                this.endFlipScreenEvent();
                break;
            case 'speed_boost':
                // Speed boost effects are handled in applyChaosEffects
                break;
            case 'meteor_drop':
                // Clean up meteors
                this.chaosManager.meteors.forEach(meteor => {
                    if (meteor && meteor.active) meteor.destroy();
                });
                this.chaosManager.meteors = [];
                
                // Clean up meteor timer
                if (this.chaosManager.meteorTimer) {
                    this.chaosManager.meteorTimer.destroy();
                    this.chaosManager.meteorTimer = null;
                }
                break;
            case 'ball_clone':
                if (this.chaosManager.clonedBall) {
                    this.chaosManager.clonedBall.destroy();
                    this.chaosManager.clonedBall = null;
                }
                break;
            case 'big_head':
                // Restore original player scales
                this.player1.setScale(this.chaosManager.originalPlayer1Scale.x, this.chaosManager.originalPlayer1Scale.y);
                this.player2.setScale(this.chaosManager.originalPlayer2Scale.x, this.chaosManager.originalPlayer2Scale.y);
                break;
            case 'darkroom':
                if (this.chaosManager.darkOverlay) this.chaosManager.darkOverlay.destroy();
                if (this.chaosManager.player1Light) this.chaosManager.player1Light.destroy();
                if (this.chaosManager.player2Light) this.chaosManager.player2Light.destroy();
                if (this.chaosManager.ballLight) this.chaosManager.ballLight.destroy();
                break;
        }
        
        // Reset chaos manager
        this.chaosManager.active = false;
        this.chaosManager.currentEvent = null;
        this.chaosManager.nextEventTime = Date.now() + this.getRandomChaosDelay();
        
        if (this.chaosManager.eventBanner) {
            this.chaosManager.eventBanner.destroy();
            this.chaosManager.eventBanner = null;
        }
    }

    applyChaosEffects() {
        if (!this.chaosManager.active) return;
        
        const eventType = this.chaosManager.currentEvent;
        
        switch (eventType) {
            case 'speed_boost':
                // Double movement speed during speed boost
                if (this.wasd.A.isDown || this.wasd.D.isDown) {
                    this.player1.body.velocity.x *= 2;
                }
                if (this.cursors.left.isDown || this.cursors.right.isDown) {
                    this.player2.body.velocity.x *= 2;
                }
                break;
            case 'darkroom':
                // Update light positions - handled in updateDarkroomLights
                break;
            case 'flip_screen':
                // Screen flip effects are handled by camera rotation
                break;
            case 'zero_gravity':
                // Gravity effects are handled by physics world gravity
                break;
            case 'meteor_drop':
                // Meteor effects are handled by individual meteor objects
                break;
            case 'ball_clone':
                // Ball clone effects are handled by cloned ball object
                break;
            case 'big_head':
                // Big head effects are handled by scale changes
                break;
        }
    }

    preventBallSqueezing() {
        const p1ToBall = Phaser.Math.Distance.Between(this.player1.x, this.player1.y, this.ball.x, this.ball.y);
        const p2ToBall = Phaser.Math.Distance.Between(this.player2.x, this.player2.y, this.ball.x, this.ball.y);
        const p1ToP2 = Phaser.Math.Distance.Between(this.player1.x, this.player1.y, this.player2.x, this.player2.y);
        
        // If ball is too close to both players, give it a slight push
        if (p1ToBall < 40 && p2ToBall < 40 && p1ToP2 < 80) {
            this.ball.setVelocityY(-100);
        }
    }

    togglePause() {
        if (this.gameOver) return;
        
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        
        // Pause timers
        if (this.matchTimer) {
            this.matchTimer.paused = true;
        }
        if (this.chaosTimer) {
            this.chaosTimer.paused = true;
        }
        if (this.powerTimer) {
            this.powerTimer.paused = true;
        }
        if (this.ballSpeedTimer) {
            this.ballSpeedTimer.paused = true;
        }
        
        this.showPauseMenu();
    }

    resumeGame() {
        this.isPaused = false;
        this.physics.resume();
        
        // Resume timers
        if (this.matchTimer) {
            this.matchTimer.paused = false;
        }
        if (this.chaosTimer) {
            this.chaosTimer.paused = false;
        }
        if (this.powerTimer) {
            this.powerTimer.paused = false;
        }
        if (this.ballSpeedTimer) {
            this.ballSpeedTimer.paused = false;
        }
        
        this.hidePauseMenu();
    }

    showPauseMenu() {
        // Create pause menu backdrop
        this.pauseBackdrop = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.pauseBackdrop.setDepth(1000);
        this.pauseBackdrop.setScrollFactor(0);
        
        // Create pause menu panel
        this.pausePanel = this.add.rectangle(400, 300, 400, 300, 0x000000, 0.95);
        this.pausePanel.setStrokeStyle(4, 0x00ffff);
        this.pausePanel.setDepth(1001);
        this.pausePanel.setScrollFactor(0);
        
        // Pause title
        this.pauseTitle = this.add.text(400, 220, 'GAME PAUSED', {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        this.pauseTitle.setDepth(1002);
        this.pauseTitle.setScrollFactor(0);
        
        // Resume button
        this.resumeBtn = this.add.rectangle(400, 280, 200, 45, 0x000000, 0.9);
        this.resumeBtn.setStrokeStyle(3, 0x00ff00);
        this.resumeBtn.setInteractive();
        this.resumeBtn.setDepth(1002);
        this.resumeBtn.setScrollFactor(0);
        this.resumeBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.resumeGame();
        });
        
        this.resumeText = this.add.text(400, 280, 'RESUME', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        this.resumeText.setDepth(1002);
        this.resumeText.setScrollFactor(0);
        
        // Quit button
        this.quitBtn = this.add.rectangle(400, 340, 200, 45, 0x000000, 0.9);
        this.quitBtn.setStrokeStyle(3, 0xff0000);
        this.quitBtn.setInteractive();
        this.quitBtn.setDepth(1002);
        this.quitBtn.setScrollFactor(0);
        this.quitBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.quitToCharacterSelection();
        });
        
        this.quitText = this.add.text(400, 340, 'QUIT', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        this.quitText.setDepth(1002);
        this.quitText.setScrollFactor(0);
        
        // Add hover effects
        this.resumeBtn.on('pointerover', () => {
            this.resumeBtn.setFillStyle(0x003300, 0.9);
            this.resumeText.setStyle({ fill: '#ffffff' });
        });
        this.resumeBtn.on('pointerout', () => {
            this.resumeBtn.setFillStyle(0x000000, 0.9);
            this.resumeText.setStyle({ fill: '#00ff00' });
        });
        
        this.quitBtn.on('pointerover', () => {
            this.quitBtn.setFillStyle(0x330000, 0.9);
            this.quitText.setStyle({ fill: '#ffffff' });
        });
        this.quitBtn.on('pointerout', () => {
            this.quitBtn.setFillStyle(0x000000, 0.9);
            this.quitText.setStyle({ fill: '#ff0000' });
        });
        
        // Store elements for cleanup
        this.pauseMenuElements = [
            this.pauseBackdrop,
            this.pausePanel,
            this.pauseTitle,
            this.resumeBtn,
            this.resumeText,
            this.quitBtn,
            this.quitText
        ];
    }

    hidePauseMenu() {
        this.pauseMenuElements.forEach(element => {
            if (element) element.destroy();
        });
        this.pauseMenuElements = [];
    }

    quitToCharacterSelection() {
        this.cleanupGameScene();
        this.scene.stop();
        this.scene.start('CharacterSelectionScene');
    }
    
    cleanupGameScene() {
        console.log('🧹 Cleaning up GameScene...');
        
        // Clean up any paused timers
        if (this.matchTimer) {
            this.matchTimer.paused = false;
            this.matchTimer.destroy();
            this.matchTimer = null;
        }
        if (this.chaosTimer) {
            this.chaosTimer.paused = false;
            this.chaosTimer.destroy();
            this.chaosTimer = null;
        }
        if (this.powerTimer) {
            this.powerTimer.paused = false;
            this.powerTimer.destroy();
            this.powerTimer = null;
        }
        if (this.ballSpeedTimer) {
            this.ballSpeedTimer.paused = false;
            this.ballSpeedTimer.destroy();
            this.ballSpeedTimer = null;
        }
        
        // Clean up chaos manager completely
        if (this.chaosManager) {
            // Clean up meteors
            if (this.chaosManager.meteors) {
                this.chaosManager.meteors.forEach(meteor => {
                    if (meteor && meteor.active) meteor.destroy();
                });
            }
            
            // Clean up cloned ball
            if (this.chaosManager.clonedBall && this.chaosManager.clonedBall.active) {
                this.chaosManager.clonedBall.destroy();
            }
            
            // Clean up chaos UI elements
            if (this.chaosManager.eventBanner) {
                this.chaosManager.eventBanner.destroy();
            }
            if (this.chaosManager.darkOverlay) {
                this.chaosManager.darkOverlay.destroy();
            }
            if (this.chaosManager.player1Light) {
                this.chaosManager.player1Light.destroy();
            }
            if (this.chaosManager.player2Light) {
                this.chaosManager.player2Light.destroy();
            }
            if (this.chaosManager.ballLight) {
                this.chaosManager.ballLight.destroy();
            }
            
            // Clean up meteor timer
            if (this.chaosManager.meteorTimer) {
                this.chaosManager.meteorTimer.destroy();
            }
        }
        
        // Clean up pause menu
        this.hidePauseMenu();
        
        // Reset player physics and properties to default
        if (this.player1 && this.player1.body) {
            this.player1.clearTint();
            this.player1.setScale(1);
            this.player1.body.reset(this.player1.x, this.player1.y);
        }
        if (this.player2 && this.player2.body) {
            this.player2.clearTint();
            this.player2.setScale(1);
            this.player2.body.reset(this.player2.x, this.player2.y);
        }
        
        console.log('✅ GameScene cleanup complete');
    }
    
    setupPlayerPhysics(player, spriteConfig, equippedSkin) {
        console.log('⚙️ Setting up fresh player physics for soccer mode...');
        
        // **CRITICAL**: Complete state reset to prevent any fight mode persistence
        player.clearTint();
        player.setAlpha(1); // Reset transparency
        player.setRotation(0); // Reset rotation
        player.setScale(1); // Reset to base scale first
        player.setOrigin(0.5, 0.5); // Reset origin
        player.setFlipX(false); // Reset horizontal flip
        player.setFlipY(false); // Reset vertical flip
        
        // Stop any playing animations and effects
        if (player.anims && player.anims.isPlaying) {
            player.stop();
        }
        
        // Clear any visual effects or tweens
        if (this.tweens) {
            this.tweens.killTweensOf(player);
        }
        
        // Reset ALL physics properties to soccer-specific defaults
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        player.setMass(1);
        player.setDrag(100);
        player.setMaxVelocity(300, 800);
        
        // Force velocity to zero
        player.setVelocity(0, 0);
        player.setAngularVelocity(0);
        
        // **CRITICAL**: Completely destroy and recreate the physics body
        if (player.body) {
            // Store position before destroying body
            const currentX = player.x;
            const currentY = player.y;
            
            // Destroy existing physics body
            if (this.physics && this.physics.world && this.physics.world.bodies) {
                this.physics.world.remove(player.body);
            }
            
            // Create fresh physics body
            this.physics.add.existing(player);
            
            // Restore position
            player.setPosition(currentX, currentY);
            
            console.log('🔄 Physics body completely recreated');
        }
        
        // Apply character-specific configuration with fresh settings
        if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
            // Tiny Heroes configuration for soccer
            player.setScale(2.0);
            player.setOrigin(0.5, 1);
            if (player.body) {
                player.body.setSize(24, 30, true); // Force body size refresh
                player.body.setOffset(4, 2);
                console.log('📏 Applied Tiny Heroes physics: 24x30 body');
            }
        } else {
            // Mini Pixel Pack configuration for soccer
            player.setScale(3.0);
            player.setOrigin(0.5, 1);
            if (player.body) {
                player.body.setSize(16, 16, true); // Force body size refresh
                player.body.setOffset(0, 0);
                console.log('📏 Applied Mini Pixel Pack physics: 16x16 body');
            }
        }
        
        // Apply equipped skin tint AFTER all other setup
        if (equippedSkin && equippedSkin !== 'base') {
            const skinColor = CharacterSpriteHelper.getSkinRarityColor(equippedSkin);
            player.setTint(skinColor);
            console.log(`🎨 Applied skin tint: ${skinColor.toString(16)}`);
        }
        
        // Final validation
        const finalScale = player.scaleX;
        const finalBodySize = player.body ? `${player.body.width}x${player.body.height}` : 'No body';
        console.log(`✅ Soccer player physics setup complete - Scale: ${finalScale}, Body: ${finalBodySize}, Position: ${player.x},${player.y}`);
    }

    switchToFightMode() {
        // Create fight settings using the FULL original time setting (not remaining time)
        const fightSettings = {
            time: selectedMatchSettings.time, // Use full original time
            heartLimit: selectedMatchSettings.goalLimit // Hearts match the original goal limit
        };
        
        console.log(`🥊 Switching to Fight Mode with: ${fightSettings.time}s, ${fightSettings.heartLimit} hearts`);
        
        // Clean up GameScene before switching
        this.cleanupGameScene();
        
        // Switch to fight scene with current settings
        this.scene.start('FightScene', fightSettings);
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

// Fight Scene
class FightScene extends Phaser.Scene {
    constructor() {
        super({ key: 'FightScene' });
        this.gameOver = false;
        this.blastCooldown = 3000; // 3 seconds
        this.player1BlastReady = true;
        this.player2BlastReady = true;
        this.player1LastBlast = 0;
        this.player2LastBlast = 0;
        
        // Initialize with default settings (will be overridden by init() if data is passed)
        this.matchTime = selectedMatchSettings.time;
        this.player1HP = selectedMatchSettings.heartLimit;
        this.player2HP = selectedMatchSettings.heartLimit;
    }

    init(data) {
        // If data is passed from scene.start(), use those settings
        if (data) {
            this.matchTime = data.time;
            this.player1HP = data.heartLimit;
            this.player2HP = data.heartLimit;
        }
        
        // Always reset the game start time when the scene initializes
        this.gameStartTime = Date.now();
        this.gameOver = false;
        
        console.log(`Fight Scene initialized with: ${this.matchTime}s, ${this.player1HP} hearts each`);
    }

    preload() {
        // Load selected background (same as soccer match)
        this.load.image(selectedMap, `assets/Sprites/Backgrounds/${selectedMap}.png`);

        // Get selected characters
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];

        // **CRITICAL FIX**: Use unique texture keys for fight mode to prevent cache conflicts
        console.log('🥊 Loading FightScene sprites with unique texture keys...');
        
        // Load Player 1 character sprites with fight-specific keys
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        if (p1SpriteConfig) {
            if (p1SpriteConfig.type === 'sprite_sheet') {
                this.load.spritesheet('fight_player1_idle', 
                    p1SpriteConfig.basePath + p1SpriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
                this.load.spritesheet('fight_player1_walk', 
                    p1SpriteConfig.basePath + p1SpriteConfig.animations.walk.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                this.load.image('fight_player1_idle', p1SpriteConfig.basePath + p1SpriteConfig.animations.idle.file);
                this.load.image('fight_player1_walk', p1SpriteConfig.basePath + p1SpriteConfig.animations.walk.file);
            }
        }

        // Load Player 2 character sprites with fight-specific keys
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
        if (p2SpriteConfig) {
            if (p2SpriteConfig.type === 'sprite_sheet') {
                this.load.spritesheet('fight_player2_idle', 
                    p2SpriteConfig.basePath + p2SpriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
                this.load.spritesheet('fight_player2_walk', 
                    p2SpriteConfig.basePath + p2SpriteConfig.animations.walk.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                this.load.image('fight_player2_idle', p2SpriteConfig.basePath + p2SpriteConfig.animations.idle.file);
                this.load.image('fight_player2_walk', p2SpriteConfig.basePath + p2SpriteConfig.animations.walk.file);
            }
        }

        // Load ground texture
        this.load.image('grass', 'assets/Sprites/Backgrounds/grass.png');
        
        // Load fight intro image
        this.load.image('fight_intro', 'assets/HUI/Fight/fight.png');
        
        // Load blast effect sprites for each character
        this.loadBlastEffects();

        // Preload sound effects
        SoundManager.preloadSounds(this);
    }

    loadBlastEffects() {
        // Load sprite sheets with proper frame data for animations
        
        // Blaze → Fire sprite sheet with 8 frames (128x128 each) - using FireFreePack
        this.load.spritesheet('fire_blast', 
            'assets/Sprites/Powers/Blaze/FireFreePack/No_compressed/128/Fire_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Volt → Lightning sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('lightning_blast', 
            'assets/Sprites/Powers/Volt/LightningFreePack/128/Lightning_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Whirlwind → Energy sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('energy_blast', 
            'assets/Sprites/Powers/WhirlWind/EnergyFreePack/No_compressed/128/Energy_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Frostbite → Keep individual ice sprites (smaller size)
        this.load.image('ice_blast', 'assets/Sprites/Powers/Frostbite/ice_shard/I5050-1.png');
        
        // Brick → Smoke sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('smoke_blast', 
            'assets/Sprites/Powers/Brick/SmokeFreePack_v2/NoCompressed/128/Smoke_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Jellyhead → Load slime sprite sheet (same as soccer mode)
        this.load.spritesheet('jellyhead_slime', 
            'assets/Sprites/Powers/JellyHead/Slime-Sheet.png',
            { frameWidth: 52, frameHeight: 55 }
        );
    }

    create() {
        // Add background
        this.add.image(0, 0, selectedMap)
            .setOrigin(0)
            .setDepth(-1)
            .setScrollFactor(0)
            .setScale(1.39, 1.85);

        // Create ground
        const ground = this.add.image(400, 575, 'grass');
        ground.setOrigin(0.5, 0.5);
        ground.setDisplaySize(800, 50);
        this.physics.add.existing(ground, true);

        // **VALIDATION**: Ensure character selections are valid
        if (!selectedCharacters.player1 || !selectedCharacters.player2) {
            console.error('🚨 Invalid character selection detected in FightScene!', selectedCharacters);
            // Fallback to default characters
            selectedCharacters.player1 = selectedCharacters.player1 || 'blaze';
            selectedCharacters.player2 = selectedCharacters.player2 || 'frostbite';
            console.log('🔧 Using fallback characters in FightScene:', selectedCharacters);
        }
        
        // Get selected characters and their sprite configs
        const p1Character = CHARACTERS[selectedCharacters.player1];
        const p2Character = CHARACTERS[selectedCharacters.player2];
        const p1SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p1Character.sprite.category, p1Character.sprite.id);
        const p2SpriteConfig = CharacterSpriteHelper.getCharacterConfig(p2Character.sprite.category, p2Character.sprite.id);
        
        console.log(`🥊 FightScene starting with: P1=${selectedCharacters.player1}, P2=${selectedCharacters.player2}`);

        // Create players with fight-specific texture keys
        this.player1 = this.physics.add.sprite(200, 450, 'fight_player1_idle');
        this.player1.setBounce(0.2);
        this.player1.setCollideWorldBounds(true);
        this.player1.setMass(1);
        this.player1.setDrag(100);
        this.player1.setMaxVelocity(300, 800);

        this.player2 = this.physics.add.sprite(600, 450, 'fight_player2_idle');
        this.player2.setBounce(0.2);
        this.player2.setCollideWorldBounds(true);
        this.player2.setMass(1);
        this.player2.setDrag(100);
        this.player2.setMaxVelocity(300, 800);

        // Set player scales and collision bodies
        this.setupPlayerSprite(this.player1, p1SpriteConfig);
        this.setupPlayerSprite(this.player2, p2SpriteConfig);

        // Apply equipped skin tints
        const p1EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player1', selectedCharacters.player1);
        const p2EquippedSkin = PLAYER_PROGRESS.getEquippedSkin('player2', selectedCharacters.player2);
        
        if (p1EquippedSkin !== 'base') {
            this.player1.setTint(CharacterSpriteHelper.getSkinRarityColor(p1EquippedSkin));
        }
        if (p2EquippedSkin !== 'base') {
            this.player2.setTint(CharacterSpriteHelper.getSkinRarityColor(p2EquippedSkin));
        }

        // Create animations
        this.createPlayerAnimations(p1SpriteConfig, p2SpriteConfig);

        // Start with idle animations (only if they exist)
        if (this.anims.exists('fight_player1_idle_anim')) {
            this.player1.play('fight_player1_idle_anim');
        }
        if (this.anims.exists('fight_player2_idle_anim')) {
            this.player2.play('fight_player2_idle_anim');
        }

        // Physics collisions
        this.physics.add.collider(this.player1, ground);
        this.physics.add.collider(this.player2, ground);
        this.physics.add.collider(this.player1, this.player2, this.handlePlayerCollision, null, this);

        // Create controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasd = this.input.keyboard.addKeys('W,S,A,D');
        this.blastKeys = this.input.keyboard.addKeys('E,K');

        // Add pause keys (ESC and P)
        this.input.keyboard.on('keydown-ESC', () => {
            this.togglePause();
        });
        this.input.keyboard.on('keydown-P', () => {
            this.togglePause();
        });

        // Initialize pause state
        this.isPaused = false;
        this.pauseMenuElements = [];
        this.fightIntroActive = false;

        // Create UI
        this.createFightUI();
        
        // Create blast animations
        this.createBlastAnimations();
        
        // Show fight intro animation before allowing gameplay
        this.showFightIntro();
    }

    setupPlayerSprite(player, spriteConfig) {
        console.log('⚙️ Setting up FightScene player sprite...');
        
        // **CRITICAL**: Clear any existing properties and reset to defaults
        player.clearTint();
        player.setScale(1);
        player.setOrigin(0.5, 0.5);
        
        // Reset velocity to zero
        player.setVelocity(0, 0);
        
        // Completely reset the physics body
        if (player.body) {
            player.body.reset(player.x, player.y);
        }
        
        // Apply character-specific configuration with fresh settings
        if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
            player.setScale(2.0);
            player.setOrigin(0.5, 1);
            player.body.setSize(24, 30, true); // Force body size refresh
            player.body.setOffset(4, 2);
        } else {
            player.setScale(3.0);
            player.setOrigin(0.5, 1);
            player.body.setSize(16, 16, true); // Force body size refresh
            player.body.setOffset(0, 0);
        }
        
        console.log(`✅ FightScene player setup complete - Scale: ${player.scaleX}, Body: ${player.body.width}x${player.body.height}`);
    }

    restorePlayerSkinTint(playerSprite, playerId) {
        // Get the selected character and equipped skin for this player
        const selectedCharacter = playerId === 'player1' ? selectedCharacters.player1 : selectedCharacters.player2;
        const progress = PLAYER_PROGRESS.loadPlayerProgress(playerId);
        const equippedSkin = progress.equippedSkins[selectedCharacter] || 'base';
        
        // Clear any existing tint first
        playerSprite.clearTint();
        
        // Apply the equipped skin tint if it's not base
        if (equippedSkin !== 'base') {
            const skinColor = CharacterSpriteHelper.getSkinRarityColor(equippedSkin);
            playerSprite.setTint(skinColor);
        }
    }

    createPlayerAnimations(p1SpriteConfig, p2SpriteConfig) {
        console.log('🥊 Creating FightScene player animations...');
        
        // **CRITICAL FIX**: Clear existing fight animations to prevent duplication
        const fightAnimsToRemove = [
            'fight_player1_idle_anim', 'fight_player1_walk_anim',
            'fight_player2_idle_anim', 'fight_player2_walk_anim',
            // Also clear any soccer animations that might still exist
            'player1_idle_anim', 'player1_walk_anim',
            'player2_idle_anim', 'player2_walk_anim'
        ];
        
        fightAnimsToRemove.forEach(key => {
            if (this.anims.exists(key)) {
                this.anims.remove(key);
                console.log(`🗑️ Removed existing animation: ${key}`);
            }
        });
        
        // Create Player 1 animations with fight-specific keys and existence checks
        if (p1SpriteConfig.type === 'sprite_sheet') {
            if (!this.anims.exists('fight_player1_idle_anim')) {
                this.anims.create({
                    key: 'fight_player1_idle_anim',
                    frames: this.anims.generateFrameNumbers('fight_player1_idle', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });
                console.log('✅ Created fight_player1_idle_anim');
            }
            
            if (!this.anims.exists('fight_player1_walk_anim')) {
                this.anims.create({
                    key: 'fight_player1_walk_anim',
                    frames: this.anims.generateFrameNumbers('fight_player1_walk', { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
                console.log('✅ Created fight_player1_walk_anim');
            }
        }
        // Note: Mini Pixel Pack characters don't need animations - they use static sprites

        // Create Player 2 animations with fight-specific keys and existence checks
        if (p2SpriteConfig.type === 'sprite_sheet') {
            if (!this.anims.exists('fight_player2_idle_anim')) {
                this.anims.create({
                    key: 'fight_player2_idle_anim',
                    frames: this.anims.generateFrameNumbers('fight_player2_idle', { start: 0, end: 3 }),
                    frameRate: 8,
                    repeat: -1
                });
                console.log('✅ Created fight_player2_idle_anim');
            }
            
            if (!this.anims.exists('fight_player2_walk_anim')) {
                this.anims.create({
                    key: 'fight_player2_walk_anim',
                    frames: this.anims.generateFrameNumbers('fight_player2_walk', { start: 0, end: 5 }),
                    frameRate: 10,
                    repeat: -1
                });
                console.log('✅ Created fight_player2_walk_anim');
            }
        }
        // Note: Mini Pixel Pack characters don't need animations - they use static sprites
        
        console.log('🥊 FightScene player animations setup complete');
    }

    createFightUI() {
        // Title - Match CHARACTER SELECTION styling
        this.add.text(400, 30, '⚔️ FIGHT MODE ⚔️', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Timer display - Arcade style (centered, prominent)
        this.timerText = this.add.text(400, 70, `TIME: ${this.matchTime}`, {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Player 1 HP Hearts
        this.player1Hearts = [];
        for (let i = 0; i < this.player1HP; i++) {
            const heart = this.add.text(50 + (i * 40), 110, '❤️', {
                fontSize: '24px'
            });
            this.player1Hearts.push(heart);
        }

        // Player 2 HP Hearts
        this.player2Hearts = [];
        for (let i = 0; i < this.player2HP; i++) {
            const heart = this.add.text(710 - (i * 40), 110, '❤️', {
                fontSize: '24px'
            });
            this.player2Hearts.push(heart);
        }

        // Player names - Arcade style
        this.add.text(50, 140, `PLAYER 1: ${CHARACTERS[selectedCharacters.player1].name.toUpperCase()}`, {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        });

        this.add.text(750, 140, `PLAYER 2: ${CHARACTERS[selectedCharacters.player2].name.toUpperCase()}`, {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#0080ff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(1, 0);

        // Blast cooldown displays - Arcade style
        this.player1BlastText = this.add.text(50, 170, 'BLAST: READY [E]', {
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        });

        this.player2BlastText = this.add.text(750, 170, 'BLAST: READY [K]', {
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#0080ff',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(1, 0);

        // Pause button (blue circle in top right) - Arcade style
        this.pauseButton = this.add.circle(750, 50, 20, 0x0080ff, 0.9);
        this.pauseButton.setStrokeStyle(3, 0x00ffff);
        this.pauseButton.setInteractive();
        this.pauseButton.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.togglePause();
        });
        
        // Pause symbol (two vertical bars)
        this.pauseSymbol1 = this.add.rectangle(745, 50, 4, 16, 0xffffff);
        this.pauseSymbol2 = this.add.rectangle(755, 50, 4, 16, 0xffffff);
        
        // Add hover effect for pause button
        this.pauseButton.on('pointerover', () => {
            this.pauseButton.setFillStyle(0x0066cc, 0.9);
            this.pauseButton.setStrokeStyle(3, 0x00ffff);
        });
        this.pauseButton.on('pointerout', () => {
            this.pauseButton.setFillStyle(0x0080ff, 0.9);
            this.pauseButton.setStrokeStyle(3, 0x00ffff);
        });
    }

    createBlastAnimations() {
        // Create animations for sprite sheet-based powers
        
        // Fire blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'blaze_blast_anim',
            frames: this.anims.generateFrameNumbers('fire_blast', { start: 0, end: 7 }),
            frameRate: 12,
            repeat: -1
        });

        // Lightning blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'volt_blast_anim',
            frames: this.anims.generateFrameNumbers('lightning_blast', { start: 0, end: 7 }),
            frameRate: 15,
            repeat: -1
        });

        // Energy blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'whirlwind_blast_anim',
            frames: this.anims.generateFrameNumbers('energy_blast', { start: 0, end: 7 }),
            frameRate: 10,
            repeat: -1
        });

        // Smoke blast animation (8 frames) - key matches character name
        this.anims.create({
            key: 'brick_blast_anim',
            frames: this.anims.generateFrameNumbers('smoke_blast', { start: 0, end: 7 }),
            frameRate: 8,
            repeat: -1
        });

        // Jellyhead slime animation (same as soccer mode)
        this.anims.create({
            key: 'jellyhead_slime_anim',
            frames: this.anims.generateFrameNumbers('jellyhead_slime', { start: 16, end: 23 }),
            frameRate: 8,
            repeat: -1
        });
    }

    showFightIntro() {
        // Set fight intro as active to disable player controls
        this.fightIntroActive = true;
        
        // Play fight intro sound
        SoundManager.playFightIntroSound(this);
        
        // Create the fight intro image in the center of the screen
        const fightIntro = this.add.image(400, 300, 'fight_intro');
        fightIntro.setOrigin(0.5);
        fightIntro.setDepth(1000); // High depth to appear above everything
        fightIntro.setScale(0.1); // Start very small
        fightIntro.setAlpha(0); // Start invisible
        
        // Animation sequence
        this.tweens.add({
            targets: fightIntro,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                // Keep at full size for the display duration
                this.tweens.add({
                    targets: fightIntro,
                    scaleX: 1.0,
                    scaleY: 1.0,
                    duration: 400,
                    ease: 'Power2.easeInOut',
                    onComplete: () => {
                        // After 1 second total, zoom out and fade
                        this.tweens.add({
                            targets: fightIntro,
                            scaleX: 2.0,
                            scaleY: 2.0,
                            alpha: 0,
                            duration: 300,
                            ease: 'Back.easeIn',
                            onComplete: () => {
                                // Remove the intro image and enable gameplay
                                fightIntro.destroy();
                                this.fightIntroActive = false;
                                console.log('🥊 Fight intro complete - players can now fight!');
                            }
                        });
                    }
                });
            }
        });
    }

    togglePause() {
        if (this.gameOver) return;
        
        if (this.isPaused) {
            this.resumeGame();
        } else {
            this.pauseGame();
        }
    }

    pauseGame() {
        this.isPaused = true;
        this.physics.pause();
        
        // Pause timers
        if (this.matchTimer) {
            this.matchTimer.paused = true;
        }
        if (this.chaosTimer) {
            this.chaosTimer.paused = true;
        }
        if (this.powerTimer) {
            this.powerTimer.paused = true;
        }
        if (this.ballSpeedTimer) {
            this.ballSpeedTimer.paused = true;
        }
        
        this.showPauseMenu();
    }

    resumeGame() {
        this.isPaused = false;
        this.physics.resume();
        
        // Resume timers
        if (this.matchTimer) {
            this.matchTimer.paused = false;
        }
        if (this.chaosTimer) {
            this.chaosTimer.paused = false;
        }
        if (this.powerTimer) {
            this.powerTimer.paused = false;
        }
        if (this.ballSpeedTimer) {
            this.ballSpeedTimer.paused = false;
        }
        
        this.hidePauseMenu();
    }

    showPauseMenu() {
        // Create pause menu backdrop
        this.pauseBackdrop = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        this.pauseBackdrop.setDepth(1000);
        this.pauseBackdrop.setScrollFactor(0);
        
        // Create pause menu panel
        this.pausePanel = this.add.rectangle(400, 300, 400, 300, 0x000000, 0.95);
        this.pausePanel.setStrokeStyle(4, 0x00ffff);
        this.pausePanel.setDepth(1001);
        this.pausePanel.setScrollFactor(0);
        
        // Pause title
        this.pauseTitle = this.add.text(400, 220, 'FIGHT PAUSED', {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        this.pauseTitle.setDepth(1002);
        this.pauseTitle.setScrollFactor(0);
        
        // Resume button
        this.resumeBtn = this.add.rectangle(400, 280, 200, 45, 0x000000, 0.9);
        this.resumeBtn.setStrokeStyle(3, 0x00ff00);
        this.resumeBtn.setInteractive();
        this.resumeBtn.setDepth(1002);
        this.resumeBtn.setScrollFactor(0);
        this.resumeBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.resumeGame();
        });
        
        this.resumeText = this.add.text(400, 280, 'RESUME', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        this.resumeText.setDepth(1002);
        this.resumeText.setScrollFactor(0);
        
        // Quit button
        this.quitBtn = this.add.rectangle(400, 340, 200, 45, 0x000000, 0.9);
        this.quitBtn.setStrokeStyle(3, 0xff0000);
        this.quitBtn.setInteractive();
        this.quitBtn.setDepth(1002);
        this.quitBtn.setScrollFactor(0);
        this.quitBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.quitToCharacterSelection();
        });
        
        this.quitText = this.add.text(400, 340, 'QUIT', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        this.quitText.setDepth(1002);
        this.quitText.setScrollFactor(0);
        
        // Add hover effects
        this.resumeBtn.on('pointerover', () => {
            this.resumeBtn.setFillStyle(0x003300, 0.9);
            this.resumeText.setStyle({ fill: '#ffffff' });
        });
        this.resumeBtn.on('pointerout', () => {
            this.resumeBtn.setFillStyle(0x000000, 0.9);
            this.resumeText.setStyle({ fill: '#00ff00' });
        });
        
        this.quitBtn.on('pointerover', () => {
            this.quitBtn.setFillStyle(0x330000, 0.9);
            this.quitText.setStyle({ fill: '#ffffff' });
        });
        this.quitBtn.on('pointerout', () => {
            this.quitBtn.setFillStyle(0x000000, 0.9);
            this.quitText.setStyle({ fill: '#ff0000' });
        });
        
        // Store elements for cleanup
        this.pauseMenuElements = [
            this.pauseBackdrop,
            this.pausePanel,
            this.pauseTitle,
            this.resumeBtn,
            this.resumeText,
            this.quitBtn,
            this.quitText
        ];
    }

    hidePauseMenu() {
        this.pauseMenuElements.forEach(element => {
            if (element) element.destroy();
        });
        this.pauseMenuElements = [];
    }

    quitToCharacterSelection() {
        console.log('🏠 Quitting FightScene to Character Selection...');
        
        // Clean up safely first
        this.cleanupFightScene();
        
        // Stop the scene and transition with delay
        this.scene.stop();
        
        // Use game-level scene manager for safer transition
        this.scene.manager.start('CharacterSelectionScene');
    }
    
    cleanupFightScene() {
        console.log('🧹 Cleaning up FightScene safely...');
        
        try {
            // **STEP 1**: First destroy all sprites that might be using textures
            if (this.player1) {
                try {
                    console.log('🗑️ Destroying player1 sprite...');
                    this.player1.destroy(true);
                    this.player1 = null;
                    console.log('✅ Player1 destroyed successfully');
                } catch (error) {
                    console.error('❌ Error destroying player1:', error.message);
                    this.player1 = null;
                }
            } else {
                console.log('ℹ️ Player1 already null, skipping destroy');
            }
            
            if (this.player2) {
                try {
                    console.log('🗑️ Destroying player2 sprite...');
                    this.player2.destroy(true);
                    this.player2 = null;
                    console.log('✅ Player2 destroyed successfully');
                } catch (error) {
                    console.error('❌ Error destroying player2:', error.message);
                    this.player2 = null;
                }
            } else {
                console.log('ℹ️ Player2 already null, skipping destroy');
            }
        
        // **STEP 2**: Clear all fight-specific animations BEFORE removing textures
        const fightAnims = [
            'fight_player1_idle_anim', 'fight_player1_walk_anim',
            'fight_player2_idle_anim', 'fight_player2_walk_anim'
        ];
        
        fightAnims.forEach(key => {
            if (this.anims && this.anims.exists(key)) {
                try {
                    this.anims.remove(key);
                    console.log(`🗑️ Cleared fight animation: ${key}`);
                } catch (error) {
                    console.error(`❌ Error clearing animation ${key}:`, error.message);
                }
            }
        });
        
        // **STEP 3**: Force a small delay to let renderer process sprite destruction
        console.log('⏱️ Allowing renderer to process sprite destruction...');
        
        // **STEP 4**: Skip texture removal during scene transition to prevent errors
        // Textures will be cleaned up automatically when CharacterSelectionScene reloads them
        console.log('⚠️ Skipping texture removal to prevent rendering errors during transition');
        console.log('✅ Fight textures will be cleared by CharacterSelectionScene init()');
        
        // Instead, just mark the textures as unused
        const fightTextures = [
            'fight_player1_idle', 'fight_player1_walk',
            'fight_player2_idle', 'fight_player2_walk'
        ];
        
        console.log(`📋 Fight textures to be cleared later: ${fightTextures.join(', ')}`);
        
        // Clean up any paused timers
        if (this.matchTimer) {
            this.matchTimer.paused = false;
            this.matchTimer.destroy();
            this.matchTimer = null;
        }
        if (this.chaosTimer) {
            this.chaosTimer.paused = false;
            this.chaosTimer.destroy();
            this.chaosTimer = null;
        }
        if (this.powerTimer) {
            this.powerTimer.paused = false;
            this.powerTimer.destroy();
            this.powerTimer = null;
        }
        if (this.ballSpeedTimer) {
            this.ballSpeedTimer.paused = false;
            this.ballSpeedTimer.destroy();
            this.ballSpeedTimer = null;
        }
        
        // Clean up fight-specific elements
        if (this.blasts) {
            this.blasts.forEach(blast => {
                if (blast && blast.active) blast.destroy();
            });
            this.blasts = [];
        }
        
        // Clean up pause menu
        this.hidePauseMenu();
        
        // **STEP 5**: Since we've destroyed sprites above, skip individual property reset
        console.log('✅ Players already destroyed - skipping individual property reset');
        
        // Clear any tweens or effects
        if (this.tweens) {
            this.tweens.killAll();
        }
        
        console.log('✅ FightScene comprehensive cleanup complete');
        
        } catch (globalError) {
            console.error('❌ Critical error during FightScene cleanup:', globalError.message);
            console.log('🔧 Continuing despite cleanup error...');
        }
    }

    handlePlayerCollision(player1, player2) {
        // Simple knockback effect
        const pushForce = 100;
        if (player1.x < player2.x) {
            player1.setVelocityX(-pushForce);
            player2.setVelocityX(pushForce);
        } else {
            player1.setVelocityX(pushForce);
            player2.setVelocityX(-pushForce);
        }
    }

    update() {
        if (this.gameOver || this.isPaused || this.fightIntroActive) return;

        // Update match timer
        this.updateMatchTimer();

        // Update blast cooldowns
        this.updateBlastCooldowns();

        // Player 1 movement (WASD)
        if (this.wasd.A.isDown) {
            this.player1.setVelocityX(-200);  // Increased from -160 for faster movement
            this.player1.setFlipX(true);
            if (this.player1.body.touching.down && this.anims.exists('fight_player1_walk_anim')) {
                this.player1.play('fight_player1_walk_anim', true);
            }
        } else if (this.wasd.D.isDown) {
            this.player1.setVelocityX(200);   // Increased from 160 for faster movement
            this.player1.setFlipX(false);
            if (this.player1.body.touching.down && this.anims.exists('fight_player1_walk_anim')) {
                this.player1.play('fight_player1_walk_anim', true);
            }
        } else {
            this.player1.setVelocityX(0);
            if (this.player1.body.touching.down && this.anims.exists('fight_player1_idle_anim')) {
                this.player1.play('fight_player1_idle_anim', true);
            }
        }

        if (this.wasd.W.isDown && this.player1.body.touching.down) {
            this.player1.setVelocityY(-360);  // Reduced from -400 for lower jump height
        }

        // Player 2 movement (Arrow keys)
        if (this.cursors.left.isDown) {
            this.player2.setVelocityX(-200);  // Increased from -160 for faster movement
            this.player2.setFlipX(true);
            if (this.player2.body.touching.down && this.anims.exists('fight_player2_walk_anim')) {
                this.player2.play('fight_player2_walk_anim', true);
            }
        } else if (this.cursors.right.isDown) {
            this.player2.setVelocityX(200);   // Increased from 160 for faster movement
            this.player2.setFlipX(false);
            if (this.player2.body.touching.down && this.anims.exists('fight_player2_walk_anim')) {
                this.player2.play('fight_player2_walk_anim', true);
            }
        } else {
            this.player2.setVelocityX(0);
            if (this.player2.body.touching.down && this.anims.exists('fight_player2_idle_anim')) {
                this.player2.play('fight_player2_idle_anim', true);
            }
        }

        if (this.cursors.up.isDown && this.player2.body.touching.down) {
            this.player2.setVelocityY(-360);  // Reduced from -400 for lower jump height
        }

        // Blast attacks
        if (this.blastKeys.E.isDown && this.player1BlastReady) {
            this.fireBlast('player1');
        }

        if (this.blastKeys.K.isDown && this.player2BlastReady) {
            this.fireBlast('player2');
        }
    }

    updateBlastCooldowns() {
        const currentTime = Date.now();

        // Update Player 1 blast cooldown - Arcade style
        if (!this.player1BlastReady) {
            const timeLeft = Math.max(0, this.blastCooldown - (currentTime - this.player1LastBlast));
            if (timeLeft <= 0) {
                this.player1BlastReady = true;
                this.player1BlastText.setText('BLAST: READY [E]');
                this.player1BlastText.setStyle({ 
                    fill: '#00ff00',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
                });
            } else {
                this.player1BlastText.setText(`BLAST: ${(timeLeft/1000).toFixed(1)}S`);
                this.player1BlastText.setStyle({ 
                    fill: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
                });
            }
        }

        // Update Player 2 blast cooldown - Arcade style
        if (!this.player2BlastReady) {
            const timeLeft = Math.max(0, this.blastCooldown - (currentTime - this.player2LastBlast));
            if (timeLeft <= 0) {
                this.player2BlastReady = true;
                this.player2BlastText.setText('BLAST: READY [K]');
                this.player2BlastText.setStyle({ 
                    fill: '#0080ff',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
                });
            } else {
                this.player2BlastText.setText(`BLAST: ${(timeLeft/1000).toFixed(1)}S`);
                this.player2BlastText.setStyle({ 
                    fill: '#ff0000',
                    stroke: '#000000',
                    strokeThickness: 2,
                    shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
                });
            }
        }
    }

    updateMatchTimer() {
        // Only update if timer text exists
        if (!this.timerText) return;
        
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - this.gameStartTime) / 1000);
        const remainingTime = Math.max(0, this.matchTime - elapsedTime);

        this.timerText.setText(`TIME: ${remainingTime}`);

        // Check for time up (only if some time has actually passed to avoid immediate timeout)
        if (remainingTime <= 0 && !this.gameOver && elapsedTime >= this.matchTime) {
            this.handleTimeUp();
        }
    }

    handleTimeUp() {
        this.gameOver = true;
        
        // Determine winner based on remaining HP
        let winner;
        if (this.player1HP > this.player2HP) {
            winner = 'Player 1';
        } else if (this.player2HP > this.player1HP) {
            winner = 'Player 2';
        } else {
            winner = 'Draw';
        }
        
        this.handleFightEnd(winner);
    }

    fireBlast(player) {
        const isPlayer1 = player === 'player1';
        const playerSprite = isPlayer1 ? this.player1 : this.player2;
        const opponent = isPlayer1 ? this.player2 : this.player1;
        const characterKey = isPlayer1 ? selectedCharacters.player1 : selectedCharacters.player2;
        const character = CHARACTERS[characterKey];

        // Play character-specific power sound effect
        SoundManager.playCharacterPower(this, character.name);

        // Set blast on cooldown
        if (isPlayer1) {
            this.player1BlastReady = false;
            this.player1LastBlast = Date.now();
        } else {
            this.player2BlastReady = false;
            this.player2LastBlast = Date.now();
        }

        // Create blast projectile
        this.createBlastProjectile(playerSprite, opponent, characterKey, isPlayer1);
    }

    createBlastProjectile(player, opponent, characterKey, isPlayer1) {
        const direction = player.flipX ? -1 : 1;
        const startX = player.x + (direction * 40);
        const startY = player.y - 30;

        // Create projectile based on character type
        const blastTexture = this.getBlastTexture(characterKey);
        let blast;
        
        // Create sprite or animated sprite based on character
        if (characterKey === 'frostbite') {
            // Frostbite uses static ice sprite (very small)
            blast = this.add.image(startX, startY, blastTexture);
            blast.setScale(0.3);
        } else if (characterKey === 'jellyhead') {
            // Jellyhead uses slime sprite (same as soccer mode)
            blast = this.add.sprite(startX, startY, blastTexture);
            blast.setScale(0.5); // Smaller when shot (same as soccer mode)
            blast.play('jellyhead_slime_anim');
        } else {
            // Other characters use animated sprites - make them bigger
            blast = this.add.sprite(startX, startY, blastTexture);
            
            // Set scale based on character for better visibility
            if (characterKey === 'brick') {
                blast.setScale(1.1); // Make Brick's smoke blast bigger for visibility
            } else {
                blast.setScale(0.9); // Normal size for other animated sprites
            }
            
            // Play the appropriate animation
            const animKey = `${characterKey}_blast_anim`;
            blast.play(animKey);
        }
        
        // Add physics
        this.physics.add.existing(blast);
        
        // Set collision body for dodging - slightly smaller than visual
        blast.body.setSize(blast.width * 0.7, blast.height * 0.7);

        // Set projectile velocity - faster and more direct
        blast.body.setVelocity(direction * 500, -60);
        blast.body.setGravityY(120);

        // Add slight rotation for dynamics
        blast.setRotation(direction > 0 ? 0.2 : -0.2);

        // Improved collision detection - only hits if actually touching
        const collider = this.physics.add.overlap(blast, opponent, () => {
            this.handleBlastHit(opponent, isPlayer1);
            this.createBlastImpactEffect(blast.x, blast.y, characterKey);
            blast.destroy();
        });

        // Auto-destroy after 2.5 seconds
        this.time.delayedCall(2500, () => {
            if (blast.active) {
                this.createBlastImpactEffect(blast.x, blast.y, characterKey);
                blast.destroy();
            }
        });

        // Add simple launch effect
        this.createSimpleLaunchEffect(player, characterKey);
    }

    getBlastTexture(characterKey) {
        const textureMap = {
            'blaze': 'fire_blast',
            'volt': 'lightning_blast',
            'whirlwind': 'energy_blast',
            'frostbite': 'ice_blast',
            'brick': 'smoke_blast',
            'jellyhead': 'jellyhead_slime'
        };
        return textureMap[characterKey] || 'energy_blast';
    }

    createSimpleLaunchEffect(player, characterKey) {
        // Create simple launch effect for smaller projectiles
        const effectColor = CHARACTERS[characterKey].color;
        
        // Create a simple burst effect around the player
        for (let i = 0; i < 6; i++) {
            const particle = this.add.circle(player.x, player.y - 15, 4, effectColor);
            particle.setAlpha(0.8);
            particle.setDepth(10);
            
            const angle = (i * Math.PI * 2) / 6;
            const speed = 40 + Math.random() * 20;
            
            this.tweens.add({
                targets: particle,
                x: player.x + Math.cos(angle) * speed,
                y: player.y - 15 + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 1.2,
                scaleY: 1.2,
                duration: 300,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }



    createBlastImpactEffect(x, y, characterKey) {
        // Create simple impact effect for smaller projectiles
        const effectColor = CHARACTERS[characterKey].color;
        
        // Light screen shake for impact
        this.cameras.main.shake(100, 0.01);
        
        // Create simple impact particles
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(x, y, 3, effectColor);
            particle.setAlpha(0.9);
            particle.setDepth(15);
            
            const angle = (i * Math.PI * 2) / 8;
            const speed = 30 + Math.random() * 20;
            
            this.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * speed,
                y: y + Math.sin(angle) * speed,
                alpha: 0,
                scaleX: 1.3,
                scaleY: 1.3,
                duration: 400,
                ease: 'Power2',
                onComplete: () => particle.destroy()
            });
        }
    }



    handleBlastHit(opponent, attackerIsPlayer1) {
        const isOpponentPlayer1 = opponent === this.player1;
        
        // Deal damage
        if (isOpponentPlayer1) {
            this.player1HP--;
            this.updateHeartsDisplay();
        } else {
            this.player2HP--;
            this.updateHeartsDisplay();
        }

        // Play bruh sound when player gets hit
        SoundManager.playBruhSound(this);

        // Apply knockback
        const knockbackForce = attackerIsPlayer1 ? 300 : -300;
        opponent.setVelocity(knockbackForce, -200);

        // Visual feedback
        opponent.setTint(0xff0000);
        this.cameras.main.shake(200, 0.02);
        
        this.time.delayedCall(300, () => {
            // Restore original tint using centralized function
            const opponentId = isOpponentPlayer1 ? 'player1' : 'player2';
            this.restorePlayerSkinTint(opponent, opponentId);
        });

        // Check for fight end
        if (this.player1HP <= 0 || this.player2HP <= 0) {
            this.handleFightEnd();
        }
    }

    updateHeartsDisplay() {
        // Update Player 1 hearts - loop through all hearts, not just 3
        for (let i = 0; i < this.player1Hearts.length; i++) {
            if (i < this.player1HP) {
                this.player1Hearts[i].setText('❤️');
            } else {
                this.player1Hearts[i].setText('💔');
            }
        }

        // Update Player 2 hearts - loop through all hearts, not just 3
        for (let i = 0; i < this.player2Hearts.length; i++) {
            if (i < this.player2HP) {
                this.player2Hearts[i].setText('❤️');
            } else {
                this.player2Hearts[i].setText('💔');
            }
        }
    }

    handleFightEnd(winner = null) {
        console.log('🏁 Fight ending, setting gameOver = true');
        this.gameOver = true;
        this.isTransitioning = false; // Reset transition flag for end screen
        
        // Use provided winner or determine based on HP
        const finalWinner = winner || (this.player1HP > 0 ? 'Player 1' : 'Player 2');
        console.log(`🏆 Fight winner: ${finalWinner}`);
        
        // Play victory sound (unless it's a draw)
        if (finalWinner !== 'Draw') {
            SoundManager.playVictorySound(this);
        }
        
        // Create overlay
        const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Winner announcement - Match CHARACTER SELECTION styling
        const winnerText = finalWinner === 'Draw' ? 'DRAW!' : `${finalWinner.toUpperCase()} WINS THE FIGHT!`;
        this.add.text(400, 200, winnerText, {
            fontSize: '48px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Restart fight button - Match MAP SELECTION "START MATCH" button styling
        const restartBtnBg = this.add.rectangle(280, 350, 220, 45, 0x000000, 0.9);
        restartBtnBg.setStrokeStyle(4, 0xffff00);
        restartBtnBg.setInteractive();
        
        const restartBtn = this.add.text(280, 350, 'RESTART FIGHT [R]', {
            fontSize: '17px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Character select button - Match MAP SELECTION "START MATCH" button styling
        const selectBtnBg = this.add.rectangle(520, 350, 220, 45, 0x000000, 0.9);
        selectBtnBg.setStrokeStyle(4, 0xffff00);
        selectBtnBg.setInteractive();
        
        const selectBtn = this.add.text(520, 350, 'CHARACTER SELECT [C]', {
            fontSize: '17px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Add hover effects for Restart button
        restartBtnBg.on('pointerover', () => {
            restartBtnBg.setFillStyle(0x333300, 0.9);
            restartBtnBg.setStrokeStyle(4, 0xffff00);
            restartBtn.setStyle({ fill: '#ffffff' });
        });
        restartBtnBg.on('pointerout', () => {
            restartBtnBg.setFillStyle(0x000000, 0.9);
            restartBtnBg.setStrokeStyle(4, 0xffff00);
            restartBtn.setStyle({ fill: '#ffff00' });
        });
        
        // Add hover effects for Select button
        selectBtnBg.on('pointerover', () => {
            selectBtnBg.setFillStyle(0x333300, 0.9);
            selectBtnBg.setStrokeStyle(4, 0xffff00);
            selectBtn.setStyle({ fill: '#ffffff' });
        });
        selectBtnBg.on('pointerout', () => {
            selectBtnBg.setFillStyle(0x000000, 0.9);
            selectBtnBg.setStrokeStyle(4, 0xffff00);
            selectBtn.setStyle({ fill: '#ffff00' });
        });
        
        // Add click handlers to button backgrounds
        restartBtnBg.on('pointerdown', () => {
            if (!this.gameOver || this.isTransitioning) return;
            this.isTransitioning = true;
            
            SoundManager.playForwardButton(this);
            this.scene.restart();
        });
        
        selectBtnBg.on('pointerdown', () => {
            if (!this.gameOver || this.isTransitioning) return;
            this.isTransitioning = true;
            
            SoundManager.playForwardButton(this);
            
            // Clean up safely with delayed transition
            this.cleanupFightScene();
            
            // Small delay to ensure cleanup is complete before scene transition
            this.time.delayedCall(100, () => {
                console.log('🚀 Transitioning to CharacterSelectionScene...');
                this.scene.start('CharacterSelectionScene');
            });
        });

        // **CRITICAL FIX**: Remove any existing R/C key handlers first
        this.input.keyboard.off('keydown-R');
        this.input.keyboard.off('keydown-C');
        
        // Add persistent key listeners (not 'once' - that's why they stopped working!)
        const restartHandler = () => {
            if (!this.gameOver) return; // Only work when game is over
            if (this.isTransitioning) return; // Prevent multiple calls
            
            console.log('🔄 Restart key pressed');
            this.isTransitioning = true; // Mark as transitioning
            
            SoundManager.playForwardButton(this);
            this.scene.restart();
        };
        
        const selectHandler = () => {
            console.log('🔑 C key handler triggered');
            console.log(`🎮 Game state - gameOver: ${this.gameOver}, isTransitioning: ${this.isTransitioning}`);
            
            if (!this.gameOver) {
                console.log('⚠️ Game not over, ignoring C key');
                return;
            }
            if (this.isTransitioning) {
                console.log('⚠️ Already transitioning, ignoring C key');
                return;
            }
            
            console.log('🏠 Character selection key pressed - processing...');
            this.isTransitioning = true; // Mark as transitioning
            
            SoundManager.playForwardButton(this);
            
            try {
                // Clean up safely with error handling
                console.log('🧹 Starting cleanup...');
                this.cleanupFightScene();
                console.log('✅ Cleanup completed successfully');
                
                // Small delay to ensure cleanup is complete before scene transition
                this.time.delayedCall(100, () => {
                    console.log('🚀 Transitioning to CharacterSelectionScene...');
                    this.scene.start('CharacterSelectionScene');
                });
            } catch (error) {
                console.error('❌ Error during C key handler:', error.message);
                console.error('🔄 Attempting direct scene transition...');
                
                // Fallback: direct transition without cleanup
                this.scene.start('CharacterSelectionScene');
            }
        };
        
        // Use persistent 'on' handlers instead of 'once'
        this.input.keyboard.on('keydown-R', restartHandler);
        this.input.keyboard.on('keydown-C', selectHandler);
        
        console.log('🎮 Fight end key handlers registered (R = restart, C = character select)');
    }
    
    shutdown() {
        console.log('🔚 FightScene shutting down...');
        
        // Clean up all key handlers to prevent conflicts with other scenes
        if (this.input && this.input.keyboard) {
            this.input.keyboard.removeAllKeys();
            console.log('🗑️ Removed all FightScene key handlers');
        }
        
        // Call comprehensive cleanup
        this.cleanupFightScene();
    }
}

// Solo Character Selection Scene - for Hero Jumper mode
class SoloCharacterSelectionScene extends Phaser.Scene {
    constructor() {
        super({ key: 'SoloCharacterSelectionScene' });
        this.characterKeys = Object.keys(CHARACTERS);
        this.playerSelection = 0;
        this.playerConfirmed = false;
        this.charactersDisplay = [];
        this.playerGrid = [];
        
        // Info Panel state
        this.infoPanelOpen = false;
        this.infoCurrentTab = 'tutorial';
        this.infoPanelElements = [];
        this.infoContentElements = [];
        
        // Locker state
        this.lockerOpen = false;
        this.currentLockerPlayer = null;
        this.lockerElements = [];
        this.lockerCharElements = [];
        
        // Add fallback functions if CharacterSpriteHelper is missing functions
        if (!CharacterSpriteHelper.getSkinDisplayName) {
            CharacterSpriteHelper.getSkinDisplayName = function(skinType) {
                const names = {
                    'base': 'Base',
                    'bronze': 'Bronze',
                    'silver': 'Silver',
                    'gold': 'Gold',
                    'shadow': 'Shadow'
                };
                return names[skinType] || skinType;
            };
        }
        
        if (!CharacterSpriteHelper.getAllSkinTypes) {
            CharacterSpriteHelper.getAllSkinTypes = function() {
                return ['base', 'bronze', 'silver', 'gold', 'shadow'];
            };
        }
        
        if (!CharacterSpriteHelper.getSkinRarityColor) {
            CharacterSpriteHelper.getSkinRarityColor = function(skinType) {
                const colors = {
                    'base': 0xffffff,    // white
                    'bronze': 0xcd7f32,  // bronze
                    'silver': 0xc0c0c0,  // silver
                    'gold': 0xffd700,    // gold
                    'shadow': 0x800080   // purple
                };
                return colors[skinType] || 0xffffff;
            };
        }
    }

    init() {
        // Reset scene state
        this.characterKeys = Object.keys(CHARACTERS);
        this.playerSelection = 0;
        this.playerConfirmed = false;
        this.charactersDisplay = [];
        this.playerGrid = [];
        this.infoPanelOpen = false;
        this.infoCurrentTab = 'tutorial';
        this.infoPanelElements = [];
        this.infoContentElements = [];
        
        console.log('🎮 Solo Character Selection initialized');
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
            } else {
                console.error(`No sprite config found for character: ${key}`);
            }
        });
        
        // Preload sound effects
        SoundManager.preloadSounds(this);
    }

    create() {
        // Initialize audio and start background music
        SoundManager.initializeAudio(this);
        SoundManager.startBackgroundMusic(this);
        
        // Arcade-style gradient background (matching local multiplayer)
        this.add.rectangle(400, 300, 800, 600, 0x000000);
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        
        // Arcade border frame (matching local multiplayer)
        this.add.rectangle(400, 300, 790, 590, 0x000000, 0).setStrokeStyle(6, 0x00ffff);
        this.add.rectangle(400, 300, 770, 570, 0x000000, 0).setStrokeStyle(2, 0xff00ff);

        // Arcade-style title with glow effect (matching local multiplayer)
        this.add.text(400, 40, 'HERO JUMPER', {
            fontSize: '36px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#ff0000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Title underline (matching local multiplayer)
        this.add.rectangle(400, 60, 500, 3, 0x00ffff);

        // Back button (top-left corner - arcade style, matching local multiplayer)
        this.backBtn = this.add.rectangle(85, 50, 100, 32, 0x000000, 0.9);
        this.backBtn.setStrokeStyle(3, 0x00ffff);
        this.backBtnText = this.add.text(85, 50, 'BACK', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#00ffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.backBtn.setInteractive();
        this.backBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.scene.start('HomeScene');
        });
        
        // Add hover effects for Back button
        this.backBtn.on('pointerover', () => {
            this.backBtn.setFillStyle(0x003333, 0.9);
            this.backBtn.setStrokeStyle(3, 0x00ffff);
            this.backBtnText.setStyle({ fill: '#ffffff' });
        });
        this.backBtn.on('pointerout', () => {
            this.backBtn.setFillStyle(0x000000, 0.9);
            this.backBtn.setStrokeStyle(3, 0x00ffff);
            this.backBtnText.setStyle({ fill: '#00ffff' });
        });

        // Info button (top-right corner - arcade style with purple colors, matching local multiplayer)
        this.infoBtn = this.add.rectangle(715, 50, 100, 32, 0x000000, 0.9);
        this.infoBtn.setStrokeStyle(3, 0xff00ff);
        this.infoBtnText = this.add.text(715, 50, 'INFO', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.infoBtn.setInteractive();
        this.infoBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.openInfoPanel();
        });
        
        // Add hover effects for Info button
        this.infoBtn.on('pointerover', () => {
            this.infoBtn.setFillStyle(0x330033, 0.9);
            this.infoBtn.setStrokeStyle(3, 0xff00ff);
            this.infoBtnText.setStyle({ fill: '#ffffff' });
        });
        this.infoBtn.on('pointerout', () => {
            this.infoBtn.setFillStyle(0x000000, 0.9);
            this.infoBtn.setStrokeStyle(3, 0xff00ff);
            this.infoBtnText.setStyle({ fill: '#ff00ff' });
        });

        // Single Player Section (centered like Player 1 but bigger) - Arcade style
        this.add.rectangle(400, 100, 400, 50, 0x000000, 0.8);
        this.add.rectangle(400, 100, 400, 50, 0x001100, 0).setStrokeStyle(4, 0x00ff00);
        this.add.text(400, 100, 'SELECT YOUR HERO', {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);

        // Locker button - arcade style (centered below header)
        this.lockerBtn = this.add.rectangle(400, 145, 80, 28, 0x000000, 0.8);
        this.lockerBtn.setStrokeStyle(3, 0x00ff00);
        this.lockerText = this.add.text(400, 145, 'LOCKER', {
            fontSize: '12px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.lockerBtn.setInteractive();
        this.lockerBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.openLocker('player1'); // Use player1 for solo mode
        });
        
        // Add hover effects for Locker button
        this.lockerBtn.on('pointerover', () => {
            this.lockerBtn.setFillStyle(0x001100, 0.9);
            this.lockerBtn.setStrokeStyle(3, 0x00ff00);
            this.lockerText.setStyle({ fill: '#ffffff' });
        });
        this.lockerBtn.on('pointerout', () => {
            this.lockerBtn.setFillStyle(0x000000, 0.8);
            this.lockerBtn.setStrokeStyle(3, 0x00ff00);
            this.lockerText.setStyle({ fill: '#00ff00' });
        });

        // Create character grid (centered like local multiplayer)
        this.createCharacterGrid();
        
        // Create player UI panel (like local multiplayer)
        this.createPlayerUI();
        
        // Setup input handlers
        this.setupInputHandlers();
        
        // Create character preview animations
        this.createCharacterAnimations();
        
        // Update initial selection
        this.updateSelection();
    }

    createCharacterGrid() {
        this.playerGrid = [];

        // Grid settings (matching local multiplayer)
        const gridCols = 3;
        const gridRows = 2;
        const cellWidth = 110;
        const cellHeight = 120;
        
        // Centered grid (like local multiplayer but centered in full screen)
        const startX = 285; // Centered for 3 columns
        const startY = 200;

        this.characterKeys.forEach((key, index) => {
            const character = CHARACTERS[key];
            const row = Math.floor(index / gridCols);
            const col = index % gridCols;
            
            // Character preview position
            const x = startX + (col * cellWidth);
            const y = startY + (row * cellHeight);
            
            const sprite = this.createCharacterPreview(x, y, key, 'base');
            const name = this.add.text(x, y + 50, character.name, {
                fontSize: '16px',
                fontStyle: 'bold',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5);

            this.playerGrid.push({
                sprite: sprite,
                name: name,
                character: key,
                index: index,
                x: x,
                y: y
            });
        });
    }

    createCharacterPreview(x, y, characterKey, skinType) {
        const character = CHARACTERS[characterKey];
        const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
        
        let sprite;
        
        // Check if the sprite texture exists
        if (this.textures.exists(`${characterKey}_preview`)) {
            if (spriteConfig && (spriteConfig.type === 'sprite_sheet' || spriteConfig.hasAnimation)) {
                // For sprite sheets (Tiny Heroes), use static frame
                sprite = this.add.image(x, y, `${characterKey}_preview`);
                sprite.setScale(1.8)
                      .setOrigin(0.5)
                      .setFrame(0);
            } else {
                // For single frames (Mini Pixel Pack)
                sprite = this.add.image(x, y, `${characterKey}_preview`);
                sprite.setScale(2.5)
                      .setOrigin(0.5);
            }
        } else {
            // Create a placeholder if sprite doesn't exist
            console.error(`Sprite not found for character: ${characterKey}`);
            sprite = this.add.rectangle(x, y, 32, 32, character.color);
            sprite.setScale(2);
            
            // Add character name as text
            this.add.text(x, y, characterKey.charAt(0).toUpperCase(), {
                fontSize: '16px',
                fill: '#ffffff'
            }).setOrigin(0.5);
        }

        // Apply skin tint if not base skin
        if (skinType !== 'base') {
            const skinColor = CharacterSpriteHelper.getSkinRarityColor(skinType);
            sprite.setTint(skinColor);
        }

        // Add subtle hover effect
        sprite.setInteractive();
        sprite.on('pointerover', () => {
            this.tweens.add({
                targets: sprite,
                scaleX: sprite.scaleX * 1.1,
                scaleY: sprite.scaleY * 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });
        
        sprite.on('pointerout', () => {
            this.tweens.add({
                targets: sprite,
                scaleX: sprite.scaleX / 1.1,
                scaleY: sprite.scaleY / 1.1,
                duration: 200,
                ease: 'Power2'
            });
        });

        return sprite;
    }

    createPlayerUI() {
        // Player UI (centered like local multiplayer but single panel)
        this.playerUI = {
            panel: this.add.rectangle(400, 480, 400, 140, 0x000000, 0.9).setStrokeStyle(4, 0x00ff00),
            title: this.add.text(400, 425, 'HERO SELECTION', {
                fontSize: '18px',
                fontStyle: 'bold',
                fill: '#00ff00',
                stroke: '#000000',
                strokeThickness: 3,
                shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
            }).setOrigin(0.5),
            character: this.add.text(400, 455, '', {
                fontSize: '22px',
                fontStyle: 'bold',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5),
            power: this.add.text(400, 485, '', {
                fontSize: '16px',
                fontStyle: 'bold',
                fill: '#ffff00',
                stroke: '#000000',
                strokeThickness: 2
            }).setOrigin(0.5),
            controls: this.add.text(400, 510, 'ARROW KEYS TO SELECT • ENTER TO START',
                {
                fontSize: '12px',
                fontStyle: 'bold',
                fill: '#aaaaaa',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0.5),
            description: this.add.text(400, 530, '', {
                fontSize: '11px',
                fill: '#cccccc',
                stroke: '#000000',
                strokeThickness: 1,
                wordWrap: { width: 360, useAdvancedWrap: true }
            }).setOrigin(0.5)
        };
    }

    setupInputHandlers() {
        // Arrow key navigation
        this.cursors = this.input.keyboard.createCursorKeys();
        
        // WASD keys
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
        
        // Enter key
        this.input.keyboard.on('keydown-ENTER', () => {
            SoundManager.playForwardButton(this);
            const selectedCharacter = this.characterKeys[this.playerSelection];
            this.scene.start('HeroJumperScene', { selectedCharacter: selectedCharacter });
        });
        
        // Escape key
        this.input.keyboard.on('keydown-ESC', () => {
            SoundManager.playButtonClick(this);
            this.scene.start('HomeScene');
        });
    }

    createCharacterAnimations() {
        // Create idle animations for sprite sheet characters
        this.characterKeys.forEach(key => {
            const character = CHARACTERS[key];
            const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
            
            if (spriteConfig && spriteConfig.type === 'sprite_sheet') {
                // Create idle animation for preview
                if (!this.anims.exists(`${key}_preview_idle`)) {
                    this.anims.create({
                        key: `${key}_preview_idle`,
                        frames: this.anims.generateFrameNumbers(`${key}_preview`, { start: 0, end: 3 }),
                        frameRate: 8,
                        repeat: -1
                    });
                }
                
                // Play animation on the character sprite
                const gridItem = this.playerGrid.find(item => item.character === key);
                if (gridItem && gridItem.sprite && spriteConfig.type === 'sprite_sheet') {
                    // Convert image to sprite for animation
                    const x = gridItem.sprite.x;
                    const y = gridItem.sprite.y;
                    const scale = gridItem.sprite.scaleX;
                    
                    gridItem.sprite.destroy();
                    gridItem.sprite = this.add.sprite(x, y, `${key}_preview`);
                    gridItem.sprite.setScale(scale).setOrigin(0.5);
                    gridItem.sprite.play(`${key}_preview_idle`);
                    
                    // Re-add hover effects
                    gridItem.sprite.setInteractive();
                    gridItem.sprite.on('pointerover', () => {
                        this.tweens.add({
                            targets: gridItem.sprite,
                            scaleX: gridItem.sprite.scaleX * 1.1,
                            scaleY: gridItem.sprite.scaleY * 1.1,
                            duration: 200,
                            ease: 'Power2'
                        });
                    });
                    
                    gridItem.sprite.on('pointerout', () => {
                        this.tweens.add({
                            targets: gridItem.sprite,
                            scaleX: gridItem.sprite.scaleX / 1.1,
                            scaleY: gridItem.sprite.scaleY / 1.1,
                            duration: 200,
                            ease: 'Power2'
                        });
                    });
                }
            }
        });
    }

    update() {
        if (this.infoPanelOpen || this.lockerOpen) return;
        
        // Handle input for character selection
        const cols = 3;
        
        if (Phaser.Input.Keyboard.JustDown(this.cursors.left) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.A)) {
            SoundManager.playButtonClick(this);
            this.playerSelection = (this.playerSelection - 1 + this.characterKeys.length) % this.characterKeys.length;
            this.updateSelection();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.D)) {
            SoundManager.playButtonClick(this);
            this.playerSelection = (this.playerSelection + 1) % this.characterKeys.length;
            this.updateSelection();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.W)) {
            SoundManager.playButtonClick(this);
            this.playerSelection = (this.playerSelection - cols + this.characterKeys.length) % this.characterKeys.length;
            this.updateSelection();
        } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) || Phaser.Input.Keyboard.JustDown(this.wasdKeys.S)) {
            SoundManager.playButtonClick(this);
            this.playerSelection = (this.playerSelection + cols) % this.characterKeys.length;
            this.updateSelection();
        }
    }

    updateSelection() {
        // Update character highlights
        this.playerGrid.forEach((item, index) => {
            if (index === this.playerSelection) {
                // Highlight selected character with yellow border
                item.sprite.setTint(0xffff00);
                item.name.setStyle({ fill: '#ffff00' });
            } else {
                // Reset to normal
                item.sprite.clearTint();
                item.name.setStyle({ fill: '#FFD700' });
            }
        });

        // Update UI panel with selected character info
        const selectedCharacter = CHARACTERS[this.characterKeys[this.playerSelection]];
        if (selectedCharacter && this.playerUI) {
            this.playerUI.character.setText(selectedCharacter.name.toUpperCase());
            this.playerUI.power.setText(selectedCharacter.power.toUpperCase());
            this.playerUI.description.setText(selectedCharacter.description);
        }
    }

    // Info Panel Methods
    openInfoPanel() {
        if (this.infoPanelOpen || this.lockerOpen) return;
        
        this.infoPanelOpen = true;
        this.infoCurrentTab = 'tutorial';
        
        // Get screen dimensions for responsive layout
        const screenWidth = this.cameras.main.width;
        const screenHeight = this.cameras.main.height;
        
        // Calculate responsive modal size (80% of screen, max 700x500)
        const modalWidth = Math.min(700, screenWidth * 0.85);
        const modalHeight = Math.min(500, screenHeight * 0.85);
        const centerX = screenWidth / 2;
        const centerY = screenHeight / 2;
        
        // Create backdrop
        this.infoBackdrop = this.add.rectangle(centerX, centerY, screenWidth, screenHeight, 0x000000, 0.8);
        this.infoBackdrop.setInteractive();
        this.infoBackdrop.on('pointerdown', () => this.closeInfoPanel());
        
        // Create main panel - responsive and centered
        this.infoPanel = this.add.rectangle(centerX, centerY, modalWidth, modalHeight, 0x000000, 0.95);
        this.infoPanel.setStrokeStyle(4, 0xff00ff);
        this.infoPanel.setInteractive();
        
        // Calculate positions relative to modal
        const modalTop = centerY - modalHeight / 2;
        const modalRight = centerX + modalWidth / 2;
        
        // Title - responsive positioning
        this.infoPanelTitle = this.add.text(centerX, modalTop + 40, 'HERO JUMPER INFO', {
            fontSize: Math.min(36, modalWidth / 20) + 'px',
            fontStyle: 'bold',
            fill: '#ff00ff',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Close button - responsive positioning
        this.infoCloseBtn = this.add.rectangle(modalRight - 50, modalTop + 40, 80, 40, 0x000000, 0.9);
        this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
        this.infoCloseBtn.setInteractive();
        this.infoCloseBtn.on('pointerdown', () => this.closeInfoPanel());
        this.infoCloseText = this.add.text(modalRight - 50, modalTop + 40, 'CLOSE', {
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add hover effects
        this.infoCloseBtn.on('pointerover', () => {
            this.infoCloseBtn.setFillStyle(0x330000, 0.9);
            this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
            this.infoCloseText.setStyle({ fill: '#ffffff' });
        });
        this.infoCloseBtn.on('pointerout', () => {
            this.infoCloseBtn.setFillStyle(0x000000, 0.9);
            this.infoCloseBtn.setStrokeStyle(3, 0xff0000);
            this.infoCloseText.setStyle({ fill: '#ff0000' });
        });
        
        // Store panel elements
        this.infoPanelElements = [
            this.infoBackdrop,
            this.infoPanel,
            this.infoPanelTitle,
            this.infoCloseBtn,
            this.infoCloseText
        ];
        
        // Create info content
        this.createHeroJumperInfo(modalWidth, modalHeight, centerX, centerY, modalTop);
    }

    createHeroJumperInfo(modalWidth, modalHeight, centerX, centerY, modalTop) {
        const contentTop = modalTop + 80;
        const contentHeight = modalHeight - 120;
        
        // Create content background
        const contentBg = this.add.rectangle(centerX, contentTop + contentHeight / 2, modalWidth - 40, contentHeight, 0x0f0f0f, 0.95);
        contentBg.setStrokeStyle(2, 0x444444);
        this.infoContentElements.push(contentBg);
        
                 // Hero Jumper instructions - SIMPLIFIED
         const infoText = `HERO JUMPER

🎯 GOAL: Climb as high as possible!

🎮 CONTROLS:
• A/D or Arrow Keys to move
• Auto-bounce on platforms (no jump button!)
• SPACEBAR to use character power

🏗️ PLATFORMS:
• 💙 Blue: Normal bounce
• 🟢 Green: Super high bounce!
• 🔴 Red: Breaks after use

• Score = height reached
• You have 3 lives
• Select your character and start climbing!`;
        
        this.infoContent = this.add.text(centerX, contentTop + contentHeight / 2, infoText, {
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
            wordWrap: { width: modalWidth - 80, useAdvancedWrap: true },
            align: 'left'
        }).setOrigin(0.5);
        
        this.infoContentElements.push(this.infoContent);
    }
    
    closeInfoPanel() {
        if (!this.infoPanelOpen) return;
        
        this.infoPanelOpen = false;
        
        // Destroy all panel elements
        this.infoPanelElements.forEach(element => {
            if (element) element.destroy();
        });
        this.infoPanelElements = [];
        
        // Destroy content elements
        if (this.infoContentElements) {
            this.infoContentElements.forEach(element => {
                if (element) element.destroy();
            });
            this.infoContentElements = [];
        }
    }

    // Locker Methods (simplified for solo play)
    openLocker(playerId) {
        console.log(`Opening locker for ${playerId} (Hero Jumper mode)`);
        
        // Close info panel if it's open
        if (this.infoPanelOpen) {
            this.closeInfoPanel();
        }
        
        // Prevent multiple lockers from opening
        if (this.lockerOpen) {
            return;
        }
        
        this.lockerOpen = true;
        this.currentLockerPlayer = playerId;
        
        // Create modal backdrop
        this.lockerBackdrop = this.add.rectangle(400, 300, 800, 600, 0x000000, 0);
        this.lockerBackdrop.setInteractive();
        this.lockerBackdrop.on('pointerdown', () => this.closeLocker());
        
        // Create modal panel - arcade style
        this.lockerPanel = this.add.rectangle(400, 300, 700, 550, 0x000000, 0);
        this.lockerPanel.setStrokeStyle(4, 0x00ff00);
        this.lockerPanel.setScale(0.8);
        
        // Animate backdrop fade in to full opacity
        this.tweens.add({
            targets: this.lockerBackdrop,
            alpha: 0.95,
            duration: 300,
            ease: 'Power2'
        });
        
        // Animate panel fade in and scale up to full opacity
        this.tweens.add({
            targets: this.lockerPanel,
            alpha: 1.0,
            scaleX: 1.0,
            scaleY: 1.0,
            duration: 300,
            ease: 'Back.easeOut'
        });
        
        // Title - arcade style
        this.lockerTitle = this.add.text(400, 80, 'HERO LOCKER', {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#00ff00',
            stroke: '#000000',
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Info text
        this.lockerInfo = this.add.text(400, 110, 'CHARACTER SKINS & CUSTOMIZATION', {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Simple message for Hero Jumper mode
        const lockerMessage = this.add.text(400, 300, 'LOCKER FEATURE COMING SOON!\n\nCharacter skins and customization\nwill be available in future updates.\n\nFor now, enjoy the base character designs\nin Hero Jumper mode!', {
            fontSize: '18px',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        }).setOrigin(0.5);
        
        // Close button - arcade style
        this.lockerCloseBtn = this.add.rectangle(400, 450, 120, 40, 0x000000, 0.9);
        this.lockerCloseBtn.setStrokeStyle(3, 0xff0000);
        this.lockerCloseBtn.setInteractive();
        this.lockerCloseBtn.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.closeLocker();
        });
        this.lockerCloseText = this.add.text(400, 450, 'CLOSE', {
            fontSize: '16px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        // Add hover effects to close button
        this.lockerCloseBtn.on('pointerover', () => {
            this.lockerCloseBtn.setFillStyle(0x330000, 0.9);
            this.lockerCloseBtn.setStrokeStyle(3, 0xff0000);
            this.lockerCloseText.setStyle({ fill: '#ffffff' });
        });
        this.lockerCloseBtn.on('pointerout', () => {
            this.lockerCloseBtn.setFillStyle(0x000000, 0.9);
            this.lockerCloseBtn.setStrokeStyle(3, 0xff0000);
            this.lockerCloseText.setStyle({ fill: '#ff0000' });
        });
        
        // Store locker elements for cleanup
        this.lockerElements = [
            this.lockerBackdrop,
            this.lockerPanel,
            this.lockerTitle,
            this.lockerInfo,
            lockerMessage,
            this.lockerCloseBtn,
            this.lockerCloseText
        ];
    }

    closeLocker() {
        if (!this.lockerOpen) return;
        
        this.lockerOpen = false;
        this.currentLockerPlayer = null;
        
        // Destroy all locker elements
        this.lockerElements.forEach(element => {
            if (element) element.destroy();
        });
        this.lockerElements = [];
        
        // Destroy character elements if they exist
        if (this.lockerCharElements) {
            this.lockerCharElements.forEach(element => {
                if (element) element.destroy();
            });
            this.lockerCharElements = [];
        }
    }
}

// Hero Jumper Scene - Doodle Jump-style gameplay
class HeroJumperScene extends Phaser.Scene {
    constructor() {
        super({ key: 'HeroJumperScene' });
        this.player = null;
        this.platforms = null;
        this.hazards = null;
        this.monsterManager = null; // Monster management system
        this.score = 0;
        this.lives = 3;
        this.cameraOffsetY = 0;
        this.highestY = 600;
        this.selectedCharacter = null;
        this.cursors = null;
        this.wasdKeys = null;
        this.gameOver = false;
        this.gameOverElements = [];
    }

    init(data) {
        // Get selected character from previous scene
        this.selectedCharacter = data.selectedCharacter || 'blaze';
        console.log(`🎮 Hero Jumper starting with character: ${this.selectedCharacter}`);
        
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.cameraOffsetY = 0;
        this.highestY = 600;
        this.gameOver = false;
        this.gameOverElements = [];
    }

    preload() {
        // **CRITICAL FIX**: Clear cached textures to prevent character conflicts
        console.log('🦸 HeroJumperScene preload - ensuring clean character loading...');
        
        // Clear any conflicting textures from other modes
        const conflictingTextures = [
            'hero_idle', // Clear existing hero texture
            'player1_idle', 'player1_walk', // Soccer mode textures
            'player2_idle', 'player2_walk',
            'fight_player1_idle', 'fight_player1_walk', // Fight mode textures  
            'fight_player2_idle', 'fight_player2_walk'
        ];
        
        conflictingTextures.forEach(key => {
            if (this.textures.exists(key)) {
                this.textures.remove(key);
                console.log(`🗑️ Cleared conflicting texture: ${key}`);
            }
        });
        
        // Load selected character sprite with UNIQUE key for Hero Jumper
        const character = CHARACTERS[this.selectedCharacter];
        const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
        
        if (spriteConfig) {
            const uniqueTextureKey = `hero_${this.selectedCharacter}_idle`; // UNIQUE key to prevent conflicts
            if (spriteConfig.type === 'sprite_sheet') {
                this.load.spritesheet(uniqueTextureKey, 
                    spriteConfig.basePath + spriteConfig.animations.idle.file, 
                    { frameWidth: 32, frameHeight: 32 }
                );
            } else {
                this.load.image(uniqueTextureKey, spriteConfig.basePath + spriteConfig.animations.idle.file);
            }
            console.log(`✅ Loading Hero Jumper character with unique key: ${uniqueTextureKey}`);
        }

        // Load soccer ball for hazards (using football.png as soccer ball)
        this.load.image('soccer_ball', 'assets/Sprites/Ball/Sport-Balls-Asset-Pack-Pixel-Art/64x64/football.png');
        
        // Load infinity background for Hero Jumper
        this.load.image('infinity_bg', 'assets/Sprites/Backgrounds/infinity.png');
        
        // Load monster sprites for Hero Jumper mode
        this.loadMonsterSprites();
        

        
        // Load fight mode power sprites (same as fight scene)
        this.loadPowerSprites();
    }

    loadPowerSprites() {
        // Load sprite sheets with proper frame data for animations (same as FightScene)
        
        // Blaze → Fire sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('fire_blast', 
            'assets/Sprites/Powers/Blaze/FireFreePack/No_compressed/128/Fire_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Volt → Lightning sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('lightning_blast', 
            'assets/Sprites/Powers/Volt/LightningFreePack/128/Lightning_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Whirlwind → Energy sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('energy_blast', 
            'assets/Sprites/Powers/WhirlWind/EnergyFreePack/No_compressed/128/Energy_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Frostbite → Ice shard image
        this.load.image('ice_blast', 'assets/Sprites/Powers/Frostbite/ice_shard/I5050-1.png');
        
        // Brick → Smoke sprite sheet with 8 frames (128x128 each)
        this.load.spritesheet('smoke_blast', 
            'assets/Sprites/Powers/Brick/SmokeFreePack_v2/NoCompressed/128/Smoke_1_128-sheet.png',
            { frameWidth: 128, frameHeight: 128 }
        );
        
        // Jellyhead → Load slime sprite sheet
        this.load.spritesheet('jellyhead_slime', 
            'assets/Sprites/Powers/JellyHead/Slime-Sheet.png',
            { frameWidth: 52, frameHeight: 55 }
        );
    }

    loadMonsterSprites() {
        console.log('🐲 Loading monster sprites...');
        
        // Load CrimsonFlyingEye monster sprites
        console.log('📁 Loading Crimson Flying Eye sprites...');
        this.load.spritesheet('crimson_idle', 
            'assets/Sprites/HeroJumper/Monster/CrimsonFlyingEye/Flight.png',
            { frameWidth: 150, frameHeight: 150 } // Correct frame size based on 1200x150 sprite sheet
        );
        
        this.load.spritesheet('crimson_attack', 
            'assets/Sprites/HeroJumper/Monster/CrimsonFlyingEye/Attack1.png',
            { frameWidth: 150, frameHeight: 150 }
        );
        
        this.load.spritesheet('crimson_death', 
            'assets/Sprites/HeroJumper/Monster/CrimsonFlyingEye/Death.png',
            { frameWidth: 150, frameHeight: 150 }
        );
        
        // Load TwilightFlyingEye monster sprites
        console.log('📁 Loading Twilight Flying Eye sprites...');
        this.load.spritesheet('twilight_idle', 
            'assets/Sprites/HeroJumper/Monster/TwilightFlyingEye/Flight.png',
            { frameWidth: 150, frameHeight: 150 }
        );
        
        this.load.spritesheet('twilight_attack', 
            'assets/Sprites/HeroJumper/Monster/TwilightFlyingEye/Attack1.png',
            { frameWidth: 150, frameHeight: 150 }
        );
        
        this.load.spritesheet('twilight_death', 
            'assets/Sprites/HeroJumper/Monster/TwilightFlyingEye/Death.png',
            { frameWidth: 150, frameHeight: 150 }
        );
        
        // Load Golem boss sprites
        console.log('📁 Loading Golem Boss sprites...');
        this.load.spritesheet('golem_idle', 
            'assets/Sprites/HeroJumper/Boss/Mecha-stone Golem 0.1/PNG sheet/Character_sheet.png',
            { frameWidth: 125, frameHeight: 125 } // 8x8 grid on 1000x1000 sprite sheet
        );
        
        // Golem projectile removed - golem no longer shoots
        
        console.log('🐲 Hero Jumper monster sprites loading initiated');
        
        // Add load event listeners for debugging
        this.load.on('filecomplete-spritesheet-crimson_idle', () => {
            console.log('✅ crimson_idle loaded successfully');
        });
        
        this.load.on('filecomplete-spritesheet-twilight_idle', () => {
            console.log('✅ twilight_idle loaded successfully');
        });
        
        this.load.on('filecomplete-spritesheet-golem_idle', () => {
            console.log('✅ golem_idle loaded successfully');
        });
        
        this.load.on('loaderror', (file) => {
            console.error('❌ Failed to load file:', file);
        });
    }



    create() {
        // **CRITICAL FIX**: Reset physics world to prevent cross-mode contamination  
        console.log('🦸 HeroJumperScene create() starting with COMPLETE reset...');
        
        // Store current gravity settings before reset
        const targetGravity = { x: 0, y: 600 }; // Hero Jumper specific gravity
        
        // Clear all existing physics bodies and colliders from other modes
        if (this.physics.world.colliders) {
            this.physics.world.colliders.destroy();
        }
        
        // Reset physics world completely to prevent contamination
        this.physics.world.shutdown();
        this.physics.world.step(0); // Force a step to clear everything
        
        // Reinitialize physics world with Hero Jumper settings
        this.physics.world.gravity.set(targetGravity.x, targetGravity.y);
        
        console.log('✅ Hero Jumper physics world reset complete');
        
        SoundManager.initializeAudio(this);
        
        // Set up physics world for trampoline mechanics (balanced gravity)
        console.log('🌍 HERO JUMPER PHYSICS SETUP:');
        console.log(`🌍 World gravity set to: ${this.physics.world.gravity.y}`);
        console.log('🌍 This is the baseline gravity that projectiles must overcome');
        
        // 🎨 INFINITY BACKGROUND - Stacked repeating pattern for infinite scrolling
        this.createInfinityBackground();
        
        // Create physics groups
        this.platforms = this.physics.add.staticGroup();
        this.hazards = this.physics.add.group();
        this.projectiles = this.physics.add.group(); // Initialize projectiles group early
        
        // Create starting platform (always normal type, never breaks)
        const startingPlatform = this.createPlatform(400, 550, true);
        startingPlatform.platformType = 'normal';
        startingPlatform.bounceVelocity = -500;
        startingPlatform.boost = false; // Starting platform is never a booster
        startingPlatform.shouldFall = false; // Never breaks
        
        // Generate initial platforms
        this.generatePlatforms();
        
        // **VALIDATION**: Ensure character selection is valid
        if (!this.selectedCharacter) {
            console.error('🚨 Invalid character selection detected in Hero Jumper!', this.selectedCharacter);
            // Fallback to default character
            this.selectedCharacter = this.selectedCharacter || 'blaze';
            console.log('🔧 Using fallback character for Hero Jumper:', this.selectedCharacter);
        }
        
        console.log(`🦸 Hero Jumper starting with character: ${this.selectedCharacter}`);
        
        // Create player
        this.createPlayer();
        
        // Create UI
        this.createUI();
        
        // Create power animations (same as FightScene)
        this.createPowerAnimations();
        
        // Setup input
        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys('W,S,A,D');
        
        // Add power activation key (spacebar)
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Add debug key for testing monsters (M key)
        this.mKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);
        
        // Add debug key for testing boss arena (B key)
        this.bKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
        
        // Initialize power system for Hero Jumper
        this.powerCooldown = 0; // No cooldown as requested
        // Note: projectiles group already created earlier
        
        // Setup camera to follow player with better tracking
        this.cameras.main.startFollow(this.player, true, 0.05, 0.1);
        
        // HAZARD SYSTEM DISABLED - No more annoying soccer balls falling from sky!
        // this.hazardTimer = this.time.addEvent({
        //     delay: 4000, // Start with 4 second delay
        //     callback: this.spawnHazard,
        //     callbackScope: this,
        //     loop: true
        // });
        
        // DIFFICULTY TIMER DISABLED - No need since hazards are disabled
        // this.difficultyTimer = this.time.addEvent({
        //     delay: 15000, // Every 15 seconds
        //     callback: () => {
        //         if (this.hazardTimer && !this.gameOver) {
        //             // Reduce delay by 200ms each time (minimum 1.5 seconds)
        //             const newDelay = Math.max(1500, this.hazardTimer.delay - 200);
        //             this.hazardTimer.delay = newDelay;
        //             
        //             // Update UI to show new difficulty
        //             const seconds = (newDelay / 1000).toFixed(1);
        //             this.difficultyText.setText(`HAZARD RATE: ${seconds}S`);
        //             
        //             console.log(`🎯 Difficulty increased! Hazard spawn rate: ${newDelay}ms`);
        //         }
        //     },
        //     callbackScope: this,
        //     loop: true
        // });
        
        // Initialize monster management system
        this.monsterManager = new HeroMonsterManager(this);
        console.log('🐲 Monster system initialized');
        

        
        console.log('🎮 Hero Jumper scene created successfully');
    }

    createInfinityBackground() {
        console.log('🖼️ Creating infinity background with dimensions: 400x330');
        
        // Store background images for scrolling updates
        this.backgroundImages = [];
        
        // Image dimensions: 400x330, Game window: 800x600
        const imgWidth = 400;
        const imgHeight = 330;
        const gameWidth = 800;
        const gameHeight = 600;
        
        // Calculate how many images needed with extra coverage
        const horizontalCount = 4; // Extra images on sides to prevent cutoff (covers 1600px width)
        const verticalCount = 20; // Many more images for better vertical coverage
        
        console.log(`🖼️ Creating ${horizontalCount}x${verticalCount} infinity background grid`);
        
        // Create stacked background images with extra side coverage
        for (let row = -10; row < verticalCount - 10; row++) { // Start well above and extend below
            for (let col = -1; col < horizontalCount - 1; col++) { // Start left of screen, extend right
                const x = col * imgWidth; // Align images perfectly (no gaps)
                const y = row * imgHeight; // Stack perfectly (no gaps)
                
                const bgImage = this.add.image(x, y, 'infinity_bg');
                bgImage.setOrigin(0, 0); // Top-left origin for perfect tiling
                bgImage.setDepth(-100); // Behind everything
                bgImage.setScrollFactor(0.3); // Parallax scrolling effect - slower than gameplay
                
                this.backgroundImages.push({
                    image: bgImage,
                    originalY: y,
                    row: row,
                    col: col
                });
            }
        }
        
        console.log(`✅ Created ${this.backgroundImages.length} infinity background images`);
    }

    updateInfinityBackground() {
        if (!this.backgroundImages || !this.player) return;
        
        const imgHeight = 330;
        const imgWidth = 400;
        const cameraY = this.cameras.main.scrollY;
        const cameraX = this.cameras.main.scrollX;
        const scrollFactor = 0.3; // Match the parallax scroll factor
        
        // Calculate effective camera position for background (considering parallax)
        const effectiveCameraY = cameraY * scrollFactor;
        const effectiveCameraX = cameraX * scrollFactor;
        
        // Define visible area with large buffer to prevent gaps
        const bufferSize = 1000; // Large buffer to ensure coverage
        const visibleTop = effectiveCameraY - bufferSize;
        const visibleBottom = effectiveCameraY + 600 + bufferSize; // 600 = screen height
        const visibleLeft = effectiveCameraX - bufferSize;
        const visibleRight = effectiveCameraX + 800 + bufferSize; // 800 = screen width
        
        // Group images by column for better management
        const imagesByColumn = {};
        this.backgroundImages.forEach(bgData => {
            if (!imagesByColumn[bgData.col]) {
                imagesByColumn[bgData.col] = [];
            }
            imagesByColumn[bgData.col].push(bgData);
        });
        
        // Update each column
        Object.keys(imagesByColumn).forEach(col => {
            const columnImages = imagesByColumn[col];
            
            columnImages.forEach(bgData => {
                const bgImage = bgData.image;
                
                // Vertical repositioning for infinite scrolling (accounting for top-left origin)
                if (bgImage.y > visibleBottom) {
                    // Image is too far below, move it above the topmost image
                    const topImage = columnImages.reduce((highest, img) => 
                        img.image.y < highest.image.y ? img : highest
                    );
                    bgImage.y = topImage.image.y - imgHeight;
                } else if (bgImage.y + imgHeight < visibleTop) {
                    // Image is too far above, move it below the bottommost image
                    const bottomImage = columnImages.reduce((lowest, img) => 
                        img.image.y > lowest.image.y ? img : lowest
                    );
                    bgImage.y = bottomImage.image.y + imgHeight;
                }
                
                // Horizontal repositioning for side coverage (accounting for top-left origin)
                if (bgImage.x > visibleRight) {
                    bgImage.x -= imgWidth * 4; // Move left by 4 image widths
                } else if (bgImage.x + imgWidth < visibleLeft) {
                    bgImage.x += imgWidth * 4; // Move right by 4 image widths
                }
            });
        });
        
        // Safety check: Ensure we always have enough vertical coverage
        this.ensureVerticalCoverage(effectiveCameraY - bufferSize, effectiveCameraY + 600 + bufferSize);
    }

    ensureVerticalCoverage(minY, maxY) {
        const imgHeight = 330;
        const imgWidth = 400;
        
        // Check each column for gaps
        for (let col = -1; col < 3; col++) { // Check all columns we care about
            const columnImages = this.backgroundImages.filter(bg => bg.col === col);
            
            if (columnImages.length === 0) continue;
            
            // Sort by Y position
            columnImages.sort((a, b) => a.image.y - b.image.y);
            
            // Check if we need more images at the top
            const topImage = columnImages[0];
            if (topImage.image.y > minY) {
                const needed = Math.ceil((topImage.image.y - minY) / imgHeight);
                for (let i = 1; i <= needed; i++) {
                    const newY = topImage.image.y - (i * imgHeight);
                    const newX = col * imgWidth;
                    
                    const bgImage = this.add.image(newX, newY, 'infinity_bg');
                    bgImage.setOrigin(0, 0);
                    bgImage.setDepth(-100);
                    bgImage.setScrollFactor(0.3);
                    
                    this.backgroundImages.push({
                        image: bgImage,
                        originalY: newY,
                        row: Math.floor(newY / imgHeight),
                        col: col
                    });
                }
            }
            
            // Check if we need more images at the bottom
            const bottomImage = columnImages[columnImages.length - 1];
            if (bottomImage.image.y + imgHeight < maxY) {
                const needed = Math.ceil((maxY - (bottomImage.image.y + imgHeight)) / imgHeight);
                for (let i = 1; i <= needed; i++) {
                    const newY = bottomImage.image.y + (i * imgHeight);
                    const newX = col * imgWidth;
                    
                    const bgImage = this.add.image(newX, newY, 'infinity_bg');
                    bgImage.setOrigin(0, 0);
                    bgImage.setDepth(-100);
                    bgImage.setScrollFactor(0.3);
                    
                    this.backgroundImages.push({
                        image: bgImage,
                        originalY: newY,
                        row: Math.floor(newY / imgHeight),
                        col: col
                    });
                }
            }
        }
    }

    createPowerAnimations() {
        // Create animations for sprite sheet-based powers (same as FightScene)
        
        // Fire blast animation (8 frames) - key matches character name
        if (!this.anims.exists('blaze_blast_anim')) {
            this.anims.create({
                key: 'blaze_blast_anim',
                frames: this.anims.generateFrameNumbers('fire_blast', { start: 0, end: 7 }),
                frameRate: 12,
                repeat: -1
            });
        }

        // Lightning blast animation (8 frames) - key matches character name
        if (!this.anims.exists('volt_blast_anim')) {
            this.anims.create({
                key: 'volt_blast_anim',
                frames: this.anims.generateFrameNumbers('lightning_blast', { start: 0, end: 7 }),
                frameRate: 15,
                repeat: -1
            });
        }

        // Energy blast animation (8 frames) - key matches character name
        if (!this.anims.exists('whirlwind_blast_anim')) {
            this.anims.create({
                key: 'whirlwind_blast_anim',
                frames: this.anims.generateFrameNumbers('energy_blast', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
        }

        // Smoke blast animation (8 frames) - key matches character name
        if (!this.anims.exists('brick_blast_anim')) {
            this.anims.create({
                key: 'brick_blast_anim',
                frames: this.anims.generateFrameNumbers('smoke_blast', { start: 0, end: 7 }),
                frameRate: 8,
                repeat: -1
            });
        }

        // Jellyhead slime animation (same as fight mode)
        if (!this.anims.exists('jellyhead_slime_anim')) {
            this.anims.create({
                key: 'jellyhead_slime_anim',
                frames: this.anims.generateFrameNumbers('jellyhead_slime', { start: 16, end: 23 }),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    createPlayer() {
        // **CRITICAL FIX**: Destroy any existing player before creating fresh one
        console.log('🦸 Creating fresh Hero Jumper player...');
        
        if (this.player) {
            console.log('🗑️ Destroying existing Hero Jumper player sprite');
            this.player.destroy(true); // true = destroy texture cache
            this.player = null;
        }
        
        // Get character info and create unique texture key
        const character = CHARACTERS[this.selectedCharacter];
        const spriteConfig = CharacterSpriteHelper.getCharacterConfig(character.sprite.category, character.sprite.id);
        const uniqueTextureKey = `hero_${this.selectedCharacter}_idle`; // Match preload key
        
        console.log(`🦸 Creating player with character: ${this.selectedCharacter}, texture: ${uniqueTextureKey}`);
        
        // Create fresh player sprite with unique texture
        this.player = this.physics.add.sprite(400, 500, uniqueTextureKey);
        this.player.setBounce(0); // Remove bounce to prevent interference with trampoline mechanics
        this.player.setCollideWorldBounds(false);
        this.player.isStunned = false; // Initialize stun state
        this.player.isInvincible = false; // Initialize invincibility state
        // Player automatically uses world gravity (600), no need to set individual gravity
        
        // Set scale based on character sprite type for better visual balance
        if (spriteConfig && spriteConfig.type === 'sprite_sheet') {
            // Tiny Heroes sprites - make them smaller
            this.player.setScale(1.8);
        } else {
            // Mini Pixel Pack sprites - make them bigger
            this.player.setScale(2.8);
        }
        
        // Set up player body for better collision detection
        this.player.body.setSize(this.player.width * 0.8, this.player.height * 0.9);
        this.player.body.setOffset(this.player.width * 0.1, this.player.height * 0.1);
        
        // **CRITICAL FIX**: Clear conflicting animations and create fresh ones
        if (spriteConfig && spriteConfig.type === 'sprite_sheet') {
            const uniqueAnimKey = `hero_${this.selectedCharacter}_idle_anim`; // UNIQUE animation key
            
            // Clear any existing hero animations to prevent conflicts
            const animsToRemove = [
                'hero_idle_anim', // Old generic key
                uniqueAnimKey // Clear existing unique key if it exists
            ];
            
            animsToRemove.forEach(key => {
                if (this.anims.exists(key)) {
                    this.anims.remove(key);
                    console.log(`🗑️ Removed existing animation: ${key}`);
                }
            });
            
            // Create fresh animation with unique keys
            this.anims.create({
                key: uniqueAnimKey,
                frames: this.anims.generateFrameNumbers(uniqueTextureKey, { start: 0, end: 3 }),
                frameRate: 8,
                repeat: -1
            });
            console.log(`✅ Created unique Hero Jumper animation: ${uniqueAnimKey}`);
            
            this.player.play(uniqueAnimKey);
        }
        
        console.log(`✅ Hero Jumper player created successfully - Character: ${this.selectedCharacter}, Scale: ${this.player.scaleX}`);
        
        // Player-platform overlap - ONE-WAY TRAMPOLINE MECHANICS (like Doodle Jump)
        this.physics.add.overlap(this.player, this.platforms, (player, platform) => {
            // ONE-WAY PLATFORM COLLISION: Player can pass through from below, but lands on top
            // Only bounce when player is moving downward AND above the platform
            const playerBottom = player.body.y + player.body.height;
            const platformTop = platform.body.y;
            
            // Check if player is falling downward and positioned above the platform
            if (player.body.velocity.y > 0 && playerBottom > platformTop && playerBottom < platformTop + 20) {
                // Stop the player from falling through
                player.body.y = platformTop - player.body.height;
                
                // Apply platform-specific bounce velocity (trampoline effect)
                const boost = platform.bounceVelocity || -500; // Use platform's specific bounce velocity
                player.setVelocityY(boost);
                
                // Different sounds for different platform types (trampoline effect)
                if (platform.boost) {
                    SoundManager.playForwardButton(this); // Higher pitch sound for booster bounce
                } else if (platform.shouldFall) {
                    SoundManager.playButtonClick(this); // Breaking platform sound (same as damage)
                } else {
                    SoundManager.playButtonClick(this); // Standard bounce sound
                }
                
                // Check if platform should fall (breaking platforms) - ENHANCED BREAKING
                if (platform.shouldFall && !platform.falling) {
                    platform.falling = true;
                    
                    // Disable collision immediately so player doesn't get stuck
                    platform.body.enable = false; 
                    
                    // Create breaking effect - both collision rectangle and visual graphics
                    const targets = [platform];
                    if (platform.visualGraphics) {
                        targets.push(platform.visualGraphics);
                    }
                    
                    // Fast break and fall animation for dramatic effect
                    this.tweens.add({
                        targets: targets,
                        y: platform.y + 600, // Fall further
                        alpha: 0,
                        scaleY: 0.1, // Squash effect as it falls
                        duration: 1500, // Faster falling
                        ease: 'Power2',
                        onComplete: () => {
                            if (platform && platform.active && platform.scene) {
                                // Clean up any particles attached to the platform
                                if (platform.particles) {
                                    platform.particles.forEach(particle => {
                                        if (particle && particle.active) {
                                            particle.destroy();
                                        }
                                    });
                                }
                                // Clean up visual graphics
                                if (platform.visualGraphics && platform.visualGraphics.active) {
                                    platform.visualGraphics.destroy();
                                }
                                this.platforms.remove(platform);
                                platform.destroy();
                            }
                        }
                    });
                }
            }
            // If player is moving upward or below the platform, allow them to pass through
        });
        
        // Player-hazard collision
        this.physics.add.overlap(this.player, this.hazards, (player, hazard) => {
            this.handleHazardHit(hazard);
        });
        
        // Projectile-hazard collision - destroy soccer balls with powers!
        // Add safety check to ensure both groups exist
        if (this.projectiles && this.hazards) {
            this.physics.add.overlap(this.projectiles, this.hazards, (projectile, hazard) => {
                if (projectile && hazard && projectile.active && hazard.active) {
                    this.handleProjectileHazardHit(projectile, hazard);
                }
            });
        }
    }

    createPlatform(x, y, isStarting = false) {
        // Determine platform type (20% chance for booster platform)
        const isBooster = !isStarting && Math.random() < 0.2;
        const isFalling = !isStarting && !isBooster && Math.random() < 0.15; // 15% chance for falling platforms
        
        let platform;
        let platformWidth = 80; // Smaller width
        let platformHeight = 14; // Skinnier height
        
        // Create invisible collision rectangle for reliable physics
        platform = this.add.rectangle(x, y, platformWidth, platformHeight, 0x000000, 0);
        
        // Create visual graphics overlay
        let visualGraphics;
        
        if (isBooster) {
            // 🟢 HIGH-BOUNCE BOOSTER PLATFORM - Green with arrows/particles
            platformWidth = 75; // Smaller
            platformHeight = 14; // Skinnier
            
            // Update collision rectangle size
            platform.setSize(platformWidth, platformHeight);
            
            // Create visual graphics overlay
            visualGraphics = this.add.graphics();
            visualGraphics.fillStyle(0x00ff00, 0.9); // Bright neon green
            visualGraphics.fillRoundedRect(-(platformWidth/2), -(platformHeight/2), platformWidth, platformHeight, 8);
            
            // Add double-border glow effect
            visualGraphics.lineStyle(4, 0x00ffff, 0.8); // Outer cyan glow
            visualGraphics.strokeRoundedRect(-(platformWidth/2), -(platformHeight/2), platformWidth, platformHeight, 8);
            visualGraphics.lineStyle(2, 0xffffff, 1); // Inner white highlight
            visualGraphics.strokeRoundedRect(-(platformWidth/2), -(platformHeight/2), platformWidth, platformHeight, 8);
            
            // Add upward arrow indicators
            visualGraphics.fillStyle(0xffffff, 1); // White arrows
            visualGraphics.fillTriangle(-15, -4, -10, -10, -5, -4); // Left arrow
            visualGraphics.fillTriangle(5, -4, 10, -10, 15, -4); // Right arrow
            
            visualGraphics.x = x;
            visualGraphics.y = y;
            
            platform.platformType = 'booster';
            platform.bounceVelocity = -750;
            platform.boost = true;
            platform.visualGraphics = visualGraphics; // Link graphics to platform
            
            // Add shimmer particle effect
            this.createBoosterParticles(platform);
            
        } else if (isFalling) {
            // 🔴 BREAKABLE PLATFORM - Red/orange with crack texture
            platformWidth = 70; // Smallest platform
            platformHeight = 12; // Skinniest
            
            // Update collision rectangle size
            platform.setSize(platformWidth, platformHeight);
            
            // Create visual graphics overlay
            visualGraphics = this.add.graphics();
            visualGraphics.fillStyle(0xff4500, 0.8); // Orange-red
            visualGraphics.fillRoundedRect(-(platformWidth/2), -(platformHeight/2), platformWidth, platformHeight, 6);
            
            // Add warning border
            visualGraphics.lineStyle(3, 0xff0000, 0.9); // Red warning border
            visualGraphics.strokeRoundedRect(-(platformWidth/2), -(platformHeight/2), platformWidth, platformHeight, 6);
            
            // Add crack pattern
            visualGraphics.lineStyle(1, 0x000000, 0.6);
            visualGraphics.lineBetween(-30, -3, -10, 3); // Crack 1
            visualGraphics.lineBetween(5, -4, 25, 2);    // Crack 2
            visualGraphics.lineBetween(-5, -8, 15, 8);   // Crack 3
            
            visualGraphics.x = x;
            visualGraphics.y = y;
            
            platform.platformType = 'breakable';
            platform.bounceVelocity = -400; // Lower bounce than others but not too weak
            platform.boost = false;
            platform.shouldFall = true;
            platform.falling = false;
            platform.visualGraphics = visualGraphics; // Link graphics to platform
            
            // Add subtle shake animation
            this.tweens.add({
                targets: [platform, visualGraphics], // Animate both collision and visual
                x: x + Phaser.Math.Between(-1, 1),
                duration: 200,
                ease: 'Power1',
                yoyo: true,
                repeat: -1
            });
            
        } else {
            // 💙 STANDARD PLATFORM - Neon blue/purple with soft glow
            platformWidth = 80; // Smaller
            platformHeight = 14; // Skinnier
            
            // Update collision rectangle size
            platform.setSize(platformWidth, platformHeight);
            
            // Create visual graphics overlay
            visualGraphics = this.add.graphics();
            visualGraphics.fillStyle(0x0080ff, 0.9); // Bright neon blue
            visualGraphics.fillRoundedRect(-(platformWidth/2), -(platformHeight/2), platformWidth, platformHeight, 10);
            
            // Add double-border glow effect
            visualGraphics.lineStyle(3, 0x00ffff, 0.7); // Outer cyan glow
            visualGraphics.strokeRoundedRect(-(platformWidth/2), -(platformHeight/2), platformWidth, platformHeight, 10);
            visualGraphics.lineStyle(1, 0xff00ff, 0.9); // Inner magenta highlight
            visualGraphics.strokeRoundedRect(-(platformWidth/2), -(platformHeight/2), platformWidth, platformHeight, 10);
            
            visualGraphics.x = x;
            visualGraphics.y = y;
            
            platform.platformType = 'normal';
            platform.bounceVelocity = -500;
            platform.boost = false;
            platform.visualGraphics = visualGraphics; // Link graphics to platform
        }
        
        // Add physics to the invisible collision rectangle (much more reliable)
        this.physics.add.existing(platform, true); // static body
        
        this.platforms.add(platform);
        
        return platform;
    }

    createBoosterParticles(platform) {
        // 🌟 CREATE SHIMMER PARTICLE EFFECT for booster platforms
        const particleCount = 8;
        
        for (let i = 0; i < particleCount; i++) {
            // Create small glowing particles around the platform
            const particle = this.add.circle(
                platform.x + Phaser.Math.Between(-40, 40),
                platform.y + Phaser.Math.Between(-15, 15),
                Phaser.Math.Between(1, 3),
                0x00ffff,
                0.7
            );
            
            // Add twinkling animation
            this.tweens.add({
                targets: particle,
                alpha: 0,
                scale: 0,
                duration: Phaser.Math.Between(800, 1500),
                ease: 'Power2',
                delay: Phaser.Math.Between(0, 1000),
                repeat: -1,
                yoyo: true
            });
            
            // Float particles upward gently
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(5, 15),
                duration: Phaser.Math.Between(2000, 3000),
                ease: 'Sine.easeInOut',
                repeat: -1,
                yoyo: true
            });
            
            // Store particles for cleanup when platform is destroyed
            if (!platform.particles) platform.particles = [];
            platform.particles.push(particle);
        }
    }

    generatePlatforms() {
        // Generate platforms going upward with balanced spacing (challenging but reachable)
        let lastX = 400; // Start from center
        
        for (let y = 400; y > -4000; y -= Phaser.Math.Between(80, 130)) { // Reduced vertical spacing
            // Smart horizontal positioning - not too far from last platform
            const maxDistance = 200; // Maximum horizontal distance from last platform
            const minX = Math.max(80, lastX - maxDistance);
            const maxX = Math.min(720, lastX + maxDistance);
            
            const x = Phaser.Math.Between(minX, maxX);
            this.createPlatform(x, y);
            
            lastX = x; // Update last position for next platform
        }
    }

    spawnHazard() {
        if (this.gameOver) return;
        
        // ⚽ ENHANCED DANGEROUS SOCCER BALLS
        
        const x = Phaser.Math.Between(50, 750);
        const y = this.player.y - 600; // Spawn above player
        
        const hazard = this.physics.add.sprite(x, y, 'soccer_ball');
        hazard.setScale(0.6); // Slightly bigger to be more visible as a threat
        hazard.setBounce(0.9); // More bouncy for unpredictable movement
        
        // Add red tint to make it obvious as a hazard
        hazard.setTint(0xff4444); // Reddish tint for danger
        
        // Add glowing warning effect around the hazard
        const warningGlow = this.add.circle(x, y, 25, 0xff0000, 0.2);
        this.tweens.add({
            targets: warningGlow,
            scaleX: 1.5,
            scaleY: 1.5,
            alpha: 0,
            duration: 800,
            repeat: -1,
            ease: 'Power2'
        });
        
        // Link glow to hazard for synchronized movement
        hazard.warningGlow = warningGlow;
        
        // Add spinning effect to make it more dynamic
        this.tweens.add({
            targets: hazard,
            angle: 360,
            duration: 1000,
            repeat: -1,
            ease: 'Linear'
        });
        
        // Faster falling for more danger
        hazard.setVelocityY(100); // Initial downward push
        
        this.hazards.add(hazard);
        
        // Update glow position to follow hazard
        const updateGlow = () => {
            if (hazard.active && warningGlow.active) {
                warningGlow.x = hazard.x;
                warningGlow.y = hazard.y;
            }
        };
        
        // Create update timer for glow positioning
        const glowTimer = this.time.addEvent({
            delay: 16, // ~60fps
            callback: updateGlow,
            loop: true
        });
        
        // Store timer reference for cleanup
        hazard.glowTimer = glowTimer;
        
        // Remove hazard when it goes too far below (safer destruction)
        this.time.delayedCall(12000, () => { // Slightly longer to account for bouncing
            if (hazard && hazard.active && hazard.scene) {
                // Clean up warning glow
                if (hazard.warningGlow && hazard.warningGlow.active) {
                    hazard.warningGlow.destroy();
                }
                // Clean up glow timer
                if (hazard.glowTimer) {
                    hazard.glowTimer.destroy();
                }
                this.hazards.remove(hazard);
                hazard.destroy();
            }
        });
    }

    createUI() {
        // 🎮 ARCADE-STYLE UI (match app theme)
        
        // Score display with arcade styling
        this.scoreText = this.add.text(400, 45, 'SCORE: 0', {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#ffff00', // Yellow like app titles
            stroke: '#ff0000', // Red outline like app titles
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);

        // Lives display with neon styling
        this.livesText = this.add.text(100, 50, 'LIVES: 3', {
            fontSize: '22px',
            fontStyle: 'bold',
            fill: '#00ff00', // Neon green for lives
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Height indicator with cyan styling
        this.heightText = this.add.text(700, 50, 'HEIGHT: 0M', {
            fontSize: '18px',
            fontStyle: 'bold',
            fill: '#00ffff', // Cyan like app borders
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Kill count display with orange styling
        this.killCountText = this.add.text(700, 20, 'KILLS: 0', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ff8800', // Orange for kill count
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Controls hint with purple styling (matching app info buttons)
        this.controlsText = this.add.text(400, 75, 'A/D TO MOVE • AUTO-BOUNCE • SPACEBAR: POWER (shoots up!)', {
            fontSize: '14px',
            fontStyle: 'bold',
            fill: '#ff00ff', // Purple like app info elements
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Gameplay info
        this.difficultyText = this.add.text(400, 95, 'CLIMB AS HIGH AS YOU CAN!', {
            fontSize: '12px',
            fontStyle: 'bold',
            fill: '#00ff00', // Green for encouragement
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5).setScrollFactor(0);
    }

    handleHazardHit(hazard) {
        // 🔥 ENHANCED DAMAGE FEEDBACK - Make it super obvious!
        
        // Screen flash effect for damage
        const damageFlash = this.add.rectangle(400, 300, 800, 600, 0xff0000, 0.4);
        damageFlash.setScrollFactor(0);
        this.tweens.add({
            targets: damageFlash,
            alpha: 0,
            duration: 200,
            onComplete: () => damageFlash.destroy()
        });
        
        // Damage sound effect (more impactful)
        SoundManager.playButtonClick(this); // Use button click sound for damage
        
        // Screen shake effect
        this.cameras.main.shake(300, 0.02);
        
        // ENHANCED Player knockback effect - knock them off platforms!
        const knockbackForce = hazard.x < this.player.x ? 300 : -300; // Stronger push away from hazard
        this.player.setVelocityX(knockbackForce);
        this.player.setVelocityY(-200); // Knock them upward to get them off current platform
        
        // Face the direction of knockback for visual feedback
        this.player.setFlipX(knockbackForce < 0); // Face left if knocked left, right if knocked right
        
        // Safer hazard destruction
        if (hazard && hazard.active && hazard.scene) {
            // Create explosion effect at hazard location
            const explosion = this.add.circle(hazard.x, hazard.y, 20, 0xff4500, 0.8);
            this.tweens.add({
                targets: explosion,
                scaleX: 2,
                scaleY: 2,
                alpha: 0,
                duration: 300,
                onComplete: () => explosion.destroy()
            });
            
            this.hazards.remove(hazard);
            hazard.setActive(false).setVisible(false);
            this.time.delayedCall(10, () => {
                if (hazard) {
                    hazard.destroy();
                }
            });
        }
        
        // Reduce lives with enhanced visual feedback
        this.lives--;
        this.livesText.setText(`LIVES: ${this.lives}`);
        
        // Lives text flash effect
        this.tweens.add({
            targets: this.livesText,
            scaleX: 1.5,
            scaleY: 1.5,
            duration: 150,
            yoyo: true,
            ease: 'Power2'
        });
        
        // Change lives text color based on remaining lives
        if (this.lives <= 1) {
            this.livesText.setStyle({ fill: '#ff0000' }); // Red for critical health
        } else if (this.lives <= 2) {
            this.livesText.setStyle({ fill: '#ff8800' }); // Orange for low health
        }
        
        // Show damage text
        const damageText = this.add.text(this.player.x, this.player.y - 50, '-1 LIFE!', {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: damageText,
            y: damageText.y - 80,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
        
        if (this.lives <= 0) {
            this.triggerGameOver();
        }
    }

    triggerGameOver() {
        this.gameOver = true;
        console.log('🎮 Game Over triggered');
        
        // Clean up monster system
        if (this.monsterManager) {
            this.monsterManager.destroy();
            this.monsterManager = null;
        }
        

        
        // Stop player movement
        this.player.setVelocity(0, 0);
        // Player will stop moving due to setVelocity(0, 0), no need to modify gravity
        
        // Create game over screen
        this.createGameOverScreen();
    }

    createGameOverScreen() {
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;
        
        // 🎮 ARCADE-STYLE GAME OVER SCREEN
        
        // Backdrop with arcade border
        const backdrop = this.add.rectangle(centerX, centerY, 800, 600, 0x000000, 0.9);
        backdrop.setScrollFactor(0);
        this.gameOverElements.push(backdrop);
        
        // Add arcade border frame
        const outerBorder = this.add.rectangle(centerX, centerY, 600, 400, 0x000000, 0).setStrokeStyle(6, 0x00ffff);
        outerBorder.setScrollFactor(0);
        this.gameOverElements.push(outerBorder);
        
        const innerBorder = this.add.rectangle(centerX, centerY, 580, 380, 0x000000, 0).setStrokeStyle(2, 0xff00ff);
        innerBorder.setScrollFactor(0);
        this.gameOverElements.push(innerBorder);
        
        // Game Over title with arcade styling
        const gameOverTitle = this.add.text(centerX, centerY - 120, 'GAME OVER', {
            fontSize: '56px',
            fontStyle: 'bold',
            fill: '#ffff00', // Yellow like app titles
            stroke: '#ff0000', // Red outline like app titles
            strokeThickness: 4,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        this.gameOverElements.push(gameOverTitle);
        
        // Final score with neon styling
        const heightMeters = Math.floor((600 - this.highestY) / 10);
        const finalScoreText = this.add.text(centerX, centerY - 60, `FINAL SCORE: ${this.score}`, {
            fontSize: '28px',
            fontStyle: 'bold',
            fill: '#00ff00', // Neon green
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        this.gameOverElements.push(finalScoreText);
        
        // Height achievement with cyan styling
        const heightText = this.add.text(centerX, centerY - 20, `MAX HEIGHT: ${heightMeters}M`, {
            fontSize: '22px',
            fontStyle: 'bold',
            fill: '#00ffff', // Cyan like app borders
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setScrollFactor(0);
        this.gameOverElements.push(heightText);
        
        // Retry button with arcade styling (green)
        const retryButton = this.add.rectangle(centerX - 100, centerY + 40, 160, 50, 0x000000, 0.9);
        retryButton.setStrokeStyle(4, 0x00ff00); // Green border
        retryButton.setInteractive();
        retryButton.setScrollFactor(0);
        this.gameOverElements.push(retryButton);
        
        const retryText = this.add.text(centerX - 100, centerY + 40, 'RETRY', {
            fontSize: '22px',
            fontStyle: 'bold',
            fill: '#00ff00', // Green text to match border
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        this.gameOverElements.push(retryText);
        
        retryButton.on('pointerdown', () => {
            SoundManager.playForwardButton(this);
            this.scene.restart({ selectedCharacter: this.selectedCharacter });
        });
        
        // Return to Home button with arcade styling (cyan)
        const homeButton = this.add.rectangle(centerX + 100, centerY + 40, 180, 50, 0x000000, 0.9);
        homeButton.setStrokeStyle(4, 0x00ffff); // Cyan border
        homeButton.setInteractive();
        homeButton.setScrollFactor(0);
        this.gameOverElements.push(homeButton);
        
        const homeText = this.add.text(centerX + 100, centerY + 40, 'MAIN MENU', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#00ffff', // Cyan text to match border
            stroke: '#000000',
            strokeThickness: 2,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        this.gameOverElements.push(homeText);
        
        homeButton.on('pointerdown', () => {
            SoundManager.playButtonClick(this);
            this.scene.start('HomeScene');
        });
        
        // Add hover effects for buttons
        retryButton.on('pointerover', () => {
            retryButton.setFillStyle(0x001100, 0.9);
            retryText.setStyle({ fill: '#ffffff' });
        });
        retryButton.on('pointerout', () => {
            retryButton.setFillStyle(0x000000, 0.9);
            retryText.setStyle({ fill: '#00ff00' });
        });
        
        homeButton.on('pointerover', () => {
            homeButton.setFillStyle(0x003333, 0.9);
            homeText.setStyle({ fill: '#ffffff' });
        });
        homeButton.on('pointerout', () => {
            homeButton.setFillStyle(0x000000, 0.9);
            homeText.setStyle({ fill: '#00ffff' });
        });
    }

    update() {
        if (this.gameOver) return;
        
        // Safety check - ensure player exists before accessing
        if (!this.player || !this.player.active || !this.player.body) {
            return;
        }
        
        // Update monster system
        if (this.monsterManager) {
            this.monsterManager.update();
        }

        // Update infinity background for seamless scrolling
        this.updateInfinityBackground();
        

        
        // Check if player is stunned - if so, disable controls
        if (this.player.isStunned) {
            // Player is stunned - no control input allowed
            // Keep falling and apply slight deceleration
            this.player.setVelocityX(this.player.body.velocity.x * 0.9);
            return; // Skip normal movement controls
        }
        
        // Normal HeroJumper physics - auto-jumping enabled
        
        // Player horizontal movement with air control (reduced speed for better control)
        if (this.cursors.left.isDown || this.wasdKeys.A.isDown) {
            this.player.setVelocityX(-200); // Reduced horizontal movement speed
            this.player.setFlipX(true); // Face left when moving left
        } else if (this.cursors.right.isDown || this.wasdKeys.D.isDown) {
            this.player.setVelocityX(200);
            this.player.setFlipX(false); // Face right when moving right
        } else {
            // Gradual deceleration instead of instant stop
            this.player.setVelocityX(this.player.body.velocity.x * 0.8);
            // Don't change sprite facing when not actively moving
        }
        
        // JUMPING CONTROLS - Trampoline bounce mechanics only
        // NO MANUAL JUMPING - W/Up keys are intentionally ignored for authentic trampoline gameplay
        // Player automatically bounces when landing on platforms with different velocities
        
        // 🔥 POWER ACTIVATION (Spacebar) - with comprehensive logging
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            console.log('🎮 SPACEBAR PRESSED - Attempting to activate power!');
            console.log(`🎮 Space key state - isDown: ${this.spaceKey.isDown}, isUp: ${this.spaceKey.isUp}`);
            this.activatePower();
        }
        
        // 🐲 DEBUG: Manual monster spawn (M key) - Uses progressive system
        if (Phaser.Input.Keyboard.JustDown(this.mKey)) {
            console.log('🎮 M KEY PRESSED - Manual progressive monster spawn for testing!');
            if (this.monsterManager) {
                this.monsterManager.spawnMultipleMonsters();
            }
        }
        

        
        // Wrap player around screen edges
        if (this.player.x < -25) {
            this.player.x = 825;
        } else if (this.player.x > 825) {
            this.player.x = -25;
        }
        
        // Update score and height based on vertical progress
        if (this.player.y < this.highestY) {
            this.highestY = this.player.y;
            this.score = Math.floor((600 - this.highestY) / 5); // More points per height
            const heightMeters = Math.floor((600 - this.highestY) / 10); // Convert to meters
            
            this.scoreText.setText(`SCORE: ${this.score}`);
            this.heightText.setText(`HEIGHT: ${heightMeters}M`);
        }
        
        // Generate more platforms as player goes higher (improved system with safety checks)
        const currentHighest = this.player.y - 600; // Generate platforms above current position
        const existingPlatforms = this.platforms.children.entries;
        
        // Safety check for empty platforms array
        if (existingPlatforms.length === 0) {
            // If no platforms exist, create some emergency platforms with smart positioning
            let lastX = this.player.x; // Start near player
            
            for (let y = this.player.y - 120; y > this.player.y - 600; y -= Phaser.Math.Between(80, 120)) { // Closer spacing for emergency
                const maxDistance = 150; // Emergency platforms should be easier to reach
                const minX = Math.max(80, lastX - maxDistance);
                const maxX = Math.min(720, lastX + maxDistance);
                
                const x = Phaser.Math.Between(minX, maxX);
                this.createPlatform(x, y);
                
                lastX = x;
            }
            return; // Exit early after creating emergency platforms
        }
        
        const highestPlatform = Math.min(...existingPlatforms.map(p => p.y));
        
        if (currentHighest < highestPlatform) {
            // Generate new platforms above the highest existing platform with smart positioning
            const nearestPlatforms = existingPlatforms.filter(p => p.y < highestPlatform + 200).sort((a, b) => a.y - b.y);
            let lastX = nearestPlatforms.length > 0 ? nearestPlatforms[0].x : 400; // Use nearest platform position
            
            for (let y = highestPlatform - 100; y > currentHighest - 1000; y -= Phaser.Math.Between(80, 130)) { // Better spacing
                // Smart horizontal positioning - reachable but challenging
                const maxDistance = 180; // Slightly smaller for dynamic generation
                const minX = Math.max(80, lastX - maxDistance);
                const maxX = Math.min(720, lastX + maxDistance);
                
                const x = Phaser.Math.Between(minX, maxX);
                this.createPlatform(x, y);
                
                lastX = x; // Update for next platform
            }
        }
        
        // Remove platforms that are far below the player to save memory (safer cleanup)
        if (this.platforms && this.platforms.children && this.platforms.children.entries) {
            const platformsToRemove = this.platforms.children.entries.filter(platform => 
                platform && platform.active && platform.y > this.player.y + 1000
            );
            platformsToRemove.forEach(platform => {
                if (platform.active && platform.scene) {
                    // Clean up any particles attached to booster platforms
                    if (platform.particles) {
                        platform.particles.forEach(particle => {
                            if (particle && particle.active) {
                                particle.destroy();
                            }
                        });
                    }
                    // Clean up visual graphics
                    if (platform.visualGraphics && platform.visualGraphics.active) {
                        platform.visualGraphics.destroy();
                    }
                    this.platforms.remove(platform);
                    platform.destroy();
                }
            });
        }
        
        // Remove hazards that are far from the player (safer cleanup)
        if (this.hazards && this.hazards.children && this.hazards.children.entries) {
            const hazardsToRemove = this.hazards.children.entries.filter(hazard => 
                hazard && hazard.active && (hazard.y > this.player.y + 800 || hazard.y < this.player.y - 800)
            );
            hazardsToRemove.forEach(hazard => {
                if (hazard.active && hazard.scene) {
                    // Clean up hazard warning effects
                    if (hazard.warningGlow && hazard.warningGlow.active) {
                        hazard.warningGlow.destroy();
                    }
                    if (hazard.glowTimer) {
                        hazard.glowTimer.destroy();
                    }
                    this.hazards.remove(hazard);
                    hazard.destroy();
                }
            });
        }
        
        // Remove projectiles that are far from the player (cleanup) - ALLOW MUCH MORE UPWARD TRAVEL
        if (this.projectiles && this.projectiles.children && this.projectiles.children.entries) {
            const projectilesToRemove = this.projectiles.children.entries.filter(projectile => 
                projectile && projectile.active && 
                (projectile.y > this.player.y + 600 || projectile.y < this.player.y - 2000 ||  // Allow 2000px up instead of 600px
                 projectile.x < -200 || projectile.x > 1000)  // Also expand horizontal bounds
            );
            if (projectilesToRemove.length > 0) {
                console.log(`🧹 Cleanup removing ${projectilesToRemove.length} distant projectiles`);
            }
            projectilesToRemove.forEach(projectile => {
                if (projectile.active && projectile.scene) {
                    console.log(`🗑️ Removing projectile at (${projectile.x.toFixed(1)}, ${projectile.y.toFixed(1)}) - Player at (${this.player.x.toFixed(1)}, ${this.player.y.toFixed(1)})`);
                    // Clean up projectile effects
                    if (projectile.fireGlow) projectile.fireGlow.destroy();
                    if (projectile.iceGlow) projectile.iceGlow.destroy();
                    if (projectile.lightningGlow) projectile.lightningGlow.destroy();
                    if (projectile.jellyGlow) projectile.jellyGlow.destroy();
                    if (projectile.dustCloud) projectile.dustCloud.destroy();
                    if (projectile.windSwirl) projectile.windSwirl.destroy();
                    
                    this.projectiles.remove(projectile);
                    projectile.destroy();
                }
            });
        }
        
        // Check if player fell too far below their highest point
        if (this.player.y > this.highestY + 600) {
            this.triggerGameOver();
        }
    }

    activatePower() {
        console.log('⚡ POWER ACTIVATION TRIGGERED!');
        console.log(`⚡ Game over: ${this.gameOver}, Selected character: ${this.selectedCharacter}`);
        
        if (this.gameOver || !this.selectedCharacter) {
            console.log('⚡ Power activation blocked - game over or no character selected');
            return;
        }
        
        // Safety check for projectiles group
        if (!this.projectiles) {
            console.error('⚡ ERROR: Projectiles group not initialized!');
            return;
        }
        
        console.log('⚡ Projectiles group exists, continuing...');
        
        // No cooldown - can spam powers as requested
        const character = CHARACTERS[this.selectedCharacter];
        if (!character) {
            console.error('⚡ ERROR: Invalid character selected');
            return;
        }
        
        console.log(`🎮 ACTIVATING POWER: ${character.name} - ${character.power}!`);
        console.log(`🎮 Player position: (${this.player.x}, ${this.player.y})`);
        console.log(`🎮 Current physics world gravity: ${this.physics.world.gravity.y}`);
        
        // Play character-specific power sound
        SoundManager.playCharacterPower(this, character.name);
        
        // Execute character-specific power
        console.log(`🎮 Executing power for character: ${this.selectedCharacter}`);
        switch (this.selectedCharacter) {
            case 'blaze':
                this.fireBlazePower();
                break;
            case 'frostbite':
                this.fireFrostbitePower();
                break;
            case 'volt':
                this.fireVoltPower();
                break;
            case 'jellyhead':
                this.fireJellyheadPower();
                break;
            case 'brick':
                this.fireBrickPower();
                break;
            case 'whirlwind':
                this.fireWhirlwindPower();
                break;
            default:
                console.error(`🎮 ERROR: Unknown character: ${this.selectedCharacter}`);
        }
        
        console.log('⚡ Power activation completed!');
    }

    fireBlazePower() {
        console.log('🔥 BLAZE POWER ACTIVATED - Creating fire projectile...');
        
        // DIAGNOSTIC: Test if basic sprite creation works
        console.log(`🔥 Texture 'fire_blast' exists: ${this.textures.exists('fire_blast')}`);
        console.log(`🔥 Physics world exists: ${!!this.physics.world}`);
        console.log(`🔥 Player position: (${this.player.x}, ${this.player.y})`);
        
        // Create simple test projectile first - use soccer_ball if fire_blast fails
        const textureKey = this.textures.exists('fire_blast') ? 'fire_blast' : 'soccer_ball';
        console.log(`🔥 Using texture: ${textureKey}`);
        
        // 🔥 BLAZE: Fire Blast - Shoots straight up like an arrow from character's head
        const projectile = this.physics.add.sprite(
            this.player.x, 
            this.player.y - 40, // Above character's head
            textureKey
        );
        
        console.log(`🔥 Projectile created at position: (${projectile.x}, ${projectile.y})`);
        
        projectile.setScale(0.5); // Same size as fight mode
        projectile.powerType = 'fire'; // Set immediately for group management
        
        // 🔴 APPLYING EXACT RED BALL PHYSICS WITH TIMING FIX!
        this.time.delayedCall(1, () => {
            if (projectile && projectile.active && projectile.body) {
                projectile.setVelocityY(-500); // RED BALL: Much faster upward velocity
                projectile.setBounce(0); // RED BALL: No bounce behavior
                projectile.body.setGravityY(-1000); // RED BALL: Much stronger upward gravity
                projectile.body.setCollideWorldBounds(false); // RED BALL: No world bounds collision
                
                // 🔴 VERIFICATION: Confirm red ball physics were applied
                console.log(`🔴 RED BALL PHYSICS APPLIED TO FIRE PROJECTILE (DELAYED):`);
                console.log(`   Velocity Y: ${projectile.body.velocity.y} (should be -500)`);
                console.log(`   Gravity Y: ${projectile.body.gravity.y} (should be -1000)`);
                console.log(`   Body exists: ${!!projectile.body}, Physics enabled: ${projectile.body.enable}`);
            }
        });
        
        console.log(`🔥 Initial velocity set: (${projectile.body.velocity.x}, ${projectile.body.velocity.y})`);
        console.log(`🔥 Projectile gravity set: ${projectile.body.gravity.y}`);
        console.log(`🔥 World gravity: ${this.physics.world.gravity.y}`);
        console.log(`🔥 Net gravity effect: ${this.physics.world.gravity.y + projectile.body.gravity.y}`);
        
        // IMMEDIATE VERIFICATION - Check if physics properties stick
        this.time.delayedCall(10, () => {
            if (projectile && projectile.active && projectile.body) {
                console.log(`🔥 VERIFICATION (10ms later):`);
                console.log(`   Velocity: (${projectile.body.velocity.x.toFixed(1)}, ${projectile.body.velocity.y.toFixed(1)})`);
                console.log(`   Gravity: World=${this.physics.world.gravity.y}, Body=${projectile.body.gravity.y}, Net=${this.physics.world.gravity.y + projectile.body.gravity.y}`);
                console.log(`   Position: (${projectile.x.toFixed(1)}, ${projectile.y.toFixed(1)})`);
            }
        });
        
        // Play fire animation (only if using fire_blast texture and animation exists)
        if (textureKey === 'fire_blast' && this.anims.exists('blaze_blast_anim')) {
            console.log('🔥 Playing fire animation');
            projectile.play('blaze_blast_anim');
        } else {
            console.log('🔥 Skipping animation - using fallback or animation missing');
            if (textureKey === 'soccer_ball') {
                projectile.setTint(0xff4444); // Red tint for visibility
            }
        }
        
        // Safety check before adding to group
        if (this.projectiles && projectile) {
            this.projectiles.add(projectile);
            console.log('🔥 Projectile added to projectiles group successfully');
            
            console.log('🔥 Main fire projectile created with RED CIRCLE PHYSICS - should shoot straight up!');
            
        } else {
            console.error('🔥 ERROR: Failed to add projectile to group!');
            console.error(`🔥 Projectiles group exists: ${!!this.projectiles}`);
            console.error(`🔥 Projectile exists: ${!!projectile}`);
        }
        
        // ENHANCED PHYSICS DEBUGGING - Track every 50ms for detailed analysis
        let trackingCounter = 0;
        const trackingTimer = this.time.addEvent({
            delay: 50, // Every 50ms for detailed tracking
            callback: () => {
                if (projectile && projectile.active && projectile.body) {
                    trackingCounter++;
                    const worldGravity = this.physics.world.gravity.y;
                    const bodyGravity = projectile.body.gravity.y;
                    const netGravity = worldGravity + bodyGravity;
                    const bodyEnabled = projectile.body.enable;
                    const bodyMass = projectile.body.mass;
                    
                    console.log(`🔥 Frame ${trackingCounter} (${(trackingCounter * 50)}ms):`);
                    console.log(`   Position: (${projectile.x.toFixed(1)}, ${projectile.y.toFixed(1)})`);
                    console.log(`   Velocity: (${projectile.body.velocity.x.toFixed(1)}, ${projectile.body.velocity.y.toFixed(1)})`);
                    console.log(`   World Gravity: ${worldGravity}, Body Gravity: ${bodyGravity}, Net: ${netGravity}`);
                    console.log(`   Body Enabled: ${bodyEnabled}, Mass: ${bodyMass}`);
                    console.log(`   Body Bounds: (${projectile.body.x}, ${projectile.body.y}) ${projectile.body.width}x${projectile.body.height}`);
                } else {
                    console.log('🔥 Projectile no longer active - stopping detailed tracking');
                    if (trackingTimer && trackingTimer.active) trackingTimer.destroy();
                }
            },
            repeat: 79 // Track for 4 seconds (80 * 50ms = 4000ms)
        });
        
        // Auto-destroy after 3 seconds
        this.time.delayedCall(3000, () => {
            if (projectile && projectile.active) {
                console.log('🔥 Auto-destroying projectile after 3 seconds');
                projectile.destroy();
            }
            if (trackingTimer.active) {
                trackingTimer.destroy();
            }
        });
    }

    fireFrostbitePower() {
        console.log('❄️ FROSTBITE POWER ACTIVATED - Creating ice projectile...');
        
        // ❄️ FROSTBITE: Ice Shard - Shoots straight up like an arrow from character's head
        const projectile = this.physics.add.sprite(
            this.player.x, 
            this.player.y - 40, // Above character's head
            'ice_blast'
        );
        
        console.log(`❄️ Ice projectile created at position: (${projectile.x}, ${projectile.y})`);
        
        projectile.setScale(0.25); // EVEN SMALLER - User requested even smaller frostbite sprite
        
        projectile.powerType = 'ice'; // Set immediately for group management
        
        // 🔴 APPLYING EXACT RED BALL PHYSICS WITH TIMING FIX!
        this.time.delayedCall(1, () => {
            if (projectile && projectile.active && projectile.body) {
                projectile.setVelocityY(-500); // RED BALL: Much faster upward velocity
                projectile.setBounce(0); // RED BALL: No bounce behavior
                projectile.body.setGravityY(-1000); // RED BALL: Much stronger upward gravity
                projectile.body.setCollideWorldBounds(false); // RED BALL: No world bounds collision
                
                // ACCURATE HITBOX - Match the smaller sprite size (0.25 scale)
                const hitboxSize = Math.max(8, projectile.width * 0.25 * 0.8); // Minimum 8px hitbox
                projectile.body.setSize(hitboxSize, hitboxSize, true);
                console.log(`❄️ Frostbite hitbox adjusted to: ${hitboxSize}x${hitboxSize} pixels`);
                
                // 🔴 VERIFICATION: Confirm red ball physics were applied
                console.log(`🔴 RED BALL PHYSICS APPLIED TO ICE PROJECTILE (DELAYED):`);
                console.log(`   Velocity Y: ${projectile.body.velocity.y} (should be -500)`);
                console.log(`   Gravity Y: ${projectile.body.gravity.y} (should be -1000)`);
                console.log(`   Body exists: ${!!projectile.body}, Physics enabled: ${projectile.body.enable}`);
            }
        });
        
        console.log(`❄️ Initial velocity set: (${projectile.body.velocity.x}, ${projectile.body.velocity.y})`);
        console.log(`❄️ Projectile gravity set: ${projectile.body.gravity.y}`);
        console.log(`❄️ World gravity: ${this.physics.world.gravity.y}`);
        console.log(`❄️ Net gravity effect: ${this.physics.world.gravity.y + projectile.body.gravity.y}`);
        console.log(`❄️ Body exists: ${!!projectile.body}, Physics enabled: ${projectile.body ? projectile.body.enable : 'N/A'}`);
        console.log(`❄️ Texture exists: ${this.textures.exists('ice_blast')}`);
        
        // Safety check before adding to group  
        if (this.projectiles && projectile) {
            this.projectiles.add(projectile);
            console.log('❄️ Ice projectile added to projectiles group successfully');
        } else {
            console.error('❄️ ERROR: Failed to add ice projectile to group!');
            console.error(`❄️ Projectiles group exists: ${!!this.projectiles}`);
            console.error(`❄️ Projectile exists: ${!!projectile}`);
        }
        
        // Add position tracking for debugging
        let trackingCounter = 0;
        const trackingTimer = this.time.addEvent({
            delay: 150, // Every 150ms
            callback: () => {
                if (projectile && projectile.active) {
                    trackingCounter++;
                    console.log(`❄️ Frame ${trackingCounter}: Position (${projectile.x.toFixed(1)}, ${projectile.y.toFixed(1)}), Velocity (${projectile.body.velocity.x.toFixed(1)}, ${projectile.body.velocity.y.toFixed(1)})`);
                } else {
                    console.log('❄️ Ice projectile no longer active - stopping tracking');
                    trackingTimer.destroy();
                }
            },
            repeat: 26 // Track for ~4 seconds (27 * 150ms = 4050ms)
        });
        
        // Auto-destroy after 4 seconds
        this.time.delayedCall(4000, () => {
            if (projectile && projectile.active) {
                console.log('❄️ Auto-destroying ice projectile after 4 seconds');
                projectile.destroy();
            }
            if (trackingTimer.active) {
                trackingTimer.destroy();
            }
        });
    }

    fireVoltPower() {
        console.log('⚡ VOLT POWER ACTIVATED - Creating lightning projectile...');
        
        // ⚡ VOLT: Lightning Blast - Shoots straight up like an arrow from character's head
        const projectile = this.physics.add.sprite(
            this.player.x, 
            this.player.y - 40, // Above character's head
            'lightning_blast'
        );
        
        console.log(`⚡ Lightning projectile created at position: (${projectile.x}, ${projectile.y})`);
        
        projectile.setScale(0.6); // BIGGER - User requested bigger volt sprite
        projectile.powerType = 'lightning'; // Set immediately for group management
        
        // 🔴 APPLYING EXACT RED BALL PHYSICS WITH TIMING FIX!
        this.time.delayedCall(1, () => {
            if (projectile && projectile.active && projectile.body) {
                projectile.setVelocityY(-500); // RED BALL: Much faster upward velocity
                projectile.setBounce(0); // RED BALL: No bounce behavior
                projectile.body.setGravityY(-1000); // RED BALL: Much stronger upward gravity
                projectile.body.setCollideWorldBounds(false); // RED BALL: No world bounds collision
                
                // 🔴 VERIFICATION: Confirm red ball physics were applied
                console.log(`🔴 RED BALL PHYSICS APPLIED TO LIGHTNING PROJECTILE (DELAYED):`);
                console.log(`   Velocity Y: ${projectile.body.velocity.y} (should be -500)`);
                console.log(`   Gravity Y: ${projectile.body.gravity.y} (should be -1000)`);
            }
        });
        
        console.log(`⚡ Initial velocity set: (${projectile.body.velocity.x}, ${projectile.body.velocity.y})`);
        console.log(`⚡ Projectile gravity set: ${projectile.body.gravity.y}`);
        console.log(`⚡ World gravity: ${this.physics.world.gravity.y}`);
        console.log(`⚡ Net gravity effect: ${this.physics.world.gravity.y + projectile.body.gravity.y}`);
        console.log(`⚡ Body exists: ${!!projectile.body}, Physics enabled: ${projectile.body ? projectile.body.enable : 'N/A'}`);
        
        // Play lightning animation
        projectile.play('volt_blast_anim');
        
        // Safety check before adding to group
        if (this.projectiles && projectile) {
            this.projectiles.add(projectile);
            console.log('⚡ Lightning projectile added to projectiles group successfully');
        } else {
            console.error('⚡ ERROR: Failed to add lightning projectile to group!');
        }
        
        // Add position tracking for debugging
        let trackingCounter = 0;
        const trackingTimer = this.time.addEvent({
            delay: 100, // Every 100ms (faster tracking for lightning)
            callback: () => {
                if (projectile && projectile.active) {
                    trackingCounter++;
                    console.log(`⚡ Frame ${trackingCounter}: Position (${projectile.x.toFixed(1)}, ${projectile.y.toFixed(1)}), Velocity (${projectile.body.velocity.x.toFixed(1)}, ${projectile.body.velocity.y.toFixed(1)})`);
                } else {
                    console.log('⚡ Lightning projectile no longer active - stopping tracking');
                    trackingTimer.destroy();
                }
            },
            repeat: 19 // Track for ~2 seconds (20 * 100ms = 2000ms)
        });
        
        // Auto-destroy after 2 seconds (fast projectile)
        this.time.delayedCall(2000, () => {
            if (projectile && projectile.active) {
                console.log('⚡ Auto-destroying lightning projectile after 2 seconds');
                projectile.destroy();
            }
            if (trackingTimer.active) {
                trackingTimer.destroy();
            }
        });
    }

    fireJellyheadPower() {
        // 🟣 JELLYHEAD: Slime Blob - Shoots straight up like an arrow from character's head
        const projectile = this.physics.add.sprite(
            this.player.x, 
            this.player.y - 40, // Above character's head
            'jellyhead_slime'
        );
        
        projectile.setScale(0.5); // A LITTLE SMALLER - User requested smaller jellyhead sprite
        projectile.powerType = 'jelly'; // Set immediately for group management
        
        // 🔴 APPLYING EXACT RED BALL PHYSICS WITH TIMING FIX!
        this.time.delayedCall(1, () => {
            if (projectile && projectile.active && projectile.body) {
                projectile.setVelocityY(-500); // RED BALL: Much faster upward velocity
                projectile.setBounce(0); // RED BALL: No bounce behavior
                projectile.body.setGravityY(-1000); // RED BALL: Much stronger upward gravity
                projectile.body.setCollideWorldBounds(false); // RED BALL: No world bounds collision
                
                // 🔴 VERIFICATION: Confirm red ball physics were applied
                console.log(`🔴 RED BALL PHYSICS APPLIED TO JELLY PROJECTILE (DELAYED):`);
                console.log(`   Velocity Y: ${projectile.body.velocity.y} (should be -500)`);
                console.log(`   Gravity Y: ${projectile.body.gravity.y} (should be -1000)`);
            }
        });
        
        // Play slime animation
        projectile.play('jellyhead_slime_anim');
        
        // Safety check before adding to group
        if (this.projectiles && projectile) {
            this.projectiles.add(projectile);
        }
        
        // Auto-destroy after 5 seconds
        this.time.delayedCall(5000, () => {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
        });
    }

    fireBrickPower() {
        // 🟤 BRICK: White Circle Outline - Clean and visible projectile
        const projectile = this.add.graphics();
        projectile.lineStyle(2, 0xffffff, 1); // 2px white outline
        projectile.strokeCircle(0, 0, 12); // Smaller radius of 12px, not filled
        projectile.x = this.player.x;
        projectile.y = this.player.y - 40; // Above character's head
        
        // Add physics to the circle outline
        this.physics.add.existing(projectile);
        
        // Set collision body size to match the visual circle
        projectile.body.setCircle(12); // 12px radius collision circle
        
        projectile.powerType = 'smoke'; // Set immediately for group management
        
        console.log('🟤 Created white circle outline projectile for Brick');
        
        // 🔴 APPLYING EXACT RED BALL PHYSICS WITH TIMING FIX!
        this.time.delayedCall(1, () => {
            if (projectile && projectile.active && projectile.body) {
                // For circle objects, use body methods directly
                projectile.body.setVelocityY(-500); // RED BALL: Much faster upward velocity
                projectile.body.setBounce(0); // RED BALL: No bounce behavior
                projectile.body.setGravityY(-1000); // RED BALL: Much stronger upward gravity
                projectile.body.setCollideWorldBounds(false); // RED BALL: No world bounds collision
                
                // 🔴 VERIFICATION: Confirm red ball physics were applied
                console.log(`🔴 RED BALL PHYSICS APPLIED TO WHITE CIRCLE PROJECTILE (DELAYED):`);
                console.log(`   Velocity Y: ${projectile.body.velocity.y} (should be -500)`);
                console.log(`   Gravity Y: ${projectile.body.gravity.y} (should be -1000)`);
            }
        });
        
        // Safety check before adding to group
        if (this.projectiles && projectile) {
            this.projectiles.add(projectile);
        }
        
        // Auto-destroy after 6 seconds
        this.time.delayedCall(6000, () => {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
        });
    }

    fireWhirlwindPower() {
        // 💨 WHIRLWIND: Energy Blast - Shoots straight up like an arrow from character's head
        const projectile = this.physics.add.sprite(
            this.player.x, 
            this.player.y - 40, // Above character's head
            'energy_blast'
        );
        
        projectile.setScale(0.6); // BIGGER - User requested bigger whirlwind sprite
        projectile.powerType = 'energy'; // Set immediately for group management
        
        // 🔴 APPLYING EXACT RED BALL PHYSICS WITH TIMING FIX!
        this.time.delayedCall(1, () => {
            if (projectile && projectile.active && projectile.body) {
                projectile.setVelocityY(-500); // RED BALL: Much faster upward velocity
                projectile.setBounce(0); // RED BALL: No bounce behavior
                projectile.setAngularVelocity(300); // Spinning effect (keep this for visual flair)
                projectile.body.setGravityY(-1000); // RED BALL: Much stronger upward gravity
                projectile.body.setCollideWorldBounds(false); // RED BALL: No world bounds collision
                
                // 🔴 VERIFICATION: Confirm red ball physics were applied
                console.log(`🔴 RED BALL PHYSICS APPLIED TO ENERGY PROJECTILE (DELAYED):`);
                console.log(`   Velocity Y: ${projectile.body.velocity.y} (should be -500)`);
                console.log(`   Gravity Y: ${projectile.body.gravity.y} (should be -1000)`);
            }
        });
        
        // Play energy animation
        projectile.play('whirlwind_blast_anim');
        
        // Safety check before adding to group
        if (this.projectiles && projectile) {
            this.projectiles.add(projectile);
        }
        
        // Auto-destroy after 4 seconds
        this.time.delayedCall(4000, () => {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
        });
    }

    handleProjectileHazardHit(projectile, hazard) {
        // Safety check to prevent errors
        if (!projectile || !hazard || !projectile.active || !hazard.active) {
            return;
        }
        
        // 💥 PROJECTILE DESTROYS SOCCER BALL - Create spectacular explosion!
        
        // Create explosion effect at impact point
        const explosion = this.add.circle(hazard.x, hazard.y, 30, 0xff4500, 0.9);
        this.tweens.add({
            targets: explosion,
            scaleX: 3,
            scaleY: 3,
            alpha: 0,
            duration: 500,
            ease: 'Power2',
            onComplete: () => explosion.destroy()
        });
        
        // Screen shake for impact
        this.cameras.main.shake(200, 0.015);
        
        // Play destruction sound
        SoundManager.playForwardButton(this); // Victory sound for destroying hazard
        
        // Clean up hazard (soccer ball)
        if (hazard.warningGlow && hazard.warningGlow.active) {
            hazard.warningGlow.destroy();
        }
        if (hazard.glowTimer) {
            hazard.glowTimer.destroy();
        }
        this.hazards.remove(hazard);
        hazard.destroy();
        
        // Clean up projectile
        // Safety check before removing from group
        if (this.projectiles && projectile) {
            this.projectiles.remove(projectile);
            projectile.destroy();
        }
        
        // Bonus points for destroying hazards with powers!
        this.score += 25;
        this.scoreText.setText(`SCORE: ${this.score}`);
        
        // Show bonus text
        const bonusText = this.add.text(hazard.x, hazard.y - 50, '+25 BONUS!', {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: '#ffff00',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.tweens.add({
            targets: bonusText,
            y: bonusText.y - 80,
            alpha: 0,
            duration: 1200,
            ease: 'Power2',
            onComplete: () => bonusText.destroy()
        });
    }
}

// HeroMonsterManager - Manages monster spawning, animations, and combat for Hero Jumper mode
class HeroMonsterManager {
    constructor(scene) {
        this.scene = scene;
        this.monsters = scene.physics.add.group();
        this.activeMonsters = [];
        this.lastSpawnScore = 0;
        this.lastDebugScore = 0;
        this.monsterTypes = ['crimson', 'twilight'];
        this.baseMonsterHealth = 1;
        this.currentMonsterHealth = 1;
        this.monstersSpawned = 0;
        this.monstersKilled = 0; // Track kills for boss spawning
        this.golemSpawned = false; // Track if golem boss has been spawned
        this.golemActive = false; // Track if golem is currently active
        this.golem = null; // Reference to the golem sprite
        
        console.log('🐲 HeroMonsterManager initialized');
        
        // Setup monster animations
        this.createMonsterAnimations();
        
        // Setup collision handlers
        this.setupCollisions();
    }

    createMonsterAnimations() {
        const scene = this.scene;
        
        // Create animations for each monster type
        this.monsterTypes.forEach(type => {
            // Idle animation (8 frames: 0-7)
            const idleKey = `${type}_idle_anim`;
            if (!scene.anims.exists(idleKey)) {
                scene.anims.create({
                    key: idleKey,
                    frames: scene.anims.generateFrameNumbers(`${type}_idle`, { start: 0, end: 7 }),
                    frameRate: 12,
                    repeat: -1
                });
                console.log(`✅ Created idle animation: ${idleKey} with 8 frames`);
            }
            
            // Attack animation (8 frames: 0-7)
            const attackKey = `${type}_attack_anim`;
            if (!scene.anims.exists(attackKey)) {
                scene.anims.create({
                    key: attackKey,
                    frames: scene.anims.generateFrameNumbers(`${type}_attack`, { start: 0, end: 7 }),
                    frameRate: 15,
                    repeat: 0 // Play once
                });
                console.log(`✅ Created attack animation: ${attackKey} with 8 frames`);
            }
            
            // Death animation (8 frames: 0-7)
            const deathKey = `${type}_death_anim`;
            if (!scene.anims.exists(deathKey)) {
                scene.anims.create({
                    key: deathKey,
                    frames: scene.anims.generateFrameNumbers(`${type}_death`, { start: 0, end: 7 }),
                    frameRate: 12,
                    repeat: 0 // Play once
                });
                console.log(`✅ Created death animation: ${deathKey} with 8 frames`);
            }
        });
        
        // Create golem boss animations (separate from regular monsters)
        console.log('🏗️ Creating Golem Boss animations...');
        
        // Golem idle - using ONLY FIRST FRAME (no animation)
        // No idle animation needed - will use static frame 0
        
        // Golem death - using ONLY LAST FRAME (frame 63 - last image in last row)
        // No death animation needed - will use static frame 63 when defeated
        
        console.log('🎬 Monster animations created');
    }

    setupCollisions() {
        const scene = this.scene;
        
        // Player-monster collision with precise detection
        scene.physics.add.overlap(scene.player, this.monsters, (player, monster) => {
            if (monster.isDying || player.isStunned || player.isInvincible) return; // Skip if monster dying, player stunned, or invincible
            
            // Get precise collision bounds
            const playerBounds = {
                left: player.body.x,
                right: player.body.x + player.body.width,
                top: player.body.y,
                bottom: player.body.y + player.body.height,
                centerX: player.body.x + player.body.width/2,
                centerY: player.body.y + player.body.height/2
            };
            
            const monsterBounds = {
                left: monster.body.x,
                right: monster.body.x + monster.body.width,
                top: monster.body.y,
                bottom: monster.body.y + monster.body.height,
                centerX: monster.body.x + monster.body.width/2,
                centerY: monster.body.y + monster.body.height/2
            };
            
            // Calculate actual distance between centers
            const distance = Phaser.Math.Distance.Between(
                playerBounds.centerX, playerBounds.centerY,
                monsterBounds.centerX, monsterBounds.centerY
            );
            
            // Only trigger collision if actually close enough (adjusted for smaller hitboxes)
            if (distance > 60) return; // Must be within 60 pixels of center-to-center (reduced for smaller hitboxes)
            
            // IMPROVED jump-on-monster detection - more forgiving for player
            const isAboveMonster = playerBounds.bottom <= monsterBounds.centerY + 10; // Slightly more forgiving
            const isFalling = player.body.velocity.y > 50; // Reduced falling speed requirement
            const isLandingOnTop = playerBounds.bottom >= monsterBounds.top - 15 && playerBounds.bottom <= monsterBounds.top + 50; // Larger landing zone
            const isComingFromAbove = playerBounds.centerY < monsterBounds.centerY; // Player center must be above monster center
            
            if (isAboveMonster && isFalling && isLandingOnTop && isComingFromAbove) {
                // Player successfully jumps on monster - kill monster, boost player
                console.log(`✅ JUMP KILL: Player successfully jumps on monster!`);
                this.playerJumpsOnMonster(player, monster);
            } else {
                // Monster attacks player with DEVASTATING knockback
                console.log(`💀 SIDE HIT: Monster hits player from side/below - taking damage!`);
                this.monsterTouchesPlayer(player, monster);
            }
        }, null, scene);
        
        // Projectile hits monster (damage monster)
        scene.physics.add.overlap(scene.projectiles, this.monsters, (projectile, monster) => {
            if (monster.isDying) return; // Skip if monster is already dying
            
            this.projectileHitsMonster(projectile, monster);
        }, null, scene);
        
        // No golem projectile collisions - golem doesn't shoot
        
        console.log('💥 Monster collision handlers setup');
    }

    update() {
        const scene = this.scene;
        
        // Debug score tracking every 50 points for better visibility
        if (scene.score > 0 && scene.score % 50 === 0 && scene.score !== this.lastDebugScore) {
            console.log(`🎯 Score Update: ${scene.score} (Next strategic spawn at: ${this.lastSpawnScore + 350})`);
            this.lastDebugScore = scene.score;
        }
        
        // Check if we need to spawn monsters (every 350 points with progressive difficulty)
        const shouldSpawn = scene.score >= this.lastSpawnScore + 350;
        if (shouldSpawn) {
            console.log(`🚨 STRATEGIC SPAWN TRIGGER: Score ${scene.score} >= ${this.lastSpawnScore + 350}`);
            this.spawnMultipleMonsters();
            this.lastSpawnScore = scene.score;
            
            // Note: Monsters now die in 1 hit from projectiles (instant kill system)
            console.log(`🎯 All monsters die instantly from projectiles - no health scaling needed`);
        }
        
        // FIRST SPAWN: Always spawn if score >= 350 and no monsters active
        if (scene.score >= 350 && this.activeMonsters.length === 0 && this.lastSpawnScore === 0) {
            console.log(`🚨 FIRST STRATEGIC SPAWN: Score is ${scene.score}, spawning initial monsters!`);
            this.spawnMultipleMonsters();
            this.lastSpawnScore = scene.score;
        }
        
        // Update monster movement and behavior
        this.activeMonsters.forEach(monster => {
            if (monster.active && !monster.isDying) {
                this.updateMonsterMovement(monster);
            }
        });
        
        // Clean up dead monsters
        this.activeMonsters = this.activeMonsters.filter(monster => monster.active);
        
        // Debug active monsters count
        if (this.activeMonsters.length > 0) {
            console.log(`🐲 Active monsters: ${this.activeMonsters.length}`);
        }
    }

    spawnMultipleMonsters() {
        const scene = this.scene;
        
        // PROGRESSIVE DIFFICULTY: Calculate monsters to spawn based on score
        const scoreThreshold = Math.floor(scene.score / 350); // Which 350-point milestone we're at (was 500)
        
        // Scaling monster count: 1-4 monsters max, but with better randomization for more variety
        let maxMonsters;
        if (scoreThreshold <= 1) {
            maxMonsters = 1; // Score 350-700: Always 1 monster (learning phase)
        } else if (scoreThreshold <= 3) {
            maxMonsters = 2; // Score 1050-1400: 1-2 monsters (getting harder)
        } else if (scoreThreshold <= 6) {
            maxMonsters = 3; // Score 1750-2450: 1-3 monsters (challenging)  
        } else {
            maxMonsters = 4; // Score 2800+: 1-4 monsters (brutal endgame)
        }
        
        // IMPROVED RANDOMIZATION: Weight distribution to favor higher counts more often
        let monstersToSpawn;
        if (maxMonsters === 1) {
            monstersToSpawn = 1; // Always 1 in learning phase
        } else if (maxMonsters === 2) {
            // 40% chance 1 monster, 60% chance 2 monsters (more pairs!)
            monstersToSpawn = Math.random() < 0.4 ? 1 : 2;
        } else if (maxMonsters === 3) {
            // 20% chance 1, 40% chance 2, 40% chance 3 monsters
            const rand = Math.random();
            if (rand < 0.2) monstersToSpawn = 1;
            else if (rand < 0.6) monstersToSpawn = 2;
            else monstersToSpawn = 3;
        } else {
            // 15% chance 1, 30% chance 2, 30% chance 3, 25% chance 4 monsters
            const rand = Math.random();
            if (rand < 0.15) monstersToSpawn = 1;
            else if (rand < 0.45) monstersToSpawn = 2;
            else if (rand < 0.75) monstersToSpawn = 3;
            else monstersToSpawn = 4;
        }
        
        console.log(`🎯 PROGRESSIVE SPAWNING:`);
        console.log(`   Score: ${scene.score} (Milestone: ${scoreThreshold})`);
        console.log(`   Max monsters for this level: ${maxMonsters}`);
        console.log(`   Spawning: ${monstersToSpawn} monsters`);
        
        // Spawn the calculated number of monsters with slight delays and spread positions
        for (let i = 0; i < monstersToSpawn; i++) {
            const delay = i * 400; // 400ms between each monster spawn for better spacing
            scene.time.delayedCall(delay, () => {
                this.spawnMonster();
            });
        }
        
        console.log(`💥 Spawning ${monstersToSpawn} monsters with progressive difficulty!`);
    }

    spawnMonster() {
        const scene = this.scene;
        
        // Random monster type
        const monsterType = Phaser.Utils.Array.GetRandom(this.monsterTypes);
        
        // STRATEGIC SPAWNING: Place monster ABOVE player's current position
        const playerCurrentY = scene.player.y;
        const spawnOffsetAbove = Phaser.Math.Between(150, 250); // Spawn 150-250 pixels above player (closer encounters)
        const monsterY = playerCurrentY - spawnOffsetAbove; // Higher up in the level
        
        // Random starting side (left or right) - BUT KEEP VISIBLE
        const startFromLeft = Math.random() < 0.5;
        const startX = startFromLeft ? 50 : 750; // Start INSIDE screen bounds for visibility
        
        console.log(`🐲 STRATEGIC MONSTER SPAWNING:`);
        console.log(`   Type: ${monsterType}`);
        console.log(`   Player Y: ${playerCurrentY}`);
        console.log(`   Monster Y: ${monsterY} (${spawnOffsetAbove}px above player)`);
        console.log(`   Position: (${startX}, ${monsterY})`);
        console.log(`   Texture exists: ${scene.textures.exists(`${monsterType}_idle`)}`);
        console.log(`   Camera position: (${scene.cameras.main.scrollX}, ${scene.cameras.main.scrollY})`);
        
        // Check if texture exists before creating sprite
        if (!scene.textures.exists(`${monsterType}_idle`)) {
            console.error(`❌ Monster texture '${monsterType}_idle' not found! Available textures:`);
            console.log(scene.textures.list);
            return;
        }
        
        // Create monster sprite at strategic position
        const monster = scene.physics.add.sprite(startX, monsterY, `${monsterType}_idle`);
        monster.setScale(2.0); // Much bigger scale for better visibility
        
        // Set depth to ensure monster appears above other game objects
        monster.setDepth(1000);
        
        // Make sprite fully visible with subtle tint for variety
        monster.setAlpha(1.0);
        monster.setTint(monsterType === 'crimson' ? 0xff9999 : 0xbb99ff); // Very light tint
        
        console.log(`✅ Monster sprite created successfully`);
        console.log(`   Monster dimensions: ${monster.width} x ${monster.height}`);
        console.log(`   Monster scale: ${monster.scaleX}`);
        
        // Monster properties (health removed - instant kill system)
        monster.monsterType = monsterType;
        monster.movingRight = startFromLeft;
        monster.patrolStartX = startFromLeft ? 50 : 400;
        monster.patrolEndX = startFromLeft ? 400 : 750; // Full patrol between sides
        monster.isDying = false;
        monster.isAttacking = false;
        
        // Physics setup with precise hitbox - MUCH smaller for accuracy
        monster.body.setSize(monster.width * 0.4, monster.height * 0.4); // Much smaller, more accurate hitbox
        monster.body.setOffset(monster.width * 0.3, monster.height * 0.3); // Center the smaller hitbox
        monster.body.setCollideWorldBounds(false);
        
        // FLYING MONSTERS - Set zero gravity and manual velocity control
        monster.body.setGravityY(-scene.physics.world.gravity.y); // Completely counteract world gravity
        monster.setVelocityX(monster.movingRight ? 150 : -150); // Horizontal movement
        monster.setVelocityY(0); // No vertical movement - flying
        
        // CRITICAL: Lock the monster's Y position to prevent following player
        monster.fixedY = monsterY; // Store original Y position
        monster.y = monster.fixedY; // Set initial position
        
        console.log(`🎮 Monster physics setup:`);
        console.log(`   Body size: ${monster.body.width} x ${monster.body.height}`);
        console.log(`   Velocity X: ${monster.body.velocity.x}`);
        console.log(`   Velocity Y: ${monster.body.velocity.y}`);
        console.log(`   Gravity Y: ${monster.body.gravity.y}`);
        console.log(`   World Gravity Y: ${scene.physics.world.gravity.y}`);
        console.log(`   Final world position: (${monster.x}, ${monster.y})`);
        console.log(`   Distance above player: ${playerCurrentY - monster.y} pixels`);
        
        // Check if animation exists before playing
        const animKey = `${monsterType}_idle_anim`;
        if (scene.anims.exists(animKey)) {
            monster.play(animKey);
            console.log(`✅ Playing animation: ${animKey} on sprite at (${monster.x}, ${monster.y})`);
            console.log(`   Monster sprite visible: ${monster.visible}, alpha: ${monster.alpha}, scale: ${monster.scaleX}`);
        } else {
            console.error(`❌ Animation '${animKey}' not found!`);
            console.log(`Available animations:`, Object.keys(scene.anims.anims.entries));
        }
        
        // Add to groups
        this.monsters.add(monster);
        this.activeMonsters.push(monster);
        
        this.monstersSpawned++;
        console.log(`🐲 Monster spawned strategically: ${monsterType} at (${startX}, ${monsterY}) - Instant kill system - Total spawned: ${this.monstersSpawned}`);
        console.log(`   🎯 Player will encounter this monster when climbing ${spawnOffsetAbove} pixels higher!`);
    }

    updateMonsterMovement(monster) {
        if (monster.isDying || monster.isAttacking || monster.isStunned) return;
        
        const currentX = monster.x;
        
        // CRITICAL: Keep monsters flying at fixed height (no vertical movement)
        monster.setVelocityY(0); // Force Y velocity to always be 0
        monster.y = monster.fixedY; // Lock Y position - never follow player down
        
        // Golem-specific behavior
        if (monster.monsterType === 'golem') {
            this.updateGolemBehavior(monster);
            return;
        }
        
        // Regular monster movement logic
        // Check if monster needs to reverse direction (full-screen patrol)
        if (monster.movingRight && currentX >= monster.patrolEndX) {
            monster.movingRight = false;
            monster.setVelocityX(-150);
            monster.setFlipX(true);
        } else if (!monster.movingRight && currentX <= monster.patrolStartX) {
            monster.movingRight = true;
            monster.setVelocityX(150);
            monster.setFlipX(false);
        }
        
        // Ensure horizontal velocity is maintained
        if (Math.abs(monster.body.velocity.x) < 100) {
            monster.setVelocityX(monster.movingRight ? 150 : -150);
        }
        
        // Double-check Y position lock every frame
        if (Math.abs(monster.y - monster.fixedY) > 5) {
            monster.y = monster.fixedY;
            console.log(`🔒 Monster Y position corrected back to ${monster.fixedY}`);
        }
    }
    
    // Golem-specific movement behavior (no shooting)
    updateGolemBehavior(golem) {
        const currentX = golem.x;
        
        // Golem movement (same as regular monsters but slower)
        if (golem.movingRight && currentX >= golem.patrolEndX) {
            golem.movingRight = false;
            golem.setVelocityX(-100); // Slower than regular monsters
            golem.setFlipX(true);
        } else if (!golem.movingRight && currentX <= golem.patrolStartX) {
            golem.movingRight = true;
            golem.setVelocityX(100); // Slower than regular monsters
            golem.setFlipX(false);
        }
        
        // Ensure horizontal velocity is maintained
        if (Math.abs(golem.body.velocity.x) < 80) {
            golem.setVelocityX(golem.movingRight ? 100 : -100);
        }
        
        // Keep golem at fixed height
        if (Math.abs(golem.y - golem.fixedY) > 5) {
            golem.y = golem.fixedY;
            console.log(`🔒 Golem Y position corrected back to ${golem.fixedY}`);
        }
    }
    
    // Golem no longer shoots - removed shooting functionality

    playerJumpsOnMonster(player, monster) {
        console.log(`🦘 Player jumps on ${monster.monsterType} monster!`);
        
        // Always give player trampoline bounce first
        player.setVelocityY(-700); // Higher than normal platform bounce
        
        // GOLEM SPECIAL HEALTH SYSTEM - Takes 2 hits even when jumped on
        if (monster.monsterType === 'golem') {
            console.log('🦘🏗️ Player jumps on GOLEM - using health system!');
            
            // Golem takes damage but doesn't die instantly
            this.handleGolemHit(monster);
            return; // Exit early - golem damage handled by health system
        }
        
        // REGULAR MONSTERS: Instant death from jumping
        // Stop monster movement and lock position
        monster.setVelocity(0, 0);
        monster.y = monster.fixedY; // Keep at fixed height even while dying
        monster.isDying = true;
        
        // Play death animation
        monster.play(`${monster.monsterType}_death_anim`);
        
        // Play satisfying sound
        SoundManager.playForwardButton(this.scene);
        
        // Award bonus points
        this.scene.score += 50;
        this.scene.scoreText.setText(`SCORE: ${this.scene.score}`);
        
        // INCREMENT MONSTER KILL COUNT
        this.monstersKilled++;
        console.log(`📊 JUMP KILL: Monster destroyed! Total kills: ${this.monstersKilled}`);
        
        // Update kill count display
        this.scene.killCountText.setText(`KILLS: ${this.monstersKilled}`);
        
        // Check if golem should spawn after 5 kills
        this.checkGolemSpawn();
        
        // Destroy monster after death animation
        this.scene.time.delayedCall(500, () => {
            if (monster.active) {
                monster.destroy();
            }
        });
        
        console.log('🎯 Monster destroyed by jump, player boosted with trampoline effect!');
    }

    monsterTouchesPlayer(player, monster) {
        if (monster.isAttacking || monster.isStunned || player.isStunned || player.isInvincible) return; // Monster attacking/stunned, player stunned, or invincible
        
        console.log(`💀 Monster ${monster.monsterType} DEVASTATES player!`);
        
        // Stop monster and play attack animation (except golem)
        monster.setVelocity(0, 0);
        monster.y = monster.fixedY; // Keep monster at fixed height
        
        if (monster.monsterType !== 'golem') {
            monster.isAttacking = true;
            monster.play(`${monster.monsterType}_attack_anim`);
        } else {
            // Golem doesn't have attack animation, just stays in static frame
            monster.setFrame(0);
        }
        
        // CALCULATE KNOCKBACK DIRECTION - Away from monster
        const playerCenter = player.x + player.width/2;
        const monsterCenter = monster.x + monster.width/2;
        const knockbackDirection = playerCenter < monsterCenter ? -1 : 1; // Push away from monster
        
        // DEVASTATING KNOCKBACK - Can push player off map!
        const knockbackForceX = knockbackDirection * 800; // Much stronger horizontal push
        const knockbackForceY = -400; // Strong upward launch before falling
        
        // STUN PLAYER - Critical for difficulty
        player.isStunned = true;
        player.stunStartTime = this.scene.time.now;
        player.setVelocityX(knockbackForceX); // MASSIVE horizontal knockback
        player.setVelocityY(knockbackForceY); // Launch player up then they fall hard
        player.setTint(0xff0000); // Red tint for damage
        
        // Player loses a life
        this.scene.lives -= 1;
        this.scene.livesText.setText(`LIVES: ${this.scene.lives}`);
        
        // Play damage sound + screen shake for impact
        SoundManager.playButtonClick(this.scene);
        
        // SCREEN SHAKE for devastating impact
        this.scene.cameras.main.shake(300, 0.02); // 300ms shake with intensity 0.02
        
        console.log(`💥 Player LAUNCHED with massive knockback! Direction: ${knockbackDirection > 0 ? 'RIGHT' : 'LEFT'} Force: ${knockbackForceX}`);
        
        // Brief invincibility during knockback flight (0.8 seconds)
        player.isInvincible = true;
        
        // Visual indicator during invincibility - subtle alpha flicker
        const flickerEffect = this.scene.add.tween({
            targets: player,
            alpha: 0.7,
            duration: 100,
            yoyo: true,
            repeat: 7, // Flicker for 0.8 seconds
            onComplete: () => {
                if (player.active) player.alpha = 1.0; // Restore full opacity
            }
        });
        
        this.scene.time.delayedCall(800, () => {
            if (player.active) {
                player.isInvincible = false;
                player.alpha = 1.0; // Ensure full opacity restored
                console.log(`⚡ Player invincibility removed - vulnerable again`);
            }
        });
        
        // Remove stun and red tint after 2 seconds (longer due to devastating hit)
        this.scene.time.delayedCall(2000, () => {
            if (player.active) {
                player.isStunned = false;
                player.clearTint();
                console.log(`✅ Player recovers from devastating hit`);
            }
        });
        
        // Check for game over (monster hits can be instantly fatal if player falls off map)
        if (this.scene.lives <= 0) {
            this.scene.triggerGameOver();
            return;
        }
        
        // Additional check - if player gets knocked too far off screen, trigger game over
        this.scene.time.delayedCall(3000, () => {
            if (player.active && (player.x < -200 || player.x > this.scene.cameras.main.width + 200 || player.y > this.scene.cameras.main.height + 300)) {
                console.log(`💀 Player knocked off the map! Game Over!`);
                this.scene.lives = 0; // Instant death from being knocked off
                this.scene.livesText.setText(`LIVES: 0`);
                this.scene.triggerGameOver();
            }
        });
        
        // Monster resumes idle after devastating attack
        this.scene.time.delayedCall(1200, () => {
            if (monster.active && !monster.isDying) {
                if (monster.monsterType !== 'golem') {
                    monster.isAttacking = false;
                    monster.play(`${monster.monsterType}_idle_anim`);
                    monster.setVelocityX(monster.movingRight ? 150 : -150);
                } else {
                    // Golem stays on static frame and resumes slower movement
                    monster.setFrame(0);
                    monster.setVelocityX(monster.movingRight ? 100 : -100);
                }
                monster.y = monster.fixedY; // Ensure monster stays at fixed height
            }
        });
        
        console.log(`💥💔 Player DEVASTATED and launched! Lives remaining: ${this.scene.lives}`);
    }
    
    // Golem projectile functionality removed - no longer shoots

    projectileHitsMonster(projectile, monster) {
        console.log(`🎯 Projectile hits ${monster.monsterType} monster!`);
        
        // Destroy projectile
        projectile.destroy();
        
        // GOLEM SPECIAL HEALTH SYSTEM - Takes 2 hits
        if (monster.monsterType === 'golem') {
            return this.handleGolemHit(monster);
        }
        
        // REGULAR MONSTERS: INSTANT KILL
        console.log(`💀 Monster ${monster.monsterType} destroyed by projectile (INSTANT KILL)!`);
        
        // Stop monster and play death animation
        monster.setVelocity(0, 0);
        monster.y = monster.fixedY; // Keep at fixed height when dying
        monster.isDying = true;
        monster.play(`${monster.monsterType}_death_anim`);
        
        // Visual feedback - bright flash for satisfying kill
        monster.setTint(0xffffff);
        this.scene.time.delayedCall(200, () => {
            if (monster.active) {
                monster.setTint(0xffaa00); // Brief golden tint before death
            }
        });
        
        // Award points
        this.scene.score += 25;
        this.scene.scoreText.setText(`SCORE: ${this.scene.score}`);
        
        // Play satisfying sound
        SoundManager.playForwardButton(this.scene);
        
        // INCREMENT MONSTER KILL COUNT
        this.monstersKilled++;
        console.log(`📊 PROJECTILE KILL: Monster destroyed! Total kills: ${this.monstersKilled}`);
        
        // Update kill count display
        this.scene.killCountText.setText(`KILLS: ${this.monstersKilled}`);
        
        // Check if golem should spawn after 5 kills
        this.checkGolemSpawn();
        
        // Destroy monster after death animation
        this.scene.time.delayedCall(500, () => {
            if (monster.active) {
                monster.destroy();
            }
        });
        
        console.log('💥 INSTANT KILL - Monster destroyed by power projectile!');
    }
    
    // Handle golem taking damage (2-hit system)
    handleGolemHit(golem) {
        console.log(`🏗️ Golem hit! Health: ${golem.health}/${golem.maxHealth}`);
        
        // Reduce golem health
        golem.health--;
        
        // Visual feedback for hit
        golem.setTint(0xff4444); // Red flash
        this.scene.time.delayedCall(300, () => {
            if (golem.active && !golem.isDying) {
                golem.setTint(0xffaaaa); // Return to normal red tint
            }
        });
        
        // Screen shake for impact
        this.scene.cameras.main.shake(150, 0.015);
        
        // Play hit sound
        SoundManager.playButtonClick(this.scene);
        
        // Show damage indicator
        const damageText = this.scene.add.text(golem.x, golem.y - 50, `${golem.health > 0 ? 'HIT!' : 'DEFEATED!'}`, {
            fontSize: '20px',
            fontStyle: 'bold',
            fill: golem.health > 0 ? '#ffaa00' : '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        
        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 60,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
        
        if (golem.health <= 0) {
            // GOLEM DEFEATED!
            this.golemDefeated(golem);
        } else {
            // GOLEM STILL ALIVE - Show health
            console.log(`🏗️ Golem survives with ${golem.health} HP remaining!`);
            
            // Briefly stun golem
            const originalVelX = golem.body.velocity.x;
            golem.setVelocity(0, 0);
            this.scene.time.delayedCall(800, () => {
                if (golem.active && !golem.isDying) {
                    golem.setVelocityX(golem.movingRight ? 100 : -100);
                }
            });
        }
    }
    
    // Handle golem defeat
    golemDefeated(golem) {
        console.log('🏗️💀 GOLEM BOSS DEFEATED! Victory!');
        
        // Stop golem and show defeated frame
        golem.setVelocity(0, 0);
        golem.y = golem.fixedY;
        golem.isDying = true;
        golem.setFrame(63); // Last frame of last row - defeated golem
        
        // Epic victory effects
        golem.setTint(0xffff00); // Golden tint for victory
        this.scene.cameras.main.shake(300, 0.02); // Bigger screen shake
        
        // Award bonus points for boss kill
        this.scene.score += 100;
        this.scene.scoreText.setText(`SCORE: ${this.scene.score}`);
        
        // Play victory sound
        SoundManager.playForwardButton(this.scene);
        
        // INCREMENT KILL COUNT (golem counts as kill)
        this.monstersKilled++;
        this.scene.killCountText.setText(`KILLS: ${this.monstersKilled}`);
        
        // **GOLEM VICTORY BOOST**: Give player +100 height boost
        this.giveGolemVictoryBoost();
        
        // Mark golem as no longer active
        this.golemActive = false;
        this.golem = null; // Clear golem reference
        
        // Destroy golem after showing defeated frame
        this.scene.time.delayedCall(1000, () => {
            if (golem.active) {
                golem.destroy();
            }
        });
        
        console.log('🏗️✨ Golem boss defeated - player awarded victory boost!');
    }
    
    // Give player height boost for defeating golem
    giveGolemVictoryBoost() {
        const scene = this.scene;
        const player = scene.player;
        
        console.log('✨ GOLEM VICTORY BOOST: Launching player +100 height!');
        
        // Massive upward boost
        player.setVelocityY(-800); // Strong upward velocity
        
        // Visual effects
        player.setTint(0xffdd00); // Golden victory tint
        
        // Victory notification
        const victoryText = scene.add.text(player.x, player.y - 80, '⭐ GOLEM DEFEATED! +100 HEIGHT! ⭐', {
            fontSize: '24px',
            fontStyle: 'bold',
            fill: '#ffdd00',
            stroke: '#000000',
            strokeThickness: 3,
            shadow: { offsetX: 2, offsetY: 2, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5);
        
        // Animate victory text
        scene.tweens.add({
            targets: victoryText,
            y: victoryText.y - 100,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => victoryText.destroy()
        });
        
        // Remove victory tint after boost
        scene.time.delayedCall(1500, () => {
            if (player.active) {
                player.clearTint();
            }
        });
        
        // Update player's highest Y to reflect the boost
        scene.highestY = player.y - 100; // Give them credit for the height boost
        
        console.log('✨ Victory boost applied - player launched skyward!');
    }

    // Check if golem should spawn after reaching kill threshold
    checkGolemSpawn() {
        // Spawn golem after 5 kills (only once and not if already active)
        if (this.monstersKilled >= 5 && !this.golemSpawned && !this.golemActive) {
            console.log('🏗️ GOLEM SPAWN TRIGGERED! 5 monsters killed - spawning boss golem!');
            this.spawnGolem();
            this.golemSpawned = true;
        }
    }
    
    // Spawn the golem boss
    spawnGolem() {
        const scene = this.scene;
        
        // Strategic spawning: Place golem ABOVE player's current position
        const playerCurrentY = scene.player.y;
        const spawnOffsetAbove = Phaser.Math.Between(200, 300); // Spawn higher up than regular monsters
        const golemY = playerCurrentY - spawnOffsetAbove;
        
        // Start from left or right side
        const startFromLeft = Math.random() < 0.5;
        const startX = startFromLeft ? 100 : 700;
        
        console.log(`🏗️ SPAWNING GOLEM BOSS:`);
        console.log(`   Position: (${startX}, ${golemY})`);
        console.log(`   Player Y: ${playerCurrentY}`);
        console.log(`   Spawn offset: ${spawnOffsetAbove}px above player`);
        
        // Create golem sprite
        this.golem = scene.physics.add.sprite(startX, golemY, 'golem_idle');
        this.golem.setScale(3.0); // Make golem bigger than regular monsters
        this.golem.setDepth(1001); // Higher depth than regular monsters
        this.golem.setTint(0xffaaaa); // Slight red tint to make it stand out
        
        // Golem properties
        this.golem.monsterType = 'golem';
        this.golem.movingRight = startFromLeft;
        this.golem.patrolStartX = startFromLeft ? 100 : 350;
        this.golem.patrolEndX = startFromLeft ? 450 : 700;
        this.golem.isDying = false;
        this.golem.health = 2; // Golem takes 2 hits to kill
        this.golem.maxHealth = 2;
        
        // Physics setup - larger hitbox for boss
        this.golem.body.setSize(this.golem.width * 0.6, this.golem.height * 0.6);
        this.golem.body.setOffset(this.golem.width * 0.2, this.golem.height * 0.2);
        this.golem.body.setCollideWorldBounds(false);
        
        // Flying golem - no gravity
        this.golem.body.setGravityY(-scene.physics.world.gravity.y);
        this.golem.setVelocityX(this.golem.movingRight ? 100 : -100); // Slower than regular monsters
        this.golem.setVelocityY(0);
        
        // Lock Y position like other flying monsters
        this.golem.fixedY = golemY;
        this.golem.y = this.golem.fixedY;
        
        // Set to first frame only (no animation)
        this.golem.setFrame(0);
        
        // Add to monsters group for collision detection
        this.monsters.add(this.golem);
        this.activeMonsters.push(this.golem);
        
        // Mark golem as active
        this.golemActive = true;
        
        console.log('🏗️ GOLEM BOSS SPAWNED! Prepare for battle!');
        
        // Show golem spawn notification
        this.showGolemSpawnNotification();
    }
    
    // Show notification when golem spawns
    showGolemSpawnNotification() {
        const scene = this.scene;
        const centerX = scene.cameras.main.centerX;
        const centerY = scene.cameras.main.centerY;
        
        // Boss warning text
        const bossWarning = scene.add.text(centerX, centerY, '⚠️ BOSS GOLEM SPAWNED! ⚠️', {
            fontSize: '32px',
            fontStyle: 'bold',
            fill: '#ff0000',
            stroke: '#ffff00',
            strokeThickness: 3,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 0, stroke: true, fill: true }
        }).setOrigin(0.5).setScrollFactor(0);
        
        // Flash effect
        scene.tweens.add({
            targets: bossWarning,
            scaleX: 1.2,
            scaleY: 1.2,
            alpha: 0.7,
            duration: 500,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                bossWarning.destroy();
            }
        });
    }

    // Clean up when scene ends
    destroy() {
        if (this.monsters) {
            this.monsters.clear(true, true);
        }
        this.activeMonsters = [];
        this.golem = null;
        this.golemActive = false;
        console.log('🗑️ HeroMonsterManager destroyed');
    }
}

// Hero Boss Manager removed - focusing on pure climbing gameplay

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
            gravity: { y: 600 },  // Increased from 480 for much faster falling from jumps
            debug: false
        }
    },
    audio: {
        disableWebAudio: false,
        context: false,
        noAudio: false
    },
    scene: [HomeScene, CharacterSelectionScene, SoloCharacterSelectionScene, GameModesScene, MapSelectScene, GameScene, FightScene, HeroJumperScene]
};

// Initialize the game
const game = new Phaser.Game(config);