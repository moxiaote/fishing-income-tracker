// 数据可视化模块
class ChartManager {
    constructor() {
        this.trendChart = null;
        this.incomeExpenseChart = null;
        this.resourcePieChart = null;
        
        // 颜色配置 - 与总量信息卡片颜色匹配
        this.colors = {
            income: '#28a745',      // 绿色 - 收入
            expense: '#dc3545',     // 红色 - 支出
            diamond: '#007bff',     // 蓝色 - 匹配 bg-primary
            breakthrough: '#28a745', // 绿色 - 匹配 bg-success
            rawstone: '#ffc107',    // 黄色 - 匹配 bg-warning
            platinum: '#17a2b8',    // 青色 - 匹配 bg-info
            grid: 'rgba(0, 0, 0, 0.1)'
        };
    }

    // 初始化所有图表
    initCharts() {
        this.initTrendChart();
        this.initIncomeExpenseChart();
    }

    // 初始化趋势图表
    initTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: i18n.getText('diamond'),
                        data: [],
                        borderColor: this.colors.diamond,
                        backgroundColor: this.colors.diamond,
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y'
                    },
                    {
                        label: i18n.getText('breakthrough'),
                        data: [],
                        borderColor: this.colors.breakthrough,
                        backgroundColor: this.colors.breakthrough,
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y'
                    },
                    {
                        label: i18n.getText('rawstone'),
                        data: [],
                        borderColor: this.colors.rawstone,
                        backgroundColor: this.colors.rawstone,
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y'
                    },
                    {
                        label: i18n.getText('platinum'),
                        data: [],
                        borderColor: this.colors.platinum,
                        backgroundColor: this.colors.platinum,
                        tension: 0.4,
                        fill: false,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: '钻石/突破券/原石'
                        },
                        beginAtZero: true,
                        grid: {
                            color: this.colors.grid
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: '白金'
                        },
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false
                        }
                    },
                    x: {
                        grid: {
                            color: this.colors.grid
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    // 初始化收支对比图表
    initIncomeExpenseChart() {
        const ctx = document.getElementById('incomeExpenseChart');
        if (!ctx) return;

        this.incomeExpenseChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [i18n.getText('diamond'), i18n.getText('breakthrough'), i18n.getText('rawstone'), i18n.getText('platinum')],
                datasets: [
                    {
                        label: i18n.getText('income'),
                        data: [0, 0, 0, 0],
                        backgroundColor: this.colors.income,
                    },
                    {
                        label: i18n.getText('expense'),
                        data: [0, 0, 0, 0],
                        backgroundColor: this.colors.expense,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.colors.grid
                        }
                    },
                    x: {
                        grid: {
                            color: this.colors.grid
                        }
                    }
                }
            }
        });
    }

    // 更新所有图表
    updateCharts(records) {
        this.updateTrendChart(records);
        this.updateIncomeExpenseChart(records);
    }

    // 更新趋势图表
    updateTrendChart(records) {
        if (!this.trendChart) return;

        // 按日期分组并计算累计值
        const dailyData = this.groupByDate(records);
        const dates = Object.keys(dailyData).sort();
        
        // 计算累计值
        let cumulative = {
            diamond: 0,
            breakthrough: 0,
            rawstone: 0,
            platinum: 0
        };

        const trendData = {
            diamond: [],
            breakthrough: [],
            rawstone: [],
            platinum: []
        };

        dates.forEach(date => {
            const dayRecord = dailyData[date];
            dayRecord.forEach(record => {
                const multiplier = (record.type === '收入' || record.type === 'Thu nhập' || record.type === 'Income' || record.type === '수입') ? 1 : -1;
                cumulative.diamond += record.diamond * multiplier;
                cumulative.breakthrough += record.breakthrough * multiplier;
                cumulative.rawstone += record.rawstone * multiplier;
                cumulative.platinum += record.platinum * multiplier;
            });

            trendData.diamond.push(cumulative.diamond);
            trendData.breakthrough.push(cumulative.breakthrough);
            trendData.rawstone.push(cumulative.rawstone);
            trendData.platinum.push(cumulative.platinum);
        });

        // 更新图表数据
        this.trendChart.data.labels = dates;
        this.trendChart.data.datasets[0].data = trendData.diamond;
        this.trendChart.data.datasets[1].data = trendData.breakthrough;
        this.trendChart.data.datasets[2].data = trendData.rawstone;
        this.trendChart.data.datasets[3].data = trendData.platinum;
        this.trendChart.update();
    }

    // 更新收支对比图表
    updateIncomeExpenseChart(records) {
        if (!this.incomeExpenseChart) return;

        // 计算收入和支出
        const income = [0, 0, 0, 0];
        const expense = [0, 0, 0, 0];

        records.forEach(record => {
            if (record.type === '收入' || record.type === 'Thu nhập' || record.type === 'Income' || record.type === '수입') {
                income[0] += record.diamond;
                income[1] += record.breakthrough;
                income[2] += record.rawstone;
                income[3] += record.platinum;
            } else {
                expense[0] += record.diamond;
                expense[1] += record.breakthrough;
                expense[2] += record.rawstone;
                expense[3] += record.platinum;
            }
        });

        this.incomeExpenseChart.data.datasets[0].data = income;
        this.incomeExpenseChart.data.datasets[1].data = expense;
        this.incomeExpenseChart.update();
    }

    // 按日期分组
    groupByDate(records) {
        const grouped = {};
        records.forEach(record => {
            if (!grouped[record.date]) {
                grouped[record.date] = [];
            }
            grouped[record.date].push(record);
        });
        return grouped;
    }

    // 计算总量
    calculateTotals(records) {
        let total = {
            diamond: 0,
            breakthrough: 0,
            rawstone: 0,
            platinum: 0
        };

        records.forEach(record => {
            const multiplier = record.type === '收入' || record.type === 'Thu nhập' ? 1 : -1;
            total.diamond += record.diamond * multiplier;
            total.breakthrough += record.breakthrough * multiplier;
            total.rawstone += record.rawstone * multiplier;
            total.platinum += record.platinum * multiplier;
        });

        return total;
    }

    // 更新统计卡片
    updateStatCards(records) {
        const totals = this.calculateTotals(records);
        
        // 更新统计卡片显示
        document.getElementById('stat-diamond').textContent = totals.diamond;
        document.getElementById('stat-breakthrough').textContent = totals.breakthrough;
        document.getElementById('stat-rawstone').textContent = totals.rawstone;
        document.getElementById('stat-platinum').textContent = totals.platinum;

        // 计算相比昨天的增长量
        const todayChange = this.calculateDailyChange(records, new Date().toISOString().split('T')[0]);

        this.updateChangeIndicator('stat-diamond-change', todayChange.diamond);
        this.updateChangeIndicator('stat-breakthrough-change', todayChange.breakthrough);
        this.updateChangeIndicator('stat-rawstone-change', todayChange.rawstone);
        this.updateChangeIndicator('stat-platinum-change', todayChange.platinum);
    }

    // 计算指定日期的日变化量
    calculateDailyChange(records, targetDate) {
        let dailyChange = {
            diamond: 0,
            breakthrough: 0,
            rawstone: 0,
            platinum: 0
        };

        records.forEach(record => {
            if (record.date === targetDate) {
                const multiplier = (record.type === '收入' || record.type === 'Thu nhập' || record.type === 'Income' || record.type === '수입') ? 1 : -1;
                dailyChange.diamond += record.diamond * multiplier;
                dailyChange.breakthrough += record.breakthrough * multiplier;
                dailyChange.rawstone += record.rawstone * multiplier;
                dailyChange.platinum += record.platinum * multiplier;
            }
        });

        return dailyChange;
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

    // 获取最近N天的记录
    getRecentRecords(records, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        const cutoffStr = cutoffDate.toISOString().split('T')[0];

        return records.filter(record => record.date >= cutoffStr);
    }
    
    // 更新图表（用于语言切换）
    updateCharts() {
        console.log('更新图表标签');
        
        // 确保有记录数据
        const app = window.app;
        if (!app || !app.records || app.records.length === 0) {
            console.warn('没有记录数据，无法更新图表');
            return;
        }
        
        // 更新趋势图表标签和数据
        if (this.trendChart) {
            // 更新标签
            this.trendChart.data.datasets[0].label = i18n.getText('diamond');
            this.trendChart.data.datasets[1].label = i18n.getText('breakthrough');
            this.trendChart.data.datasets[2].label = i18n.getText('rawstone');
            this.trendChart.data.datasets[3].label = i18n.getText('platinum');
            
            // 重新计算并更新数据
            this.updateTrendChart(app.records);
        }
        
        // 更新收支对比图表标签和数据
        if (this.incomeExpenseChart) {
            // 更新标签
            this.incomeExpenseChart.data.labels = [i18n.getText('diamond'), i18n.getText('breakthrough'), i18n.getText('rawstone'), i18n.getText('platinum')];
            this.incomeExpenseChart.data.datasets[0].label = i18n.getText('income');
            this.incomeExpenseChart.data.datasets[1].label = i18n.getText('expense');
            
            // 重新计算并更新数据
            this.updateIncomeExpenseChart(app.records);
        }
    }
}

// 导出图表管理器实例
const chartManager = new ChartManager();
