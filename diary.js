/**
 * 📖 好好小家 - 回忆录核心逻辑 (完整修正版)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 获取 DOM 元素 ---
    const cardStack = document.getElementById('card-stack-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const toggleViewBtn = document.getElementById('toggle-view-btn');
    const cardView = document.getElementById('card-view');
    const summaryPanel = document.getElementById('summary-panel');
    const modal = document.getElementById('diary-modal');
    const newDiaryBtn = document.getElementById('new-diary-btn');
    const closeBtn = document.querySelector('.close-btn');
    const saveBtn = document.getElementById('save-diary');
    
    // 图片相关
    const imgInput = document.getElementById('diary-image-input');
    const imgPreview = document.getElementById('image-preview');
    const imgPreviewContainer = document.getElementById('image-preview-container');
    const removeImgBtn = document.getElementById('remove-image-btn');

    // 数据加载
    let diaries = JSON.parse(localStorage.getItem('xiaojiaDiaries') || '[]');
    let currentPage = 0; // 0 是封面

    // --- 2. 初始化渲染 ---
    function init() {
        renderCards();
        bindEvents();
    }

    // 渲染日记卡片
    function renderCards() {
        // 查找封面和封底（如果 HTML 中已经存在，直接克隆或引用）
        // 这里为了逻辑简单，每次直接生成封面和封底
        cardStack.innerHTML = '';

        // 1. 生成封面
        const cover = document.createElement('div');
        cover.className = 'diary-card card-cover';
        cover.innerHTML = `
            <div class="card-content">
                <h2>💌 我们的专属日记本</h2>
                <p>心有灵犀一点通</p>
                <br>
                <p>请点击下方 “下一页” </p>
                <p>翻开封面，开始查阅日记吧！</p>
            </div>`;
        cardStack.appendChild(cover);

        // 2. 循环生成日记页 (按日期排序)
        diaries.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach((diary, index) => {
            const card = document.createElement('div');
            card.className = 'diary-card';
            
            let imgHtml = diary.image ? `<div class="diary-img-wrapper"><img src="${diary.image}" class="diary-photo"></div>` : '';

            card.innerHTML = `
                <div class="card-content">
                    <div class="card-header">
                        <span class="date">📅 ${diary.date}</span>
                        <span class="weather">☁️ ${diary.weather || '好天气'}</span>
                    </div>
                    <div class="card-body">
                        ${imgHtml}
                        <p class="text">${diary.content}</p>
                    </div>
                    <div class="card-footer">
                        <button class="delete-diary-btn" onclick="deleteDiary(${index})" title="撕掉这一页">🗑️</button>
                        <div class="signature ${diary.color === '蓝色落款' ? 'blue-text' : 'pink-text'}">
                            ${diary.color === '蓝色落款' ? '💙 对方' : '💖 我'}
                        </div>
                    </div>
                </div>
            `;
            cardStack.appendChild(card);
        });

        // 3. 生成封底
        const end = document.createElement('div');
        end.className = 'diary-card card-end';
        end.innerHTML = `
            <div class="card-content">
                <h3>翻完了！</h3>
                <p>你已经翻阅了所有的甜蜜回忆。</p>
                <p>点击右下角的 ✏️ 按钮，创建新的甜蜜吧！</p>
            </div>`;
        cardStack.appendChild(end);

        showPage(currentPage);
    }

    // --- 3. 翻页逻辑 ---
    function showPage(index) {
        const cards = cardStack.querySelectorAll('.diary-card');
        // 安全检查：防止索引越界
        if (index < 0) index = 0;
        if (index >= cards.length) index = cards.length - 1;

        cards.forEach((card, i) => {
            card.style.display = (i === index) ? 'flex' : 'none';
        });
        
        currentPage = index;
        updateButtons(cards.length);
    }

    function updateButtons(total) {
        if (prevBtn) prevBtn.disabled = (currentPage === 0);
        if (nextBtn) nextBtn.disabled = (currentPage === total - 1);
    }

    // --- 4. 索引模式渲染 ---
    function renderSummary() {
        summaryPanel.innerHTML = '<h2>索引列表 📂</h2>';
        const list = document.createElement('div');
        list.className = 'summary-list';

        if (diaries.length === 0) {
            summaryPanel.innerHTML += '<p style="text-align:center; padding:20px; color:#999;">还没有日记哦...</p>';
            return;
        }

        diaries.forEach((diary, index) => {
            const item = document.createElement('div');
            item.className = 'summary-item pixel-box';
            item.innerHTML = `
                <div>
                    <strong>${diary.date}</strong>
                    <p style="margin:5px 0; font-size:0.9rem;">${diary.content.substring(0, 15)}...</p>
                </div>
                <button class="pixel-btn sm-btn" onclick="jumpToPage(${index + 1})">查看</button>
            `;
            list.appendChild(item);
        });
        summaryPanel.appendChild(list);
    }

    // --- 5. 全局挂载函数 ---

    // 跳转函数
    window.jumpToPage = (index) => {
        toggleView();
        showPage(index);
    };

    // 删除函数
    window.deleteDiary = function(index) {
        if (confirm("确定要“撕掉”这页日记吗？删除后就找不回来咯！")) {
            diaries.splice(index, 1);
            localStorage.setItem('xiaojiaDiaries', JSON.stringify(diaries));
            
            // 如果删掉日记后当前页码超出范围，回退一页
            const totalCards = diaries.length + 2; // +封面封底
            if (currentPage >= totalCards - 1) {
                currentPage = totalCards - 2;
            }
            
            renderCards();
            if (summaryPanel.style.display === 'block') renderSummary();
        }
    };

    function toggleView() {
        if (cardView.style.display !== 'none') {
            cardView.style.display = 'none';
            summaryPanel.style.display = 'block';
            toggleViewBtn.textContent = '📖 卡片模式';
            renderSummary();
        } else {
            cardView.style.display = 'block';
            summaryPanel.style.display = 'none';
            toggleViewBtn.textContent = '📖 索引模式';
        }
    }

    // --- 6. 事件绑定 ---
    function bindEvents() {
        if (nextBtn) nextBtn.onclick = () => showPage(currentPage + 1);
        if (prevBtn) prevBtn.onclick = () => showPage(currentPage - 1);
        if (toggleViewBtn) toggleViewBtn.onclick = toggleView;

        // 弹窗显隐
        if (newDiaryBtn) newDiaryBtn.onclick = () => {
            modal.style.display = 'flex';
            // 自动填充今天日期
            document.getElementById('diary-date').valueAsDate = new Date();
        };
        
        if (closeBtn) closeBtn.onclick = () => {
            modal.style.display = 'none';
            resetForm();
        };

        // 点击背景关闭弹窗
        window.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                resetForm();
            }
        };

        // 保存日记
        if (saveBtn) {
            saveBtn.onclick = () => {
                const date = document.getElementById('diary-date').value;
                const content = document.getElementById('diary-content').value;
                const weather = document.getElementById('diary-weather').value;
                const color = document.querySelector('input[name="signature-color"]:checked').value;
                const imageSrc = imgPreview.src;

                if (!date || !content) return alert('日期和内容都要写哦！');

                const newEntry = {
                    date,
                    content,
                    weather,
                    color,
                    image: imageSrc.startsWith('data') ? imageSrc : null
                };

                diaries.push(newEntry);
                localStorage.setItem('xiaojiaDiaries', JSON.stringify(diaries));
                
                modal.style.display = 'none';
                resetForm();
                renderCards();
                
                // 自动跳到新日记那一页（封底的前一页）
                showPage(diaries.length);
            };
        }

        // 图片选择预览
        if (imgInput) {
            imgInput.onchange = function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        imgPreview.src = event.target.result;
                        imgPreviewContainer.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            };
        }

        // 移除图片预览
        if (removeImgBtn) {
            removeImgBtn.onclick = () => {
                imgInput.value = "";
                imgPreview.src = "";
                imgPreviewContainer.style.display = 'none';
            };
        }
    }

    function resetForm() {
        document.getElementById('diary-content').value = "";
        document.getElementById('diary-weather').value = "";
        imgInput.value = "";
        imgPreview.src = "";
        imgPreviewContainer.style.display = 'none';
    }

    // 启动！
    init();
});