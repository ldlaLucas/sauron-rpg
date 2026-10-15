class TrainingDummy extends Enemy {
    constructor(x, y, damageTypeWeakness = null) {
        // ✅ NOVO: Resistências baseadas no tipo de fraqueza
        const resistances = {
            'physical': 0,
            'fire': 0,
            'ice': 0,
            'lightning': 0,
            'shadow': 0,
            'light': 0
        };
        
        // Se tem fraqueza, toma +50% daquele tipo
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
            resistances: resistances // ✅ NOVO
        });
        
        this.weakness = damageTypeWeakness;
    }
    
    // ✅ Sobrescreve o update para NÃO executar IA
    update(deltaTime, player, tileMap) {
        // Se morto, conta respawn
        if (!this.alive) {
            this.respawnTimer -= deltaTime;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return null;
        }
        
        // Atualiza apenas timers visuais
        this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 4);
        
        return null;
    }
    
    render(ctx, camera) {
        if (!this.alive) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY + 38, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Poste central (madeira)
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#5a3a1a';
        ctx.fillRect(screenX + 14, screenY + 10, 4, 28);
        
        // "Braços" cruzados (madeira)
        ctx.fillRect(screenX + 4, screenY + 14, 24, 4);
        
        // "Cabeça" (saco de treino)
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#8b5a2b';
        ctx.fillRect(screenX + 8, screenY + 2, 16, 14);
        
        // Detalhes do saco (cordas)
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
        
        // Nome
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + 16, barY - 2);
    }
}