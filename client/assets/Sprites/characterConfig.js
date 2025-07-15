/**
 * SuperHead Showdown - Character Configuration
 * This file contains all character sprite configurations for easy integration with Phaser.
 */

// Character definitions with sprite paths and animation data
const CHARACTER_SPRITE_CONFIG = {
    // ===== TINY HEROES =====
    tinyHeroes: {
        pinkMonster: {
            name: 'Pink Monster',
            type: 'sprite_sheet',
            hasAnimation: true,
            basePath: 'assets/Sprites/free-pixel-art-tiny-hero-sprites/1 Pink_Monster/',
            animations: {
                idle: {
                    file: 'Pink_Monster_Idle_4.png',
                    frames: 4,
                    frameRate: 8,
                    repeat: -1
                },
                walk: {
                    file: 'Pink_Monster_Walk_6.png',
                    frames: 6,
                    frameRate: 10,
                    repeat: -1
                },
                run: {
                    file: 'Pink_Monster_Run_6.png',
                    frames: 6,
                    frameRate: 12,
                    repeat: -1
                },
                jump: {
                    file: 'Pink_Monster_Jump_8.png',
                    frames: 8,
                    frameRate: 15,
                    repeat: 0
                },
                attack1: {
                    file: 'Pink_Monster_Attack1_4.png',
                    frames: 4,
                    frameRate: 12,
                    repeat: 0
                },
                attack2: {
                    file: 'Pink_Monster_Attack2_6.png',
                    frames: 6,
                    frameRate: 15,
                    repeat: 0
                },
                hurt: {
                    file: 'Pink_Monster_Hurt_4.png',
                    frames: 4,
                    frameRate: 10,
                    repeat: 0
                },
                death: {
                    file: 'Pink_Monster_Death_8.png',
                    frames: 8,
                    frameRate: 8,
                    repeat: 0
                },
                throw: {
                    file: 'Pink_Monster_Throw_4.png',
                    frames: 4,
                    frameRate: 12,
                    repeat: 0
                },
                climb: {
                    file: 'Pink_Monster_Climb_4.png',
                    frames: 4,
                    frameRate: 8,
                    repeat: -1
                },
                push: {
                    file: 'Pink_Monster_Push_6.png',
                    frames: 6,
                    frameRate: 10,
                    repeat: -1
                },
                walkAttack: {
                    file: 'Pink_Monster_Walk+Attack_6.png',
                    frames: 6,
                    frameRate: 12,
                    repeat: -1
                }
            },
            defaultAnimation: 'idle'
        },

        owletMonster: {
            name: 'Owlet Monster',
            type: 'sprite_sheet',
            hasAnimation: true,
            basePath: 'assets/Sprites/free-pixel-art-tiny-hero-sprites/2 Owlet_Monster/',
            animations: {
                idle: {
                    file: 'Owlet_Monster_Idle_4.png',
                    frames: 4,
                    frameRate: 8,
                    repeat: -1
                },
                walk: {
                    file: 'Owlet_Monster_Walk_6.png',
                    frames: 6,
                    frameRate: 10,
                    repeat: -1
                },
                run: {
                    file: 'Owlet_Monster_Run_6.png',
                    frames: 6,
                    frameRate: 12,
                    repeat: -1
                },
                jump: {
                    file: 'Owlet_Monster_Jump_8.png',
                    frames: 8,
                    frameRate: 15,
                    repeat: 0
                },
                attack1: {
                    file: 'Owlet_Monster_Attack1_4.png',
                    frames: 4,
                    frameRate: 12,
                    repeat: 0
                },
                attack2: {
                    file: 'Owlet_Monster_Attack2_6.png',
                    frames: 6,
                    frameRate: 15,
                    repeat: 0
                },
                hurt: {
                    file: 'Owlet_Monster_Hurt_4.png',
                    frames: 4,
                    frameRate: 10,
                    repeat: 0
                },
                death: {
                    file: 'Owlet_Monster_Death_8.png',
                    frames: 8,
                    frameRate: 8,
                    repeat: 0
                },
                throw: {
                    file: 'Owlet_Monster_Throw_4.png',
                    frames: 4,
                    frameRate: 12,
                    repeat: 0
                },
                climb: {
                    file: 'Owlet_Monster_Climb_4.png',
                    frames: 4,
                    frameRate: 8,
                    repeat: -1
                },
                push: {
                    file: 'Owlet_Monster_Push_6.png',
                    frames: 6,
                    frameRate: 10,
                    repeat: -1
                },
                walkAttack: {
                    file: 'Owlet_Monster_Walk+Attack_6.png',
                    frames: 6,
                    frameRate: 12,
                    repeat: -1
                }
            },
            defaultAnimation: 'idle'
        },

        dudeMonster: {
            name: 'Dude Monster',
            type: 'sprite_sheet',
            hasAnimation: true,
            basePath: 'assets/Sprites/free-pixel-art-tiny-hero-sprites/3 Dude_Monster/',
            animations: {
                idle: {
                    file: 'Dude_Monster_Idle_4.png',
                    frames: 4,
                    frameRate: 8,
                    repeat: -1
                },
                walk: {
                    file: 'Dude_Monster_Walk_6.png',
                    frames: 6,
                    frameRate: 10,
                    repeat: -1
                },
                run: {
                    file: 'Dude_Monster_Run_6.png',
                    frames: 6,
                    frameRate: 12,
                    repeat: -1
                },
                jump: {
                    file: 'Dude_Monster_Jump_8.png',
                    frames: 8,
                    frameRate: 15,
                    repeat: 0
                },
                attack1: {
                    file: 'Dude_Monster_Attack1_4.png',
                    frames: 4,
                    frameRate: 12,
                    repeat: 0
                },
                attack2: {
                    file: 'Dude_Monster_Attack2_6.png',
                    frames: 6,
                    frameRate: 15,
                    repeat: 0
                },
                hurt: {
                    file: 'Dude_Monster_Hurt_4.png',
                    frames: 4,
                    frameRate: 10,
                    repeat: 0
                },
                death: {
                    file: 'Dude_Monster_Death_8.png',
                    frames: 8,
                    frameRate: 8,
                    repeat: 0
                },
                throw: {
                    file: 'Dude_Monster_Throw_4.png',
                    frames: 4,
                    frameRate: 12,
                    repeat: 0
                },
                climb: {
                    file: 'Dude_Monster_Climb_4.png',
                    frames: 4,
                    frameRate: 8,
                    repeat: -1
                },
                push: {
                    file: 'Dude_Monster_Push_6.png',
                    frames: 6,
                    frameRate: 10,
                    repeat: -1
                },
                walkAttack: {
                    file: 'Dude_Monster_Walk+Attack_6.png',
                    frames: 6,
                    frameRate: 12,
                    repeat: -1
                }
            },
            defaultAnimation: 'idle'
        }
    },

    // ===== MINI PIXEL PACK =====
    miniPixelPack: {
        drscience: {
            name: 'Dr. Science',
            type: 'single_frame',
            hasAnimation: false,
            basePath: 'assets/Sprites/MiniPixelPack/1 - Dr. Science/',
            animations: {
                idle: {
                    file: 'Idle (16 x 16).png'
                },
                walk: {
                    file: 'Run (16 x 16).png'
                },
                jump: {
                    file: 'Jump (16 x 16).png'
                },
                hurt: {
                    file: 'Hurt (16 x 16).png'
                },
                blink: {
                    file: 'Blink (16 x 16).png'
                }
            },
            defaultAnimation: 'idle'
        },

        capp: {
            name: 'Capp',
            type: 'single_frame',
            hasAnimation: false,
            basePath: 'assets/Sprites/MiniPixelPack/2 - Capp/',
            animations: {
                idle: {
                    file: 'Idle (16 x 16).png'
                },
                walk: {
                    file: 'Run (16 x 16).png'
                },
                jump: {
                    file: 'Jump (16 x 16).png'
                },
                hurt: {
                    file: 'Hurt (16 x 16).png'
                },
                blink: {
                    file: 'Blink (16 x 16).png'
                },
                punch: {
                    file: 'Punch (32 x 16).png'
                }
            },
            defaultAnimation: 'idle'
        },

        tanker: {
            name: 'Tanker',
            type: 'single_frame',
            hasAnimation: false,
            basePath: 'assets/Sprites/MiniPixelPack/3 - Tanker/',
            animations: {
                idle: {
                    file: 'Idle (16 x 16).png'
                },
                walk: {
                    file: 'Moving (16 x 16).png'
                },
                hurt: {
                    file: 'Hurt (16 x 16).png'
                },
                blink: {
                    file: 'Blink (16 x 16).png'
                },
                shoot: {
                    file: 'Shooting (16 x 16).png'
                }
            },
            defaultAnimation: 'idle'
        }
    }
};

// Helper functions for easy access
const CharacterSpriteHelper = {
    /**
     * Get all available character IDs
     */
    getAllCharacterIds: function() {
        const ids = [];
        Object.keys(CHARACTER_SPRITE_CONFIG).forEach(category => {
            Object.keys(CHARACTER_SPRITE_CONFIG[category]).forEach(charId => {
                ids.push({ category, id: charId });
            });
        });
        return ids;
    },

    /**
     * Get character config by category and ID
     */
    getCharacterConfig: function(category, characterId) {
        return CHARACTER_SPRITE_CONFIG[category]?.[characterId] || null;
    },

    /**
     * Get all characters in a category
     */
    getCharactersByCategory: function(category) {
        return CHARACTER_SPRITE_CONFIG[category] || {};
    },

    /**
     * Get character's full path for an animation
     */
    getAnimationPath: function(category, characterId, animationName) {
        const config = this.getCharacterConfig(category, characterId);
        if (!config) return null;

        const animation = config.animations[animationName];
        if (!animation) return null;

        if (config.type === 'sprite_sheet') {
            return config.basePath + animation.file;
        } else {
            return config.basePath + animation.folder;
        }
    },

    /**
     * Get frame pattern for individual frame animations
     */
    getFramePattern: function(category, characterId, animationName) {
        const config = this.getCharacterConfig(category, characterId);
        if (!config || config.type !== 'individual_frames') return null;

        const animation = config.animations[animationName];
        return animation?.framePattern || null;
    }
};

// Export for Node.js and browser compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CHARACTER_SPRITE_CONFIG,
        CharacterSpriteHelper
    };
} else {
    window.CHARACTER_SPRITE_CONFIG = CHARACTER_SPRITE_CONFIG;
    window.CharacterSpriteHelper = CharacterSpriteHelper;
} 