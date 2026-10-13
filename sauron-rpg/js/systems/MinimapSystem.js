class MinimapSystem {
    constructor(game) {
        this.game = game;
        this.enabled = true;
        this.size = 100;
        this.padding = 15;
        this.scale = 3;
        
        // Fog of war - inicializado preguiçosamente
        this.fogOfWar = null;
        this.revealRadius = 80;
        
        // ✅ NOVO: Flag para saber se já foi inicializado para o mapa atual
        this.lastMapId = null;
        
        console.log('🗺️ MinimapSystem criado');
    }
    
    // ✅ NOVO: Inicializa fog of war apenas quando tileMap existe
    ensureInitialized() {
        // Se já foi inicializado para este mapa, não faz nada
        if (this.fogOfWar && this.lastMapId === this.game.currentMapId) {
            return;
        }
        
        // Se ainda não tem tileMap, não pode inicializar
        if (!this.game.tileMap) {
            return;
        }
        
        this.initFogOfWar();
        this.lastMapId = this.game.currentMapId;
        console.log('🗺️ Fog of war inicializado para:', this.game.currentMapId);
    }
    
    initFogOfWar() {
        const mapWidth = this.game.tileMap.width;
        const mapHeight = this.game.tileMap.height;
        
        this.fogOfWar = [];
        for (let y = 0; y < mapHeight; y++) {
            this.fogOfWar[y] = [];
            for (let x = 0; x < mapWidth; x++) {
                this.fogOfWar[y][x] = 0;
            }
        }
    }
    
    update(deltaTime) {
        if (!this.enabled) return;
        
        // ✅ Garante que foi inicializado antes de usar
        this.ensureInitialized();
        
        if (!this.fogOfWar || !this.game.tileMap) return;
        
        const playerTileX = Math.floor(this.game.player.x / this.game.tileMap.tileSize);
        const playerTileY = Math.floor(this.game.player.y / this.game.tileMap.tileSize);
        
        const revealTileRadius = Math.ceil(this.revealRadius / this.game.tileMap.tileSize);
        
        for (let dy = -revealTileRadius; dy <= revealTileRadius; dy++) {
            for (let dx = -revealTileRadius; dx <= revealTileRadius; dx++) {
                const tileX = playerTileX + dx;
                const tileY = playerTileY + dy;
                
                if (tileX >= 0 && tileX < this.fogOfWar[0].length && 
                    tileY >= 0 && tileY < this.fogOfWar.length) {
                    
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= revealTileRadius) {
                        const intensity = 1 - (distance / revealTileRadius) * 0.3;
                        this.fogOfWar[tileY][tileX] = Math.max(this.fogOfWar[tileY][tileX], intensity);
                    }
                }
            }
        }
    }
    
    render(ctx) {
        if (!this.enabled) return;
        
        // ✅ Garante que foi inicializado antes de renderizar
        this.ensureInitialized();
        
        if (!this.fogOfWar || !this.game.tileMap) return;
        
        const mapX = this.game.canvas.width - this.size - this.padding;
        const mapY = this.game.canvas.height - this.size - this.padding;
        
        // Fundo do minimapa
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(mapX - 2, mapY - 2, this.size + 4, this.size + 4);
        
        // Borda dourada
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2;
        ctx.strokeRect(mapX - 2, mapY - 2, this.size + 4, this.size + 4);
        
        const mapWidth = this.game.tileMap.width;
        const mapHeight = this.game.tileMap.height;
        const scaleX = this.size / (mapWidth * this.game.tileMap.tileSize);
        const scaleY = this.size / (mapHeight * this.game.tileMap.tileSize);
        const scale = Math.min(scaleX, scaleY);
        
        // Renderiza tiles explorados
        for (let tileY = 0; tileY < mapHeight; tileY++) {
            for (let tileX = 0; tileX < mapWidth; tileX++) {
                const fogValue = this.fogOfWar[tileY][tileX];
                
                if (fogValue > 0) {
                    const worldX = tileX * this.game.tileMap.tileSize;
                    const worldY = tileY * this.game.tileMap.tileSize;
                    
                    const screenX = mapX + worldX * scale;
                    const screenY = mapY + worldY * scale;
                    const tileWidth = this.game.tileMap.tileSize * scale;
                    const tileHeight = this.game.tileMap.tileSize * scale;
                    
                    const tile = this.game.tileMap.tiles[tileY][tileX];
                    const color = this.getTileColor(tile);
                    
                    ctx.globalAlpha = fogValue;
                    ctx.fillStyle = color;
                    ctx.fillRect(screenX, screenY, tileWidth + 1, tileHeight + 1);
                    ctx.globalAlpha = 1;
                }
            }
        }
        
        // Renderiza NPCs (pontos dourados)
        for (const npc of this.game.npcs) {
            const npcTileX = Math.floor(npc.x / this.game.tileMap.tileSize);
            const npcTileY = Math.floor(npc.y / this.game.tileMap.tileSize);
            
            if (npcTileX >= 0 && npcTileX < mapWidth && 
                npcTileY >= 0 && npcTileY < mapHeight &&
                this.fogOfWar[npcTileY][npcTileX] > 0.5) {
                
                const npcScreenX = mapX + npc.x * scale;
                const npcScreenY = mapY + npc.y * scale;
                
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(npcScreenX, npcScreenY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Renderiza inimigos (pontos vermelhos)
        const allEnemies = [...(this.game.enemies || []), ...(this.game.corruptedShadows || [])];
        for (const enemy of allEnemies) {
            if (!enemy.alive) continue;
            
            const enemyTileX = Math.floor(enemy.x / this.game.tileMap.tileSize);
            const enemyTileY = Math.floor(enemy.y / this.game.tileMap.tileSize);
            
            if (enemyTileX >= 0 && enemyTileX < mapWidth && 
                enemyTileY >= 0 && enemyTileY < mapHeight &&
                this.fogOfWar[enemyTileY][enemyTileX] > 0.5) {
                
                const enemyScreenX = mapX + enemy.x * scale;
                const enemyScreenY = mapY + enemy.y * scale;
                
                ctx.fillStyle = '#ff3333';
                ctx.beginPath();
                ctx.arc(enemyScreenX, enemyScreenY, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Renderiza forja (ponto laranja)
        if (this.game.forge) {
            const forgeTileX = Math.floor(this.game.forge.x / this.game.tileMap.tileSize);
            const forgeTileY = Math.floor(this.game.forge.y / this.game.tileMap.tileSize);
            
            if (forgeTileX >= 0 && forgeTileX < mapWidth && 
                forgeTileY >= 0 && forgeTileY < mapHeight &&
                this.fogOfWar[forgeTileY][forgeTileX] > 0.5) {
                
                const forgeScreenX = mapX + this.game.forge.x * scale;
                const forgeScreenY = mapY + this.game.forge.y * scale;
                
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.arc(forgeScreenX, forgeScreenY, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Renderiza jogador (ponto branco com borda)
        const playerScreenX = mapX + this.game.player.x * scale;
        const playerScreenY = mapY + this.game.player.y * scale;
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(playerScreenX, playerScreenY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Título do minimapa
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.game.getMapName(), mapX + this.size / 2, mapY - 6);
    }
    
    getTileColor(tileType) {
        const colors = {
            'grass': '#5a8c3a',
            'dirt': '#8b6f47',
            'stone': '#555555',
            'path': '#c9a876',
            'forge_floor': '#5a4a3a',
            'water': '#4a7cb8',
            'tree': '#2d5016',
            'flower_grass': '#6a9c4a',
            'garden_path': '#d4b888'
        };
        return colors[tileType] || '#333';
    }
    
    toggle() {
        this.enabled = !this.enabled;
        console.log(`🗺️ Minimapa ${this.enabled ? 'ativado' : 'desativado'}`);
    }
}