/**
 * Специализированный логгер для главной страницы Nevermore
 * Расширяет функциональность глобального логгера
 */
class MainPageLogger {
    constructor() {
        this.pageName = 'main-page';
        this.pageElements = {
            books: '.book-card',
            clubs: '.club-item',
            goals: '#annual-goal',
            timer: '#weekly-reading',
            search: '.search-bar input',
            mobileNav: '.mobile-nav-item'
        };
        
        this.initializeEventTracking();
        this.logPageLoad();
    }
    
    initializeEventTracking() {
        // Отслеживание кликов по книгам
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                this.setupBookTracking();
                this.setupClubTracking();
                this.setupGoalTracking();
                this.setupSearchTracking();
                this.setupMobileNavTracking();
            }, 500); // Даем время на загрузку динамического контента
        });
    }
    
    setupBookTracking() {
        const books = document.querySelectorAll(this.pageElements.books);
        books.forEach((book, index) => {
            book.addEventListener('click', (event) => {
                const bookId = book.getAttribute('data-book-id');
                const bookTitle = book.getAttribute('data-title');
                const bookAuthor = book.getAttribute('data-author');
                
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.trackClick('book-card', `book-${bookId}`, {
                        bookTitle,
                        bookAuthor,
                        position: index + 1,
                        totalBooks: books.length
                    });
                }
            });
        });
    }
    
    setupClubTracking() {
        const clubs = document.querySelectorAll(this.pageElements.clubs);
        clubs.forEach((club, index) => {
            club.addEventListener('click', (event) => {
                const clubId = club.getAttribute('data-club-id');
                const clubName = club.getAttribute('data-club-name');
                
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.trackClick('club-item', `club-${clubId}`, {
                        clubName,
                        position: index + 1,
                        totalClubs: clubs.length
                    });
                }
            });
        });
    }
    
    setupGoalTracking() {
        const goalCard = document.querySelector(this.pageElements.goals);
        const timeCard = document.querySelector(this.pageElements.timer);
        
        if (goalCard) {
            goalCard.addEventListener('click', () => {
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.trackClick('goal-card', 'annual-goal', {
                        goalType: 'annual',
                        action: 'view_stats'
                    });
                }
            });
        }
        
        if (timeCard) {
            timeCard.addEventListener('click', () => {
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.trackClick('time-card', 'weekly-reading', {
                        goalType: 'reading_time',
                        action: 'view_timer'
                    });
                }
            });
        }
    }
    
    setupSearchTracking() {
        const searchInput = document.querySelector(this.pageElements.search);
        if (searchInput) {
            searchInput.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    const query = searchInput.value.trim();
                    
                    if (window.NevermoreLogger) {
                        if (query) {
                            window.NevermoreLogger.trackSearch(query);
                        } else {
                            window.NevermoreLogger.warn('Empty search attempted', {
                                element: 'search-bar'
                            });
                        }
                    }
                }
            });
        }
    }
    
    setupMobileNavTracking() {
        const navItems = document.querySelectorAll(this.pageElements.mobileNav);
        navItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const itemText = item.querySelector('span')?.textContent || `item-${index}`;
                
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.trackClick('mobile-nav-item', `nav-${index}`, {
                        itemText,
                        position: index
                    });
                }
            });
        });
    }
    
    logPageLoad() {
        // Логируем загрузку страницы с метриками производительности
        window.addEventListener('load', () => {
            if (window.NevermoreLogger && performance.timing) {
                const timing = performance.timing;
                const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
                const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart;
                
                window.NevermoreLogger.info('Main page loaded', {
                    pageLoadTime: `${pageLoadTime}ms`,
                    domReadyTime: `${domReadyTime}ms`,
                    page: this.pageName,
                    screenResolution: `${window.screen.width}x${window.screen.height}`,
                    viewport: `${window.innerWidth}x${window.innerHeight}`
                });
            }
        });
    }
    
    // Отслеживание скролла (опционально)
    trackScroll() {
        let lastScrollPosition = 0;
        let scrollDirection = '';
        
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (Math.abs(currentScroll - lastScrollPosition) > 100) {
                scrollDirection = currentScroll > lastScrollPosition ? 'down' : 'up';
                lastScrollPosition = currentScroll;
                
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.debug('Page scroll', {
                        position: currentScroll,
                        direction: scrollDirection,
                        percentage: Math.round((currentScroll / (document.body.scrollHeight - window.innerHeight)) * 100)
                    });
                }
            }
        });
    }
    
    // Отслеживание видимости элементов
    trackElementVisibility() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && window.NevermoreLogger) {
                    window.NevermoreLogger.debug('Element became visible', {
                        elementId: entry.target.id || 'unknown',
                        elementClass: entry.target.className,
                        intersectionRatio: entry.intersectionRatio
                    });
                }
            });
        }, { threshold: 0.5 });
        
        // Наблюдаем за важными элементами
        const importantElements = document.querySelectorAll('.book-card, .club-item, .goal-card, .time-card');
        importantElements.forEach(el => observer.observe(el));
    }
}

// Автоматически инициализируем
document.addEventListener('DOMContentLoaded', () => {
    window.MainPageLogger = new MainPageLogger();
    
    // Опционально: включаем дополнительные трекеры
    if (window.NevermoreLogger?.getConfig()?.debugMode) {
        window.MainPageLogger.trackScroll();
        window.MainPageLogger.trackElementVisibility();
    }
});