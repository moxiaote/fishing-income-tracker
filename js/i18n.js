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
            console.log('开始加载翻译文件...');
            
            // 加载中文翻译
            console.log('加载中文翻译...');
            const zhResponse = await fetch('locales/zh.json');
            console.log('中文翻译响应状态:', zhResponse.status);
            this.translations.zh = await zhResponse.json();
            console.log('中文翻译加载成功');
            
            // 加载繁体中文翻译
            console.log('加载繁体中文翻译...');
            const zhTwResponse = await fetch('locales/zh-TW.json');
            console.log('繁体中文翻译响应状态:', zhTwResponse.status);
            this.translations['zh-TW'] = await zhTwResponse.json();
            console.log('繁体中文翻译加载成功');
            
            // 加载英文翻译
            console.log('加载英文翻译...');
            const enResponse = await fetch('locales/en.json');
            console.log('英文翻译响应状态:', enResponse.status);
            this.translations.en = await enResponse.json();
            console.log('英文翻译加载成功');
            
            // 加载韩文翻译
            console.log('加载韩文翻译...');
            const koResponse = await fetch('locales/ko.json');
            console.log('韩文翻译响应状态:', koResponse.status);
            this.translations.ko = await koResponse.json();
            console.log('韩文翻译加载成功');
            
            // 加载越南语翻译
            console.log('加载越南语翻译...');
            const viResponse = await fetch('locales/vi.json');
            console.log('越南语翻译响应状态:', viResponse.status);
            this.translations.vi = await viResponse.json();
            console.log('越南语翻译加载成功');
            
            console.log('所有翻译文件加载成功');
            console.log('支持的语言:', Object.keys(this.translations));
            console.log('当前语言:', this.currentLang);
            
            // 如果当前语言不在支持的列表中，默认使用中文
            if (!this.translations[this.currentLang]) {
                console.log('当前语言不在支持列表中，默认使用中文');
                this.currentLang = 'zh';
            }
            
            console.log('最终使用的语言:', this.currentLang);
        } catch (error) {
            console.error('加载翻译文件失败:', error);
            // 使用默认翻译
            console.log('使用默认翻译');
            this.translations = {
                zh: {
                    appTitle: '钓鱼发烧友：财富积累日记',
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
                    loadMore: '加载更多',
                    gistSync: 'Gist 同步功能',
                    laboratory: '(实验室)',
                    githubLogin: 'GitHub登录',
                    loadFromGist: '从Gist ID加载',
                    uploadBackup: '上传备份',
                    gistId: 'Gist ID',
                    copy: '复制',
                    syncNote1: '此功能处于测试阶段，可能会遇到同步失败的情况。',
                    syncNote2: '如遇网络失败，请访问 CORS代理演示页面 获取临时权限。',
                    autoGenerate: '登录GitHub 之后点击上传备份生成'
                },
                'zh-TW': {
                    appTitle: '釣魚發燒友：財富積累日記',
                    usageTips: '使用提示：',
                    tip1: '添加記錄後，數據會自動保存到瀏覽器中',
                    tip2: '點擊"保存到文件"按鈕可將數據備份到本地文件',
                    tip3: '點擊"從文件加載"按鈕可恢復之前備份的數據',
                    tip4: '定期備份數據，以防瀏覽器數據丟失',
                    statsOverview: '統計概覽',
                    trendChart: '趨勢圖表',
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
                    loadMore: '加載更多',
                    fileOperations: '檔案操作',
                    gistSync: 'Gist 同步功能',
                    laboratory: '(實驗室)',
                    githubLogin: 'GitHub登錄',
                    loadFromGist: '從Gist ID加載',
                    uploadBackup: '上傳備份',
                    gistId: 'Gist ID',
                    copy: '複製',
                    syncNote1: '此功能處於測試階段，可能會遇到同步失敗的情況。',
                    syncNote2: '如遇網路失敗，請訪問 CORS代理演示頁面 獲取臨時許可權。',
                    autoGenerate: '登錄GitHub 之後點擊上傳備份生成'
                },
                en: {
                    appTitle: 'Ace Fishing : Wild Catch',
                    usageTips: 'Usage Tips:',
                    tip1: 'After adding records, data will be automatically saved to the browser',
                    tip2: 'Click the "Save to File" button to back up data to a local file',
                    tip3: 'Click the "Load from File" button to restore previously backed up data',
                    tip4: 'Back up data regularly to avoid browser data loss',
                    statsOverview: 'Statistics Overview',
                    trendChart: 'Trend Chart',
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
                    loadMore: 'Load More',
                    fileOperations: 'File Operations',
                    gistSync: 'Gist Sync',
                    laboratory: '(Laboratory)',
                    githubLogin: 'GitHub Login',
                    loadFromGist: 'Load from Gist ID',
                    uploadBackup: 'Upload Backup',
                    gistId: 'Gist ID',
                    copy: 'Copy',
                    syncNote1: 'This feature is in testing phase and may encounter sync failures.',
                    syncNote2: 'If network fails, please visit CORS proxy demo page to get temporary access.',
                    autoGenerate: 'Generate after clicking Upload Backup'
                },
                ko: {
                    appTitle: '낚시의 신',
                    usageTips: '사용 팁:',
                    tip1: '기록을 추가한 후 데이터가 브라우저에 자동으로 저장됩니다',
                    tip2: '데이터를 로컬 파일에 백업하려면 "파일에 저장" 버튼을 클릭하세요',
                    tip3: '이전에 백업한 데이터를 복원하려면 "파일에서 로드" 버튼을 클릭하세요',
                    tip4: '브라우저 데이터 손실을 방지하기 위해 정기적으로 데이터를 백업하세요',
                    statsOverview: '통계 개요',
                    trendChart: '추세 차트',
                    totalInfo: '총 정보',
                    addRecord: '기록 추가',
                    dataManagement: '데이터 관리',
                    recordDetails: '기록 세부 정보',
                    date: '날짜',
                    type: '유형',
                    diamond: '다이아몬드',
                    breakthrough: '브레이크스루 바우처',
                    rawstone: '원석',
                    platinum: '백금',
                    remark: '비고',
                    action: '작업',
                    income: '수입',
                    expense: '지출',
                    addRecordBtn: '기록 추가',
                    saveToFile: '파일에 저장',
                    loadFromFile: '파일에서 로드',
                    delete: '삭제',
                    recordAdded: '기록이 성공적으로 추가되었습니다!',
                    dataSaved: '데이터가 fishing_income.txt 파일에 저장되었습니다',
                    dataLoaded: '데이터가 파일에서 로드되었습니다',
                    fileFormatError: '파일 형식 오류, 데이터를 로드할 수 없습니다',
                    page: '페이지',
                    of: '의',
                    totalRecords: '총 기록 수',
                    first: '첫 페이지',
                    previous: '이전 페이지',
                    next: '다음 페이지',
                    last: '마지막 페이지',
                    loadMore: '더 로드',
                    fileOperations: '파일 작업',
                    gistSync: 'Gist 동기화 기능',
                    laboratory: '(실험실)',
                    githubLogin: 'GitHub 로그인',
                    loadFromGist: 'Gist ID에서 로드',
                    uploadBackup: '백업 업로드',
                    gistId: 'Gist ID',
                    copy: '복사',
                    syncNote1: '이 기능은 테스트 단계에 있으며 동기화 실패가 발생할 수 있습니다.',
                    syncNote2: '네트워크가 실패하면 CORS 프록시 데모 페이지에 방문하여 임시 액세스를 얻으세요.',
                    autoGenerate: 'GitHub 로그인 후 백업 업로드 클릭하여 생성'
                },
                vi: {
                    appTitle: 'Người yêu câu cá: Nhật ký tích luỹ tài sản',
                    usageTips: 'Lưu ý sử dụng：',
                    tip1: 'Sau khi thêm ghi chú, dữ liệu sẽ tự động được lưu vào trình duyệt',
                    tip2: 'Nhấn nút "Lưu vào tệp" để sao lưu dữ liệu vào tệp cục bộ',
                    tip3: 'Nhấn nút "Tải từ tệp" để khôi phục dữ liệu đã sao lưu trước đó',
                    tip4: 'Sao lưu dữ liệu định kỳ để tránh mất dữ liệu trình duyệt',
                    statsOverview: 'Tổng quan thống kê',
                    trendChart: 'Biểu đồ xu hướng',
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
                    loadMore: 'Tải thêm',
                    fileOperations: 'Thao tác tệp',
                    gistSync: 'Chức năng đồng bộ Gist',
                    laboratory: '(Phòng thí nghiệm)',
                    githubLogin: 'Đăng nhập GitHub',
                    loadFromGist: 'Tải từ Gist ID',
                    uploadBackup: 'Tải lên sao lưu',
                    gistId: 'Gist ID',
                    copy: 'Sao chép',
                    syncNote1: 'Chức năng này đang trong giai đoạn thử nghiệm và có thể gặp lỗi đồng bộ.',
                    syncNote2: 'Nếu mạng lỗi, hãy truy cập trang demo proxy CORS để lấy quyền truy cập tạm thời.',
                    autoGenerate: 'Tạo sau khi nhấn Tải lên sao lưu'
                }
            };
        }
    }

    // 应用语言
    applyLanguage() {
        const translation = this.translations[this.currentLang];
        console.log('应用语言:', this.currentLang);
        console.log('翻译对象:', translation);
        
        // 确保翻译对象存在
        if (!translation) {
            console.error('翻译对象不存在:', this.currentLang);
            return;
        }
        
        // 显示当前语言的文本，隐藏其他语言的文本
        console.log('显示当前语言的文本，隐藏其他语言的文本');
        
        // 隐藏所有语言的文本
        document.querySelectorAll('[class^="lang-"]').forEach(element => {
            element.style.display = 'none';
        });
        
        // 显示当前语言的文本
        document.querySelectorAll('.lang-' + this.currentLang).forEach(element => {
            element.style.display = 'inline';
        });
        
        // 处理Gist ID输入框提示
        const gistIdInput = document.getElementById('gist-id');
        if (gistIdInput && !gistIdInput.value) {
            console.log('更新Gist ID输入框提示:', translation.autoGenerate);
            gistIdInput.value = translation.autoGenerate || '登录GitHub 之后点击上传备份生成';
        }
        
        // 遍历所有带有data-i18n属性的元素
        const elements = document.querySelectorAll('[data-i18n]');
        console.log('找到带有data-i18n属性的元素数量:', elements.length);
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translation[key]) {
                element.textContent = translation[key];
            }
        });
        
        // 更新网页标题
        this.updatePageTitle();
        
        // 更新语言选择器显示
        this.updateLanguageSelector();
        
        // 更新图表标签
        console.log('更新图表标签');
        if (typeof chartManager !== 'undefined' && chartManager.updateCharts) {
            chartManager.updateCharts();
        }
    }

    // 更新网页标题
    updatePageTitle() {
        const translation = this.translations[this.currentLang];
        if (translation.appTitle) {
            document.title = translation.appTitle;
        }
    }

    // 更新语言选择器显示
    updateLanguageSelector() {
        const languageCodes = {
            'zh': 'CN',
            'zh-TW': 'TW',
            'en': 'EN',
            'ko': 'KR',
            'vi': 'VN'
        };
        const currentLanguageElement = document.getElementById('currentLanguage');
        if (currentLanguageElement) {
            currentLanguageElement.textContent = languageCodes[this.currentLang] || this.currentLang;
        }
    }

    // 获取翻译文本
    getText(key) {
        const translation = this.translations[this.currentLang];
        return translation[key] || key;
    }

    // 切换语言
    changeLanguage(lang) {
        console.log('开始切换语言:', lang);
        console.log('当前支持的语言:', Object.keys(this.translations));
        
        if (this.translations[lang]) {
            console.log('语言存在，切换到:', lang);
            this.currentLang = lang;
            console.log('调用applyLanguage()');
            this.applyLanguage();
            console.log('语言切换完成');
        } else {
            console.error('语言不存在:', lang);
        }
    }
}

// 导出国际化实例
const i18n = new I18n();
