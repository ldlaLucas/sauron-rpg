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
        this.speed = data.speed || 60;
        this.patrolSpeed = data.patrolSpeed || 40;
        this.chaseSpeed = data.chaseSpeed || 80;
        this.attackRange = data.attackRange || 40;
        this.detectionRange = data.detectionRange || 150;
        this.attackCooldown = 0;
        this.attackCooldownMax = data.attackCooldown || 1.5;
        
        // ✅ IA - Máquina de estados
        this.state = 'idle';
        this.stateTimer = 0;
        this.alive = true;
        this.respawnTime = data.respawnTime || 10;
        this.respawnTimer = 0;
        
        // Posição original (para retorno)
        this.originalX = x;
        this.originalY = y;
        this.homeRadius = data.homeRadius || 150;
        
        // Patrulha
        this.patrolPoints = data.patrolPoints || [];
        this.currentPatrolIndex = 0;
        this.patrolWaitTime = 0;
        
        // Visual
        this.color = data.color || '#aa3333';
        this.hitFlash = 0;
        this.direction = 'down';
        
        // Animação simples
        this.animTimer = 0;
        this.animFrame = 0;

           // ✅ NOVO: Resistências por tipo de dano
        // Valores: 0 = neutro, 0.5 = +50% dano (fraqueza), -0.5 = -50% dano (resistência), 1 = imunidade
        this.resistances = data.resistances || {
            'physical': 0,
            'fire': 0,
            'ice': 0,
            'lightning': 0,
            'shadow': 0,
            'light': 0
        };
        
        // ✅ NOVO: Sistema de tipos de dano
        this.damage
    }
    
    update(deltaTime, player, tileMap) {
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
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 4);
        this.animTimer += deltaTime;
        
        // Atualiza animação
        if (this.animTimer > 0.2) {
            this.animTimer = 0;
            this.animFrame = (this.animFrame + 1) % 4;
        }
        
        // Máquina de estados
        switch (this.state) {
            case 'idle':
                this.updateIdle(deltaTime, player);
                break;
            case 'patrol':
                this.updatePatrol(deltaTime, player, tileMap);
                break;
            case 'chase':
                this.updateChase(deltaTime, player, tileMap);
                break;
            case 'attack':
                this.updateAttack(deltaTime, player);
                break;
            case 'hurt':
                this.updateHurt(deltaTime);
                break;
            case 'return':
                this.updateReturn(deltaTime, tileMap);
                break;
        }
        
        return null;
    }
    
    // ============================================
    // ESTADOS DA IA
    // ============================================
    
    updateIdle(deltaTime, player) {
        // Verifica se detecta o jogador
        if (this.canDetectPlayer(player)) {
            this.changeState('chase');
            return;
        }
        
        // Após um tempo, começa a patrulhar
        if (this.stateTimer <= 0) {
            if (this.patrolPoints.length > 0) {
                this.changeState('patrol');
            } else {
                this.stateTimer = 2 + Math.random() * 2;
            }
        }
    }
    
    updatePatrol(deltaTime, player, tileMap) {
        // Verifica se detecta o jogador
        if (this.canDetectPlayer(player)) {
            this.changeState('chase');
            return;
        }
        
        if (this.patrolPoints.length === 0) {
            this.changeState('idle');
            this.stateTimer = 2;
            return;
        }
        
        const target = this.patrolPoints[this.currentPatrolIndex];
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            // Chegou no ponto, espera um pouco
            this.patrolWaitTime -= deltaTime;
            if (this.patrolWaitTime <= 0) {
                this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
                this.patrolWaitTime = 1;
            }
        } else {
            // Move em direção ao ponto
            this.moveTowards(target.x, target.y, this.patrolSpeed, deltaTime, tileMap);
        }
    }
    
    updateChase(deltaTime, player, tileMap) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Perdeu o jogador (muito longe)
        if (distance > this.detectionRange * 1.5) {
            this.changeState('return');
            return;
        }
        
        // Dentro do range de ataque
        if (distance < this.attackRange) {
            if (this.attackCooldown <= 0) {
                this.changeState('attack');
            }
            return;
        }
        
        // Persegue o jogador
        this.moveTowards(player.x, player.y, this.chaseSpeed, deltaTime, tileMap);
    }
    
    updateAttack(deltaTime, player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Se o jogador saiu do range, volta a perseguir
        if (distance > this.attackRange * 1.5) {
            this.changeState('chase');
            return;
        }
        
        // Executa o ataque (uma vez)
        if (this.stateTimer <= 0) {
            this.performAttack(player);
            this.attackCooldown = this.attackCooldownMax;
            this.changeState('chase');
        }
    }
    
    updateHurt(deltaTime) {
        if (this.stateTimer <= 0) {
            this.changeState('chase');
        }
    }
    
    updateReturn(deltaTime, tileMap) {
        const dx = this.originalX - this.x;
        const dy = this.originalY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 10) {
            this.changeState('idle');
            this.stateTimer = 2;
            return;
        }
        
        this.moveTowards(this.originalX, this.originalY, this.patrolSpeed, deltaTime, tileMap);
    }
    
    // ============================================
    // AÇÕES
    // ============================================
    
    canDetectPlayer(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < this.detectionRange;
    }
    
    moveTowards(targetX, targetY, speed, deltaTime, tileMap) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 1) return;
        
        const nx = dx / distance;
        const ny = dy / distance;
        
        // Atualiza direção visual
        if (Math.abs(dx) > Math.abs(dy)) {
            this.direction = dx > 0 ? 'right' : 'left';
        } else {
            this.direction = dy > 0 ? 'down' : 'up';
        }
        
        const newX = this.x + nx * speed * deltaTime;
        const newY = this.y + ny * speed * deltaTime;
        
        // Colisão simples
        if (!tileMap.isSolid(newX, this.y) && !tileMap.isSolid(newX + this.width, this.y)) {
            this.x = newX;
        }
        if (!tileMap.isSolid(this.x, newY) && !tileMap.isSolid(this.x, newY + this.height)) {
            this.y = newY;
        }
    }
    
    performAttack(player) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.attackRange + 20) {
            const actualDamage = Math.max(1, this.damage);
            player.takeDamage(actualDamage);
            console.log(`💥 ${this.name} atacou Mairon! Dano: ${actualDamage}`);
        }
    }
    
    changeState(newState) {
        this.state = newState;
        this.stateTimer = newState === 'attack' ? 0.4 : 0;
    }
    
        takeDamage(amount, damageType = 'physical') {
        if (!this.alive) return { died: false, damage: 0, effectiveness: 'neutral' };
        
        // ✅ NOVO: Cálculo de dano inline (sem depender de instância)
        const resistance = (this.resistances && this.resistances[damageType]) || 0;
        
        // Imunidade
        if (resistance >= 1) {
            console.log(`🛡️ ${this.name} é imune a dano ${DAMAGE_TYPE_NAMES[damageType]}!`);
            if (window.game && window.game.particles) {
                window.game.particles.emitEffectiveness(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    'immune'
                );
            }
            return { died: false, damage: 0, effectiveness: 'immune' };
        }
        
        // Calcula multiplicador e dano final
        const multiplier = 1 - resistance;
        let finalDamage = Math.max(1, Math.floor(amount * multiplier));
        finalDamage = Math.max(0, finalDamage - this.defense);
        
        // Determina efetividade
        let effectiveness = 'neutral';
        if (resistance <= -0.4) effectiveness = 'weak';
        else if (resistance >= 0.4) effectiveness = 'resist';
        
        this.hp -= finalDamage;
        this.hitFlash = 1;
        
        // Feedback visual
        if (window.game && window.game.particles) {
            window.game.particles.emitElementalImpact(
                this.x + this.width / 2,
                this.y + this.height / 2,
                damageType,
                effectiveness === 'weak'
            );
            
            if (effectiveness === 'weak' || effectiveness === 'resist') {
                window.game.particles.emitEffectiveness(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    effectiveness
                );
            }
        }
        
        const typeName = DAMAGE_TYPE_NAMES[damageType] || 'Físico';
        console.log(`🩸 ${this.name} recebeu ${finalDamage} de dano ${typeName} (${effectiveness}) (HP: ${this.hp}/${this.maxHP})`);
        
        if (this.hp <= 0) {
            this.die();
            return { died: true, damage: finalDamage, xp: this.xpReward, effectiveness: effectiveness };
        }
        
        this.changeState('hurt');
        this.stateTimer = 0.2;
        
        return { died: false, damage: finalDamage, effectiveness: effectiveness };
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
        this.stateTimer = 1;
        console.log(`🔄 ${this.name} respawnou`);
    }
    
    // ============================================
    // RENDERIZAÇÃO
    // ============================================
    
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
        const bodyColor = this.hitFlash > 0 ? '#ffffff' : this.color;
        ctx.fillStyle = bodyColor;
        ctx.fillRect(screenX, screenY, this.width, this.height);
        
        // Detalhes visuais específicos do tipo
        this.renderDetails(ctx, screenX, screenY);
        
        // Indicador de estado (debug visual sutil)
        this.renderStateIndicator(ctx, screenX, screenY);
        
        // Barra de HP
        this.renderHPBar(ctx, screenX, screenY);
    }
    
    renderDetails(ctx, x, y) {
        // Sobrescrito pelas subclasses
    }
    
    renderStateIndicator(ctx, x, y) {
        // Pequeno indicador colorido acima do inimigo (opcional, para debug)
        const colors = {
            'idle': '#888888',
            'patrol': '#4a90e2',
            'chase': '#ff6b35',
            'attack': '#ff0000',
            'hurt': '#ffff00',
            'return': '#aaaaaa'
        };
        
        ctx.fillStyle = colors[this.state] || '#ffffff';
        ctx.fillRect(x + this.width/2 - 2, y - 18, 4, 4);
    }
    
    renderHPBar(ctx, x, y) {
        const barWidth = this.width + 10;
        const barHeight = 4;
        const barX = x - 5;
        const barY = y - 12;
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const hpPercent = this.hp / this.maxHP;
        ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Nome acima
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, x + this.width/2, barY - 2);
    }
}