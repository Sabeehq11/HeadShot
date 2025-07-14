# 🧠 SuperHead Showdown — Product Requirements Document

## 🎯 Game Overview

**SuperHead Showdown** is a chaotic, fast-paced 1v1 multiplayer web-based game inspired by Head Soccer. Players control uniquely powered characters trying to outscore their opponent in short, unpredictable matches filled with special powers and randomized chaos events.

The goal is to showcase AI-augmented learning by building a fun, polished multiplayer game using new technologies (Phaser 3 + Socket.io) in under 7 days.

---

## ⚙️ Tech Stack

- **Frontend Engine:** Phaser 3 (2D Game Framework)
- **Multiplayer:** Socket.io (Real-time communication)
- **Language:** JavaScript
- **Platform:** Web (Hosted on Firebase or Vercel)
- **Optional Backend:** Node.js + Express (Matchmaking, user stats)

---

## 🎮 Core Gameplay

- 1v1 real-time soccer-style match
- First to **3 goals** or highest score in **60 seconds** wins
- Simple movement: Left, Right, Jump, Kick
- Special character ability (one per character)
- Score goals, use powers, and survive chaotic events

---

## 🧍‍♂️ Characters & Powers

Each player selects from 6 unique characters, each with their own look and special power:

| Character    | Power         | Description |
|--------------|---------------|-------------|
| **Blaze**    | Fire Kick     | Launches a fireball that knocks back opponent |
| **Frostbite**| Ice Time      | Freezes opponent for 1.5 seconds |
| **Volt**     | Lightning Dash| Quick teleport burst forward |
| **Jellyhead**| Bounce Shield | Reflects incoming ball once |
| **Brick**    | Stone Wall    | Becomes immovable for 2 seconds |
| **Whirlwind**| Air Spin      | Double jump with gust knockback |

- **Power Charge:** Gain 1 charge after every **2 goals** scored or after **15 seconds** of gameplay (whichever comes first)
- **Cooldown:** 5–10 seconds per power use
- **Max Charges:** 2 at a time

---

## 📈 Progression System

### Leveling Up (In-Match Progression)
- Level increases every 3 total goals scored (across matches)
- Each level makes your character's **head bigger** and **goal smaller**
- Visual feedback: Progress bar, level tag above character

---

## 🌪️ Mid-Game Chaos Events

One random event occurs per match (between 20s–40s). These disrupt normal gameplay and add surprise.

| Event Name     | Effect |
|----------------|--------|
| **Flip Mode**  | Screen flips upside down |
| **Tiny Titans**| Players shrink but jump 3x higher |
| **Meteor Shower**| Falling objects that stun on hit |
| **Darkness**   | Screen dims, players only see nearby area |
| **Zero Gravity**| High floaty jumps and slower falls |

---

## 🌆 Map Backgrounds

Visual variety only — no gameplay difference. More backgrounds can be unlocked as players level up.

- 🏙️ Street Court (Default)
- 🌕 Lunar Arena
- 🥋 Cyber Dojo
- ❄️ Snowy Summit
- 🌋 Volcano Pit

---

## 🧪 Unique Features

- 💥 Real-time multiplayer chaos
- 🧍 Character abilities with limited power charges
- 📈 Visual in-match progression (bigger head, smaller goal)
- 🌪️ Random chaos events (adds unpredictability)
- 🎨 Unlockable backgrounds and polish

---

## ✅ Win Conditions

- First to 3 goals OR most goals when timer ends
- Tie = Sudden death overtime with faster speed

---

## 🧰 Project Goals

- Use AI (via Cursor) to rapidly learn Phaser + Socket.io
- Build and polish full game in 7 days
- Demonstrate multiplayer, progression, AI-enhanced workflow
- Track learning through prompts, decisions, and debugging logs

---

## 🧠 Brainlift & Learning Tracker (Required)

Track the following in separate logs:
- Daily updates (Day 1 to Day 7)
- Prompts used to learn or solve issues
- Technical decisions + reasoning
- Challenges + how AI helped solve them

---

## 📦 Deliverables

- ✅ Fully playable multiplayer game (web-based)
- ✅ GitHub repo with README and setup guide
- ✅ Demo video (5 min walkthrough + gameplay)
- ✅ AI logs / Brainlift documentation

---

## 👾 Future Features (Stretch Goals)

- Ranked ladder system
- Match history
- Character skins
- Mobile-friendly controls
- Power-up items that spawn in map

--- 