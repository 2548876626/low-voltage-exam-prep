// app.js - 页面交互逻辑

// 等待DOM内容完全加载后再执行脚本
document.addEventListener('DOMContentLoaded', function() {
    
    // 获取需要操作的DOM元素
    const navList = document.getElementById('card-nav-list');
    const cardSubjectEl = document.getElementById('card-subject');
    const cardTitleEl = document.getElementById('card-title');
    const cardTimeEl = document.getElementById('card-time');
    const cardScoreEl = document.getElementById('card-score');
    const cardContentEl = document.getElementById('card-content');
    const cardVetoEl = document.getElementById('card-veto');
    const cardImageContainer = document.getElementById('card-image-container');

    // 1. 动态生成导航栏
    function populateNav() {
        // 遍历 examData 对象中的所有题卡
        for (const cardId in examData) {
            const card = examData[cardId];
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            
            link.href = '#';
            link.textContent = card.id;
            link.dataset.id = card.id; // 使用 data-* 属性存储ID

            listItem.appendChild(link);
            navList.appendChild(listItem);
        }
    }

    // 2. 显示指定ID的题卡内容
    function displayCard(cardId) {
        const card = examData[cardId];
        if (!card) {
            console.error('未找到题卡:', cardId);
            return;
        }

        // 更新页面内容
        cardSubjectEl.textContent = card.subject;
        cardTitleEl.textContent = card.title;
        cardTimeEl.textContent = card.examTime;
        cardScoreEl.textContent = card.score;
        
        // 使用 join('\n') 将数组转换为带换行的字符串
        cardContentEl.textContent = card.content.join('\n');
        cardVetoEl.textContent = card.vetoItems.join('\n');
        
        // 处理图片
        cardImageContainer.innerHTML = ''; // 先清空
        if (card.image) {
            const img = document.createElement('img');
            img.src = card.image;
            img.alt = `${card.title} - 电路图`;
            cardImageContainer.appendChild(img);
        }

        // 更新导航栏的 'active' 状态
        updateActiveNav(cardId);
    }

    // 3. 更新导航栏的激活状态
    function updateActiveNav(activeId) {
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            if (link.dataset.id === activeId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // 4. 设置导航栏点击事件
    navList.addEventListener('click', function(event) {
        // 阻止a标签的默认跳转行为
        event.preventDefault();

        // 事件委托：检查点击的是否是 a 标签
        if (event.target.tagName === 'A') {
            const cardId = event.target.dataset.id;
            displayCard(cardId);
        }
    });

    // --- 初始化页面 ---
    populateNav(); // 生成导航
    displayCard('K1-1'); // 默认显示第一张卡
});