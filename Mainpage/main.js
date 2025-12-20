// Логирование: инициализация
if (window.NevermoreLogger) {
    window.NevermoreLogger.info('Main page JavaScript initialized');
}

document.querySelectorAll('.mobile-nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.mobile-nav-item').forEach(el => {
            el.classList.remove('active');
        });
        this.classList.add('active');
        
        // Логируем клик по мобильной навигации
        if (window.NevermoreLogger) {
            const itemText = this.querySelector('span')?.textContent || 'Unknown';
            const itemIndex = Array.from(this.parentNode.children).indexOf(this);
            window.NevermoreLogger.trackClick('mobile-nav-item', `nav-${itemIndex}`, {
                itemText,
                position: itemIndex
            });
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const toastContainer = document.getElementById("toastContainer");

    function showToast(type, message) {
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
        
        // Логируем показ тоста
        if (window.NevermoreLogger) {
            window.NevermoreLogger.info('Toast notification shown', {
                type,
                message,
                duration: '4000ms'
            });
        }
    }

    const searchInput = document.querySelector(".search-bar input");
    searchInput.addEventListener("keydown", e => {
        if (e.key === "Enter") {
            const val = searchInput.value.trim();
            if (!val) {
                showToast("error", "Введите поисковый запрос!");
                
                // Логируем пустой поиск
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.warn('Empty search query submitted', {
                        element: 'search-bar'
                    });
                }
            } else {
                // Логируем успешный поиск
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.trackSearch(val);
                }
            }
        }
    });
    
    // Обработчики для книг с логированием
    document.querySelectorAll('.book-card').forEach(card => {
        card.addEventListener('click', function(event) {
            event.preventDefault();
            
            const bookId = this.getAttribute('data-book-id');
            const bookTitle = this.getAttribute('data-title');
            const bookAuthor = this.getAttribute('data-author');
            
            // Логируем клик по книге
            if (window.NevermoreLogger) {
                const bookIndex = Array.from(document.querySelectorAll('.book-card')).indexOf(this);
                window.NevermoreLogger.trackClick('book-card', `book-${bookId}`, {
                    bookTitle,
                    bookAuthor,
                    position: bookIndex + 1,
                    totalBooks: document.querySelectorAll('.book-card').length
                });
            }
            
            if (bookId) {
                localStorage.setItem('currentBook', JSON.stringify({
                    id: bookId,
                    title: bookTitle,
                    author: bookAuthor
                }));
                
                window.location.href = `../Bookpage/book.html?id=${bookId}`;
            }
        });
    });
    
    // Обработчики для клубов с логированием
    document.querySelectorAll('.club-item').forEach(club => {
        club.addEventListener('click', function(event) {
            event.preventDefault();
            
            const clubId = this.getAttribute('data-club-id');
            const clubName = this.getAttribute('data-club-name');
            
            // Логируем клик по клубу
            if (window.NevermoreLogger) {
                const clubIndex = Array.from(document.querySelectorAll('.club-item')).indexOf(this);
                window.NevermoreLogger.trackClick('club-item', `club-${clubId}`, {
                    clubName,
                    position: clubIndex + 1,
                    totalClubs: document.querySelectorAll('.club-item').length
                });
            }
            
            if (clubId) {
                localStorage.setItem('currentClub', JSON.stringify({
                    id: clubId,
                    name: clubName
                }));
                
                window.location.href = `../Bookclub/club.html?id=${clubId}&name=${encodeURIComponent(clubName)}`;
            }
        });
    });
    
    // Обработчик для цели с логированием
    const annualGoal = document.getElementById('annual-goal');
    if (annualGoal) {
        annualGoal.addEventListener('click', function(event) {
            event.preventDefault();
            // Логируем клик по цели
            if (window.NevermoreLogger) {
                window.NevermoreLogger.trackClick('goal-card', 'annual-goal', {
                    goalType: 'annual',
                    action: 'view_stats'
                });
            }
            window.location.href = `../Stats/stats.html?type=goals`;
        });
    }
    
    // Обработчик для таймера с логированием
    const weeklyReading = document.getElementById('weekly-reading');
    if (weeklyReading) {
        weeklyReading.addEventListener('click', function(event) {
            event.preventDefault();
            // Логируем клик по таймеру
            if (window.NevermoreLogger) {
                window.NevermoreLogger.trackClick('time-card', 'weekly-reading', {
                    goalType: 'reading_time',
                    action: 'view_timer'
                });
            }
            window.location.href = `../Timer/timer.html?type=timer`;
        });
    }
    
    // Логируем загрузку страницы
    if (window.NevermoreLogger) {
        window.addEventListener('load', () => {
            if (performance.timing) {
                const timing = performance.timing;
                const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                window.NevermoreLogger.info('Main page loaded', {
                    pageLoadTime: `${pageLoadTime}ms`,
                    screenResolution: `${window.screen.width}x${window.screen.height}`,
                    viewport: `${window.innerWidth}x${window.innerHeight}`
                });
            }
        });
    }
});