// Wait for DOM to be ready
window.addEventListener('DOMContentLoaded', function() {
    // Setup canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found.');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context.');
        return;
    }

    canvas.width = 1200;
    canvas.height = 600;

    // Initialize MVC components
    const model = new GameModel(canvas.width, canvas.height);
    const view = new Renderer(canvas, ctx);
    const controller = new GameController(model, view, canvas);

    // Load first level
    model.loadLevel(model.currentLevelNumber).then(levelData => {
        if (levelData) {
            model.initializeLevel(levelData);
        } else {
            console.error('Failed to load level 1!');
        }
    });

    // Start game
    controller.start();
});
