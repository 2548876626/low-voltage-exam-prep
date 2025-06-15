// app.js - 最终完整版

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 状态变量 ---
    let currentCardId = 'K1-1';
    const cardIds = Object.keys(examData);
    let isAnimating = false; // 动画锁，防止连续触发

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
        document.getElementById('card-image-container'),
        document.querySelector('.card-meta')
    ];

    // --- 滑动功能所需变量 ---
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0; // 添加Y轴触摸点，用于判断是否为水平滑动
    let touchStartTime = 0; // 触摸开始时间
    let touchEndTime = 0; // 触摸结束时间
    const swipeThreshold = 30; // 降低最小滑动距离，使滑动更灵敏
    const swipeTimeThreshold = 300; // 快速滑动的时间阈值（毫秒）
    const swipeSpeedThreshold = 0.5; // 快速滑动的速度阈值（像素/毫秒）
    let isSwiping = false; // 是否正在滑动

    // --- 核心功能函数 ---

    // 只负责更新DOM内容
    function updateCardDOM(cardId) {
        const card = examData[cardId];
        if (!card) return;

        currentCardId = cardId;
        mobileHeaderTitle.textContent = cardId;

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
    
    // 处理动画和卡片切换
    function animateAndChangeCard(newCardId, direction) {
        if (isAnimating) return;
        isAnimating = true;

        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
        
        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
        
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

    // 无动画的卡片显示（用于初始加载）
    function displayCardWithoutAnimation(cardId) {
        updateCardDOM(cardId);
        if (sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }
    
    // 滑动处理
    function handleSwipe() {
        if (isAnimating) return;
        
        const deltaX = touchEndX - touchStartX;
        const deltaY = Math.abs(touchEndY - touchStartY); // 计算Y轴滑动距离
        const swipeTime = touchEndTime - touchStartTime; // 计算滑动时间
        const swipeSpeed = Math.abs(deltaX) / swipeTime; // 计算滑动速度
        
        // 如果垂直滑动距离大于水平滑动距离的一半，则认为是垂直滚动，不触发翻页
        if (deltaY > Math.abs(deltaX) / 2) return;
        
        // 判断是否满足滑动条件：距离超过阈值 或 速度超过阈值且时间小于阈值（快速滑动）
        const isValidSwipe = Math.abs(deltaX) >= swipeThreshold || 
                            (swipeSpeed >= swipeSpeedThreshold && swipeTime <= swipeTimeThreshold);
        
        if (!isValidSwipe) return;

        const currentIndex = cardIds.indexOf(currentCardId);
        if (deltaX < 0 && currentIndex < cardIds.length - 1) {
            // 向左滑动，显示下一张
            animateAndChangeCard(cardIds[currentIndex + 1], 'next');
        } else if (deltaX > 0 && currentIndex > 0) {
            // 向右滑动，显示上一张
            animateAndChangeCard(cardIds[currentIndex - 1], 'prev');
        }
    }

    // --- 其他辅助函数 ---
    function updateUIMode(isPracticeMode) { cardContentSections.forEach(s => s.style.display = isPracticeMode ? 'none' : 'block'); practiceContainer.classList.toggle('hidden', !isPracticeMode); }
    function populateNav() { cardIds.forEach(id => { const li = document.createElement('li'); li.innerHTML = `<a href="#" data-id="${id}">${id}</a>`; navList.appendChild(li); }); }
    function updateActiveNav(activeId) { navList.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.dataset.id === activeId)); }
    function generatePractice(card) { practiceContainer.innerHTML = ''; if (!card.practice || card.practice.length === 0) { practiceContainer.innerHTML = '<p style="color: #777; font-style: italic;">此题卡暂无随堂练习。</p>'; return; } card.practice.forEach((item, index) => { const div = document.createElement('div'); div.className = 'practice-item'; div.innerHTML = `<p class="practice-question">练习 ${index + 1}: ${item.question}</p><button class="toggle-answer-btn" data-target="answer-${card.id}-${index}">显示/隐藏答案</button><div id="answer-${card.id}-${index}" class="practice-answer-container"><div class="practice-answer-official"><h5>【官方指南】</h5><p>${item.officialAnswer.replace(/\n/g, '<br>')}</p></div><div class="practice-answer-simple"><h5>【记忆要点】</h5><p>${item.simpleAnswer.replace(/\n/g, '<br>')}</p></div></div>`; practiceContainer.appendChild(div); }); }

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
    
    // 增强的触摸事件处理
    let touchEndY = 0; // 添加Y轴结束点
    
    mainContent.addEventListener('touchstart', (e) => { 
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = new Date().getTime();
        isSwiping = true;
    }, { passive: true });
    
    mainContent.addEventListener('touchmove', (e) => {
        if (!isSwiping) return;
        
        // 防止触发页面滚动
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = Math.abs(e.touches[0].clientY - touchStartY);
        
        // 如果是水平滑动，阻止页面滚动
        if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
            e.preventDefault();
        }
    }, { passive: false });
    
    mainContent.addEventListener('touchend', (e) => { 
        touchEndX = e.changedTouches[0].clientX;
        touchEndY = e.changedTouches[0].clientY;
        touchEndTime = new Date().getTime();
        isSwiping = false;
        handleSwipe();
    });
    
    mainContent.addEventListener('touchcancel', () => {
        isSwiping = false;
    });

    // --- 页面初始化 ---
    populateNav();
    displayCardWithoutAnimation(currentCardId);
});