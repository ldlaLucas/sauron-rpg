class QuestSystem {
    constructor(inventory) {
        this.inventory = inventory;
        this.activeQuest = null;
        this.completedQuests = [];
    }
    
    hasCompleted(questId) {
        return this.completedQuests.includes(questId);
    }
    
    startQuest(questData) {
        // ✅ Proteções contra duplicação
        if (this.activeQuest && this.activeQuest.id === questData.id) {
            console.log(`⚠️ Missão "${questData.id}" já está ativa`);
            return false;
        }
        
        if (this.hasCompleted(questData.id)) {
            console.log(`⚠️ Missão "${questData.id}" já foi completada`);
            return false;
        }
        
        console.log(`📜 Iniciando missão: ${questData.title}`);
        
        this.activeQuest = {
            id: questData.id,
            title: questData.title,
            description: questData.description,
            objectives: questData.objectives.map(obj => ({
                ...obj,
                completed: false,
                current: 0
            })),
            completed: false
        };
        
        return true;
    }
    
    update() {
        if (!this.activeQuest || this.activeQuest.completed) return;
        
        let allCompleted = true;
        
        for (const obj of this.activeQuest.objectives) {
            if (obj.type === 'collect') {
                const current = this.inventory.items[obj.item] || 0;
                obj.current = current;
                if (current >= obj.amount) {
                    obj.completed = true;
                } else {
                    allCompleted = false;
                }
            }
        }
        
        if (allCompleted) {
            this.completeQuest();
        }
    }
    
    completeQuest() {
        if (!this.activeQuest) return;
        
        console.log(`✅ Completando missão: ${this.activeQuest.title}`);
        
        this.activeQuest.completed = true;
        
        if (!this.hasCompleted(this.activeQuest.id)) {
            this.completedQuests.push(this.activeQuest.id);
        }
    }
    
    render(ctx, canvas) {
        if (!this.activeQuest) return;
        
        const startX = 20;
        const startY = 20;
        const width = 240;
        const height = 35 + this.activeQuest.objectives.length * 22;
        
        // Fundo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(startX, startY, width, height);
        
        // Borda
        const borderColor = this.activeQuest.completed ? '#4ade80' : '#ffd700';
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, width, height);
        
        // Título
        ctx.fillStyle = borderColor;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        const titleText = this.activeQuest.completed ? '✅ ' : '📜 ';
        ctx.fillText(titleText + this.activeQuest.title, startX + 10, startY + 20);
        
        // Objetivos
        ctx.font = '11px Arial';
        let objY = startY + 40;
        for (const obj of this.activeQuest.objectives) {
            if (obj.type === 'collect') {
                const itemName = this.inventory.getItemName(obj.item);
                const current = obj.current || 0;
                const status = obj.completed ? '✅' : '⬜';
                ctx.fillStyle = obj.completed ? '#4ade80' : '#fff';
                ctx.fillText(`${status} Coletar ${itemName}: ${current}/${obj.amount}`, startX + 15, objY);
            }
            objY += 22;
        }
    }
}