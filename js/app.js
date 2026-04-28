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
            
            // 显示Gist ID
            this.displayGistId();
            
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

        // 从Gist ID加载按钮事件
        const loadFromGistButton = document.getElementById('load-from-gist');
        if (loadFromGistButton) {
            loadFromGistButton.addEventListener('click', () => {
                this.loadFromGist();
            });
        }

        // 上传备份按钮事件
        const syncToCloudButton = document.getElementById('sync-to-cloud');
        if (syncToCloudButton) {
            syncToCloudButton.addEventListener('click', () => {
                this.syncToCloud();
            });
        }

        // GitHub登录按钮事件
        const githubLoginButton = document.getElementById('github-login');
        if (githubLoginButton) {
            githubLoginButton.addEventListener('click', () => {
                this.githubLogin();
            });
        }

        // 上头模拟器按钮事件
        this.bindSimulatorEvents();

    }

    // 绑定上头模拟器事件
    bindSimulatorEvents() {
        // 获取所有模拟器按钮
        const simulatorButtons = document.querySelectorAll('.simulator-btn');
        if (simulatorButtons.length > 0) {
            simulatorButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const target = button.getAttribute('data-target');
                    const title = button.textContent;
                    
                    // 检查是否是当前打开的模拟器
                    if (this.currentSimulator === target) {
                        // 如果是当前打开的模拟器，则关闭
                        this.closeSimulator();
                    } else {
                        // 如果不是当前打开的模拟器，则关闭当前的并打开新的
                        // 先移除显示类
                        const container = document.getElementById('simulator-iframe-container');
                        if (container) {
                            container.classList.remove('show');
                        }
                        
                        // 检查是否是打赏按钮
                        if (title.includes('请我喝一杯咖啡') || title === '打赏') {
                            // 显示打赏图片，隐藏iframe
                            const iframe = document.getElementById('simulator-iframe');
                            if (iframe) {
                                iframe.style.display = 'none';
                            }
                            const donationImg = document.getElementById('donation-image');
                            if (donationImg) {
                                donationImg.style.display = 'block';
                            }
                            // 更新说明文本
                            const descriptionText = document.querySelector('.simulator-content p');
                            if (descriptionText) {
                                descriptionText.textContent = '您的支持是我最大的动力！您的慷慨让这个小工具变得更好！';
                            }
                        } else {
                            // 隐藏打赏图片，显示iframe
                            const iframe = document.getElementById('simulator-iframe');
                            if (iframe) {
                                iframe.style.display = 'block';
                                iframe.src = target;
                            }
                            const donationImg = document.getElementById('donation-image');
                            if (donationImg) {
                                donationImg.style.display = 'none';
                            }
                            // 恢复说明文本
                            const descriptionText = document.querySelector('.simulator-content p');
                            if (descriptionText) {
                                descriptionText.textContent = '说明：本项目仅供娱乐，实际游戏中的概率可能会有所不同。';
                            }
                        }
                        
                        // 延迟添加显示类，确保iframe源已设置
                        setTimeout(() => {
                            if (container) {
                                container.classList.add('show');
                            }
                        }, 50);
                        
                        // 更新当前模拟器状态
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
            // 计算当前总量
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

            // 计算差异
            const diffDiamond = inputDiamond - currentTotal.diamond;
            const diffBreakthrough = inputBreakthrough - currentTotal.breakthrough;
            const diffRawstone = inputRawstone - currentTotal.rawstone;
            const diffPlatinum = inputPlatinum - currentTotal.platinum;

            // 确定记录类型（收入或支出）
            const recordType = (diffDiamond >= 0 && diffBreakthrough >= 0 && diffRawstone >= 0 && diffPlatinum >= 0) ? '收入' : '支出';

            // 创建记录，使用绝对值作为数量
            record = {
                date: date,
                type: recordType,
                diamond: Math.abs(diffDiamond),
                breakthrough: Math.abs(diffBreakthrough),
                rawstone: Math.abs(diffRawstone),
                platinum: Math.abs(diffPlatinum),
                remark: remark || `总额更新: ${inputDiamond}钻, ${inputBreakthrough}券, ${inputRawstone}石, ${inputPlatinum}金`
            };
        } else {
            // 普通收入或支出记录
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

        // 将新记录添加到数组开头，使最新的记录显示在最上面
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
                alert('数据已同步到云端');

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

    // 格式化大数字为缩写形式（如67K、1M）
    formatNumber(num) {
        // 确保num是数字类型
        const numericValue = Number(num) || 0;
        
        if (numericValue >= 1000000) {
            return {
                display: (numericValue / 1000000).toFixed(1) + 'M',
                full: numericValue
            };
        } else if (numericValue >= 1000) {
            return {
                display: (numericValue / 1000).toFixed(1) + 'K',
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
        diamondElement.textContent = formattedDiamond.display;
        diamondElement.title = formattedDiamond.full;
        
        const breakthroughElement = document.getElementById('stat-breakthrough');
        breakthroughElement.textContent = formattedBreakthrough.display;
        breakthroughElement.title = formattedBreakthrough.full;
        
        const rawstoneElement = document.getElementById('stat-rawstone');
        rawstoneElement.textContent = formattedRawstone.display;
        rawstoneElement.title = formattedRawstone.full;
        
        const platinumElement = document.getElementById('stat-platinum');
        platinumElement.textContent = formattedPlatinum.display;
        platinumElement.title = formattedPlatinum.full;

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

    // 排序并显示
    sortBy(field) {
        sorting.sortBy(field);
        sorting.sortRecords(this.records);
        pagination.reset();
        pagination.updatePagination(this.records.length);
        this.displayRecords();
    }

    // 显示Gist ID
    displayGistId() {
        const gistIdElement = document.getElementById('gist-id');
        if (gistIdElement) {
            const gistId = storageManager.getGistId();
            gistIdElement.value = gistId || i18n.getText('autoGenerate');
            gistIdElement.readOnly = true;
        }
        
        // 显示登录状态
        this.displayLoginStatus();
        
        // 绑定复制按钮事件
        const copyGistIdButton = document.getElementById('copy-gist-id');
        if (copyGistIdButton) {
            copyGistIdButton.addEventListener('click', () => {
                if (gistIdElement) {
                    gistIdElement.select();
                    document.execCommand('copy');
                    // 显示复制成功提示
                    const originalText = copyGistIdButton.textContent;
                    copyGistIdButton.textContent = '已复制';
                    setTimeout(() => {
                        copyGistIdButton.textContent = originalText;
                    }, 1000);
                }
            });
        }
    }
    
    // 显示登录状态
    displayLoginStatus() {
        const githubLoginButton = document.getElementById('github-login');
        const loginStatusElement = document.getElementById('login-status');
        const accessToken = localStorage.getItem('github_access_token');
        
        if (githubLoginButton) {
            if (accessToken) {
                // 已登录
                githubLoginButton.style.display = 'none';
                
                // 创建或更新登录状态显示
                if (!loginStatusElement) {
                    const statusDiv = document.createElement('div');
                    statusDiv.id = 'login-status';
                    statusDiv.className = 'mt-2 text-center';
                    statusDiv.innerHTML = '<span class="text-success">已登录GitHub</span> <a href="#" id="logout-link" class="text-danger ms-2">[退出登录]</a>';
                    githubLoginButton.parentNode.appendChild(statusDiv);
                    
                    // 绑定退出登录事件
                    const logoutLink = document.getElementById('logout-link');
                    if (logoutLink) {
                        logoutLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            this.logoutGitHub();
                        });
                    }
                }
            } else {
                // 未登录
                githubLoginButton.style.display = 'inline-block';
                githubLoginButton.textContent = 'GitHub登录';
                githubLoginButton.disabled = false;
                
                // 移除登录状态显示
                if (loginStatusElement) {
                    loginStatusElement.remove();
                }
            }
        }
    }
    
    // 退出GitHub登录
    logoutGitHub() {
        // 清除访问令牌
        localStorage.removeItem('github_access_token');
        
        // 清除Gist ID
        localStorage.removeItem('gistId');
        
        // 更新UI
        this.displayLoginStatus();
        
        // 清空Gist ID显示
        const gistIdElement = document.getElementById('gist-id');
        if (gistIdElement) {
            gistIdElement.value = '';
        }
        
        alert('已退出GitHub登录');
    }

    // GitHub登录
    githubLogin() {
        // GitHub OAuth应用信息
        const clientId = 'Ov23lifBgFyews6nSXI0';
        const redirectUri = encodeURIComponent('https://moxiaote.github.io/fishing-income-tracker/');
        const scope = 'gist';
        
        // 生成随机状态
        const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('github_oauth_state', state);
        
        // 重定向到GitHub登录页面
        const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
        window.location.href = githubAuthUrl;
    }

    // 处理GitHub登录回调
    handleGitHubCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const storedState = localStorage.getItem('github_oauth_state');
        
        if (code && state && state === storedState) {
            // 清除存储的状态
            localStorage.removeItem('github_oauth_state');
            
            // 交换代码获取访问令牌
            this.exchangeCodeForToken(code);
        }
    }

    // 交换代码获取访问令牌
    async exchangeCodeForToken(code) {
        const clientId = 'Ov23lifBgFyews6nSXI0';
        const clientSecret = '1837ff34155e1755e7a24e9e3cb2bc0831580aeb';
        const redirectUri = 'https://moxiaote.github.io/fishing-income-tracker/';
        
        try {
            console.log('开始交换访问令牌...');
            console.log('Code:', code);
            
            // 使用单个主要CORS代理，带较短超时
            const corsProxy = 'https://cors-anywhere.herokuapp.com/';
            const apiUrl = corsProxy + 'https://github.com/login/oauth/access_token';
            
            // 添加超时处理 - 5秒超时，避免长时间等待
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            let response;
            try {
                console.log('尝试使用代理:', corsProxy);
                response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        client_id: clientId,
                        client_secret: clientSecret,
                        code: code,
                        redirect_uri: redirectUri
                    }),
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                console.log('代理请求成功:', corsProxy);
            } catch (proxyError) {
                clearTimeout(timeoutId);
                console.error('CORS代理请求失败:', proxyError);
                alert('网络请求超时，请检查网络连接后重试。');
                return;
            }
            
            if (!response) {
                alert('网络请求失败，请检查网络连接后重试。');
                return;
            }
            
            console.log('响应状态:', response.status);
            console.log('响应头:', response.headers);
            
            const responseText = await response.text();
            console.log('响应文本:', responseText);
            
            // 检查响应是否为JSON格式
            if (!responseText.trim()) {
                throw new Error('响应为空');
            }
            
            // 尝试解析响应
            let data;
            try {
                // 检查是否是CORS代理的访问限制消息
                if (responseText.includes('See /corsdemo for more info')) {
                    throw new Error('CORS代理需要访问权限，请先访问 https://cors-anywhere.herokuapp.com/corsdemo 以获取临时访问权限');
                }
                
                // 尝试直接解析
                data = JSON.parse(responseText);
                console.log('解析后的响应数据:', data);
            } catch (parseError) {
                console.error('直接解析响应失败:', parseError);
                
                // 尝试处理可能的CORS代理包装响应
                try {
                    // 检查是否是allorigins.win的包装格式
                    if (responseText.includes('"contents":')) {
                        const wrappedData = JSON.parse(responseText);
                        if (wrappedData.contents) {
                            data = JSON.parse(wrappedData.contents);
                            console.log('解析包装响应成功:', data);
                        } else {
                            throw new Error('包装响应中没有contents字段');
                        }
                    } else {
                        throw new Error('响应不是有效的JSON格式');
                    }
                } catch (wrapError) {
                    console.error('解析包装响应失败:', wrapError);
                    throw new Error('解析响应失败: ' + parseError.message + '\n响应内容: ' + responseText.substring(0, 200) + '...');
                }
            }
            
            if (data.access_token) {
                // 存储访问令牌
                localStorage.setItem('github_access_token', data.access_token);
                console.log('访问令牌存储成功');
                alert('GitHub登录成功！');
                
                // 更新UI
                this.displayLoginStatus();
                
                // 关闭自动同步到Gist
                // console.log('自动同步到Gist...');
                // const success = await storageManager.syncToGist();
                // if (success) {
                //     // 更新Gist ID显示
                //     this.displayGistId();
                // }
                
                // 更新Gist ID显示（不自动同步）
                this.displayGistId();
            } else {
                console.error('登录失败:', data);
                alert('GitHub登录失败: ' + (data.error || '未知错误'));
            }
        } catch (error) {
            console.error('交换令牌失败:', error);
            alert('GitHub登录失败，请稍后重试。\n\n错误详情: ' + error.message);
        }
    }

    // 从Gist ID加载数据
    async loadFromGist() {
        try {
            const success = await storageManager.loadFromGist();
            if (success) {
                // 重新加载记录
                this.records = await storageManager.loadRecords();
                
                // 重新排序
                sorting.sortRecords(this.records);
                
                // 重置加载记录数
                this.loadedRecords = 30;
                
                // 显示记录
                this.displayRecords();
                
                // 计算总量
                this.calculateTotal();
                
                // 更新图表
                chartManager.updateCharts(this.records);
                chartManager.updateStatCards(this.records);
                
                alert('数据加载成功！');
            } else {
                alert('数据加载失败，请检查Gist ID是否正确。');
            }
        } catch (error) {
            console.error('加载失败:', error);
            alert('数据加载失败，请稍后重试。');
        }
    }

    // 上传备份到云端
    async syncToCloud() {
        try {
            const success = await storageManager.syncToGist();
            if (success) {
                // 更新Gist ID显示
                this.displayGistId();
                alert('数据备份成功！');
            } else {
                alert('数据备份失败，请稍后重试。');
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

// 悬浮按钮相关功能
function initFloatButton() {
    const floatBtn = document.getElementById('add-record-float-btn');
    const floatBtnContainer = document.querySelector('.float-btn-container');
    const modal = document.getElementById('add-record-modal');
    const modalContent = document.getElementById('modal-content');
    
    // 拖拽悬浮按钮
    let isDragging = false;
    let offsetX, offsetY;
    
    floatBtn.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            isDragging = true;
            offsetX = e.clientX - floatBtn.getBoundingClientRect().left;
            offsetY = e.clientY - floatBtn.getBoundingClientRect().top;
            floatBtn.style.cursor = 'grabbing';
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            
            // 限制在视窗内
            const maxX = window.innerWidth - floatBtn.offsetWidth - 20;
            const maxY = window.innerHeight - floatBtn.offsetHeight - 20;
            newX = Math.max(20, Math.min(newX, maxX));
            newY = Math.max(20, Math.min(newY, maxY));
            
            floatBtn.style.left = newX + 'px';
            floatBtn.style.right = 'auto';
            floatBtn.style.top = newY + 'px';
            floatBtn.style.bottom = 'auto';
            floatBtn.style.position = 'fixed';
        }
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        floatBtn.style.cursor = 'move';
    });
    
    // 点击遮罩层关闭弹窗
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            toggleAddRecordModal();
        }
    });
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            toggleAddRecordModal();
        }
    });
    
    // 窗口大小变化时确保按钮可见
    window.addEventListener('resize', () => {
        const rect = floatBtn.getBoundingClientRect();
        const btnWidth = floatBtn.offsetWidth;
        const btnHeight = floatBtn.offsetHeight;
        
        // 如果按钮部分或完全超出右边界
        if (rect.right > window.innerWidth) {
            floatBtn.style.left = (window.innerWidth - btnWidth - 20) + 'px';
        }
        
        // 如果按钮部分或完全超出下边界
        if (rect.bottom > window.innerHeight) {
            floatBtn.style.top = (window.innerHeight - btnHeight - 20) + 'px';
        }
        
        // 如果按钮部分或完全超出左边界
        if (rect.left < 0) {
            floatBtn.style.left = '20px';
        }
        
        // 如果按钮部分或完全超出上边界
        if (rect.top < 0) {
            floatBtn.style.top = '20px';
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
    } else {
        modal.style.display = 'none';
    }
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
    console.log('语言切换完成');
}
