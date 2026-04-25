// 国际化模块
class I18n {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.translations = {};
    }

    // 检测语言
    detectLanguage() {
        const userLang = navigator.language || navigator.userLanguage;
        const langCode = userLang.split('-')[0];
        return langCode;
    }

    // 加载翻译文件
    async loadTranslations() {
        try {
            // 加载中文翻译
            const zhResponse = await fetch('locales/zh.json');
            this.translations.zh = await zhResponse.json();
            
            // 加载越南语翻译
            const viResponse = await fetch('locales/vi.json');
            this.translations.vi = await viResponse.json();
            
            // 如果当前语言不在支持的列表中，默认使用中文
            if (!this.translations[this.currentLang]) {
                this.currentLang = 'zh';
            }
        } catch (error) {
            console.error('加载翻译文件失败:', error);
            // 使用默认翻译
            this.translations = {
                zh: {
                    appTitle: '钓鱼收入统计系统',
                    usageTips: '使用提示：',
                    tip1: '添加记录后，数据会自动保存到浏览器中',
                    tip2: '点击"保存到文件"按钮可将数据备份到本地文件',
                    tip3: '点击"从文件加载"按钮可恢复之前备份的数据',
                    tip4: '定期备份数据，以防浏览器数据丢失',
                    totalInfo: '总量信息',
                    addRecord: '添加记录',
                    dataManagement: '数据管理',
                    recordDetails: '记录明细',
                    date: '日期',
                    type: '类型',
                    diamond: '钻石',
                    breakthrough: '突破券',
                    rawstone: '原石',
                    platinum: '白金',
                    remark: '备注',
                    action: '操作',
                    income: '收入',
                    expense: '支出',
                    addRecordBtn: '添加记录',
                    saveToFile: '保存到文件',
                    loadFromFile: '从文件加载',
                    delete: '删除',
                    recordAdded: '记录添加成功！',
                    dataSaved: '数据已保存到 fishing_income.txt 文件',
                    dataLoaded: '数据已从文件加载',
                    fileFormatError: '文件格式错误，无法加载数据',
                    page: '页',
                    of: '共',
                    totalRecords: '总记录数',
                    first: '首页',
                    previous: '上一页',
                    next: '下一页',
                    last: '末页'
                },
                vi: {
                    appTitle: 'Hệ thống thống kê thu nhập câu cá',
                    usageTips: 'Lưu ý sử dụng：',
                    tip1: 'Sau khi thêm ghi chú, dữ liệu sẽ tự động được lưu vào trình duyệt',
                    tip2: 'Nhấn nút "Lưu vào tệp" để sao lưu dữ liệu vào tệp cục bộ',
                    tip3: 'Nhấn nút "Tải từ tệp" để khôi phục dữ liệu đã sao lưu trước đó',
                    tip4: 'Sao lưu dữ liệu định kỳ để tránh mất dữ liệu trình duyệt',
                    totalInfo: 'Thông tin tổng số',
                    addRecord: 'Thêm ghi chú',
                    dataManagement: 'Quản lý dữ liệu',
                    recordDetails: 'Chi tiết ghi chú',
                    date: 'Ngày',
                    type: 'Loại',
                    diamond: 'Kim cương',
                    breakthrough: 'Voucher突破',
                    rawstone: 'Nguyên đá',
                    platinum: 'Bạch kim',
                    remark: 'Ghi chú',
                    action: 'Hành động',
                    income: 'Thu nhập',
                    expense: 'Chi tiêu',
                    addRecordBtn: 'Thêm ghi chú',
                    saveToFile: 'Lưu vào tệp',
                    loadFromFile: 'Tải từ tệp',
                    delete: 'Xóa',
                    recordAdded: 'Ghi chú đã được thêm thành công！',
                    dataSaved: 'Dữ liệu đã được lưu vào tệp fishing_income.txt',
                    dataLoaded: 'Dữ liệu đã được tải từ tệp',
                    fileFormatError: 'Định dạng tệp không đúng, không thể tải dữ liệu',
                    page: 'trang',
                    of: 'của',
                    totalRecords: 'Tổng số ghi chú',
                    first: 'Trang đầu',
                    previous: 'Trang trước',
                    next: 'Trang sau',
                    last: 'Trang cuối'
                }
            };
        }
    }

    // 应用语言
    applyLanguage() {
        const translation = this.translations[this.currentLang];
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translation[key]) {
                element.textContent = translation[key];
            }
        });
    }

    // 获取翻译文本
    getText(key) {
        const translation = this.translations[this.currentLang];
        return translation[key] || key;
    }

    // 切换语言
    changeLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            this.applyLanguage();
        }
    }
}

// 导出国际化实例
const i18n = new I18n();
