// ============================================
// PARTÍCULA INDIVIDUAL
// ============================================
class Particle {
    constructor(config) {
        this.x = config.x || 0;
        this.y = config.y || 0;
        this.vx = config.vx || 0;
        this.vy = config.vy || 0;
        this.life = config.life || 1;
        this.maxLife = this.life;
        this.size = config.size || 3;
        this.startSize = this.size;
        this.endSize = config.endSize !== undefined ? config.endSize : 0;
        this.color = config.color || '#ffffff';
        this.gravity = config.gravity || 0;
        this.friction = config.friction || 0.98;
        this.fade = config.fade !== undefined ? config.fade : true;
        this.shrink = config.shrink !== undefined ? config.shrink : true;
        this.shape = config.shape || 'circle'; // circle, square, spark
        this.rotation = config.rotation || 0;
        this.rotationSpeed = config.rotationSpeed || 0;
        this.glow = config.glow || false;
    }
    
    update(deltaTime) {
        this.vy += this.gravity * deltaTime;
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.rotation += this.rotationSpeed * deltaTime;
        this.life -= deltaTime;
        
        const lifePercent = this.life / this.maxLife;
        
        if (this.shrink) {
            this.size = this.endSize + (this.startSize - this.endSize) * lifePercent;
        }
        
        return this.life > 0 && this.size > 0.1;
    }
    
    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        const lifePercent = this.life / this.maxLife;
        const alpha = this.fade ? lifePercent : 1;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(screenX, screenY);
        ctx.rotate(this.rotation);
        
        if (this.glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }
        
        ctx.fillStyle = this.color;
        
        if (this.shape === 'circle') {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.shape === 'square') {
            ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        } else if (this.shape === 'spark') {
            // Faísca alongada na direção do movimento
            const len = this.size * 3;
            ctx.fillRect(-1, -len / 2, 2, len);
        }
        
        ctx.restore();
    }
}

// ============================================
// SISTEMA DE PARTÍCULAS
// ============================================
class ParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 500;
    }
    
    update(deltaTime) {
        // Atualiza e remove partículas mortas
        for (let i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update(deltaTime)) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    render(ctx, camera) {
        for (const particle of this.particles) {
            particle.render(ctx, camera);
        }
    }
    
    add(particle) {
        if (this.particles.length >= this.maxParticles) {
            // Remove a mais antiga
            this.particles.shift();
        }
        this.particles.push(particle);
    }
    
    clear() {
        this.particles = [];
    }
    
    // ============================================
    // EMISORES (presets prontos)
    // ============================================
    
    // Faíscas da forja (laranja/amarelo, sobem)
    emitForgeSparks(x, y, count = 15) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 50 + Math.random() * 100;
            const colors = ['#ff6600', '#ffaa00', '#ffdd00', '#ff3300'];
            
            this.add(new Particle({
                x: x + (Math.random() - 0.5) * 20,
                y: y,
                vx: Math.cos(angle) * speed * 0.5,
                vy: -Math.abs(Math.sin(angle)) * speed - 50,
                life: 0.6 + Math.random() * 0.6,
                size: 2 + Math.random() * 2,
                endSize: 0,
                color: colors[Math.floor(Math.random() * colors.length)],
                gravity: 150,
                friction: 0.95,
                shape: 'spark',
                glow: true
            }));
        }
    }
    
    // Explosão ao derrotar inimigo
    emitExplosion(x, y, color = '#ff3333', count = 25) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 150;
            
            this.add(new Particle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.5 + Math.random() * 0.5,
                size: 3 + Math.random() * 4,
                endSize: 0,
                color: color,
                friction: 0.9,
                shape: 'circle',
                glow: true
            }));
        }
        
        // Anel de choque
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            this.add(new Particle({
                x: x,
                y: y,
                vx: Math.cos(angle) * 120,
                vy: Math.sin(angle) * 120,
                life: 0.4,
                size: 4,
                endSize: 1,
                color: '#ffffff',
                friction: 0.85,
                shape: 'circle',
                glow: true
            }));
        }
    }
    
    // Impacto de ataque (quando acerta inimigo)
    emitImpact(x, y, isCritical = false) {
        const count = isCritical ? 20 : 10;
        const color = isCritical ? '#ff3333' : '#ffeb3b';
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 100;
            
            this.add(new Particle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3 + Math.random() * 0.3,
                size: 2 + Math.random() * 3,
                endSize: 0,
                color: color,
                friction: 0.88,
                shape: 'spark',
                glow: true
            }));
        }
    }
    
    // Coleta de item (brilho ascendente)
    emitCollect(x, y, color = '#ffd700') {
        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 30 + Math.random() * 50;
            
            this.add(new Particle({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: Math.cos(angle) * speed * 0.3,
                vy: -Math.abs(Math.sin(angle)) * speed - 40,
                life: 0.8 + Math.random() * 0.4,
                size: 2 + Math.random() * 3,
                endSize: 0,
                color: color,
                gravity: -30,
                friction: 0.95,
                shape: 'circle',
                glow: true
            }));
        }
    }
    
    // Level up (celebração dourada)
    emitLevelUp(x, y) {
        // Espiral ascendente dourada
        for (let i = 0; i < 40; i++) {
            const angle = (i / 40) * Math.PI * 4;
            const radius = 20 + i * 2;
            const speed = 100 + Math.random() * 50;
            
            this.add(new Particle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed * 0.5,
                vy: -speed - Math.random() * 50,
                life: 1 + Math.random() * 0.5,
                size: 3 + Math.random() * 3,
                endSize: 0,
                color: i % 2 === 0 ? '#ffd700' : '#ffed4e',
                gravity: 50,
                friction: 0.96,
                shape: 'circle',
                glow: true
            }));
        }
        
        // Estrelas
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            this.add(new Particle({
                x: x,
                y: y,
                vx: Math.cos(angle) * 150,
                vy: Math.sin(angle) * 150 - 50,
                life: 1.2,
                size: 5,
                endSize: 1,
                color: '#ffffff',
                friction: 0.9,
                shape: 'square',
                rotationSpeed: 5,
                glow: true
            }));
        }
    }
    
    // Aura de corrupção (emite ao redor do jogador)
    emitCorruptionAura(x, y, intensity) {
        if (intensity < 0.2) return;
        
        const count = Math.floor(intensity * 3);
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 10 + Math.random() * 15;
            
            this.add(new Particle({
                x: x + Math.cos(angle) * radius,
                y: y + Math.sin(angle) * radius,
                vx: (Math.random() - 0.5) * 20,
                vy: -20 - Math.random() * 30,
                life: 0.8 + Math.random() * 0.6,
                size: 2 + Math.random() * 3,
                endSize: 0,
                color: intensity > 0.6 ? '#aa22aa' : '#5a2a6a',
                gravity: -20,
                friction: 0.95,
                shape: 'circle',
                glow: true
            }));
        }
    }
    
    // Rastro do jogador ao andar
    emitFootstep(x, y, direction) {
        for (let i = 0; i < 2; i++) {
            this.add(new Particle({
                x: x + (Math.random() - 0.5) * 8,
                y: y + 20,
                vx: (Math.random() - 0.5) * 10,
                vy: -5 - Math.random() * 10,
                life: 0.4 + Math.random() * 0.2,
                size: 2 + Math.random() * 2,
                endSize: 0,
                color: 'rgba(200, 180, 140, 0.6)',
                friction: 0.9,
                shape: 'circle'
            }));
        }
    }
    
    // Fumaça da sombra corrompida
    emitShadowSmoke(x, y) {
        for (let i = 0; i < 2; i++) {
            this.add(new Particle({
                x: x + (Math.random() - 0.5) * 10,
                y: y + 20,
                vx: (Math.random() - 0.5) * 15,
                vy: -15 - Math.random() * 20,
                life: 0.6 + Math.random() * 0.4,
                size: 3 + Math.random() * 3,
                endSize: 0,
                color: '#2a1a3a',
                friction: 0.92,
                shape: 'circle'
            }));
        }
    }
    
    // Dano recebido (vermelho)
    emitDamage(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 60;
            
            this.add(new Particle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.4 + Math.random() * 0.2,
                size: 2 + Math.random() * 2,
                endSize: 0,
                color: '#ff3333',
                friction: 0.85,
                shape: 'spark'
            }));
        }
    }
    
    // Cura (verde ascendente)
    emitHeal(x, y) {
        for (let i = 0; i < 10; i++) {
            this.add(new Particle({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 20,
                vy: -40 - Math.random() * 30,
                life: 0.8 + Math.random() * 0.4,
                size: 2 + Math.random() * 2,
                endSize: 0,
                color: '#4ade80',
                friction: 0.95,
                shape: 'circle',
                glow: true
            }));
        }
    }
    
    // Desbloqueio de habilidade (brilho especial)
    emitSkillUnlock(x, y, color = '#ffd700') {
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2;
            const speed = 80 + Math.random() * 40;
            
            this.add(new Particle({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1 + Math.random() * 0.5,
                size: 3 + Math.random() * 3,
                endSize: 0,
                color: color,
                friction: 0.92,
                shape: 'circle',
                glow: true
            }));
        }
    }

        // ✅ NOVO: Rastro do dash
    emitDashTrail(x, y, direction) {
        for (let i = 0; i < 3; i++) {
            this.add(new Particle({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: (Math.random() - 0.5) * 20,
                vy: (Math.random() - 0.5) * 20,
                life: 0.3 + Math.random() * 0.2,
                size: 3 + Math.random() * 2,
                endSize: 0,
                color: '#ffffff',
                friction: 0.9,
                shape: 'circle',
                glow: true
            }));
        }
    }
    
    // ✅ NOVO: Partículas elementais por tipo de dano
    emitElementalImpact(x, y, damageType, isCritical = false) {
        const color = DAMAGE_TYPE_COLORS[damageType] || '#ffffff';
        const count = isCritical ? 25 : 12;
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 100;
            
            let config = {
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3 + Math.random() * 0.3,
                size: 2 + Math.random() * 3,
                endSize: 0,
                color: color,
                friction: 0.88,
                shape: 'spark',
                glow: true
            };
            
            // Efeitos específicos por tipo
            if (damageType === 'fire') {
                config.gravity = -50; // fogo sobe
                config.shape = 'circle';
            } else if (damageType === 'ice') {
                config.shape = 'square'; // cristais
                config.friction = 0.85;
            } else if (damageType === 'lightning') {
                config.shape = 'spark';
                config.life = 0.2 + Math.random() * 0.2;
            } else if (damageType === 'shadow') {
                config.color = '#4a0066';
                config.shape = 'circle';
            } else if (damageType === 'light') {
                config.color = '#fffacd';
                config.gravity = -30;
                config.shape = 'circle';
            }
            
            this.add(new Particle(config));
        }
    }
    
    // ✅ NOVO: Efeito de fraqueza/resistência
    emitEffectiveness(x, y, effectiveness) {
        if (effectiveness === 'weak') {
            // Explosão vermelha (dano extra)
            for (let i = 0; i < 15; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 80 + Math.random() * 60;
                this.add(new Particle({
                    x: x, y: y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    life: 0.5,
                    size: 3,
                    endSize: 0,
                    color: '#ff3333',
                    friction: 0.9,
                    shape: 'circle',
                    glow: true
                }));
            }
        } else if (effectiveness === 'resist') {
            // Escudo cinza (dano reduzido)
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                this.add(new Particle({
                    x: x, y: y,
                    vx: Math.cos(angle) * 30,
                    vy: Math.sin(angle) * 30,
                    life: 0.4,
                    size: 2,
                    endSize: 0,
                    color: '#888888',
                    friction: 0.85,
                    shape: 'square'
                }));
            }
        } else if (effectiveness === 'immune') {
            // Anel dourado (imunidade)
            for (let i = 0; i < 16; i++) {
                const angle = (i / 16) * Math.PI * 2;
                this.add(new Particle({
                    x: x, y: y,
                    vx: Math.cos(angle) * 60,
                    vy: Math.sin(angle) * 60,
                    life: 0.6,
                    size: 3,
                    endSize: 1,
                    color: '#ffd700',
                    friction: 0.9,
                    shape: 'circle',
                    glow: true
                }));
            }
        }
    }
}