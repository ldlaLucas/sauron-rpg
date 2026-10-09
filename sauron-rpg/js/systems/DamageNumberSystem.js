class DamageNumberSystem {
    constructor() {
        this.numbers = [];
    }
    
    add(x, y, amount, color = '#fff', critical = false) {
        this.numbers.push({
            x: x,
            y: y,
            amount: amount,
            color: color,
            critical: critical,
            time: 1.0, // segundos na tela
            velocityY: -40 // sobe
        });
    }
    
    update(deltaTime) {
        for (let i = this.numbers.length - 1; i >= 0; i--) {
            const num = this.numbers[i];
            num.time -= deltaTime;
            num.y += num.velocityY * deltaTime;
            num.velocityY *= 0.95; // desacelera
            
            if (num.time <= 0) {
                this.numbers.splice(i, 1);
            }
        }
    }
    
    render(ctx, camera) {
        for (const num of this.numbers) {
            const screenX = num.x - camera.x;
            const screenY = num.y - camera.y;
            
            const alpha = Math.min(1, num.time);
            ctx.globalAlpha = alpha;
            
            ctx.fillStyle = num.color;
            ctx.font = num.critical ? 'bold 18px Arial' : 'bold 14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`-${num.amount}`, screenX, screenY);
        }
        ctx.globalAlpha = 1;
    }
}