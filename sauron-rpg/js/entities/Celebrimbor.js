class Celebrimbor extends NPC {
    constructor(x, y) {
        const dialogue = {
            lines: [
                { speaker: 'Celebrimbor', text: 'Ah, um visitante dos jardins. Raramente alguém vem aqui.' },
                { speaker: 'Mairon', text: 'Mestre Celebrimbor, é uma honra conhecê-lo.' },
                { speaker: 'Celebrimbor', text: 'Honra? Hmm. Você é aprendiz de Aulë, não é?' },
                { speaker: 'Mairon', text: 'Sim, mestre. Estou aprendendo a forjar.' },
                { speaker: 'Celebrimbor', text: 'Forjar... Aulë ensina bem. Mas existe algo além da forja comum.' },
                { speaker: 'Celebrimbor', text: 'Nos jardins, crescem cristais especiais. Essências da própria Valinor.' },
                { speaker: 'Celebrimbor', text: 'Se você me trouxer 2 cristais de Valinor, posso te ensinar algo que Aulë não ensina.' },
                { speaker: 'Mairon', text: 'Cristais de Valinor? Onde posso encontrá-los?' },
                { speaker: 'Celebrimbor', text: 'Procure perto da fonte. Eles brilham com luz própria.' },
                { speaker: 'Celebrimbor', text: 'Quando reunir os cristais, volte aqui. Tenho algo especial para você.' }
            ]
        };
        
        super(x, y, 'Celebrimbor', dialogue, null);
        this.color = '#4a7c9e'; // Azul prateado para elfo
        this.questGiven = false;
    }
    
    update(player, input) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        this.canInteract = distance < this.interactionRadius;
        
        if (this.canInteract && input.isKeyDown('e') && !this.dialogueStarted && !this.dialogueFinished) {
            return { type: 'dialogue', npc: this };
        }
        
        return null;
    }
    
    endDialogue() {
        if (this.dialogueFinished) return;
        
        this.dialogueStarted = false;
        this.dialogueFinished = true;
        
        // Marca que a missão foi dada
        if (window.game) {
            window.game.questGivenByCelebrimbor = true;
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
        
        // Corpo (túnica azul prateada)
        ctx.fillStyle = this.color;
        ctx.fillRect(screenX + 6, screenY + 10, 20, 20);
        
        // Cabeça
        ctx.fillStyle = '#ffe0bd';
        ctx.fillRect(screenX + 10, screenY + 2, 12, 10);
        
        // Cabelo longo (prateado)
        ctx.fillStyle = '#c0c0c0';
        ctx.fillRect(screenX + 8, screenY + 1, 16, 6);
        ctx.fillRect(screenX + 6, screenY + 5, 4, 10);
        ctx.fillRect(screenX + 22, screenY + 5, 4, 10);
        
        // Orelhas pontudas (elfo)
        ctx.fillStyle = '#ffe0bd';
        ctx.beginPath();
        ctx.moveTo(screenX + 8, screenY + 6);
        ctx.lineTo(screenX + 5, screenY + 4);
        ctx.lineTo(screenX + 8, screenY + 8);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(screenX + 24, screenY + 6);
        ctx.lineTo(screenX + 27, screenY + 4);
        ctx.lineTo(screenX + 24, screenY + 8);
        ctx.closePath();
        ctx.fill();
        
        // Detalhes prateados
        ctx.fillStyle = '#e0e0e0';
        ctx.fillRect(screenX + 8, screenY + 18, 16, 2);
        
        // Indicador de interação
        if (this.canInteract && !this.dialogueStarted && !this.dialogueFinished) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[E]', screenX + 16, screenY - 10);
        }
    }
}