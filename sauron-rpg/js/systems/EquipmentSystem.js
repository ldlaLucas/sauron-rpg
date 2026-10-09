class EquipmentSystem {
    constructor(inventory) {
        this.inventory = inventory;
        this.slots = {
            weapon: null,
            armor: null,
            accessory: null
        };
        this.bonuses = {
            damage: 0,
            defense: 0,
            speed: 0
        };
    }
    
    equip(itemId) {
        const itemData = this.getItemData(itemId);
        if (!itemData) {
            console.log('❌ Item não encontrado no banco de dados:', itemId);
            return false;
        }
        
        const slot = itemData.slot;
        if (!slot) {
            console.log('❌ Item não equipável:', itemId);
            return false;
        }
        
        // Verifica se tem o item no inventário
        if (!this.inventory.has(itemId, 1)) {
            console.log('❌ Item não está no inventário:', itemId);
            return false;
        }
        
        // Se já tem algo no slot, devolve para o inventário
        if (this.slots[slot]) {
            this.inventory.add(this.slots[slot]);
            console.log(`🔄 ${this.getItemName(this.slots[slot])} devolvido ao inventário`);
        }
        
        // Remove do inventário e equipa
        this.inventory.remove(itemId);
        this.slots[slot] = itemId;
        
        // Aplica bônus
        this.recalculateBonuses();
        
        console.log(`✅ ${itemData.name} equipado no slot ${slot}`);
        return true;
    }
    
    unequip(slot) {
        if (!this.slots[slot]) return false;
        
        const itemId = this.slots[slot];
        this.inventory.add(itemId);
        this.slots[slot] = null;
        
        this.recalculateBonuses();
        
        console.log(`✅ Item removido do slot ${slot}`);
        return true;
    }
    
    recalculateBonuses() {
        this.bonuses = { damage: 0, defense: 0, speed: 0 };
        
        for (const slot in this.slots) {
            const itemId = this.slots[slot];
            if (itemId) {
                const data = this.getItemData(itemId);
                if (data && data.bonuses) {
                    this.bonuses.damage += data.bonuses.damage || 0;
                    this.bonuses.defense += data.bonuses.defense || 0;
                    this.bonuses.speed += data.bonuses.speed || 0;
                }
            }
        }
    }
    
    getItemData(itemId) {
        const items = {
            'apprentice_tool': {
                name: 'Ferramenta de Aprendiz',
                slot: 'weapon',
                bonuses: { damage: 5, speed: 2 },
                description: 'Sua primeira criação. Simples, mas funcional.',
                visual: 'tool'
            },
            'iron_sword': {
                name: 'Espada de Ferro',
                slot: 'weapon',
                bonuses: { damage: 12, speed: 0 },
                description: 'Uma lâmina básica forjada com precisão.',
                visual: 'sword'
            },
            'stone_hammer': {
                name: 'Martelo de Pedra',
                slot: 'weapon',
                bonuses: { damage: 15, speed: -2 },
                description: 'Pesado, mas eficaz.',
                visual: 'hammer'
            }
        };
        
        return items[itemId] || null;
    }
    
    getItemName(itemId) {
        const data = this.getItemData(itemId);
        return data ? data.name : itemId;
    }
    
    getEquippedWeapon() {
        if (!this.slots.weapon) return null;
        return this.getItemData(this.slots.weapon);
    }
    
    getBonus(type) {
        return this.bonuses[type] || 0;
    }
    
    render(ctx, canvas) {
        const startX = 20;
        const startY = canvas.height - 70;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY, 220, 55);
        
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, 220, 55);
        
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('EQUIPAMENTO', startX + 10, startY + 15);
        
        const weapon = this.getEquippedWeapon();
        ctx.font = '12px Arial';
        ctx.fillStyle = '#fff';
        if (weapon) {
            ctx.fillText(`⚔ ${weapon.name}`, startX + 10, startY + 35);
            ctx.fillStyle = '#4ade80';
            ctx.fillText(`+${weapon.bonuses.damage} DANO | +${weapon.bonuses.speed} VEL`, startX + 10, startY + 48);
        } else {
            ctx.fillStyle = '#888';
            ctx.fillText('⚔ Nenhuma arma equipada', startX + 10, startY + 35);
            ctx.fillText('[I] Abrir inventário', startX + 10, startY + 48);
        }
    }
}