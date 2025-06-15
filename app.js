// app.js - 页面交互逻辑 (已添加高级切换动画)

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 状态变量 ---
    let currentCardId = 'K1-1';
    const cardIds = Object.keys(examData);
    let isAnimating = false; // **新增：动画锁，防止连续触发**

    // --- DOM元素获取 ---
    const navList = document.getElementById('card-nav-list');
    const mainContent = document.getElementById('main-content');
    // ... 其他DOM元素 ...
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


    // =================================================================
    //                    核心功能函数
    // =================================================================

    // 【重构】这个函数现在只负责更新DOM内容，不含任何逻辑
    function updateCardDOM(cardId) {
        const card = examData[cardId];
        if (!card) return;

        currentCardId = cardId;
        mobileHeaderTitle.textContent = cardId;

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
    }
    
    // 【新增】处理动画和卡片切换的函数
    function animateAndChangeCard(newCardId, direction) {
        if (isAnimating) return; // 如果正在动画，则不执行任何操作
        isAnimating = true;

        const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
        const inClass = direction === 'next' ? 'slide-in-right' : 'slide-in-left';
        
        // 1. 添加滑出动画
        mainContent.classList.add(outClass);

        // 2. 监听滑出动画结束事件
        mainContent.addEventListener('animationend', function onAnimationEnd() {
            // 只执行一次，然后移除监听器
            mainContent.removeEventListener('animationend', onAnimationEnd);

            // 3. 动画结束，更新内容
            updateCardDOM(newCardId);

            // 4. 移除旧的滑出动画类，添加新的滑入动画类
            mainContent.classList.remove(outClass);
            mainContent.classList.add(inClass);

            // 5. 监听滑入动画结束，解锁并清理
            mainContent.addEventListener('animationend', function onSecondAnimationEnd() {
                mainContent.removeEventListener('animationend', onSecondAnimationEnd);
                mainContent.classList.remove(inClass);
                isAnimating = false; // 解锁
            }, { once: true });

        }, { once: true }); // { once: true } 确保事件只触发一次
    }

    // displayCard 函数现在只是一个简单的入口
    function displayCard(cardId) {
        updateCardDOM(cardId);
        // 在移动端，切换卡片后自动关闭菜单
        if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    }
    
    // 【修改】滑动处理函数现在调用动画函数
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        if (Math.abs(deltaX) < swipeThreshold || isAnimating) {
            return;
        }

        const currentIndex = cardIds.indexOf(currentCardId);
        if (deltaX < 0 && currentIndex < cardIds.length - 1) {
            const nextCardId = cardIds[currentIndex + 1];
            animateAndChangeCard(nextCardId, 'next');
        } else if (deltaX > 0 && currentIndex > 0) {
            const prevCardId = cardIds[currentIndex - 1];
            animateAndChangeCard(prevCardId, 'prev');
        }
    }


    // --- 其他辅助函数 (大部分不变) ---
    function updateUIMode(isPracticeMode) { /* ... 不变 ... */ cardContentSections.forEach(s => s.style.display = isPracticeMode ? 'none' : 'block'); practiceContainer.classList.toggle('hidden', !isPracticeMode); }
    function populateNav() { /* ... 不变 ... */ cardIds.forEach(id => { const li = document.createElement('li'); li.innerHTML = `<a href="#" data-id="${id}">${id}</a>`; navList.appendChild(li); }); }
    function updateActiveNav(activeId) { /* ... 不变 ... */ navList.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.dataset.id === activeId)); }
    function generatePractice(card) { /* ... 不变 ... */ practiceContainer.innerHTML = ''; if (!card.practice || card.practice.length === 0) { practiceContainer.innerHTML = '<p style="color: #777; font-style: italic;">此题卡暂无随堂练习。</p>'; return; } card.practice.forEach((item, index) => { const div = document.createElement('div'); div.className = 'practice-item'; div.innerHTML = `<p class="practice-question">练习 ${index + 1}: ${item.question}</p><button class="toggle-answer-btn" data-target="answer-${card.id}-${index}">显示/隐藏答案</button><div id="answer-${card.id}-${index}" class="practice-answer-container"><div class="practice-answer-official"><h5>【官方指南】</h5><p>${item.officialAnswer.replace(/\n/g, '<br>')}</p></div><div class="practice-answer-simple"><h5>【记忆要点】</h5><p>${item.simpleAnswer.replace(/\n/g, '<br>')}</p></div></div>`; practiceContainer.appendChild(div); }); }

    // --- 事件监听器 (部分修改) ---
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    mainContent.addEventListener('click', () => { if (sidebar.classList.contains('active')) sidebar.classList.remove('active'); });
    // 【修改】导航栏点击也应该有动画(可选，但体验更好)
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
    practiceContainer.addEventListener('click', function(event) { /* ... 不变 ... */ if (event.target.classList.contains('toggle-answer-btn')) { const targetId = event.target.dataset.target; const answerContainer = document.getElementById(targetId); if (answerContainer) { answerContainer.style.display = answerContainer.style.display === 'block' ? 'none' : 'block'; } } });
    mainContent.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    mainContent.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].clientX; handleSwipe(); });

    // --- 页面初始化 ---
    populateNav();
    updateCardDOM(currentCardId); // 初始加载不需要动画

});