class CrystalPickup extends Entity {
    constructor(x, y) {
        super(x, y, 24, 24);
        this.collected = false;
        this.collectRadius = 40;
        this.time = 0;
        this.glowIntensity = 0;
    }
    
    update(deltaTime, player) {
        if (this.collected) return null;
        
        this.time += deltaTime;
        this.glowIntensity = Math.sin(this.time * 3) * 0.3 + 0.7;
        
        const dx = (player.x + player.width/2) - (this.x + this.width/2);
        const dy = (player.y + player.height/2) - (this.y + this.height/2);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.collectRadius) {
            this.collected = true;
            return { type: 'collected', item: 'valinor_crystal' };
        }
        
        return null;
    }
    
    render(ctx, camera) {
        if (this.collected) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Brilho externo
        ctx.fillStyle = `rgba(135, 206, 235, ${this.glowIntensity * 0.3})`;
        ctx.beginPath();
        ctx.arc(screenX + 12, screenY + 12, 16, 0, Math.PI * 2);
        ctx.fill();
        
        // Cristal principal
        ctx.fillStyle = '#87ceeb';
        ctx.beginPath();
        ctx.moveTo(screenX + 12, screenY + 4);
        ctx.lineTo(screenX + 18, screenY + 12);
        ctx.lineTo(screenX + 12, screenY + 20);
        ctx.lineTo(screenX + 6, screenY + 12);
        ctx.closePath();
        ctx.fill();
        
        // Reflexo
        ctx.fillStyle = `rgba(255, 255, 255, ${this.glowIntensity})`;
        ctx.beginPath();
        ctx.moveTo(screenX + 12, screenY + 6);
        ctx.lineTo(screenX + 15, screenY + 12);
        ctx.lineTo(screenX + 12, screenY + 14);
        ctx.closePath();
        ctx.fill();
        
        // Borda
        ctx.strokeStyle = '#4a90e2';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(screenX + 12, screenY + 4);
        ctx.lineTo(screenX + 18, screenY + 12);
        ctx.lineTo(screenX + 12, screenY + 20);
        ctx.lineTo(screenX + 6, screenY + 12);
        ctx.closePath();
        ctx.stroke();
    }
}