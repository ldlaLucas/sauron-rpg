class SaveManager {
    constructor() {
        this.saveKey = 'sauron_rpg_save';
        this.saveVersion = 1;
        this.autoSaveCooldown = 0;
        this.autoSaveInterval = 2; // segundos mínimos entre autosaves
        console.log('💾 SaveManager inicializado');
    }
    
    save(game, silent = false) {
        try {
            const saveData = {
                version: this.saveVersion,
                timestamp: Date.now(),
                player: {
                    x: game.player.x,
                    y: game.player.y,
                    hp: game.player.hp,
                    maxHP: game.player.maxHP,
                    level: game.playerLevel,
                    xp: game.playerXP,
                    baseDamage: game.player.baseDamage,
                    direction: game.player.direction
                },
                inventory: { ...game.inventory.items },
                equipment: { ...game.equipment.slots },
                quest: {
                    activeQuest: game.questSystem.activeQuest,
                    completedQuests: [...game.questSystem.completedQuests]
                },
                flags: {
                    pickupsSpawned: game.pickupsSpawned,
                    questStarted: game.questStarted
                },
                pickups: game.pickups.map(p => ({
                    x: p.x,
                    y: p.y,
                    type: p.type,
                    collected: p.collected
                })),
                enemies: game.enemies.map(e => ({
                    x: e.originalX || e.x,
                    y: e.originalY || e.y,
                    hp: e.hp,
                    alive: e.alive
                }))
            };
            
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            
            if (!silent) {
                console.log('💾 Jogo salvo com sucesso!');
                console.log(`   Posição: (${Math.round(game.player.x)}, ${Math.round(game.player.y)})`);
                console.log(`   HP: ${game.player.hp}/${game.player.maxHP}`);
                console.log(`   Nível: ${game.playerLevel}`);
            }
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao salvar:', error);
            return false;
        }
    }
    
    // ✅ NOVO: Autosave silencioso (sem logs chatos)
    autoSave(game) {
        // Respeita cooldown para não salvar a cada frame
        if (this.autoSaveCooldown > 0) return false;
        
        const success = this.save(game, true);
        if (success) {
            this.autoSaveCooldown = this.autoSaveInterval;
        }
        return success;
    }
    
    // ✅ NOVO: Atualiza cooldown do autosave
    update(deltaTime) {
        if (this.autoSaveCooldown > 0) {
            this.autoSaveCooldown -= deltaTime;
        }
    }
    
    load(game) {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            
            if (!saveString) {
                console.log('⚠️ Nenhum save encontrado');
                return false;
            }
            
            const saveData = JSON.parse(saveString);
            
            if (!saveData.version || !saveData.player) {
                console.error('❌ Save inválido');
                return false;
            }
            
            // Restaurar jogador
            game.player.x = saveData.player.x;
            game.player.y = saveData.player.y;
            game.player.hp = saveData.player.hp;
            game.player.maxHP = saveData.player.maxHP;
            game.player.direction = saveData.player.direction;
            game.playerLevel = saveData.player.level;
            game.playerXP = saveData.player.xp;
            game.player.baseDamage = saveData.player.baseDamage;
            
            // Restaurar inventário
            game.inventory.items = { ...saveData.inventory };
            
            // Restaurar equipamentos
            game.equipment.slots = { ...saveData.equipment };
            game.equipment.recalculateBonuses();
            
            // Restaurar missão
            game.questSystem.activeQuest = saveData.quest.activeQuest;
            game.questSystem.completedQuests = [...saveData.quest.completedQuests];
            
            // Restaurar flags
            game.pickupsSpawned = saveData.flags.pickupsSpawned;
            game.questStarted = saveData.flags.questStarted;
            
            // Restaurar pickups
            game.pickups = saveData.pickups.map(p => {
                const pickup = new Pickup(p.x, p.y, p.type);
                pickup.collected = p.collected;
                return pickup;
            });
            
            // ✅ NOVO: Restaurar estado dos inimigos
            if (saveData.enemies && game.enemies.length === saveData.enemies.length) {
                for (let i = 0; i < game.enemies.length; i++) {
                    const savedEnemy = saveData.enemies[i];
                    const enemy = game.enemies[i];
                    enemy.hp = savedEnemy.hp;
                    enemy.alive = savedEnemy.alive;
                    if (!savedEnemy.alive) {
                        enemy.respawnTimer = enemy.respawnTime;
                    }
                }
            }
            
            console.log('✅ Jogo carregado com sucesso!');
            return true;
        } catch (error) {
            console.error('❌ Erro ao carregar:', error);
            return false;
        }
    }
    
    hasSave() {
        return localStorage.getItem(this.saveKey) !== null;
    }
    
    deleteSave() {
        localStorage.removeItem(this.saveKey);
        console.log('🗑️ Save deletado');
    }
    
    getSaveInfo() {
        try {
            const saveString = localStorage.getItem(this.saveKey);
            if (!saveString) return null;
            
            const saveData = JSON.parse(saveString);
            return {
                timestamp: saveData.timestamp,
                level: saveData.player.level,
                position: { x: saveData.player.x, y: saveData.player.y }
            };
        } catch (error) {
            return null;
        }
    }
}