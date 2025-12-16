/**
 * 📝 好好小家 - 小任务核心逻辑
 * 重点：增加了 toggleQuest 的双向切换（完成 <-> 撤回）
 */

document.addEventListener('DOMContentLoaded', () => {
    const todoListContainer = document.getElementById('todo-list');
    const doneListContainer = document.getElementById('done-list');
    const addQuestBtn = document.getElementById('add-quest-btn');
    const modal = document.getElementById('quest-modal');
    const closeBtn = document.querySelector('.close-btn');
    const saveQuestBtn = document.getElementById('save-quest-btn');
    const modalTitle = document.getElementById('modal-title');

    let quests = loadQuests();
    let editingId = null; 

    function loadQuests() {
        return JSON.parse(localStorage.getItem('xiaojiaQuests') || '[]');
    }

    function saveAndRefresh() {
        localStorage.setItem('xiaojiaQuests', JSON.stringify(quests));
        renderQuests();
    }

    function renderQuests() {
        todoListContainer.innerHTML = '';
        doneListContainer.innerHTML = '';

        // 按时间倒序排列
        const sortedQuests = [...quests].sort((a, b) => b.id - a.id);

        sortedQuests.forEach(quest => {
            const questEl = document.createElement('div');
            questEl.className = `quest-item ${quest.completed ? 'completed' : ''}`;
            
            const proposerClass = quest.proposer === '我' ? 'me' : 'other';
            
            // --- 核心修改：动态生成按钮 ---
            let actionButtons = '';
            
            if (quest.completed) {
                // 如果是已完成状态，显示“撤回”图标 (↩️)
                actionButtons = `
                    <div class="quest-actions">
                        <button class="action-btn undo-btn" onclick="toggleQuest(${quest.id})" title="撤回到待办清单">↩️</button>
                        <button class="action-btn delete-btn" onclick="deleteQuest(${quest.id})" title="彻底删除">🗑️</button>
                    </div>`;
            } else {
                // 如果是未完成状态，显示“完成”、“编辑”和“删除”
                actionButtons = `
                    <div class="quest-actions">
                        <button class="action-btn complete-btn" onclick="toggleQuest(${quest.id})" title="标记为已完成">✅</button>
                        <button class="action-btn edit-btn" onclick="openEditQuest(${quest.id})" title="修改内容">✏️</button>
                        <button class="action-btn delete-btn" onclick="deleteQuest(${quest.id})" title="删除任务">🗑️</button>
                    </div>`;
            }

            questEl.innerHTML = `
                <div class="quest-header">
                    <span class="quest-title">${quest.title}</span>
                    <span class="proposer-tag ${proposerClass}">${quest.proposer}提出的</span>
                </div>
                <p class="quest-desc">${quest.description || '暂无详细描述...'}</p>
                <div class="quest-footer">
                    <span class="quest-date">${new Date(quest.id).toLocaleDateString()}</span>
                    ${actionButtons}
                </div>
            `;

            // 分发到不同的容器
            if (quest.completed) {
                doneListContainer.appendChild(questEl);
            } else {
                todoListContainer.appendChild(questEl);
            }
        });

        // 空状态处理
        if (todoListContainer.children.length === 0) {
            todoListContainer.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">暂时没有小任务～</p>';
        }
    }

    // --- 逻辑函数 ---

    window.toggleQuest = function(id) {
        const quest = quests.find(q => q.id === id);
        if (quest) {
            // 切换状态：true 变 false, false 变 true
            quest.completed = !quest.completed;
            saveAndRefresh();
        }
    };

    window.deleteQuest = function(id) {
        if (confirm("确定要永久删除这个小任务吗？")) {
            quests = quests.filter(q => q.id !== id);
            saveAndRefresh();
        }
    };

    window.openEditQuest = function(id) {
        const quest = quests.find(q => q.id === id);
        if (!quest) return;
        editingId = id;
        modalTitle.textContent = "修改小任务 ✏️";
        document.getElementById('quest-title').value = quest.title;
        document.getElementById('quest-description').value = quest.description;
        document.querySelector(`input[name="proposer"][value="${quest.proposer}"]`).checked = true;
        modal.style.display = "flex";
    };

    saveQuestBtn.addEventListener('click', () => {
        const title = document.getElementById('quest-title').value.trim();
        const description = document.getElementById('quest-description').value.trim();
        const proposer = document.querySelector('input[name="proposer"]:checked').value;
        if (!title) return alert("标题不能为空！");

        if (editingId) {
            const idx = quests.findIndex(q => q.id === editingId);
            if (idx !== -1) quests[idx] = { ...quests[idx], title, description, proposer };
        } else {
            quests.push({ id: Date.now(), title, description, proposer, completed: false });
        }
        saveAndRefresh();
        modal.style.display = "none";
        editingId = null;
    });

    addQuestBtn.addEventListener('click', () => {
        editingId = null;
        modalTitle.textContent = "提出一个新任务 💖";
        document.getElementById('quest-title').value = '';
        document.getElementById('quest-description').value = '';
        modal.style.display = "flex";
    });

    closeBtn.addEventListener('click', () => modal.style.display = "none");
    renderQuests();
});