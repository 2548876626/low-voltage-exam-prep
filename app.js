// app.js - 页面交互逻辑 (已添加左右滑动切换功能)

document.addEventListener('DOMContentLoaded', function() {
    
    // --- 状态变量 ---
    let currentCardId = 'K1-1'; // 用于跟踪当前显示的题卡ID
    const cardIds = Object.keys(examData); // 获取所有题卡ID的有序列表

    // --- DOM元素获取 ---
    const navList = document.getElementById('card-nav-list');
    const mainContent = document.querySelector('.content'); // 我们将在这里监听滑动事件
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
    const swipeThreshold = 50; // 最小滑动距离，防止误触

    // =================================================================
    //                    核心功能函数
    // =================================================================

    // 更新UI模式 (练习/查阅)
    function updateUIMode(isPracticeMode) {
        cardContentSections.forEach(section => {
            section.style.display = isPracticeMode ? 'none' : 'block';
        });
        practiceContainer.classList.toggle('hidden', !isPracticeMode);
    }

    // 显示指定ID的题卡
    function displayCard(cardId) {
        const card = examData[cardId];
        if (!card) return;

        currentCardId = cardId; // **重要：更新当前题卡ID**

        // 更新数据
        cardSubjectEl.textContent = card.subject;
        cardTitleEl.textContent = card.title;
        // ... 其他数据更新
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

    // 其他辅助函数 (populateNav, updateActiveNav, generatePractice)
    function populateNav() {
        cardIds.forEach(id => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = id;
            link.dataset.id = id;
            listItem.appendChild(link);
            navList.appendChild(listItem);
        });
    }

    function updateActiveNav(activeId) {
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.id === activeId);
        });
    }

    function generatePractice(card) {
        practiceContainer.innerHTML = '';
        if (!card.practice || card.practice.length === 0) {
            practiceContainer.innerHTML = '<p style="color: #777; font-style: italic;">此题卡暂无随堂练习。</p>';
            return;
        }
        card.practice.forEach((item, index) => {
            const practiceItemDiv = document.createElement('div');
            practiceItemDiv.className = 'practice-item';
            practiceItemDiv.innerHTML = `
                <p class="practice-question">练习 ${index + 1}: ${item.question}</p>
                <button class="toggle-answer-btn" data-target="answer-${card.id}-${index}">显示/隐藏答案</button>
                <div id="answer-${card.id}-${index}" class="practice-answer-container">
                    <div class="practice-answer-official"><h5>【官方指南】</h5><p>${item.officialAnswer.replace(/\n/g, '<br>')}</p></div>
                    <div class="practice-answer-simple"><h5>【记忆要点】</h5><p>${item.simpleAnswer.replace(/\n/g, '<br>')}</p></div>
                </div>
            `;
            practiceContainer.appendChild(practiceItemDiv);
        });
    }

    // =================================================================
    //                    事件监听器
    // =================================================================

    // 导航栏点击
    navList.addEventListener('click', function(event) {
        event.preventDefault();
        if (event.target.tagName === 'A') {
            displayCard(event.target.dataset.id);
        }
    });
    
    // 练习模式开关
    practiceToggle.addEventListener('change', function() {
        updateUIMode(this.checked);
    });

    // 答案显示/隐藏按钮
    practiceContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('toggle-answer-btn')) {
            const targetId = event.target.dataset.target;
            const answerContainer = document.getElementById(targetId);
            if (answerContainer) {
                answerContainer.style.display = answerContainer.style.display === 'block' ? 'none' : 'block';
            }
        }
    });

    // --- 【新增】滑动事件监听器 ---
    mainContent.addEventListener('touchstart', (event) => {
        // 记录手指开始触摸的横坐标
        touchStartX = event.touches[0].clientX;
    }, { passive: true }); // 使用 passive: true 提升滚动性能

    mainContent.addEventListener('touchend', (event) => {
        // 记录手指离开屏幕的横坐标
        touchEndX = event.changedTouches[0].clientX;
        handleSwipe();
    });

    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;

        // 检查滑动距离是否超过阈值
        if (Math.abs(deltaX) < swipeThreshold) {
            return; // 滑动距离太短，不处理
        }

        // 找到当前卡片在列表中的索引
        const currentIndex = cardIds.indexOf(currentCardId);

        if (deltaX < 0) {
            // --- 向左滑动 (切换到下一张) ---
            if (currentIndex < cardIds.length - 1) {
                const nextCardId = cardIds[currentIndex + 1];
                displayCard(nextCardId);
            }
        } else {
            // --- 向右滑动 (切换到上一张) ---
            if (currentIndex > 0) {
                const prevCardId = cardIds[currentIndex - 1];
                displayCard(prevCardId);
            }
        }
    }


    // --- 页面初始化 ---
    populateNav();
    displayCard(currentCardId); // 使用初始ID来显示第一张卡
});