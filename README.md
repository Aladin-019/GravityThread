# Gravity Thread

A 2D gravity-based puzzle game where you navigate a rocket through celestial bodies to reach the green zone.

## How to Play

1. Click near your rocket and drag to pull back
2. Release to launch the rocket in the opposite direction
3. Use the gravity of celestial bodies to your advantage
4. Reach the green zone on the right side of the screen to complete the level

## Future updates
1. Integrate game engine for animations and sounds
2. Ship customization
3. More levels!

## Requirements

- Browser
- A web server 

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

**Option 1: Python**
```bash
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

**Option 2: VS Code Live Server**
- Install the "Live Server" extension in VS Code
- Right-click `index.html` → "Open with Live Server"

**Option 3: Node.js**
```bash
npx http-server -p 8000
```

## Architecture

This project uses the MVC (Model-View-Controller) pattern:

- Model (`model/GameModel.js`): Manages game state (ship, celestial bodies, levels)
- View (`view/Renderer.js`): Handles all canvas drawing and rendering
- Controller (`controller/GameController.js`): Handles physics, collisions, input, and game loop

## Features

- Pull-back and launch mechanics
- Gravity physics using inverse square law
- Multiple celestial body types with custom colors

## Customizing Levels

Levels are defined in JSON files under the `levels/` directory. Each level can include:

- celestialBodies: Array of celestial bodies with x, y, radius, mass, and color
- greenZone: Win condition zone
- shipStart: Initial ship position

## Technologies

- HTML5 Canvas - Rendering engine
- Vanilla JavaScript - Game logic and physics