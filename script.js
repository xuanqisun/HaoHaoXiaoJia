// --- 基础配置 ---
const startDate = new Date('2025-05-06'); // 你们在一起的日期
const SECRET_PASSWORD = 'loveu'; // 你的暗号

// --- 1. 页面初始化与安全验证 ---
document.addEventListener('DOMContentLoaded', () => {
    const authScreen = document.getElementById('auth-screen');
    const appContainer = document.getElementById('app-container');

    // 检查 Session：如果之前登录过，直接显示内容
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        authScreen.style.display = 'none';
        appContainer.style.display = 'flex';
        initAllFunctions();
    }

    // 绑定回车键登录
    const passwordInput = document.getElementById('secret-password-input');
    passwordInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkPassword();
    });
});

function checkPassword() {
    const input = document.getElementById('secret-password-input');
    if (input.value === SECRET_PASSWORD) {
        sessionStorage.setItem('isLoggedIn', 'true');
        location.reload(); // 刷新页面进入
    } else {
        alert('暗号错误！');
        input.value = '';
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    location.reload();
}

// 统一初始化所有功能
function initAllFunctions() {
    updateDaysCounter();
    renderAnniversaries();
    loadMessages();
}

// --- 2. 在一起天数计算 ---
function updateDaysCounter() {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    document.getElementById('days').textContent = String(diffDays).padStart(3, '0');
}

// --- 3. 纪念日管理逻辑 (新增) ---
function addAnniversary() {
    const nameInput = document.getElementById('anniv-name');
    const dateInput = document.getElementById('anniv-date');
    
    if (!nameInput.value || !dateInput.value) {
        alert("名称和日期都要填哦！");
        return;
    }

    const list = JSON.parse(localStorage.getItem('ourAnniversaries') || '[]');
    const newAnniv = {
        id: Date.now(),
        name: nameInput.value,
        date: dateInput.value,
        isCompleted: false
    };

    list.push(newAnniv);
    localStorage.setItem('ourAnniversaries', JSON.stringify(list));
    
    nameInput.value = '';
    dateInput.value = '';
    renderAnniversaries(); // 立即刷新列表显示
}

function renderAnniversaries() {
    const container = document.getElementById('anniv-list');
    if (!container) return;
    
    const list = JSON.parse(localStorage.getItem('ourAnniversaries') || '[]');
    const today = new Date().setHours(0, 0, 0, 0);

    container.innerHTML = '';
    // 按日期排序
    list.sort((a, b) => new Date(a.date) - new Date(b.date));

    list.forEach(item => {
        const targetDate = new Date(item.date).getTime();
        const diffDays = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        
        const div = document.createElement('div');
        div.className = `anniv-item ${item.isCompleted ? 'strikethrough' : ''}`;
        
        let countdownText = item.isCompleted ? '✨ 已达成' : 
                           (diffDays > 0 ? `还有 ${diffDays} 天` : 
                           (diffDays === 0 ? '🎉 就是今天！' : `已过去 ${Math.abs(diffDays)} 天`));

        div.innerHTML = `
            <div class="anniv-info">
                <span class="anniv-title">${item.name}</span>
                <span class="anniv-date-label">${item.date}</span>
            </div>
            <div class="anniv-status">
                <span class="days-tag">${countdownText}</span>
                <button onclick="toggleAnniv(${item.id})" class="pixel-btn sm-btn">${item.isCompleted ? '撤销' : '划掉'}</button>
                <button onclick="deleteAnniv(${item.id})" class="delete-link">删除</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function toggleAnniv(id) {
    let list = JSON.parse(localStorage.getItem('ourAnniversaries') || '[]');
    list = list.map(item => {
        if (item.id === id) item.isCompleted = !item.isCompleted;
        return item;
    });
    localStorage.setItem('ourAnniversaries', JSON.stringify(list));
    renderAnniversaries();
}

function deleteAnniv(id) {
    if (confirm('确定要删除吗？')) {
        let list = JSON.parse(localStorage.getItem('ourAnniversaries') || '[]');
        list = list.filter(item => item.id !== id);
        localStorage.setItem('ourAnniversaries', JSON.stringify(list));
        renderAnniversaries();
    }
}

// --- 4. 悄悄话信箱逻辑 ---

// 1. 发送留言
function postMessage() {
    const inputElement = document.getElementById('message-input');
    const author = document.querySelector('input[name="msg-author"]:checked').value;
    const messageText = inputElement.value.trim();

    if (!messageText) {
        alert('还没写话呢~');
        return;
    }

    const messages = JSON.parse(localStorage.getItem('secretMessages') || '[]');
    const newMsg = {
        id: Date.now(),
        text: messageText,
        author: author, // 'me' 或 'other'
        date: new Date().toLocaleString('zh-CN', { hour12: false }),
        isWithdrawn: false // 预留撤销状态
    };

    messages.push(newMsg);
    localStorage.setItem('secretMessages', JSON.stringify(messages));
    
    inputElement.value = ''; // 清空输入
    loadMessages(); // 刷新列表
}

// 2. 加载并渲染留言
function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('secretMessages') || '[]');
    const container = document.getElementById('messages-container');
    if (!container) return;
    container.innerHTML = '';

    // 逆序排列：最新的在最上面
    messages.slice().reverse().forEach(msg => {
        const div = document.createElement('div');
        // 根据作者赋予不同的样式类
        div.className = `message-entry ${msg.author === 'me' ? 'msg-me' : 'msg-other'} ${msg.isWithdrawn ? 'withdrawn' : ''}`;
        
        div.innerHTML = `
            <div class="msg-bubble">
                <p class="msg-text">${msg.isWithdrawn ? '📜 此消息已撤销...' : msg.text}</p>
                <div class="msg-footer">
                    <span class="msg-author-tag">${msg.author === 'me' ? '💖 我' : '💙 对方'}</span>
                    <span class="msg-time">${msg.date}</span>
                </div>
                <div class="msg-actions">
                    ${!msg.isWithdrawn ? `<button onclick="toggleWithdraw(${msg.id})" class="action-link">撤销</button>` : `<button onclick="toggleWithdraw(${msg.id})" class="action-link">恢复</button>`}
                    <button onclick="deleteMessage(${msg.id})" class="action-link delete-text">彻底删除</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

// 3. 撤销/恢复功能
function toggleWithdraw(id) {
    let messages = JSON.parse(localStorage.getItem('secretMessages') || '[]');
    messages = messages.map(msg => {
        if (msg.id === id) msg.isWithdrawn = !msg.isWithdrawn;
        return msg;
    });
    localStorage.setItem('secretMessages', JSON.stringify(messages));
    loadMessages();
}

// 4. 彻底删除
function deleteMessage(id) {
    if (confirm('确定要永久删除这条记忆吗？')) {
        let messages = JSON.parse(localStorage.getItem('secretMessages') || '[]');
        messages = messages.filter(msg => msg.id !== id);
        localStorage.setItem('secretMessages', JSON.stringify(messages));
        loadMessages();
    }
}