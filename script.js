document.addEventListener('DOMContentLoaded', () => {
    // --- 6. 活動標題動畫 ---
    const titleInput = document.getElementById('title-input');
    const titleAnimSelect = document.getElementById('title-anim-select');
    const eventTitle = document.getElementById('event-title');

    titleInput.addEventListener('input', (e) => {
        eventTitle.textContent = e.target.value;
    });

    titleAnimSelect.addEventListener('change', (e) => {
        eventTitle.className = '';
        eventTitle.classList.add(e.target.value);
    });

    // --- 佈景主題設定 ---
    const themeSelect = document.getElementById('theme-select');
    
    function applyTheme(theme) {
        if (theme === 'system') {
            if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                document.documentElement.setAttribute('data-theme', 'light');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        } else if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    // 監聽系統主題變化
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
        if (themeSelect.value === 'system') {
            applyTheme('system');
        }
    });

    themeSelect.addEventListener('change', (e) => {
        const theme = e.target.value;
        localStorage.setItem('preferred-theme', theme);
        applyTheme(theme);
    });

    // 載入儲存的主題
    const savedTheme = localStorage.getItem('preferred-theme') || 'system';
    themeSelect.value = savedTheme;
    applyTheme(savedTheme);

    // --- 1. 跑馬燈 (Marquee) ---
    const marqueeInput = document.getElementById('marquee-input');
    const marqueeColor = document.getElementById('marquee-color');
    const marqueeBgColor = document.getElementById('marquee-bg-color');
    const marqueeSpeed = document.getElementById('marquee-speed');
    const speedVal = document.getElementById('speed-val');
    
    const marqueeText = document.getElementById('marquee-text');
    const marqueeBg = document.getElementById('marquee-bg');

    // 載入 localStorage 設定
    function loadMarqueeSettings() {
        const saved = JSON.parse(localStorage.getItem('marqueeSettings'));
        if (saved) {
            if (saved.text) { marqueeInput.value = saved.text; marqueeText.textContent = saved.text; }
            if (saved.color) { marqueeColor.value = saved.color; marqueeText.style.color = saved.color; }
            if (saved.bgColor) { marqueeBgColor.value = saved.bgColor; marqueeBg.style.backgroundColor = saved.bgColor; }
            if (saved.speed) { 
                marqueeSpeed.value = saved.speed; 
                marqueeText.setAttribute('scrollamount', saved.speed);
                speedVal.textContent = saved.speed;
            }
        }
    }

    function saveMarqueeSettings() {
        const settings = {
            text: marqueeInput.value,
            color: marqueeColor.value,
            bgColor: marqueeBgColor.value,
            speed: marqueeSpeed.value
        };
        localStorage.setItem('marqueeSettings', JSON.stringify(settings));
    }

    marqueeInput.addEventListener('input', (e) => { marqueeText.textContent = e.target.value; saveMarqueeSettings(); });
    marqueeColor.addEventListener('input', (e) => { marqueeText.style.color = e.target.value; saveMarqueeSettings(); });
    marqueeBgColor.addEventListener('input', (e) => { marqueeBg.style.backgroundColor = e.target.value; saveMarqueeSettings(); });
    marqueeSpeed.addEventListener('input', (e) => { 
        marqueeText.setAttribute('scrollamount', e.target.value); 
        speedVal.textContent = e.target.value;
        saveMarqueeSettings(); 
    });

    loadMarqueeSettings();

    // --- 2. 倒數計時器 ---
    let timerInterval = null;
    let totalSeconds = 0;
    const timerDisplay = document.getElementById('timer-display');
    const minInput = document.getElementById('timer-min');
    const secInput = document.getElementById('timer-sec');
    const startTimerBtn = document.getElementById('start-timer-btn');
    const pauseTimerBtn = document.getElementById('pause-timer-btn');
    const resetTimerBtn = document.getElementById('reset-timer-btn');
    const modal = document.getElementById('notification-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const timerSound = document.getElementById('timer-sound');

    function updateTimerDisplay(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        timerDisplay.textContent = `${m}:${s}`;
        
        if (seconds <= 10 && seconds > 0) {
            timerDisplay.classList.add('danger');
        } else {
            timerDisplay.classList.remove('danger');
        }
    }

    startTimerBtn.addEventListener('click', () => {
        if (timerInterval) return; // 已經在計時
        const m = parseInt(minInput.value) || 0;
        const s = parseInt(secInput.value) || 0;
        
        if (totalSeconds === 0) {
            totalSeconds = m * 60 + s;
        }

        if (totalSeconds <= 0) return;

        updateTimerDisplay(totalSeconds);
        
        timerInterval = setInterval(() => {
            totalSeconds--;
            updateTimerDisplay(totalSeconds);
            
            if (totalSeconds <= 0) {
                clearInterval(timerInterval);
                timerInterval = null;
                timerDisplay.classList.remove('danger');
                modal.classList.add('show');
                timerSound.play().catch(e => console.log("Audio play failed:", e));
            }
        }, 1000);
    });

    pauseTimerBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
    });

    resetTimerBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        totalSeconds = 0;
        const m = parseInt(minInput.value) || 0;
        const s = parseInt(secInput.value) || 0;
        updateTimerDisplay(m * 60 + s);
        timerDisplay.classList.remove('danger');
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // 初始顯示
    minInput.addEventListener('input', () => { if(!timerInterval) { totalSeconds=0; updateTimerDisplay((parseInt(minInput.value)||0)*60 + (parseInt(secInput.value)||0)); }});
    secInput.addEventListener('input', () => { if(!timerInterval) { totalSeconds=0; updateTimerDisplay((parseInt(minInput.value)||0)*60 + (parseInt(secInput.value)||0)); }});

    // --- 3. YouTube 影片播放 ---
    const ytUrlInput = document.getElementById('yt-url');
    const loadYtBtn = document.getElementById('load-yt-btn');
    const ytIframe = document.getElementById('yt-iframe');
    const ytPlaceholder = document.getElementById('yt-placeholder');

    function extractVideoID(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    loadYtBtn.addEventListener('click', () => {
        const url = ytUrlInput.value.trim();
        const videoID = extractVideoID(url);
        if (videoID) {
            ytIframe.src = `https://www.youtube.com/embed/${videoID}?autoplay=1`;
            ytPlaceholder.style.display = 'none';
        } else {
            alert('無法解析 YouTube 網址，請確認格式是否正確。');
        }
    });

    // --- 4. 隨機抽號碼機 ---
    const randStart = document.getElementById('rand-start');
    const randEnd = document.getElementById('rand-end');
    const randCount = document.getElementById('rand-count');
    const randExclude = document.getElementById('rand-exclude');
    const randNorepeat = document.getElementById('rand-norepeat');
    const drawBtn = document.getElementById('draw-btn');
    const clearDrawnBtn = document.getElementById('clear-drawn-btn');
    const drawnResult = document.getElementById('drawn-result');
    const drawnHistoryList = document.getElementById('drawn-history-list');

    let drawnNumbers = [];

    drawBtn.addEventListener('click', () => {
        const start = parseInt(randStart.value);
        const end = parseInt(randEnd.value);
        const count = parseInt(randCount.value);
        
        if (isNaN(start) || isNaN(end) || start > end || count <= 0) {
            alert('設定數值錯誤！請確保起始值小於或等於結束值，且抽取數量大於0。');
            return;
        }

        const excludes = randExclude.value.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        
        let pool = [];
        for (let i = start; i <= end; i++) {
            if (!excludes.includes(i)) {
                if (randNorepeat.checked) {
                    if (!drawnNumbers.includes(i)) pool.push(i);
                } else {
                    pool.push(i);
                }
            }
        }

        if (pool.length === 0) {
            alert('號碼池已空！(所有號碼皆被排除或已抽出)');
            return;
        }
        if (pool.length < count) {
            alert(`號碼池只剩 ${pool.length} 個號碼，無法一次抽出 ${count} 個。`);
            return;
        }

        // 抽籤動畫
        drawnResult.innerHTML = '<span class="placeholder-text">🎲 抽取中...</span>';
        drawnResult.classList.add('draw-animation');
        
        setTimeout(() => {
            drawnResult.classList.remove('draw-animation');
            
            // 洗牌抽號碼
            let results = [];
            for (let i = 0; i < count; i++) {
                const randIndex = Math.floor(Math.random() * pool.length);
                const drawn = pool.splice(randIndex, 1)[0];
                results.push(drawn);
                drawnNumbers.push(drawn);
            }

            // 顯示結果
            drawnResult.innerHTML = results.map(n => `<span class="number-pop">${n}</span>`).join(' <span style="color:#64748b; font-size: 2rem;">,</span> ');
            
            // 更新歷史
            updateDrawnHistory();
        }, 600);
    });

    clearDrawnBtn.addEventListener('click', () => {
        drawnNumbers = [];
        updateDrawnHistory();
        drawnResult.innerHTML = '<span class="placeholder-text">等待抽取...</span>';
    });

    function updateDrawnHistory() {
        drawnHistoryList.innerHTML = drawnNumbers.map(n => `<span class="history-item">${n}</span>`).join('');
    }

    // --- 5. Firebase 即時互動 (模擬與整合) ---
    // 透過下方設定區域可以真正連接 Firebase
    
    const reactionBtns = document.querySelectorAll('.reaction-btn');
    const floatContainer = document.getElementById('floating-animations');
    
    // 本地備用計數器
    const localCounts = { like: 0, star: 0, rocket: 0 };
    
    // 檢查全域變數 database (由使用者在 Firebase 設定中建立)
    let isFirebaseReady = false;

    // 將暴露在外層供呼叫的初始化函式
    window.initFirebaseReactions = function(db) {
        isFirebaseReady = true;
        
        // 監聽總數變化
        db.ref('reactions').on('value', (snapshot) => {
            const data = snapshot.val();
            if(data) {
                document.getElementById('count-like').textContent = data.like || 0;
                document.getElementById('count-star').textContent = data.star || 0;
                document.getElementById('count-rocket').textContent = data.rocket || 0;
            }
        });

        // 監聽別人按下的動畫事件
        db.ref('events').on('child_added', (snapshot) => {
            const event = snapshot.val();
            // 防止自己的點擊重複觸發 (可根據時間或ID過濾，這裡簡化處理)
            if (Date.now() - event.timestamp < 5000) {
                triggerAnimation(event.type, false);
            }
        });
    };

    reactionBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = btn.dataset.type;

            if (isFirebaseReady && window.firebaseDb) {
                // 更新 Firebase 資料庫
                window.firebaseDb.ref('reactions/' + type).transaction(currentValue => {
                    return (currentValue || 0) + 1;
                });
                window.firebaseDb.ref('events').push({ type: type, timestamp: Date.now() });
            } else {
                // 本地模擬
                localCounts[type]++;
                document.getElementById(`count-${type}`).textContent = localCounts[type];
            }

            // 觸發本機動畫
            triggerAnimation(type, true, e.clientX, e.clientY);
        });
    });

    function triggerAnimation(type, isLocalClick, clientX, clientY) {
        let iconStr = '❤️';
        if(type === 'star') iconStr = '⭐';
        if(type === 'rocket') iconStr = '🚀';

        let startX, startY;

        if (isLocalClick && clientX && clientY) {
            startX = clientX;
            startY = clientY;
        } else {
            // 從按鈕的中心發射
            const btn = document.querySelector(`.reaction-btn[data-type="${type}"]`);
            if (btn) {
                const rect = btn.getBoundingClientRect();
                startX = rect.left + rect.width / 2;
                startY = rect.top + rect.height / 2;
            } else {
                startX = window.innerWidth / 2;
                startY = window.innerHeight;
            }
        }

        createFloatingIcon(iconStr, startX, startY);
    }

    function createFloatingIcon(iconStr, startX, startY) {
        const icon = document.createElement('div');
        icon.classList.add('float-icon');
        icon.textContent = iconStr;
        
        // 隨機偏移 X 軸
        const offsetX = (Math.random() - 0.5) * 60;
        
        icon.style.left = `${startX + offsetX}px`;
        icon.style.top = `${startY}px`;
        
        floatContainer.appendChild(icon);
        
        // 動畫結束後移除
        setTimeout(() => {
            icon.remove();
        }, 2000);
    }
});
