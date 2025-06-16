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
    const aiTutorBtn = document.getElementById('ai-tutor-btn');
    const aiInteractionContainer = document.getElementById('ai-interaction-container');
    const aiQuestionBox = document.getElementById('ai-question-box');
    const aiLoadingSpinner = document.getElementById('ai-loading-spinner');
    const cardContentSections = [
        document.getElementById('card-content').parentElement,
        document.getElementById('card-veto').parentElement,
        document.getElementById('card-image-container'),
        document.querySelector('.card-meta')
    ];

    // --- 滑动功能所需变量 ---
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50; // 最小滑动距离

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
    function updateUIMode(isPracticeMode) { 
        cardContentSections.forEach(s => s.style.display = isPracticeMode ? 'none' : 'block'); 
        practiceContainer.classList.toggle('hidden', !isPracticeMode);
        // 在练习模式关闭时隐藏AI交互容器
        if (!isPracticeMode) {
            aiInteractionContainer.classList.add('hidden');
        }
    }
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
    mainContent.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    mainContent.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].clientX; handleSwipe(); });
    aiTutorBtn.addEventListener('click', handleAITutorClick);

    // --- AI导师功能 ---
    async function handleAITutorClick() {
        const card = examData[currentCardId];
        if (!card) return;

        // 构造发送给AI的提示
        const prompt = `这是考试要点：\n${card.content.join('\n')}\n请根据这些要点，向我提出一个相关的问题。`;

        // 显示加载动画，并禁用按钮
        aiTutorBtn.disabled = true;
        aiTutorBtn.innerHTML = '<span class="ai-icon">🤔</span> 正在思考...';
        aiInteractionContainer.classList.remove('hidden');
        aiQuestionBox.innerHTML = '';
        aiLoadingSpinner.classList.remove('hidden');

        try {
            // 调用我们的Netlify Function
            const response = await fetch('/.netlify/functions/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: prompt })
            });

            if (!response.ok) {
                throw new Error(`服务器错误: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            // 显示AI的提问
            aiQuestionBox.textContent = data.response;

        } catch (error) {
            aiQuestionBox.textContent = `出错了：${error.message}，请稍后再试。`;
            console.error('AI Tutor Error:', error);
        } finally {
            // 隐藏加载动画，并恢复按钮
            aiLoadingSpinner.classList.add('hidden');
            aiTutorBtn.disabled = false;
            aiTutorBtn.innerHTML = '<span class="ai-icon">🤖</span> 再问一题';
        }
    }

    // --- 页面初始化 ---
    populateNav();
    displayCardWithoutAnimation(currentCardId);
});