# Gravity Thread

A 2D gravity-based puzzle game built with **Phaser 3**. Navigate a rocket through celestial bodies to reach the green zone.

## How to Play

1. Click near your rocket and drag to pull back
2. Release to launch the rocket in the opposite direction
3. Use the gravity of celestial bodies to your advantage
4. Reach the green zone on the right side of the screen to complete the level

## Future updates

1. Ship customization
2. More levels!

## Requirements

- A modern browser
- A local web server (Phaser loads assets via HTTP, so `file://` won't work)

### Installing a Web Server

Choose one of the following options:

**Option 1: Python (recommended)**
```bash
# Check if Python is installed
python --version

# If not installed, download from https://www.python.org/downloads/
```

**Option 2: VS Code Live Server Extension**
- Install VS Code from https://code.visualstudio.com/
- Open VS Code Extensions (Ctrl+Shift+X)
- Search for "Live Server" and install

**Option 3: Node.js**
```bash
# Check if Node.js is installed
node --version

# If not installed, download from https://nodejs.org/
```

## Quick Start

### Running Locally

**From the `GravityThread` folder** (where `index.html` lives):

**Option 1: Python**
```bash
cd GravityThread
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option 2: VS Code Live Server**
- Install the "Live Server" extension in VS Code
- Right-click `index.html` in the `GravityThread` folder → "Open with Live Server"

**Option 3: Node.js**
```bash
cd GravityThread
npx http-server -p 8000
```
Then open `http://localhost:8000` in your browser.

## Architecture

This project uses **Phaser 3** with a scene-based structure:

- **MenuScene** (`scenes/MenuScene.js`): Main menu and level selection
- **GameScene** (`scenes/GameScene.js`): Core gameplay, physics, collisions, and input
- **GameOverScene** (`scenes/GameOverScene.js`): Win/lose screens
- **LevelManager** (`managers/LevelManager.js`): Loads and manages level data from JSON

Phaser handles rendering, the game loop, and physics (Arcade). Custom gravity is applied manually in `GameScene`.

## Features

- Pull-back and launch mechanics
- Gravity physics using inverse square law
- Multiple celestial body types with custom colors
- Phaser 3 for rendering, animations, and game loop

## Customizing Levels

Levels are defined in JSON files under the `levels/` directory. Each level can include:

- `celestialBodies`: Array of celestial bodies with x, y, radius, mass, and color
- `greenZone`: Win condition zone
- `shipStart`: Initial ship position

## Technologies

- **Phaser 3** – Game engine (rendering, scenes, physics, input)
- Vanilla JavaScript – Game logic and custom gravity