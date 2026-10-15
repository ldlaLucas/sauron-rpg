// ============================================
// DEFINIÇÕES DOS ESTADOS
// ============================================
const STATUS_EFFECTS = {
    'burning': {
        id: 'burning',
        name: 'Queimando',
        icon: '🔥',
        color: '#ff6600',
        duration: 3.0,
        tickInterval: 0.5,
        damagePerTick: 3,
        description: 'Sofre dano contínuo de fogo'
    },
    'frozen': {
        id: 'frozen',
        name: 'Congelado',
        icon: '❄️',
        color: '#66ccff',
        duration: 2.0,
        tickInterval: 0,
        speedMultiplier: 0.5,
        description: 'Velocidade reduzida em 50%'
    },
    'stunned': {
        id: 'stunned',
        name: 'Atordoado',
        icon: '⚡',
        color: '#ffff00',
        duration: 1.0,
        tickInterval: 0,
        canAct: false,
        description: 'Incapaz de agir'
    },
    'corrupted': {
        id: 'corrupted',
        name: 'Corrompido',
        icon: '🌑',
        color: '#8b00ff',
        duration: 4.0,
        tickInterval: 0,
        damageMultiplier: 0.75,
        description: 'Dano causado reduzido em 25%'
    },
    'blessed': {
        id: 'blessed',
        name: 'Abençoado',
        icon: '✨',
        color: '#fffacd',
        duration: 4.0,
        tickInterval: 0,
        damageMultiplier: 1.25,
        description: 'Dano causado aumentado em 25%'
    }
};

// Mapeamento: tipo de dano → estado aplicado
const DAMAGE_TO_STATUS = {
    'fire': 'burning',
    'ice': 'frozen',
    'lightning': 'stunned',
    'shadow': 'corrupted',
    'light': 'blessed',
    'physical': null // físico não aplica estado
};

// ============================================
// SISTEMA DE ESTADOS
// ============================================
class StatusEffectSystem {
    constructor() {
        // Mapas de estados ativos: entidade -> { statusId: { remaining, tickTimer } }
        this.entityStatuses = new Map();
        console.log('💀 StatusEffectSystem criado');
    }
    
    // Aplica um estado a uma entidade
    applyStatus(entity, statusId, customDuration = null) {
        const def = STATUS_EFFECTS[statusId];
        if (!def) return false;
        
        if (!this.entityStatuses.has(entity)) {
            this.entityStatuses.set(entity, {});
        }
        
        const statuses = this.entityStatuses.get(entity);
        
        // Se já tem o estado, renova (stack por refresh, não por stack)
        if (statuses[statusId]) {
            statuses[statusId].remaining = customDuration || def.duration;
            return false; // não é novo
        }
        
        statuses[statusId] = {
            remaining: customDuration || def.duration,
            tickTimer: 0
        };
        
        console.log(`${def.icon} ${entity.name || 'Entidade'} recebeu: ${def.name}`);
        
        // Notificação visual
        this.showStatusNotification(entity, def, true);
        
        return true;
    }
    
    // Remove um estado
    removeStatus(entity, statusId) {
        const statuses = this.entityStatuses.get(entity);
        if (!statuses || !statuses[statusId]) return;
        
        const def = STATUS_EFFECTS[statusId];
        delete statuses[statusId];
        
        if (Object.keys(statuses).length === 0) {
            this.entityStatuses.delete(entity);
        }
        
        this.showStatusNotification(entity, def, false);
    }
    
    // Verifica se entidade tem um estado
    hasStatus(entity, statusId) {
        const statuses = this.entityStatuses.get(entity);
        return !!(statuses && statuses[statusId]);
    }
    
    // Obtém todos os estados de uma entidade
    getStatuses(entity) {
        return this.entityStatuses.get(entity) || {};
    }
    
    // ============================================
    // ATUALIZAÇÃO
    // ============================================
    update(deltaTime, game) {
        for (const [entity, statuses] of this.entityStatuses.entries()) {
            for (const statusId in statuses) {
                const status = statuses[statusId];
                const def = STATUS_EFFECTS[statusId];
                
                if (!def) continue;
                
                status.remaining -= deltaTime;
                
                // Dano por tick (burning)
                if (def.damagePerTick && def.tickInterval > 0) {
                    status.tickTimer -= deltaTime;
                    if (status.tickTimer <= 0) {
                        status.tickTimer = def.tickInterval;
                        this.applyTickDamage(entity, def, game);
                    }
                }
                
                // Expirou?
                if (status.remaining <= 0) {
                    this.removeStatus(entity, statusId);
                }
            }
        }
    }
    
    applyTickDamage(entity, def, game) {
        // Aplica dano direto no HP (ignora defesa)
        entity.hp = Math.max(0, (entity.hp || 0) - def.damagePerTick);
        
        // Partículas
        if (game && game.particles) {
            game.particles.emitElementalImpact(
                entity.x + entity.width / 2,
                entity.y + entity.height / 2,
                this.getDamageTypeFromStatus(def.id),
                false
            );
        }
        
        // Número de dano
        if (game && game.damageNumbers) {
            game.damageNumbers.add(
                entity.x + entity.width / 2,
                entity.y,
                def.damagePerTick,
                def.color,
                false
            );
        }
        
        // Morreu?
        if (entity.hp <= 0 && entity.alive !== undefined && entity.alive) {
            if (entity.die) entity.die();
        }
    }
    
    getDamageTypeFromStatus(statusId) {
        for (const [dmgType, status] of Object.entries(DAMAGE_TO_STATUS)) {
            if (status === statusId) return dmgType;
        }
        return 'physical';
    }
    
    // ============================================
    // CONSULTAS DE MODIFIADORES
    // ============================================
    
    // Multiplicador de velocidade (para movimento)
        getSpeedMultiplier(entity) {
        let mult = 1;
        const statuses = this.getStatuses(entity);
        
        for (const statusId in statuses) {
            const def = STATUS_EFFECTS[statusId];
            if (def && def.speedMultiplier !== undefined) {
                // ✅ CORREÇÃO: Garante que o multiplicador seja válido
                const sm = parseFloat(def.speedMultiplier);
                if (!isNaN(sm) && sm > 0) {
                    mult *= sm;
                }
            }
        }
        
        // ✅ CORREÇÃO: Garante mínimo de 0.1 (nunca para completamente)
        return Math.max(0.1, mult);
    }
    
    // Multiplicador de dano causado
    getDamageMultiplier(entity) {
        let mult = 1;
        const statuses = this.getStatuses(entity);
        
        for (const statusId in statuses) {
            const def = STATUS_EFFECTS[statusId];
            if (def && def.damageMultiplier) {
                mult *= def.damageMultiplier;
            }
        }
        
        return mult;
    }
    
    // Pode agir? (stun)
        canAct(entity) {
        const statuses = this.getStatuses(entity);
        
        for (const statusId in statuses) {
            const def = STATUS_EFFECTS[statusId];
            if (def && def.canAct === false) {
                return false;
            }
        }
        
        return true; // ✅ Padrão: pode agir
    }
    
    // ============================================
    // UTILITÁRIO: aplica estado baseado no tipo de dano
    // ============================================
    applyFromDamageType(entity, damageType) {
        const statusId = DAMAGE_TO_STATUS[damageType];
        if (!statusId) return false;
        return this.applyStatus(entity, statusId);
    }
    
    // ============================================
    // NOTIFICAÇÕES VISUAIS
    // ============================================
    showStatusNotification(entity, def, isApplying) {
        if (!window.game || !window.game.damageNumbers) return;
        
        const text = isApplying ? `${def.icon} ${def.name}` : `✓ ${def.name}`;
        const color = isApplying ? def.color : '#4ade80';
        
        window.game.damageNumbers.add(
            entity.x + entity.width / 2,
            entity.y - 15,
            text,
            color,
            false,
            true // é texto, não número
        );
    }
    
    // ============================================
    // RENDERIZAÇÃO DOS ÍCONES DE STATUS
    // ============================================
    renderStatusIcons(ctx, entity, camera) {
        const statuses = this.getStatuses(entity);
        const keys = Object.keys(statuses);
        if (keys.length === 0) return;
        
        const screenX = entity.x - camera.x + entity.width / 2;
        const screenY = entity.y - camera.y - 28;
        
        // Fundo
        const boxWidth = keys.length * 16 + 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(screenX - boxWidth / 2, screenY - 12, boxWidth, 16);
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(screenX - boxWidth / 2, screenY - 12, boxWidth, 16);
        
        // Ícones
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        
        keys.forEach((statusId, i) => {
            const def = STATUS_EFFECTS[statusId];
            if (!def) return;
            
            const x = screenX - boxWidth / 2 + 8 + i * 16;
            ctx.fillStyle = def.color;
            ctx.fillText(def.icon, x, screenY);
        });
    }
}