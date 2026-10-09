class ForgeUI {
    constructor(craftingSystem, inventory) {
        this.craftingSystem = craftingSystem;
        this.inventory = inventory;
        this.container = document.getElementById('forge-ui');
        this.recipesList = document.getElementById('forge-recipes');
        this.closeBtn = document.getElementById('forge-close');
        
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
    }
    
    show() {
        this.container.style.display = 'flex';
        this.renderRecipes();
    }
    
    hide() {
        this.container.style.display = 'none';
        this.craftingSystem.close();
    }
    
    renderRecipes() {
        this.recipesList.innerHTML = '';
        
        for (const recipe of this.craftingSystem.recipes) {
            const canCraft = this.craftingSystem.canCraft(recipe);
            
            const recipeDiv = document.createElement('div');
            recipeDiv.className = 'recipe-item' + (canCraft ? '' : ' disabled');
            
            // Nome e descrição
            const header = document.createElement('div');
            header.className = 'recipe-header';
            header.innerHTML = `
                <div class="recipe-name">${recipe.name}</div>
                <div class="recipe-quality">${recipe.quality}</div>
            `;
            
            const desc = document.createElement('div');
            desc.className = 'recipe-desc';
            desc.textContent = recipe.description;
            
            // Ingredientes
            const ingredients = document.createElement('div');
            ingredients.className = 'recipe-ingredients';
            
            for (const [item, amount] of Object.entries(recipe.ingredients)) {
                const current = this.inventory.items[item] || 0;
                const hasEnough = current >= amount;
                const span = document.createElement('span');
                span.className = 'ingredient' + (hasEnough ? '' : ' missing');
                span.textContent = `${this.inventory.getItemName(item)}: ${current}/${amount}`;
                ingredients.appendChild(span);
            }
            
            // Botão de criar
            const craftBtn = document.createElement('button');
            craftBtn.className = 'craft-btn';
            craftBtn.textContent = 'FORJAR';
            craftBtn.disabled = !canCraft;
            
            craftBtn.addEventListener('click', () => {
                if (this.craftingSystem.craft(recipe.id)) {
                    this.renderRecipes(); // Atualizar lista
                }
            });
            
            recipeDiv.appendChild(header);
            recipeDiv.appendChild(desc);
            recipeDiv.appendChild(ingredients);
            recipeDiv.appendChild(craftBtn);
            
            this.recipesList.appendChild(recipeDiv);
        }
    }
}