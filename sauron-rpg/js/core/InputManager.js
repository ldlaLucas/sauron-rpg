class InputManager {
    constructor() {
        this.keys = {};
        this.setupListeners();

        this.tabKeyReleased = true; // Para evitar múltiplos toggles do minimapa

        this.keys = {};
        this.keys['control'] = false;

               // ✅ NOVO: Garante que Shift está sendo rastreado
        if (!this.keys['shift']) {
            this.keys['shift'] = false;
        }
    }
    
    setupListeners() {
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Control') {
                this.keys['control'] = true;
            }
            
            this.keys[e.key.toLowerCase()] = true;
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'Control') {
                this.keys['control'] = false;
            }
            this.keys[e.key.toLowerCase()] = false;
        });
                window.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = true;
            
            // ✅ NOVO: Shift
            if (e.key === 'Shift') {
                this.keys['shift'] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            this.keys[key] = false;
            
            // ✅ NOVO: Shift
            if (e.key === 'Shift') {
                this.keys['shift'] = false;
            }
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
        
                if (window.game && window.game.minimap) {
            const tabPressed = this.isKeyDown('tab');
            if (tabPressed && !this.tabKeyReleased) {
                window.game.minimap.toggle();
                this.tabKeyReleased = false;
            } else if (!tabPressed) {
                this.tabKeyReleased = true;
            }
        }
        return { dx, dy };

    }
}