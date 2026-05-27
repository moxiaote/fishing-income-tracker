// 存储管理模块
class StorageManager {
    constructor() {
        this.db = null;
        this.useLocalStorage = false;
        this.deviceId = this.getDeviceId();
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        this.apiBaseUrl = isLocalhost ? '../data_sync.php' : 'https://ka.chenxiaofei.cn/api/data_sync.php';
        this.signSecret = 'moxiaote-sign-secret-v1';
        this.appKey = 'moxiaote-app-key-2024';
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

    // 生成签名
    generateSignature(data) {
        const sortedData = {};
        Object.keys(data).sort().forEach(key => {
            sortedData[key] = data[key];
        });
        const signStr = new URLSearchParams(sortedData).toString() + this.signSecret + this.appKey;
        return this.sha256(signStr);
    }

    // SHA256哈希
    async sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // 发送API请求
    async sendApiRequest(action, postData) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signData = {
            action: action,
            timestamp: timestamp,
            qq: postData.qq || '',
            card: postData.card || ''
        };
        
        const signature = await this.generateSignature(signData);
        
        try {
            const response = await fetch(`${this.apiBaseUrl}?action=${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-Time': timestamp.toString(),
                    'X-Signature': signature
                },
                body: JSON.stringify(postData)
            });
            
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            return {
                success: false,
                message: '网络请求失败，请检查网络连接后重试'
            };
        }
    }

    // 检查会员状态
    checkMemberStatus() {
        let activationData = localStorage.getItem('activationData');
        if (!activationData) {
            activationData = localStorage.getItem('activation_data');
        }
        
        if (!activationData) {
            return { activated: false };
        }
        
        try {
            const data = JSON.parse(activationData);
            return {
                activated: data.activated === true || localStorage.getItem('activated_flag') === 'true',
                qq: data.qq || localStorage.getItem('activation_qq') || '',
                card: data.card || '',
                productId: data.product_id || 0,
                productName: data.product_name || ''
            };
        } catch (error) {
            const qq = localStorage.getItem('activation_qq');
            const activated = localStorage.getItem('activated_flag') === 'true';
            if (qq && activated) {
                return {
                    activated: true,
                    qq: qq,
                    card: '',
                    productId: 0,
                    productName: ''
                };
            }
            return { activated: false };
        }
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

    // 上传数据到云端
    async uploadToCloud() {
        try {
            console.log('开始上传数据到云端...');
            
            const memberStatus = this.checkMemberStatus();
            if (!memberStatus.activated) {
                alert('请先验证卡密，成为会员后才能使用云端同步功能。');
                return false;
            }
            
            const records = await this.loadRecords();
            console.log('加载记录成功:', records.length, '条');
            
            const postData = {
                qq: memberStatus.qq,
                card: memberStatus.card,
                records: records,
                deviceId: this.deviceId
            };
            
            const result = await this.sendApiRequest('upload', postData);
            
            if (result.success) {
                const updateTime = result.data && result.data.update_time ? result.data.update_time : '';
                localStorage.setItem('lastSyncTime', updateTime);
                alert('数据上传成功！' + (updateTime ? '更新时间: ' + updateTime : ''));
                return true;
            } else {
                if (result.data && result.data.rate_limited) {
                    const remaining = result.data.remaining_seconds;
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    const waitTime = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
                    alert(`云端同步操作过于频繁，请${waitTime}后再试。`);
                } else {
                    alert('上传失败: ' + (result.message || '未知错误'));
                }
                return false;
            }
        } catch (error) {
            console.error('上传到云端失败:', error);
            alert('上传失败: ' + error.message);
            return false;
        }
    }

    // 从云端下载数据
    async downloadFromCloud() {
        try {
            console.log('开始从云端下载数据...');
            
            const memberStatus = this.checkMemberStatus();
            if (!memberStatus.activated) {
                alert('请先验证卡密，成为会员后才能使用云端同步功能。');
                return false;
            }
            
            const postData = {
                qq: memberStatus.qq,
                card: memberStatus.card
            };
            
            const result = await this.sendApiRequest('download', postData);
            
            if (result.success && result.data && result.data.records) {
                const records = result.data.records;
                console.log('找到记录:', records.length, '条');
                await this.saveRecords(records);
                
                const updateTime = result.data.update_time || '';
                localStorage.setItem('lastSyncTime', updateTime);
                alert('从云端下载成功！加载了 ' + records.length + ' 条记录。' + (updateTime ? '更新时间: ' + updateTime : ''));
                
                return true;
            } else {
                if (result.data && result.data.rate_limited) {
                    const remaining = result.data.remaining_seconds;
                    const minutes = Math.floor(remaining / 60);
                    const seconds = remaining % 60;
                    const waitTime = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
                    alert(`云端同步操作过于频繁，请${waitTime}后再试。`);
                } else if (result.data && result.data.no_data) {
                    alert('未找到云端备份数据，请先上传数据。');
                } else {
                    alert('下载失败: ' + (result.message || '未知错误'));
                }
                return false;
            }
        } catch (error) {
            console.error('从云端下载失败:', error);
            alert('下载失败: ' + error.message);
            return false;
        }
    }

    // 检查云端同步状态
    async checkCloudStatus() {
        try {
            const memberStatus = this.checkMemberStatus();
            if (!memberStatus.activated) {
                return { has_backup: false, need_activation: true };
            }
            
            const postData = {
                qq: memberStatus.qq,
                card: memberStatus.card
            };
            
            const result = await this.sendApiRequest('check', postData);
            
            if (result.success && result.data) {
                return result.data;
            }
            
            return { has_backup: false };
        } catch (error) {
            console.error('检查云端状态失败:', error);
            return { has_backup: false, error: error.message };
        }
    }

    // 显示云端同步状态
    async displayCloudStatus() {
        const statusElement = document.getElementById('cloud-status');
        const lastSyncElement = document.getElementById('last-sync-time');
        const memberStatus = this.checkMemberStatus();
        
        if (!memberStatus.activated) {
            if (statusElement) {
                statusElement.textContent = '未激活会员';
                statusElement.className = 'text-danger';
            }
            if (lastSyncElement) {
                lastSyncElement.textContent = '请先验证卡密';
            }
            return;
        }
        
        const lastSyncTime = localStorage.getItem('lastSyncTime');
        if (lastSyncElement) {
            lastSyncElement.textContent = lastSyncTime ? '上次同步: ' + lastSyncTime : '尚未同步';
        }
        
        if (statusElement) {
            statusElement.textContent = '会员已激活';
            statusElement.className = 'text-success';
        }
    }

    // 保存会员激活数据
    saveActivationData(data) {
        localStorage.setItem('activationData', JSON.stringify({
            activated: true,
            qq: data.qq || '',
            card: data.card || '',
            product_id: data.product_id || 0,
            product_name: data.product_name || '',
            activation_time: new Date().toISOString()
        }));
    }

    // 清除会员激活数据
    clearActivationData() {
        localStorage.removeItem('activationData');
        localStorage.removeItem('lastSyncTime');
    }

    // 兼容旧方法：syncToGist
    async syncToGist() {
        return await this.uploadToCloud();
    }

    // 兼容旧方法：syncFromGist
    async syncFromGist() {
        return await this.downloadFromCloud();
    }

    // 兼容旧方法：loadFromGist
    async loadFromGist() {
        return await this.downloadFromCloud();
    }

    // 兼容旧方法：getGistId
    getGistId() {
        const memberStatus = this.checkMemberStatus();
        return memberStatus.activated ? memberStatus.qq : '';
    }
}

// 导出存储管理器实例
const storageManager = new StorageManager();
