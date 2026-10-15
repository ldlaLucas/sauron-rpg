// ============================================
// CONSTANTES DE TIPOS DE DANO
// ============================================
const DAMAGE_TYPES = {
    PHYSICAL: 'physical',
    FIRE: 'fire',
    ICE: 'ice',
    LIGHTNING: 'lightning',
    SHADOW: 'shadow',
    LIGHT: 'light'
};

// Cores associadas a cada tipo
const DAMAGE_TYPE_COLORS = {
    'physical': '#ffffff',
    'fire': '#ff6600',
    'ice': '#66ccff',
    'lightning': '#ffff00',
    'shadow': '#8b00ff',
    'light': '#fffacd'
};

// Nomes em português
const DAMAGE_TYPE_NAMES = {
    'physical': 'Físico',
    'fire': 'Fogo',
    'ice': 'Gelo',
    'lightning': 'Elétrico',
    'shadow': 'Sombra',
    'light': 'Luz'
};

// Ícones
const DAMAGE_TYPE_ICONS = {
    'physical': '⚔️',
    'fire': '🔥',
    'ice': '❄️',
    'lightning': '⚡',
    'shadow': '🌑',
    'light': '✨'
};

// ============================================
// SISTEMA DE CÁLCULO DE DANO
// ============================================
class DamageTypeSystem {
    constructor() {
        console.log('🎯 DamageTypeSystem criado');
    }
    
    // Calcula dano final considerando resistências
    calculateDamage(baseDamage, damageType, targetResistances = {}) {
        const resistance = targetResistances[damageType] || 0;
        
        // resistance: 0 = neutro, 0.5 = +50% dano (fraqueza), -0.5 = -50% dano (resistência), 1 = imunidade
        if (resistance >= 1) {
            return { finalDamage: 0, effectiveness: 'immune', multiplier: 0 };
        }
        
        const multiplier = 1 - resistance;
        const finalDamage = Math.max(1, Math.floor(baseDamage * multiplier));
        
        let effectiveness = 'neutral';
        if (resistance <= -0.4) effectiveness = 'weak';      // Fraqueza (toma mais dano)
        else if (resistance >= 0.4) effectiveness = 'resist'; // Resistência (toma menos dano)
        
        return { finalDamage, effectiveness, multiplier };
    }
    
    // Retorna cor do tipo de dano
    getColor(damageType) {
        return DAMAGE_TYPE_COLORS[damageType] || '#ffffff';
    }
    
    // Retorna nome do tipo
    getName(damageType) {
        return DAMAGE_TYPE_NAMES[damageType] || 'Desconhecido';
    }
    
    // Retorna ícone do tipo
    getIcon(damageType) {
        return DAMAGE_TYPE_ICONS[damageType] || '?';
    }
}