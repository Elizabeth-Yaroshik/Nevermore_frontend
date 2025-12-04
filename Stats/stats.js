// Получаем тип страницы из URL
const urlParams = new URLSearchParams(window.location.search);
const pageType = urlParams.get('type') || 'goals';

const statsContent = document.getElementById('stats-content');

if (pageType === 'timer') {
    // Страница таймера
    statsContent.innerHTML = `
        <div class="stat-card">
            <div class="stat-title">Таймер чтения</div>
            <div class="timer-display" id="timerDisplay">00:00:00</div>
            <div class="timer-controls">
                <button id="startTimer">Старт</button>
                <button id="pauseTimer">Пауза</button>
                <button id="resetTimer">Сброс</button>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-title">Время чтения за неделю</div>
            <div class="stat-value">05h:42min</div>
        </div>
    `;
    
    // Логика таймера
    let timerInterval;
    let seconds = 0;
    let isRunning = false;
    
    function updateTimerDisplay() {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        document.getElementById('timerDisplay').textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    document.getElementById('startTimer').addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            timerInterval = setInterval(() => {
                seconds++;
                updateTimerDisplay();
            }, 1000);
        }
    });
    
    document.getElementById('pauseTimer').addEventListener('click', () => {
        if (isRunning) {
            isRunning = false;
            clearInterval(timerInterval);
        }
    });
    
    document.getElementById('resetTimer').addEventListener('click', () => {
        isRunning = false;
        clearInterval(timerInterval);
        seconds = 0;
        updateTimerDisplay();
    });
    
} else {
    // Страница целей
    statsContent.innerHTML = `
        <div class="stat-card">
            <div class="stat-title">Ежегодная цель</div>
            <div class="stat-value">12 книг</div>
            <p>Установите новую цель:</p>
            <input type="number" id="goalInput" value="12" min="1" max="100">
            <button onclick="updateGoal()">Обновить</button>
        </div>
        
        <div class="stat-card">
            <div class="stat-title">Прочитано в этом году</div>
            <div class="stat-value">3 книги</div>
            <p>Прогресс: 25%</p>
        </div>
        
        <div class="stat-card">
            <div class="stat-title">Страниц прочитано</div>
            <div class="stat-value">1,245</div>
        </div>
    `;
}

function updateGoal() {
    const goalInput = document.getElementById('goalInput');
    const newGoal = goalInput.value;
    alert(`Цель обновлена: ${newGoal} книг в год`);
}