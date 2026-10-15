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
        this.audio = new AudioManager();
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
        this.mKeyReleased = true;
        this.enterKeyReleased = true;
        
        this.playerLevel = 1;
        this.playerXP = 0;
        this.xpToNextLevel = 100;
        
        this.audioInitialized = false;
        this.footstepTimer = 0;
        this.footstepInterval = 0.4;
        this.currentMusicState = null;
        
        // ✅ NOVO: Controle de mapa atual
        this.currentMapId = 'aule_workshop';
        this.transitioning = false;
        this.transitionAlpha = 0;

        this.corruptedShadows = []; // ✅ NOVO: lista de sombras

        this.minimap = new MinimapSystem(this); // ✅ NOVO

        this.skillTree = new SkillTreeSystem(this);
        this.skillTreeUI = new SkillTreeUI(this.skillTree);
        this.kKeyReleased = true;

        // Dá 1 ponto inicial para o jogador testar
        this.skillTree.addSkillPoints(1);

        this.corruption = new CorruptionSystem(this);
        this.debugKeyReleased = true;

        this.particles = new ParticleSystem();
        this.footstepParticleTimer = 0;

        this.damageTypeSystem = new DamageTypeSystem();

    }
    
    // ✅ NOVO: Inicialização para o menu principal
    initMainMenu() {
        console.log('🎮 Sauron RPG - Inicializando menu...');
        
        // Cria os sistemas básicos SEM iniciar o loop
        this.tileMap = new TileMap(32);
        
        const startX = 3 * 32;
        const startY = 20 * 32;
        this.player = new Player(startX, startY);
        this.player.setEquipmentSystem(this.equipment);
        
        // Configura entidades iniciais (mas não inicia o loop)
        this.setupWorkshopEntities();
        
        // Listeners de save
        window.addEventListener('beforeunload', () => {
            this.saveManager.save(this, true);
        });
        
        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveManager.save(this, true);
            }
        });
        
        console.log('✅ Menu pronto');
    }

        startGameLoop() {//init()
        console.log('🎮 Sauron RPG - Inicializando...');
        
        // 1. Cria o jogador PRIMEIRO
        const startX = 3 * 32;
        const startY = 20 * 32;
        this.player = new Player(startX, startY);
        this.player.setEquipmentSystem(this.equipment);

        this.player.setCorruptionSystem(this.corruption);
        
        // 2. Carrega o mapa padrão da Oficina internamente (sem arquivo externo)
        this.tileMap = new TileMap(32); 
        
        // 3. Adiciona o portal visual no lado direito da oficina
        if (!this.tileMap.decorations) {
            this.tileMap.decorations = [];
        }
        this.tileMap.decorations.push({
            type: 'portal',
            x: 38 * 32,
            y: 11 * 32
        });
        
        // 4. Configura as entidades da oficina (Forja, Aulë, Bonecos, etc)
        this.setupWorkshopEntities();

            // No método init(), após criar Aulë
    this.celebrimborQuestStarted = false;
    
    if (this.questGivenByCelebrimbor && !this.celebrimborQuestStarted) {
        this.celebrimborQuestStarted = true;
        
        this.questSystem.startQuest({
            id: 'crystals_of_valinor',
            title: 'Cristais de Valinor',
            description: 'Colete cristais para Celebrimbor',
            objectives: [
                { type: 'collect', item: 'valinor_crystal', amount: 2 }
            ]
        });
        
        this.triggerAutoSave('📜 Nova missão: Cristais de Valinor');
    }
        
        // Listeners de save
        window.addEventListener('beforeunload', () => {
            this.saveManager.save(this, true);
        });
        
        window.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.saveManager.save(this, true);
            }
        });
        
        // Inicializa áudio na primeira interação do usuário
        const initAudioOnClick = () => {
            if (!this.audioInitialized) {
                try {
                    this.audio.init();
                    setTimeout(() => {
                        this.audio.playValinorAmbience();
                        this.currentMusicState = 'exploration';
                        console.log('🎵 Áudio iniciado com sucesso');
                    }, 100);
                    this.audioInitialized = true;
                } catch (e) {
                    console.error('❌ Erro ao iniciar áudio:', e);
                }
            }
            window.removeEventListener('click', initAudioOnClick);
            window.removeEventListener('keydown', initAudioOnClick);
        };
        
        window.addEventListener('click', initAudioOnClick);
        window.addEventListener('keydown', initAudioOnClick);
        
        // Inicia o game loop
        this.running = true;
        this.gameLoop = new GameLoop(this);
        this.gameLoop.start();
        
        console.log('✅ Jogo iniciado com sucesso!');
        console.log('🔊 Clique na tela para ativar o áudio.');
        console.log('🗺️ Vá até o lado direito do mapa para encontrar o portal.');
    }
    
    // ✅ NOVO: Função simples de troca de mapa
        loadMap(mapId, spawnX = null, spawnY = null) {
        console.log(`🗺️ Carregando mapa: ${mapId}`);
        
        this.currentMapId = mapId;
        
        this.pickups = [];
        this.enemies = [];
        this.corruptedShadows = []; // ✅ Limpa sombras
        
        if (mapId === 'aule_workshop') {
            this.tileMap = new TileMap(32);
            this.setupWorkshopEntities();
        } else if (mapId === 'valinor_gardens') {
            this.tileMap = this.createGardensMap();
            this.setupGardensEntities();
        }
        
        if (spawnX !== null && spawnY !== null) {
            this.player.x = spawnX;
            this.player.y = spawnY;
        }
        
        this.minimap.initFogOfWar();

        console.log(`✅ Mapa carregado: ${this.getMapName()}`);
    }
    
    getMapName() {
        const names = {
            'aule_workshop': 'Oficina de Aulë',
            'valinor_gardens': 'Jardins de Valinor'
        };
        return names[this.currentMapId] || 'Desconhecido';
    }
    
    // Configura entidades da oficina
        setupWorkshopEntities() {
        // Forja
        this.forge = new ForgeObject(31 * 32, 5 * 32);
        
        // ✅ NOVO: Adicionar portal de saída no lado direito do mapa
        // O portal fica na coordenada (38, 12) — lado direito, meio vertical
        if (!this.tileMap.decorations) {
            this.tileMap.decorations = [];
        }
        this.tileMap.decorations.push({
            type: 'portal',
            x: 38 * 32,
            y: 11 * 32
        });
        
        // Bonecos de treino
        const dummyPositions = [
            { x: 10 * 32, y: 10 * 32 },
            { x: 15 * 32, y: 15 * 32 },
            { x: 20 * 32, y: 20 * 32 }
        ];
        for (const pos of dummyPositions) {
            if (!this.tileMap.isSolid(pos.x + 16, pos.y + 20)) {
                this.enemies.push(new TrainingDummy(pos.x, pos.y));
            }
        }

                // ✅ NOVO: Bonecos de treino com fraquezas variadas
        const dummyConfigs = [
            { x: 10 * 32, y: 10 * 32, weakness: 'fire' },
            { x: 15 * 32, y: 15 * 32, weakness: 'ice' },
            { x: 20 * 32, y: 20 * 32, weakness: null } // Neutro
        ];
        
        for (const config of dummyConfigs) {
            if (!this.tileMap.isSolid(config.x + 16, config.y + 20)) {
                this.enemies.push(new TrainingDummy(config.x, config.y, config.weakness));
            }
        }
        
        // Aulë (só se ainda não existe)
        if (!this.npcs.find(n => n.name === 'Aulë')) {
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
                    { speaker: 'Aulë', text: 'Ah, e não esqueça dos bonecos de treino! Use ESPAÇO para atacar.' },
                    { speaker: 'Aulë', text: 'E Mairon... os Jardins de Valinor estão além do portal dourado a leste. Um lugar de paz.' }
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
            };
            
            const aule = new NPC(auleX, auleY, 'Aulë', auleDialogue, onAuleDialogueEnd);
            this.npcs.push(aule);
        }
        
        if (this.questStarted && !this.pickupsSpawned) {
            this.spawnPickups();
            this.pickupsSpawned = true;
        }
    }
    
    // ✅ NOVO: Cria o mapa dos Jardins
    createGardensMap() {
        const width = 50;
        const height = 30;
        const tiles = [];
        
        for (let y = 0; y < height; y++) {
            const row = [];
            for (let x = 0; x < width; x++) {
                // Bordas = árvores
                if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
                    row.push('tree');
                }
                // Caminho principal horizontal
                else if (y >= 13 && y <= 15) {
                    row.push('garden_path');
                }
                // Lago central
                else if (x >= 22 && x <= 28 && y >= 18 && y <= 23) {
                    row.push('water');
                }
                // Área de flores (norte)
                else if (x > 5 && x < 18 && y > 3 && y < 10) {
                    row.push('flower_grass');
                }
                // Resto = grama
                else {
                    row.push('grass');
                }
            }
            tiles.push(row);
        }
        
        // Decorações
        const decorations = [];
        
        // Árvores espalhadas
        const treePositions = [
            { x: 3 * 32, y: 3 * 32 },
            { x: 8 * 32, y: 5 * 32 },
            { x: 15 * 32, y: 2 * 32 },
            { x: 35 * 32, y: 4 * 32 },
            { x: 42 * 32, y: 7 * 32 },
            { x: 5 * 32, y: 22 * 32 },
            { x: 12 * 32, y: 25 * 32 },
            { x: 38 * 32, y: 22 * 32 },
            { x: 45 * 32, y: 20 * 32 },
            { x: 30 * 32, y: 26 * 32 }
        ];
        for (const pos of treePositions) {
            decorations.push({ type: 'tree', x: pos.x, y: pos.y });
        }
        
        // Flores na área norte
        for (let i = 0; i < 25; i++) {
            decorations.push({
                type: 'flower',
                x: (6 + Math.random() * 11) * 32,
                y: (4 + Math.random() * 5) * 32,
                colorIndex: i % 4
            });
        }
        
        // Fonte no centro
        decorations.push({ type: 'fountain', x: 24 * 32, y: 19 * 32 });
        
        // Estátuas
        decorations.push({ type: 'statue', x: 33 * 32, y: 10 * 32 });
        decorations.push({ type: 'statue', x: 40 * 32, y: 10 * 32 });
        
        // Portal de volta (lado esquerdo)
        decorations.push({ type: 'portal', x: 0, y: 14 * 32 });
        
        return new TileMap(32, tiles, width, height, decorations);
    }
    
         setupGardensEntities() {
        this.forge = null;
        
        // Celebrimbor (código existente)
        const celebrimborX = 25 * 32;
        const celebrimborY = 10 * 32;
        const celebrimbor = new Celebrimbor(celebrimborX, celebrimborY);
        this.npcs.push(celebrimbor);
        
        // Cristais (código existente)
        const crystalPositions = [
            { x: 22 * 32, y: 17 * 32 },
            { x: 26 * 32, y: 19 * 32 },
            { x: 24 * 32, y: 21 * 32 }
        ];
        
        for (const pos of crystalPositions) {
            if (!this.tileMap.isSolid(pos.x + 12, pos.y + 12)) {
                this.pickups.push(new CrystalPickup(pos.x, pos.y));
            }
        }
        
        // ✅ NOVO: Sombras Corrompidas nos jardins (influência de Melkor)
        this.spawnCorruptedShadows();
    }
    
    // ✅ NOVO: Spawn das sombras nos jardins
    spawnCorruptedShadows() {
        this.corruptedShadows = [];
        
        // Sombra 1: patrulha na área norte (flores)
        const shadow1 = new CorruptedShadow(10 * 32, 6 * 32, [
            { x: 10 * 32, y: 6 * 32 },
            { x: 14 * 32, y: 6 * 32 },
            { x: 14 * 32, y: 8 * 32 },
            { x: 10 * 32, y: 8 * 32 }
        ]);
        this.corruptedShadows.push(shadow1);
        
        // Sombra 2: patrulha na área sul (estátuas)
        const shadow2 = new CorruptedShadow(38 * 32, 24 * 32, [
            { x: 38 * 32, y: 24 * 32 },
            { x: 42 * 32, y: 24 * 32 },
            { x: 42 * 32, y: 26 * 32 },
            { x: 38 * 32, y: 26 * 32 }
        ]);
        this.corruptedShadows.push(shadow2);
        
        // Sombra 3: patrulha perto do lago
        const shadow3 = new CorruptedShadow(30 * 32, 18 * 32, [
            { x: 30 * 32, y: 18 * 32 },
            { x: 30 * 32, y: 22 * 32 }
        ]);
        this.corruptedShadows.push(shadow3);
        
        console.log(`👤 ${this.corruptedShadows.length} Sombras Corrompidas spawnadas`);
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
    
    // ✅ NOVO: Troca de mapa com fade
    changeMap(targetMapId, spawnX, spawnY) {
        if (this.transitioning) return;
        
        console.log(`🗺️ Indo para: ${targetMapId}`);
        this.transitioning = true;
        this.transitionAlpha = 0;
        
        // Fase 1: fade to black
        const fadeOut = () => {
            this.transitionAlpha += 0.05;
            if (this.transitionAlpha >= 1) {
                this.transitionAlpha = 1;
                // Troca o mapa
                this.loadMap(targetMapId, spawnX, spawnY);
                // Fase 2: fade from black
                setTimeout(fadeIn, 300);
            } else {
                requestAnimationFrame(fadeOut);
            }
        };
        
        const fadeIn = () => {
            this.transitionAlpha -= 0.05;
            if (this.transitionAlpha <= 0) {
                this.transitionAlpha = 0;
                this.transitioning = false;
            } else {
                requestAnimationFrame(fadeIn);
            }
        };
        
        fadeOut();
    }
    
        update(deltaTime) {
        this.input.update();

        // === TECLA M (mute) ===
        const mPressed = this.input.isKeyDown('m');
        if (mPressed && this.mKeyReleased) {
            this.audio.toggleMute();
            this.mKeyReleased = false;
        } else if (!mPressed) {
            this.mKeyReleased = true;
        }

        // === TECLA F5 (save manual) ===
        const f5Pressed = this.input.isKeyDown('f5');
        if (f5Pressed && this.f5KeyReleased) {
            this.saveManager.save(this);
            this.f5KeyReleased = false;
        } else if (!f5Pressed) {
            this.f5KeyReleased = true;
        }

        // === TECLA F9 (menu save/load) ===
        const f9Pressed = this.input.isKeyDown('f9');
        if (f9Pressed && this.f9KeyReleased && !this.dialogueSystem.active && !this.craftingSystem.active) {
            this.saveLoadUI.show();
            this.f9KeyReleased = false;
        } else if (!f9Pressed) {
            this.f9KeyReleased = true;
        }

        // === TECLA I (inventário) ===
        const iPressed = this.input.isKeyDown('i');
        if (iPressed && this.iKeyReleased && !this.dialogueSystem.active && !this.craftingSystem.active) {
            this.inventoryUI.toggle();
            this.iKeyReleased = false;
        } else if (!iPressed) {
            this.iKeyReleased = true;
        }

                // === TECLA K (árvore de habilidades) ===
        const kPressed = this.input.isKeyDown('k');
        if (kPressed && this.kKeyReleased && !this.dialogueSystem.active && !this.craftingSystem.active) {
            this.skillTree.toggle();
            this.kKeyReleased = false;
        } else if (!kPressed) {
            this.kKeyReleased = true;
        }

                // === DEBUG: Ctrl+1 a Ctrl+5 para testar corrupção ===
        if (this.input.isKeyDown('1') && (this.input.keys['control'] || this.input.keys['ctrl'])) {
            if (this.debugKeyReleased) {
                this.corruption.setCorruption(20);
                this.debugKeyReleased = false;
            }
        } else if (this.input.isKeyDown('2') && (this.input.keys['control'] || this.input.keys['ctrl'])) {
            if (this.debugKeyReleased) {
                this.corruption.setCorruption(40);
                this.debugKeyReleased = false;
            }
        } else if (this.input.isKeyDown('3') && (this.input.keys['control'] || this.input.keys['ctrl'])) {
            if (this.debugKeyReleased) {
                this.corruption.setCorruption(60);
                this.debugKeyReleased = false;
            }
        } else if (this.input.isKeyDown('4') && (this.input.keys['control'] || this.input.keys['ctrl'])) {
            if (this.debugKeyReleased) {
                this.corruption.setCorruption(80);
                this.debugKeyReleased = false;
            }
        } else if (this.input.isKeyDown('5') && (this.input.keys['control'] || this.input.keys['ctrl'])) {
            if (this.debugKeyReleased) {
                this.corruption.setCorruption(100);
                this.debugKeyReleased = false;
            }
        } else if (this.input.isKeyDown('0') && (this.input.keys['control'] || this.input.keys['ctrl'])) {
            if (this.debugKeyReleased) {
                this.corruption.setCorruption(0);
                this.debugKeyReleased = false;
            }
        } else if (!this.input.isKeyDown('1') && !this.input.isKeyDown('2') && 
                   !this.input.isKeyDown('3') && !this.input.isKeyDown('4') && 
                   !this.input.isKeyDown('5') && !this.input.isKeyDown('0')) {
            this.debugKeyReleased = true;
        }

        // === Pausas de interface ===
        if (this.saveLoadUI.active) return;
        if (this.inventoryUI.active) return;
        if (this.skillTree.active) return;

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

        // === Transição de mapa (usa this.transitioning, NAO mapManager) ===
        if (!this.transitioning) {
            this.checkMapTransition();
        }

        // === Atualiza jogador ===
        this.player.update(deltaTime, this.input, this.tileMap);

        // === Ataque (1 hit por ataque) ===
        if (this.player.attacking && this.player.attackHitbox && !this.player.attackHitProcessed) {
            this.player.attackHitProcessed = true;
            this.audio.playAttack();
            this.checkAttackHits();
        }

        // === NPCs ===
        for (const npc of this.npcs) {
            const result = npc.update(this.player, this.input);
            if (result && result.type === 'dialogue') {
                this.dialogueSystem.start(result.npc);
            }
        }

        // === Forja ===
        if (this.forge) {
            const result = this.forge.update(this.player, this.input);
            if (result && result.type === 'open_forge') {
                this.craftingSystem.open();
                this.forgeUI.show();
            }
        }

        // === Pickups ===
        for (const pickup of this.pickups) {
            const result = pickup.update(deltaTime, this.player);
            if (result && result.type === 'collected') {
                this.inventory.add(result.item);
                this.audio.playCollect();
                
                // ✅ Partículas de coleta
                const color = this.inventory.getItemColor(result.item);
                this.particles.emitCollect(
                    pickup.x + pickup.width / 2,
                    pickup.y + pickup.height / 2,
                    color
                );
            }
        }

        // === Bonecos de treino (estáticos) — passa tileMap ===
        for (const enemy of this.enemies) {
            enemy.update(deltaTime, this.player, this.tileMap);
        }

        // === Sombras Corrompidas (com IA) — passa tileMap ===
        for (const shadow of this.corruptedShadows) {
            shadow.update(deltaTime, this.player, this.tileMap);
        }

        // === Passos ===
        const movement = this.input.getMovement();
        const isMoving = movement.dx !== 0 || movement.dy !== 0;
        if (isMoving) {
            this.footstepTimer -= deltaTime;
            if (this.footstepTimer <= 0) {
                this.audio.playFootstep();
                this.footstepTimer = this.footstepInterval;
            }
        } else {
            this.footstepTimer = 0;
        }

        // === Sistemas ===
        this.inventory.update(deltaTime);
        this.questSystem.update();
        this.craftingSystem.update(deltaTime);
        this.damageNumbers.update(deltaTime);
                // === Partículas ===
        this.particles.update(deltaTime);
        
        // ✅ NOVO: Rastro do jogador ao andar
        if (isMoving && !this.player.attacking) {
            this.footstepParticleTimer -= deltaTime;
            if (this.footstepParticleTimer <= 0) {
                this.particles.emitFootstep(
                    this.player.x + this.player.width / 2,
                    this.player.y + this.player.height / 2,
                    this.player.direction
                );
                this.footstepParticleTimer = 0.15;
            }
        } else {
            this.footstepParticleTimer = 0;
        }
        
        // ✅ NOVO: Aura de corrupção (emite partículas ao redor do jogador)
        const corruptionIntensity = this.corruption.getCorruptionPercent();
        if (corruptionIntensity > 0.2) {
            this.particles.emitCorruptionAura(
                this.player.x + this.player.width / 2,
                this.player.y + this.player.height / 2,
                corruptionIntensity
            );
        }
        this.saveManager.update(deltaTime);

        this.updateCamera();

        this.minimap.update(deltaTime);
    }
    
    // ✅ NOVO: Verifica se o jogador está em um portal
    checkMapTransition() {
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        
        if (this.currentMapId === 'aule_workshop') {
            // Portal no lado direito da oficina
            if (px > 38 * 32 && py > 11 * 32 && py < 14 * 32) {
                if (this.input.isKeyDown('enter') && this.enterKeyReleased) {
                    this.enterKeyReleased = false;
                    // Vai para jardins, spawn no lado esquerdo
                    this.changeMap('valinor_gardens', 2 * 32, 14 * 32);
                }
            }
        } else if (this.currentMapId === 'valinor_gardens') {
            // Portal no lado esquerdo dos jardins
            if (px < 2 * 32 && py > 13 * 32 && py < 16 * 32) {
                if (this.input.isKeyDown('enter') && this.enterKeyReleased) {
                    this.enterKeyReleased = false;
                    // Volta para oficina, spawn no lado direito
                    this.changeMap('aule_workshop', 37 * 32, 12 * 32);
                }
            }
        }
        
        if (!this.input.isKeyDown('enter')) {
            this.enterKeyReleased = true;
        }
    }
    
         checkAttackHits() {
        const ah = this.player.attackHitbox;
        let damage = this.player.getAttackDamage();
        
        // ✅ NOVO: Obtém o tipo de dano da arma equipada
        let damageType = 'physical';
        if (this.equipment) {
            const weapon = this.equipment.getEquippedWeapon();
            if (weapon && weapon.damageType) {
                damageType = weapon.damageType;
            }
        }
        
        // Bônus de dano da árvore
        const bonuses = this.skillTree.getBonuses();
        damage = Math.floor(damage * (1 + (bonuses.damageBonus || 0)));
        
        // Bônus de dano sombreado (só se tipo for shadow)
        if (damageType === 'shadow') {
            damage += this.corruption.getShadowDamageBonus();
        }
        
        // Crítico
        let isCritical = false;
        if (bonuses.critChance && Math.random() < bonuses.critChance) {
            damage = Math.floor(damage * (bonuses.critMultiplier || 2));
            isCritical = true;
        }
        
        // Bonecos de treino
        for (const enemy of this.enemies) {
            if (!enemy.alive) continue;
            
            if (this.boxCollision(ah, { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height })) {
                const result = enemy.takeDamage(damage, damageType);
                this.audio.playHit();
                
                // Partículas de impacto
                this.particles.emitImpact(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    isCritical
                );
                
                // Número de dano colorido pelo tipo
                const color = DAMAGE_TYPE_COLORS[damageType] || '#ffeb3b';
                this.damageNumbers.add(
                    enemy.x + enemy.width / 2,
                    enemy.y,
                    result.damage,
                    color,
                    isCritical
                );
                
                if (result.died) {
                    this.particles.emitExplosion(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2,
                        enemy instanceof CorruptedShadow ? '#aa22aa' : '#ff6600'
                    );
                    this.corruption.onEnemyKilled(enemy);
                    this.gainXP(result.xp);
                }
            }
        }
        
        // Sombras corrompidas
        for (const shadow of this.corruptedShadows) {
            if (!shadow.alive) continue;
            
            if (this.boxCollision(ah, { x: shadow.x, y: shadow.y, width: shadow.width, height: shadow.height })) {
                const result = shadow.takeDamage(damage, damageType);
                this.audio.playHit();
                
                this.particles.emitImpact(
                    shadow.x + shadow.width / 2,
                    shadow.y + shadow.height / 2,
                    isCritical
                );
                
                const color = DAMAGE_TYPE_COLORS[damageType] || '#ffeb3b';
                this.damageNumbers.add(
                    shadow.x + shadow.width / 2,
                    shadow.y,
                    result.damage,
                    color,
                    isCritical
                );
                
                // Drenar vida
                const lifeSteal = this.corruption.getLifeStealPercent();
                if (lifeSteal > 0 && result.damage > 0) {
                    const heal = Math.floor(result.damage * lifeSteal);
                    this.player.heal(heal);
                }
                
                if (result.died) {
                    this.particles.emitExplosion(
                        shadow.x + shadow.width / 2,
                        shadow.y + shadow.height / 2,
                        '#aa22aa'
                    );
                    this.corruption.onEnemyKilled(shadow);
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
        // Aplica bônus de XP da árvore de habilidades
        const bonuses = this.skillTree.getBonuses();
        const xpBonus = bonuses.xpBonus || 0;
        const finalAmount = Math.floor(amount * (1 + xpBonus));
        
        this.playerXP += finalAmount;
        console.log(`✨ +${finalAmount} XP${xpBonus > 0 ? ` (+${Math.round(xpBonus * 100)}% bônus)` : ''} (Total: ${this.playerXP}/${this.xpToNextLevel})`);
        
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
                // ✅ Partículas de level up
        this.particles.emitLevelUp(
            this.player.x + this.player.width / 2,
            this.player.y
        );
        console.log(`🎉 LEVEL UP! Nível ${this.playerLevel}`);
                // ✅ NOVO: Ganha 1 ponto de habilidade ao subir de nível
        this.skillTree.addSkillPoints(1);
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
        
        // ✅ NOVO: Renderiza sombras corrompidas
        for (const shadow of this.corruptedShadows) {
            shadow.render(this.ctx, this.camera);
        }
        
        if (this.forge) {
            this.forge.render(this.ctx, this.camera);
        }
        
        for (const npc of this.npcs) {
            npc.render(this.ctx, this.camera);
        }
        
        this.player.render(this.ctx, this.camera);
        
        this.damageNumbers.render(this.ctx, this.camera);

                // === Partículas ===
        this.particles.render(this.ctx, this.camera);
        
        this.inventory.render(this.ctx, this.canvas);
        this.questSystem.render(this.ctx, this.canvas);
        this.craftingSystem.render(this.ctx, this.canvas);
        this.equipment.render(this.ctx, this.canvas);
        this.renderPlayerHUD();
        
        this.renderMapName();
        this.renderPortalHint();

                // === Indicador de pontos de habilidade ===
        if (this.skillTree.skillPoints > 0 && !this.skillTree.active) {
            this.renderSkillPointsNotification();
        }
        
        this.dialogueSystem.render(this.ctx, this.canvas);
        
        if (this.transitioning) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }

        this.minimap.render(this.ctx);
    }
    
    // ✅ NOVO: Mostra nome do mapa no topo
    renderMapName() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(this.canvas.width / 2 - 120, 10, 240, 30);
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.canvas.width / 2 - 120, 10, 240, 30);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.getMapName(), this.canvas.width / 2, 30);
    }
    
    // ✅ NOVO: Dica de portal quando o jogador está perto
    renderPortalHint() {
        if (this.transitioning) return;
        
        const px = this.player.x + this.player.width / 2;
        const py = this.player.y + this.player.height / 2;
        let nearPortal = false;
        
        if (this.currentMapId === 'aule_workshop') {
            if (px > 36 * 32 && py > 10 * 32 && py < 15 * 32) nearPortal = true;
        } else if (this.currentMapId === 'valinor_gardens') {
            if (px < 4 * 32 && py > 12 * 32 && py < 17 * 32) nearPortal = true;
        }
        
        if (nearPortal) {
            const ctx = this.ctx;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(this.canvas.width / 2 - 150, this.canvas.height - 80, 300, 40);
            
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.canvas.width / 2 - 150, this.canvas.height - 80, 300, 40);
            
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[ENTER] para atravessar o portal', this.canvas.width / 2, this.canvas.height - 55);
        }
    }
    
    renderPlayerHUD() {
        const startX = 20;
        const startY = this.canvas.height - 130;
        const ctx = this.ctx;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY, 220, 82); // Espaço extra para barras de corrupção e stamina
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, 220, 82);
        
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
    
                // === Barra de Corrupção ===
        const corruptionBarY = xpBarY + 12;
        const corruptionBarHeight = 6;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, corruptionBarY, barWidth, corruptionBarHeight);
        
        const corruptionPercent = this.corruption.getCorruptionPercent();
        
        // Gradiente de cor baseado na corrupção
        let corruptionColor;
        if (corruptionPercent < 0.4) corruptionColor = '#8b4a8b';
        else if (corruptionPercent < 0.7) corruptionColor = '#5a2a6a';
        else corruptionColor = '#ff3333';
        
        ctx.fillStyle = corruptionColor;
        ctx.fillRect(barX, corruptionBarY, barWidth * corruptionPercent, corruptionBarHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(barX, corruptionBarY, barWidth, corruptionBarHeight);
        
        const tier = this.corruption.getCurrentTier();
        ctx.fillStyle = tier.color;
        ctx.font = 'bold 8px Arial';
        ctx.fillText(`🌑 ${tier.name} (${Math.round(this.corruption.value)}%)`, barX + barWidth / 2, corruptionBarY + 5);
   
                // === Barra de Stamina ===
        const staminaBarY = corruptionBarY + 10;
        const staminaBarHeight = 6;
        
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(barX, staminaBarY, barWidth, staminaBarHeight);
        
        const staminaPercent = this.player.stamina / this.player.maxStamina;
        const staminaColor = this.player.dashing ? '#ffaa00' : 
                             (this.player.stamina < this.player.staminaCost ? '#ff6666' : '#4ade80');
        
        ctx.fillStyle = staminaColor;
        ctx.fillRect(barX, staminaBarY, barWidth * staminaPercent, staminaBarHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(barX, staminaBarY, barWidth, staminaBarHeight);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 8px Arial';
        ctx.fillText(`⚡ ${Math.floor(this.player.stamina)}/${this.player.maxStamina}`, barX + barWidth / 2, staminaBarY + 5);
    }
        renderSkillPointsNotification() {
        const ctx = this.ctx;
        const pulse = Math.sin(Date.now() / 300) * 0.2 + 0.8;
        
        ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.3})`;
        ctx.fillRect(this.canvas.width / 2 - 140, 90, 280, 30);
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.canvas.width / 2 - 140, 90, 280, 30);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`🌟 ${this.skillTree.skillPoints} ponto(s) disponível(is) — Pressione K`, this.canvas.width / 2, 70);
    }
}