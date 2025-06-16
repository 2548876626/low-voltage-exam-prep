// app.js - 最终完整版

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 状态变量 ---
    let currentCardId = 'K1-1';
    const cardIds = Object.keys(examData);
    let isAnimating = false; // 动画锁，防止连续触发
    let conversationHistory = [];

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
    const aiAnswerArea = document.getElementById('ai-answer-area');
    const aiUserAnswerInput = document.getElementById('ai-user-answer');
    const aiSubmitAnswerBtn = document.getElementById('ai-submit-answer-btn');
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
            img.onerror = function() {
                console.error(`图片加载失败: ${card.image}`);
                this.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="70" viewBox="0 0 100 70"%3E%3Crect fill="%23f0f0f0" width="100" height="70"/%3E%3Cpath fill="%23cccccc" d="M36 20h32v30H36z"/%3E%3Cpath fill="%23666666" d="M40 50h22v4H40z"/%3E%3Cpath fill="%23666666" d="M49 25l-5 15h20l-5-15z"/%3E%3C/svg%3E';
                this.style.opacity = '0.5';
            };
            cardImageContainer.appendChild(img);
            // 显示图片容器
            cardImageContainer.style.display = 'block';
        } else {
            // 隐藏图片容器
            cardImageContainer.style.display = 'none';
        }
        
        updateActiveNav(cardId);
        generatePractice(card);
        updateUIMode(practiceToggle.checked);
        
        // 在切换题卡时重置AI交互区域
        resetAIState();
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
        // 在练习模式关闭时隐藏AI交互容器并重置状态
        if (!isPracticeMode) {
            aiInteractionContainer.classList.add('hidden');
            resetAIState();
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
    aiTutorBtn.addEventListener('click', startAIConversation);
    aiSubmitAnswerBtn.addEventListener('click', submitUserAnswer);

    // --- AI导师功能 ---
    function resetAIState() {
        conversationHistory = []; // Clear history
        aiInteractionContainer.classList.add('hidden');
        aiAnswerArea.classList.add('hidden');
        aiLoadingSpinner.style.display = 'none';
        aiQuestionBox.innerHTML = '';
        aiUserAnswerInput.value = '';
        aiTutorBtn.disabled = false;
        aiTutorBtn.innerHTML = '<span class="ai-icon">🤖</span> AI考官';
    }
    
    // Generic function to call the AI
    async function callAI(messages) {
        aiLoadingSpinner.style.display = 'block';
        aiTutorBtn.disabled = true;
        aiSubmitAnswerBtn.disabled = true;

        try {
            const response = await fetch('/.netlify/functions/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messages })
            });
            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.details || 'Server returned an error.');
            }
            return data.response;
        } catch (error) {
            console.error('AI Call Error:', error);
            return `出错了：${error.message}`;
        } finally {
            aiLoadingSpinner.style.display = 'none';
            aiTutorBtn.disabled = false;
            aiSubmitAnswerBtn.disabled = false;
        }
    }

    // Function to start a new conversation
    async function startAIConversation() {
        const card = examData[currentCardId];
        if (!card) return;

        resetAIState();
        aiInteractionContainer.classList.remove('hidden');

        const systemMessage = { role: 'system', content: '你是一个严格的低压电工实操考官。请根据用户提供的考试要点，一次只提出一个相关的问题。问题要简明扼要，直接切入要点。在用户回答后，请判断其回答是否正确，并可以追问或提出新问题。' };
        const userMessage = { role: 'user', content: `这是考试要点：\n${card.content.join('\n')}\n请开始提问。` };
        
        conversationHistory = [systemMessage, userMessage];
        
        const firstQuestion = await callAI(conversationHistory);
        
        conversationHistory.push({ role: 'assistant', content: firstQuestion });
        aiQuestionBox.textContent = firstQuestion;
        aiAnswerArea.classList.remove('hidden');
        aiTutorBtn.innerHTML = '<span class="ai-icon">🔄</span> 重新开始';
    }

    // Function to handle submitting an answer
    async function submitUserAnswer() {
        const userAnswer = aiUserAnswerInput.value.trim();
        if (!userAnswer) {
            alert('请输入你的回答！');
            return;
        }

        conversationHistory.push({ role: 'user', content: userAnswer });
        aiUserAnswerInput.value = ''; // Clear input

        const aiJudgement = await callAI(conversationHistory);

        conversationHistory.push({ role: 'assistant', content: aiJudgement });
        aiQuestionBox.innerHTML += `\n\n<hr>\n<strong>你的回答:</strong> ${userAnswer}\n\n<strong>考官点评:</strong> ${aiJudgement}`;
        // Scroll to the bottom of the box
        aiQuestionBox.scrollTop = aiQuestionBox.scrollHeight;
    }

    // --- 页面初始化 ---
    populateNav();
    displayCardWithoutAnimation(currentCardId);
});