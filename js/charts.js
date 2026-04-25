// 数据可视化模块
class ChartManager {
    constructor() {
        this.trendChart = null;
        this.incomeExpenseChart = null;
        this.resourcePieChart = null;
        
        // 颜色配置
        this.colors = {
            income: '#28a745',      // 绿色 - 收入
            expense: '#dc3545',     // 红色 - 支出
            diamond: '#007bff',     // 蓝色
            breakthrough: '#ffc107', // 黄色
            rawstone: '#6f42c1',    // 紫色
            platinum: '#20c997',    // 青色
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
                        label: '钻石',
                        data: [],
                        borderColor: this.colors.diamond,
                        backgroundColor: this.colors.diamond,
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: '突破券',
                        data: [],
                        borderColor: this.colors.breakthrough,
                        backgroundColor: this.colors.breakthrough,
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: '原石',
                        data: [],
                        borderColor: this.colors.rawstone,
                        backgroundColor: this.colors.rawstone,
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: '白金',
                        data: [],
                        borderColor: this.colors.platinum,
                        backgroundColor: this.colors.platinum,
                        tension: 0.4,
                        fill: false
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
                labels: ['钻石', '突破券', '原石', '白金'],
                datasets: [
                    {
                        label: '收入',
                        data: [0, 0, 0, 0],
                        backgroundColor: this.colors.income,
                    },
                    {
                        label: '支出',
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
                const multiplier = record.type === '收入' || record.type === 'Thu nhập' ? 1 : -1;
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

        const totals = this.calculateTotals(records);
        
        // 计算收入和支出
        const income = [0, 0, 0, 0];
        const expense = [0, 0, 0, 0];

        records.forEach(record => {
            const multiplier = record.type === '收入' || record.type === 'Thu nhập' ? 1 : -1;
            if (multiplier > 0) {
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

        // 计算变化趋势（最近7天）
        const recentRecords = this.getRecentRecords(records, 7);
        const recentTotals = this.calculateTotals(recentRecords);

        this.updateChangeIndicator('stat-diamond-change', recentTotals.diamond);
        this.updateChangeIndicator('stat-breakthrough-change', recentTotals.breakthrough);
        this.updateChangeIndicator('stat-rawstone-change', recentTotals.rawstone);
        this.updateChangeIndicator('stat-platinum-change', recentTotals.platinum);
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
}

// 导出图表管理器实例
const chartManager = new ChartManager();
