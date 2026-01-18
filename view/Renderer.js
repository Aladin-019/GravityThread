// Renderer.js - Handles all rendering and drawing

class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    // Clear canvas
    clear() {
        this.ctx.fillStyle = '#0a0a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Draw intro screen
    drawIntroScreen() {
        // Dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Intro text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('You are running out of fuel!', this.canvas.width / 2, this.canvas.height / 2 - 120);
        
        this.ctx.font = '28px Arial';
        this.ctx.fillText('Use your remaining fuel and the gravity', this.canvas.width / 2, this.canvas.height / 2 - 60);
        this.ctx.fillText('of celestial bodies to your advantage.', this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.fillText('You must head to the green zone', this.canvas.width / 2, this.canvas.height / 2 + 20);
        this.ctx.fillText('to make it home safe!', this.canvas.width / 2, this.canvas.height / 2 + 60);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillStyle = '#ffff00';
        this.ctx.fillText('Click to continue', this.canvas.width / 2, this.canvas.height / 2 + 120);
    }

    // Draw level screen
    drawLevelScreen(currentLevel) {
        // Dark overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (currentLevel) {
            // Level text
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = 'bold 48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Level ${currentLevel.number}`, this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.font = '24px Arial';
            this.ctx.fillStyle = '#ffff00';
            this.ctx.fillText('Click to start', this.canvas.width / 2, this.canvas.height / 2 + 60);
        } else {
            // Level not loaded yet - show loading message
            this.ctx.fillStyle = '#ffff00';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Loading level...', this.canvas.width / 2, this.canvas.height / 2);
        }
    }

    // Draw green zone
    drawGreenZone(greenZone) {
        if (!greenZone) return;
        
        this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.fillRect(this.canvas.width - greenZone.width, greenZone.top, greenZone.width, greenZone.bottom - greenZone.top);
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(this.canvas.width - greenZone.width, greenZone.top, greenZone.width, greenZone.bottom - greenZone.top);
    }

    // Draw celestial bodies (planets, stars, asteroids, etc.)
    drawCelestialBodies(celestialBodies) {
        celestialBodies.forEach(body => {
            // Use custom color if provided, otherwise default to brown
            const fillColor = body.color || '#8b4513';
            const strokeColor = body.strokeColor || '#8b4513';
            
            this.ctx.fillStyle = fillColor;
            this.ctx.beginPath();
            this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = strokeColor;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }

    // Draw pullback line
    drawPullbackLine(pullStartX, pullStartY, pullCurrentX, pullCurrentY, shipHeight) {
        // Calculate tip of triangle position
        const dx = pullCurrentX - pullStartX;
        const dy = pullCurrentY - pullStartY;
        const angle = Math.atan2(dy, dx) - Math.PI / 2;
        
        // Transform ship to pullback direction
        const tipOffsetX = Math.sin(angle) * (shipHeight / 2);
        const tipOffsetY = -Math.cos(angle) * (shipHeight / 2);
        const tipX = pullStartX + tipOffsetX;
        const tipY = pullStartY + tipOffsetY;
        
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]); // Dashed line
        this.ctx.beginPath();
        this.ctx.moveTo(tipX, tipY); // Start line from tip of triangle
        this.ctx.lineTo(pullCurrentX, pullCurrentY);
        this.ctx.stroke();
        this.ctx.setLineDash([]); // Reset line dash
        
        // Draw pullback indicator circle at mouse position
        this.ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(pullCurrentX, pullCurrentY, 10, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Draw ship
    drawShip(ship, isPullingBack, pullStartX, pullStartY, pullCurrentX, pullCurrentY) {
        if (!ship.isActive) return;
        
        this.ctx.save();
        this.ctx.translate(ship.x, ship.y);
        this.ctx.rotate(Math.PI / 2);
        
        // Rotate ship to face pullback direction or movement direction
        if (isPullingBack) {
            const dx = pullCurrentX - pullStartX;
            const dy = pullCurrentY - pullStartY;
            this.ctx.rotate(Math.atan2(dy, dx) - Math.PI);
        } else if (ship.velocityX !== 0 || ship.velocityY !== 0) {
            // After launch, use the stored angle (orientation from when released)
            this.ctx.rotate(ship.angle);
        }
        
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -ship.height / 2);  // Top point
        this.ctx.lineTo(-ship.width / 2, ship.height / 2);  // Bottom left
        this.ctx.lineTo(ship.width / 2, ship.height / 2);   // Bottom right
        this.ctx.closePath();
        this.ctx.fill();
        
        // Draw ship outline
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    // Draw win message
    drawWinMessage() {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Level Complete!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Ship passed through green zone', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('Click to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    // Draw game over message
    drawGameOverMessage() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Ship crashed into planet or missed green zone', this.canvas.width / 2, this.canvas.height / 2 + 10);
        this.ctx.fillText('Click to restart', this.canvas.width / 2, this.canvas.height / 2 + 40);
    }
}
