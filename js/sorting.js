// 排序模块
class Sorting {
    constructor() {
        this.sortField = 'date';
        this.sortOrder = 'desc'; // 'asc' 或 'desc'
    }

    // 排序记录
    sortRecords(records) {
        records.sort((a, b) => {
            let aVal = a[this.sortField];
            let bVal = b[this.sortField];
            
            // 处理日期类型
            if (this.sortField === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            // 处理数字类型
            if (['diamond', 'breakthrough', 'rawstone', 'platinum'].includes(this.sortField)) {
                aVal = parseInt(aVal) || 0;
                bVal = parseInt(bVal) || 0;
            }
            
            // 比较值
            if (aVal < bVal) {
                return this.sortOrder === 'asc' ? -1 : 1;
            }
            if (aVal > bVal) {
                return this.sortOrder === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    // 切换排序
    sortBy(field) {
        // 如果点击的是当前排序字段，则切换排序顺序
        if (this.sortField === field) {
            this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            // 否则，设置新的排序字段，默认降序
            this.sortField = field;
            this.sortOrder = 'desc';
        }
        
        // 更新排序指示器
        this.updateSortIndicators();
    }

    // 更新排序指示器
    updateSortIndicators() {
        // 清除所有排序指示器
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '';
        });
        
        // 设置当前排序字段的指示器
        const indicator = document.getElementById(`sort-${this.sortField}`);
        if (indicator) {
            indicator.textContent = this.sortOrder === 'asc' ? '↑' : '↓';
        }
    }

    // 获取当前排序字段
    getSortField() {
        return this.sortField;
    }

    // 获取当前排序顺序
    getSortOrder() {
        return this.sortOrder;
    }
}

// 导出排序实例
const sorting = new Sorting();
