// Загрузка компонентов страницы
fetch("../menu_samples/header.html")
    .then(r => r.text())
    .then(h => document.getElementById("header").innerHTML = h);

fetch("../menu_samples/sidebar.html")
    .then(r => r.text())
    .then(html => {
        document.getElementById("sidebar").innerHTML = html;
    })
    .catch(err => console.error('Error loading sidebar:', err));

fetch("../menu_samples/mobile-nav.html")
    .then(r => r.text())
    .then(html => {
        document.getElementById("mobile-nav").innerHTML = html;
    })
    .catch(err => console.error('Error loading mobile navigation:', err));

// Хранилище данных
let readingData = {
    currentSession: {
        bookId: null,
        startTime: null,
        elapsedSeconds: 0,
        isActive: false
    },
    books: {},
    dailyStats: {
        today: 0,
        week: 0,
        month: 0
    }
};

// DOM элементы
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startTimer');
const pauseBtn = document.getElementById('pauseTimer');
const resetBtn = document.getElementById('resetTimer');
const bookSelect = document.getElementById('bookSelect');
const readingStatus = document.getElementById('readingStatus');
const bookStats = document.getElementById('bookStats');

// Статистика
const todayTimeEl = document.getElementById('todayTime');
const weekTimeEl = document.getElementById('weekTime');
const monthTimeEl = document.getElementById('monthTime');
const sessionsCountEl = document.getElementById('sessionsCount');
const totalTimeBookEl = document.getElementById('totalTimeBook');
const avgSessionEl = document.getElementById('avgSession');
const lastReadEl = document.getElementById('lastRead');

let timerInterval;
let isRunning = false;

// Загрузка данных из localStorage
function loadReadingData() {
    const saved = localStorage.getItem('readingData');
    if (saved) {
        readingData = JSON.parse(saved);
    }
    updateDailyStats();
}

// Сохранение данных в localStorage
function saveReadingData() {
    localStorage.setItem('readingData', JSON.stringify(readingData));
}

// Форматирование времени
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Обновление отображения таймера
function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(readingData.currentSession.elapsedSeconds);
}

// Обновление статистики за день/неделю/месяц
function updateDailyStats() {
    todayTimeEl.textContent = formatTime(readingData.dailyStats.today || 0);
    weekTimeEl.textContent = formatTime(readingData.dailyStats.week || 0);
    monthTimeEl.textContent = formatTime(readingData.dailyStats.month || 0);
}

// Обновление статистики по книге
function updateBookStats(bookId) {
    const book = readingData.books[bookId];
    if (!book) {
        bookStats.classList.remove('active');
        return;
    }
    
    bookStats.classList.add('active');
    sessionsCountEl.textContent = book.sessions || 0;
    totalTimeBookEl.textContent = formatTime(book.totalTime || 0);
    
    if (book.sessions > 0) {
        avgSessionEl.textContent = formatTime(Math.round(book.totalTime / book.sessions));
    } else {
        avgSessionEl.textContent = "0:00";
    }
    
    lastReadEl.textContent = book.lastRead ? 
        new Date(book.lastRead).toLocaleDateString('ru-RU') : "-";
}

// Старт таймера
function startTimer() {
    if (!readingData.currentSession.bookId) {
        showToast('warning', 'Сначала выберите книгу');
        return;
    }
    
    if (isRunning) return;
    
    isRunning = true;
    readingData.currentSession.isActive = true;
    readingData.currentSession.startTime = new Date();
    
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    readingStatus.innerHTML = `<i class="fas fa-book-reader"></i> Читаю: ${bookSelect.options[bookSelect.selectedIndex].text}`;
    readingStatus.style.background = "#dcfce7";
    readingStatus.style.color = "#166534";
    
    timerInterval = setInterval(() => {
        readingData.currentSession.elapsedSeconds++;
        updateTimerDisplay();
        
        // Автосохранение каждые 30 секунд
        if (readingData.currentSession.elapsedSeconds % 30 === 0) {
            saveSessionTime();
        }
    }, 1000);
}

// Пауза таймера
function pauseTimer() {
    if (!isRunning) return;
    
    clearInterval(timerInterval);
    isRunning = false;
    readingData.currentSession.isActive = false;
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    readingStatus.innerHTML = `<i class="fas fa-pause"></i> Пауза: ${bookSelect.options[bookSelect.selectedIndex].text}`;
    readingStatus.style.background = "#fef3c7";
    readingStatus.style.color = "#92400e";
    
    saveSessionTime();
}

// Сброс текущей сессии
function resetTimer() {
    clearInterval(timerInterval);
    isRunning = false;
    
    // Сохраняем текущее время чтения перед сбросом
    if (readingData.currentSession.elapsedSeconds > 0) {
        saveSessionTime(true);
    }
    
    // Сбрасываем сессию
    readingData.currentSession = {
        bookId: readingData.currentSession.bookId,
        startTime: null,
        elapsedSeconds: 0,
        isActive: false
    };
    
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    updateTimerDisplay();
    
    if (readingData.currentSession.bookId) {
        readingStatus.innerHTML = `<i class="fas fa-book"></i> Готово к чтению: ${bookSelect.options[bookSelect.selectedIndex].text}`;
        readingStatus.style.background = "#f0f9ff";
        readingStatus.style.color = "#0369a1";
    } else {
        readingStatus.innerHTML = `<i class="fas fa-book"></i> Выберите книку для начала отслеживания`;
        readingStatus.style.background = "#f0f9ff";
        readingStatus.style.color = "#0369a1";
    }
}

// Сохранение времени сессии
function saveSessionTime(isFinal = false) {
    const bookId = readingData.currentSession.bookId;
    if (!bookId) return;
    
    const elapsed = readingData.currentSession.elapsedSeconds;
    if (elapsed === 0) return;
    
    // Инициализация книги в данных
    if (!readingData.books[bookId]) {
        readingData.books[bookId] = {
            totalTime: 0,
            sessions: 0,
            lastRead: null
        };
    }
    
    // Добавляем время к общей статистике
    readingData.books[bookId].totalTime += elapsed;
    
    // Если это финальное сохранение (сброс или смена книги), увеличиваем счетчик сессий
    if (isFinal) {
        readingData.books[bookId].sessions = (readingData.books[bookId].sessions || 0) + 1;
        readingData.books[bookId].lastRead = new Date().toISOString();
    }
    
    // Обновляем дневную статистику
    const now = new Date();
    const today = now.toDateString();
    
    // Простая логика для демонстрации
    readingData.dailyStats.today = (readingData.dailyStats.today || 0) + elapsed;
    readingData.dailyStats.week = (readingData.dailyStats.week || 0) + elapsed;
    readingData.dailyStats.month = (readingData.dailyStats.month || 0) + elapsed;
    
    // Обновляем отображение
    updateDailyStats();
    updateBookStats(bookId);
    
    // Сохраняем в localStorage
    saveReadingData();
    
    // Сбрасываем elapsedSeconds после сохранения
    if (isFinal) {
        readingData.currentSession.elapsedSeconds = 0;
    }
    
    showToast('success', `Добавлено ${formatTime(elapsed)} к времени чтения`);
}

// Обработчик выбора книги
bookSelect.addEventListener('change', function() {
    const bookId = this.value;
    const bookName = this.options[this.selectedIndex].text;
    
    if (!bookId) {
        // Если выбрана пустая опция
        readingStatus.innerHTML = `<i class="fas fa-book"></i> Выберите книку для начала отслеживания`;
        readingStatus.style.background = "#f0f9ff";
        readingStatus.style.color = "#0369a1";
        bookStats.classList.remove('active');
        return;
    }
    
    // Сохраняем предыдущую сессию если была
    if (readingData.currentSession.bookId && readingData.currentSession.bookId !== bookId) {
        saveSessionTime(true);
        resetTimer();
    }
    
    // Устанавливаем новую книгу
    readingData.currentSession.bookId = bookId;
    readingData.currentSession.elapsedSeconds = 0;
    
    readingStatus.innerHTML = `<i class="fas fa-book"></i> Готово к чтению: ${bookName}`;
    readingStatus.style.background = "#f0f9ff";
    readingStatus.style.color = "#0369a1";
    
    // Обновляем статистику по книге
    updateBookStats(bookId);
    
    // Если книга уже читалась, предлагаем продолжить
    if (readingData.books[bookId]) {
        showToast('info', `Вы уже читали эту книгу ${formatTime(readingData.books[bookId].totalTime)}`);
    }
    
    updateTimerDisplay();
});

// Автосохранение при закрытии вкладки
window.addEventListener('beforeunload', function() {
    if (readingData.currentSession.isActive || readingData.currentSession.elapsedSeconds > 0) {
        saveSessionTime(!readingData.currentSession.isActive);
    }
});

// Функция toast уведомлений
function showToast(type, message) {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let icon = "";
    switch (type) {
        case "success": icon = '<i class="fas fa-check-circle"></i>'; break;
        case "error": icon = '<i class="fas fa-times-circle"></i>'; break;
        case "warning": icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
        case "info": icon = '<i class="fas fa-info-circle"></i>'; break;
    }
    
    toast.innerHTML = `${icon}<span>${message}</span><button>&times;</button>`;
    toastContainer.appendChild(toast);
    
    const closeBtn = toast.querySelector("button");
    closeBtn.addEventListener("click", () => toast.remove());
    
    setTimeout(() => toast.remove(), 4000);
}

// Инициализация
loadReadingData();
updateTimerDisplay();

// Назначаем обработчики кнопок
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);

// Восстанавливаем состояние если страница была перезагружена во время чтения
if (readingData.currentSession.bookId) {
    bookSelect.value = readingData.currentSession.bookId;
    const bookName = bookSelect.options[bookSelect.selectedIndex].text;
    
    if (readingData.currentSession.isActive) {
        // Если было активное чтение, продолжаем
        readingStatus.innerHTML = `<i class="fas fa-book-reader"></i> Читаю: ${bookName}`;
        readingStatus.style.background = "#dcfce7";
        readingStatus.style.color = "#166534";
        startTimer(); // Автоматически продолжаем
    } else {
        readingStatus.innerHTML = `<i class="fas fa-book"></i> Готово к чтению: ${bookName}`;
        readingStatus.style.background = "#f0f9ff";
        readingStatus.style.color = "#0369a1";
    }
    updateBookStats(readingData.currentSession.bookId);
}