// GameModel.js - Manages all game state and data

class GameModel {
    constructor(canvasWidth, canvasHeight) {
        // Canvas dimensions
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;

        // Game state
        this.gameOver = false;
        this.gameWon = false;
        this.showIntro = true;
        this.showLevel = false;
        
        // Level data
        this.currentLevelNumber = 1;
        this.currentLevel = null;
        this.celestialBodies = [];  // Planets, stars, asteroids, etc.
        this.greenZone = null;

        // Ship object
        this.ship = {
            x: 150,
            y: canvasHeight / 2,
            width: 15,
            height: 20,
            velocityX: 0,
            velocityY: 0,
            angle: 0,
            isActive: true
        };

        // Pullback state
        this.isPullingBack = false;
        this.pullStartX = 0;
        this.pullStartY = 0;
        this.pullCurrentX = 0;
        this.pullCurrentY = 0;
    }

    // Load level from JSON file
    async loadLevel(levelNumber) {
        try {
            const response = await fetch(`levels/level${levelNumber}.json`);
            if (!response.ok) {
                console.error(`Level ${levelNumber} not found!`);
                return null;
            }
            const levelData = await response.json();
            return levelData;
        } catch (error) {
            console.error('Error loading level:', error);
            return null;
        }
    }

    // Initialize level data
    initializeLevel(levelData) {
        if (!levelData) return;
        
        this.currentLevel = levelData;
        this.celestialBodies = levelData.celestialBodies.map(p => ({ ...p }));
        this.greenZone = {
            x: this.canvasWidth,
            top: levelData.greenZone.top,
            bottom: levelData.greenZone.bottom,
            width: levelData.greenZone.width
        };
        
        // Reset ship to start position
        this.ship.x = levelData.shipStart.x;
        this.ship.y = levelData.shipStart.y;
        this.ship.velocityX = 0;
        this.ship.velocityY = 0;
        this.ship.isActive = true;
    }

    // Reset game state
    reset() {
        this.gameOver = false;
        this.gameWon = false;
        this.ship.isActive = true;
    }
}
