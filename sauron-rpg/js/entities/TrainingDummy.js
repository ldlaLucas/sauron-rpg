class TrainingDummy extends Enemy {
    constructor(x, y, damageTypeWeakness = null) {
        const resistances = {
            'physical': 0,
            'fire': 0,
            'ice': 0,
            'lightning': 0,
            'shadow': 0,
            'light': 0
        };
        
        if (damageTypeWeakness) {
            resistances[damageTypeWeakness] = -0.5;
        }
        
        super(x, y, 32, 40, {
            name: damageTypeWeakness ? 
                `Boneco (Fraco a ${DAMAGE_TYPE_NAMES[damageTypeWeakness]})` : 
                'Boneco de Treino',
            hp: 50,
            damage: 0,
            defense: 0,
            xpReward: 15,
            speed: 0,
            patrolSpeed: 0,
            chaseSpeed: 0,
            attackRange: 0,
            detectionRange: 0,
            attackCooldown: 0,
            respawnTime: 4,
            color: '#8b5a2b',
            resistances: resistances
        });
        
        this.weakness = damageTypeWeakness;
        this.debugCounter = 0; // ✅ DEBUG
    }
    
    update(deltaTime, player, tileMap) {
        // ✅ DEBUG: Log a cada 60 frames (~1 segundo)
        this.debugCounter++;
        if (this.debugCounter % 60 === 0) {
            console.log(`🔍 [${this.name}] update() chamado. hitFlash=${this.hitFlash.toFixed(2)}, alive=${this.alive}`);
        }
        
        if (!this.alive) {
            this.respawnTimer -= deltaTime;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return null;
        }
        
        // ✅ CORREÇÃO: Decrementa hitFlash SEMPRE
        if (this.hitFlash > 0) {
            const oldFlash = this.hitFlash;
            this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 4);
            
            // ✅ DEBUG: Log quando hitFlash muda
            if (this.debugCounter % 30 === 0 && oldFlash !== this.hitFlash) {
                console.log(`🔍 [${this.name}] hitFlash: ${oldFlash.toFixed(2)} → ${this.hitFlash.toFixed(2)}`);
            }
        }
        
        return null;
    }
    
    render(ctx, camera) {
        if (!this.alive) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // ✅ CORREÇÃO: Flash só quando hitFlash > 0.5 (threshold mais alto)
        const useWhite = this.hitFlash > 0.5;
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY + 38, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Poste central
        ctx.fillStyle = useWhite ? '#ffffff' : '#5a3a1a';
        ctx.fillRect(screenX + 14, screenY + 10, 4, 28);
        
        // Braços
        ctx.fillStyle = useWhite ? '#ffffff' : '#5a3a1a';
        ctx.fillRect(screenX + 4, screenY + 14, 24, 4);
        
        // Cabeça
        ctx.fillStyle = useWhite ? '#ffffff' : '#8b5a2b';
        ctx.fillRect(screenX + 8, screenY + 2, 16, 14);
        
        // Detalhes
        ctx.fillStyle = '#3a2a0a';
        ctx.fillRect(screenX + 8, screenY + 6, 16, 1);
        ctx.fillRect(screenX + 8, screenY + 10, 16, 1);
        
        // Barra de HP
        const barWidth = 42;
        const barHeight = 4;
        const barX = screenX - 5;
        const barY = screenY - 10;
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const hpPercent = this.hp / this.maxHP;
        ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + 16, barY - 2);
    }
}