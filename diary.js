document.addEventListener('DOMContentLoaded', () => {
    
    // --- DOM 元素 ---
    const stackContainer = document.getElementById('card-stack-container');
    const cardView = document.getElementById('card-view');
    const summaryPanel = document.getElementById('summary-panel');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const toggleViewBtn = document.getElementById('toggle-view-btn');

    // 模态窗口元素
    const modal = document.getElementById('diary-modal');
    const closeBtn = document.querySelector('.close-btn');
    const newDiaryBtn = document.getElementById('new-diary-btn'); 
    const saveDiaryBtn = document.getElementById('save-diary');

    let currentPageIndex = 0; // 0 = 封面卡片 (默认开始页)
    
    let diaryEntries = loadDiaryEntries(); // 加载历史日记

    // --- 核心翻页逻辑 (保持不变) ---

    function updatePageDisplay() {
        const cards = document.querySelectorAll('.diary-card:not(.card-cover):not(.card-end)'); 
        const maxPageIndex = cards.length + 1; 
        
        const coverCard = document.querySelector('.card-cover');
        
        // 1. 处理封面卡片 (索引 0)
        if (coverCard) {
            if (currentPageIndex > 0) {
                coverCard.classList.add('flipped');
            } else {
                coverCard.classList.remove('flipped');
            }
        }
        
        // 2. 处理日记卡片 (索引 1 到 N)
        cards.forEach((card, index) => {
            const logicalPageIndex = index + 1; 
            
            if (currentPageIndex > logicalPageIndex) { 
                card.classList.add('flipped');
            } else {
                card.classList.remove('flipped');
            }
            
            // 核心：设置日记卡片的 Z-INDEX
            card.style.zIndex = 100 - index; 
        });


        // 3. 控制导航按钮的启用/禁用状态
        prevBtn.disabled = currentPageIndex <= 0; 
        nextBtn.disabled = currentPageIndex >= maxPageIndex; 
    }

    function nextPage() {
        const cards = document.querySelectorAll('.diary-card:not(.card-cover):not(.card-end)'); 
        const maxPageIndex = cards.length + 1;
        if (currentPageIndex < maxPageIndex) {
            currentPageIndex++;
            updatePageDisplay();
        }
    }

    function prevPage() {
        if (currentPageIndex > 0) {
            currentPageIndex--;
            updatePageDisplay();
        }
    }
    
    // --- 日记存储和渲染逻辑 ---

    function loadDiaryEntries() {
        const storedEntries = localStorage.getItem('xiaojiaDiaries');
        let entries = storedEntries ? JSON.parse(storedEntries) : [];
        return entries.reverse(); 
    }

    function saveDiaryEntries() {
        const entriesToSave = [...diaryEntries].reverse(); 
        localStorage.setItem('xiaojiaDiaries', JSON.stringify(entriesToSave));
    }
    
    // 将日记数据渲染成 HTML 卡片
    function renderDiaryCard(entry, index) {
        const newCard = document.createElement('div');
        newCard.className = `diary-card`; 
        newCard.setAttribute('data-page-index', index); 
        
        newCard.style.zIndex = 100 - index; 
        
        const date = new Date(entry.timestamp);
        const dateString = date.toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric'
        }); 

        newCard.innerHTML = `
            <div class="card-content">
                <div class="diary-header">
                    <span class="date">🌸 ${dateString}</span>
                    <span class="weather">☀️ ${entry.weather || '未知天气'}</span>
                </div>
                <p class="diary-body">${entry.content}</p>
                <p class="signature">—— ${entry.signature || '无落款'} [落款]</p>
            </div>
        `;
        
        const endCard = document.querySelector('.card-end');
        stackContainer.insertBefore(newCard, endCard);
    }
    
    // --- 日记索引渲染逻辑 (已优化) ---

    function renderDiarySummary() {
        summaryPanel.innerHTML = '<h2>📅 回忆索引</h2>';
        
        // 1. 按年/月分组
        const grouped = diaryEntries.reduce((acc, entry) => {
            const date = new Date(entry.timestamp);
            const yearMonth = `${date.getFullYear()}年${date.getMonth() + 1}月`;
            if (!acc[yearMonth]) acc[yearMonth] = [];
            acc[yearMonth].push(entry);
            return acc;
        }, {});

        // 2. 渲染分组后的数据
        for (const yearMonth in grouped) {
            let monthHtml = `<div class="month-group"><h3>${yearMonth}</h3>`;
            
            grouped[yearMonth].forEach(entry => {
                const date = new Date(entry.timestamp);
                const day = date.getDate();
                
                // 🚀 关键修改：根据固定的签名值判断颜色 🚀
                const colorClass = entry.signature === '粉色落款' ? 'tag-pink' : 'tag-blue';
                
                // 索引不包含天气，并缩短内容
                const contentSnippet = entry.content.substring(0, 10) + (entry.content.length > 10 ? '...' : '');
                // 显示落款信息 (粉色/蓝色落款)
                const signatureLabel = entry.signature ? ` [${entry.signature}]` : ' [无落款]'; 
                const label = contentSnippet + signatureLabel;
                
                monthHtml += `
                    <div class="day-entry">
                        <span class="day-label">${day}日:</span>
                        <span class="diary-tag ${colorClass}" title="${entry.content}">${label}</span>
                    </div>
                `;
            });
            
            monthHtml += '</div>';
            summaryPanel.innerHTML += monthHtml;
        }
    }
    
    // --- 视图切换逻辑 (保持不变) ---
    
    function toggleView() {
        const isSummaryVisible = summaryPanel.style.display !== 'none';
        
        if (isSummaryVisible) {
            // 切换回卡片模式
            summaryPanel.style.display = 'none';
            cardView.style.display = 'flex'; // 显示卡片视图
            toggleViewBtn.textContent = '📖 索引模式';
            toggleViewBtn.style.backgroundColor = '#4682b4';
        } else {
            // 切换到索引模式
            cardView.style.display = 'none'; // 隐藏卡片视图
            summaryPanel.style.display = 'block'; // 显示索引面板
            toggleViewBtn.textContent = '📚 卡片模式';
            toggleViewBtn.style.backgroundColor = '#ff69b4';
            renderDiarySummary(); // 重新渲染索引
        }
    }


    // --- 事件处理 ---
    
    function handleSaveDiary() {
        const date = document.getElementById('diary-date').value;
        const weather = document.getElementById('diary-weather').value;
        const content = document.getElementById('diary-content').value.trim();
        
        // 🚀 关键修改：获取选中的落款值 🚀
        const signatureRadio = document.querySelector('input[name="signature-color"]:checked');
        const signature = signatureRadio ? signatureRadio.value : '粉色落款'; // 默认粉色落款
        
        if (!content) {
            alert("日记内容不能为空哦！");
            return;
        }

        const newEntry = {
            timestamp: date ? new Date(date).getTime() : new Date().getTime(),
            weather: weather,
            content: content,
            signature: signature // 使用选中的落款值
        };

        diaryEntries.unshift(newEntry); 
        saveDiaryEntries(); 

        modal.style.display = "none";
        
        // 刷新页面以正确渲染新卡片，并停留在首页
        alert('日记保存成功！即将刷新页面以更新回忆录...');
        window.location.reload(); 
    }


    // --- 初始化和绑定事件 ---
    
    // 渲染所有历史日记
    diaryEntries.forEach((entry, index) => {
        renderDiaryCard(entry, index); 
    });


    // 绑定翻页事件
    nextBtn.addEventListener('click', nextPage);
    prevBtn.addEventListener('click', prevPage);
    
    // 绑定模态窗口事件
    newDiaryBtn.addEventListener('click', () => {
        modal.style.display = "flex"; // 修复：确保模态窗口显示
        // 清空表单
        document.getElementById('diary-date').value = '';
        document.getElementById('diary-weather').value = '';
        document.getElementById('diary-content').value = '';
        
        // 默认选中粉色落款
        document.querySelector('input[name="signature-color"][value="粉色落款"]').checked = true;
    });
    
    closeBtn.addEventListener('click', () => {
        modal.style.display = "none"; 
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // 绑定保存事件
    saveDiaryBtn.addEventListener('click', handleSaveDiary);
    
    // 绑定切换视图事件
    toggleViewBtn.addEventListener('click', toggleView);

    // 初始化时，确保按钮状态正确
    updatePageDisplay();
    
    // 默认展示卡片视图
    summaryPanel.style.display = 'none';
    cardView.style.display = 'flex';
});