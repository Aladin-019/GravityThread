// Phaser 3 Game Config
const config = {
    type: Phaser.AUTO,
    width: 1200,
    height: 600,
    parent: 'gameContainer',
    backgroundColor: '#0a0a1a',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // We'll handle gravity manually
            debug: false
        }
    },
    scene: [MenuScene, GameScene, GameOverScene]
};

// Start the game when DOM ready
window.addEventListener('DOMContentLoaded', function() {
    const game = new Phaser.Game(config);
});
