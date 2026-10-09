class InputManager {
    constructor() {
        this.keys = {};
        this.setupListeners();
    }
    
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    update() {
        // Atualiza estado dos inputs (se necessário no futuro)
    }
    
    isKeyDown(key) {
        return this.keys[key.toLowerCase()] || false;
    }
    
    getMovement() {
        let dx = 0;
        let dy = 0;
        
        if (this.isKeyDown('w') || this.isKeyDown('arrowup')) dy -= 1;
        if (this.isKeyDown('s') || this.isKeyDown('arrowdown')) dy += 1;
        if (this.isKeyDown('a') || this.isKeyDown('arrowleft')) dx -= 1;
        if (this.isKeyDown('d') || this.isKeyDown('arrowright')) dx += 1;
        
        // Normalizar diagonal
        if (dx !== 0 && dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
        }
        
        return { dx, dy };
    }
}