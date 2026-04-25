// 国际化模块
class I18n {
    constructor() {
        this.currentLang = this.detectLanguage();
        this.translations = {};
    }

    // 检测语言
    detectLanguage() {
        const userLang = navigator.language || navigator.userLanguage;
        // 检查是否是繁体中文
        if (userLang === 'zh-TW' || userLang === 'zh-HK' || userLang === 'zh-MO') {
            return 'zh-TW';
        }
        // 其他语言只取第一部分
        const langCode = userLang.split('-')[0];
        return langCode;
    }

    // 加载翻译文件
    async loadTranslations() {
        try {
            // 加载中文翻译
            const zhResponse = await fetch('locales/zh.json');
            this.translations.zh = await zhResponse.json();
            
            // 加载繁体中文翻译
            const zhTwResponse = await fetch('locales/zh-TW.json');
            this.translations['zh-TW'] = await zhTwResponse.json();
            
            // 加载英文翻译
            const enResponse = await fetch('locales/en.json');
            this.translations.en = await enResponse.json();
            
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
                    last: '末页',
                    loadMore: '加载更多'
                },
                'zh-TW': {
                    appTitle: '釣魚收入統計系統',
                    usageTips: '使用提示：',
                    tip1: '添加記錄後，數據會自動保存到瀏覽器中',
                    tip2: '點擊"保存到文件"按鈕可將數據備份到本地文件',
                    tip3: '點擊"從文件加載"按鈕可恢復之前備份的數據',
                    tip4: '定期備份數據，以防瀏覽器數據丟失',
                    totalInfo: '總量信息',
                    addRecord: '添加記錄',
                    dataManagement: '數據管理',
                    recordDetails: '記錄明細',
                    date: '日期',
                    type: '類型',
                    diamond: '鑽石',
                    breakthrough: '突破強化券',
                    rawstone: '原石',
                    platinum: '白金',
                    remark: '備註',
                    action: '操作',
                    income: '收入',
                    expense: '支出',
                    addRecordBtn: '添加記錄',
                    saveToFile: '保存到文件',
                    loadFromFile: '從文件加載',
                    delete: '刪除',
                    recordAdded: '記錄添加成功！',
                    dataSaved: '數據已保存到 fishing_income.txt 文件',
                    dataLoaded: '數據已從文件加載',
                    fileFormatError: '文件格式錯誤，無法加載數據',
                    page: '頁',
                    of: '共',
                    totalRecords: '總記錄數',
                    first: '首頁',
                    previous: '上一頁',
                    next: '下一頁',
                    last: '末頁',
                    loadMore: '加載更多'
                },
                en: {
                    appTitle: 'Fishing Income Tracking System',
                    usageTips: 'Usage Tips:',
                    tip1: 'After adding records, data will be automatically saved to the browser',
                    tip2: 'Click the "Save to File" button to back up data to a local file',
                    tip3: 'Click the "Load from File" button to restore previously backed up data',
                    tip4: 'Back up data regularly to avoid browser data loss',
                    totalInfo: 'Total Information',
                    addRecord: 'Add Record',
                    dataManagement: 'Data Management',
                    recordDetails: 'Record Details',
                    date: 'Date',
                    type: 'Type',
                    diamond: 'Diamond',
                    breakthrough: 'Breakthrough Voucher',
                    rawstone: 'Raw Stone',
                    platinum: 'Platinum',
                    remark: 'Remark',
                    action: 'Action',
                    income: 'Income',
                    expense: 'Expense',
                    addRecordBtn: 'Add Record',
                    saveToFile: 'Save to File',
                    loadFromFile: 'Load from File',
                    delete: 'Delete',
                    recordAdded: 'Record added successfully!',
                    dataSaved: 'Data has been saved to fishing_income.txt',
                    dataLoaded: 'Data has been loaded from file',
                    fileFormatError: 'File format error, cannot load data',
                    page: 'page',
                    of: 'of',
                    totalRecords: 'Total records',
                    first: 'First',
                    previous: 'Previous',
                    next: 'Next',
                    last: 'Last',
                    loadMore: 'Load More'
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
                    breakthrough: 'Voucher tăng cường',
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
                    last: 'Trang cuối',
                    loadMore: 'Tải thêm'
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
