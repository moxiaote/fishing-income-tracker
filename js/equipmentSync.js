const equipmentSync = {
    STORAGE_KEY: 'sharedEquipmentData',
    UPDATE_EVENT: 'equipmentDataUpdated',

    DEFAULT_DATA: {
        rod: {
            name: '大地神盖亚鱼竿',
            baseName: '深渊神利维坦鱼竿',
            level: 10,
            starLevel: 0,
            enchanted: false,
            badgeType: null,
            badgeLevel: 0
        },
        reel: {
            name: '大地神盖亚线轮',
            baseName: '深渊神利维坦线轮',
            level: 10,
            starLevel: 0,
            enchanted: false,
            badgeType: null,
            badgeLevel: 0
        }
    },

    getData() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                return this.mergeWithDefault(data);
            }
        } catch (e) {
            console.error('Error loading equipment data:', e);
        }
        const defaultData = this.getDefaultData();
        this.saveData(defaultData);
        return defaultData;
    },

    getDefaultData() {
        return JSON.parse(JSON.stringify(this.DEFAULT_DATA));
    },

    mergeWithDefault(data) {
        const defaultData = this.getDefaultData();
        for (const key of ['rod', 'reel']) {
            if (!data[key]) {
                data[key] = defaultData[key];
            } else {
                for (const field of Object.keys(defaultData[key])) {
                    if (data[key][field] === undefined || data[key][field] === null) {
                        data[key][field] = defaultData[key][field];
                    }
                }
            }
        }
        return data;
    },

    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
            this.notifyUpdate(data);
            return true;
        } catch (e) {
            console.error('Error saving equipment data:', e);
            return false;
        }
    },

    updateRod(updates) {
        const data = this.getData();
        data.rod = { ...data.rod, ...updates };
        return this.saveData(data);
    },

    updateReel(updates) {
        const data = this.getData();
        data.reel = { ...data.reel, ...updates };
        return this.saveData(data);
    },

    updateBoth(rodUpdates, reelUpdates) {
        const data = this.getData();
        data.rod = { ...data.rod, ...rodUpdates };
        data.reel = { ...data.reel, ...reelUpdates };
        return this.saveData(data);
    },

    resetToDefault() {
        const data = this.getDefaultData();
        this.saveData(data);
        return data;
    },

    notifyUpdate(data) {
        try {
            const event = new CustomEvent(this.UPDATE_EVENT, {
                detail: data
            });
            window.dispatchEvent(event);
        } catch (e) {
        }
    },

    listen(callback) {
        const handler = (e) => callback(e.detail);
        window.addEventListener(this.UPDATE_EVENT, handler);
        return () => window.removeEventListener(this.UPDATE_EVENT, handler);
    },

    getDisplayLevel(equipment) {
        if (equipment.starLevel > 0) {
            return `+${equipment.level} ⭐${equipment.starLevel}`;
        }
        return `+${equipment.level}`;
    },
    
    getSimpleLevel(equipment) {
        return `+${equipment.level}`;
    },

    isGaiaSet(equipment) {
        return equipment.starLevel < 8;
    },

    getEquipmentName(equipment) {
        return this.isGaiaSet(equipment) ? equipment.name : equipment.baseName;
    }
};

if (typeof window !== 'undefined') {
    window.equipmentSync = equipmentSync;
}
