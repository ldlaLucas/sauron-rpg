class DialogueSystem {
    constructor() {
        this.active = false;
        this.currentDialogue = null;
        this.currentLine = 0;
        this.currentNPC = null;
        this.onDialogueEnd = null;
        this.keyReleased = true;
        this.dialogueEnded = false; // ✅ Nova flag
    }
    
    start(npc) {
        if (this.active) {
            console.log('⚠️ Diálogo já está ativo, ignorando');
            return;
        }
        
        console.log(`💬 Iniciando diálogo com ${npc.name}`);
        this.active = true;
        this.currentDialogue = npc.dialogue;
        this.currentLine = 0;
        this.currentNPC = npc;
        this.dialogueEnded = false;
        this.keyReleased = false; // ✅ Começar com tecla "pressionada" para evitar avanço imediato
        
        npc.startDialogue();
    }
    
    update(input) {
        if (!this.active) return;
        
        const keyPressed = input.isKeyDown('enter') || input.isKeyDown('e');
        
        // ✅ Sistema de debounce mais robusto
        if (keyPressed && this.keyReleased) {
            this.next();
            this.keyReleased = false;
        } else if (!keyPressed && !this.keyReleased) {
            // ✅ Só liberar após tecla ser solta
            this.keyReleased = true;
        }
    }
    
    next() {
        if (this.dialogueEnded) return;
        
        this.currentLine++;
        
        if (this.currentLine >= this.currentDialogue.lines.length) {
            this.end();
        }

         // ✅ NOVO: Som de blip ao avançar diálogo
        if (window.game && window.game.audio) {
            window.game.audio.playDialogueBlip();
        }
        
        this.currentLine++;
        
        if (this.currentLine >= this.currentDialogue.lines.length) {
            this.end();
        }
    }
    
    end() {
        if (this.dialogueEnded) {
            console.log('⚠️ Diálogo já foi encerrado');
            return;
        }
        
        console.log('✅ Encerrando diálogo');
        this.dialogueEnded = true;
        this.active = false;
        
        const npc = this.currentNPC;
        this.currentDialogue = null;
        this.currentLine = 0;
        this.currentNPC = null;
        
        // ✅ Chamar endDialogue do NPC
        if (npc) {
            npc.endDialogue();
        }
        
        // ✅ Chamar callback global
        if (this.onDialogueEnd) {
            this.onDialogueEnd();
        }
    }
    
    render(ctx, canvas) {
        if (!this.active) return;
        
        const line = this.currentDialogue.lines[this.currentLine];
        
        // Fundo
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(50, canvas.height - 200, canvas.width - 100, 150);
        
        // Borda
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(50, canvas.height - 200, canvas.width - 100, 150);
        
        // Nome
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(line.speaker, 80, canvas.height - 165);
        
        // Texto
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        this.wrapText(ctx, line.text, 80, canvas.height - 130, canvas.width - 160, 25);
        
        // Indicador
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('[Enter/E para continuar]', canvas.width - 80, canvas.height - 70);
    }
    
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let testY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, testY);
                line = words[n] + ' ';
                testY += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, x, testY);
    }
}