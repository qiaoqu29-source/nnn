// AI OS Refined - Enhanced Script
// 增强交互体验和流畅动画

let chars = [], sets = {}, curId = null, swReg = null;

// ==================== 初始化系统 ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupAnimations();
});

function initializeApp() {
    // 1. 加载数据
    chars = JSON.parse(localStorage.getItem('characters') || '[]');
    sets = JSON.parse(localStorage.getItem('settings') || '{"bgUrl":"","apiUrl":"","apiKey":"","modelName":"gpt-4o","temp":0.7}');
    
    // 2. 环境初始化
    if(document.getElementById('set-url')) {
        document.getElementById('set-url').value = sets.apiUrl || '';
        document.getElementById('set-key').value = sets.apiKey || '';
        document.getElementById('set-model').value = sets.modelName || 'gpt-4o';
        document.getElementById('set-temp').value = sets.temp || 0.7;
        document.getElementById('set-bg').value = sets.bgUrl || '';
    }
    
    applySettings();
    renderList();
    setInterval(updateClock, 1000); 
    updateClock();
    setInterval(checkActiveMessages, 60000);
}

// ==================== 动画增强 ====================
function setupAnimations() {
    // 为所有可点击元素添加触觉反馈
    document.querySelectorAll('.app-item, .dock-item, button').forEach(el => {
        el.addEventListener('touchstart', function() {
            this.style.transition = 'transform 0.1s';
            this.style.transform = 'scale(0.95)';
        });
        
        el.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
}

// 平滑滚动到底部
function smoothScrollToBottom(element) {
    const targetScroll = element.scrollHeight;
    const startScroll = element.scrollTop;
    const distance = targetScroll - startScroll;
    const duration = 400;
    let start = null;
    
    function animation(currentTime) {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // 使用缓动函数
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        element.scrollTop = startScroll + (distance * easeOutCubic);
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// ==================== 系统应用 ====================
function applySettings() {
    if(sets.bgUrl) {
        const wrapper = document.getElementById('phone-wrapper');
        wrapper.style.backgroundImage = `url('${sets.bgUrl}')`;
        wrapper.style.opacity = '0';
        setTimeout(() => {
            wrapper.style.transition = 'opacity 0.6s ease';
            wrapper.style.opacity = '1';
        }, 50);
    }
}

function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2,'0');
    const minutes = now.getMinutes().toString().padStart(2,'0');
    const timeString = `${hours}:${minutes}`;
    
    const timeEl = document.getElementById('st-time');
    if(timeEl && timeEl.innerText !== timeString) {
        timeEl.style.opacity = '0.5';
        setTimeout(() => {
            timeEl.innerText = timeString;
            timeEl.style.transition = 'opacity 0.3s';
            timeEl.style.opacity = '1';
        }, 150);
    }
}

function openApp(id) {
    const app = document.getElementById(id);
    app.classList.add('open');
    
    // 添加打开动画
    app.style.transform = 'translateX(100%)';
    requestAnimationFrame(() => {
        app.style.transition = 'transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)';
        app.style.transform = 'translateX(0)';
    });
}

function closeApp(id) {
    const app = document.getElementById(id);
    app.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        app.classList.remove('open');
    }, 500);
}

// ==================== 核心渲染 ====================
function renderList() {
    const grid = document.getElementById('desktop-app-grid');
    const list = document.getElementById('list-con');
    
    if(grid) {
        grid.innerHTML = '';
        chars.forEach((c, index) => {
            const app = createAppIcon(c, index);
            grid.appendChild(app);
        });
    }
    
    if(list) {
        list.innerHTML = '';
        chars.forEach((c, index) => {
            const li = createListItem(c, index);
            list.appendChild(li);
        });
    }
}

function createAppIcon(char, index) {
    const app = document.createElement('div');
    app.className = 'app-item';
    app.style.animationDelay = `${0.1 + index * 0.05}s`;
    app.onclick = () => openRoom(char.id);
    
    const iconHtml = char.iconUrl 
        ? `<img src="${char.iconUrl}" alt="${char.name}">` 
        : `<span>${char.name[0]}</span>`;
    
    app.innerHTML = `
        <div class="app-icon">${iconHtml}</div>
        <div class="app-name-label">${char.nickname || char.name}</div>
    `;
    
    return app;
}

function createListItem(char, index) {
    const li = document.createElement('div');
    li.className = 'chat-item';
    li.style.animationDelay = `${0.05 + index * 0.03}s`;
    li.onclick = () => openRoom(char.id);
    
    const avatarHtml = char.aiAvatar 
        ? `<img src="${char.aiAvatar}" alt="${char.name}">` 
        : char.name[0];
    
    li.innerHTML = `
        <div class="avatar">${avatarHtml}</div>
        <div class="info">
            <div class="name">${char.nickname || char.name}</div>
            <div class="preview">点击开始对话</div>
        </div>
    `;
    
    return li;
}

// ==================== 聊天逻辑 ====================
function openRoom(id) {
    curId = id;
    const c = chars.find(x => x.id === id);
    
    if (!c) return;
    
    document.getElementById('room-n').innerText = c.nickname || c.name;
    document.getElementById('win-room').classList.add('open');
    
    renderMsgs();
}

function exitRoom() {
    const roomWindow = document.getElementById('win-room');
    roomWindow.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
        roomWindow.classList.remove('open');
        curId = null;
        renderList();
    }, 500);
}

function renderMsgs() {
    const c = chars.find(x => x.id === curId);
    if (!c) return;
    
    const inj = document.getElementById('im-inject');
    const scroll = document.getElementById('im-scroll');
    
    inj.innerHTML = '';
    
    c.messages.forEach((m, idx) => {
        const row = createMessageBubble(m, idx, c);
        inj.appendChild(row);
    });
    
    // 平滑滚动到底部
    setTimeout(() => smoothScrollToBottom(scroll), 100);
}

function createMessageBubble(message, index, char) {
    const row = document.createElement('div');
    row.className = `im-row ${message.role === 'user' ? 'user' : 'ai'}`;
    row.style.animationDelay = `${index * 0.05}s`;
    
    const avatar = message.role === 'user' 
        ? (char.userAvatar ? `<img src="${char.userAvatar}">` : '我')
        : (char.aiAvatar ? `<img src="${char.aiAvatar}">` : char.name[0]);
    
    row.innerHTML = `
        <div class="im-avatar">${avatar}</div>
        <div class="im-bubble" onclick="openEditMsg(${index})">${escapeHtml(message.content)}</div>
    `;
    
    return row;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function handleSend() {
    const inp = document.getElementById('chat-inp');
    const value = inp.value.trim();
    
    if(!value || !curId) return;
    
    const c = chars.find(x => x.id === curId);
    if (!c) return;
    
    // 添加用户消息
    c.messages.push({ role: 'user', content: value });
    c.lastMsgTime = Date.now();
    
    inp.value = '';
    renderMsgs();
    
    // 显示输入中提示
    showTypingIndicator();
    
    try {
        const reply = await getAIReply(c);
        hideTypingIndicator();
        
        if(reply) {
            c.messages.push({ role: 'assistant', content: reply });
            saveData();
            renderMsgs();
            
            // 触觉反馈（如果支持）
            if ('vibrate' in navigator) {
                navigator.vibrate(50);
            }
        }
    } catch(error) {
        hideTypingIndicator();
        showError('消息发送失败，请重试');
    }
}

function showTypingIndicator() {
    const inj = document.getElementById('im-inject');
    const indicator = document.createElement('div');
    indicator.className = 'im-row ai typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
        <div class="im-avatar">...</div>
        <div class="im-bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;
    inj.appendChild(indicator);
    
    const scroll = document.getElementById('im-scroll');
    smoothScrollToBottom(scroll);
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function showError(message) {
    // 可以实现一个简单的 toast 提示
    console.error(message);
}

async function getAIReply(char, sysPrompt=null, rawMode=false) {
    if(!sets.apiUrl || !sets.apiKey) {
        throw new Error("API未配置");
    }
    
    const hist = rawMode 
        ? [{role:'user', content: sysPrompt}] 
        : [
            {role:'system', content: char.aiPersona || char.prompt}, 
            ...char.messages.slice(-10)
          ];
    
    try {
        const res = await fetch(sets.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${sets.apiKey}`
            },
            body: JSON.stringify({
                model: sets.modelName,
                messages: hist,
                temperature: parseFloat(sets.temp) || 0.7
            })
        });
        
        if (!res.ok) {
            throw new Error(`API错误: ${res.status}`);
        }
        
        const data = await res.json();
        return data.choices[0].message.content;
    } catch(error) {
        console.error('API请求失败:', error);
        throw error;
    }
}

// ==================== 角色详情 ====================
function openCharSettings() {
    const c = chars.find(x => x.id === curId);
    if (!c) return;
    
    document.getElementById('char-nickname').value = c.nickname || '';
    document.getElementById('char-realname').value = c.realName || '';
    document.getElementById('char-username').value = c.userName || '';
    document.getElementById('char-group').value = c.group || '';
    document.getElementById('char-active').checked = c.activeInteract || false;
    document.getElementById('char-interval').value = c.activeInterval || 60;
    document.getElementById('char-icon-url').value = c.iconUrl || '';
    
    updateAvatarPreview('ai', c.aiAvatar);
    updateAvatarPreview('user', c.userAvatar);
    
    openApp('win-char-settings');
}

function updateAvatarPreview(type, url) {
    const previewId = type === 'ai' ? 'ai-avatar-preview' : 'user-avatar-preview';
    const preview = document.getElementById(previewId);
    
    if (url) {
        preview.innerHTML = `<img src="${url}" alt="avatar">`;
    } else {
        preview.innerHTML = '';
    }
}

function saveCharSettings() {
    const c = chars.find(x => x.id === curId);
    if (!c) return;
    
    c.nickname = document.getElementById('char-nickname').value;
    c.realName = document.getElementById('char-realname').value;
    c.userName = document.getElementById('char-username').value;
    c.group = document.getElementById('char-group').value;
    c.activeInteract = document.getElementById('char-active').checked;
    c.activeInterval = parseInt(document.getElementById('char-interval').value) || 60;
    c.iconUrl = document.getElementById('char-icon-url').value;
    
    saveData();
    renderList();
    closeApp('win-char-settings');
    
    // 显示保存成功提示
    showSuccessToast('设置已保存');
}

function showSuccessToast(message) {
    // 简单的成功提示
    console.log(message);
}

// ==================== 模型管理 ====================
async function fetchModels() {
    const baseUrl = sets.apiUrl.replace('/chat/completions','').replace(/\/+$/,'');
    const url = `${baseUrl}/models`;
    
    try {
        const res = await fetch(url, {
            headers: {'Authorization': `Bearer ${sets.apiKey}`}
        });
        
        if (!res.ok) {
            throw new Error('获取模型列表失败');
        }
        
        const data = await res.json();
        displayModelList(data.data);
    } catch(error) {
        alert('获取模型列表失败，请检查API配置');
        console.error(error);
    }
}

function displayModelList(models) {
    const html = models
        .map(m => `<div class="model-item" onclick="selectModel('${m.id}')">${m.id}</div>`)
        .join('');
    
    document.getElementById('model-list-inject').innerHTML = html;
    document.getElementById('model-overlay').style.display = 'flex';
}

function selectModel(id) {
    document.getElementById('set-model').value = id;
    hideModelList();
}

function hideModelList() {
    document.getElementById('model-overlay').style.display = 'none';
}

// ==================== 数据管理 ====================
function saveData() {
    localStorage.setItem('characters', JSON.stringify(chars));
}

function saveGlobalSets() {
    sets.apiUrl = document.getElementById('set-url').value;
    sets.apiKey = document.getElementById('set-key').value;
    sets.modelName = document.getElementById('set-model').value;
    sets.temp = document.getElementById('set-temp').value;
    sets.bgUrl = document.getElementById('set-bg').value;
    
    localStorage.setItem('settings', JSON.stringify(sets));
    applySettings();
    closeApp('win-sets');
    
    showSuccessToast('设置已保存');
}

function exportData() {
    const dataStr = JSON.stringify({chars, sets}, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-os-backup-${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    showSuccessToast('数据已导出');
}

// ==================== 角色管理 ====================
function showCreateModal() {
    document.getElementById('mo-n').value = '';
    document.getElementById('mo-p').value = '';
    document.getElementById('mo-overlay').style.display = 'flex';
}

function hideModal() {
    document.getElementById('mo-overlay').style.display = 'none';
}

function commitModal() {
    const name = document.getElementById('mo-n').value.trim();
    const prompt = document.getElementById('mo-p').value.trim();
    
    if(!name) {
        alert('请输入角色名称');
        return;
    }
    
    const newChar = {
        id: Date.now(),
        name: name,
        prompt: prompt,
        messages: [],
        nickname: '',
        realName: '',
        userName: '',
        group: '',
        iconUrl: '',
        aiAvatar: '',
        userAvatar: '',
        activeInteract: false,
        activeInterval: 60
    };
    
    chars.unshift(newChar);
    saveData();
    renderList();
    hideModal();
    
    showSuccessToast('角色创建成功');
}

function deleteChar() {
    if (!curId) return;
    
    if (!confirm('确定要删除这个角色吗？所有聊天记录将被清空。')) {
        return;
    }
    
    const index = chars.findIndex(x => x.id === curId);
    if (index !== -1) {
        chars.splice(index, 1);
        saveData();
        renderList();
        closeApp('win-char-settings');
        exitRoom();
        
        showSuccessToast('角色已删除');
    }
}

// ==================== 工具面板 ====================
function toggleTools() {
    const panel = document.getElementById('t-panel');
    panel.classList.toggle('show');
}

function clearHistory() {
    if (!curId) return;
    
    if (!confirm('确定要清空聊天记录吗？')) {
        return;
    }
    
    const c = chars.find(x => x.id === curId);
    if (c) {
        c.messages = [];
        saveData();
        renderMsgs();
        showSuccessToast('聊天记录已清空');
    }
}

// ==================== 主动消息检查 ====================
function checkActiveMessages() {
    const now = Date.now();
    
    chars.forEach(char => {
        if (!char.activeInteract) return;
        
        const interval = (char.activeInterval || 60) * 60 * 1000;
        const lastMsg = char.lastMsgTime || 0;
        
        if (now - lastMsg > interval) {
            sendActiveMessage(char);
        }
    });
}

async function sendActiveMessage(char) {
    try {
        const prompt = `作为${char.name}，主动向用户发送一条消息。`;
        const message = await getAIReply(char, prompt, true);
        
        if (message) {
            char.messages.push({ role: 'assistant', content: message });
            char.lastMsgTime = Date.now();
            saveData();
            
            // 显示通知
            showNotification(char.nickname || char.name, message);
        }
    } catch(error) {
        console.error('主动消息发送失败:', error);
    }
}

function showNotification(name, message) {
    const banner = document.getElementById('noti-banner');
    document.getElementById('noti-n').innerText = name;
    document.getElementById('noti-t').innerText = message.substring(0, 50) + '...';
    
    banner.style.display = 'flex';
    
    setTimeout(() => {
        banner.style.display = 'none';
    }, 5000);
}

// ==================== 辅助函数 ====================
function closeCharSettings() {
    closeApp('win-char-settings');
}

// 预留的编辑器函数
function openPersonaEditor(type) {
    console.log('打开Persona编辑器:', type);
}

function closePersonaEditor() {
    console.log('关闭Persona编辑器');
}

function savePersona() {
    console.log('保存Persona');
}

function aiGeneratePersona() {
    console.log('AI生成Persona');
}

function openMemoryEditor() {
    console.log('打开Memory编辑器');
}

function openEditMsg(index) {
    console.log('编辑消息:', index);
}

function uploadAvatar(type) {
    const input = document.getElementById('up-avatar');
    input.dataset.type = type;
    input.click();
}

function handleAvatarUpload(input) {
    const file = input.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const url = e.target.result;
        const type = input.dataset.type;
        
        const c = chars.find(x => x.id === curId);
        if (!c) return;
        
        if (type === 'ai') {
            c.aiAvatar = url;
        } else {
            c.userAvatar = url;
        }
        
        updateAvatarPreview(type, url);
        saveData();
    };
    
    reader.readAsDataURL(file);
}

function up(type) {
    console.log('上传:', type);
}

function dImg(input) {
    console.log('处理图片');
}

function dFile(input) {
    console.log('处理文件');
}
