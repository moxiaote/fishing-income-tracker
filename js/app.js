// 主应用逻辑
class App {
    constructor() {
        this.records = [];
        this.fileName = 'fishing_income.txt';
        this.statsCard = null;
        this.fixedTotal = null;
        this.loadedRecords = 30; // 默认加载30条
        this.loadBatchSize = 30; // 每次加载30条
        this.currentSimulator = null; // 当前打开的模拟器
        
        // 暴露app实例到全局，供其他模块访问
        window.app = this;
    }

    // 初始化应用
    async init() {
        try {
            // 处理GitHub登录回调
            this.handleGitHubCallback();
            
            // 加载翻译文件
            await i18n.loadTranslations();
            
            // 应用语言
            i18n.applyLanguage();
            
            // 初始化存储
            await storageManager.initDB();
            
            // 加载记录
            this.records = await storageManager.loadRecords();
            
            // 关闭自动从Gist同步数据
            // const synced = await storageManager.syncFromGist();
            // if (synced) {
            //     // 同步成功，重新加载记录
            //     this.records = await storageManager.loadRecords();
            // }
            
            // 初始排序
            sorting.sortRecords(this.records);
            sorting.updateSortIndicators();
            
            // 显示记录
            this.displayRecords();
            
            // 计算总量
            this.calculateTotal();
            
            // 绑定事件
            this.bindEvents();
            
            // 初始化DOM元素
            this.statsCard = document.getElementById('statsCard');
            this.fixedTotal = document.getElementById('fixedTotal');
            
            // 显示云端同步状态
            this.displayCloudSyncStatus();
            
            // 添加滚动监听
            this.addScrollListener();
            
            // 初始化图表
            chartManager.initCharts();
            
            // 更新图表数据
            chartManager.updateCharts(this.records);
            chartManager.updateStatCards(this.records);
            
            // 初始化玄学分析
            if (window.mysticAnalysis) {
                window.mysticAnalysis.init();
            }
            
            // 绑定统计卡片点击事件（支持触摸设备）
            this.bindStatCardClickEvents();

            // 初始化资源管理器，汇总所有小工具的消耗数据，启用自动收集
            if (window.resourceManager) {
                window.resourceManager.init(true);
            }
            
            console.log('初始化成功，使用' + (storageManager.useLocalStorage ? 'localStorage' : 'IndexedDB') + '存储');
        } catch (error) {
            console.error('初始化失败:', error);
            // 静默处理错误，不显示提示
            this.records = [];
            pagination.updatePagination(this.records.length);
            this.displayRecords();
            this.calculateTotal();
        }
    }

    // 绑定事件
    bindEvents() {
        // 添加记录表单提交
        document.getElementById('add-record-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addRecord();
        });

        // 保存到文件按钮
        document.getElementById('save-to-file').addEventListener('click', () => {
            this.saveToFile();
        });

        // 从文件加载按钮
        document.getElementById('load-from-file').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });

        // 文件选择事件
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.loadFromFile(e);
        });

        // 初始化日期为今天
        document.getElementById('date').value = new Date().toISOString().split('T')[0];

        // 加载更多按钮事件
        const loadMoreButton = document.getElementById('load-more');
        if (loadMoreButton) {
            loadMoreButton.addEventListener('click', () => {
                this.loadMoreRecords();
            });
        }

        // 从云端恢复按钮事件
        const loadFromCloudButton = document.getElementById('load-from-cloud');
        if (loadFromCloudButton) {
            loadFromCloudButton.addEventListener('click', () => {
                this.loadFromCloud();
            });
        }

        // 备份到云端按钮事件
        const syncToCloudButton = document.getElementById('sync-to-cloud');
        if (syncToCloudButton) {
            syncToCloudButton.addEventListener('click', () => {
                this.syncToCloud();
            });
        }

        // 上头模拟器按钮事件
        this.bindSimulatorEvents();
    }

    // 播放音符
    playNote(frequency) {
        if (!frequency || frequency <= 0) return;
        
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = parseFloat(frequency);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (e) {
            console.error('Audio play error:', e);
        }
    }

    // 绑定上头模拟器事件
    bindSimulatorEvents() {
        const simulatorButtons = document.querySelectorAll('.simulator-panel-btn');
        if (simulatorButtons.length > 0) {
            simulatorButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const note = button.getAttribute('data-note');
                    this.playNote(note);
                    
                    const target = button.getAttribute('data-target');
                    const i18nKey = button.getAttribute('data-i18n');
                    
                    if (!target || target === '') {
                        this.closeSimulator();
                        return;
                    }
                    
                    if (this.currentSimulator === target) {
                        this.closeSimulator();
                    } else {
                        const container = document.getElementById('simulator-iframe-container');
                        if (container) {
                            container.classList.remove('show');
                        }
                        
                        if (i18nKey === 'donation') {
                            const iframe = document.getElementById('simulator-iframe');
                            if (iframe) {
                                iframe.style.display = 'none';
                            }
                            const donationImg = document.getElementById('donation-image');
                            if (donationImg) {
                                donationImg.style.display = 'block';
                            }
                        } else {
                            const iframe = document.getElementById('simulator-iframe');
                            if (iframe) {
                                iframe.style.display = 'block';
                                iframe.src = target;
                            }
                            const donationImg = document.getElementById('donation-image');
                            if (donationImg) {
                                donationImg.style.display = 'none';
                            }
                        }
                        
                        setTimeout(() => {
                            if (container) {
                                container.classList.add('show');
                            }
                        }, 50);
                        
                        this.currentSimulator = target;
                    }
                });
            });
        }
    }

    // 打开模拟器
    openSimulator(target, title) {
        const container = document.getElementById('simulator-iframe-container');
        const iframe = document.getElementById('simulator-iframe');

        if (container && iframe) {
            // 设置iframe源
            iframe.src = target;
            // 添加显示类以触发动画
            container.classList.add('show');
        }
    }

    // 关闭模拟器
    closeSimulator() {
        const container = document.getElementById('simulator-iframe-container');
        const iframe = document.getElementById('simulator-iframe');

        if (container && iframe) {
            // 移除显示类以触发动画
            container.classList.remove('show');
            // 延迟清空iframe源，等待动画完成
            setTimeout(() => {
                // 清空iframe源
                iframe.src = '';
                // 重置当前模拟器状态
                this.currentSimulator = null;
            }, 300);
        }
    }

    // 添加滚动监听
    addScrollListener() {
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // 初始检查
            this.handleScroll();
            
            // 添加卡片展开事件，重新调整图表尺寸
            this.addCardExpandListeners();
        }

    // 添加卡片展开事件监听器
    addCardExpandListeners() {
        // 监听所有卡片的展开事件
        const collapseElements = document.querySelectorAll('.collapse');
        collapseElements.forEach(collapse => {
            collapse.addEventListener('shown.bs.collapse', () => {
                // 卡片展开后，重新调整图表尺寸
                if (typeof chartManager !== 'undefined') {
                    setTimeout(() => {
                        if (chartManager.trendChart) chartManager.trendChart.resize();
                    }, 100);
                }
            });
        });
    }
    
    // 处理滚动事件
    handleScroll() {
        if (!this.statsCard || !this.fixedTotal) return;
        
        const statsCardRect = this.statsCard.getBoundingClientRect();
        
        // 当统计概览卡片顶部移出视口时，显示固定总量信息
        if (statsCardRect.top < 0) {
            this.fixedTotal.style.display = 'block';
        } else {
            this.fixedTotal.style.display = 'none';
        }
    }

    // 添加记录
    async addRecord() {
        const date = document.getElementById('date').value;
        const type = document.getElementById('type').value;
        const inputDiamond = parseInt(document.getElementById('diamond').value) || 0;
        const inputBreakthrough = parseInt(document.getElementById('breakthrough').value) || 0;
        const inputRawstone = parseInt(document.getElementById('rawstone').value) || 0;
        const inputPlatinum = parseInt(document.getElementById('platinum').value) || 0;
        const remark = document.getElementById('remark').value;

        let record;

        if (type === '设置总额') {
            let currentTotal = {
                diamond: 0,
                breakthrough: 0,
                rawstone: 0,
                platinum: 0
            };

            this.records.forEach(r => {
                const multiplier = (r.type === '收入') ? 1 : -1;
                currentTotal.diamond += r.diamond * multiplier;
                currentTotal.breakthrough += r.breakthrough * multiplier;
                currentTotal.rawstone += r.rawstone * multiplier;
                currentTotal.platinum += r.platinum * multiplier;
            });

            const diffDiamond = inputDiamond - currentTotal.diamond;
            const diffBreakthrough = inputBreakthrough - currentTotal.breakthrough;
            const diffRawstone = inputRawstone - currentTotal.rawstone;
            const diffPlatinum = inputPlatinum - currentTotal.platinum;

            const positiveRecords = [];
            const negativeRecords = [];

            if (diffDiamond > 0) {
                positiveRecords.push({ field: 'diamond', value: diffDiamond });
            } else if (diffDiamond < 0) {
                negativeRecords.push({ field: 'diamond', value: Math.abs(diffDiamond) });
            }
            if (diffBreakthrough > 0) {
                positiveRecords.push({ field: 'breakthrough', value: diffBreakthrough });
            } else if (diffBreakthrough < 0) {
                negativeRecords.push({ field: 'breakthrough', value: Math.abs(diffBreakthrough) });
            }
            if (diffRawstone > 0) {
                positiveRecords.push({ field: 'rawstone', value: diffRawstone });
            } else if (diffRawstone < 0) {
                negativeRecords.push({ field: 'rawstone', value: Math.abs(diffRawstone) });
            }
            if (diffPlatinum > 0) {
                positiveRecords.push({ field: 'platinum', value: diffPlatinum });
            } else if (diffPlatinum < 0) {
                negativeRecords.push({ field: 'platinum', value: Math.abs(diffPlatinum) });
            }

            const remarkText = remark || `总额更新: ${inputDiamond}钻, ${inputBreakthrough}券, ${inputRawstone}石, ${inputPlatinum}金`;

            if (positiveRecords.length > 0 && negativeRecords.length > 0) {
                const incomeRecord = { date: date, type: '收入', diamond: 0, breakthrough: 0, rawstone: 0, platinum: 0, remark: remarkText + ' [增加]' };
                positiveRecords.forEach(p => incomeRecord[p.field] = p.value);

                const expenseRecord = { date: date, type: '支出', diamond: 0, breakthrough: 0, rawstone: 0, platinum: 0, remark: remarkText + ' [减少]' };
                negativeRecords.forEach(n => expenseRecord[n.field] = n.value);

                this.records.unshift(incomeRecord, expenseRecord);
            } else if (positiveRecords.length > 0) {
                record = { date: date, type: '收入', diamond: 0, breakthrough: 0, rawstone: 0, platinum: 0, remark: remarkText };
                positiveRecords.forEach(p => record[p.field] = p.value);
                this.records.unshift(record);
            } else if (negativeRecords.length > 0) {
                record = { date: date, type: '支出', diamond: 0, breakthrough: 0, rawstone: 0, platinum: 0, remark: remarkText };
                negativeRecords.forEach(n => record[n.field] = n.value);
                this.records.unshift(record);
            } else {
                return;
            }

            sorting.sortRecords(this.records);
            await storageManager.saveRecords(this.records);
            this.loadedRecords = 30;
            this.displayRecords();
            this.calculateTotal();
            chartManager.updateCharts(this.records);
            chartManager.updateStatCards(this.records);
            document.getElementById('diamond').value = '0';
            document.getElementById('breakthrough').value = '0';
            document.getElementById('rawstone').value = '0';
            document.getElementById('platinum').value = '0';
            document.getElementById('remark').value = '';
            alert(i18n.getText('recordAdded') || '记录添加成功！');
            toggleAddRecordModal();
            return;
        } else {
            record = {
                date: date,
                type: type,
                diamond: inputDiamond,
                breakthrough: inputBreakthrough,
                rawstone: inputRawstone,
                platinum: inputPlatinum,
                remark: remark
            };
        }

        this.records.unshift(record);
        
        // 重新排序
        sorting.sortRecords(this.records);
        
        // 保存记录
        await storageManager.saveRecords(this.records);
        
        // 关闭自动同步到Gist
        // await storageManager.syncToGist();
        
        // 重置加载记录数
        this.loadedRecords = 30;
        
        // 显示记录
        this.displayRecords();
        
        // 计算总量
        this.calculateTotal();
        
        // 更新图表
        chartManager.updateCharts(this.records);
        chartManager.updateStatCards(this.records);

        // 重置表单
        document.getElementById('diamond').value = '0';
        document.getElementById('breakthrough').value = '0';
        document.getElementById('rawstone').value = '0';
        document.getElementById('platinum').value = '0';
        document.getElementById('remark').value = '';

        alert(i18n.getText('recordAdded') || '记录添加成功！');
        toggleAddRecordModal();
    }

    // 删除记录
    async deleteRecord(index) {
        this.records.splice(index, 1);
        await storageManager.saveRecords(this.records);
        
        // 关闭自动同步到Gist
        // await storageManager.syncToGist();
        
        // 更新分页
        pagination.updatePagination(this.records.length);
        
        // 显示记录
        this.displayRecords();
        
        // 计算总量
        this.calculateTotal();
        
        // 更新图表
        chartManager.updateCharts(this.records);
        chartManager.updateStatCards(this.records);
    }

    // 保存到文件
    saveToFile() {
        storageManager.saveToFile(this.records, this.fileName);
        alert(i18n.getText('dataSaved') || '数据已保存到 fishing_income.txt 文件');
    }

    // 从文件加载
    async loadFromFile(e) {
        const file = e.target.files[0];
        if (file) {
            try {
                const loadedRecords = await storageManager.loadFromFile(file);
                this.records = loadedRecords;
                
                // 重新排序
                sorting.sortRecords(this.records);
                
                // 保存记录
                await storageManager.saveRecords(this.records);
                
                // 关闭自动同步到Gist
                // await storageManager.syncToGist();
                
                // 重置加载记录数
                this.loadedRecords = 30;
                
                // 显示记录
                this.displayRecords();
                
                // 计算总量
                this.calculateTotal();
                
                // 更新图表
                chartManager.updateCharts(this.records);
                chartManager.updateStatCards(this.records);
                
                alert(i18n.getText('dataLoaded') || '数据已从文件加载');

            } catch (error) {
                alert(i18n.getText('fileFormatError') || '文件格式错误，无法加载数据');
            }
        }
    }

    // 显示记录
    displayRecords() {
        const tableBody = document.getElementById('records-table');
        tableBody.innerHTML = '';

        const endIndex = Math.min(this.loadedRecords, this.records.length);

        for (let i = 0; i < endIndex; i++) {
            const record = this.records[i];
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.type}</td>
                <td>${record.diamond}</td>
                <td>${record.breakthrough}</td>
                <td>${record.rawstone}</td>
                <td>${record.platinum}</td>
                <td>${record.remark || '-'}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="app.deleteRecord(${i})" data-i18n="delete">删除</button>
                </td>
            `;
            tableBody.appendChild(row);
        }
        
        // 显示/隐藏加载更多按钮
        const loadMoreContainer = document.getElementById('load-more-container');
        if (loadMoreContainer) {
            if (this.loadedRecords < this.records.length) {
                loadMoreContainer.style.display = 'block';
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
        
        // 应用语言到新添加的元素
        i18n.applyLanguage();
    }

    // 加载更多记录
    loadMoreRecords() {
        this.loadedRecords += this.loadBatchSize;
        this.displayRecords();
    }

    // 格式化大数字为缩写形式（如67K、1M），四舍五入到整数
    formatNumber(num) {
        // 确保num是数字类型
        const numericValue = Number(num) || 0;
        
        if (numericValue >= 1000000) {
            return {
                display: Math.round(numericValue / 1000000).toString() + 'M',
                full: numericValue
            };
        } else if (numericValue >= 1000) {
            return {
                display: Math.round(numericValue / 1000).toString() + 'K',
                full: numericValue
            };
        } else {
            return {
                display: numericValue.toString(),
                full: numericValue
            };
        }
    }

    // 计算总量
    calculateTotal() {
        let total = {
            diamond: 0,
            breakthrough: 0,
            rawstone: 0,
            platinum: 0
        };

        this.records.forEach(record => {
            const multiplier = (record.type === '收入') ? 1 : -1;
            total.diamond += record.diamond * multiplier;
            total.breakthrough += record.breakthrough * multiplier;
            total.rawstone += record.rawstone * multiplier;
            total.platinum += record.platinum * multiplier;
        });

        // 计算今天的变化量（使用本地时间）
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        let todayChange = {
            diamond: 0,
            breakthrough: 0,
            rawstone: 0,
            platinum: 0
        };

        this.records.forEach(record => {
            if (record.date === today) {
                const multiplier = (record.type === '收入') ? 1 : -1;
                todayChange.diamond += record.diamond * multiplier;
                todayChange.breakthrough += record.breakthrough * multiplier;
                todayChange.rawstone += record.rawstone * multiplier;
                todayChange.platinum += record.platinum * multiplier;
            }
        });

        // 格式化所有资源数量
        const formattedDiamond = this.formatNumber(total.diamond);
        const formattedBreakthrough = this.formatNumber(total.breakthrough);
        const formattedRawstone = this.formatNumber(total.rawstone);
        const formattedPlatinum = this.formatNumber(total.platinum);
        
        // 更新统计概览显示
        const diamondElement = document.getElementById('stat-diamond');
        diamondElement.title = formattedDiamond.full;
        diamondElement.dataset.fullValue = formattedDiamond.full;
        diamondElement.dataset.displayValue = formattedDiamond.display;
        if (!diamondElement.classList.contains('show-full')) {
            diamondElement.textContent = formattedDiamond.display;
        }
        
        const breakthroughElement = document.getElementById('stat-breakthrough');
        breakthroughElement.title = formattedBreakthrough.full;
        breakthroughElement.dataset.fullValue = formattedBreakthrough.full;
        breakthroughElement.dataset.displayValue = formattedBreakthrough.display;
        if (!breakthroughElement.classList.contains('show-full')) {
            breakthroughElement.textContent = formattedBreakthrough.display;
        }
        
        const rawstoneElement = document.getElementById('stat-rawstone');
        rawstoneElement.title = formattedRawstone.full;
        rawstoneElement.dataset.fullValue = formattedRawstone.full;
        rawstoneElement.dataset.displayValue = formattedRawstone.display;
        if (!rawstoneElement.classList.contains('show-full')) {
            rawstoneElement.textContent = formattedRawstone.display;
        }
        
        const platinumElement = document.getElementById('stat-platinum');
        platinumElement.title = formattedPlatinum.full;
        platinumElement.dataset.fullValue = formattedPlatinum.full;
        platinumElement.dataset.displayValue = formattedPlatinum.display;
        if (!platinumElement.classList.contains('show-full')) {
            platinumElement.textContent = formattedPlatinum.display;
        }

        // 更新统计概览变化显示
        this.updateChangeIndicator('stat-diamond-change', todayChange.diamond);
        this.updateChangeIndicator('stat-breakthrough-change', todayChange.breakthrough);
        this.updateChangeIndicator('stat-rawstone-change', todayChange.rawstone);
        this.updateChangeIndicator('stat-platinum-change', todayChange.platinum);
        
        // 更新固定总量显示（显示统计概览数据）
        const fixedDiamondElement = document.getElementById('fixed-diamond');
        fixedDiamondElement.textContent = formattedDiamond.display;
        fixedDiamondElement.title = formattedDiamond.full;
        
        const fixedBreakthroughElement = document.getElementById('fixed-breakthrough');
        fixedBreakthroughElement.textContent = formattedBreakthrough.display;
        fixedBreakthroughElement.title = formattedBreakthrough.full;
        
        const fixedRawstoneElement = document.getElementById('fixed-rawstone');
        fixedRawstoneElement.textContent = formattedRawstone.display;
        fixedRawstoneElement.title = formattedRawstone.full;
        
        const fixedPlatinumElement = document.getElementById('fixed-platinum');
        fixedPlatinumElement.textContent = formattedPlatinum.display;
        fixedPlatinumElement.title = formattedPlatinum.full;

        // 更新固定总量变化显示
        const fixedDiamondChange = document.getElementById('fixed-diamond-change');
        const fixedBreakthroughChange = document.getElementById('fixed-breakthrough-change');
        const fixedRawstoneChange = document.getElementById('fixed-rawstone-change');
        const fixedPlatinumChange = document.getElementById('fixed-platinum-change');

        if (fixedDiamondChange) {
            const prefix = todayChange.diamond >= 0 ? '+' : '';
            fixedDiamondChange.textContent = `${prefix}${todayChange.diamond}`;
            fixedDiamondChange.className = todayChange.diamond >= 0 ? 'fixed-total-change positive' : 'fixed-total-change negative';
        }
        if (fixedBreakthroughChange) {
            const prefix = todayChange.breakthrough >= 0 ? '+' : '';
            fixedBreakthroughChange.textContent = `${prefix}${todayChange.breakthrough}`;
            fixedBreakthroughChange.className = todayChange.breakthrough >= 0 ? 'fixed-total-change positive' : 'fixed-total-change negative';
        }
        if (fixedRawstoneChange) {
            const prefix = todayChange.rawstone >= 0 ? '+' : '';
            fixedRawstoneChange.textContent = `${prefix}${todayChange.rawstone}`;
            fixedRawstoneChange.className = todayChange.rawstone >= 0 ? 'fixed-total-change positive' : 'fixed-total-change negative';
        }
        if (fixedPlatinumChange) {
            const prefix = todayChange.platinum >= 0 ? '+' : '';
            fixedPlatinumChange.textContent = `${prefix}${todayChange.platinum}`;
            fixedPlatinumChange.className = todayChange.platinum >= 0 ? 'fixed-total-change positive' : 'fixed-total-change negative';
        }
    }

    // 获取最近N天的记录
    getRecentRecords(days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        return this.records.filter(record => record.date >= cutoffStr);
    }

    // 更新变化指示器
    updateChangeIndicator(elementId, value) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const prefix = value >= 0 ? '+' : '';
        element.textContent = `${prefix}${value}`;
        
        // 设置颜色
        if (value > 0) {
            element.className = 'stat-change positive';
        } else if (value < 0) {
            element.className = 'stat-change negative';
        } else {
            element.className = 'stat-change';
        }
    }

    // 绑定统计卡片点击事件（支持触摸设备）
    bindStatCardClickEvents() {
        const statValues = document.querySelectorAll('.stat-value, .resource-value');
        statValues.forEach(element => {
            element.addEventListener('click', () => {
                this.toggleFullValue(element);
            });
            element.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.toggleFullValue(element);
            });
        });
    }

    // 切换显示完整值/缩写值
    toggleFullValue(element) {
        const fullValue = element.dataset.fullValue;
        const displayValue = element.dataset.displayValue;
        
        if (!fullValue || !displayValue) return;
        
        if (element.textContent === displayValue) {
            element.textContent = fullValue;
            element.classList.add('show-full');
            setTimeout(() => {
                if (element.textContent === fullValue) {
                    element.textContent = displayValue;
                    element.classList.remove('show-full');
                }
            }, 10000);
        } else {
            element.textContent = displayValue;
            element.classList.remove('show-full');
        }
    }

    // 排序并显示
    sortBy(field) {
        sorting.sortBy(field);
        sorting.sortRecords(this.records);
        pagination.reset();
        pagination.updatePagination(this.records.length);
        this.displayRecords();
    }

    // 显示云端同步状态
    displayCloudSyncStatus() {
        const memberStatus = storageManager.checkMemberStatus();
        const qqElement = document.getElementById('cloud-qq');
        const statusElement = document.getElementById('cloud-status');
        const lastSyncElement = document.getElementById('last-sync-time');
        
        if (qqElement) {
            qqElement.value = memberStatus.activated ? memberStatus.qq : '';
            qqElement.readOnly = true;
        }
        
        if (statusElement) {
            if (memberStatus.activated) {
                statusElement.textContent = '会员已激活';
                statusElement.className = 'text-success';
            } else {
                statusElement.textContent = '未激活会员';
                statusElement.className = 'text-danger';
            }
        }
        
        if (lastSyncElement) {
            const lastSyncTime = localStorage.getItem('lastSyncTime');
            lastSyncElement.textContent = lastSyncTime ? '上次同步: ' + lastSyncTime : '尚未同步';
        }
    }

    // 处理GitHub登录回调（保留空实现，防止报错）
    handleGitHubCallback() {
    }

    // 从云端加载数据
    async loadFromCloud() {
        try {
            const success = await storageManager.downloadFromCloud();
            if (success) {
                this.records = await storageManager.loadRecords();
                sorting.sortRecords(this.records);
                this.loadedRecords = 30;
                this.displayRecords();
                this.calculateTotal();
                chartManager.updateCharts(this.records);
                chartManager.updateStatCards(this.records);
                this.displayCloudSyncStatus();
            }
        } catch (error) {
            console.error('加载失败:', error);
            alert('数据加载失败，请稍后重试。');
        }
    }

    // 从Gist ID加载数据（兼容旧方法）
    async loadFromGist() {
        await this.loadFromCloud();
    }

    // 上传备份到云端
    async syncToCloud() {
        try {
            const success = await storageManager.uploadToCloud();
            if (success) {
                this.displayCloudSyncStatus();
            }
        } catch (error) {
            console.error('备份失败:', error);
            alert('数据备份失败，请稍后重试。');
        }
    }


}

// 创建应用实例
const app = new App();

// 页面加载完成后初始化
window.onload = () => {
    app.init();
    initFloatButton();
};

// 弹窗关闭处理
function initFloatButton() {
    const modal = document.getElementById('add-record-modal');
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            toggleAddRecordModal();
        }
    });
}

// 获取所有数值输入框
const numberInputs = ['diamond', 'breakthrough', 'rawstone', 'platinum'];

// 点击数值框时自动填充其他空框为0
numberInputs.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
        input.addEventListener('click', () => {
            numberInputs.forEach(otherId => {
                if (otherId !== id) {
                    const otherInput = document.getElementById(otherId);
                    if (otherInput && !otherInput.value) {
                        otherInput.value = '0';
                    }
                }
            });
            updateAddRecordBtnState();
        });
        
        input.addEventListener('input', updateAddRecordBtnState);
    }
});

// 更新添加记录按钮状态
function updateAddRecordBtnState() {
    const btn = document.getElementById('add-record-btn');
    if (!btn) return;
    
    const hasValue = numberInputs.some(id => {
        const input = document.getElementById(id);
        return input && input.value !== '';
    });
    
    btn.disabled = !hasValue;
    if (hasValue) {
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
    } else {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-secondary');
    }
}

// 切换添加记录弹窗显示/隐藏
function toggleAddRecordModal() {
    const modal = document.getElementById('add-record-modal');
    if (modal.style.display === 'none' || modal.style.display === '') {
        modal.style.display = 'flex';
        // 设置默认日期为今天
        document.getElementById('date').valueAsDate = new Date();
        // 更新类型下拉框选项的翻译
        updateTypeOptionsTranslation();
    } else {
        modal.style.display = 'none';
    }
}

// 更新类型下拉框选项的翻译
function updateTypeOptionsTranslation() {
    const select = document.getElementById('type');
    if (!select) return;
    
    const options = select.querySelectorAll('option');
    options.forEach(option => {
        const key = option.getAttribute('data-i18n');
        if (key) {
            const translation = i18n.getText(key);
            if (translation) {
                option.textContent = translation;
            }
        }
    });
}

// 排序函数（全局调用）
function sortBy(field) {
    app.sortBy(field);
}

// 分页函数（全局调用）
function goToPage(page) {
    if (pagination.goToPage(page)) {
        app.displayRecords();
    }
}

// 语言切换函数
function changeLanguage(lang) {
    console.log('切换语言:', lang);
    i18n.changeLanguage(lang);
    // 更新类型下拉框选项的翻译
    updateTypeOptionsTranslation();
    console.log('语言切换完成');
}
