class CorruptionSystem {
    constructor(game) {
        this.game = game;
        this.value = 0; // 0 a 100
        this.maxValue = 100;
        
        // Níveis de corrupção (tiers)
        this.tiers = [
            { min: 0,  max: 19, name: 'Puro',          color: '#ffffff' },
            { min: 20, max: 39, name: 'Influenciado',  color: '#c9a876' },
            { min: 40, max: 59, name: 'Corrompido',    color: '#8b4a8b' },
            { min: 60, max: 79, name: 'Sombrio',       color: '#5a2a6a' },
            { min: 80, max: 100, name: 'Sauron',        color: '#ff3333' }
        ];
        
        // Habilidades sombrias desbloqueáveis
        this.darkSkills = [
            {
                id: 'dark_1',
                name: 'Toque Sombrio',
                corruptionRequired: 20,
                description: 'Ataques causam +5 de dano sombreado',
                icon: '🌑',
                unlocked: false
            },
            {
                id: 'dark_2',
                name: 'Olhar Dominador',
                corruptionRequired: 40,
                description: 'Inimigos fracos fogem ao te ver',
                icon: '👁️',
                unlocked: false
            },
            {
                id: 'dark_3',
                name: 'Aura de Medo',
                corruptionRequired: 60,
                description: 'Inimigos próximos recebem -20% dano causado',
                icon: '💀',
                unlocked: false
            },
            {
                id: 'dark_4',
                name: 'Drenar Vida',
                corruptionRequired: 75,
                description: 'Ataques curam 10% do dano causado',
                icon: '🩸',
                unlocked: false
            },
            {
                id: 'dark_5',
                name: 'Forma de Sauron',
                corruptionRequired: 100,
                description: 'Transformação final. +50% dano, aparência sombria.',
                icon: '🔥',
                unlocked: false
            }
        ];
        
        this.lastTierIndex = 0;
        
        console.log('🌑 CorruptionSystem criado');
    }
    
    // ============================================
    // MODIFICAÇÃO DE CORRUPTION
    // ============================================
    
    addCorruption(amount, reason = '') {
        const oldValue = this.value;
        this.value = Math.min(this.maxValue, this.value + amount);
        
        if (this.value !== oldValue) {
            console.log(`🌑 +${amount} corrupção${reason ? ` (${reason})` : ''} → ${this.value}/${this.maxValue}`);
            this.checkTierChange(oldValue);
            this.checkDarkSkills();
        }
    }
    
    reduceCorruption(amount, reason = '') {
        const oldValue = this.value;
        this.value = Math.max(0, this.value - amount);
        
        if (this.value !== oldValue) {
            console.log(`✨ -${amount} corrupção${reason ? ` (${reason})` : ''} → ${this.value}/${this.maxValue}`);
            this.checkTierChange(oldValue);
        }
    }
    
    setCorruption(value) {
        const oldValue = this.value;
        this.value = Math.max(0, Math.min(this.maxValue, value));
        
        if (this.value !== oldValue) {
            console.log(`🌑 Corrupção definida: ${this.value}/${this.maxValue}`);
            this.checkTierChange(oldValue);
            this.checkDarkSkills();
        }
    }
    
    // ============================================
    // VERIFICAÇÕES
    // ============================================
    
    checkTierChange(oldValue) {
        const oldTier = this.getTier(oldValue);
        const newTier = this.getCurrentTier();
        
        if (oldTier !== newTier) {
            console.log(`🎭 Tier de corrupção mudou: ${oldTier.name} → ${newTier.name}`);
            
            // Notificação visual
            if (this.game.damageNumbers) {
                this.game.damageNumbers.add(
                    this.game.player.x + this.game.player.width / 2,
                    this.game.player.y - 20,
                    newTier.name,
                    newTier.color,
                    false,
                    true // é texto, não número
                );
            }
            
            // Som especial
            if (this.game.audio && this.game.audio.initialized) {
                if (newTier.name === 'Sauron') {
                    this.game.audio.playLevelUp();
                }
            }
        }

                // ✅ NOVO: Partículas ao mudar de tier
        if (this.game.particles && this.game.player) {
            this.game.particles.emitExplosion(
                this.game.player.x + this.game.player.width / 2,
                this.game.player.y + this.game.player.height / 2,
                newTier.color,
                30
            );
        }
    }
    
    checkDarkSkills() {
        for (const skill of this.darkSkills) {
            if (!skill.unlocked && this.value >= skill.corruptionRequired) {
                skill.unlocked = true;
                console.log(`🌑 Habilidade sombria desbloqueada: ${skill.name}`);
                
                // Notificação
                if (this.game.damageNumbers) {
                    this.game.damageNumbers.add(
                        this.game.player.x + this.game.player.width / 2,
                        this.game.player.y - 40,
                        `${skill.icon} ${skill.name}`,
                        '#aa22aa',
                        false,
                        true
                    );
                }
            }
        }
    }
    
    // ============================================
    // CONSULTAS
    // ============================================
    
    getCurrentTier() {
        return this.getTier(this.value);
    }
    
    getTier(value) {
        for (const tier of this.tiers) {
            if (value >= tier.min && value <= tier.max) {
                return tier;
            }
        }
        return this.tiers[this.tiers.length - 1];
    }
    
    getCorruptionPercent() {
        return this.value / this.maxValue;
    }
    
    hasDarkSkill(skillId) {
        const skill = this.darkSkills.find(s => s.id === skillId);
        return skill && skill.unlocked;
    }
    
    // ============================================
    // EFEITOS NO GAMEPLAY
    // ============================================
    
    // Retorna o bônus de dano sombreado (Toque Sombrio + Forma de Sauron)
    getShadowDamageBonus() {
        let bonus = 0;
        if (this.hasDarkSkill('dark_1')) bonus += 5;
        if (this.hasDarkSkill('dark_5')) bonus *= 1.5; // Forma de Sauron amplifica
        return Math.floor(bonus);
    }
    
    // Retorna % de life steal (Drenar Vida)
    getLifeStealPercent() {
        if (this.hasDarkSkill('dark_4')) return 0.10;
        return 0;
    }
    
    // Retorna % de redução de dano em inimigos próximos (Aura de Medo)
    getFearAuraReduction() {
        if (this.hasDarkSkill('dark_3')) return 0.20;
        return 0;
    }
    
    // Retorna se inimigos fracos devem fugir (Olhar Dominador)
    shouldEnemiesFlee(enemy) {
        if (!this.hasDarkSkill('dark_2')) return false;
        // Só afeta inimigos com HP máximo baixo (fracos)
        return enemy.maxHP <= 30;
    }
    
    // ============================================
    // FONTES DE CORRUPTION
    // ============================================
    
    // Chamado quando o jogador derrota um inimigo
    onEnemyKilled(enemy) {
        // Inimigos "normais" dão pouca corrupção
        // Sombras corrompidas dão mais (são criaturas de Melkor)
        if (enemy instanceof CorruptedShadow) {
            this.addCorruption(3, 'derrotou Sombra Corrompida');
        } else {
            this.addCorruption(1, 'derrotou inimigo');
        }
    }
    
    // Chamado quando o jogador faz uma escolha sombria em diálogo
    onDarkChoice(amount = 5, reason = 'escolha sombria') {
        this.addCorruption(amount, reason);
    }
    
    // ============================================
    // SAVE/LOAD
    // ============================================
    
    getSaveData() {
        return {
            value: this.value,
            darkSkills: this.darkSkills.map(s => ({ id: s.id, unlocked: s.unlocked }))
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.value = data.value || 0;
        
        if (data.darkSkills) {
            for (const saved of data.darkSkills) {
                const skill = this.darkSkills.find(s => s.id === saved.id);
                if (skill) skill.unlocked = saved.unlocked;
            }
        }
        
        console.log('🌑 Corrupção carregada:', this.value);
    }
}