class CorruptedShadow extends Enemy {
    constructor(x, y, patrolPoints = []) {
        super(x, y, 28, 32, {
            name: 'Sombra Corrompida',
            hp: 40,
            damage: 8,
            defense: 2,
            xpReward: 20,
            speed: 60,
            patrolSpeed: 35,
            chaseSpeed: 75,
            attackRange: 35,
            detectionRange: 140,
            attackCooldown: 1.8,
            respawnTime: 30,
            homeRadius: 180,
            color: '#2a1a3a',
            patrolPoints: patrolPoints,
            // ✅ NOVO: Resistências temáticas
            resistances: {
                'physical': 0,
                'fire': 0,
                'ice': 0,
                'lightning': 0,
                'shadow': -0.5, // Resistente a Sombra (-50% dano)
                'light': 0.5    // Fraco a Luz (+50% dano)
            }
        });
        
        this.pulseTimer = 0;
        this.respawnEffect = 0;
    }
    
    update(deltaTime, player, tileMap) {
        this.pulseTimer += deltaTime;
        if (this.respawnEffect > 0) {
            this.respawnEffect -= deltaTime;
        }
        
        // ✅ NOVO: Rastro de fumaça ao perseguir
        if ((this.state === 'chase' || this.state === 'attack') && 
            window.game && window.game.particles) {
            if (!this.smokeTimer) this.smokeTimer = 0;
            this.smokeTimer -= deltaTime;
            if (this.smokeTimer <= 0) {
                window.game.particles.emitShadowSmoke(
                    this.x + this.width / 2,
                    this.y + this.height / 2
                );
                this.smokeTimer = 0.1;
            }
        }
        return super.update(deltaTime, player, tileMap);
    }
    
    renderDetails(ctx, x, y) {
        // Aura sombria pulsante
        const pulse = Math.sin(this.pulseTimer * 3) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(80, 20, 100, ${pulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(x + this.width/2, y + this.height/2, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Corpo principal (sombra)
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#1a0a2a';
        ctx.beginPath();
        ctx.moveTo(x + this.width/2, y + 4);
        ctx.lineTo(x + this.width - 4, y + this.height - 4);
        ctx.lineTo(x + 4, y + this.height - 4);
        ctx.closePath();
        ctx.fill();
        
        // "Olhos" brilhantes (vermelhos)
        const eyeColor = this.state === 'chase' || this.state === 'attack' ? '#ff3333' : '#aa2222';
        ctx.fillStyle = eyeColor;
        
        if (this.direction === 'down' || this.direction === 'left' || this.direction === 'right') {
            ctx.fillRect(x + 9, y + 12, 3, 3);
            ctx.fillRect(x + 16, y + 12, 3, 3);
        } else if (this.direction === 'up') {
            // Olhos não visíveis de costas
        }
        
        // Rastro de fumaça quando perseguindo
        if (this.state === 'chase' || this.state === 'attack') {
            ctx.fillStyle = 'rgba(80, 20, 100, 0.3)';
            for (let i = 0; i < 3; i++) {
                const offsetX = (Math.random() - 0.5) * 10;
                const offsetY = Math.random() * 10;
                ctx.beginPath();
                ctx.arc(x + this.width/2 + offsetX, y + this.height + offsetY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}