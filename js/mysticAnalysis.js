const mysticAnalysis = {
    STORAGE_KEY: 'mysticAnalysisData',
    
    luckyDirection: {
        0: '北方',
        1: '东北',
        2: '东方',
        3: '东南',
        4: '南方',
        5: '西南',
        6: '西方',
        7: '西北'
    },
    
    luckyEmojis: ['🌟', '🎋', '🍀', '🦋', '🌈', '💎', '🎯', '🐟', '✨', '🔥'],
    
    jiShen: ['天德', '月德', '天恩', '三合', '时德', '民日', '敬安', '玉堂', '四相', '五富'],
    
    xiongShen: ['天罡', '地贼', '五虚', '大耗', '五墓', '九空', '小耗', '天刑'],
    
    divinationResults: [
        { level: '大吉', icon: '🏆', color: '#ffd700', message: '今日紫气东来，鸿运当头！强化必上+20！' },
        { level: '上吉', icon: '🌟', color: '#ff8c00', message: '今日运势旺盛，附魔勋章大概率出1级！' },
        { level: '中吉', icon: '🍀', color: '#32cd32', message: '今日运势尚可，刻印成功率有所提升。' },
        { level: '小吉', icon: '✨', color: '#1e90ff', message: '今日运势平稳，建议先去狗托榜吸吸欧气。' },
        { level: '平', icon: '⚖️', color: '#808080', message: '今日运势平平，建议先攒资源，改日再战。' },
        { level: '小凶', icon: '🌙', color: '#9370db', message: '今日月相不佳，建议多喝热水压压惊。' },
        { level: '中凶', icon: '☁️', color: '#696969', message: '今日云遮月，建议去其他模拟器碰碰运气。' },
        { level: '凶', icon: '🌊', color: '#4682b4', message: '今日浪大水深，建议今日收竿，明日再来。' }
    ],
    
    luckyActivities: {
        diamond: ['超越强化', '进化八星'],
        platinum: ['附魔勋章', '勋章制作'],
        breakthrough: ['超越强化'],
        essence: ['进化八星'],
        coral: ['勋章宝箱', '珍珠组合'],
        crest: ['刻印模拟']
    },
    
    init() {
        this.bindEvents();
        this.updateDescription();
    },
    
    updateDescription() {
        const memberStatus = storageManager.checkMemberStatus();
        const memberDescEl = document.getElementById('mystic-analysis-desc-member');
        const nonMemberDescEl = document.getElementById('mystic-analysis-desc-non-member');
        
        if (memberStatus.activated) {
            if (memberDescEl) memberDescEl.style.display = 'block';
            if (nonMemberDescEl) nonMemberDescEl.style.display = 'none';
        } else {
            if (memberDescEl) memberDescEl.style.display = 'none';
            if (nonMemberDescEl) nonMemberDescEl.style.display = 'block';
        }
    },
    
    bindEvents() {
        const collapseSection = document.getElementById('mystic-analysis-section');
        if (collapseSection) {
            collapseSection.addEventListener('shown.bs.collapse', () => {
                this.analyze();
            });
        }
    },
    
    analyze() {
        const memberStatus = storageManager.checkMemberStatus();
        const contentEl = document.getElementById('mystic-analysis-content');
        const proRequiredEl = document.getElementById('mystic-pro-required');
        const loadingEl = document.getElementById('mystic-loading');
        
        if (!memberStatus.activated) {
            if (contentEl) contentEl.style.display = 'none';
            if (proRequiredEl) proRequiredEl.style.display = 'block';
            return;
        }
        
        if (contentEl) contentEl.style.display = 'block';
        if (proRequiredEl) proRequiredEl.style.display = 'none';
        
        if (loadingEl) {
            loadingEl.style.display = 'inline-block';
        }
        
        setTimeout(() => {
            try {
                const analysis = this.generateAnalysis();
                this.renderAnalysis(analysis);
            } catch (error) {
                console.error('玄学分析出错:', error);
                // 隐藏加载动画
                if (loadingEl) {
                    loadingEl.parentElement.style.display = 'none';
                }
                // 显示错误信息
                if (contentEl) {
                    contentEl.innerHTML = `
                        <div class="text-center py-4">
                            <div style="font-size: 48px; margin-bottom: 16px;">🔮</div>
                            <p class="text-muted">分析过程中遇到问题，请刷新页面重试</p>
                            <button class="btn btn-primary mt-3" onclick="mysticAnalysis.analyze()">重新分析</button>
                        </div>
                    `;
                }
            }
        }, 800);
    },
    
    generateAnalysis() {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const dayOfMonth = now.getDate();
        const month = now.getMonth() + 1;
        const hours = now.getHours();
        
        const divination = this.calculateDivination(now);
        const luckScore = this.calculateLuckScore();
        const resourceAnalysis = this.analyzeResources();
        const simulatorAnalysis = this.analyzeSimulators();
        const luckyPrediction = this.generateLuckyPrediction(divination, luckScore);
        
        return {
            date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
            lunarInfo: this.getLunarInfo(now),
            divination,
            luckScore,
            resourceAnalysis,
            simulatorAnalysis,
            luckyPrediction,
            timestamp: now.getTime()
        };
    },
    
    calculateDivination(date) {
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();
        const month = date.getMonth() + 1;
        const hours = date.getHours();
        
        let baseScore = (dayOfMonth + month + hours) % 100;
        
        const equipment = this.getEquipmentData();
        if (equipment.rod.level >= 15) baseScore += 10;
        if (equipment.reel.level >= 15) baseScore += 10;
        if (equipment.rod.starLevel >= 6) baseScore += 15;
        if (equipment.reel.starLevel >= 6) baseScore += 15;
        if (equipment.rod.badgeLevel > 0 && equipment.rod.badgeLevel <= 3) baseScore += 10;
        if (equipment.reel.badgeLevel > 0 && equipment.reel.badgeLevel <= 3) baseScore += 10;
        
        const crestData = this.getCrestData();
        const crestStages = crestData.crestStages || {};
        const crestValues = Object.values(crestStages);
        const maxCrest = crestValues.length > 0 ? Math.max(...crestValues) : 0;
        if (maxCrest >= 12) baseScore += 15;
        if (maxCrest >= 15) baseScore += 25;
        
        const hourSegment = hours < 6 ? 0 : hours < 12 ? 1 : hours < 18 ? 2 : 3;
        const hourBonus = [3, 8, 12, 5][hourSegment];
        baseScore += hourBonus;
        
        const weekDayBonus = [5, 3, 8, 6, 10, 15, 2][dayOfWeek];
        baseScore += weekDayBonus;
        
        if (dayOfMonth % 7 === 0) baseScore += 10;
        if (dayOfMonth === 1 || dayOfMonth === 15) baseScore += 15;
        
        const seed = dayOfMonth * 100 + month * 10 + hours;
        const randomFactor = ((seed * 9301 + 49297) % 233280) / 233280;
        baseScore += Math.floor(randomFactor * 30) - 15;
        
        baseScore = Math.max(0, Math.min(100, baseScore));
        
        let resultIndex;
        if (baseScore >= 90) resultIndex = 0;
        else if (baseScore >= 75) resultIndex = 1;
        else if (baseScore >= 60) resultIndex = 2;
        else if (baseScore >= 45) resultIndex = 3;
        else if (baseScore >= 35) resultIndex = 4;
        else if (baseScore >= 25) resultIndex = 5;
        else if (baseScore >= 15) resultIndex = 6;
        else resultIndex = 7;
        
        return {
            ...this.divinationResults[resultIndex],
            score: baseScore,
            luckyDirection: this.luckyDirection[(dayOfMonth + hours) % 8],
            luckyEmoji: this.luckyEmojis[(dayOfMonth + month) % 10],
            jiShen: this.jiShen.slice((dayOfWeek + dayOfMonth) % 10, 3),
            xiongShen: this.xiongShen.slice((dayOfWeek + hours) % 8, 2),
            hourSegment,
            weekDayBonus,
            hourBonus
        };
    },
    
    getLunarInfo(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const dayOfWeek = date.getDay();
        const hours = date.getHours();
        
        const lunarMonths = ['正月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '冬月', '腊月'];
        const lunarDays = ['初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
                           '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
                           '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'];
        
        const yi = [
            ['纳财', '交易', '立券'],
            ['祈福', '祭祀', '许愿'],
            ['强化', '进化', '附魔'],
            ['刻印', '制作', '合成'],
            ['钓鱼', '休闲', '娱乐'],
            ['开仓', '出货', '交易'],
            ['祈福', '许愿', '纳财']
        ];
        
        const ji = [
            ['动土', '远行'],
            ['争执', '冲动'],
            ['过度消费', '上头'],
            ['急躁', '连续失败'],
            ['熬夜', '伤身'],
            ['冲动消费', '上头'],
            ['重大决策', '上头']
        ];
        
        return {
            lunarDate: `${lunarMonths[(month - 1) % 12]}${lunarDays[(day - 1) % 30]}`,
            yi: yi[dayOfWeek],
            ji: ji[dayOfWeek],
            timeOfDay: hours < 6 ? '子时' : hours < 9 ? '辰时' : hours < 12 ? '午时' : 
                       hours < 15 ? '未时' : hours < 18 ? '申时' : hours < 21 ? '酉时' : '戌时'
        };
    },
    
    calculateLuckScore() {
        const dogtorScore = this.getDogtorScore();
        const equipmentScore = this.calculateEquipmentScore();
        const activityScore = this.calculateActivityScore();
        
        const totalScore = dogtorScore * 0.4 + equipmentScore * 0.35 + activityScore * 0.25;
        
        let level, levelColor, levelDesc;
        if (totalScore >= 80) {
            level = '欧皇附体';
            levelColor = '#ffd700';
            levelDesc = '您的运气好到令人发指！';
        } else if (totalScore >= 60) {
            level = '运势旺盛';
            levelColor = '#ff8c00';
            levelDesc = '今日有机会获得好运加持';
        } else if (totalScore >= 40) {
            level = '运势平稳';
            levelColor = '#32cd32';
            levelDesc = '运气中规中矩，稳扎稳打为宜';
        } else if (totalScore >= 20) {
            level = '运势偏低';
            levelColor = '#808080';
            levelDesc = '建议保守行事，先攒资源';
        } else {
            level = '急需充值';
            levelColor = '#dc3545';
            levelDesc = '建议先去狗托榜吸吸欧气';
        }
        
        return {
            total: Math.round(totalScore),
            dogtorScore,
            equipmentScore,
            activityScore,
            level,
            levelColor,
            levelDesc
        };
    },
    
    getDogtorScore() {
        if (typeof dogtorLeaderboard === 'undefined' || typeof dogtorLeaderboard.calculateTotalScore !== 'function') return 30;
        
        const { totalScore, breakdown } = dogtorLeaderboard.calculateTotalScore();
        
        if (totalScore >= 50000) return 100;
        if (totalScore >= 30000) return 85;
        if (totalScore >= 15000) return 70;
        if (totalScore >= 8000) return 55;
        if (totalScore >= 4000) return 40;
        if (totalScore >= 1000) return 25;
        
        return 10;
    },
    
    calculateEquipmentScore() {
        const equipment = this.getEquipmentData();
        let score = 0;
        
        const rodLevel = equipment.rod.level;
        const reelLevel = equipment.reel.level;
        score += Math.min(rodLevel - 10, 10) * 3;
        score += Math.min(reelLevel - 10, 10) * 3;
        
        const rodStar = equipment.rod.starLevel;
        const reelStar = equipment.reel.starLevel;
        score += rodStar * 5;
        score += reelStar * 5;
        
        const rodBadge = equipment.rod.badgeLevel;
        const reelBadge = equipment.reel.badgeLevel;
        if (rodBadge > 0 && rodBadge <= 10) score += (11 - rodBadge) * 2;
        if (reelBadge > 0 && reelBadge <= 10) score += (11 - reelBadge) * 2;
        
        return Math.min(100, score);
    },
    
    calculateActivityScore() {
        const resources = this.getResources();
        let score = 50;
        
        if (resources.diamonds > 50000) score -= 10;
        else if (resources.diamonds > 10000) score += 5;
        
        if (resources.platinum > 10000) score -= 5;
        else if (resources.platinum > 1000) score += 5;
        
        if (resources.breakthrough > 500) score -= 5;
        
        const crestData = this.getCrestData();
        const crestStages = crestData.crestStages || {};
        const crestValues = Object.values(crestStages);
        const maxCrest = crestValues.length > 0 ? Math.max(...crestValues) : 0;
        if (maxCrest >= 15) score += 20;
        else if (maxCrest >= 12) score += 10;
        
        return Math.max(0, Math.min(100, score));
    },
    
    analyzeResources() {
        const resources = this.getResources();
        const records = this.getRecords();
        
        const recentRecords = records.filter(r => {
            const recordDate = new Date(r.date);
            const now = new Date();
            const diffDays = (now - recordDate) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        });
        
        let income = { diamond: 0, breakthrough: 0, rawstone: 0, platinum: 0 };
        let expense = { diamond: 0, breakthrough: 0, rawstone: 0, platinum: 0 };
        
        recentRecords.forEach(r => {
            if (r.type === '收入') {
                income.diamond += r.diamond;
                income.breakthrough += r.breakthrough;
                income.rawstone += r.rawstone;
                income.platinum += r.platinum;
            } else {
                expense.diamond += r.diamond;
                expense.breakthrough += r.breakthrough;
                expense.rawstone += r.rawstone;
                expense.platinum += r.platinum;
            }
        });
        
        return {
            current: resources,
            recentIncome: income,
            recentExpense: expense,
            recordCount: records.length,
            recentRecordCount: recentRecords.length,
            efficiency: this.calculateResourceEfficiency(resources)
        };
    },
    
    calculateResourceEfficiency(resources) {
        const efficiencies = [];
        
        if (resources.diamonds > 100000) {
            efficiencies.push({ resource: '钻石', status: '储备充足', suggestion: '建议大胆消费，享受游戏乐趣', emoji: '💎' });
        } else if (resources.diamonds > 50000) {
            efficiencies.push({ resource: '钻石', status: '储备良好', suggestion: '可适度消费，保持理性', emoji: '💎' });
        } else if (resources.diamonds > 10000) {
            efficiencies.push({ resource: '钻石', status: '储备一般', suggestion: '建议适当积累资源', emoji: '💎' });
        }
        
        if (resources.platinum > 50000) {
            efficiencies.push({ resource: '白金', status: '储备充足', suggestion: '勋章附魔正当时', emoji: '⚪' });
        }
        
        if (resources.breakthrough > 1000) {
            efficiencies.push({ resource: '突破券', status: '储备充足', suggestion: '超越强化可以尝试', emoji: '🎫' });
        }
        
        if (resources.essence > 5000) {
            efficiencies.push({ resource: '原石', status: '储备充足', suggestion: '八星进化可尝试', emoji: '🔮' });
        }
        
        return efficiencies;
    },
    
    analyzeSimulators() {
        const data = (dogtorLeaderboard && typeof dogtorLeaderboard.loadSimulatorData === 'function') ? dogtorLeaderboard.loadSimulatorData() : {};
        const equipment = data.equipment || this.getEquipmentData();
        
        const analysis = [];
        
        if (data.beyondEnhancement) {
            const totalCost = data.beyondEnhancement.totalCost || 0;
            const avgLevel = (equipment.rod.level + equipment.reel.level) / 2;
            const efficiency = avgLevel > 10 ? (avgLevel - 10) / Math.max(1, totalCost / 100) : 0;
            
            analysis.push({
                name: '超越强化',
                icon: '🎯',
                data: {
                    rodLevel: equipment.rod.level,
                    reelLevel: equipment.reel.level,
                    totalCost,
                    totalMoney: data.beyondEnhancement.totalMoney || 0
                },
                efficiency: Math.min(100, Math.round(efficiency * 50)),
                suggestion: efficiency > 0.5 ? '运气不错，可继续尝试' : '消耗较大，建议择日再战'
            });
        }
        
        if (data.evolveGaia) {
            const rodAttempts = data.evolveGaia.rodEvolveCount || 0;
            const reelAttempts = data.evolveGaia.reelEvolveCount || 0;
            const rodSuccess = data.evolveGaia.rodSuccessCount || 0;
            const reelSuccess = data.evolveGaia.reelSuccessCount || 0;
            const totalAttempts = rodAttempts + reelAttempts;
            const totalSuccess = rodSuccess + reelSuccess;
            
            analysis.push({
                name: '进化八星',
                icon: '⭐',
                data: {
                    rodStar: equipment.rod.starLevel || 0,
                    reelStar: equipment.reel.starLevel || 0,
                    totalAttempts,
                    totalSuccess
                },
                efficiency: totalAttempts > 0 ? Math.round((totalSuccess / Math.max(1, totalAttempts)) * 100) : 0,
                suggestion: totalSuccess > 0 ? '进化成功，欧气满满' : '尚未成功，继续努力'
            });
        }
        
        if (data.enchantMedal) {
            const totalEnchant = (data.enchantMedal.rodSuccess || 0) + (data.enchantMedal.reelSuccess || 0) +
                               (data.enchantMedal.rodFailure || 0) + (data.enchantMedal.reelFailure || 0);
            const rodBadge = equipment.rod.badgeLevel || 0;
            const reelBadge = equipment.reel.badgeLevel || 0;
            
            analysis.push({
                name: '附魔勋章',
                icon: '✨',
                data: {
                    rodBadgeLevel: rodBadge || '无',
                    reelBadgeLevel: reelBadge || '无',
                    totalEnchant,
                    totalPlatinum: data.enchantMedal.totalPlatinum || 0,
                    totalDiamond: data.enchantMedal.totalDiamond || 0
                },
                efficiency: rodBadge > 0 && rodBadge <= 5 ? 80 : (rodBadge > 0 ? 50 : 30),
                suggestion: rodBadge > 0 && rodBadge <= 3 ? '勋章极品，运气爆棚！' : '继续附魔，追求更高品质'
            });
        }
        
        if (data.badgeBox || data.badgeCraft) {
            const craftedBadges = data.badgeCraft?.craftedBadges || [];
            const fiveStarCount = craftedBadges.filter(b => b && b.stars >= 5).length;
            
            analysis.push({
                name: '勋章系统',
                icon: '🎖️',
                data: {
                    coralCost: data.badgeBox?.totalCost || 0,
                    craftedCount: craftedBadges.length,
                    fiveStarCount,
                    platinumCost: data.badgeCraft?.totalPlatinumCost || 0
                },
                efficiency: fiveStarCount > 0 ? 70 : 30,
                suggestion: fiveStarCount > 0 ? '5星勋章在手，天下我有' : '继续开宝箱，好运就在前方'
            });
        }
        
        if (data.crestEnhance) {
            const crestStages = data.crestEnhance.crestStages || {};
            const stages = Object.values(crestStages);
            const maxStage = stages.length > 0 ? Math.max(...stages) : 0;
            const avgStage = stages.length > 0 ? stages.reduce((a, b) => a + b, 0) / stages.length : 0;
            
            analysis.push({
                name: '刻印模拟',
                icon: '🔥',
                data: {
                    maxStage,
                    avgStage: Math.round(avgStage),
                    totalAttempts: data.crestEnhance.totalAttempts || 0,
                    resetTickets: data.crestEnhance.resetTicketCount || 0
                },
                efficiency: maxStage >= 15 ? 90 : (maxStage >= 12 ? 70 : (maxStage >= 8 ? 50 : 30)),
                suggestion: maxStage >= 15 ? '刻印满级，成就达成！' : '继续努力，XV在向你招手'
            });
        }
        
        return analysis;
    },
    
    generateLuckyPrediction(divination, luckScore) {
        const now = new Date();
        const hours = now.getHours();
        const dayOfWeek = now.getDay();
        
        const bestTimeWindows = [];
        if (hours < 12) {
            bestTimeWindows.push({ time: '今日午时 (11:00-13:00)', reason: '阳气最盛之时' });
            bestTimeWindows.push({ time: '今日辰时 (07:00-09:00)', reason: '朝气蓬勃之时' });
        } else if (hours < 18) {
            bestTimeWindows.push({ time: '今日申时 (15:00-17:00)', reason: '气场平稳之时' });
            bestTimeWindows.push({ time: '明日辰时 (07:00-09:00)', reason: '次日晨光之时' });
        } else {
            bestTimeWindows.push({ time: '明日午时 (11:00-13:00)', reason: '阳气最盛之时' });
            bestTimeWindows.push({ time: '明日巳时 (09:00-11:00)', reason: '晨光普照之时' });
        }
        
        const recommendedActivities = [];
        if (divination.score >= 70) {
            recommendedActivities.push({ activity: '超越强化', icon: '🎯', reason: '今日强化成功率较高' });
            recommendedActivities.push({ activity: '进化八星', icon: '⭐', reason: '今日进化运势旺盛' });
        } else if (divination.score >= 50) {
            recommendedActivities.push({ activity: '附魔勋章', icon: '✨', reason: '今日附魔运势尚可' });
            recommendedActivities.push({ activity: '勋章宝箱', icon: '🎁', reason: '可以试试手气' });
        } else {
            recommendedActivities.push({ activity: '积攒资源', icon: '💰', reason: '今日宜保守行事' });
            recommendedActivities.push({ activity: '查看狗托榜', icon: '🏆', reason: '先去吸吸欧气' });
        }
        
        const warnings = [];
        if (divination.score < 40) {
            warnings.push({ type: 'caution', message: '今日运势偏低，建议避免重大操作' });
            warnings.push({ type: 'tip', message: '建议去狗托榜看看欧皇的表现' });
        }
        if (hours >= 23 || hours < 5) {
            warnings.push({ type: 'health', message: '夜深了，注意休息，明天再战！' });
        }
        
        const luckyNumbers = this.generateLuckyNumbers();
        
        return {
            bestTimeWindows,
            recommendedActivities,
            warnings,
            luckyNumbers,
            mantra: this.getMantra(divination.score)
        };
    },
    
    generateLuckyNumbers() {
        const now = new Date();
        const seed = now.getDate() * 10000 + (now.getMonth() + 1) * 100 + now.getHours();
        
        const numbers = [];
        for (let i = 0; i < 5; i++) {
            const value = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
            numbers.push(Math.floor(value * 100));
        }
        
        return numbers;
    },
    
    getMantra(score) {
        if (score >= 90) return '鸿运当头，挡都挡不住！';
        if (score >= 75) return '气运加持，放手一搏！';
        if (score >= 60) return '稳扎稳打，必有收获！';
        if (score >= 45) return '心平气和，静待时机！';
        if (score >= 30) return '守得云开见月明！';
        return '积蓄力量，厚积薄发！';
    },
    
    getEquipmentData() {
        try {
            const saved = localStorage.getItem('sharedEquipmentData');
            if (saved) {
                const data = JSON.parse(saved);
                return {
                    rod: {
                        level: data.rod?.level || 10,
                        starLevel: data.rod?.starLevel || 0,
                        badgeType: data.rod?.badgeType || null,
                        badgeLevel: data.rod?.badgeLevel || 0,
                        enchanted: data.rod?.enchanted || false
                    },
                    reel: {
                        level: data.reel?.level || 10,
                        starLevel: data.reel?.starLevel || 0,
                        badgeType: data.reel?.badgeType || null,
                        badgeLevel: data.reel?.badgeLevel || 0,
                        enchanted: data.reel?.enchanted || false
                    }
                };
            }
        } catch (e) {
            console.error('加载装备数据失败:', e);
        }
        return {
            rod: { level: 10, starLevel: 0, badgeType: null, badgeLevel: 0, enchanted: false },
            reel: { level: 10, starLevel: 0, badgeType: null, badgeLevel: 0, enchanted: false }
        };
    },
    
    getCrestData() {
        try {
            const saved = localStorage.getItem('crestEnhanceData');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error('加载刻印数据失败:', e);
        }
        return { crestStages: {}, totalAttempts: 0, resetTicketCount: 0 };
    },
    
    getResources() {
        if (window.resourceManager) {
            return window.resourceManager.getResources();
        }
        return { diamonds: 0, breakthrough: 0, essence: 0, platinum: 0, greenNotes: 0, coral: 0 };
    },
    
    getRecords() {
        if (window.app && window.app.records) {
            return window.app.records;
        }
        return [];
    },
    
    renderAnalysis(analysis) {
        const contentEl = document.getElementById('mystic-analysis-content');
        if (!contentEl) return;
        
        const loadingEl = document.getElementById('mystic-loading');
        if (loadingEl) {
            loadingEl.parentElement.style.display = 'none';
        }
        
        contentEl.innerHTML = this.generateHtml(analysis);
        this.afterRender();
    },
    
    generateHtml(analysis) {
        const { divination, luckScore, resourceAnalysis, simulatorAnalysis, luckyPrediction } = analysis;
        
        return `
            <div class="mystic-container">
                <div class="mystic-header text-center mb-4">
                    <div class="mystic-date text-muted small mb-2">${analysis.date} · ${analysis.lunarInfo.lunarDate} · ${analysis.lunarInfo.timeOfDay}</div>
                    <div class="mystic-divination d-flex align-items-center justify-content-center gap-3">
                        <span class="divination-icon" style="font-size: 48px;">${divination.icon}</span>
                        <div class="text-start">
                            <div class="divination-level" style="color: ${divination.color}; font-size: 28px; font-weight: bold;">${divination.level}</div>
                            <div class="divination-message text-muted mt-1">${divination.message}</div>
                        </div>
                    </div>
                </div>
                
                <div class="mystic-score-bar mb-4">
                    <div class="score-label d-flex justify-content-between mb-1">
                        <span>今日运势指数</span>
                        <span style="color: ${divination.color}; font-weight: bold;">${divination.score}/100</span>
                    </div>
                    <div class="progress" style="height: 12px; border-radius: 6px;">
                        <div class="progress-bar" style="width: ${divination.score}%; background: linear-gradient(90deg, ${divination.color}, ${divination.color}aa); border-radius: 6px;"></div>
                    </div>
                </div>
                
                <div class="mystic-quick-info row mb-4 g-2">
                    <div class="col-6">
                        <div class="info-card p-2 bg-light rounded text-center">
                            <div class="text-muted small">吉神方位</div>
                            <div class="fw-bold">${divination.luckyDirection} ${divination.luckyEmoji}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="info-card p-2 bg-light rounded text-center">
                            <div class="text-muted small">幸运数字</div>
                            <div class="fw-bold">${luckyPrediction.luckyNumbers.join(' · ')}</div>
                        </div>
                    </div>
                </div>
                
                <div class="mystic-yiji mb-4">
                    <div class="row g-2">
                        <div class="col-6">
                            <div class="yi-card p-3 rounded" style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9);">
                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <span style="font-size: 20px;">✅</span>
                                    <span class="fw-bold" style="color: #2e7d32;">宜</span>
                                </div>
                                <div class="small">
                                    ${analysis.lunarInfo.yi.map(y => `<span class="badge bg-success me-1 mb-1">${y}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="ji-card p-3 rounded" style="background: linear-gradient(135deg, #ffebee, #ffcdd2);">
                                <div class="d-flex align-items-center gap-2 mb-2">
                                    <span style="font-size: 20px;">❌</span>
                                    <span class="fw-bold" style="color: #c62828;">忌</span>
                                </div>
                                <div class="small">
                                    ${analysis.lunarInfo.ji.map(j => `<span class="badge bg-danger me-1 mb-1">${j}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mystic-luck-score mb-4 p-3 rounded" style="background: linear-gradient(135deg, #f3e5f5, #e1bee7);">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0">综合运气指数</h6>
                        <span class="badge rounded-pill" style="background: ${luckScore.levelColor}; color: white;">${luckScore.level}</span>
                    </div>
                    <div class="row g-2 text-center">
                        <div class="col-4">
                            <div class="luck-subscore">
                                <div class="score-value text-primary fw-bold">${luckScore.dogtorScore}</div>
                                <div class="score-label text-muted small">狗托榜</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="luck-subscore">
                                <div class="score-value text-success fw-bold">${luckScore.equipmentScore}</div>
                                <div class="score-label text-muted small">装备评分</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="luck-subscore">
                                <div class="score-value text-warning fw-bold">${luckScore.activityScore}</div>
                                <div class="score-label text-muted small">活动指数</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-2 text-center text-muted small">${luckScore.levelDesc}</div>
                </div>
                
                <div class="mystic-prediction mb-4">
                    <h6 class="mb-3">🔮 今日运势建议</h6>
                    
                    <div class="prediction-section mb-3">
                        <div class="section-title small text-muted mb-2">⏰ 最佳操作时段</div>
                        ${luckyPrediction.bestTimeWindows.map(w => `
                            <div class="time-window d-flex justify-content-between align-items-center p-2 bg-light rounded mb-1">
                                <span class="fw-bold">${w.time}</span>
                                <span class="text-muted small">${w.reason}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="prediction-section mb-3">
                        <div class="section-title small text-muted mb-2">🎯 推荐活动</div>
                        ${luckyPrediction.recommendedActivities.map(a => `
                            <div class="activity-item d-flex align-items-center gap-2 p-2 bg-light rounded mb-1">
                                <span style="font-size: 18px;">${a.icon}</span>
                                <span class="fw-bold">${a.activity}</span>
                                <span class="text-muted small ms-auto">${a.reason}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${luckyPrediction.warnings.length > 0 ? `
                        <div class="prediction-section mb-3">
                            <div class="section-title small text-muted mb-2">⚠️ 温馨提示</div>
                            ${luckyPrediction.warnings.map(w => `
                                <div class="warning-item p-2 rounded mb-1 ${w.type === 'health' ? 'bg-info bg-opacity-10' : w.type === 'tip' ? 'bg-warning bg-opacity-10' : 'bg-danger bg-opacity-10'}">
                                    <span class="small">${w.message}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                ${simulatorAnalysis.length > 0 ? `
                    <div class="mystic-simulators mb-4">
                        <h6 class="mb-3">📊 模拟器数据分析</h6>
                        <div class="row g-2">
                            ${simulatorAnalysis.map(s => `
                                <div class="col-6">
                                    <div class="simulator-card p-3 bg-light rounded">
                                        <div class="d-flex align-items-center gap-2 mb-2">
                                            <span style="font-size: 20px;">${s.icon}</span>
                                            <span class="fw-bold">${s.name}</span>
                                            <span class="ms-auto badge ${s.efficiency >= 60 ? 'bg-success' : s.efficiency >= 40 ? 'bg-warning' : 'bg-secondary'}">${s.efficiency}%</span>
                                        </div>
                                        <div class="small text-muted">${s.suggestion}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="mystic-mantra text-center p-4 rounded" style="background: linear-gradient(135deg, #fff3e0, #ffe0b2);">
                    <div class="mantra-icon mb-2" style="font-size: 32px;">🧘</div>
                    <div class="mantra-text fw-bold" style="color: #f57c00; font-size: 18px;">"${luckyPrediction.mantra}"</div>
                </div>
                
                <div class="mystic-actions mt-4 text-center">
                    <button class="btn btn-primary me-2" onclick="mysticAnalysis.refresh()">
                        🔄 重新卜卦
                    </button>
                    <button class="btn btn-outline-primary" onclick="mysticAnalysis.share()">
                        📤 分享运势
                    </button>
                </div>
                
                <div class="mystic-disclaimer mt-3 text-center text-muted small">
                    <p class="mb-0">本功能仅供娱乐参考，实际游戏概率请以游戏内为准。理性消费，享受游戏！</p>
                </div>
            </div>
        `;
    },
    
    afterRender() {
        this.saveToHistory();
    },
    
    saveToHistory() {
        try {
            const historyKey = 'mysticAnalysisHistory';
            let history = [];
            const saved = localStorage.getItem(historyKey);
            if (saved) {
                history = JSON.parse(saved);
            }
            
            const now = new Date();
            const todayStr = now.toDateString();
            
            const todayIndex = history.findIndex(h => new Date(h.timestamp).toDateString() === todayStr);
            const analysis = {
                timestamp: now.getTime(),
                level: this._lastDivination?.level || '平',
                score: this._lastDivination?.score || 50
            };
            
            if (todayIndex >= 0) {
                history[todayIndex] = analysis;
            } else {
                history.unshift(analysis);
                if (history.length > 30) {
                    history = history.slice(0, 30);
                }
            }
            
            localStorage.setItem(historyKey, JSON.stringify(history));
        } catch (e) {
            console.error('保存卜卦历史失败:', e);
        }
    },
    
    refresh() {
        const contentEl = document.getElementById('mystic-analysis-content');
        if (!contentEl) return;
        
        contentEl.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2 text-muted">正在重新推演天机...</p>
            </div>
        `;
        
        setTimeout(() => {
            this.analyze();
        }, 1000);
    },
    
    share() {
        const analysis = this._lastAnalysis;
        if (!analysis) {
            alert('请先生成运势分析后再分享');
            return;
        }
        
        const { divination, luckScore } = analysis;
        const shareText = `【钓鱼发烧友运势播报】\n` +
            `📅 ${analysis.date}\n` +
            `🔮 今日运势：${divination.icon} ${divination.level} (${divination.score}分)\n` +
            `💬 ${divination.message}\n` +
            `📊 综合运气：${luckScore.level} (${luckScore.total}分)\n` +
            `\n——来自「钓鱼发烧友：财富积累日记」玄学分析报表`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareText).then(() => {
                alert('运势内容已复制到剪贴板，快去分享给钓友吧！');
            }).catch(() => {
                alert(shareText);
            });
        } else {
            alert(shareText);
        }
    },
    
    set _lastDivination(value) {
        this.__lastDivination = value;
    },
    
    get _lastDivination() {
        return this.__lastDivination;
    },
    
    set _lastAnalysis(value) {
        this.__lastAnalysis = value;
    },
    
    get _lastAnalysis() {
        return this.__lastAnalysis;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    mysticAnalysis.init();
});

if (typeof window !== 'undefined') {
    window.mysticAnalysis = mysticAnalysis;
}
