class Pickup extends Entity {
    constructor(x, y, type) {
        super(x, y, 24, 24);
        this.type = type; // 'iron', 'wood', 'stone'
        this.collected = false;
        this.collectRadius = 40; // distância para coletar
        this.bobOffset = Math.random() * Math.PI * 2; // animação flutuante
        this.time = 0;
    }
    
    update(deltaTime, player) {
        if (this.collected) return null;
        
        this.time += deltaTime;
        
        // Calcular distância até o jogador
        const dx = (player.x + player.width/2) - (this.x + this.width/2);
        const dy = (player.y + player.height/2) - (this.y + this.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Coleta automática ao se aproximar
        if (distance < this.collectRadius) {
            this.collected = true;
            return { type: 'collected', item: this.type };
        }
        
        return null;
    }
    
    render(ctx, camera) {
        if (this.collected) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Animação flutuante
        const bob = Math.sin(this.time * 3 + this.bobOffset) * 3;
        
        // Sombra no chão
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + 12, screenY + 22, 8, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Desenhar item conforme o tipo
        const y = screenY + bob;
        
        if (this.type === 'iron') {
            // Ferro - cubo cinza metálico
            ctx.fillStyle = '#8a8a8a';
            ctx.fillRect(screenX + 4, y + 4, 16, 16);
            ctx.fillStyle = '#b0b0b0';
            ctx.fillRect(screenX + 6, y + 6, 4, 4);
            ctx.fillStyle = '#5a5a5a';
            ctx.fillRect(screenX + 14, y + 14, 4, 4);
        } else if (this.type === 'wood') {
            // Madeira - tronco marrom
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(screenX + 4, y + 6, 16, 12);
            ctx.fillStyle = '#a0703c';
            ctx.fillRect(screenX + 6, y + 8, 12, 2);
            ctx.fillRect(screenX + 6, y + 12, 12, 2);
        } else if (this.type === 'stone') {
            // Pedra - rocha cinza
            ctx.fillStyle = '#7a7a7a';
            ctx.beginPath();
            ctx.moveTo(screenX + 12, y + 4);
            ctx.lineTo(screenX + 20, y + 10);
            ctx.lineTo(screenX + 18, y + 18);
            ctx.lineTo(screenX + 6, y + 18);
            ctx.lineTo(screenX + 4, y + 10);
            ctx.closePath();
            ctx.fill();
            ctx.fillStyle = '#9a9a9a';
            ctx.fillRect(screenX + 8, y + 8, 4, 4);
        }
    }
}