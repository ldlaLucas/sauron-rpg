class ForgeObject extends Entity {
    constructor(x, y) {
        super(x, y, 64, 64);
        this.interactionRadius = 70;
        this.canInteract = false;
        this.time = 0;
    }
    
    update(player, input) {
        this.time += 0.016;
        
        const dx = (player.x + player.width/2) - (this.x + this.width/2);
        const dy = (player.y + player.height/2) - (this.y + this.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.canInteract = distance < this.interactionRadius;

                // ✅ NOVO: Emite faíscas periodicamente quando há jogador perto
        if (this.canInteract && window.game && window.game.particles) {
            if (!this.sparkTimer) this.sparkTimer = 0;
            this.sparkTimer -= 0.016;
            if (this.sparkTimer <= 0) {
                window.game.particles.emitForgeSparks(
                    this.x + this.width / 2,
                    this.y + this.height / 2
                );
                this.sparkTimer = 0.5; // Emite faíscas a cada 0.5 segundos
            }
        }

        if (this.canInteract && input.isKeyDown('e')) {
            return { type: 'open_forge', forge: this };
        }
        
        return null;
    }
    
    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Base da forja (pedra)
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(screenX + 4, screenY + 30, 56, 30);
        
        // Parte superior (metal)
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(screenX + 8, screenY + 20, 48, 15);
        
        // Fogo (animação simples)
        const flicker = Math.sin(this.time * 10) * 2;
        
        // Chama externa (laranja)
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(screenX + 16, screenY + 25);
        ctx.lineTo(screenX + 32, screenY + 5 + flicker);
        ctx.lineTo(screenX + 48, screenY + 25);
        ctx.closePath();
        ctx.fill();
        
        // Chama interna (amarela)
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.moveTo(screenX + 22, screenY + 25);
        ctx.lineTo(screenX + 32, screenY + 12 + flicker);
        ctx.lineTo(screenX + 42, screenY + 25);
        ctx.closePath();
        ctx.fill();
        
        // Brilho no chão
        ctx.fillStyle = 'rgba(255, 100, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(screenX + 32, screenY + 58, 28, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Bigorna ao lado
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(screenX - 20, screenY + 40, 20, 15);
        ctx.fillStyle = '#5a5a5a';
        ctx.fillRect(screenX - 24, screenY + 35, 28, 8);
        
        // Indicador de interação
        if (this.canInteract) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[E] FORJAR', screenX + 32, screenY - 10);
        }
    }
}