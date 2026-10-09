class AudioManager {
    constructor() {
        this.audioContext = null;
        this.masterVolume = 0.5;
        this.musicVolume = 0.3;
        this.sfxVolume = 0.6;
        this.muted = false;
        
        this.currentMusic = null;
        this.musicNodes = [];
        
        this.initialized = false;
        
        console.log('🔊 AudioManager criado');
    }
    
    // Inicializa o contexto de áudio (precisa ser chamado após interação do usuário)
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.masterVolume;
            this.masterGain.connect(this.audioContext.destination);
            
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.musicVolume;
            this.musicGain.connect(this.masterGain);
            
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.sfxVolume;
            this.sfxGain.connect(this.masterGain);
            
            this.initialized = true;
            console.log('✅ AudioManager inicializado');
        } catch (error) {
            console.error('❌ Erro ao inicializar áudio:', error);
        }
    }
    
    // ============================================
    // MÚSICA AMBIENTE (PROCEDURAL)
    // ============================================
    
    playValinorAmbience() {
        if (!this.initialized) this.init();
        this.stopMusic();
        
        console.log('🎵 Tocando ambientação de Valinor');
        
        // Criar uma ambientação etérea com acordes suaves
        const playChord = () => {
            if (!this.currentMusic) return;
            
            // Acorde em Dó maior (C, E, G) - soa sereno e luminoso
            const notes = [261.63, 329.63, 392.00]; // C4, E4, G4
            
            notes.forEach((freq, i) => {
                const osc = this.audioContext.createOscillator();
                const gain = this.audioContext.createGain();
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                // Fade in suave
                gain.gain.setValueAtTime(0, this.audioContext.currentTime);
                gain.gain.linearRampToValueAtTime(0.08, this.audioContext.currentTime + 2);
                gain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 6);
                
                osc.connect(gain);
                gain.connect(this.musicGain);
                
                osc.start(this.audioContext.currentTime + i * 0.1);
                osc.stop(this.audioContext.currentTime + 6);
                
                this.musicNodes.push(osc);
            });
        };
        
        this.currentMusic = { active: true };
        playChord();
        
        // Repetir a cada 5 segundos
        this.musicInterval = setInterval(() => {
            if (this.currentMusic && this.currentMusic.active) {
                playChord();
            }
        }, 5000);
    }
    
    playCombatMusic() {
        if (!this.initialized) this.init();
        this.stopMusic();
        
        console.log('🎵 Tocando música de combate');
        
        const playBeat = () => {
            if (!this.currentMusic) return;
            
            // Tambor grave
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(80, this.audioContext.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + 0.3);
            
            gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.musicGain);
            
            osc.start();
            osc.stop(this.audioContext.currentTime + 0.3);
            
            this.musicNodes.push(osc);
        };
        
        this.currentMusic = { active: true };
        playBeat();
        
        // Batida rítmica
        this.musicInterval = setInterval(() => {
            if (this.currentMusic && this.currentMusic.active) {
                playBeat();
            }
        }, 800);
    }
    
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.active = false;
            this.currentMusic = null;
        }
        
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
        
        this.musicNodes.forEach(node => {
            try { node.stop(); } catch (e) {}
        });
        this.musicNodes = [];
    }
    
    // ============================================
    // EFEITOS SONOROS (SFX)
    // ============================================
    
    // Som de passo (curto e sutil)
    playFootstep() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'triangle';
        osc.frequency.value = 100 + Math.random() * 50;
        
        gain.gain.setValueAtTime(0.05, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.1);
    }
    
    // Som de ataque (corte de espada)
    playAttack() {
        if (!this.initialized) return;
        
        // Ruído branco filtrado (som de corte)
        const bufferSize = this.audioContext.sampleRate * 0.15;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 2);
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);
        
        noise.start();
    }
    
    // Som de impacto (quando atinge inimigo)
    playHit() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.2);
    }
    
    // Som de coleta de item
    playCollect() {
        if (!this.initialized) return;
        
        // Dois tons ascendentes (som "plim")
        const playTone = (freq, delay) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime + delay);
            gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delay + 0.15);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(this.audioContext.currentTime + delay);
            osc.stop(this.audioContext.currentTime + delay + 0.15);
        };
        
        playTone(880, 0);      // A5
        playTone(1320, 0.08);  // E6
    }
    
    // Som de forja (martelada)
    playForge() {
        if (!this.initialized) return;
        
        // Som metálico
        const osc = this.audioContext.createOscillator();
        const osc2 = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.value = 400;
        
        osc2.type = 'sawtooth';
        osc2.frequency.value = 800;
        
        gain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
        
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc2.start();
        osc.stop(this.audioContext.currentTime + 0.3);
        osc2.stop(this.audioContext.currentTime + 0.3);
    }
    
    // Som de level up (fanfarra curta)
    playLevelUp() {
        if (!this.initialized) return;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const delays = [0, 0.1, 0.2, 0.3];
        
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime + delays[i]);
            gain.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + delays[i] + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + delays[i] + 0.3);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(this.audioContext.currentTime + delays[i]);
            osc.stop(this.audioContext.currentTime + delays[i] + 0.3);
        });
    }
    
    // Som de diálogo (blip curto)
    playDialogueBlip() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.value = 400 + Math.random() * 200;
        
        gain.gain.setValueAtTime(0.08, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.05);
    }
    
    // Som de UI (clique de menu)
    playUIClick() {
        if (!this.initialized) return;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.value = 600;
        
        gain.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08);
        
        osc.connect(gain);
        gain.connect(this.sfxGain);
        
        osc.start();
        osc.stop(this.audioContext.currentTime + 0.08);
    }
    
    // Som de save (tom suave e confiável)
    playSave() {
        if (!this.initialized) return;
        
        const notes = [659.25, 783.99]; // E5, G5
        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();
            
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            gain.gain.setValueAtTime(0, this.audioContext.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + i * 0.1 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + i * 0.1 + 0.2);
            
            osc.connect(gain);
            gain.connect(this.sfxGain);
            
            osc.start(this.audioContext.currentTime + i * 0.1);
            osc.stop(this.audioContext.currentTime + i * 0.1 + 0.2);
        });
    }
    
    // ============================================
    // CONTROLES
    // ============================================
    
    setMasterVolume(value) {
        this.masterVolume = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
    }
    
    setMusicVolume(value) {
        this.musicVolume = Math.max(0, Math.min(1, value));
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
    }
    
    setSfxVolume(value) {
        this.sfxVolume = Math.max(0, Math.min(1, value));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }
    
    toggleMute() {
        this.muted = !this.muted;
        if (this.masterGain) {
            this.masterGain.gain.value = this.muted ? 0 : this.masterVolume;
        }
        console.log(this.muted ? '🔇 Áudio mutado' : '🔊 Áudio ativado');
    }
}