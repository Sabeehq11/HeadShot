# 🛠️ SuperHead Showdown - Asset Setup Instructions

Follow these steps to prepare your sprite assets for the SuperHead Showdown game.

## 📋 Step-by-Step Setup

### 1. **Install Python Dependencies**
```bash
pip install pillow numpy
```

### 2. **Navigate to Sprites Directory**
```bash
cd client/assets/Sprites
```

### 3. **Run the Head Processing Script**
```bash
python3 process_heads.py
```

### 4. **Verify the Results**
After processing, you should see:
- `bighead_` prefixed files in the TinyHeroes folders
- Big head processing has been removed - using original sprite proportions

## 📁 Expected Directory Structure After Processing

```
client/assets/Sprites/
├── Processed/
│   ├── TinyHeroes/
│   │   ├── PinkMonster/
│   │   │   ├── Pink_Monster_Idle_4.png (original)
│   │   │   ├── bighead_Pink_Monster_Idle_4.png (processed)
│   │   │   ├── Pink_Monster_Walk_6.png (original)
│   │   │   ├── bighead_Pink_Monster_Walk_6.png (processed)
│   │   │   └── ... (other animations)
│   │   ├── OwletMonster/
│   │   │   └── ... (similar structure)
│   │   └── DudeMonster/
│   │       └── ... (similar structure)
│   └── MiniPixelPack/
│       ├── 1 - Dr. Science/
│       │   ├── Idle (16 x 16).png
│       │   ├── Run (16 x 16).png
│       │   ├── Jump (16 x 16).png
│       │   └── ... (other single frame images)
│       ├── 2 - Capp/
│       │   ├── Idle (16 x 16).png
│       │   ├── Run (16 x 16).png
│       │   ├── Jump (16 x 16).png
│       │   └── ... (other single frame images)
│       └── 3 - Tanker/
│           ├── Idle (16 x 16).png
│           ├── Moving (16 x 16).png
│           ├── Shooting (16 x 16).png
│           └── ... (other single frame images)
├── characterConfig.js
├── process_heads.py
├── PHASER_INTEGRATION_GUIDE.md
└── setup_instructions.md
```

## 🎯 Quick Test

### Test the Configuration:
```html
<!-- Add to your HTML -->
<script src="assets/Sprites/characterConfig.js"></script>
<script>
console.log('Available characters:', CharacterSpriteHelper.getAllCharacterIds());
</script>
```

### Test a Simple Character:
```javascript
// In your Phaser scene
const pinkMonster = CharacterSpriteHelper.getCharacterConfig('tinyHeroes', 'pinkMonster');
console.log('Pink Monster config:', pinkMonster);
```

## ⚠️ Troubleshooting

### Common Issues:

1. **Script won't run**
   - Make sure Python 3 is installed: `python3 --version`
   - Install dependencies: `pip install pillow numpy`

2. **Processing fails**
   - Verify you're in the `client/assets/Sprites` directory
   - Check that `Processed` directory exists

3. **No output files**
   - Look for error messages in the script output
   - Check file permissions

4. **Python not found**
   - Try `python` instead of `python3`
   - On Windows: Use `py` instead of `python3`

## 🚀 Next Steps

1. **Run the processing script** (this step)
2. **Read the Phaser Integration Guide** (`PHASER_INTEGRATION_GUIDE.md`)
3. **Update your game** to use the new sprite characters
4. **Test in your browser** to see the big head effect!

## 🎨 Visual Result

After processing, your characters will have:
- **1.7x larger heads** (adjustable in the script)
- **Maintained body proportions**
- **Smooth animations** that stay aligned
- **Transparent backgrounds** preserved

The "big head" effect will give your SuperHead Showdown game that distinctive cartoon look!

---

**Need help?** Check the troubleshooting section in the Phaser Integration Guide or adjust the `scale_factor` in `process_heads.py` for different head sizes. 