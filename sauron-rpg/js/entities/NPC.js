class NPC extends Entity {
    constructor(x, y, name, dialogue, onDialogueEnd = null) {
        super(x, y, 32, 32);
        this.name = name;
        this.dialogue = dialogue;
        this.onDialogueEnd = onDialogueEnd;
        this.color = '#8b4513';
        this.interactionRadius = 60;
        this.canInteract = false;
        this.dialogueStarted = false;
        this.dialogueFinished = false;
        this.callbackExecuted = false; // ✅ NOVO: evita callback duplicado
    }
    
    update(player, input) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.canInteract = distance < this.interactionRadius;
        
        // ✅ CORREÇÃO: Só permite interação se diálogo NÃO foi finalizado
        if (this.canInteract && input.isKeyDown('e') && !this.dialogueStarted && !this.dialogueFinished) {
            console.log(`🎮 Jogador pressionou E perto de ${this.name}`);
            return { type: 'dialogue', npc: this };
        }
        
        return null;
    }
    
    startDialogue() {
        console.log(`💬 ${this.name} iniciando diálogo`);
        this.dialogueStarted = true;
        this.dialogueFinished = false;
        this.callbackExecuted = false;
    }
    
    endDialogue() {
        if (this.dialogueFinished) return; // ✅ Evita execução duplicada
        
        console.log(`💬 ${this.name} terminando diálogo`);
        this.dialogueStarted = false;
        this.dialogueFinished = true;
        
        // ✅ CORREÇÃO: Callback só é executado UMA VEZ
        if (this.onDialogueEnd && !this.callbackExecuted) {
            this.callbackExecuted = true;
            console.log(`🎯 Executando callback de ${this.name}`);
            this.onDialogueEnd();
        }
    }
    
    render(ctx, camera) {
        const screenX = this.x - camera.x;
        const screenY = this.y - camera.y;
        
        // Sombra
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + 16, screenY + 30, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Corpo
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX + 6, screenY + 10, 20, 20);
        
        // Cabeça
        ctx.fillStyle = '#ffe0bd';
        ctx.fillRect(screenX + 10, screenY + 2, 12, 10);
        
        // Barba
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(screenX + 10, screenY + 8, 12, 6);
        
        // Cabelo
        ctx.fillStyle = '#cccccc';
        ctx.fillRect(screenX + 9, screenY + 1, 14, 4);
        
        // Indicador de interação (só se diálogo ainda não foi finalizado)
        if (this.canInteract && !this.dialogueStarted && !this.dialogueFinished) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[E]', screenX + 16, screenY - 10);
        }
    }
}