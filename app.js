// app.js - 页面交互逻辑 (已添加丝滑切换动画)

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 状态变量 ---
    let currentCardId = 'K1-1';
    const cardIds = Object.keys(examData);
    let currentContainerIndex = 1;
    let isAnimating = false;

    // --- DOM元素获取 ---
    const navList = document.getElementById('card-nav-list');
    const mainContent = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileHeaderTitle = document.getElementById('mobile-header-title');
    const cardTemplate = document.getElementById('card-template');
    const containers = [
        document.getElementById('card-container-1'),
        document.getElementById('card-container-2')
    ];

    // --- 滑动功能所需变量 ---
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;

    // --- 核心功能函数 ---

    // 填充卡片内容
    function populateCard(container, cardId) {
        const cardData = examData[cardId];
        if (!cardData) return;

        const cardNode = cardTemplate.content.cloneNode(true);
        container.innerHTML = ''; // 清空容器
        container.appendChild(cardNode);

        // 填充数据
        container.querySelector('.card-subject').textContent = cardData.subject;
        container.querySelector('.card-title').textContent = cardData.title;
        container.querySelector('.card-time').textContent = cardData.examTime;
        container.querySelector('.card-score').textContent = cardData.score;
        container.querySelector('.card-content').textContent = cardData.content.join('\n');
        container.querySelector('.card-veto').textContent = cardData.vetoItems.join('\n');
        
        const imgContainer = container.querySelector('.card-image-container');
        if (cardData.image) {
            const img = document.createElement('img');
            img.src = cardData.image;
            img.alt = `${cardData.title} - 电路图`;
            imgContainer.appendChild(img);
        }

        // 练习模式相关
        const practiceContainer = container.querySelector('.practice-container');
        const practiceToggle = container.querySelector('.practice-mode-toggle');
        
        generatePractice(practiceContainer, cardData);
        
        practiceToggle.addEventListener('change', function() {
            updateUIMode(container, this.checked);
        });

        // 保持练习模式状态
        const globalPracticeMode = document.querySelector('#card-container-1 .practice-mode-toggle, #card-container-2 .practice-mode-toggle').checked;
        practiceToggle.checked = globalPracticeMode;
        updateUIMode(container, globalPracticeMode);
    }
    
    function updateUIMode(container, isPracticeMode) {
        container.querySelector('.practice-container').classList.toggle('hidden', !isPracticeMode);
        container.querySelector('.card-header').style.display = isPracticeMode ? 'none' : 'block';
        container.querySelector('.card-meta').style.display = isPracticeMode ? 'none' : 'block';
        container.querySelector('.card-image-container').style.display = isPracticeMode ? 'none' : 'block';
        container.querySelector('.card-content').parentElement.style.display = isPracticeMode ? 'none' : 'block';
        container.querySelector('.card-veto').parentElement.style.display = isPracticeMode ? 'none' : 'block';
    }
    
    // 主切换函数
    function switchCard(newCardId, direction = 'next') {
        if (isAnimating || newCardId === currentCardId) return;
        isAnimating = true;

        const currentIndex = cardIds.indexOf(currentCardId);
        const newIndex = cardIds.indexOf(newCardId);
        if (newIndex < 0) { isAnimating = false; return; }
        
        // 决定动画方向
        if (newIndex > currentIndex) direction = 'next';
        if (newIndex < currentIndex) direction = 'prev';

        const currentContainer = containers[currentContainerIndex - 1];
        const nextContainerIndex = currentContainerIndex === 1 ? 2 : 1;
        const nextContainer = containers[nextContainerIndex - 1];

        // 填充新卡片并准备动画
        populateCard(nextContainer, newCardId);
        nextContainer.classList.add(direction); // 'next' or 'prev'

        // 强制浏览器渲染，为动画做准备
        requestAnimationFrame(() => {
            // 开始动画
            currentContainer.classList.add(direction === 'next' ? 'slide-out-left' : 'slide-out-right');
            nextContainer.classList.remove('next', 'prev');
            nextContainer.classList.add('current');

            // 更新全局状态
            currentCardId = newCardId;
            currentContainerIndex = nextContainerIndex;
            updateActiveNav(newCardId);
            mobileHeaderTitle.textContent = newCardId;
        });

        // 动画结束后清理
        setTimeout(() => {
            currentContainer.classList.remove('current', 'slide-out-left', 'slide-out-right');
            isAnimating = false;
        }, 400); // 动画时间
    }

    // 其他辅助函数
    function populateNav() { cardIds.forEach(id => { const li = document.createElement('li'); li.innerHTML = `<a href="#" data-id="${id}">${id}</a>`; navList.appendChild(li); }); }
    function updateActiveNav(activeId) { navList.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.dataset.id === activeId)); }
    function generatePractice(container, cardData) { /* 省略不变的代码 */ container.innerHTML = ''; if (!cardData.practice || cardData.practice.length === 0) { container.innerHTML = '<p style="color: #777; font-style: italic;">此题卡暂无随堂练习。</p>'; return; } cardData.practice.forEach((item, index) => { const div = document.createElement('div'); div.className = 'practice-item'; div.innerHTML = `<p class="practice-question">练习 ${index + 1}: ${item.question}</p><button class="toggle-answer-btn" data-target="answer-${cardData.id}-${index}">显示/隐藏答案</button><div id="answer-${cardData.id}-${index}" class="practice-answer-container"><div class="practice-answer-official"><h5>【官方指南】</h5><p>${item.officialAnswer.replace(/\n/g, '<br>')}</p></div><div class="practice-answer-simple"><h5>【记忆要点】</h5><p>${item.simpleAnswer.replace(/\n/g, '<br>')}</p></div></div>`; container.appendChild(div); }); }

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        if (Math.abs(deltaX) < swipeThreshold) return;
        const currentIndex = cardIds.indexOf(currentCardId);
        if (deltaX < 0 && currentIndex < cardIds.length - 1) {
            switchCard(cardIds[currentIndex + 1], 'next');
        } else if (deltaX > 0 && currentIndex > 0) {
            switchCard(cardIds[currentIndex - 1], 'prev');
        }
    }

    // --- 事件监听器 ---
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    mainContent.addEventListener('click', (e) => { if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) { sidebar.classList.remove('active'); } });
    navList.addEventListener('click', (e) => { e.preventDefault(); if (e.target.tagName === 'A') { switchCard(e.target.dataset.id); sidebar.classList.remove('active'); } });
    mainContent.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    mainContent.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].clientX; handleSwipe(); });
    
    // 答案显示/隐藏按钮 (使用事件委托到 mainContent)
    mainContent.addEventListener('click', function(event) {
        if (event.target.classList.contains('toggle-answer-btn')) {
            const container = event.target.closest('.card-container');
            const targetId = event.target.dataset.target;
            const answerContainer = container.querySelector(`#${targetId}`);
            if (answerContainer) {
                answerContainer.style.display = answerContainer.style.display === 'block' ? 'none' : 'block';
            }
        }
    });

    // --- 页面初始化 ---
    populateNav();
    // 初始加载
    populateCard(containers[0], currentCardId);
    containers[0].classList.add('current');
    updateActiveNav(currentCardId);
    mobileHeaderTitle.textContent = currentCardId;
});