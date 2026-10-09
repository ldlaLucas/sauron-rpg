class DialogueSystem {
    constructor() {
        this.active = false;
        this.currentDialogue = null;
        this.currentLine = 0;
        this.currentNPC = null;
        this.onDialogueEnd = null;
        this.lastKeyState = false;
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
        this.lastKeyState = false;
        
        npc.startDialogue();
    }
    
    update(input) {
        if (!this.active) return;
        
        const isKeyPressed = input.isKeyDown('enter') || input.isKeyDown('e');
        
        if (isKeyPressed && !this.lastKeyState) {
            this.next();
        }
        
        // ✅ CORREÇÃO: Só atualiza lastKeyState se ainda estiver ativo
        if (this.active) {
            this.lastKeyState = isKeyPressed;
        } else {
            this.lastKeyState = false;
        }
    }
    
    next() {
        // ✅ CORREÇÃO: Proteção contra null
        if (!this.currentDialogue) {
            console.log('⚠️ Diálogo já finalizado, ignorando next()');
            return;
        }
        
        this.currentLine++;
        
        if (window.game && window.game.audio) {
            window.game.audio.playDialogueBlip();
        }
        
        console.log(`💬 Linha do diálogo: ${this.currentLine}/${this.currentDialogue.lines.length}`);
        
        if (this.currentLine >= this.currentDialogue.lines.length) {
            this.end();
            return; // ✅ CORREÇÃO: Sai imediatamente após end()
        }
    }
    
       end() {
        if (!this.active) return;
        
        console.log('✅ Encerrando diálogo e limpando estados');
        this.active = false;
        this.dialogueEnded = true;
        
        const npc = this.currentNPC;
        
        // Limpa tudo ANTES de chamar callbacks
        this.currentNPC = null;
        this.currentLine = 0;
        this.lastKeyState = false;
        
        // ✅ CORREÇÃO: Deixa o NPC chamar o callback (evita duplicação)
        if (npc) {
            npc.endDialogue();
        }
        
        // ❌ REMOVIDO: this.onDialogueEnd() - não chamar aqui
        
        // Limpa currentDialogue POR ÚLTIMO
        this.currentDialogue = null;
    }
    
    render(ctx, canvas) {
        if (!this.active || !this.currentDialogue) return;
        
        // Proteção extra
        if (this.currentLine >= this.currentDialogue.lines.length) return;
        
        const line = this.currentDialogue.lines[this.currentLine];
        if (!line) return;
        
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