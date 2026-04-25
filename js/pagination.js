// 分页模块
class Pagination {
    constructor(recordsPerPage = 100) {
        this.recordsPerPage = recordsPerPage;
        this.currentPage = 1;
        this.totalPages = 1;
    }

    // 更新分页
    updatePagination(totalRecords) {
        this.totalPages = Math.ceil(totalRecords / this.recordsPerPage);
        this.currentPage = Math.min(this.currentPage, this.totalPages);
    }

    // 获取当前页的记录范围
    getCurrentPageRange(totalRecords) {
        const startIndex = (this.currentPage - 1) * this.recordsPerPage;
        const endIndex = Math.min(startIndex + this.recordsPerPage, totalRecords);
        return { startIndex, endIndex };
    }

    // 渲染分页控件
    renderPagination(containerId, translations) {
        const pagination = document.getElementById(containerId);
        pagination.innerHTML = '';

        if (this.totalPages <= 1) {
            return;
        }

        // 首页按钮
        const firstLi = document.createElement('li');
        firstLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        firstLi.innerHTML = `<a class="page-link" href="#" onclick="pagination.goToPage(1)">${translations.first || '首页'}</a>`;
        pagination.appendChild(firstLi);

        // 上一页按钮
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" onclick="pagination.goToPage(${this.currentPage - 1})">&laquo; ${translations.previous || '上一页'}</a>`;
        pagination.appendChild(prevLi);

        // 页码按钮
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(this.totalPages, startPage + 4);

        for (let i = startPage; i <= endPage; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" onclick="pagination.goToPage(${i})">${i}</a>`;
            pagination.appendChild(li);
        }

        // 下一页按钮
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" onclick="pagination.goToPage(${this.currentPage + 1})">${translations.next || '下一页'} &raquo;</a>`;
        pagination.appendChild(nextLi);

        // 末页按钮
        const lastLi = document.createElement('li');
        lastLi.className = `page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
        lastLi.innerHTML = `<a class="page-link" href="#" onclick="pagination.goToPage(${this.totalPages})">${translations.last || '末页'}</a>`;
        pagination.appendChild(lastLi);
    }

    // 跳转到指定页码
    goToPage(page) {
        if (page < 1 || page > this.totalPages) {
            return false;
        }
        this.currentPage = page;
        return true;
    }

    // 获取当前页码
    getCurrentPage() {
        return this.currentPage;
    }

    // 重置到第一页
    reset() {
        this.currentPage = 1;
    }
}

// 导出分页实例
const pagination = new Pagination(100);
