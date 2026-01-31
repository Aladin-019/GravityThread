// handles intro screen and level transitions

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
        this.showingIntro = true;
        this.currentLevel = null;
    }

    create() {
        this.cameras.main.setBackgroundColor('#0a0a1a');
        
        this.showIntroScreen();
        
        // Handle click to continue
        this.input.on('pointerdown', () => {
            console.log('MenuScene click - showingIntro:', this.showingIntro, 'currentLevel:', this.currentLevel);
            if (this.showingIntro) {
                this.showingIntro = false;
                this.showLevelScreen(1);
            } else {
                // Start the game with the selected level
                console.log('Starting GameScene with level:', this.currentLevel);
                this.scene.start('GameScene', { levelNumber: this.currentLevel });
            }
        });
    }

    showIntroScreen() {

        this.children.removeAll();
        
        // Intro text
        this.add.text(600, 180, 'You are running out of fuel!', {
            fontSize: '36px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(600, 240, 'Use your remaining fuel and the gravity', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(600, 280, 'of celestial bodies to your advantage.', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(600, 320, 'You must head to the green zone', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(600, 360, 'to make it home safe!', {
            fontSize: '28px',
            fontFamily: 'Arial',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.add.text(600, 420, 'Click to continue', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffff00'
        }).setOrigin(0.5);
    }

    showLevelScreen(levelNumber) {
        // Clear existing content
        this.children.removeAll();
        
        this.currentLevel = levelNumber;
        
        // Level text
        this.add.text(600, 300, `Level ${levelNumber}`, {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(600, 380, 'Click to start', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#ffff00'
        }).setOrigin(0.5);
    }
}