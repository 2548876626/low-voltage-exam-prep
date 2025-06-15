// app.js - 页面交互逻辑 (已添加点击导航后自动收回菜单)

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 状态变量 ---
    let currentCardId = 'K1-1';
    const cardIds = Object.keys(examData);
    let isAnimating = false;

    // --- DOM元素获取 ---
    const navList = document.getElementById('card-nav-list');
    const mainContent = document.getElementById('main-content');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileHeaderTitle = document.getElementById('mobile-header-title');
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

    function updateCardDOM(cardId) {
        const card = examData[cardId];
        if (!card) return;

        currentCardId = cardId;
        mobileHeaderTitle.textContent = cardId;

        // ... 更新数据 ...
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
    }
    
    function animateAndChangeCard(newCardId, direction) {
        if (isAnimating) return;
        isAnimating = true;

        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
        
        // ======================= 【核心修改点】 =======================
        // 在开始动画前，如果菜单是打开的，就先关掉它
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
        // ==========================================================
        
        mainContent.classList.add(outClass);

        mainContent.addEventListener('animationend', function onAnimationEnd() {
            mainContent.removeEventListener('animationend', onAnimationEnd);
            updateCardDOM(newCardId);
            mainContent.classList.remove(outClass);
            mainContent.classList.add(inClass);

            mainContent.addEventListener('animationend', function onSecondAnimationEnd() {
                mainContent.removeEventListener('animationend', onSecondAnimationEnd);
                mainContent.classList.remove(inClass);
                isAnimating = false;
            }, { once: true });

        }, { once: true });
    }

    // 【修改】这个函数现在只在没有动画的场景下使用
    function displayCardWithoutAnimation(cardId) {
        updateCardDOM(cardId);
        // 如果菜单是打开的，关闭它
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        if (Math.abs(deltaX) < swipeThreshold || isAnimating) return;

        const currentIndex = cardIds.indexOf(currentCardId);
        if (deltaX < 0 && currentIndex < cardIds.length - 1) {
            animateAndChangeCard(cardIds[currentIndex + 1], 'next');
        } else if (deltaX > 0 && currentIndex > 0) {
            animateAndChangeCard(cardIds[currentIndex - 1], 'prev');
        }
    }

    // --- 其他辅助函数 ---
    function updateUIMode(isPracticeMode) { cardContentSections.forEach(s => s.style.display = isPracticeMode ? 'none' : 'block'); practiceContainer.classList.toggle('hidden', !isPracticeMode); }
    function populateNav() { cardIds.forEach(id => { const li = document.createElement('li'); li.innerHTML = `<a href="#" data-id="${id}">${id}</a>`; navList.appendChild(li); }); }
    function updateActiveNav(activeId) { navList.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.dataset.id === activeId)); }
    function generatePractice(card) { /* 此函数不变，为节省空间省略 */ practiceContainer.innerHTML = ''; if (!card.practice || card.practice.length === 0) { practiceContainer.innerHTML = '<p style="color: #777; font-style: italic;">此题卡暂无随堂练习。</p>'; return; } card.practice.forEach((item, index) => { const div = document.createElement('div'); div.className = 'practice-item'; div.innerHTML = `<p class="practice-question">练习 ${index + 1}: ${item.question}</p><button class="toggle-answer-btn" data-target="answer-${card.id}-${index}">显示/隐藏答案</button><div id="answer-${card.id}-${index}" class="practice-answer-container"><div class="practice-answer-official"><h5>【官方指南】</h5><p>${item.officialAnswer.replace(/\n/g, '<br>')}</p></div><div class="practice-answer-simple"><h5>【记忆要点】</h5><p>${item.simpleAnswer.replace(/\n/g, '<br>')}</p></div></div>`; practiceContainer.appendChild(div); }); }

    // --- 事件监听器 ---
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    mainContent.addEventListener('click', () => { if (sidebar.classList.contains('active')) sidebar.classList.remove('active'); });

    navList.addEventListener('click', function(event) {
        event.preventDefault();
        const link = event.target.closest('a');
        if (link) {
            const newCardId = link.dataset.id;
            if (newCardId === currentCardId || isAnimating) return;
            
            const currentIndex = cardIds.indexOf(currentCardId);
            const newIndex = cardIds.indexOf(newCardId);

            animateAndChangeCard(newCardId, newIndex > currentIndex ? 'next' : 'prev');
        }
    });

    practiceToggle.addEventListener('change', function() { updateUIMode(this.checked); });
    practiceContainer.addEventListener('click', function(event) { if (event.target.classList.contains('toggle-answer-btn')) { const targetId = event.target.dataset.target; const answerContainer = document.getElementById(targetId); if (answerContainer) { answerContainer.style.display = answerContainer.style.display === 'block' ? 'none' : 'block'; } } });
    mainContent.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    mainContent.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].clientX; handleSwipe(); });

    // --- 页面初始化 ---
    populateNav();
    // 初始加载使用无动画的版本
    displayCardWithoutAnimation(currentCardId);
});