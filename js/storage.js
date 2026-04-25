// 存储管理模块
class StorageManager {
    constructor() {
        this.db = null;
        this.useLocalStorage = false;
    }

    // 检查浏览器是否支持IndexedDB
    checkIndexedDBSupport() {
        return 'indexedDB' in window;
    }

    // 初始化IndexedDB
    initDB() {
        return new Promise((resolve, reject) => {
            if (!this.checkIndexedDBSupport()) {
                console.log('浏览器不支持IndexedDB，将使用localStorage');
                this.useLocalStorage = true;
                resolve(null);
                return;
            }

            try {
                const request = indexedDB.open('FishingIncomeDB', 1);

                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    
                    // 创建记录存储
                    if (!db.objectStoreNames.contains('records')) {
                        db.createObjectStore('records', { autoIncrement: true });
                    }
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    resolve(this.db);
                };

                request.onerror = (event) => {
                    console.error('IndexedDB初始化失败:', event.target.error);
                    this.useLocalStorage = true;
                    resolve(null);
                };
            } catch (error) {
                console.error('IndexedDB初始化异常:', error);
                this.useLocalStorage = true;
                resolve(null);
            }
        });
    }

    // 从localStorage加载记录
    loadFromLocalStorage() {
        try {
            const storedRecords = localStorage.getItem('fishingRecords');
            return storedRecords ? JSON.parse(storedRecords) : [];
        } catch (error) {
            console.error('从localStorage加载失败:', error);
            return [];
        }
    }

    // 保存到localStorage
    saveToLocalStorage(data) {
        try {
            localStorage.setItem('fishingRecords', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('保存到localStorage失败:', error);
            return false;
        }
    }

    // 加载记录
    loadRecords() {
        return new Promise((resolve, reject) => {
            if (this.useLocalStorage || !this.db) {
                const records = this.loadFromLocalStorage();
                resolve(records);
                return;
            }

            try {
                const transaction = this.db.transaction(['records'], 'readonly');
                const store = transaction.objectStore('records');
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const loadedRecords = event.target.result;
                    resolve(loadedRecords);
                };

                request.onerror = (event) => {
                    console.error('加载记录失败:', event.target.error);
                    resolve([]);
                };
            } catch (error) {
                console.error('加载记录异常:', error);
                resolve([]);
            }
        });
    }

    // 保存记录
    saveRecords(newRecords) {
        return new Promise((resolve, reject) => {
            if (this.useLocalStorage || !this.db) {
                const success = this.saveToLocalStorage(newRecords);
                resolve(success);
                return;
            }

            try {
                const transaction = this.db.transaction(['records'], 'readwrite');
                const store = transaction.objectStore('records');
                
                // 清空现有记录
                store.clear();
                
                // 保存新记录
                newRecords.forEach(record => {
                    store.add(record);
                });

                transaction.oncomplete = () => {
                    resolve(true);
                };

                transaction.onerror = (event) => {
                    console.error('保存记录失败:', event.target.error);
                    // 失败时回退到localStorage
                    this.useLocalStorage = true;
                    this.saveToLocalStorage(newRecords);
                    resolve(true);
                };
            } catch (error) {
                console.error('保存记录异常:', error);
                // 异常时回退到localStorage
                this.useLocalStorage = true;
                this.saveToLocalStorage(newRecords);
                resolve(true);
            }
        });
    }

    // 保存到文件
    saveToFile(records, fileName) {
        const content = JSON.stringify(records, null, 2);
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    // 从文件加载
    loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target.result;
                    const loadedRecords = JSON.parse(content);
                    resolve(loadedRecords);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            reader.readAsText(file);
        });
    }
}

// 导出存储管理器实例
const storageManager = new StorageManager();
