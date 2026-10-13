window.addEventListener('load', () => {
    console.log('🎮 Sauron RPG - Carregando...');
    
    const game = new Game();
    window.game = game;
    
    // Inicializa o jogo (mas NÃO inicia o loop ainda)
    game.initMainMenu();
    
    // Menu Principal
    const mainMenu = new MainMenuUI(game);
    game.mainMenu = mainMenu;
    
    // Mostra o menu principal
    mainMenu.show();
    
    // Botão de áudio (agora aparece só quando necessário)
    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            console.log('🖱️ Botão de áudio clicado');
            
            try {
                game.audio.init();
                setTimeout(() => {
                    game.audio.playValinorAmbience();
                    game.currentMusicState = 'exploration';
                    console.log('🎵 Áudio iniciado com sucesso');
                }, 100);
                game.audioInitialized = true;
            } catch (e) {
                console.error('❌ Erro ao iniciar áudio:', e);
            }
            
            audioBtn.style.display = 'none';
        });
    }
    
    // Atualiza valores dos sliders em tempo real
    const masterVolume = document.getElementById('master-volume');
    const musicVolume = document.getElementById('music-volume');
    const sfxVolume = document.getElementById('sfx-volume');
    const masterValue = document.getElementById('master-value');
    const musicValue = document.getElementById('music-value');
    const sfxValue = document.getElementById('sfx-value');
    
    if (masterVolume && masterValue) {
        masterVolume.addEventListener('input', (e) => {
            masterValue.textContent = e.target.value;
        });
    }
    
    if (musicVolume && musicValue) {
        musicVolume.addEventListener('input', (e) => {
            musicValue.textContent = e.target.value;
        });
    }
    
    if (sfxVolume && sfxValue) {
        sfxVolume.addEventListener('input', (e) => {
            sfxValue.textContent = e.target.value;
        });
    }
    
    console.log('✅ Menu principal carregado');
});