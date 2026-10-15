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
        const names = {
            'iron': 'Ferro',
            'wood': 'Madeira',
            'stone': 'Pedra',
            'valinor_crystal': 'Cristal de Valinor', // ✅ NOVO
            'apprentice_tool': 'Ferramenta de Aprendiz',
            'iron_sword': 'Espada de Ferro',
            'stone_hammer': 'Martelo de Pedra',
            'elven_blade': 'Lâmina Élfica', // ✅ NOVO
            'masterwork_blade': 'Lâmina Obra-Prima',
            'shadow_blade': 'Lâmina Sombria',  // ✅ NOVO
            'flame_sword': 'Espada Flamejante',
            'frost_staff': 'Cajado de Gelo',
            'thunder_blade': 'Lâmina do Trovão'
        };
        return names[type] || type;
    }
    
    getItemColor(type) {
        const colors = {
            'iron': '#b0b0b0',
            'wood': '#a0703c',
            'stone': '#9a9a9a',
            'valinor_crystal': '#87ceeb', // ✅ NOVO
            'apprentice_tool': '#ffd700',
            'iron_sword': '#d0d0d0',
            'stone_hammer': '#6a6a6a',
            'elven_blade': '#4a90e2', // ✅ NOVO
            'masterwork_blade': '#a78bfa', // ✅ NOVO
            'shadow_blade': '#4b0082',  // ✅ NOVO
            'flame_sword': '#ff6600',
            'frost_staff': '#66ccff',
            'thunder_blade': '#ffff00'

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
        const startX = canvas.width - 160; // ✅ REDUZIDO (era 180)
        const startY = 20;
        
        // Conta quantos itens temos
        const itemCount = Object.keys(this.items).filter(k => this.items[k] > 0).length;
        const height = 35 + Math.max(itemCount, 3) * 18; // ✅ REDUZIDO (era 40 + 20)
        
        // Fundo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY, 140, height); // ✅ REDUZIDO (era 160)
        
        // Borda
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, 140, height);
        
        // Título
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 11px Arial'; // ✅ REDUZIDO (era 14)
        ctx.textAlign = 'left';
        ctx.fillText('MATERIAIS', startX + 8, startY + 16);
        
        // Itens
        ctx.font = '11px Arial'; // ✅ REDUZIDO (era 13)
        let itemY = startY + 32;
        
        // Materiais base
        const baseMaterials = ['iron', 'wood', 'stone'];
        for (const mat of baseMaterials) {
            const amount = this.items[mat] || 0;
            ctx.fillStyle = '#fff';
            ctx.fillText(`${this.getItemIcon(mat)} ${this.getItemName(mat)}: ${amount}`, startX + 8, itemY);
            itemY += 18; // ✅ REDUZIDO (era 20)
        }
        
        // Outros itens
        for (const [type, amount] of Object.entries(this.items)) {
            if (baseMaterials.includes(type) || amount <= 0) continue;
            ctx.fillStyle = this.getItemColor(type);
            ctx.fillText(`${this.getItemIcon(type)} ${this.getItemName(type)}: ${amount}`, startX + 8, itemY);
            itemY += 18;
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
            'valinor_crystal': '💎', // ✅ NOVO
            'apprentice_tool': '🔧',
            'iron_sword': '⚔️',
            'stone_hammer': '🔨',
            'elven_blade': '🗡️', // ✅ NOVO
            'masterwork_blade': '🗡️',
            'shadow_blade': '🌑',  // ✅ NOVO
                        // ... existentes ...
            'flame_sword': '🔥',
            'frost_staff': '❄️',
            'thunder_blade': '⚡'
        };
        return icons[type] || '📦';
    }
}