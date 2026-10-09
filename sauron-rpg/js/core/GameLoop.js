class GameLoop {
    constructor(game) {
        this.game = game;
        this.lastTime = 0;
        this.running = false;
    }
    
    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }
    
    stop() {
        this.running = false;
    }
    
    loop() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        // Update
        this.game.update(deltaTime);
        
        // Render
        this.game.render();
        
        // Próximo frame
        requestAnimationFrame(() => this.loop());
    }
}