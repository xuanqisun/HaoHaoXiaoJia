// --- 配置项 ---
const startDate = new Date('2023-01-20'); // TODO: 替换成你们在一起的日期 (格式: YYYY-MM-DD)

// --- 函数 1: 计算并显示天数 ---
function updateDaysCounter() {
    const today = new Date();
    // 计算毫秒差
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    // 换算成天数 (四舍五入)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    document.getElementById('days').textContent = String(diffDays).padStart(3, '0');
}

// --- 函数 2: 加载并渲染所有留言 ---
function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('secretMessages') || '[]');
    const container = document.getElementById('messages-container');
    container.innerHTML = ''; // 清空现有内容

    // 逆序显示，最新留言在最上面
    messages.slice().reverse().forEach(msg => {
        const entry = document.createElement('div');
        entry.className = 'message-entry';
        
        const content = document.createElement('p');
        content.textContent = msg.text;
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'message-date';
        dateSpan.textContent = `在 ${msg.date} 留下的悄悄话`;
        
        entry.appendChild(content);
        entry.appendChild(dateSpan);
        container.appendChild(entry);
    });
}

// --- 函数 3: 发布新留言 ---
function postMessage() {
    const inputElement = document.getElementById('message-input');
    const messageText = inputElement.value.trim();

    if (messageText === '') {
        alert('甜蜜话语不能为空哦~');
        return;
    }

    const today = new Date();
    const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    
    const newMessage = {
        text: messageText,
        date: formattedDate
    };

    // 从LocalStorage获取旧消息，添加新消息，并保存
    const messages = JSON.parse(localStorage.getItem('secretMessages') || '[]');
    messages.push(newMessage);
    localStorage.setItem('secretMessages', JSON.stringify(messages));

    // 清空输入框并刷新留言板
    inputElement.value = '';
    loadMessages();
}

// --- 页面初始化 ---
document.addEventListener('DOMContentLoaded', () => {
    updateDaysCounter();
    loadMessages();
});