class TileMap {
    constructor(tileSize = 32, customTiles = null, customWidth = null, customHeight = null, customDecorations = null) {
        this.tileSize = tileSize;
        
        if (customTiles && customWidth && customHeight) {
            this.width = customWidth;
            this.height = customHeight;
            this.tiles = customTiles;
        } else {
            this.width = 40;
            this.height = 25;
            this.tiles = this.generateWorkshopMap();
        }
        
        this.decorations = customDecorations || [];
    }
    
    generateWorkshopMap() {
        const map = [];
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                if (x === 0 || y === 0 || x === 39 || y === 24) {
                    row.push('stone');
                } else if (x >= 18 && x <= 22 && y >= 10 && y <= 14) {
                    row.push('stone');
                } else if (y === 12 && x > 5 && x < 35) {
                    row.push('path');
                } else if (x > 28 && x < 35 && y > 3 && y < 8) {
                    row.push('forge_floor');
                } else if (x > 3 && x < 12 && y > 15 && y < 22) {
                    row.push('grass');
                } else {
                    row.push('dirt');
                }
            }
            map.push(row);
        }
        return map;
    }
    
    isSolid(worldX, worldY) {
        const tileX = Math.floor(worldX / this.tileSize);
        const tileY = Math.floor(worldY / this.tileSize);
        
        if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) return true;
        
        const tile = this.tiles[tileY][tileX];
        const solidTiles = ['stone', 'tree', 'water', 'rock'];
        return solidTiles.includes(tile);
    }
    
    render(ctx, camera) {
        const startX = Math.floor(camera.x / this.tileSize);
        const startY = Math.floor(camera.y / this.tileSize);
        const endX = Math.min(startX + Math.ceil(1280 / this.tileSize) + 1, this.width);
        const endY = Math.min(startY + Math.ceil(720 / this.tileSize) + 1, this.height);
        
        // Renderiza tiles
        for (let y = Math.max(0, startY); y < endY; y++) {
            for (let x = Math.max(0, startX); x < endX; x++) {
                const tile = this.tiles[y][x];
                const screenX = x * this.tileSize - camera.x;
                const screenY = y * this.tileSize - camera.y;
                
                ctx.fillStyle = this.getTileColor(tile);
                ctx.fillRect(screenX, screenY, this.tileSize, this.tileSize);
                
                // Detalhes sutis
                if (tile === 'grass') {
                    ctx.fillStyle = 'rgba(60, 100, 40, 0.5)';
                    const seed = (x * 7 + y * 13) % 4;
                    if (seed === 0) {
                        ctx.fillRect(screenX + 5, screenY + 10, 2, 4);
                        ctx.fillRect(screenX + 20, screenY + 18, 2, 4);
                    }
                } else if (tile === 'water') {
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                    const wave = Math.sin(Date.now() / 500 + x + y) * 2;
                    ctx.fillRect(screenX + 8, screenY + 10 + wave, 16, 2);
                }
            }
        }
        
        // Renderiza decorações
        for (const deco of this.decorations) {
            const screenX = deco.x - camera.x;
            const screenY = deco.y - camera.y;
            
            if (screenX > -100 && screenX < 1380 && screenY > -100 && screenY < 820) {
                this.renderDecoration(ctx, deco, screenX, screenY);
            }
        }
    }
    
    renderDecoration(ctx, deco, x, y) {
        if (deco.type === 'tree') {
            // Tronco
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(x + 12, y + 20, 8, 20);
            // Copa
            ctx.fillStyle = '#2d5016';
            ctx.beginPath();
            ctx.arc(x + 16, y + 15, 16, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#3d6020';
            ctx.beginPath();
            ctx.arc(x + 10, y + 12, 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 22, y + 14, 8, 0, Math.PI * 2);
            ctx.fill();
        } else if (deco.type === 'flower') {
            const colors = ['#ff6b9d', '#ffd700', '#ff8c42', '#c77dff'];
            const color = colors[deco.colorIndex || 0];
            ctx.fillStyle = '#3d6020';
            ctx.fillRect(x + 3, y + 6, 2, 6);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + 4, y + 4, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(x + 4, y + 4, 1, 0, Math.PI * 2);
            ctx.fill();
        } else if (deco.type === 'fountain') {
            ctx.fillStyle = '#8a8a8a';
            ctx.beginPath();
            ctx.arc(x + 24, y + 24, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#4a90e2';
            ctx.beginPath();
            ctx.arc(x + 24, y + 24, 18, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#8a8a8a';
            ctx.fillRect(x + 20, y + 10, 8, 20);
            const wave = Math.sin(Date.now() / 300) * 2;
            ctx.fillStyle = '#87ceeb';
            ctx.beginPath();
            ctx.arc(x + 24, y + 8 + wave, 4, 0, Math.PI * 2);
            ctx.fill();
        } else if (deco.type === 'statue') {
            ctx.fillStyle = '#d0d0d0';
            ctx.fillRect(x + 4, y + 24, 24, 8);
            ctx.fillStyle = '#e0e0e0';
            ctx.fillRect(x + 10, y + 8, 12, 18);
            ctx.beginPath();
            ctx.arc(x + 16, y + 6, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x + 14, y + 14, 4, 2);
        } else if (deco.type === 'portal') {
            const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(255, 215, 0, ${pulse * 0.3})`;
            ctx.beginPath();
            ctx.arc(x + 16, y + 16, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
            ctx.beginPath();
            ctx.arc(x + 16, y + 16, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + 16, y + 16, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    getTileColor(type) {
        const colors = {
            'grass': '#5a8c3a',
            'dirt': '#8b6f47',
            'stone': '#555555',
            'path': '#c9a876',
            'forge_floor': '#5a4a3a',
            'water': '#4a7cb8',
            'flower_grass': '#6a9c4a',
            'garden_path': '#d4b888'
        };
        return colors[type] || '#333';
    }
}