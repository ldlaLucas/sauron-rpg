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

        // ✅ NOVO: Sistema de Dash
        this.dashing = false;
        this.dashTimer = 0;
        this.dashDuration = 0.25; // segundos
        this.dashCooldown = 0;
        this.dashCooldownMax = 0.8;
        this.dashSpeed = 400; // velocidade durante o dash
        this.dashDirection = { x: 0, y: 0 };
        this.invincible = false; // i-frames
        
        // ✅ NOVO: Stamina
        this.maxStamina = 100;
        this.stamina = 100;
        this.staminaCost = 25; // custo por dash
        this.staminaRegen = 30; // regeneração por segundo
        this.staminaRegenDelay = 0; // delay antes de começar a regenerar
        this.staminaRegenDelayMax = 0.5;
        
        
        // ✅ NOVA FLAG: controla se o hit já foi processado neste ataque
        this.attackHitProcessed = false;

        this.skillBonuses = {}; // Bônus da árvore de habilidades

        this.corruption = null; // Referência ao CorruptionSystem
    }
    
    setEquipmentSystem(equipment) {
        this.equipment = equipment;
    }
    
        update(deltaTime, input, tileMap) {
                // ✅ NOVO: Verifica se pode agir (stun)
        const canAct = window.game && window.game.statusEffects 
            ? window.game.statusEffects.canAct(this) 
            : true;
        
        if (!canAct) {
            // Atordoado: só atualiza timers visuais
            this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 4);
            return;
        }
        
        // ✅ NOVO: Aplica multiplicador de velocidade por status
        let speedMultiplier = window.game && window.game.statusEffects 
            ? window.game.statusEffects.getSpeedMultiplier(this) 
            : 1;
        this.speed = this.baseSpeed + (this.equipment ? this.equipment.getBonus('speed') : 0) * speedMultiplier;
        
        // Atualiza timers
        this.hitFlash = Math.max(0, this.hitFlash - deltaTime * 4);
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        this.dashCooldown = Math.max(0, this.dashCooldown - deltaTime);
        
        // ✅ NOVO: Atualiza stamina
        if (this.staminaRegenDelay > 0) {
            this.staminaRegenDelay -= deltaTime;
        } else if (this.stamina < this.maxStamina && !this.dashing) {
            this.stamina = Math.min(this.maxStamina, this.stamina + this.staminaRegen * deltaTime);
        }
        
        // ✅ NOVO: Atualiza dash
        if (this.dashing) {
            this.dashTimer -= deltaTime;
            
            // Move na direção do dash
            const newX = this.x + this.dashDirection.x * this.dashSpeed * deltaTime;
            const newY = this.y + this.dashDirection.y * this.dashSpeed * deltaTime;
            
            // Colisão simplificada durante dash (pode atravessar inimigos mas não paredes)
            if (!tileMap.isSolid(newX + 4, this.y + 4) && 
                !tileMap.isSolid(newX + this.width - 4, this.y + this.height - 4)) {
                this.x = newX;
            }
            if (!tileMap.isSolid(this.x + 4, newY + 4) && 
                !tileMap.isSolid(this.x + this.width - 4, newY + this.height - 4)) {
                this.y = newY;
            }
            
            // ✅ NOVO: Emite partículas de rastro durante o dash
            if (window.game && window.game.particles) {
                window.game.particles.emitDashTrail(
                    this.x + this.width / 2,
                    this.y + this.height / 2,
                    this.direction
                );
            }
            
            if (this.dashTimer <= 0) {
                this.dashing = false;
                this.invincible = false;
            }
            
            // Durante o dash, não faz mais nada
            return;
        }
        
        // Atualiza ataque
        if (this.attacking) {
            this.attackTimer -= deltaTime;
            if (this.attackTimer <= 0) {
                this.attacking = false;
                this.attackHitbox = null;
                this.attackHitProcessed = false;
            }
        }
        
        // ✅ NOVO: Iniciar dash com SHIFT
        if (input.isKeyDown('shift') && !this.dashing && 
            this.dashCooldown <= 0 && this.stamina >= this.staminaCost &&
            !this.attacking) {
            this.startDash();
        }
        
        // Iniciar ataque com ESPAÇO
        if (input.isKeyDown(' ') && !this.attacking && this.attackCooldown <= 0 && !this.dashing) {
            this.startAttack();
        }
        
        // Movimento (só se não estiver atacando ou dando dash)
        if (!this.attacking && !this.dashing) {
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
    
    // ✅ NOVO: Método de dash
    startDash() {
        this.dashing = true;
        this.dashTimer = this.dashDuration;
        this.dashCooldown = this.dashCooldownMax;
        this.invincible = true; // i-frames
        this.stamina -= this.staminaCost;
        this.staminaRegenDelay = this.staminaRegenDelayMax;
        
        // Direção baseada na direção atual
        if (this.direction === 'down') {
            this.dashDirection = { x: 0, y: 1 };
        } else if (this.direction === 'up') {
            this.dashDirection = { x: 0, y: -1 };
        } else if (this.direction === 'left') {
            this.dashDirection = { x: -1, y: 0 };
        } else {
            this.dashDirection = { x: 1, y: 0 };
        }
        
        console.log(`💨 Dash na direção ${this.direction}!`);
    }
    
    // ✅ MODIFICADO: takeDamage agora verifica invencibilidade
        takeDamage(amount, damageType = 'physical') {
        // i-frames
        if (this.invincible) {
            console.log('🛡️ Dano ignorado (i-frames ativos)');
            return 0;
        }
        
        const bonuses = this.skillBonuses || {};
        const reduction = bonuses.damageReduction || 0;
        const actualDamage = Math.max(1, Math.floor(amount * (1 - reduction)));
        
        this.hp = Math.max(0, this.hp - actualDamage);
        this.hitFlash = 1;
        
        // ✅ NOVO: Aplica estado baseado no tipo de dano recebido
        if (window.game && window.game.statusEffects) {
            window.game.statusEffects.applyFromDamageType(this, damageType);
        }
        
        // Partículas
        if (window.game && window.game.particles) {
            window.game.particles.emitDamage(
                this.x + this.width / 2,
                this.y + this.height / 2,
                DAMAGE_TYPE_COLORS[damageType] || '#ff3333'
            );
        }
        
        console.log(`💔 Mairon recebeu ${actualDamage} de dano ${DAMAGE_TYPE_NAMES[damageType]} (HP: ${this.hp}/${this.maxHP})`);
        return actualDamage;
    }

         startAttack() {
        console.log('⚔️ Player: Iniciando ataque!');
        this.attacking = true;
        this.attackTimer = this.attackDuration;
        this.attackCooldown = this.attackCooldownMax;
        
        // CRUCIAL: Reseta a flag para permitir que este novo ataque cause dano
        this.attackHitProcessed = false; 
        
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        let hx, hy, hw, hh;
        
        if (this.direction === 'down') {
            hx = centerX - 15; hy = centerY + 10; hw = 30; hh = 25;
        } else if (this.direction === 'up') {
            hx = centerX - 15; hy = centerY - 35; hw = 30; hh = 25;
        } else if (this.direction === 'left') {
            hx = centerX - 35; hy = centerY - 15; hw = 25; hh = 30;
        } else { // right
            hx = centerX + 10; hy = centerY - 15; hw = 25; hh = 30;
        }
        
        this.attackHitbox = { x: hx, y: hy, width: hw, height: hh };
    }   
   
    getAttackDamage() {
        let damage = this.baseDamage;
        
        if (this.equipment) {
            damage += this.equipment.getBonus('damage');
        }
        
        return damage;
    }
    
        takeDamage(amount) {
        // Aplica redução de dano da árvore
        const bonuses = this.skillBonuses || {};
        const reduction = bonuses.damageReduction || 0;
        const actualDamage = Math.max(1, Math.floor(amount * (1 - reduction)));
        
        this.hp = Math.max(0, this.hp - actualDamage);
        this.hitFlash = 1;
         // ✅ NOVO: Partículas de dano
        if (window.game && window.game.particles) {
            window.game.particles.emitDamage(
                this.x + this.width / 2,
                this.y + this.height / 2
            );
        }
        
        console.log(`💔 Mairon recebeu ${actualDamage} de dano (HP: ${this.hp}/${this.maxHP})`);
    }
    
        heal(amount) {
        const oldHP = this.hp;
        this.hp = Math.min(this.maxHP, this.hp + amount);
        
        // ✅ NOVO: Partículas de cura (só se realmente curou)
        if (this.hp > oldHP && window.game && window.game.particles) {
            window.game.particles.emitHeal(
                this.x + this.width / 2,
                this.y + this.height / 2
            );
        }
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
        
        const corruptionLevel = this.corruption ? this.corruption.getCorruptionPercent() : 0;
        
        // ✅ NOVO: Efeitos visuais de status
        if (window.game && window.game.statusEffects) {
            const statuses = window.game.statusEffects.getStatuses(this);
            
            // Congelado: overlay azul
            if (statuses['frozen']) {
                ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
                ctx.beginPath();
                ctx.arc(screenX + 16, screenY + 16, 16, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Queimando: partículas de fogo (já tratado pelo tick)
            // Atordoado: estrelas girando
            if (statuses['stunned']) {
                const time = Date.now() / 200;
                ctx.fillStyle = '#ffff00';
                ctx.font = '10px Arial';
                for (let i = 0; i < 3; i++) {
                    const angle = time + (i * Math.PI * 2 / 3);
                    const sx = screenX + 16 + Math.cos(angle) * 14;
                    const sy = screenY - 2 + Math.sin(angle) * 4;
                    ctx.fillText('⭐', sx, sy);
                }
            }
        }
        
        // ... resto do código existente ...
                // ✅ NOVO: Efeito visual durante o dash
        if (this.dashing) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY + 16, 18, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // ✅ NOVO: Aura sombria ao redor do jogador (se corrupção > 20)
        if (corruptionLevel > 0.2) {
            const auraIntensity = (corruptionLevel - 0.2) / 0.8;
            const pulse = Math.sin(Date.now() / 400) * 0.2 + 0.8;
            
            // Aura externa
            ctx.fillStyle = `rgba(80, 20, 100, ${auraIntensity * 0.3 * pulse})`;
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY + 16, 20 + auraIntensity * 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Aura interna
            ctx.fillStyle = `rgba(120, 30, 140, ${auraIntensity * 0.4 * pulse})`;
            ctx.beginPath();
            ctx.arc(screenX + 16, screenY + 16, 14, 0, Math.PI * 2);
            ctx.fill();
        }

        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY + 30, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // ✅ NOVO: Cores do corpo mudam com corrupção
        const bodyColor = this.hitFlash > 0 ? '#ff6666' : this.getCorruptedColor(this.color, corruptionLevel);
        const skinColor = this.hitFlash > 0 ? '#ff6666' : this.getCorruptedColor(this.skinColor, corruptionLevel);
        const hairColor = this.getCorruptedColor('#e0e0e0', corruptionLevel);
        const accentColor = corruptionLevel > 0.6 ? '#ff3333' : this.accentColor;

        // Corpo
        ctx.fillStyle = bodyColor;
        ctx.fillRect(screenX + 6, screenY + 10, 20, 20);
        
        // Cabeça
        ctx.fillStyle = skinColor;
        ctx.fillRect(screenX + 10, screenY + 2, 12, 10);
        
        // Cabelo
        ctx.fillStyle = hairColor;
        ctx.fillRect(screenX + 9, screenY + 1, 14, 5);

        // Detalhes (olhos e roupa)
        ctx.fillStyle = accentColor;
        if (this.direction === 'down') {
            // ✅ NOVO: Olhos vermelhos se corrupção alta
            const eyeColor = corruptionLevel > 0.6 ? '#ff3333' : accentColor;
            ctx.fillStyle = eyeColor;
            ctx.fillRect(screenX + 12, screenY + 6, 2, 2);
            ctx.fillRect(screenX + 18, screenY + 6, 2, 2);
            ctx.fillStyle = accentColor;
            ctx.fillRect(screenX + 8, screenY + 18, 16, 3);
        } else if (this.direction === 'up') {
            ctx.fillRect(screenX + 8, screenY + 18, 16, 3);
        } else if (this.direction === 'left') {
            const eyeColor = corruptionLevel > 0.6 ? '#ff3333' : accentColor;
            ctx.fillStyle = eyeColor;
            ctx.fillRect(screenX + 10, screenY + 6, 2, 2);
            ctx.fillStyle = accentColor;
            ctx.fillRect(screenX + 8, screenY + 18, 16, 3);
        } else if (this.direction === 'right') {
            const eyeColor = corruptionLevel > 0.6 ? '#ff3333' : accentColor;
            ctx.fillStyle = eyeColor;
            ctx.fillRect(screenX + 20, screenY + 6, 2, 2);
            ctx.fillStyle = accentColor;
            ctx.fillRect(screenX + 8, screenY + 18, 16, 3);
        }
        
        // ✅ NOVO: Olho de Sauron (corrupção 100)
        if (corruptionLevel >= 1.0 && this.direction !== 'up') {
            const eyePulse = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 50, 0, ${eyePulse})`;
            
            if (this.direction === 'down') {
                ctx.fillRect(screenX + 14, screenY + 5, 4, 3);
            } else if (this.direction === 'left') {
                ctx.fillRect(screenX + 10, screenY + 5, 4, 3);
            } else if (this.direction === 'right') {
                ctx.fillRect(screenX + 18, screenY + 5, 4, 3);
            }
        }
        
        // Renderiza arma equipada
        this.renderWeapon(ctx, screenX, screenY);
        
        // Renderiza efeito de ataque
        if (this.attacking && this.attackHitbox) {
            const ah = this.attackHitbox;
            const ahScreenX = ah.x - camera.x;
            const ahScreenY = ah.y - camera.y;
            
            // ✅ NOVO: Cor do ataque muda com corrupção
            const attackColor = corruptionLevel > 0.6 
                ? `rgba(180, 30, 180, 0.4)` 
                : 'rgba(255, 215, 0, 0.4)';
            const strokeColor = corruptionLevel > 0.6 ? '#aa22aa' : '#ffd700';
            
            ctx.fillStyle = attackColor;
            ctx.fillRect(ahScreenX, ahScreenY, ah.width, ah.height);
            
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = 2;
            ctx.strokeRect(ahScreenX, ahScreenY, ah.width, ah.height);
        }
    }
    
    // ✅ NOVO: Mistura uma cor com tons sombrios baseado na corrupção
    getCorruptedColor(baseColor, corruptionLevel) {
        if (corruptionLevel <= 0) return baseColor;
        
        // Converte hex para RGB
        const hex = baseColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Cor alvo (roxo escuro → vermelho)
        const targetR = corruptionLevel > 0.6 ? 80 : 100;
        const targetG = 20;
        const targetB = corruptionLevel > 0.6 ? 80 : 120;
        
        // Interpola
        const mix = corruptionLevel * 0.7; // máximo 70% de mistura
        const finalR = Math.round(r * (1 - mix) + targetR * mix);
        const finalG = Math.round(g * (1 - mix) + targetG * mix);
        const finalB = Math.round(b * (1 - mix) + targetB * mix);
        
        return `rgb(${finalR}, ${finalG}, ${finalB})`;
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
        } else if (weapon.visual === 'elven_sword') { // ✅ NOVO
            // Lâmina azul brilhante
            ctx.fillStyle = '#87ceeb';
            ctx.fillRect(wx + 1, wy - 6, 2, 12);
            
            // Brilho
            ctx.fillStyle = 'rgba(135, 206, 235, 0.5)';
            ctx.fillRect(wx, wy - 7, 4, 14);
            
            // Cabo prateado
            ctx.fillStyle = '#c0c0c0';
            ctx.fillRect(wx, wy + 6, 4, 3);
            
            // Detalhe dourado
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(wx + 1, wy + 5, 2, 1);
        } else if (weapon.visual === 'shadow_blade') {
            // Lâmina sombria (roxo escuro)
            ctx.fillStyle = '#2a0a2a';
            ctx.fillRect(wx + 1, wy - 6, 2, 12);
            
            // Brilho roxo pulsante
            const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(170, 34, 170, ${pulse})`;
            ctx.fillRect(wx, wy - 7, 4, 14);
            
            // Cabo escuro
            ctx.fillStyle = '#1a0a1a';
            ctx.fillRect(wx, wy + 6, 4, 3);
            
            // Detalhe vermelho (olho)
            ctx.fillStyle = '#ff3333';
            ctx.fillRect(wx + 1, wy + 5, 2, 1);
        } else if (weapon.visual === 'masterwork') {
            // Lâmina obra-prima (dourada)
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(wx + 1, wy - 6, 2, 12);
            
            // Brilho
            ctx.fillStyle = 'rgba(255, 237, 78, 0.6)';
            ctx.fillRect(wx, wy - 7, 4, 14);
            
            // Cabo
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(wx, wy + 6, 4, 3);
                } else if (weapon.visual === 'flame_sword') {
            // Espada Flamejante
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(wx, wy + 6, 4, 3);
            
            // Lâmina em chamas
            const flicker = Math.sin(Date.now() / 100) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 100, 0, ${flicker})`;
            ctx.fillRect(wx + 1, wy - 6, 2, 12);
            
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(wx, wy - 7, 4, 14);
            
            // Brilho
            ctx.fillStyle = 'rgba(255, 200, 0, 0.5)';
            ctx.fillRect(wx - 1, wy - 8, 6, 16);
        } else if (weapon.visual === 'frost_staff') {
            // Cajado de Gelo
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(wx + 1, wy - 4, 2, 14);
            
            // Cristal de gelo no topo
            ctx.fillStyle = '#66ccff';
            ctx.beginPath();
            ctx.moveTo(wx + 2, wy - 8);
            ctx.lineTo(wx + 5, wy - 4);
            ctx.lineTo(wx + 2, wy);
            ctx.lineTo(wx - 1, wy - 4);
            ctx.closePath();
            ctx.fill();
            
            // Brilho
            const shimmer = Math.sin(Date.now() / 200) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(150, 220, 255, ${shimmer})`;
            ctx.fillRect(wx - 1, wy - 8, 6, 8);
        } else if (weapon.visual === 'thunder_blade') {
            // Lâmina do Trovão
            ctx.fillStyle = '#8b5a2b';
            ctx.fillRect(wx, wy + 6, 4, 3);
            
            // Lâmina amarela
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(wx + 1, wy - 6, 2, 12);
            
            // Raios
            const flash = Math.sin(Date.now() / 80) > 0 ? 1 : 0.5;
            ctx.fillStyle = `rgba(255, 255, 100, ${flash})`;
            ctx.fillRect(wx - 1, wy - 7, 6, 14);
        }
        

    }

        setCorruptionSystem(corruption) {
        this.corruption = corruption;
    }
}