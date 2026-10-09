class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1280;
        this.canvas.height = 720;
        
        this.input = new InputManager();
        this.player = null;
        this.tileMap = null;
        this.npcs = [];
        this.pickups = [];
        this.enemies = [];
        this.forge = null;
        this.inventory = new InventorySystem();
        this.questSystem = new QuestSystem(this.inventory);
        this.dialogueSystem = new DialogueSystem();
        this.craftingSystem = new CraftingSystem(this.inventory);
        this.equipment = new EquipmentSystem(this.inventory);
        this.damageNumbers = new DamageNumberSystem();
        this.saveManager = new SaveManager();
        this.forgeUI = new ForgeUI(this.craftingSystem, this.inventory);
        this.inventoryUI = new InventoryUI(this.inventory, this.equipment);
        this.saveLoadUI = new SaveLoadUI(this.saveManager, this);
        this.camera = { x: 0, y: 0 };
        this.running = false;
        
        this.pickupsSpawned = false;
        this.questStarted = false;
        this.iKeyReleased = true;
        this.f5KeyReleased = true;
        this.f9KeyReleased = true;
        
        this.playerLevel = 1;
        this.playerXP = 0;
        this.xpToNextLevel = 100;
        
        // ✅ NOVO: Sistema de autosave
        this.autoSaveNotification = null;
        this.lastAutoSaveTime = 0;
        //this.autoSaveInterval = 30; // autosave a cada 30 segundos
        
        // ✅ NOVO: Flags para detectar eventos importantes
        this.lastPickupCount = 0;
        this.lastQuestState = null;
        this.lastEnemyKillCount = 0;
                this.audio = new AudioManager(); // ✅ NOVO
        this.audioInitialized = false;
        
        // ✅ NOVO: Controle de passos (para não tocar a cada frame)
        this.footstepTimer = 0;
        this.footstepInterval = 0.4; // um passo a cada 0.4s
        
        // ✅ NOVO: Controle de música atual
        this.currentMusicState = null; // 'exploration' ou 'combat'
    }
    
    init() {
        console.log('🎮 Sauron RPG - Inicializando...');
        
        this.tileMap = new TileMap(32);
        
        const startX = 3 * 32;
        const startY = 20 * 32;
        this.player = new Player(startX, startY);
        this.player.setEquipmentSystem(this.equipment);
        
        // Forja
        const forgeX = 31 * 32;
        const forgeY = 5 * 32;
        this.forge = new ForgeObject(forgeX, forgeY);
        
        // Bonecos de treino
        this.spawnTrainingDummies();
        
        // Aulë
        const auleX = 30 * 32;
        const auleY = 5 * 32;
        const auleDialogue = {
            lines: [
                { speaker: 'Aulë', text: 'Mairon, meu jovem aprendiz. Bem-vindo à minha oficina.' },
                { speaker: 'Aulë', text: 'A criação nunca termina. Cada obra pode ser aperfeiçoada.' },
                { speaker: 'Mairon', text: 'Mestre Aulë, estou pronto para aprender.' },
                { speaker: 'Aulë', text: 'Então temos uma tarefa para você. Preciso de materiais para uma nova obra.' },
                { speaker: 'Aulë', text: 'Traga-me 3 ferros, 2 madeiras e 1 pedra. Espalhados pela oficina.' },
                { speaker: 'Aulë', text: 'Quando reunir tudo, volte à forja. Vamos criar sua primeira ferramenta.' },
                { speaker: 'Aulë', text: 'Ah, e não esqueça dos bonecos de treino! Use ESPAÇO para atacar.' }
            ]
        };
        
        const onAuleDialogueEnd = () => {
            if (this.questStarted || this.pickupsSpawned) return;
            this.questStarted = true;
            
            this.questSystem.startQuest({
                id: 'first_materials',
                title: 'Os Materiais',
                description: 'Colete materiais para Aulë',
                objectives: [
                    { type: 'collect', item: 'iron', amount: 3 },
                    { type: 'collect', item: 'wood', amount: 2 },
                    { type: 'collect', item: 'stone', amount: 1 }
                ]
            });
            
            this.spawnPickups();
            this.pickupsSpawned = true;
            
            // ✅ NOVO: Autosave após iniciar missão
            this.triggerAutoSave('📜 Missão iniciada');
        };
        
        const aule = new NPC(auleX, auleY, 'Aulë', auleDialogue, onAuleDialogueEnd);
        this.npcs.push(aule);
        
        this.dialogueSystem.onDialogueEnd = () => {
            console.log('✅ Diálogo concluído');
        };
        
        // ✅ NOVO: Salvar automaticamente ao fechar/atualizar página
        window.addEventListener('beforeunload', (e) => {
            console.log('🚪 Página sendo fechada - salvando...');
            this.saveManager.save(this, true);
        });
        
        // ✅ NOVO: Salvar ao perder foco da aba (opcional, mas útil)
        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('👁️ Aba oculta - salvando...');
                this.saveManager.save(this, true);
            }
        });
        
        this.running = true;
        this.gameLoop = new GameLoop(this);
        this.gameLoop.start();
        
        console.log('✅ Jogo iniciado com autosave!');
        console.log('💾 O jogo salva automaticamente em momentos importantes');
        console.log('💾 Também salva ao fechar/atualizar a página');
    
                // ✅ NOVO: Inicializa áudio no primeiro clique do usuário
        const initAudioOnClick = () => {
            if (!this.audioInitialized) {
                this.audio.init();
                this.audio.playValinorAmbience();
                this.currentMusicState = 'exploration';
                this.audioInitialized = true;
                console.log('🎵 Áudio iniciado');
            }
            window.removeEventListener('click', initAudioOnClick);
            window.removeEventListener('keydown', initAudioOnClick);
        };
        
        window.addEventListener('click', initAudioOnClick);
        window.addEventListener('keydown', initAudioOnClick);
    }
    
    // ✅ NOVO: Método para disparar autosave com notificação
    triggerAutoSave(reason = '') {
        const success = this.saveManager.save(this, true);
        if (success) {
            this.showAutoSaveNotification(reason);
            console.log(`💾 Autosave: ${reason}`);
        }
    }
    
    // ✅ NOVO: Mostra notificação discreta de autosave
    showAutoSaveNotification(reason) {
        // Remove notificação anterior se existir
        if (this.autoSaveNotification) {
            this.autoSaveNotification.remove();
        }
        
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: #4ade80;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            font-weight: bold;
            z-index: 999;
            border: 1px solid #4ade80;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        notif.textContent = reason ? `💾 ${reason}` : '💾 Salvando...';
        
        document.getElementById('game-container').appendChild(notif);
        
        // Fade in
        setTimeout(() => { notif.style.opacity = '1'; }, 10);
        
        // Fade out e remove
        setTimeout(() => {
            notif.style.opacity = '0';
            setTimeout(() => {
                if (notif.parentNode) notif.remove();
            }, 300);
        }, 2000);
        
        this.autoSaveNotification = notif;
    }
    
    spawnTrainingDummies() {
        const positions = [
            { x: 10 * 32, y: 10 * 32 },
            { x: 15 * 32, y: 15 * 32 },
            { x: 20 * 32, y: 20 * 32 }
        ];
        
        for (const pos of positions) {
            if (!this.tileMap.isSolid(pos.x + 16, pos.y + 20)) {
                this.enemies.push(new TrainingDummy(pos.x, pos.y));
            }
        }
    }
    
    spawnPickups() {
        const pickupPositions = [
            { x: 5 * 32, y: 5 * 32, type: 'iron' },
            { x: 15 * 32, y: 8 * 32, type: 'iron' },
            { x: 25 * 32, y: 18 * 32, type: 'iron' },
            { x: 8 * 32, y: 15 * 32, type: 'wood' },
            { x: 35 * 32, y: 12 * 32, type: 'wood' },
            { x: 12 * 32, y: 3 * 32, type: 'stone' }
        ];
        
        for (const pos of pickupPositions) {
            if (!this.tileMap.isSolid(pos.x + 12, pos.y + 12)) {
                this.pickups.push(new Pickup(pos.x, pos.y, pos.type));
            }
        }
    }
    
    update(deltaTime) {
        this.input.update();

         // ✅ NOVO: Tecla M muta/desmuta o áudio
        const mPressed = this.input.isKeyDown('m');
        if (mPressed && this.mKeyReleased) {
            this.audio.toggleMute();
            this.mKeyReleased = false;
        } else if (!mPressed) {
            this.mKeyReleased = true;
        }
        
        // ... resto do update existente ...
        
        this.player.update(deltaTime, this.input, this.tileMap);
        
        // ✅ NOVO: Som de passos quando está andando
        const isMoving = this.input.getMovement().dx !== 0 || this.input.getMovement().dy !== 0;
        if (isMoving && !this.dialogueSystem.active && !this.craftingSystem.active && !this.inventoryUI.active) {
            this.footstepTimer -= deltaTime;
            if (this.footstepTimer <= 0) {
                this.audio.playFootstep();
                this.footstepTimer = this.footstepInterval;
            }
        } else {
            this.footstepTimer = 0;
        }
        
        // ✅ NOVO: Verifica hit apenas UMA VEZ por ataque
        if (this.player.attacking && this.player.attackHitbox && !this.player.attackHitProcessed) {
            this.player.attackHitProcessed = true;
            this.audio.playAttack(); // ✅ Som de ataque
            this.checkAttackHits();
        }
        
        // ✅ NOVO: Atualiza cooldown do autosave
        this.saveManager.update(deltaTime);
        
        // ✅ NOVO: Autosave periódico (a cada 30 segundos)
        this.lastAutoSaveTime += deltaTime;
        if (this.lastAutoSaveTime >= this.autoSaveInterval) {
            this.lastAutoSaveTime = 0;
            this.triggerAutoSave();
        }
        
        // Tecla F5 salva manualmente
        const f5Pressed = this.input.isKeyDown('f5');
        if (f5Pressed && this.f5KeyReleased) {
            this.triggerAutoSave('💾 Save manual');
            this.f5KeyReleased = false;
        } else if (!f5Pressed) {
            this.f5KeyReleased = true;
        }
        
        // Tecla F9 abre menu
        const f9Pressed = this.input.isKeyDown('f9');
        if (f9Pressed && this.f9KeyReleased && !this.dialogueSystem.active && !this.craftingSystem.active) {
            this.saveLoadUI.show();
            this.f9KeyReleased = false;
        } else if (!f9Pressed) {
            this.f9KeyReleased = true;
        }
        
        // Tecla I inventário
        const iPressed = this.input.isKeyDown('i');
        if (iPressed && this.iKeyReleased && !this.dialogueSystem.active && !this.craftingSystem.active) {
            this.inventoryUI.toggle();
            this.iKeyReleased = false;
        } else if (!iPressed) {
            this.iKeyReleased = true;
        }
        
        if (this.saveLoadUI.active) return;
        if (this.inventoryUI.active) return;
        
        if (this.dialogueSystem.active) {
            this.dialogueSystem.update(this.input);
            return;
        }
        
        if (this.craftingSystem.active) {
            if (this.input.isKeyDown('escape')) {
                this.forgeUI.hide();
            }
            return;
        }
        
        this.player.update(deltaTime, this.input, this.tileMap);
        
        // Verifica hit apenas UMA VEZ por ataque
        if (this.player.attacking && this.player.attackHitbox && !this.player.attackHitProcessed) {
            this.player.attackHitProcessed = true;
            const killsBefore = this.countDeadEnemies();
            this.checkAttackHits();
            const killsAfter = this.countDeadEnemies();
            
            // ✅ NOVO: Autosave ao derrotar inimigo
            if (killsAfter > killsBefore) {
                this.triggerAutoSave('⚔️ Inimigo derrotado');
            }
        }
        
        // Atualiza NPCs
        for (const npc of this.npcs) {
            const result = npc.update(this.player, this.input);
            if (result && result.type === 'dialogue') {
                this.dialogueSystem.start(result.npc);
            }
        }
        
        // Atualiza forja
        if (this.forge) {
            const result = this.forge.update(this.player, this.input);
            if (result && result.type === 'open_forge') {
                this.craftingSystem.open();
                this.forgeUI.show();
            }
        }
        
        // Atualiza pickups
        const pickupsBefore = this.pickups.filter(p => p.collected).length;
        for (const pickup of this.pickups) {
            const result = pickup.update(deltaTime, this.player);
            if (result && result.type === 'collected') {
                this.inventory.add(result.item);
            }
        }
        const pickupsAfter = this.pickups.filter(p => p.collected).length;
        
        // ✅ NOVO: Autosave ao coletar item
        if (pickupsAfter > pickupsBefore) {
            this.triggerAutoSave('📦 Item coletado');
        }
        
        // Atualiza inimigos
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, this.player);
        }
        
        // Atualiza sistemas
        this.inventory.update(deltaTime);
        
        // ✅ NOVO: Detecta mudança no estado da quest
        const currentQuestCompleted = this.questSystem.activeQuest?.completed || false;
        if (this.lastQuestState === false && currentQuestCompleted) {
            this.triggerAutoSave('✅ Missão concluída');
        }
        this.lastQuestState = currentQuestCompleted;
        
        this.questSystem.update();
        this.craftingSystem.update(deltaTime);
        this.damageNumbers.update(deltaTime);
        
        this.updateCamera();
    }
    
    countDeadEnemies() {
        return this.enemies.filter(e => !e.alive).length;
    }
    
    checkAttackHits() {
        const ah = this.player.attackHitbox;
        const damage = this.player.getAttackDamage();
        
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            if (this.boxCollision(ah, { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height })) {
                const result = enemy.takeDamage(damage);

                this.audio.playHit(); 
                
                this.damageNumbers.add(
                    enemy.x + enemy.width / 2,
                    enemy.y,
                    result.damage,
                    '#ffeb3b'
                );
                
                if (result.died) {
                    this.gainXP(result.xp);
                }
            }
        }
    }
    
    boxCollision(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }
    
    gainXP(amount) {
        this.playerXP += amount;
        console.log(`✨ +${amount} XP (Total: ${this.playerXP}/${this.xpToNextLevel})`);
        
        while (this.playerXP >= this.xpToNextLevel) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.playerXP -= this.xpToNextLevel;
        this.playerLevel++;
        this.xpToNextLevel = Math.floor(100 * Math.pow(1.5, this.playerLevel - 1));
        
        this.player.maxHP += 10;
        this.player.hp = this.player.maxHP;
        this.player.baseDamage += 2;
        this.audio.playLevelUp();
        
        console.log(`🎉 LEVEL UP! Nível ${this.playerLevel}`);
        
        // ✅ NOVO: Autosave ao subir de nível
        this.triggerAutoSave(`🎉 Nível ${this.playerLevel}!`);
    }
    
    updateCamera() {
        this.camera.x = this.player.x - this.canvas.width / 2 + this.player.width / 2;
        this.camera.y = this.player.y - this.canvas.height / 2 + this.player.height / 2;
        
        const maxX = this.tileMap.width * 32 - this.canvas.width;
        const maxY = this.tileMap.height * 32 - this.canvas.height;
        
        this.camera.x = Math.max(0, Math.min(this.camera.x, maxX));
        this.camera.y = Math.max(0, Math.min(this.camera.y, maxY));
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.tileMap.render(this.ctx, this.camera);
        
        for (const pickup of this.pickups) {
            pickup.render(this.ctx, this.camera);
        }
        
        for (const enemy of this.enemies) {
            enemy.render(this.ctx, this.camera);
        }
        
        if (this.forge) {
            this.forge.render(this.ctx, this.camera);
        }
        
        for (const npc of this.npcs) {
            npc.render(this.ctx, this.camera);
        }
        
        this.player.render(this.ctx, this.camera);
        
        this.damageNumbers.render(this.ctx, this.camera);
        
        this.inventory.render(this.ctx, this.canvas);
        this.questSystem.render(this.ctx, this.canvas);
        this.craftingSystem.render(this.ctx, this.canvas);
        this.equipment.render(this.ctx, this.canvas);
        this.renderPlayerHUD();
        
        this.dialogueSystem.render(this.ctx, this.canvas);
    }
    
    renderPlayerHUD() {
        const startX = 20;
        const startY = this.canvas.height - 130;
        const ctx = this.ctx;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY, 220, 55);
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, 220, 55);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`MAIRON  Nv.${this.playerLevel}`, startX + 10, startY + 15);
        
        const barX = startX + 10;
        const barY = startY + 22;
        const barWidth = 200;
        const barHeight = 12;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const hpPercent = this.player.hp / this.player.maxHP;
        ctx.fillStyle = hpPercent > 0.5 ? '#4ade80' : hpPercent > 0.25 ? '#fbbf24' : '#ef4444';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`HP ${this.player.hp}/${this.player.maxHP}`, barX + barWidth / 2, barY + 9);
        
        const xpBarY = barY + 18;
        const xpBarHeight = 8;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, xpBarY, barWidth, xpBarHeight);
        
        const xpPercent = this.playerXP / this.xpToNextLevel;
        ctx.fillStyle = '#a78bfa';
        ctx.fillRect(barX, xpBarY, barWidth * xpPercent, xpBarHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(barX, xpBarY, barWidth, xpBarHeight);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Arial';
        ctx.fillText(`XP ${this.playerXP}/${this.xpToNextLevel}`, barX + barWidth / 2, xpBarY + 6);
    }
}