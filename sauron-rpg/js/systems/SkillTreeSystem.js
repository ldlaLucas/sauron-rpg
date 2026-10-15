class SkillTreeSystem {
    constructor(game) {
        this.game = game;
        this.skillPoints = 0;
        this.unlockedSkills = {}; // { skillId: true }
        this.active = false;
        
        // Define todas as habilidades
        this.skills = this.defineSkills();
        
        console.log('🌳 SkillTreeSystem criado');
    }
    
    defineSkills() {
        return {
            // ============================================
            // CAMINHO CRIAÇÃO (🔨)
            // ============================================
            'creation_1': {
                id: 'creation_1',
                name: 'Forja Aprimorada',
                path: 'creation',
                tier: 1,
                description: '+10% qualidade dos itens forjados',
                icon: '🔨',
                cost: 1,
                requires: [],
                effect: { craftQuality: 0.1 }
            },
            'creation_2': {
                id: 'creation_2',
                name: 'Mestre Ferreiro',
                path: 'creation',
                tier: 2,
                description: 'Desbloqueia receitas avançadas na forja',
                icon: '⚒️',
                cost: 1,
                requires: ['creation_1'],
                effect: { advancedRecipes: true }
            },
            'creation_3': {
                id: 'creation_3',
                name: 'Toque de Aulë',
                path: 'creation',
                tier: 3,
                description: 'Itens forjados ganham +5% bônus de dano',
                icon: '✨',
                cost: 1,
                requires: ['creation_2'],
                effect: { itemDamageBonus: 0.05 }
            },
            
            // ============================================
            // CAMINHO ORDEM (⚖️)
            // ============================================
            'order_1': {
                id: 'order_1',
                name: 'Disciplina',
                path: 'order',
                tier: 1,
                description: '+25 HP máximo',
                icon: '💪',
                cost: 1,
                requires: [],
                effect: { maxHPBonus: 25 }
            },
            'order_2': {
                id: 'order_2',
                name: 'Mente Organizada',
                path: 'order',
                tier: 2,
                description: '+15% XP ganho',
                icon: '🧠',
                cost: 1,
                requires: ['order_1'],
                effect: { xpBonus: 0.15 }
            },
            'order_3': {
                id: 'order_3',
                name: 'Barreira Mental',
                path: 'order',
                tier: 3,
                description: '-15% dano recebido',
                icon: '🛡️',
                cost: 1,
                requires: ['order_2'],
                effect: { damageReduction: 0.15 }
            },
            
            // ============================================
            // CAMINHO PODER (👑)
            // ============================================
            'power_1': {
                id: 'power_1',
                name: 'Fúria Contida',
                path: 'power',
                tier: 1,
                description: '+20% dano de ataque',
                icon: '⚔️',
                cost: 1,
                requires: [],
                effect: { damageBonus: 0.2 }
            },
            'power_2': {
                id: 'power_2',
                name: 'Golpe Preciso',
                path: 'power',
                tier: 2,
                description: '20% chance de dano crítico (2x)',
                icon: '🎯',
                cost: 1,
                requires: ['power_1'],
                effect: { critChance: 0.2, critMultiplier: 2 }
            },
            'power_3': {
                id: 'power_3',
                name: 'Vontade de Ferro',
                path: 'power',
                tier: 3,
                description: '+30% dano e knockback nos ataques',
                icon: '💥',
                cost: 1,
                requires: ['power_2'],
                effect: { damageBonus: 0.3, knockback: true }
            }
        };
    }
    
    addSkillPoints(amount) {
        this.skillPoints += amount;
        console.log(`🌟 +${amount} ponto(s) de habilidade (Total: ${this.skillPoints})`);
    }
    
    canUnlock(skillId) {
        const skill = this.skills[skillId];
        if (!skill) return false;
        
        // Já desbloqueada?
        if (this.unlockedSkills[skillId]) return false;
        
        // Tem pontos suficientes?
        if (this.skillPoints < skill.cost) return false;
        
        // Requisitos atendidos?
        for (const req of skill.requires) {
            if (!this.unlockedSkills[req]) return false;
        }
        
        return true;
    }
    
    unlock(skillId) {
        if (!this.canUnlock(skillId)) {
            console.log(`❌ Não é possível desbloquear ${skillId}`);
            return false;
        }
        
        const skill = this.skills[skillId];
        this.skillPoints -= skill.cost;
        this.unlockedSkills[skillId] = true;
        
        console.log(`✅ Habilidade desbloqueada: ${skill.name}`);
        
        // Aplica efeitos imediatos
        this.applySkillEffects();
        
        // Toca som
        if (this.game.audio && this.game.audio.initialized) {
            this.game.audio.playLevelUp();
        }
        
        return true;
    }
    
    hasSkill(skillId) {
        return !!this.unlockedSkills[skillId];
    }
    
    // Aplica efeitos das habilidades desbloqueadas
    applySkillEffects() {
        // Recalcula bônus do jogador
        this.recalculatePlayerBonuses();
    }
    
    recalculatePlayerBonuses() {
        const bonuses = {
            maxHPBonus: 0,
            xpBonus: 0,
            damageReduction: 0,
            damageBonus: 0,
            critChance: 0,
            critMultiplier: 2,
            craftQuality: 0,
            knockback: false,
            advancedRecipes: false,
            itemDamageBonus: 0
        };
        
        for (const skillId in this.unlockedSkills) {
            if (this.unlockedSkills[skillId]) {
                const skill = this.skills[skillId];
                for (const key in skill.effect) {
                    if (typeof skill.effect[key] === 'boolean') {
                        bonuses[key] = bonuses[key] || skill.effect[key];
                    } else {
                        bonuses[key] += skill.effect[key];
                    }
                }
            }
        }
        
        // Aplica ao jogador
        if (this.game.player) {
            this.game.player.skillBonuses = bonuses;
            
            // Recalcula HP máximo
            const baseMaxHP = 100 + (this.game.playerLevel - 1) * 10;
            this.game.player.maxHP = baseMaxHP + bonuses.maxHPBonus;
            if (this.game.player.hp > this.game.player.maxHP) {
                this.game.player.hp = this.game.player.maxHP;
            }
        }
        
        // Aplica receitas avançadas
        if (bonuses.advancedRecipes && this.game.craftingSystem) {
            this.game.craftingSystem.enableAdvancedRecipes();
        }
        
        return bonuses;
    }
    
    getBonuses() {
        return this.game.player ? this.game.player.skillBonuses || {} : {};
    }
    
    // ============================================
    // UI
    // ============================================
    
    open() {
        this.active = true;
        if (this.game.skillTreeUI) {
            this.game.skillTreeUI.show();
        }
    }
    
    close() {
        this.active = false;
        if (this.game.skillTreeUI) {
            this.game.skillTreeUI.hide();
        }
    }
    
    toggle() {
        if (this.active) this.close();
        else this.open();
    }
    
    // ============================================
    // SAVE/LOAD
    // ============================================
    
    getSaveData() {
        return {
            skillPoints: this.skillPoints,
            unlockedSkills: { ...this.unlockedSkills }
        };
    }
    
    loadSaveData(data) {
        if (!data) return;
        this.skillPoints = data.skillPoints || 0;
        this.unlockedSkills = data.unlockedSkills || {};
        this.applySkillEffects();
        console.log('🌳 Habilidades carregadas do save');
    }
}