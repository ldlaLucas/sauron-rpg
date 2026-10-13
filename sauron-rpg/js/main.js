window.addEventListener('load', () => {
    const game = new Game();
    window.game = game;
    game.init();
    
    // ✅ Botão de ativar áudio (sem depender de unlock())
    const audioBtn = document.getElementById('audio-toggle');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            console.log('🖱️ Botão de áudio clicado');
            
            // ✅ Chama diretamente os métodos que existem
            try {
                game.audio.init();
                setTimeout(() => {
                    game.audio.playValinorAmbience();
                    game.currentMusicState = 'exploration';
                    console.log('🎵 Áudio iniciado com sucesso');
                }, 100);
            } catch (e) {
                console.error('❌ Erro ao iniciar áudio:', e);
            }
            
            // Atualiza o botão
            audioBtn.textContent = '🔊 Áudio Ativado';
            audioBtn.style.background = 'rgba(74, 222, 128, 0.3)';
            audioBtn.style.borderColor = '#4ade80';
            audioBtn.style.color = '#4ade80';
            
            // Remove o botão após 3 segundos
            setTimeout(() => {
                audioBtn.style.opacity = '0';
                audioBtn.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    audioBtn.style.display = 'none';
                }, 500);
            }, 3000);
        });
    }
});