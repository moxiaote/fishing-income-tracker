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
            
            // 检查访问令牌
            const accessToken = localStorage.getItem('github_access_token');
            console.log('访问令牌:', accessToken ? '存在' : '不存在');
            
            if (!accessToken) {
                throw new Error('未找到GitHub访问令牌，请先登录GitHub');
            }
            
            const records = await this.loadRecords();
            console.log('加载记录成功:', records.length, '条');
            
            const data = {
                deviceId: this.deviceId,
                records: records,
                timestamp: new Date().toISOString()
            };

            // 尝试使用不同的CORS代理
            const corsProxies = [
                'https://cors-anywhere.herokuapp.com/',
                'https://api.allorigins.win/raw?url=',
                'https://cors.bridged.cc/',
                'https://proxy.cors.sh/'
            ];
            const githubApiBase = 'https://api.github.com';

            // 构建请求选项
            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${accessToken}`
                },
                mode: 'cors',
                cache: 'no-cache'
            };

            console.log('使用GitHub访问令牌进行认证');

            let response;
            let proxyUsed;
            
            if (!this.gistId) {
                console.log('创建新Gist...');
                // 尝试每个代理，直到成功
                for (const proxy of corsProxies) {
                    try {
                        console.log('尝试使用代理:', proxy);
                        const apiUrl = proxy + githubApiBase + '/gists';
                        // 添加超时处理
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
                        
                        response = await fetch(apiUrl, {
                            ...requestOptions,
                            body: JSON.stringify({
                                description: 'Fishing Income Data',
                                public: false,
                                files: {
                                    'data.json': {
                                        content: JSON.stringify(data, null, 2)
                                    }
                                }
                            }),
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        proxyUsed = proxy;
                        console.log('代理请求成功:', proxyUsed);
                        break;
                    } catch (proxyError) {
                        console.error('代理请求失败:', proxy, proxyError);
                        continue;
                    }
                }

                if (!response) {
                    throw new Error('所有CORS代理都失败了');
                }

                console.log('创建Gist响应状态:', response.status);
                
                const responseText = await response.text();
                console.log('创建Gist响应文本:', responseText);
                
                if (!response.ok) {
                    throw new Error(`创建Gist失败: ${response.status} - ${responseText}`);
                }

                let gistData;
                try {
                    // 尝试直接解析
                    gistData = JSON.parse(responseText);
                    console.log('Gist创建成功:', gistData);
                } catch (parseError) {
                    console.error('直接解析响应失败:', parseError);
                    
                    // 尝试处理可能的CORS代理包装响应
                    try {
                        // 检查是否是allorigins.win的包装格式
                        if (responseText.includes('"contents":')) {
                            const wrappedData = JSON.parse(responseText);
                            if (wrappedData.contents) {
                                gistData = JSON.parse(wrappedData.contents);
                                console.log('解析包装响应成功:', gistData);
                            } else {
                                throw new Error('包装响应中没有contents字段');
                            }
                        } else {
                            throw new Error('响应不是有效的JSON格式');
                        }
                    } catch (wrapError) {
                        console.error('解析包装响应失败:', wrapError);
                        throw new Error('解析响应失败: ' + parseError.message + '\n响应内容: ' + responseText.substring(0, 200) + '...');
                    }
                }
                
                this.gistId = gistData.id;
                localStorage.setItem('gistId', this.gistId);
                console.log('Gist ID保存成功:', this.gistId);
                
                // 显示成功提示
                alert('Gist创建成功！Gist ID: ' + this.gistId);
            } else {
                console.log('更新现有Gist:', this.gistId);
                // 尝试每个代理，直到成功
                for (const proxy of corsProxies) {
                    try {
                        console.log('尝试使用代理:', proxy);
                        const apiUrl = proxy + githubApiBase + `/gists/${this.gistId}`;
                        // 添加超时处理
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
                        
                        response = await fetch(apiUrl, {
                            ...requestOptions,
                            method: 'PATCH',
                            body: JSON.stringify({
                                files: {
                                    'data.json': {
                                        content: JSON.stringify(data, null, 2)
                                    }
                                }
                            }),
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        proxyUsed = proxy;
                        console.log('代理请求成功:', proxyUsed);
                        break;
                    } catch (proxyError) {
                        console.error('代理请求失败:', proxy, proxyError);
                        continue;
                    }
                }

                if (!response) {
                    throw new Error('所有CORS代理都失败了');
                }

                console.log('更新Gist响应状态:', response.status);
                
                const responseText = await response.text();
                console.log('更新Gist响应文本:', responseText);
                
                if (!response.ok) {
                    throw new Error(`更新Gist失败: ${response.status} - ${responseText}`);
                }

                let gistData;
                try {
                    // 尝试直接解析
                    gistData = JSON.parse(responseText);
                    console.log('Gist更新成功:', gistData);
                } catch (parseError) {
                    console.error('直接解析响应失败:', parseError);
                    
                    // 尝试处理可能的CORS代理包装响应
                    try {
                        // 检查是否是allorigins.win的包装格式
                        if (responseText.includes('"contents":')) {
                            const wrappedData = JSON.parse(responseText);
                            if (wrappedData.contents) {
                                gistData = JSON.parse(wrappedData.contents);
                                console.log('解析包装响应成功:', gistData);
                            } else {
                                throw new Error('包装响应中没有contents字段');
                            }
                        } else {
                            throw new Error('响应不是有效的JSON格式');
                        }
                    } catch (wrapError) {
                        console.error('解析包装响应失败:', wrapError);
                        throw new Error('解析响应失败: ' + parseError.message + '\n响应内容: ' + responseText.substring(0, 200) + '...');
                    }
                }
                
                console.log('Gist更新成功:', this.gistId);
                
                // 显示成功提示
                alert('Gist更新成功！Gist ID: ' + this.gistId);
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
            } else if (error.message.includes('401')) {
                console.error('GitHub API认证错误');
                alert('同步失败: GitHub API要求身份认证。\n\n建议：\n1. 点击"GitHub登录"按钮进行认证\n2. 使用"保存到文件"功能作为备用');
            } else if (error.message.includes('未找到GitHub访问令牌')) {
                console.error('访问令牌缺失');
                alert('同步失败: 未找到GitHub访问令牌，请先登录GitHub。');
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

            // 检查访问令牌
            const accessToken = localStorage.getItem('github_access_token');
            console.log('访问令牌:', accessToken ? '存在' : '不存在');
            
            if (!accessToken) {
                throw new Error('未找到GitHub访问令牌，请先登录GitHub');
            }

            // 尝试使用不同的CORS代理
            const corsProxies = [
                'https://cors-anywhere.herokuapp.com/',
                'https://api.allorigins.win/raw?url=',
                'https://cors.bridged.cc/',
                'https://proxy.cors.sh/'
            ];
            const githubApiBase = 'https://api.github.com';

            // 构建请求选项
            const requestOptions = {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${accessToken}`
                },
                mode: 'cors',
                cache: 'no-cache'
            };

            console.log('使用GitHub访问令牌进行认证');

            let response;
            let proxyUsed;
            
            // 尝试每个代理，直到成功
            for (const proxy of corsProxies) {
                try {
                    console.log('尝试使用代理:', proxy);
                    const apiUrl = proxy + githubApiBase + `/gists/${this.gistId}`;
                    
                    // 添加超时处理
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
                    
                    response = await fetch(apiUrl, {
                        ...requestOptions,
                        signal: controller.signal
                    });
                    
                    clearTimeout(timeoutId);
                    proxyUsed = proxy;
                    console.log('代理请求成功:', proxyUsed);
                    break;
                } catch (proxyError) {
                    console.error('代理请求失败:', proxy, proxyError);
                    continue;
                }
            }

            if (!response) {
                throw new Error('所有CORS代理都失败了');
            }

            console.log('获取Gist响应状态:', response.status);
            
            const responseText = await response.text();
            console.log('获取Gist响应文本:', responseText);
            
            if (!response.ok) {
                throw new Error(`获取Gist失败: ${response.status} - ${responseText}`);
            }

            let gistData;
            try {
                // 尝试直接解析
                gistData = JSON.parse(responseText);
                console.log('Gist数据获取成功:', gistData);
            } catch (parseError) {
                console.error('直接解析响应失败:', parseError);
                
                // 尝试处理可能的CORS代理包装响应
                try {
                    // 检查是否是allorigins.win的包装格式
                    if (responseText.includes('"contents":')) {
                        const wrappedData = JSON.parse(responseText);
                        if (wrappedData.contents) {
                            gistData = JSON.parse(wrappedData.contents);
                            console.log('解析包装响应成功:', gistData);
                        } else {
                            throw new Error('包装响应中没有contents字段');
                        }
                    } else {
                        throw new Error('响应不是有效的JSON格式');
                    }
                } catch (wrapError) {
                    console.error('解析包装响应失败:', wrapError);
                    throw new Error('解析响应失败: ' + parseError.message + '\n响应内容: ' + responseText.substring(0, 200) + '...');
                }
            }

            if (!gistData.files || !gistData.files['data.json']) {
                throw new Error('Gist中不存在data.json文件');
            }

            const content = gistData.files['data.json'].content;
            console.log('data.json内容:', content);
            
            let parsedData;
            try {
                parsedData = JSON.parse(content);
                console.log('解析data.json成功:', parsedData);
            } catch (parseError) {
                throw new Error('解析data.json失败: ' + parseError.message);
            }

            if (parsedData.records) {
                console.log('找到记录:', parsedData.records.length, '条');
                await this.saveRecords(parsedData.records);
                console.log('从Gist同步成功');
                
                // 显示成功提示
                alert('从Gist同步成功！加载了 ' + parsedData.records.length + ' 条记录。');
                
                return true;
            } else {
                throw new Error('Gist中没有找到records数据');
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
                alert('加载失败: Gist不存在，请检查Gist ID是否正确。');
            } else if (error.message.includes('401')) {
                console.error('GitHub API认证错误');
                alert('加载失败: GitHub API要求身份认证。\n\n建议：\n1. 点击"GitHub登录"按钮进行认证\n2. 使用"从文件加载"功能作为备用');
            } else if (error.message.includes('未找到GitHub访问令牌')) {
                console.error('访问令牌缺失');
                alert('同步失败: 未找到GitHub访问令牌，请先登录GitHub。');
            } else {
                console.error('其他错误:', error);
                alert('加载失败: ' + error.message);
            }
            return false;
        }
    }

    // 从Gist ID加载数据
    async loadFromGist() {
        try {
            console.log('开始从Gist ID加载数据...');
            
            // 提示用户输入目标设备的Gist ID
            const gistId = prompt('请输入Gist ID:');
            if (!gistId) {
                console.log('用户取消输入Gist ID');
                return false;
            }
            
            console.log('用户输入的Gist ID:', gistId);
            
            // 检查访问令牌
            const accessToken = localStorage.getItem('github_access_token');
            console.log('访问令牌:', accessToken ? '存在' : '不存在');
            
            if (!accessToken) {
                throw new Error('未找到GitHub访问令牌，请先登录GitHub');
            }
            
            // 临时保存当前Gist ID
            const originalGistId = this.gistId;
            console.log('原始Gist ID:', originalGistId);
            
            // 临时设置为目标设备的Gist ID
            this.gistId = gistId;
            console.log('临时设置的Gist ID:', this.gistId);
            
            // 尝试从Gist同步数据
            console.log('开始同步数据...');
            const synced = await this.syncFromGist();
            console.log('同步结果:', synced);
            
            // 恢复原始Gist ID
            this.gistId = originalGistId;
            console.log('恢复原始Gist ID:', this.gistId);
            
            return synced;
        } catch (error) {
            console.error('从Gist ID加载失败:', error);
            alert('加载失败: ' + error.message);
            return false;
        }
    }
}

// 导出存储管理器实例
const storageManager = new StorageManager();
