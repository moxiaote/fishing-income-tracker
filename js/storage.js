// 存储管理模块
class StorageManager {
    constructor() {
        this.db = null;
        this.useLocalStorage = false;
        this.deviceId = this.getDeviceId();
        this.gistId = localStorage.getItem('gistId');
    }

    // 获取Gist ID（公共方法）
    getGistId() {
        return this.gistId;
    }

    // 获取设备ID（公共方法）
    getDeviceId() {
        let deviceId = localStorage.getItem('deviceId');
        if (!deviceId) {
            deviceId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                const r = Math.random() * 16 | 0;
                const v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
            localStorage.setItem('deviceId', deviceId);
        }
        return deviceId;
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

    // 同步到GitHub Gist
    async syncToGist() {
        try {
            console.log('开始同步到Gist...');
            const records = await this.loadRecords();
            console.log('加载记录成功:', records.length, '条');
            
            const data = {
                deviceId: this.deviceId,
                records: records,
                timestamp: new Date().toISOString()
            };

            // 使用CORS代理解决跨域问题
            const corsProxy = 'https://cors-anywhere.herokuapp.com/';
            const githubApiBase = 'https://api.github.com';

            // 构建请求选项
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json'
                },
                mode: 'cors',
                cache: 'no-cache'
            };

            if (!this.gistId) {
                console.log('创建新Gist...');
                // 创建新Gist
                const response = await fetch(corsProxy + githubApiBase + '/gists', {
                    ...requestOptions,
                    body: JSON.stringify({
                        description: 'Fishing Income Data',
                        public: false,
                        files: {
                            'data.json': {
                                content: JSON.stringify(data, null, 2)
                            }
                        }
                    })
                });

                console.log('创建Gist响应状态:', response.status);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('创建Gist失败详情:', errorText);
                    throw new Error(`创建Gist失败: ${response.status} - ${errorText}`);
                }

                const gistData = await response.json();
                console.log('Gist创建成功:', gistData);
                this.gistId = gistData.id;
                localStorage.setItem('gistId', this.gistId);
                console.log('Gist ID保存成功:', this.gistId);
            } else {
                console.log('更新现有Gist:', this.gistId);
                // 更新现有Gist
                const response = await fetch(corsProxy + githubApiBase + `/gists/${this.gistId}`, {
                    ...requestOptions,
                    method: 'PATCH',
                    body: JSON.stringify({
                        files: {
                            'data.json': {
                                content: JSON.stringify(data, null, 2)
                            }
                        }
                    })
                });

                console.log('更新Gist响应状态:', response.status);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('更新Gist失败详情:', errorText);
                    throw new Error(`更新Gist失败: ${response.status} - ${errorText}`);
                }

                console.log('Gist更新成功:', this.gistId);
            }

            return true;
        } catch (error) {
            console.error('同步到Gist失败:', error);
            // 检查错误类型并提供详细的用户友好提示
            if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
                console.error('跨域错误或网络错误');
                alert('同步失败: 浏览器阻止了跨域请求或网络连接问题。\n\n建议：\n1. 使用"保存到文件"功能作为备用\n2. 在本地服务器中打开应用\n3. 检查网络连接');
            } else if (error.message.includes('403')) {
                console.error('GitHub API速率限制');
                alert('同步失败: GitHub API速率限制，请稍后再试。\n\n建议：\n1. 等待60分钟后再试\n2. 使用"保存到文件"功能作为备用');
            } else if (error.message.includes('404')) {
                console.error('Gist不存在');
                alert('同步失败: Gist不存在，请检查Gist ID是否正确。');
            } else {
                console.error('其他错误:', error);
                alert('同步失败: ' + error.message + '\n\n建议使用"保存到文件"功能作为备用。');
            }
            return false;
        }
    }

    // 从GitHub Gist同步
    async syncFromGist() {
        try {
            if (!this.gistId) {
                console.log('未找到Gist ID，跳过同步');
                return false;
            }

            // 使用CORS代理解决跨域问题
            const corsProxy = 'https://cors-anywhere.herokuapp.com/';
            const githubApiBase = 'https://api.github.com';

            // 构建请求选项
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json'
                },
                mode: 'cors',
                cache: 'no-cache'
            };

            const response = await fetch(corsProxy + githubApiBase + `/gists/${this.gistId}`, requestOptions);
            if (!response.ok) {
                throw new Error(`获取Gist失败: ${response.status}`);
            }

            const gistData = await response.json();
            const content = gistData.files['data.json'].content;
            const parsedData = JSON.parse(content);

            if (parsedData.records) {
                await this.saveRecords(parsedData.records);
                console.log('从Gist同步成功');
                return true;
            }

            return false;
        } catch (error) {
            console.error('从Gist同步失败:', error);
            // 检查错误类型并提供详细的用户友好提示
            if (error.message.includes('CORS') || error.message.includes('NetworkError')) {
                console.error('跨域错误或网络错误');
                alert('同步失败: 浏览器阻止了跨域请求或网络连接问题。\n\n建议：\n1. 检查网络连接\n2. 确保Gist ID正确');
            } else if (error.message.includes('403')) {
                console.error('GitHub API速率限制');
                alert('同步失败: GitHub API速率限制，请稍后再试。');
            } else if (error.message.includes('404')) {
                console.error('Gist不存在');
                alert('同步失败: Gist不存在，请检查Gist ID是否正确。');
            } else {
                console.error('其他错误:', error);
                alert('同步失败: ' + error.message);
            }
            return false;
        }
    }

    // 从Gist ID加载数据
    async loadFromGist() {
        try {
            // 提示用户输入目标设备的Gist ID
            const gistId = prompt('请输入Gist ID:');
            if (!gistId) return false;
            
            // 临时保存当前Gist ID
            const originalGistId = this.gistId;
            
            // 临时设置为目标设备的Gist ID
            this.gistId = gistId;
            
            // 尝试从Gist同步数据
            const synced = await this.syncFromGist();
            
            // 恢复原始Gist ID
            this.gistId = originalGistId;
            
            return synced;
        } catch (error) {
            console.error('从Gist ID加载失败:', error);
            return false;
        }
    }
}

// 导出存储管理器实例
const storageManager = new StorageManager();
