class Enemy extends Entity {
    constructor(x, y, width, height, data) {
        super(x, y, width, height);
        this.data = data;
        this.name = data.name;
        this.maxHP = data.hp;
        this.hp = data.hp;
        this.damage = data.damage;
        this.defense = data.defense;
        this.xpReward = data.xpReward;
        this.speed = data.speed || 0;
        this.attackRange = data.attackRange || 40;
        this.attackCooldown = 0;
        this.attackCooldownMax = data.attackCooldown || 1.5;
        
        this.state = 'idle'; // idle, attacking, hurt, dead
        this.stateTimer = 0;
        this.alive = true;
        this.respawnTime = data.respawnTime || 5;
        this.respawnTimer = 0;
        this.originalX = x;
        this.originalY = y;
        
        this.color = data.color || '#aa3333';
        this.hitFlash = 0;
    }
    
    update(deltaTime, player) {
        // Se morto, conta respawn
        if (!this.alive) {
            this.respawnTimer -= deltaTime;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return null;
        }
        
        // Atualiza timers
        this.stateTimer -= deltaTime;
        this.attackCooldown -= deltaTime;
        this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 4);
        
        // Máquina de estados simples
        if (this.state === 'hurt' && this.stateTimer <= 0) {
            this.state = 'idle';
        }
        
        if (this.state === 'attacking' && this.stateTimer <= 0) {
            this.state = 'idle';
        }
        
        return null;
    }
    
    takeDamage(amount) {
        if (!this.alive) return { died: false };
        
        const actualDamage = Math.max(1, amount - this.defense);
        this.hp -= actualDamage;
        this.hitFlash = 1;
        this.state = 'hurt';
        this.stateTimer = 0.2;
        
        console.log(`🩸 ${this.name} recebeu ${actualDamage} de dano (HP: ${this.hp}/${this.maxHP})`);
        
        if (this.hp <= 0) {
            this.die();
            return { died: true, damage: actualDamage, xp: this.xpReward };
        }
        
        return { died: false, damage: actualDamage };
    }
    
    die() {
        this.alive = false;
        this.hp = 0;
        this.state = 'dead';
        this.respawnTimer = this.respawnTime;
        console.log(`💀 ${this.name} foi derrotado! +${this.xpReward} XP`);
    }
    
    respawn() {
        this.alive = true;
        this.hp = this.maxHP;
        this.x = this.originalX;
        this.y = this.originalY;
        this.state = 'idle';
        console.log(`🔄 ${this.name} respawnou`);
    }
    
    render(ctx, camera) {
        if (!this.alive) return;
        
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + this.width/2, screenY + this.height - 2, this.width/2 - 2, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Corpo (com flash de dano)
        if (this.hitFlash > 0) {
            ctx.fillStyle = '#ffffff';
        } else {
            ctx.fillStyle = this.color;
        }
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Detalhes do dummy (poste de treino)
        ctx.fillStyle = '#5a3a1a';
        ctx.fillRect(screenX + this.width/2 - 2, screenY + this.height - 10, 4, 10);
        
        // "Cabeça" do dummy
        ctx.fillStyle = this.hitFlash > 0 ? '#ffffff' : '#cc6633';
        ctx.fillRect(screenX + 4, screenY + 4, this.width - 8, 12);
        
        // Barra de HP
        const barWidth = this.width + 10;
        const barHeight = 4;
        const barX = screenX - 5;
        const barY = screenY - 10;
        
        // Fundo da barra
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // HP atual
        const hpPercent = this.hp / this.maxHP;
        ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        
        // Borda da barra
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Nome acima da barra
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, screenX + this.width/2, barY - 3);
    }
}