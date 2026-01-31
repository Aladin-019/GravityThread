// Handles level loading and management

class LevelManager {
    // Load level from JSON file
    static async loadLevel(levelNumber) {
        try {
            const response = await fetch(`levels/level${levelNumber}.json`);
            if (!response.ok) {
                console.error(`Level ${levelNumber} not found!`);
                return null;
            }
            const levelData = await response.json();
            return levelData;
        } catch (error) {
            console.error(`DETAILED Error loading level ${levelNumber}:`, error);
            console.error('Error stack:', error.stack);
            return null;
        }
    }
}