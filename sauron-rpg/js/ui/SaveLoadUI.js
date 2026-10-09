class SaveLoadUI {
    constructor(saveManager, game) {
        console.log('🔧 Inicializando SaveLoadUI...');
        
        this.saveManager = saveManager;
        this.game = game;
        this.container = document.getElementById('save-load-ui');
        this.saveBtn = document.getElementById('save-btn');
        this.loadBtn = document.getElementById('load-btn');
        this.closeBtn = document.getElementById('save-load-close');
        this.saveInfo = document.getElementById('save-info');
        this.active = false;
        
        // Verificar se elementos foram encontrados
        if (!this.container) {
            console.error('❌ Elemento #save-load-ui não encontrado!');
            return;
        }
        if (!this.saveBtn) {
            console.error('❌ Elemento #save-btn não encontrado!');
            return;
        }
        if (!this.loadBtn) {
            console.error('❌ Elemento #load-btn não encontrado!');
            return;
        }
        if (!this.closeBtn) {
            console.error('❌ Elemento #save-load-close não encontrado!');
            return;
        }
        if (!this.saveInfo) {
            console.error('❌ Elemento #save-info não encontrado!');
            return;
        }
        
        console.log('✅ Todos os elementos HTML encontrados');
        
        this.saveBtn.addEventListener('click', () => {
            console.log('🖱️ Botão SALVAR clicado');
            this.save();
        });
        
        this.loadBtn.addEventListener('click', () => {
            console.log('🖱️ Botão CARREGAR clicado');
            this.load();
        });
        
        this.closeBtn.addEventListener('click', () => {
            console.log('🖱️ Botão FECHAR clicado');
            this.hide();
        });
        
        this.updateSaveInfo();
        
        console.log('✅ SaveLoadUI inicializado com sucesso');
    }
    
    show() {
        console.log('📂 Mostrando menu de save/load');
        this.container.style.display = 'flex';
        this.active = true;
        this.updateSaveInfo();
    }
    
    hide() {
        console.log('📂 Fechando menu de save/load');
        this.container.style.display = 'none';
        this.active = false;
    }
    
    save() {
        console.log('💾 Executando save()...');
        if (this.saveManager.save(this.game)) {
            this.showNotification('✅ Jogo salvo!', '#4ade80');
            this.updateSaveInfo();
        } else {
            this.showNotification('❌ Erro ao salvar', '#ef4444');
        }
    }
    
    load() {
        console.log('📂 Executando load()...');
        if (!this.saveManager.hasSave()) {
            this.showNotification('⚠️ Nenhum save encontrado', '#fbbf24');
            return;
        }
        
        if (this.saveManager.load(this.game)) {
            this.showNotification('✅ Jogo carregado!', '#4ade80');
            this.hide();
        } else {
            this.showNotification('❌ Erro ao carregar', '#ef4444');
        }
    }
    
    updateSaveInfo() {
        const info = this.saveManager.getSaveInfo();
        
        if (info) {
            const date = new Date(info.timestamp);
            const dateStr = date.toLocaleString('pt-BR');
            this.saveInfo.innerHTML = `
                <div style="color:#4ade80; margin-bottom:5px;">✅ Save encontrado</div>
                <div style="color:#aaa; font-size:12px;">
                    Nível: ${info.level}<br>
                    Posição: (${Math.round(info.position.x)}, ${Math.round(info.position.y)})<br>
                    Data: ${dateStr}
                </div>
            `;
            this.loadBtn.disabled = false;
        } else {
            this.saveInfo.innerHTML = `
                <div style="color:#888;">Nenhum save encontrado</div>
            `;
            this.loadBtn.disabled = true;
        }
    }
    
    showNotification(text, color) {
        const notif = document.createElement('div');
        notif.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            color: ${color};
            padding: 20px 40px;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            z-index: 1000;
            border: 2px solid ${color};
        `;
        notif.textContent = text;
        
        this.container.appendChild(notif);
        
        setTimeout(() => {
            notif.remove();
        }, 2000);
    }
}