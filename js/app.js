// 主应用逻辑
class App {
    constructor() {
        this.records = [];
        this.fileName = 'fishing_income.txt';
        this.statsCard = null;
        this.fixedTotal = null;
        this.loadedRecords = 30; // 默认加载30条
        this.loadBatchSize = 30; // 每次加载30条
    }

    // 初始化应用
    async init() {
        try {
            // 加载翻译文件
            await i18n.loadTranslations();
            
            // 应用语言
            i18n.applyLanguage();
            
            // 初始化存储
            await storageManager.initDB();
            
            // 加载记录
            this.records = await storageManager.loadRecords();
            
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
            
            // 添加滚动监听
            this.addScrollListener();
            
            // 初始化图表
            chartManager.initCharts();
            
            // 更新图表数据
            chartManager.updateCharts(this.records);
            chartManager.updateStatCards(this.records);
            
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
    }

    // 添加滚动监听
    addScrollListener() {
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // 初始检查
        this.handleScroll();
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
        const record = {
            date: document.getElementById('date').value,
            type: document.getElementById('type').value,
            diamond: parseInt(document.getElementById('diamond').value) || 0,
            breakthrough: parseInt(document.getElementById('breakthrough').value) || 0,
            rawstone: parseInt(document.getElementById('rawstone').value) || 0,
            platinum: parseInt(document.getElementById('platinum').value) || 0,
            remark: document.getElementById('remark').value
        };

        // 将新记录添加到数组开头，使最新的记录显示在最上面
        this.records.unshift(record);
        
        // 重新排序
        sorting.sortRecords(this.records);
        
        // 保存记录
        await storageManager.saveRecords(this.records);
        
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
    }

    // 删除记录
    async deleteRecord(index) {
        this.records.splice(index, 1);
        await storageManager.saveRecords(this.records);
        
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

        // 显示已加载的记录
        const currentRecords = this.records.slice(0, this.loadedRecords);

        currentRecords.forEach((record, index) => {
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
                    <button class="btn btn-danger btn-sm" onclick="app.deleteRecord(${index})" data-i18n="delete">删除</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
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

    // 计算总量
    calculateTotal() {
        let total = {
            diamond: 0,
            breakthrough: 0,
            rawstone: 0,
            platinum: 0
        };

        this.records.forEach(record => {
            const multiplier = record.type === '收入' || record.type === 'Thu nhập' ? 1 : -1;
            total.diamond += record.diamond * multiplier;
            total.breakthrough += record.breakthrough * multiplier;
            total.rawstone += record.rawstone * multiplier;
            total.platinum += record.platinum * multiplier;
        });

        // 计算最近7天的变化
        const recentRecords = this.getRecentRecords(7);
        let recentChange = {
            diamond: 0,
            breakthrough: 0,
            rawstone: 0,
            platinum: 0
        };

        recentRecords.forEach(record => {
            const multiplier = record.type === '收入' || record.type === 'Thu nhập' ? 1 : -1;
            recentChange.diamond += record.diamond * multiplier;
            recentChange.breakthrough += record.breakthrough * multiplier;
            recentChange.rawstone += record.rawstone * multiplier;
            recentChange.platinum += record.platinum * multiplier;
        });

        // 更新统计概览显示
        document.getElementById('stat-diamond').textContent = total.diamond;
        document.getElementById('stat-breakthrough').textContent = total.breakthrough;
        document.getElementById('stat-rawstone').textContent = total.rawstone;
        document.getElementById('stat-platinum').textContent = total.platinum;

        // 更新统计概览变化显示
        this.updateChangeIndicator('stat-diamond-change', recentChange.diamond);
        this.updateChangeIndicator('stat-breakthrough-change', recentChange.breakthrough);
        this.updateChangeIndicator('stat-rawstone-change', recentChange.rawstone);
        this.updateChangeIndicator('stat-platinum-change', recentChange.platinum);
        
        // 更新固定总量显示（显示统计概览数据）
        document.getElementById('fixed-diamond').textContent = total.diamond;
        document.getElementById('fixed-breakthrough').textContent = total.breakthrough;
        document.getElementById('fixed-rawstone').textContent = total.rawstone;
        document.getElementById('fixed-platinum').textContent = total.platinum;

        // 更新固定总量变化显示
        const fixedDiamondChange = document.getElementById('fixed-diamond-change');
        const fixedBreakthroughChange = document.getElementById('fixed-breakthrough-change');
        const fixedRawstoneChange = document.getElementById('fixed-rawstone-change');
        const fixedPlatinumChange = document.getElementById('fixed-platinum-change');

        if (fixedDiamondChange) {
            const prefix = recentChange.diamond >= 0 ? '+' : '';
            fixedDiamondChange.textContent = `${prefix}${recentChange.diamond}`;
            fixedDiamondChange.className = recentChange.diamond >= 0 ? 'fixed-total-change positive' : 'fixed-total-change negative';
        }
        if (fixedBreakthroughChange) {
            const prefix = recentChange.breakthrough >= 0 ? '+' : '';
            fixedBreakthroughChange.textContent = `${prefix}${recentChange.breakthrough}`;
            fixedBreakthroughChange.className = recentChange.breakthrough >= 0 ? 'fixed-total-change positive' : 'fixed-total-change negative';
        }
        if (fixedRawstoneChange) {
            const prefix = recentChange.rawstone >= 0 ? '+' : '';
            fixedRawstoneChange.textContent = `${prefix}${recentChange.rawstone}`;
            fixedRawstoneChange.className = recentChange.rawstone >= 0 ? 'fixed-total-change positive' : 'fixed-total-change negative';
        }
        if (fixedPlatinumChange) {
            const prefix = recentChange.platinum >= 0 ? '+' : '';
            fixedPlatinumChange.textContent = `${prefix}${recentChange.platinum}`;
            fixedPlatinumChange.className = recentChange.platinum >= 0 ? 'fixed-total-change positive' : 'fixed-total-change negative';
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

    // 排序并显示
    sortBy(field) {
        sorting.sortBy(field);
        sorting.sortRecords(this.records);
        pagination.reset();
        pagination.updatePagination(this.records.length);
        this.displayRecords();
    }
}

// 创建应用实例
const app = new App();

// 页面加载完成后初始化
window.onload = () => {
    app.init();
};

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
