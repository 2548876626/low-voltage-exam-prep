// app.js - 页面交互逻辑 (覆盖式动画 + Bug修复版)

document.addEventListener('DOMContentLoaded', function() {
    
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

    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 50;

    // 主切换函数
    function switchCard(newCardId) {
        if (isAnimating || newCardId === currentCardId) return;
        isAnimating = true;

        const currentIndex = cardIds.indexOf(currentCardId);
        const newIndex = cardIds.indexOf(newCardId);
        if (newIndex < 0) { isAnimating = false; return; }
        
        const direction = newIndex > currentIndex ? 'next' : 'prev';

        const currentContainer = containers[currentContainerIndex - 1];
        const nextContainerIndex = currentContainerIndex === 1 ? 2 : 1;
        const nextContainer = containers[nextContainerIndex - 1];

        if (direction === 'next') {
            // 下一张：新卡片从右边覆盖进来
            populateCard(nextContainer, newCardId);
            nextContainer.classList.add('next');
            requestAnimationFrame(() => {
                nextContainer.classList.remove('next');
                nextContainer.classList.add('current');
            });
        } else {
            // 上一张：当前卡片向右滑走，揭示下面的新卡片
            populateCard(nextContainer, newCardId);
            nextContainer.classList.add('prev');
            requestAnimationFrame(() => {
                currentContainer.classList.add('slide-out-right');
            });
        }

        currentCardId = newCardId;
        updateActiveNav(newCardId);
        mobileHeaderTitle.textContent = newCardId;
        
        // 动画结束后清理和切换容器
        setTimeout(() => {
            currentContainer.classList.remove('current', 'slide-out-right');
            nextContainer.classList.remove('prev');
            nextContainer.classList.add('current');
            currentContainerIndex = nextContainerIndex;
            isAnimating = false;
        }, 350); // 动画时间
    }

    // 填充卡片内容
    function populateCard(container, cardId) {
        const cardData = examData[cardId];
        if (!cardData || !container) return;

        const cardNode = cardTemplate.content.cloneNode(true);
        container.innerHTML = '';
        container.appendChild(cardNode);

        // 使用可选链 (?.) 来安全地访问元素
        container.querySelector('.card-subject')?.textContent = cardData.subject;
        container.querySelector('.card-title')?.textContent = cardData.title;
        container.querySelector('.card-time')?.textContent = cardData.examTime;
        container.querySelector('.card-score')?.textContent = cardData.score;
        container.querySelector('.card-content')?.textContent = cardData.content.join('\n');
        container.querySelector('.card-veto')?.textContent = cardData.vetoItems.join('\n');
        
        const imgContainer = container.querySelector('.card-image-container');
        if (cardData.image && imgContainer) {
            const img = document.createElement('img');
            img.src = cardData.image;
            img.alt = `${cardData.title} - 电路图`;
            imgContainer.innerHTML = '';
            imgContainer.appendChild(img);
        }

        const practiceContainer = container.querySelector('.practice-container');
        const practiceToggle = container.querySelector('.practice-mode-toggle');
        
        if (practiceContainer && practiceToggle) {
            generatePractice(practiceContainer, cardData);
            practiceToggle.addEventListener('change', function() {
                updateUIMode(container, this.checked);
            });
            const anyVisibleToggle = document.querySelector('.card-container.current .practice-mode-toggle');
            if (anyVisibleToggle) {
                practiceToggle.checked = anyVisibleToggle.checked;
            }
            updateUIMode(container, practiceToggle.checked);
        }
    }
    
    function updateUIMode(container, isPracticeMode) {
        container.querySelector('.practice-container')?.classList.toggle('hidden', !isPracticeMode);
        container.querySelector('.card-header')?.style.setProperty('display', isPracticeMode ? 'none' : 'block');
        container.querySelector('.card-meta')?.style.setProperty('display', isPracticeMode ? 'none' : 'block');
        container.querySelector('.card-image-container')?.style.setProperty('display', isPracticeMode ? 'none' : 'block');
        container.querySelector('.card-content')?.parentElement.style.setProperty('display', isPracticeMode ? 'none' : 'block');
        container.querySelector('.card-veto')?.parentElement.style.setProperty('display', isPracticeMode ? 'none' : 'block');
    }

    // 其他辅助函数...
    function populateNav() { cardIds.forEach(id => { const li = document.createElement('li'); li.innerHTML = `<a href="#" data-id="${id}">${id}</a>`; navList.appendChild(li); }); }
    function updateActiveNav(activeId) { navList.querySelectorAll('a').forEach(link => link.classList.toggle('active', link.dataset.id === activeId)); }
    function generatePractice(container, cardData) { container.innerHTML = ''; if (!cardData.practice || cardData.practice.length === 0) { container.innerHTML = '<p style="color: #777; font-style: italic;">此题卡暂无随堂练习。</p>'; return; } cardData.practice.forEach((item, index) => { const div = document.createElement('div'); div.className = 'practice-item'; div.innerHTML = `<p class="practice-question">练习 ${index + 1}: ${item.question}</p><button class="toggle-answer-btn" data-target="answer-${cardData.id}-${index}">显示/隐藏答案</button><div id="answer-${cardData.id}-${index}" class="practice-answer-container"><div class="practice-answer-official"><h5>【官方指南】</h5><p>${item.officialAnswer.replace(/\n/g, '<br>')}</p></div><div class="practice-answer-simple"><h5>【记忆要点】</h5><p>${item.simpleAnswer.replace(/\n/g, '<br>')}</p></div></div>`; container.appendChild(div); }); }
    function handleSwipe() { const deltaX = touchEndX - touchStartX; if (Math.abs(deltaX) < swipeThreshold) return; const currentIndex = cardIds.indexOf(currentCardId); if (deltaX < 0 && currentIndex < cardIds.length - 1) { switchCard(cardIds[currentIndex + 1]); } else if (deltaX > 0 && currentIndex > 0) { switchCard(cardIds[currentIndex - 1]); } }

    // --- 事件监听器 ---
    menuToggle.addEventListener('click', () => sidebar.classList.toggle('active'));
    mainContent.addEventListener('click', (e) => { if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) { sidebar.classList.remove('active'); } });
    navList.addEventListener('click', (e) => { e.preventDefault(); const link = e.target.closest('a'); if (link) { switchCard(link.dataset.id); sidebar.classList.remove('active'); } });
    mainContent.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    mainContent.addEventListener('touchend', (e) => { touchEndX = e.changedTouches[0].clientX; handleSwipe(); });
    mainContent.addEventListener('click', (e) => { if (e.target.classList.contains('toggle-answer-btn')) { const container = e.target.closest('.card-container'); const targetId = e.target.dataset.target; const answerContainer = container?.querySelector(`#${targetId}`); if (answerContainer) { answerContainer.style.display = answerContainer.style.display === 'block' ? 'none' : 'block'; } } });

    // --- 页面初始化 ---
    function init() {
        populateNav();
        // 关键修复：确保第一个容器被正确初始化并显示
        const initialContainer = containers[0];
        populateCard(initialContainer, currentCardId);
        initialContainer.classList.add('current'); // **添加 .current 类，让它显示出来**
        updateActiveNav(currentCardId);
        mobileHeaderTitle.textContent = currentCardId;
    }

    init(); // 执行初始化
});