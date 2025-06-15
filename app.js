// app.js - 页面交互逻辑 (已添加移动端抽屉菜单)

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 状态变量 ---
    let currentCardId = 'K1-1';
    const cardIds = Object.keys(examData);

    // --- DOM元素获取 ---
    const navList = document.getElementById('card-nav-list');
    const mainContent = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileHeaderTitle = document.getElementById('mobile-header-title');
    // ... 其他DOM元素
    const cardSubjectEl = document.getElementById('card-subject');
    const cardTitleEl = document.getElementById('card-title');
    const cardTimeEl = document.getElementById('card-time');
    const cardScoreEl = document.getElementById('card-score');
    const cardContentEl = document.getElementById('card-content');
    const cardVetoEl = document.getElementById('card-veto');
    const cardImageContainer = document.getElementById('card-image-container');
    const practiceToggle = document.getElementById('practice-mode-toggle');
    const practiceContainer = document.getElementById('practice-container');
    const cardContentSections = [
        document.getElementById('card-content').parentElement,
        document.getElementById('card-veto').parentElement,
        document.getElementById('card-image-container')
    ];

    // --- 滑动功能所需变量 ---
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;

    // --- 核心功能函数 ---

    function updateUIMode(isPracticeMode) {
        cardContentSections.forEach(section => {
            section.style.display = isPracticeMode ? 'none' : 'block';
        });
        practiceContainer.classList.toggle('hidden', !isPracticeMode);
    }

    function displayCard(cardId) {
        const card = examData[cardId];
        if (!card) return;

        currentCardId = cardId;
        mobileHeaderTitle.textContent = cardId; // 更新移动端头部的标题

        // 更新数据...
        cardSubjectEl.textContent = card.subject;
        cardTitleEl.textContent = card.title;
        cardTimeEl.textContent = card.examTime;
        cardScoreEl.textContent = card.score;
        cardContentEl.textContent = card.content.join('\n');
        cardVetoEl.textContent = card.vetoItems.join('\n');
        
        cardImageContainer.innerHTML = '';
        if (card.image) {
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = `${card.title} - 电路图`;
            cardImageContainer.appendChild(img);
        }
        
        updateActiveNav(cardId);
        generatePractice(card);
        updateUIMode(practiceToggle.checked);

        // 在移动端，切换卡片后自动关闭菜单
        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    }

    function populateNav() { cardIds.forEach(id => { const li = document.createElement('li'); li.innerHTML = `<a href="#" data-id="${id}">${id}</a>`; navList.appendChild(li); }); }
    function updateActiveNav(activeId) { navList.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.dataset.id === activeId)); }
    function generatePractice(card) { /* 此函数不变，为节省空间省略 */ practiceContainer.innerHTML = ''; if (!card.practice || card.practice.length === 0) { practiceContainer.innerHTML = '<p style="color: #777; font-style: italic;">此题卡暂无随堂练习。</p>'; return; } card.practice.forEach((item, index) => { const div = document.createElement('div'); div.className = 'practice-item'; div.innerHTML = `<p class="practice-question">练习 ${index + 1}: ${item.question}</p><button class="toggle-answer-btn" data-target="answer-${card.id}-${index}">显示/隐藏答案</button><div id="answer-${card.id}-${index}" class="practice-answer-container"><div class="practice-answer-official"><h5>【官方指南】</h5><p>${item.officialAnswer.replace(/\n/g, '<br>')}</p></div><div class="practice-answer-simple"><h5>【记忆要点】</h5><p>${item.simpleAnswer.replace(/\n/g, '<br>')}</p></div></div>`; practiceContainer.appendChild(div); }); }

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        if (Math.abs(deltaX) < swipeThreshold) return;
        const currentIndex = cardIds.indexOf(currentCardId);
        if (deltaX < 0 && currentIndex < cardIds.length - 1) {
            displayCard(cardIds[currentIndex + 1]);
        } else if (deltaX > 0 && currentIndex > 0) {
            displayCard(cardIds[currentIndex - 1]);
        }
    }

    // --- 事件监听器 ---

    // 【新增】菜单按钮点击事件
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // 【新增】点击内容区时，如果菜单是打开的，就关闭它
    mainContent.addEventListener('click', () => {
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });

    // 导航栏点击 (不变)
    navList.addEventListener('click', function(event) { event.preventDefault(); if (event.target.tagName === 'A') { displayCard(event.target.dataset.id); } });
    
    // 练习模式开关 (不变)
    practiceToggle.addEventListener('change', function() { updateUIMode(this.checked); });

    // 答案显示/隐藏按钮 (不变)
    practiceContainer.addEventListener('click', function(event) { if (event.target.classList.contains('toggle-answer-btn')) { const targetId = event.target.dataset.target; const answerContainer = document.getElementById(targetId); if (answerContainer) { answerContainer.style.display = answerContainer.style.display === 'block' ? 'none' : 'block'; } } });

    // 滑动事件 (不变)
    mainContent.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    mainContent.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].clientX; handleSwipe(); });

    // --- 页面初始化 ---
    populateNav();
    displayCard(currentCardId);
});