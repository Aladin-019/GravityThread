// GameController.js - Handles game logic, physics, and input

class GameController {
    constructor(model, view, canvas) {
        this.model = model;
        this.view = view;
        this.canvas = canvas;
        this.gameLoopRunning = false;

        // Bind methods to preserve 'this' context
        this.startPullback = this.startPullback.bind(this);
        this.updatePullback = this.updatePullback.bind(this);
        this.releasePullback = this.releasePullback.bind(this);
        this.gameLoop = this.gameLoop.bind(this);

        // Setup event listeners
        this.setupEventListeners();
    }

    // Get mouse/touch position within canvas
    getCanvasPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    // Setup event listeners
    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', this.startPullback);
        this.canvas.addEventListener('mousemove', this.updatePullback);
        this.canvas.addEventListener('mouseup', this.releasePullback);
        this.canvas.addEventListener('mouseleave', this.releasePullback);

        // Touch events
        this.canvas.addEventListener('touchstart', this.startPullback);
        this.canvas.addEventListener('touchmove', this.updatePullback);
        this.canvas.addEventListener('touchend', this.releasePullback);
    }

    // Mouse/Touch down - start pulling back or dismiss screens
    startPullback(e) {
        e.preventDefault();
        
        // Dismiss intro screen, activate level screen
        if (this.model.showIntro) {
            this.model.showIntro = false;
            if (this.model.currentLevel) {
                this.model.showLevel = true;
            }
            return;
        }
        
        // Dismiss level screen
        if (this.model.showLevel) {
            if (this.model.currentLevel) {
                this.model.showLevel = false;
            } else {
                // Level not loaded yet, try loading again
                this.model.loadLevel(this.model.currentLevelNumber).then(levelData => {
                    if (levelData) {
                        this.model.initializeLevel(levelData);
                        this.model.showLevel = false;
                    }
                });
            }
            return;
        }
        
        // Reset game if game over, won, or ship is off screen
        if (this.model.gameOver || this.model.gameWon || !this.model.ship.isActive) {
            if (this.model.gameWon) {
                // Load next level if won
                this.model.currentLevelNumber++;
                this.model.loadLevel(this.model.currentLevelNumber).then(levelData => {
                    if (levelData) {
                        this.model.initializeLevel(levelData);
                        this.model.showLevel = true;
                        this.model.gameOver = false;
                        this.model.gameWon = false;
                    } else {
                        // No more levels, restart from level 1
                        this.model.currentLevelNumber = 1;
                        this.model.loadLevel(this.model.currentLevelNumber).then(levelData => {
                            if (levelData) {
                                this.model.initializeLevel(levelData);
                                this.model.showLevel = true;
                                this.model.gameOver = false;
                                this.model.gameWon = false;
                            }
                        });
                    }
                });
            } else {
                // Restart current level
                if (this.model.currentLevel) {
                    this.model.initializeLevel(this.model.currentLevel);
                }
                this.model.gameOver = false;
                this.model.gameWon = false;
            }
            return;
        }
        
        const pos = this.getCanvasPos(e);
        const dx = pos.x - this.model.ship.x;
        const dy = pos.y - this.model.ship.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Start pullback if clicking near the ship
        if (dist < 200 && this.model.ship.isActive) {
            this.model.isPullingBack = true;
            this.model.pullStartX = this.model.ship.x;
            this.model.pullStartY = this.model.ship.y;
            this.model.pullCurrentX = pos.x;
            this.model.pullCurrentY = pos.y;
        }
    }

    // Mouse/Touch move - update pullback
    updatePullback(e) {
        if (!this.model.isPullingBack) return;
        e.preventDefault();
        const pos = this.getCanvasPos(e);
        this.model.pullCurrentX = pos.x;
        this.model.pullCurrentY = pos.y;
    }

    // Mouse/Touch up - launch rocket
    releasePullback(e) {
        if (!this.model.isPullingBack) return;
        e.preventDefault();
        
        // Calculate launch vector opposite to draw line
        const dx = this.model.pullCurrentX - this.model.pullStartX;
        const dy = this.model.pullCurrentY - this.model.pullStartY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate launch velocity
        const maxPullback = 200;
        const maxVelocity = 10;
        const velocityScale = Math.min(distance / maxPullback, 1) * maxVelocity;
        
        // Normalize direction and apply velocity opposite to draw line
        if (distance > 5) {
            this.model.ship.velocityX = (-dx / distance) * velocityScale; // Cos theta * velocityScale
            this.model.ship.velocityY = (-dy / distance) * velocityScale; // Sin theta * velocityScale
            this.model.ship.angle = Math.atan2(-dy, -dx);
        }
        
        this.model.isPullingBack = false;
    }

    // Update physics
    updatePhysics() {
        if (!this.model.gameOver && !this.model.gameWon && this.model.ship.isActive && this.model.celestialBodies.length > 0) {
            // Update ship position only if it has velocity
            if (this.model.ship.velocityX !== 0 || this.model.ship.velocityY !== 0) {
                const G = 0.1; // Gravitational constant 
                
                this.model.celestialBodies.forEach(body => {
                    const dx = body.x - this.model.ship.x;
                    const dy = body.y - this.model.ship.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    // Only apply gravity if ship is not inside body
                    if (distance > body.radius) {
                        // Apply inverse square law
                        const force = (G * body.mass) / (distance * distance);
                        const forceX = (dx / distance) * force;
                        const forceY = (dy / distance) * force;
                        
                        // Apply force to ship velocity
                        this.model.ship.velocityX += forceX;
                        this.model.ship.velocityY += forceY;
                    }
                });
                
                // Update ship position
                this.model.ship.x += this.model.ship.velocityX;
                this.model.ship.y += this.model.ship.velocityY;
                
                // Update collisions
                this.checkCollisions();
            }
        }
    }

    // Check for collisions with celestial bodies and green zone
    checkCollisions() {
        const shipRadius = Math.max(this.model.ship.width, this.model.ship.height) / 2;
        
        // Check collision with celestial bodies
        this.model.celestialBodies.forEach(body => {
            const collisionDx = this.model.ship.x - body.x;
            const collisionDy = this.model.ship.y - body.y;
            const collisionDistance = Math.sqrt(collisionDx * collisionDx + collisionDy * collisionDy);
            
            if (collisionDistance < body.radius + shipRadius) {
                this.model.gameOver = true;
                this.model.ship.velocityX = 0;
                this.model.ship.velocityY = 0;
            }
        });
        
        // Check if ship has crossed the right edge
        if (this.model.ship.x > this.model.canvasWidth) {
            if (this.model.greenZone && this.model.ship.y >= this.model.greenZone.top && this.model.ship.y <= this.model.greenZone.bottom) {
                // Ship passed through green zone - win!
                this.model.gameWon = true;
            } else {
                // Ship passed through non-green zone - game over
                this.model.gameOver = true;
            }
            this.model.ship.velocityX = 0;
            this.model.ship.velocityY = 0;
            this.model.ship.isActive = false;
        }
    }

    // Main game loop
    gameLoop() {
        // Clear canvas
        this.view.clear();
        
        // Draw intro screen
        if (this.model.showIntro) {
            this.view.drawIntroScreen();
            requestAnimationFrame(this.gameLoop);
            return;
        }
        
        // Draw level screen
        if (this.model.showLevel) {
            this.view.drawLevelScreen(this.model.currentLevel);
            requestAnimationFrame(this.gameLoop);
            return;
        }
        
        // Draw game elements
        this.view.drawGreenZone(this.model.greenZone);
        this.view.drawCelestialBodies(this.model.celestialBodies);
        
        // Update physics
        this.updatePhysics();
        
        // Draw pullback line if pulling back
        if (this.model.isPullingBack) {
            this.view.drawPullbackLine(
                this.model.pullStartX,
                this.model.pullStartY,
                this.model.pullCurrentX,
                this.model.pullCurrentY,
                this.model.ship.height
            );
        }
        
        // Draw win message
        if (this.model.gameWon) {
            this.view.drawWinMessage();
        }
        
        // Draw game over message
        if (this.model.gameOver) {
            this.view.drawGameOverMessage();
        }
        
        // Draw ship
        if (this.model.ship.isActive && !this.model.gameOver && !this.model.gameWon) {
            this.view.drawShip(
                this.model.ship,
                this.model.isPullingBack,
                this.model.pullStartX,
                this.model.pullStartY,
                this.model.pullCurrentX,
                this.model.pullCurrentY
            );
        }
        
        // Continue game loop
        requestAnimationFrame(this.gameLoop);
    }

    // Start the game
    start() {
        if (!this.gameLoopRunning) {
            this.gameLoopRunning = true;
            this.gameLoop();
        }
    }
}
