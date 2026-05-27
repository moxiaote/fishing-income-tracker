// 玄学分析模块 - 重构版本
class MysticAnalysis {
    constructor() {
        this.STORAGE_KEY = 'mysticAnalysisData';
        
        this.luckyDirection = ['北方', '东北', '东方', '东南', '南方', '西南', '西方', '西北'];
        this.luckyEmojis = ['🌟', '🎋', '🍀', '🦋', '🌈', '💎', '🎯', '🐟', '✨', '🔥'];
        this.jiShen = ['天德', '月德', '天恩', '三合', '时德', '民日', '敬安', '玉堂', '四相', '五富'];
        this.xiongShen = ['天罡', '地贼', '五虚', '大耗', '五墓', '九空', '小耗', '天刑'];
        
        this.divinationResults = [
            { 
                level: '大吉', 
                icon: '🏆', 
                color: '#ffd700', 
                message: '今日紫气东来，鸿运当头！强化必上+20！',
                messages: [
                    '今日紫气东来，鸿运当头！强化必上+20！',
                    '天纵奇才，运势如虹！今日强化如有神助！',
                    '吉星高照，百无禁忌！今日操作皆可成！',
                    '运势极盛，如日中天！附魔勋章必出极品！',
                    '气运滔天，万法归一！今日是你的幸运日！',
                    '时来运转，否极泰来！今日必出金闪闪！'
                ]
            },
            { 
                level: '上吉', 
                icon: '🌟', 
                color: '#ff8c00', 
                message: '今日运势旺盛，附魔勋章大概率出1级！',
                messages: [
                    '今日运势旺盛，附魔勋章大概率出1级！',
                    '福星高照，万事顺遂！强化成功率翻倍！',
                    '祥云瑞气，好运连连！八星进化大有可为！',
                    '紫气氤氲，运势上升！今日手气不错！',
                    '红鸾星动，喜事临门！勋章宝箱有惊喜！',
                    '贵人相助，吉人天相！刻印成功率大涨！'
                ]
            },
            { 
                level: '中吉', 
                icon: '🍀', 
                color: '#32cd32', 
                message: '今日运势尚可，刻印成功率有所提升。',
                messages: [
                    '今日运势尚可，刻印成功率有所提升。',
                    '吉光片羽，小有收获！适度强化见好就收。',
                    '和风细雨，稳中求进！建议循序渐进。',
                    '春风拂面，心情舒畅！今日适合佛系操作。',
                    '曙光初现，渐入佳境！耐心等待好运降临。',
                    '柳暗花明，峰回路转！坚持就是胜利！'
                ]
            },
            { 
                level: '小吉', 
                icon: '✨', 
                color: '#1e90ff', 
                message: '今日运势平稳，建议先去狗托榜吸吸欧气。',
                messages: [
                    '今日运势平稳，建议先去狗托榜吸吸欧气。',
                    '波澜不惊，稳如泰山！建议观望为主。',
                    '清风徐来，水波不兴！今日适合攒资源。',
                    '云淡风轻，心如止水！先观望，再行动。',
                    '月明星稀，万物静寂！今日宜静不宜动。',
                    '平淡是真，细水长流！慢慢来，不要急。'
                ]
            },
            { 
                level: '平', 
                icon: '⚖️', 
                color: '#808080', 
                message: '今日运势平平，建议先攒资源，改日再战。',
                messages: [
                    '今日运势平平，建议先攒资源，改日再战。',
                    '不上不下，不偏不倚！今日宜休养生息。',
                    '波澜不惊，稳扎稳打！建议积攒实力。',
                    '运势平稳，中规中矩！今日不宜冒险。',
                    '不温不火，从容不迫！先攒资源，等待时机。',
                    '按部就班，循序渐进！今日适合养精蓄锐。'
                ]
            },
            { 
                level: '小凶', 
                icon: '🌙', 
                color: '#9370db', 
                message: '今日月相不佳，建议多喝热水压压惊。',
                messages: [
                    '今日月相不佳，建议多喝热水压压惊。',
                    '月黑风高，阴气渐盛！建议明日再战。',
                    '乌云蔽月，运势低迷！今日宜保守行事。',
                    '月相变化，气场不稳！建议先去狗托榜吸欧气。',
                    '夜色深沉，月光暗淡！今日运气一般般。',
                    '星稀月暗，时运不济！建议暂缓操作。'
                ]
            },
            { 
                level: '中凶', 
                icon: '☁️', 
                color: '#696969', 
                message: '今日云遮月，建议去其他模拟器碰碰运气。',
                messages: [
                    '今日云遮月，建议去其他模拟器碰碰运气。',
                    '乌云密布，大雨将至！建议今日收竿。',
                    '黑云压城，山雨欲来！今日不宜上头。',
                    '云遮雾绕，难见天日！建议换个环境。',
                    '阴雨连绵，心情低落！今日不适宜操作。',
                    '雾气弥漫，方向难辨！建议明日再来。'
                ]
            },
            { 
                level: '凶', 
                icon: '🌊', 
                color: '#4682b4', 
                message: '今日浪大水深，建议今日收竿，明日再来。',
                messages: [
                    '今日浪大水深，建议今日收竿，明日再来。',
                    '惊涛骇浪，船翻网破！今日不宜出海！',
                    '狂风暴雨，雷电交加！建议立刻收手！',
                    '天昏地暗，日月无光！今日大凶，速速退散！',
                    '暗流涌动，危机四伏！今日操作十死无生！',
                    '天翻地覆，诸事不顺！今日绝对不能上头！'
                ]
            }
        ];
        
        this._lastAnalysis = null;
        this._lastDivination = null;
    }
    
    init() {
        console.log('玄学分析模块初始化...');
        this.bindEvents();
    }
    
    bindEvents() {
        const collapseSection = document.getElementById('mystic-analysis-section');
        if (collapseSection) {
            collapseSection.addEventListener('shown.bs.collapse', () => {
                console.log('玄学分析区域展开');
            });
        }
    }
    
    checkMemberAccess() {
        try {
            if (window.storageManager && typeof window.storageManager.checkMemberStatus === 'function') {
                const memberStatus = window.storageManager.checkMemberStatus();
                return memberStatus && memberStatus.activated;
            }
            
            let activationData = localStorage.getItem('activationData');
            if (!activationData) {
                activationData = localStorage.getItem('activation_data');
            }
            
            if (!activationData) {
                return false;
            }
            
            const data = JSON.parse(activationData);
            return data && data.activated;
        } catch (e) {
            console.warn('检查会员状态失败:', e);
            return false;
        }
    }
    
    analyze() {
        console.log('开始玄学分析...');
        
        const contentEl = document.getElementById('mystic-analysis-content');
        if (!contentEl) {
            console.error('contentEl 不存在');
            return;
        }
        
        try {
            if (!this.checkMemberAccess()) {
                contentEl.innerHTML = `
                    <div class="text-center py-4">
                        <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
                        <h6 class="mb-2">解锁玄学分析</h6>
                        <p class="text-muted small mb-3">PRO会员专属功能</p>
                        <p class="text-muted small">请先验证卡密成为会员后使用此功能</p>
                    </div>
                `;
                return;
            }
            
            const now = new Date();
            const divination = this.calculateDivination(now);
            const luckScore = this.calculateLuckScore();
            const resourceAnalysis = this.analyzeResources();
            const simulatorAnalysis = this.analyzeSimulators();
            const luckyPrediction = this.generateLuckyPrediction(divination, luckScore);
            const lunarInfo = this.getLunarInfo(now);
            
            const analysis = {
                date: now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
                lunarInfo,
                divination,
                luckScore,
                resourceAnalysis,
                simulatorAnalysis,
                luckyPrediction,
                timestamp: now.getTime()
            };
            
            this._lastDivination = divination;
            this._lastAnalysis = analysis;
            this.renderAnalysis(analysis);
            
        } catch (error) {
            console.error('玄学分析出错:', error);
            contentEl.innerHTML = `
                <div class="text-center py-4">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔮</div>
                    <p class="text-muted">分析过程中遇到问题</p>
                    <p class="text-muted small">${error.message || '未知错误'}</p>
                    <button class="btn btn-primary mt-3" onclick="MysticAnalysis.instance.analyze()">🔮 重新分析</button>
                </div>
            `;
        }
    }
    
    calculateDivination(date) {
        const dayOfWeek = date.getDay();
        const dayOfMonth = date.getDate();
        const month = date.getMonth() + 1;
        const hours = date.getHours();
        
        let baseScore = (dayOfMonth + month + hours) % 100;
        
        // 根据装备数据调整分数
        const equipment = this.getEquipmentData();
        if (equipment.rod.level >= 15) baseScore += 10;
        if (equipment.reel.level >= 15) baseScore += 10;
        if (equipment.rod.starLevel >= 6) baseScore += 15;
        if (equipment.reel.starLevel >= 6) baseScore += 15;
        
        // 时辰加成
        const hourSegment = hours < 6 ? 0 : hours < 12 ? 1 : hours < 18 ? 2 : 3;
        const hourBonus = [3, 8, 12, 5][hourSegment];
        baseScore += hourBonus;
        
        // 星期加成
        const weekDayBonus = [5, 3, 8, 6, 10, 15, 2][dayOfWeek];
        baseScore += weekDayBonus;
        
        // 特殊日期加成
        if (dayOfMonth % 7 === 0) baseScore += 10;
        if (dayOfMonth === 1 || dayOfMonth === 15) baseScore += 15;
        
        // 随机因素
        const seed = dayOfMonth * 100 + month * 10 + hours;
        const randomFactor = ((seed * 9301 + 49297) % 233280) / 233280;
        baseScore += Math.floor(randomFactor * 30) - 15;
        
        baseScore = Math.max(0, Math.min(100, baseScore));
        
        let resultIndex;
        if (baseScore >= 90) resultIndex = 0;
        else if (baseScore >= 75) resultIndex = 1;
        else if (baseScore >= 60) resultIndex = 2;
        else if (baseScore >= 45) resultIndex = 3;
        else if (baseScore >= 30) resultIndex = 4;
        else if (baseScore >= 15) resultIndex = 5;
        else if (baseScore >= 5) resultIndex = 6;
        else resultIndex = 7;
        
        const jiShenStart = (dayOfWeek + dayOfMonth) % 10;
        const xiongShenStart = (dayOfWeek + hours) % 8;
        
        const result = this.divinationResults[resultIndex];
        const randomMessageIndex = Math.floor((dayOfMonth * 100 + month * 10 + hours + dayOfWeek) % result.messages.length);
        const selectedMessage = result.messages[randomMessageIndex];
        
        return {
            level: result.level,
            icon: result.icon,
            color: result.color,
            message: selectedMessage,
            score: baseScore,
            luckyDirection: this.luckyDirection[(dayOfMonth + hours) % 8],
            luckyEmoji: this.luckyEmojis[(dayOfMonth + month) % 10],
            jiShen: this.jiShen.slice(jiShenStart, Math.min(jiShenStart + 3, this.jiShen.length)),
            xiongShen: this.xiongShen.slice(xiongShenStart, Math.min(xiongShenStart + 2, this.xiongShen.length))
        };
    }
    
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
    }
    
    getDogtorScore() {
        try {
            let totalScore = 0;
            
            // 超越强化得分
            const beyondData = localStorage.getItem('beyondEnhancementData');
            if (beyondData) {
                const data = JSON.parse(beyondData);
                if (data.rodLevel && data.rodLevel > 10) totalScore += (data.rodLevel - 10) * 100;
                if (data.reelLevel && data.reelLevel > 10) totalScore += (data.reelLevel - 10) * 100;
            }
            
            // 进化八星得分
            const gaiaData = localStorage.getItem('evolveGaiaData');
            if (gaiaData) {
                const data = JSON.parse(gaiaData);
                if (data.rodStarLevel) totalScore += data.rodStarLevel * 500;
                if (data.reelStarLevel) totalScore += data.reelStarLevel * 500;
            }
            
            // 附魔勋章得分
            const enchantData = localStorage.getItem('enchantMedalData');
            if (enchantData) {
                const data = JSON.parse(enchantData);
                if (data.rodBadgeLevel > 0 && data.rodBadgeLevel <= 10) totalScore += (11 - data.rodBadgeLevel) * 200;
                if (data.reelBadgeLevel > 0 && data.reelBadgeLevel <= 10) totalScore += (11 - data.reelBadgeLevel) * 200;
            }
            
            // 刻印模拟得分
            const crestData = localStorage.getItem('crestEnhanceData');
            if (crestData) {
                const data = JSON.parse(crestData);
                const crestStages = data.crestStages || {};
                const stages = Object.values(crestStages);
                if (stages.length > 0) {
                    const maxStage = Math.max(...stages);
                    totalScore += maxStage * 300;
                }
            }
            
            // 勋章系统得分
            const craftData = localStorage.getItem('badgeCraftData');
            if (craftData) {
                const data = JSON.parse(craftData);
                const craftedBadges = data.craftedBadges || [];
                const fiveStarCount = craftedBadges.filter(b => b && b.stars >= 5).length;
                totalScore += fiveStarCount * 1000;
            }
            
            if (totalScore >= 50000) return 100;
            if (totalScore >= 30000) return 85;
            if (totalScore >= 15000) return 70;
            if (totalScore >= 8000) return 55;
            if (totalScore >= 4000) return 40;
            if (totalScore >= 1000) return 25;
            return totalScore > 0 ? 20 : 30;
        } catch (e) {
            console.warn('计算狗托榜分数失败:', e);
            return 30;
        }
    }
    
    calculateEquipmentScore() {
        const equipment = this.getEquipmentData();
        let score = 0;
        
        score += Math.min(equipment.rod.level - 10, 10) * 3;
        score += Math.min(equipment.reel.level - 10, 10) * 3;
        score += equipment.rod.starLevel * 5;
        score += equipment.reel.starLevel * 5;
        
        if (equipment.rod.badgeLevel > 0 && equipment.rod.badgeLevel <= 10) score += (11 - equipment.rod.badgeLevel) * 2;
        if (equipment.reel.badgeLevel > 0 && equipment.reel.badgeLevel <= 10) score += (11 - equipment.reel.badgeLevel) * 2;
        
        return Math.min(100, score);
    }
    
    calculateActivityScore() {
        const resources = this.getResources();
        let score = 50;
        
        if (resources.diamonds > 50000) score -= 10;
        else if (resources.diamonds > 10000) score += 5;
        
        if (resources.platinum > 10000) score -= 5;
        else if (resources.platinum > 1000) score += 5;
        
        const crestData = this.getCrestData();
        const crestValues = Object.values(crestData.crestStages || {});
        const maxCrest = crestValues.length > 0 ? Math.max(...crestValues) : 0;
        if (maxCrest >= 15) score += 20;
        else if (maxCrest >= 12) score += 10;
        
        return Math.max(0, Math.min(100, score));
    }
    
    analyzeResources() {
        const resources = this.getResources();
        
        const efficiencies = [];
        if (resources.diamonds > 100000) {
            efficiencies.push({ resource: '钻石', status: '储备充足', suggestion: '建议大胆消费', emoji: '💎' });
        } else if (resources.diamonds > 50000) {
            efficiencies.push({ resource: '钻石', status: '储备良好', suggestion: '可适度消费', emoji: '💎' });
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
        
        return {
            resources,
            recentRecordCount: 0,
            efficiency: efficiencies
        };
    }
    
    analyzeSimulators() {
        const analysis = [];
        
        // 超越强化
        try {
            const beyondData = localStorage.getItem('beyondEnhancementData');
            if (beyondData) {
                const data = JSON.parse(beyondData);
                const rodLevel = data.rodLevel || 10;
                const reelLevel = data.reelLevel || 10;
                analysis.push({
                    name: '超越强化',
                    icon: '🎯',
                    data: { rodLevel, reelLevel },
                    efficiency: rodLevel > 10 || reelLevel > 10 ? 70 : 30,
                    suggestion: rodLevel > 10 || reelLevel > 10 ? '强化成功，运气不错！' : '尚未突破，继续努力'
                });
            }
        } catch (e) { console.warn('超越强化分析失败:', e); }
        
        // 进化八星
        try {
            const gaiaData = localStorage.getItem('evolveGaiaData');
            if (gaiaData) {
                const data = JSON.parse(gaiaData);
                analysis.push({
                    name: '进化八星',
                    icon: '⭐',
                    data: { rodStar: data.rodStarLevel || 0, reelStar: data.reelStarLevel || 0 },
                    efficiency: (data.rodStarLevel || data.reelStarLevel) ? 80 : 30,
                    suggestion: (data.rodStarLevel || data.reelStarLevel) ? '进化成功，欧气满满！' : '尚未进化，继续努力'
                });
            }
        } catch (e) { console.warn('进化八星分析失败:', e); }
        
        // 附魔勋章
        try {
            const enchantData = localStorage.getItem('enchantMedalData');
            if (enchantData) {
                const data = JSON.parse(enchantData);
                analysis.push({
                    name: '附魔勋章',
                    icon: '✨',
                    data: { rodBadge: data.rodBadgeLevel || '无', reelBadge: data.reelBadgeLevel || '无' },
                    efficiency: (data.rodBadgeLevel || data.reelBadgeLevel) ? 75 : 30,
                    suggestion: (data.rodBadgeLevel === 1 || data.reelBadgeLevel === 1) ? '勋章极品！' : '继续附魔'
                });
            }
        } catch (e) { console.warn('附魔勋章分析失败:', e); }
        
        // 刻印模拟
        try {
            const crestData = localStorage.getItem('crestEnhanceData');
            if (crestData) {
                const data = JSON.parse(crestData);
                const stages = Object.values(data.crestStages || {});
                const maxStage = stages.length > 0 ? Math.max(...stages) : 0;
                analysis.push({
                    name: '刻印模拟',
                    icon: '🔥',
                    data: { maxStage },
                    efficiency: maxStage >= 15 ? 90 : (maxStage >= 10 ? 60 : 30),
                    suggestion: maxStage >= 15 ? '刻印大师！' : '继续努力'
                });
            }
        } catch (e) { console.warn('刻印模拟分析失败:', e); }
        
        return analysis;
    }
    
    generateLuckyPrediction(divination, luckScore) {
        const hours = new Date().getHours();
        
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
        }
        if (hours >= 23 || hours < 5) {
            warnings.push({ type: 'health', message: '夜深了，注意休息！' });
        }
        
        const luckyNumbers = this.generateLuckyNumbers();
        
        return {
            bestTimeWindows,
            recommendedActivities,
            warnings,
            luckyNumbers,
            mantra: this.getMantra(divination.score)
        };
    }
    
    generateLuckyNumbers() {
        const now = new Date();
        const seed = now.getDate() * 10000 + (now.getMonth() + 1) * 100 + now.getHours();
        const numbers = [];
        for (let i = 0; i < 5; i++) {
            const value = ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;
            numbers.push(Math.floor(value * 100));
        }
        return numbers;
    }
    
    getMantra(score) {
        if (score >= 90) return '鸿运当头，挡都挡不住！';
        if (score >= 75) return '气运加持，放手一搏！';
        if (score >= 60) return '稳扎稳打，必有收获！';
        if (score >= 45) return '心平气和，静待时机！';
        if (score >= 30) return '守得云开见月明！';
        return '积蓄力量，厚积薄发！';
    }
    
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
    }
    
    getEquipmentData() {
        try {
            const saved = localStorage.getItem('sharedEquipmentData');
            if (saved) {
                const data = JSON.parse(saved);
                return {
                    rod: {
                        level: data.rod?.level || 10,
                        starLevel: data.rod?.starLevel || 0,
                        badgeLevel: data.rod?.badgeLevel || 0
                    },
                    reel: {
                        level: data.reel?.level || 10,
                        starLevel: data.reel?.starLevel || 0,
                        badgeLevel: data.reel?.badgeLevel || 0
                    }
                };
            }
        } catch (e) { console.error('加载装备数据失败:', e); }
        
        return {
            rod: { level: 10, starLevel: 0, badgeLevel: 0 },
            reel: { level: 10, starLevel: 0, badgeLevel: 0 }
        };
    }
    
    getCrestData() {
        try {
            const saved = localStorage.getItem('crestEnhanceData');
            if (saved) return JSON.parse(saved);
        } catch (e) { console.error('加载刻印数据失败:', e); }
        return { crestStages: {}, totalAttempts: 0 };
    }
    
    getResources() {
        if (window.resourceManager) {
            return window.resourceManager.getResources();
        }
        return { diamonds: 0, breakthrough: 0, essence: 0, platinum: 0, greenNotes: 0, coral: 0 };
    }
    
    renderAnalysis(analysis) {
        const contentEl = document.getElementById('mystic-analysis-content');
        if (!contentEl) return;
        
        const { divination, luckScore, simulatorAnalysis, luckyPrediction } = analysis;
        
        contentEl.innerHTML = `
            <div class="mystic-container">
                <div class="mystic-header text-center mb-4">
                    <div class="mystic-date text-muted small mb-2">${analysis.date} · ${analysis.lunarInfo.lunarDate}</div>
                    <div class="mystic-divination d-flex align-items-center justify-content-center gap-3">
                        <span style="font-size: 48px;">${divination.icon}</span>
                        <div class="text-start">
                            <div style="color: ${divination.color}; font-size: 28px; font-weight: bold;">${divination.level}</div>
                            <div class="text-muted mt-1">${divination.message}</div>
                        </div>
                    </div>
                </div>
                
                <div class="mystic-score-bar mb-4">
                    <div class="d-flex justify-content-between mb-1">
                        <span>今日运势指数</span>
                        <span style="color: ${divination.color}; font-weight: bold;">${divination.score}/100</span>
                    </div>
                    <div class="progress" style="height: 12px; border-radius: 6px;">
                        <div class="progress-bar" style="width: ${divination.score}%; background: linear-gradient(90deg, ${divination.color}, ${divination.color}aa); border-radius: 6px;"></div>
                    </div>
                </div>
                
                <div class="row mb-4 g-2">
                    <div class="col-6">
                        <div class="p-2 bg-light rounded text-center">
                            <div class="text-muted small">吉神方位</div>
                            <div class="fw-bold">${divination.luckyDirection} ${divination.luckyEmoji}</div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-2 bg-light rounded text-center">
                            <div class="text-muted small">幸运数字</div>
                            <div class="fw-bold">${luckyPrediction.luckyNumbers.join(' · ')}</div>
                        </div>
                    </div>
                </div>
                
                <div class="row g-2 mb-4">
                    <div class="col-6">
                        <div class="p-3 rounded" style="background: linear-gradient(135deg, #e8f5e9, #c8e6c9);">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span>✅</span>
                                <span class="fw-bold" style="color: #2e7d32;">宜</span>
                            </div>
                            <div class="small">
                                ${analysis.lunarInfo.yi.map(y => `<span class="badge bg-success me-1 mb-1">${y}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="col-6">
                        <div class="p-3 rounded" style="background: linear-gradient(135deg, #ffebee, #ffcdd2);">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span>❌</span>
                                <span class="fw-bold" style="color: #c62828;">忌</span>
                            </div>
                            <div class="small">
                                ${analysis.lunarInfo.ji.map(j => `<span class="badge bg-danger me-1 mb-1">${j}</span>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="p-3 rounded mb-4" style="background: linear-gradient(135deg, #f3e5f5, #e1bee7);">
                    <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="mb-0">综合运气指数</h6>
                        <span class="badge rounded-pill" style="background: ${luckScore.levelColor}; color: white;">${luckScore.level}</span>
                    </div>
                    <div class="row g-2 text-center">
                        <div class="col-4">
                            <div class="score-value text-primary fw-bold">${luckScore.dogtorScore}</div>
                            <div class="score-label text-muted small">狗托榜</div>
                        </div>
                        <div class="col-4">
                            <div class="score-value text-success fw-bold">${luckScore.equipmentScore}</div>
                            <div class="score-label text-muted small">装备评分</div>
                        </div>
                        <div class="col-4">
                            <div class="score-value text-warning fw-bold">${luckScore.activityScore}</div>
                            <div class="score-label text-muted small">活动指数</div>
                        </div>
                    </div>
                    <div class="mt-2 text-center text-muted small">${luckScore.levelDesc}</div>
                </div>
                
                <div class="mb-4">
                    <h6 class="mb-3">🔮 今日运势建议</h6>
                    
                    <div class="mb-3">
                        <div class="small text-muted mb-2">⏰ 最佳操作时段</div>
                        ${luckyPrediction.bestTimeWindows.map(w => `
                            <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded mb-1">
                                <span class="fw-bold">${w.time}</span>
                                <span class="text-muted small">${w.reason}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="mb-3">
                        <div class="small text-muted mb-2">🎯 推荐活动</div>
                        ${luckyPrediction.recommendedActivities.map(a => `
                            <div class="d-flex align-items-center gap-2 p-2 bg-light rounded mb-1">
                                <span style="font-size: 18px;">${a.icon}</span>
                                <span class="fw-bold">${a.activity}</span>
                                <span class="text-muted small ms-auto">${a.reason}</span>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${luckyPrediction.warnings.length > 0 ? `
                        <div class="mb-3">
                            <div class="small text-muted mb-2">⚠️ 温馨提示</div>
                            ${luckyPrediction.warnings.map(w => `
                                <div class="p-2 rounded mb-1 ${w.type === 'health' ? 'bg-info bg-opacity-10' : 'bg-danger bg-opacity-10'}">
                                    <span class="small">${w.message}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                ${simulatorAnalysis.length > 0 ? `
                    <div class="mb-4">
                        <h6 class="mb-3">📊 模拟器数据分析</h6>
                        <div class="row g-2">
                            ${simulatorAnalysis.map(s => `
                                <div class="col-6">
                                    <div class="p-3 bg-light rounded">
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
                
                <div class="text-center p-4 rounded" style="background: linear-gradient(135deg, #fff3e0, #ffe0b2);">
                    <div style="font-size: 32px; margin-bottom: 10px;">🧘</div>
                    <div style="color: #f57c00; font-size: 18px; font-weight: bold;">"${luckyPrediction.mantra}"</div>
                </div>
                
                <div class="mt-3 text-center text-muted small">
                    <p class="mb-0">本功能仅供娱乐参考，实际游戏概率请以游戏内为准。理性消费，享受游戏！</p>
                </div>
            </div>
        `;
    }
}

// 创建单例实例
MysticAnalysis.instance = new MysticAnalysis();

// 全局函数供HTML调用
window.runMysticAnalysis = function() {
    console.log('手动触发玄学分析...');
    try {
        const contentEl = document.getElementById('mystic-analysis-content');
        if (!contentEl) return;
        
        if (!MysticAnalysis.instance.checkMemberAccess()) {
            contentEl.innerHTML = `
                <div class="text-center py-4">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔒</div>
                    <h6 class="mb-2">解锁玄学分析</h6>
                    <p class="text-muted small mb-3">PRO会员专属功能</p>
                    <p class="text-muted small">请先验证卡密成为会员后使用此功能</p>
                </div>
            `;
            return;
        }
        
        contentEl.innerHTML = `
            <div class="text-center py-4">
                <div class="spinner-border text-primary" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
                <p class="mt-2 text-muted">正在分析您的运势数据...</p>
            </div>
        `;
        
        setTimeout(() => {
            MysticAnalysis.instance.analyze();
        }, 100);
    } catch (e) {
        console.error('runMysticAnalysis 失败:', e);
        const contentEl = document.getElementById('mystic-analysis-content');
        if (contentEl) {
            contentEl.innerHTML = `
                <div class="text-center py-4">
                    <div style="font-size: 48px; margin-bottom: 16px;">🔮</div>
                    <p class="text-muted">分析失败: ${e.message}</p>
                    <button class="btn btn-primary mt-3" onclick="window.runMysticAnalysis()">🔮 重新分析</button>
                </div>
            `;
        }
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('页面加载完成，初始化玄学分析...');
    MysticAnalysis.instance.init();
});

// 也在 window.onload 时初始化一次，确保兼容性
window.addEventListener('load', () => {
    MysticAnalysis.instance.init();
});
