class CraftingSystem {
    constructor(inventory) {
        this.inventory = inventory;
        this.active = false;
        this.recipes = this.loadRecipes();
        this.notifications = [];
    }
    
    loadRecipes() {
        return [
            {
                id: 'apprentice_tool',
                name: 'Ferramenta de Aprendiz',
                description: 'Sua primeira criação. Simples, mas funcional.',
                ingredients: {
                    iron: 2,
                    wood: 1
                },
                result: 'apprentice_tool',
                quality: 'Good'
            },
            {
                id: 'iron_sword',
                name: 'Espada de Ferro',
                description: 'Uma lâmina básica forjada com precisão.',
                ingredients: {
                    iron: 3,
                    wood: 1
                },
                result: 'iron_sword',
                quality: 'Good'
            },
            {
                id: 'stone_hammer',
                name: 'Martelo de Pedra',
                description: 'Pesado, mas eficaz para trabalhos brutos.',
                ingredients: {
                    stone: 2,
                    wood: 1
                },
                result: 'stone_hammer',
                quality: 'Good'
            }
        ];
    }
    
    open() {
        this.active = true;
        console.log('🔨 Abrindo forja');
    }
    
    close() {
        this.active = false;
        console.log('🔨 Fechando forja');
    }
    
    canCraft(recipe) {
        for (const [item, amount] of Object.entries(recipe.ingredients)) {
            if (!this.inventory.has(item, amount)) {
                return false;
            }
        }
        this.inventory.add(recipe.result);
        
        // ✅ NOVO: Som de forja
        if (window.game && window.game.audio) {
            window.game.audio.playForge();
        }
        
        // Notificação
        this.notifications.push({
            text: `✨ ${recipe.name} criado!`,
            time: 3,
            color: '#ffd700'
        });
        
        console.log(`✅ ${recipe.name} criado!`);
        return true;
    }
    
    craft(recipeId) {
        const recipe = this.recipes.find(r => r.id === recipeId);
        if (!recipe) {
            console.log('❌ Receita não encontrada');
            return false;
        }
        
        if (!this.canCraft(recipe)) {
            console.log('❌ Materiais insuficientes');
            return false;
        }
        
        // Consumir materiais
        for (const [item, amount] of Object.entries(recipe.ingredients)) {
            this.inventory.remove(item, amount);
        }
        
        // Adicionar item criado
        this.inventory.add(recipe.result);
        
        // Notificação
        this.notifications.push({
            text: `✨ ${recipe.name} criado!`,
            time: 3,
            color: '#ffd700'
        });
        
        console.log(`✅ ${recipe.name} criado!`);
        return true;
    }
    
    update(deltaTime) {
        // Atualizar notificações
        for (let i = this.notifications.length - 1; i >= 0; i--) {
            this.notifications[i].time -= deltaTime;
            if (this.notifications[i].time <= 0) {
                this.notifications.splice(i, 1);
            }
        }
    }
    
    render(ctx, canvas) {
        // Renderizar notificações de criação
        let notifY = 200;
        for (const notif of this.notifications) {
            const alpha = Math.min(1, notif.time);
            ctx.fillStyle = notif.color;
            ctx.globalAlpha = alpha;
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(notif.text, canvas.width / 2, notifY);
            notifY += 30;
        }
        ctx.globalAlpha = 1;
    }
}