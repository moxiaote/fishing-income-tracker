const resourceManager = {
    STORAGE_KEY: 'fishingResourceData',
    UPDATE_EVENT: 'fishingResourceUpdate',
    autoCollectInterval: null,

    defaultResources: {
        diamonds: 0,
        breakthrough: 0,
        essence: 0,
        platinum: 0,
        greenNotes: 0,
        coral: 0
    },

    simulatorData: {
        enchantMedal: {
            key: 'enchantMedalData',
            mapping: {
                platinum: 'totalPlatinum',
                diamonds: 'totalDiamond'
            }
        },
        badgeCraft: {
            key: 'badgeCraftData',
            mapping: {
                platinum: 'totalPlatinumCost',
                diamonds: 'totalDiamondCost'
            }
        },
        beyondEnhancement: {
            key: 'beyondEnhancementData',
            mapping: {
                breakthrough: 'totalCost',
                greenNotes: 'totalMoney'
            }
        },
        badgeBox: {
            key: 'badgeBoxData',
            mapping: {
                coral: 'totalCost'
            }
        },
        evolveGaia: {
            key: 'evolveGaiaData',
            mapping: {
                essence: 'totalOre',
                platinum: 'totalPlatinum',
                diamonds: 'totalDiamond'
            }
        }
    },

    getResources() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                return { ...this.defaultResources, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Error loading resources:', e);
        }
        return { ...this.defaultResources };
    },

    saveResources(resources) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(resources));
        } catch (e) {
            console.error('Error saving resources:', e);
        }
    },

    updateResource(type, amount) {
        const resources = this.getResources();
        if (typeof resources[type] === 'number') {
            resources[type] += amount;
            if (resources[type] < 0) resources[type] = 0;
            this.saveResources(resources);
            this.updateDisplay();
            this.notifyUpdate();
        }
    },

    setResource(type, amount) {
        const resources = this.getResources();
        if (typeof resources[type] === 'number') {
            resources[type] = Math.max(0, amount);
            this.saveResources(resources);
            this.updateDisplay();
            this.notifyUpdate();
        }
    },

    resetResources() {
        this.saveResources({ ...this.defaultResources });
        this.updateDisplay();
        this.notifyUpdate();
    },

    resetAllSimulators() {
        for (const [simulator, config] of Object.entries(this.simulatorData)) {
            try {
                localStorage.removeItem(config.key);
            } catch (e) {
                console.error(`Error resetting ${simulator}:`, e);
            }
        }
        this.resetResources();
    },

    collectFromSimulators() {
        const resources = { ...this.defaultResources };

        for (const [simulator, config] of Object.entries(this.simulatorData)) {
            try {
                const data = localStorage.getItem(config.key);
                if (data) {
                    const parsed = JSON.parse(data);
                    for (const [resource, dataKey] of Object.entries(config.mapping)) {
                        if (parsed[dataKey] !== undefined && parsed[dataKey] !== null) {
                            resources[resource] += Number(parsed[dataKey]) || 0;
                        }
                    }
                }
            } catch (e) {
                console.error(`Error collecting from ${simulator}:`, e);
            }
        }

        this.saveResources(resources);
        this.updateDisplay();
    },

    updateDisplay() {
        const resources = this.getResources();

        const diamondsEl = document.getElementById('total-diamonds');
        const breakthroughEl = document.getElementById('total-breakthrough');
        const essenceEl = document.getElementById('total-essence');
        const platinumEl = document.getElementById('total-platinum');
        const greenNotesEl = document.getElementById('total-greennotes');
        const coralEl = document.getElementById('total-coral');

        function updateElement(element, value) {
            if (!element) return;
            
            const formatted = formatUtils.formatNumberWithSign(value);
            element.title = formatted.full.toString();
            element.dataset.fullValue = formatted.full.toString();
            element.dataset.displayValue = formatted.display;
            element.style.color = '#dc3545';
            element.style.cursor = 'pointer';
            
            if (element.textContent !== element.dataset.fullValue) {
                element.textContent = formatted.display;
            }
        }

        updateElement(diamondsEl, resources.diamonds);
        updateElement(breakthroughEl, resources.breakthrough);
        updateElement(essenceEl, resources.essence);
        updateElement(platinumEl, resources.platinum);
        updateElement(greenNotesEl, resources.greenNotes);
        updateElement(coralEl, resources.coral);
        
        this.updateEquipmentDisplay();
    },
    
    updateEquipmentDisplay() {
        if (typeof window.equipmentSync !== 'undefined') {
            const equipment = window.equipmentSync.getData();
            
            const rodNameEl = document.getElementById('equipment-rod-name');
            const rodLevelEl = document.getElementById('equipment-rod-level');
            const rodSkillEl = document.getElementById('equipment-rod-skill');
            
            const reelNameEl = document.getElementById('equipment-reel-name');
            const reelLevelEl = document.getElementById('equipment-reel-level');
            const reelSkillEl = document.getElementById('equipment-reel-skill');
            
            const rodName = equipment.rod.starLevel >= 8 ? equipment.rod.baseName : equipment.rod.name;
            const reelName = equipment.reel.starLevel >= 8 ? equipment.reel.baseName : equipment.reel.name;
            
            if (rodNameEl) rodNameEl.textContent = rodName;
            if (rodLevelEl) rodLevelEl.textContent = equipment.rod.level;
            
            if (reelNameEl) reelNameEl.textContent = reelName;
            if (reelLevelEl) reelLevelEl.textContent = equipment.reel.level;
            
            const getSkillInfo = (badgeType, badgeLevel) => {
                if (!badgeType || badgeLevel <= 0) return null;
                
                const level = Math.min(badgeLevel, 10);
                
                if (badgeType === 'pirate') {
                    const duration = Math.round(12 - (level - 1) * (4 / 9));
                    const reduction = Math.round(50 - (level - 1) * (20 / 9));
                    return {
                        name: `威慑力（${level}级）`,
                        effect: `使用力量技能时，于${duration}秒内减少放线效果${reduction}%`
                    };
                } else if (badgeType === 'trident') {
                    const duration = Math.round(13 - (level - 1) * (6 / 9));
                    const damage = Math.round(125 - (level - 1) * (50 / 9));
                    return {
                        name: `锐利一击（${level}级）`,
                        effect: `使用拽钓时，于${duration}秒内增加伤害${damage}%`
                    };
                }
                return null;
            };
            
            if (rodSkillEl) {
                if (equipment.rod.badgeType && equipment.rod.badgeLevel > 0) {
                    const skillInfo = getSkillInfo(equipment.rod.badgeType, equipment.rod.badgeLevel);
                    if (skillInfo) {
                        rodSkillEl.innerHTML = `<strong>${skillInfo.name}</strong><br>${skillInfo.effect}`;
                        rodSkillEl.style.display = 'block';
                    } else {
                        rodSkillEl.style.display = 'none';
                    }
                } else {
                    rodSkillEl.style.display = 'none';
                }
            }
            
            if (reelSkillEl) {
                if (equipment.reel.badgeType && equipment.reel.badgeLevel > 0) {
                    const skillInfo = getSkillInfo(equipment.reel.badgeType, equipment.reel.badgeLevel);
                    if (skillInfo) {
                        reelSkillEl.innerHTML = `<strong>${skillInfo.name}</strong><br>${skillInfo.effect}`;
                        reelSkillEl.style.display = 'block';
                    } else {
                        reelSkillEl.style.display = 'none';
                    }
                } else {
                    reelSkillEl.style.display = 'none';
                }
            }
        }
    },

    notifyUpdate() {
        try {
            const event = new CustomEvent(this.UPDATE_EVENT, {
                detail: this.getResources()
            });
            window.dispatchEvent(event);
        } catch (e) {
        }
    },

    startAutoCollect(intervalMs = 3000) {
        this.stopAutoCollect();
        this.autoCollectInterval = setInterval(() => {
            this.collectFromSimulators();
        }, intervalMs);
    },

    stopAutoCollect() {
        if (this.autoCollectInterval) {
            clearInterval(this.autoCollectInterval);
            this.autoCollectInterval = null;
        }
    },

    init(autoCollect = false) {
        this.collectFromSimulators();
        this.updateDisplay();
        if (autoCollect) {
            this.startAutoCollect();
        }
    }
};

if (typeof window !== 'undefined') {
    window.resourceManager = resourceManager;
}
