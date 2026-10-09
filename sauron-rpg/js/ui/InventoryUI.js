class InventoryUI {
    constructor(inventory, equipment) {
        this.inventory = inventory;
        this.equipment = equipment;
        this.container = document.getElementById('inventory-ui');
        this.itemsList = document.getElementById('inventory-items');
        this.closeBtn = document.getElementById('inventory-close');
        this.active = false;
        
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
    }
    
    show() {
        this.container.style.display = 'flex';
        this.active = true;
        this.render();
    }
    
    hide() {
        this.container.style.display = 'none';
        this.active = false;
    }
    
    toggle() {
        if (this.active) this.hide();
        else this.show();
    }
    
    render() {
        this.itemsList.innerHTML = '';
        
        const baseMaterials = ['iron', 'wood', 'stone'];
        
        // SEÇÃO 1: EQUIPAMENTOS
        const equipSection = document.createElement('div');
        equipSection.innerHTML = '<div style="color:#ffd700; font-weight:bold; margin:10px 0 5px 0; font-size:16px;">⚔ EQUIPAMENTOS</div>';
        this.itemsList.appendChild(equipSection);
        
        let hasEquipment = false;
        
        // 1A. Itens JÁ EQUIPADOS
        for (const slot in this.equipment.slots) {
            const itemId = this.equipment.slots[slot];
            if (!itemId) continue;
            
            const data = this.equipment.getItemData(itemId);
            if (!data) continue;
            
            hasEquipment = true;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            itemDiv.style.borderColor = '#4ade80';
            
            itemDiv.innerHTML = `
                <div class="item-icon">${this.getEquipIcon(data.visual)}</div>
                <div class="item-info">
                    <div class="item-name">${data.name} <span style="color:#4ade80; font-size:12px;">[EQUIPADO - ${slot}]</span></div>
                    <div class="item-desc">${data.description}</div>
                    <div class="item-bonus">+${data.bonuses.damage} Dano | +${data.bonuses.speed} Velocidade</div>
                </div>
                <button class="equip-btn" style="background:#ff6666;">DESEQUIPAR</button>
            `;
            
            const btn = itemDiv.querySelector('.equip-btn');
            btn.addEventListener('click', () => {
                this.equipment.unequip(slot);
                this.render();
            });
            
            this.itemsList.appendChild(itemDiv);
        }
        
        // 1B. Itens equipáveis NO INVENTÁRIO
        for (const itemId in this.inventory.items) {
            const amount = this.inventory.items[itemId];
            if (amount <= 0) continue;
            if (baseMaterials.includes(itemId)) continue;
            
            const data = this.equipment.getItemData(itemId);
            if (!data) continue;
            
            const isEquipped = Object.values(this.equipment.slots).includes(itemId);
            if (isEquipped) continue;
            
            hasEquipment = true;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            
            itemDiv.innerHTML = `
                <div class="item-icon">${this.getEquipIcon(data.visual)}</div>
                <div class="item-info">
                    <div class="item-name">${data.name} <span style="color:#888; font-size:12px;">(x${amount})</span></div>
                    <div class="item-desc">${data.description}</div>
                    <div class="item-bonus">+${data.bonuses.damage} Dano | +${data.bonuses.speed} Velocidade</div>
                </div>
                <button class="equip-btn">EQUIPAR</button>
            `;
            
            const btn = itemDiv.querySelector('.equip-btn');
            btn.addEventListener('click', () => {
                this.equipment.equip(itemId);
                this.render();
            });
            
            this.itemsList.appendChild(itemDiv);
        }
        
        if (!hasEquipment) {
            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = 'color:#888; padding:10px; font-style:italic;';
            emptyDiv.textContent = 'Nenhum equipamento. Crie algo na forja!';
            this.itemsList.appendChild(emptyDiv);
        }
        
        // SEÇÃO 2: MATERIAIS
        const matSection = document.createElement('div');
        matSection.innerHTML = '<div style="color:#ffd700; font-weight:bold; margin:15px 0 5px 0; font-size:16px;">📦 MATERIAIS</div>';
        this.itemsList.appendChild(matSection);
        
        let hasMaterials = false;
        
        for (const mat of baseMaterials) {
            const amount = this.inventory.items[mat] || 0;
            hasMaterials = true;
            
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            
            itemDiv.innerHTML = `
                <div class="item-icon">${this.getMaterialIcon(mat)}</div>
                <div class="item-info">
                    <div class="item-name">${this.inventory.getItemName(mat)}</div>
                    <div class="item-qty">Quantidade: ${amount}</div>
                </div>
            `;
            
            this.itemsList.appendChild(itemDiv);
        }
        
        for (const itemId in this.inventory.items) {
            const amount = this.inventory.items[itemId];
            if (amount <= 0) continue;
            if (baseMaterials.includes(itemId)) continue;
            if (this.equipment.getItemData(itemId)) continue;
            
            hasMaterials = true;
            const itemDiv = document.createElement('div');
            itemDiv.className = 'inventory-item';
            
            itemDiv.innerHTML = `
                <div class="item-icon">📦</div>
                <div class="item-info">
                    <div class="item-name">${this.inventory.getItemName(itemId)}</div>
                    <div class="item-qty">Quantidade: ${amount}</div>
                </div>
            `;
            
            this.itemsList.appendChild(itemDiv);
        }
        
        if (!hasMaterials) {
            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = 'color:#888; padding:10px; font-style:italic;';
            emptyDiv.textContent = 'Nenhum material.';
            this.itemsList.appendChild(emptyDiv);
        }
    }
    
    getMaterialIcon(type) {
        const icons = {
            'iron': '🔩',
            'wood': '🪵',
            'stone': '🪨'
        };
        return icons[type] || '📦';
    }
    
    getEquipIcon(visual) {
        const icons = {
            'tool': '🔧',
            'sword': '⚔️',
            'hammer': '🔨'
        };
        return icons[visual] || '📦';
    }
}