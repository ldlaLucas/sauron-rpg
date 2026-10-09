class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 24;
        this.height = 24;
        this.baseSpeed = 150;
        this.speed = this.baseSpeed;
        
        this.direction = 'down';
        
        this.color = '#f4f4f4';
        this.accentColor = '#ffd700';
        this.skinColor = '#ffe0bd';
        
        this.equipment = null;
        
        // HP
        this.maxHP = 100;
        this.hp = 100;
        this.hitFlash = 0;
        
        // Ataque
        this.attacking = false;
        this.attackTimer = 0;
        this.attackDuration = 0.3;
        this.attackCooldown = 0;
        this.attackCooldownMax = 0.4;
        this.attackRange = 40;
        this.baseDamage = 5;
        this.attackHitbox = null;
        
        // ✅ NOVA FLAG: controla se o hit já foi processado neste ataque
        this.attackHitProcessed = false;
    }
    
    setEquipmentSystem(equipment) {
        this.equipment = equipment;
    }
    
    update(deltaTime, input, tileMap) {
        this.speed = this.baseSpeed + (this.equipment ? this.equipment.getBonus('speed') : 0);
        
        // Atualiza timers
        this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 4);
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        
        // Atualiza ataque
        if (this.attacking) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) {
                // ✅ Ataque terminou - resetar tudo
                this.attacking = false;
                this.attackHitbox = null;
                this.attackHitProcessed = false; // ✅ RESET AQUI!
            }
        }
        
        // Iniciar ataque com ESPAÇO
        if (input.isKeyDown(' ') && !this.attacking && this.attackCooldown <= 0) {
            this.startAttack();
        }
        
        // Movimento (só se não estiver atacando)
        if (!this.attacking) {
            const movement = input.getMovement();
            
            if (movement.dx < 0) this.direction = 'left';
            else if (movement.dx > 0) this.direction = 'right';
            else if (movement.dy < 0) this.direction = 'up';
            else if (movement.dy > 0) this.direction = 'down';

            let newX = this.x + movement.dx * this.speed * deltaTime;
            let newY = this.y + movement.dy * this.speed * deltaTime;

            if (!this.checkCollision(newX, this.y, tileMap)) {
                this.x = newX;
            }
            if (!this.checkCollision(this.x, newY, tileMap)) {
                this.y = newY;
            }
        }
    }
    
    startAttack() {
        this.attacking = true;
        this.attackTimer = this.attackDuration;
        this.attackCooldown = this.attackCooldownMax;
        
        // ✅ IMPORTANTE: resetar flag para permitir 1 hit neste ataque
        this.attackHitProcessed = false;
        
        // Calcula hitbox do ataque baseado na direção
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        let hx, hy, hw, hh;
        
        if (this.direction === 'down') {
            hx = centerX - 15;
            hy = centerY + 10;
            hw = 30;
            hh = 25;
        } else if (this.direction === 'up') {
            hx = centerX - 15;
            hy = centerY - 35;
            hw = 30;
            hh = 25;
        } else if (this.direction === 'left') {
            hx = centerX - 35;
            hy = centerY - 15;
            hw = 25;
            hh = 30;
        } else {
            hx = centerX + 10;
            hy = centerY - 15;
            hw = 25;
            hh = 30;
        }
        
        this.attackHitbox = { x: hx, y: hy, width: hw, height: hh };
        
        console.log(`⚔️ Mairon atacou na direção ${this.direction}`);
    }
    
    getAttackDamage() {
        let damage = this.baseDamage;
        
        if (this.equipment) {
            damage += this.equipment.getBonus('damage');
        }
        
        return damage;
    }
    
    takeDamage(amount) {
        this.hp = Math.max(0, this.hp - amount);
        this.hitFlash = 1;
        console.log(`💔 Mairon recebeu ${amount} de dano (HP: ${this.hp}/${this.maxHP})`);
    }
    
    heal(amount) {
        this.hp = Math.min(this.maxHP, this.hp + amount);
    }
    
    checkCollision(x, y, tileMap) {
        const margin = 4;
        const left = x + margin;
        const right = x + this.width - margin;
        const top = y + margin;
        const bottom = y + this.height - margin;

        return (
            tileMap.isSolid(left, top) ||
            tileMap.isSolid(right, top) ||
            tileMap.isSolid(left, bottom) ||
            tileMap.isSolid(right, bottom)
        );
    }
    
    render(ctx, camera) {
        const screenX = this.x - camera.x - 4;
        const screenY = this.y - camera.y - 4;

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY + 30, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Corpo
        ctx.fillStyle = this.hitFlash > 0 ? '#ff6666' : this.color;
        ctx.fillRect(screenX + 6, screenY + 10, 20, 20);
        
        // Cabeça
        ctx.fillStyle = this.hitFlash > 0 ? '#ff6666' : this.skinColor;
        ctx.fillRect(screenX + 10, screenY + 2, 12, 10);
        
        // Cabelo
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(screenX + 9, screenY + 1, 14, 5);

        // Detalhes dourados e direção
        ctx.fillStyle = this.accentColor;
        if (this.direction === 'down') {
            ctx.fillRect(screenX + 12, screenY + 6, 2, 2);
            ctx.fillRect(screenX + 18, screenY + 6, 2, 2);
            ctx.fillRect(screenX + 8, screenY + 18, 16, 3);
        } else if (this.direction === 'up') {
            ctx.fillRect(screenX + 8, screenY + 18, 16, 3);
        } else if (this.direction === 'left') {
            ctx.fillRect(screenX + 10, screenY + 6, 2, 2);
            ctx.fillRect(screenX + 8, screenY + 18, 16, 3);
        } else if (this.direction === 'right') {
            ctx.fillRect(screenX + 20, screenY + 6, 2, 2);
            ctx.fillRect(screenX + 8, screenY + 18, 16, 3);
        }
        
        // Renderiza arma equipada
        this.renderWeapon(ctx, screenX, screenY);
        
        // Renderiza efeito de ataque
        if (this.attacking && this.attackHitbox) {
            const ah = this.attackHitbox;
            const ahScreenX = ah.x - camera.x;
            const ahScreenY = ah.y - camera.y;
            
            ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
            ctx.fillRect(ahScreenX, ahScreenY, ah.width, ah.height);
            
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(ahScreenX, ahScreenY, ah.width, ah.height);
        }
    }
    
    renderWeapon(ctx, screenX, screenY) {
        if (!this.equipment) return;
        
        const weapon = this.equipment.getEquippedWeapon();
        if (!weapon) return;
        
        let wx, wy;
        
        if (this.attacking) {
            if (this.direction === 'down') {
                wx = screenX + 24;
                wy = screenY + 22;
            } else if (this.direction === 'up') {
                wx = screenX + 24;
                wy = screenY + 2;
            } else if (this.direction === 'left') {
                wx = screenX - 6;
                wy = screenY + 14;
            } else {
                wx = screenX + 32;
                wy = screenY + 14;
            }
        } else {
            if (this.direction === 'down') {
                wx = screenX + 24;
                wy = screenY + 16;
            } else if (this.direction === 'up') {
                wx = screenX + 24;
                wy = screenY + 8;
            } else if (this.direction === 'left') {
                wx = screenX - 2;
                wy = screenY + 14;
            } else {
                wx = screenX + 28;
                wy = screenY + 14;
            }
        }
        
        if (weapon.visual === 'tool') {
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(wx, wy, 3, 10);
            ctx.fillStyle = '#b0b0b0';
            ctx.fillRect(wx - 2, wy - 2, 7, 4);
        } else if (weapon.visual === 'sword') {
            ctx.fillStyle = '#d0d0d0';
            ctx.fillRect(wx + 1, wy - 4, 2, 10);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(wx, wy + 6, 4, 3);
        } else if (weapon.visual === 'hammer') {
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(wx, wy, 3, 10);
            ctx.fillStyle = '#6a6a6a';
            ctx.fillRect(wx - 3, wy - 3, 9, 5);
        }
    }
}