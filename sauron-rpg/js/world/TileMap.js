class TileMap {
    constructor(tileSize = 32) {
        this.tileSize = tileSize;
        this.width = 40;   
        this.height = 25;  
        this.tiles = this.generateMap();
    }
    
    generateMap() {
        const map = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                // Bordas do mapa = pedra
                if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
                    row.push('stone');
                }
                // Obstáculo no meio do mapa (para testar colisão)
                else if (x >= 18 && x <= 22 && y >= 10 && y <= 14) {
                    row.push('stone'); 
                }
                // Caminho
                else if (y === 12 && x > 5 && x < 35) {
                    row.push('path');
                }
                // Área da forja
                else if (x > 28 && x < 35 && y > 3 && y < 8) {
                    row.push('forge_floor');
                }
                // Jardim
                else if (x > 3 && x < 12 && y > 15 && y < 22) {
                    row.push('grass');
                }
                else {
                    row.push('dirt');
                }
            }
            map.push(row);
        }
        return map;
    }
    
    // NOVO: Verifica se o tile é sólido (intransitável)
    isSolid(worldX, worldY) {
        const tileX = Math.floor(worldX / this.tileSize);
        const tileY = Math.floor(worldY / this.tileSize);
        
        // Fora dos limites do mapa é considerado sólido
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) return true;
        
        const tile = this.tiles[tileY][tileX];
        return tile === 'stone'; // Apenas pedra é sólida por enquanto
    }

    render(ctx, camera) {
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.min(startX + Math.ceil(1280 / this.tileSize) + 1, this.width);
        const endY = Math.min(startY + Math.ceil(720 / this.tileSize) + 1, this.height);
        
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const tile = this.tiles[y][x];
                const screenX = x * this.tileSize - camera.x;
                const screenY = y * this.tileSize - camera.y;
                
                ctx.fillStyle = this.getTileColor(tile);
                ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                
                // Borda sutil
                ctx.strokeStyle = 'rgba(0,0,0,0.1)';
                ctx.lineWidth = 1;
                ctx.strokeRect(screenX, screenY, this.tileSize, this.tileSize);
            }
        }
    }
    
    getTileColor(type) {
        const colors = {
            'grass': '#4a7c3a',
            'dirt': '#8b6f47',
            'stone': '#555555', // Pedra mais escura para destacar
            'path': '#c9a876',
            'forge_floor': '#5a4a3a'
        };
        return colors[type] || '#333';
    }
}