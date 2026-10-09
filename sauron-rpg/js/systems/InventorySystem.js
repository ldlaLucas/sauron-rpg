class InventorySystem {
    constructor() {
        this.items = {}; // ✅ Agora aceita qualquer item
        this.notifications = [];
    }
    
    add(type, amount = 1) {
        // ✅ Se o item não existe, cria com quantidade 0
        if (this.items[type] === undefined) {
            this.items[type] = 0;
        }
        
        this.items[type] += amount;
        
        this.notifications.push({
            text: `+${amount} ${this.getItemName(type)}`,
            time: 2,
            color: this.getItemColor(type)
        });
        
        console.log(`📦 +${amount} ${this.getItemName(type)} (Total: ${this.items[type]})`);
        
         if (window.game && window.game.audio) {
            window.game.audio.playCollect();
        }
        
        
        return true;
        
    }
    
    has(type, amount = 1) {
        return (this.items[type] || 0) >= amount;
    }
    
    remove(type, amount = 1) {
        if (this.has(type, amount)) {
            this.items[type] -= amount;
            
            // ✅ Se chegou a zero, remove da lista (exceto materiais base)
            if (this.items[type] <= 0 && !['iron', 'wood', 'stone'].includes(type)) {
                delete this.items[type];
            }
            
            console.log(`📦 -${amount} ${this.getItemName(type)} (Total: ${this.items[type] || 0})`);
            return true;
        }
        console.log(`❌ Não foi possível remover ${type} (quantidade insuficiente)`);
        return false;
    }
    
    getItemName(type) {
        // ✅ Nomes de materiais
        const materialNames = {
            'iron': 'Ferro',
            'wood': 'Madeira',
            'stone': 'Pedra'
        };
        
        // ✅ Nomes de equipamentos (vem do EquipmentSystem se disponível)
        const equipmentNames = {
            'apprentice_tool': 'Ferramenta de Aprendiz',
            'iron_sword': 'Espada de Ferro',
            'stone_hammer': 'Martelo de Pedra'
        };
        
        return materialNames[type] || equipmentNames[type] || type;
    }
    
    getItemColor(type) {
        const colors = {
            'iron': '#b0b0b0',
            'wood': '#a0703c',
            'stone': '#9a9a9a',
            'apprentice_tool': '#ffd700',
            'iron_sword': '#d0d0d0',
            'stone_hammer': '#6a6a6a'
        };
        return colors[type] || '#fff';
    }
    
    update(deltaTime) {
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].time -= deltaTime;
            if (this.notifications[i].time <= 0) {
                this.notifications.splice(i, 1);
            }
        }
    }
    
    render(ctx, canvas) {
        // HUD de inventário no canto superior direito
        const startX = canvas.width - 180;
        const startY = 20;
        
        // Conta quantos itens temos
        const itemCount = Object.keys(this.items).filter(k => this.items[k] > 0).length;
        const height = 40 + Math.max(itemCount, 3) * 20;
        
        // Fundo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY, 160, height);
        
        // Borda
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, 160, height);
        
        // Título
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('MATERIAIS', startX + 10, startY + 20);
        
        // Itens
        ctx.font = '13px Arial';
        let itemY = startY + 40;
        
        // Materiais base
        const baseMaterials = ['iron', 'wood', 'stone'];
        for (const mat of baseMaterials) {
            const amount = this.items[mat] || 0;
            ctx.fillStyle = '#fff';
            ctx.fillText(`${this.getItemIcon(mat)} ${this.getItemName(mat)}: ${amount}`, startX + 10, itemY);
            itemY += 20;
        }
        
        // Outros itens (equipamentos, etc)
        for (const [type, amount] of Object.entries(this.items)) {
            if (baseMaterials.includes(type) || amount <= 0) continue;
            ctx.fillStyle = this.getItemColor(type);
            ctx.fillText(`${this.getItemIcon(type)} ${this.getItemName(type)}: ${amount}`, startX + 10, itemY);
            itemY += 20;
        }
        
        // Notificações flutuantes
        let notifY = 150;
        for (const notif of this.notifications) {
            const alpha = Math.min(1, notif.time);
            ctx.fillStyle = notif.color;
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(notif.text, canvas.width / 2, notifY);
            notifY += 25;
        }
        ctx.globalAlpha = 1;
    }
    
    getItemIcon(type) {
        const icons = {
            'iron': '🔩',
            'wood': '🪵',
            'stone': '🪨',
            'apprentice_tool': '🔧',
            'iron_sword': '⚔️',
            'stone_hammer': '🔨'
        };
        return icons[type] || '📦';
    }
}