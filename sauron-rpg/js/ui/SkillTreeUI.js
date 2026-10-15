class SkillTreeUI {
    constructor(skillTree) {
        this.skillTree = skillTree;
        this.container = document.getElementById('skill-tree-ui');
        this.closeBtn = document.getElementById('skill-tree-close');
        this.content = document.getElementById('skill-tree-content');
        this.active = false;
        this.currentPath = 'creation';
        
        this.closeBtn.addEventListener('click', () => {
            this.hide();
        });
        
        // Abas de caminho
        this.pathButtons = {
            creation: document.getElementById('path-creation'),
            order: document.getElementById('path-order'),
            power: document.getElementById('path-power')
        };
        
        for (const path in this.pathButtons) {
            this.pathButtons[path].addEventListener('click', () => {
                this.currentPath = path;
                this.updatePathButtons();
                this.render();
            });
        }
    }
    
    show() {
        this.container.style.display = 'flex';
        this.active = true;
        this.updatePathButtons();
        this.render();
    }
    
        hide() {
        this.container.style.display = 'none';
        this.active = false;
        
        // ✅ CORREÇÃO: NÃO chama skillTree.close() para evitar recursão
        // Apenas atualiza o estado do skillTree diretamente
        if (this.skillTree) {
            this.skillTree.active = false;
        }
    }
    
    updatePathButtons() {
        for (const path in this.pathButtons) {
            if (path === this.currentPath) {
                this.pathButtons[path].classList.add('active');
            } else {
                this.pathButtons[path].classList.remove('active');
            }
        }
    }
    
    render() {
        // Header com pontos disponíveis
        const header = `
            <div class="skill-tree-header-info">
                <div class="skill-points">🌟 Pontos disponíveis: <span class="points-value">${this.skillTree.skillPoints}</span></div>
            </div>
        `;
        
        // Habilidades do caminho atual
        const pathSkills = Object.values(this.skillTree.skills)
            .filter(s => s.path === this.currentPath)
            .sort((a, b) => a.tier - b.tier);
        
        let skillsHTML = '<div class="skills-list">';
        
        for (const skill of pathSkills) {
            const unlocked = this.skillTree.hasSkill(skill.id);
            const canUnlock = this.skillTree.canUnlock(skill.id);
            const locked = !unlocked && !canUnlock;
            
            let statusClass = 'locked';
            let statusText = '🔒 Bloqueada';
            if (unlocked) {
                statusClass = 'unlocked';
                statusText = '✅ Desbloqueada';
            } else if (canUnlock) {
                statusClass = 'available';
                statusText = '🌟 Disponível';
            }
            
            let requiresText = '';
            if (skill.requires.length > 0) {
                const reqNames = skill.requires.map(r => this.skillTree.skills[r].name);
                requiresText = `<div class="skill-requires">Requer: ${reqNames.join(', ')}</div>`;
            }
            
            skillsHTML += `
                <div class="skill-card ${statusClass}" data-skill-id="${skill.id}">
                    <div class="skill-icon">${skill.icon}</div>
                    <div class="skill-info">
                        <div class="skill-name">${skill.name}</div>
                        <div class="skill-description">${skill.description}</div>
                        ${requiresText}
                        <div class="skill-status ${statusClass}">${statusText}</div>
                    </div>
                    ${!unlocked ? `<button class="skill-unlock-btn" ${!canUnlock ? 'disabled' : ''} data-skill-id="${skill.id}">DESBLOQUEAR (${skill.cost}🌟)</button>` : ''}
                </div>
            `;
        }
        
        skillsHTML += '</div>';
        
        this.content.innerHTML = header + skillsHTML;
        
        // Adiciona listeners aos botões de desbloquear
        this.content.querySelectorAll('.skill-unlock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillId = e.target.dataset.skillId;
                if (this.skillTree.unlock(skillId)) {
                    this.render();
                }
            });
        });
    }
}