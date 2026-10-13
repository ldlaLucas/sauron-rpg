class MainMenuUI {
    constructor(game) {
        this.game = game;
        this.container = document.getElementById('main-menu-ui');
        this.newGameBtn = document.getElementById('menu-new-game');
        this.continueBtn = document.getElementById('menu-continue');
        this.optionsBtn = document.getElementById('menu-options');
        this.quitBtn = document.getElementById('menu-quit');
        this.optionsPanel = document.getElementById('menu-options-panel');
        this.optionsCloseBtn = document.getElementById('menu-options-close');
        this.musicVolume = document.getElementById('music-volume');
        this.sfxVolume = document.getElementById('sfx-volume');
        this.masterVolume = document.getElementById('master-volume');
        
        this.active = false;
        this.optionsOpen = false;
        
        this.setupListeners();
        this.updateContinueButton();
    }
    
    setupListeners() {
        this.newGameBtn.addEventListener('click', () => {
            if (this.game.audio.initialized) {
                this.game.audio.playUIClick();
            }
            this.startNewGame();
        });
        
        this.continueBtn.addEventListener('click', () => {
            if (this.game.audio.initialized) {
                this.game.audio.playUIClick();
            }
            this.continueGame();
        });
        
        this.optionsBtn.addEventListener('click', () => {
            if (this.game.audio.initialized) {
                this.game.audio.playUIClick();
            }
            this.showOptions();
        });
        
        this.quitBtn.addEventListener('click', () => {
            if (this.game.audio.initialized) {
                this.game.audio.playUIClick();
            }
            this.quitGame();
        });
        
        this.optionsCloseBtn.addEventListener('click', () => {
            if (this.game.audio.initialized) {
                this.game.audio.playUIClick();
            }
            this.hideOptions();
        });
        
        // Sliders de volume
        this.masterVolume.addEventListener('input', (e) => {
            this.game.audio.setMasterVolume(e.target.value / 100);
        });
        
        this.musicVolume.addEventListener('input', (e) => {
            this.game.audio.setMusicVolume(e.target.value / 100);
        });
        
        this.sfxVolume.addEventListener('input', (e) => {
            this.game.audio.setSfxVolume(e.target.value / 100);
        });
    }
    
    show() {
        console.log('📜 Abrindo menu principal');
        this.container.style.display = 'flex';
        this.active = true;
        this.updateContinueButton();
    }
    
    hide() {
        console.log('📜 Fechando menu principal');
        this.container.style.display = 'none';
        this.active = false;
    }
    
    updateContinueButton() {
        const hasSave = this.game.saveManager.hasSave();
        this.continueBtn.disabled = !hasSave;
        
        if (hasSave) {
            const info = this.game.saveManager.getSaveInfo();
            if (info) {
                const date = new Date(info.timestamp);
                const dateStr = date.toLocaleString('pt-BR', { 
                    day: '2-digit', 
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                this.continueBtn.innerHTML = `📂 CONTINUAR<br><span style="font-size:11px; opacity:0.7;">Nv.${info.level} • ${dateStr}</span>`;
            }
        } else {
            this.continueBtn.innerHTML = '📂 CONTINUAR<br><span style="font-size:11px; opacity:0.5;">Nenhum save</span>';
        }
    }
    
    startNewGame() {
        console.log('🆕 Iniciando novo jogo');
        
        // Confirmação se já existe save
        if (this.game.saveManager.hasSave()) {
            if (!confirm('Já existe um save. Deseja iniciar um novo jogo e sobrescrever o save atual?')) {
                return;
            }
            this.game.saveManager.deleteSave();
        }
        
        // Reseta o estado do jogo
        this.resetGameState();
        
        // Esconde o menu
        this.hide();

                // Inicia o game loop
        this.game.startGameLoop();
        
        // Esconde o menu
        this.hide();
        
        // Inicia o áudio se ainda não foi iniciado
        if (!this.game.audioInitialized) {
            this.game.audio.init();
            this.game.audio.playValinorAmbience();
            this.game.currentMusicState = 'exploration';
            this.game.audioInitialized = true;
        }
        
        console.log('✅ Novo jogo iniciado');
    }
    
    continueGame() {
        console.log('📂 Continuando jogo');
        
        if (this.game.saveManager.load(this.game)) {
            this.hide();
            
            // Inicia o áudio se ainda não foi iniciado
            if (!this.game.audioInitialized) {
                this.game.audio.init();
                this.game.audio.playValinorAmbience();
                this.game.currentMusicState = 'exploration';
                this.game.audioInitialized = true;
            }
            
            console.log('✅ Jogo carregado com sucesso');
        } else {
            alert('Erro ao carregar o save.');
        }
        if (this.game.saveManager.load(this.game)) {
            // Inicia o game loop
            this.game.startGameLoop();
            
            this.hide();
        }
    }
    
    resetGameState() {
        // Reseta jogador
        this.game.player.x = 3 * 32;
        this.game.player.y = 20 * 32;
        this.game.player.hp = this.game.player.maxHP;
        this.game.player.direction = 'down';
        this.game.player.baseDamage = 5;
        
        // Reseta inventário e equipamentos
        this.game.inventory.items = {};
        this.game.equipment.slots = { weapon: null, armor: null, accessory: null };
        this.game.equipment.recalculateBonuses();
        
        // Reseta progressão
        this.game.playerLevel = 1;
        this.game.playerXP = 0;
        this.game.xpToNextLevel = 100;
        
        // Reseta missões
        this.game.questSystem.activeQuest = null;
        this.game.questSystem.completedQuests = [];
        
        // Reseta flags
        this.game.pickupsSpawned = false;
        this.game.questStarted = false;
        
        // Reseta NPCs
        this.game.npcs = [];
        
        // Recarrega o mapa inicial
        this.game.loadMap('aule_workshop');
        
        // Recria entidades da oficina
        this.game.setupWorkshopEntities();
        
        console.log('🔄 Estado do jogo resetado');
    }
    
    showOptions() {
        this.optionsPanel.style.display = 'block';
        this.optionsOpen = true;
        
        // Atualiza valores dos sliders
        this.masterVolume.value = this.game.audio.masterVolume * 100;
        this.musicVolume.value = this.game.audio.musicVolume * 100;
        this.sfxVolume.value = this.game.audio.sfxVolume * 100;
    }
    
    hideOptions() {
        this.optionsPanel.style.display = 'none';
        this.optionsOpen = false;
    }
    
    quitGame() {
        if (confirm('Deseja realmente sair do jogo?')) {
            // Salva antes de sair
            this.game.saveManager.save(this.game, true);
            
            // Tenta fechar a janela/aba
            window.close();
            
            // Se não conseguir fechar, mostra mensagem
            setTimeout(() => {
                alert('Você pode fechar esta aba manualmente.');
            }, 100);
        }
    }
}