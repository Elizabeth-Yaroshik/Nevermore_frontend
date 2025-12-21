// Search/search.js
class SearchEngine {
    constructor() {
        console.log('🔧 SearchEngine инициализируется');
        this.searchAPI = window.SearchAPI;
        this.debounceTimer = null;
        this.currentQuery = '';
        this.isLoading = false;
        
        this.init();
    }

    init() {
        console.log('🔧 Инициализация поискового движка');
        
        // Находим все поисковые строки
        this.searchInputs = document.querySelectorAll('.search-bar input, input[type="search"]');
        console.log(`🔍 Найдено ${this.searchInputs.length} поисковых полей`);
        
        if (this.searchInputs.length === 0) {
            console.log('⚠️ Поисковые поля не найдены, создаю глобальную кнопку поиска');
            //this.setupGlobalSearch();
        } else {
            this.setupSearchInputs();
            this.setupHeaderIntegration();
            //this.setupGlobalSearch();
        }
        
        
        console.log('✅ SearchEngine инициализирован');
    }

        // Добавьте в класс SearchEngine
setupHeaderIntegration() {
    console.log('🔧 Интеграция с хедером поиска');
    
    // Ищем поле поиска в хедере
    const headerSearchInput = document.getElementById('headerSearchInput');
    const headerSearchBtn = document.getElementById('headerSearchBtn');
    
    if (headerSearchInput) {
        console.log('✅ Найдено поле поиска в хедере');
        
        // Добавляем в общий список поисковых полей
        this.searchInputs = document.querySelectorAll(
            '.search-bar input, input[type="search"], #headerSearchInput'
        );
        
        // Фокус на поле поиска при нажатии Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                headerSearchInput.focus();
                console.log('⌨️ Фокус на поиске (Ctrl+K)');
            }
            
            // Закрытие подсказок по Escape
            if (e.key === 'Escape') {
                this.hideSuggestions();
            }
        });
        
        // Показываем подсказки при фокусе
        headerSearchInput.addEventListener('focus', () => {
            if (headerSearchInput.value.trim() && window.SearchDemoData) {
                this.showSuggestions(headerSearchInput.value);
            }
        });
        
        // Подсказка о горячих клавишах
        headerSearchInput.setAttribute('title', 'Нажмите Ctrl+K для быстрого доступа к поиску');
    }
    
    if (headerSearchBtn) {
        console.log('✅ Найдена кнопка поиска в хедере');
    }
}
    setupSearchInputs() {
    console.log('🔧 Настройка поисковых полей (кроме хедера)');
    
    // НАСТРАИВАЕМ ТОЛЬКО ОБЫЧНЫЕ ПОЛЯ, НЕ ХЕДЕР
    this.searchInputs = document.querySelectorAll('.search-bar input:not(#headerSearchInput), input[type="search"]:not(#headerSearchInput)');
    
    this.searchInputs.forEach((input, index) => {
        console.log(`🔧 Настройка поискового поля #${index} (не хедер)`);
        
        // Событие отправки (Enter) - ТОЛЬКО ДЛЯ НЕ-ХЕДЕРА
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                console.log('🔍 Enter нажат в обычном поле');
                this.performSearch(e.target.value);
            }
        });
    });
}
    handleInput(query) {
        this.currentQuery = query.trim();
        
        // Очищаем предыдущий таймер
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        // Если запрос пустой - скрываем подсказки
        if (!this.currentQuery) {
            console.log('🔍 Запрос пустой, скрываю подсказки');
            this.hideSuggestions();
            return;
        }

        console.log(`🔍 Ввод: "${this.currentQuery}"`);
        
        // Дебаунс 300ms
        this.debounceTimer = setTimeout(() => {
            this.showSuggestions(this.currentQuery);
        }, 300);
    }

    async showSuggestions(query) {
        if (this.isLoading) return;
        
        try {
            console.log(`🔍 Показ подсказок для: "${query}"`);
            this.isLoading = true;
            
            const results = await this.searchAPI.quickSearch(query);
            
            if (results.suggestions && results.suggestions.length > 0) {
                console.log(`✅ Найдено ${results.suggestions.length} подсказок`);
                this.renderSuggestions(results.suggestions);
            } else {
                console.log('⚠️ Подсказки не найдены');
                this.hideSuggestions();
            }
            
            this.isLoading = false;
        } catch (error) {
            console.error('❌ Ошибка показа подсказок:', error);
            this.isLoading = false;
            this.hideSuggestions();
        }
    }

    renderSuggestions(suggestions) {
        // Удаляем старые подсказки
        this.removeSuggestions();
        
        if (suggestions.length === 0) return;

        // Создаем контейнер для подсказок
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'search-suggestions';
        suggestionsContainer.className = 'search-suggestions';
        
        // Стили для подсказок
        suggestionsContainer.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 5px;
            border: 1px solid #e6e6fa;
        `;

        // Добавляем подсказки
        suggestions.forEach(suggestion => {
            const suggestionItem = this.createSuggestionItem(suggestion);
            suggestionsContainer.appendChild(suggestionItem);
        });

        // Добавляем кнопку "Показать все результаты"
        const showAllItem = document.createElement('div');
        showAllItem.className = 'suggestion-item show-all';
        showAllItem.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 15px; background: #f9f7ff;">
                <span style="color: #6750A4; font-weight: 600;">
                    <i class="fas fa-search"></i> Показать все результаты
                </span>
                <span style="color: #888; font-size: 0.9rem;">Enter</span>
            </div>
        `;
        
        showAllItem.addEventListener('click', () => {
            console.log('🔍 "Показать все" нажато');
            this.performSearch(this.currentQuery);
        });
        
        showAllItem.addEventListener('mouseenter', () => {
            showAllItem.style.background = '#f3e8ff';
        });
        
        showAllItem.addEventListener('mouseleave', () => {
            showAllItem.style.background = '#f9f7ff';
        });
        
        suggestionsContainer.appendChild(showAllItem);

        // Добавляем контейнер к активному полю ввода
        const activeInput = document.activeElement;
        if (activeInput && activeInput.tagName === 'INPUT') {
            const parent = activeInput.closest('.search-bar') || activeInput.parentElement;
            if (parent) {
                parent.style.position = 'relative';
                parent.appendChild(suggestionsContainer);
                console.log('✅ Подсказки отображены');
            }
        }
    }

    createSuggestionItem(suggestion) {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.dataset.type = suggestion.type;
        item.dataset.id = suggestion.id;
        
        let icon = '';
        let content = '';
        let subtitle = '';
        
        switch(suggestion.type) {
            case 'book':
                icon = '<i class="fas fa-book" style="color: #6750A4;"></i>';
                content = suggestion.title || 'Без названия';
                subtitle = suggestion.author ? suggestion.author : '';
                break;
                
            case 'author':
                icon = '<i class="fas fa-user-pen" style="color: #4F378B;"></i>';
                content = suggestion.name || 'Автор';
                subtitle = 'Автор';
                break;
                
            case 'club':
                icon = '<i class="fas fa-users" style="color: #D0BCFF;"></i>';
                content = suggestion.name || 'Клуб';
                subtitle = suggestion.members ? `${suggestion.members} участников` : 'Клуб';
                break;
                
            default:
                icon = '<i class="fas fa-search" style="color: #888;"></i>';
                content = suggestion.text || 'Результат';
        }
        
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; padding: 10px 15px; cursor: pointer;">
                <div style="width: 30px; text-align: center; font-size: 1.1rem;">
                    ${icon}
                </div>
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #2c3e50; font-size: 0.95rem;">
                        ${content}
                    </div>
                    ${subtitle ? `<div style="font-size: 0.85rem; color: #7f8c8d;">${subtitle}</div>` : ''}
                </div>
            </div>
        `;
        
        // Эффекты при наведении
        item.addEventListener('mouseenter', () => {
            item.style.background = '#f9f7ff';
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.background = 'white';
        });
        
        item.addEventListener('click', () => {
            console.log('🔍 Подсказка выбрана:', suggestion);
            this.navigateToSuggestion(suggestion);
        });
        
        return item;
    }

    navigateToSuggestion(suggestion) {
        switch(suggestion.type) {
            case 'book':
                console.log(`📖 Переход к книге ${suggestion.id}`);
                window.location.href = `../Bookpage/book.html?id=${suggestion.id}`;
                break;
            case 'author':
                console.log(`👤 Переход к автору ${suggestion.id}`);
                window.location.href = `../Author/author.html?id=${suggestion.id}`;
                break;
            case 'club':
                console.log(`👥 Переход к клубу ${suggestion.id}`);
                window.location.href = `../Bookclub/club.html?id=${suggestion.id}`;
                break;
            default:
                console.log('🔍 Переход к общим результатам');
                this.performSearch(this.currentQuery);
        }
    }

    removeSuggestions() {
        const existing = document.getElementById('search-suggestions');
        if (existing) {
            existing.remove();
        }
    }

    hideSuggestions() {
        this.removeSuggestions();
    }

    async performSearch(query, filters = {}) {
        const searchQuery = query || this.currentQuery;
        
        if (!searchQuery.trim()) {
            console.log('⚠️ Пустой поисковый запрос');
            this.showToast('error', 'Введите поисковый запрос');
            return;
        }

        console.log(`🔍 Выполнение поиска: "${searchQuery}"`, filters);
        
        // Логирование поиска
        if (window.NevermoreLogger) {
            window.NevermoreLogger.trackSearch(searchQuery);
        }

        // Сохраняем запрос для страницы результатов
        sessionStorage.setItem('lastSearchQuery', searchQuery);
        sessionStorage.setItem('lastSearchFilters', JSON.stringify(filters));

        // Переходим на страницу результатов
        console.log(`🔍 Переход на страницу результатов с запросом: "${searchQuery}"`);
        window.location.href = `../Search/search-results.html?q=${encodeURIComponent(searchQuery)}`;
    }

    openSearchModal() {
        console.log('🔍 Открытие модального окна поиска');
        
        // Создаем модальное окно для расширенного поиска
        const modal = document.createElement('div');
        modal.id = 'advanced-search-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 15px; width: 100%; max-width: 800px; max-height: 90vh; overflow-y: auto;">
                <div style="padding: 30px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                        <h2 style="color: #4F378B; font-size: 1.8rem; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-search"></i> Расширенный поиск
                        </h2>
                        <button id="close-search-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #888; transition: color 0.3s;">&times;</button>
                    </div>
                    
                    <div style="margin-bottom: 25px;">
                        <input type="text" 
                               id="advanced-search-input" 
                               placeholder="Введите запрос для поиска..." 
                               value="${this.currentQuery}"
                               style="width: 100%; padding: 15px; border: 2px solid #e6e6fa; border-radius: 10px; font-size: 1.1rem; transition: border-color 0.3s;">
                    </div>
                    
                    <div id="advanced-filters" style="margin-bottom: 30px;">
                        <div style="text-align: center; padding: 20px; color: #888;">
                            <i class="fas fa-spinner fa-spin"></i> Загрузка фильтров...
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: flex-end;">
                        <button id="cancel-search" style="padding: 12px 25px; background: #f3e8ff; color: #4F378B; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s;">
                            Отмена
                        </button>
                        <button id="perform-advanced-search" style="padding: 12px 25px; background: #6750A4; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; transition: background 0.3s; display: flex; align-items: center; gap: 8px;">
                            <i class="fas fa-search"></i> Искать
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Анимация появления
        modal.style.opacity = '0';
        modal.querySelector('div > div').style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            modal.style.opacity = '1';
            modal.querySelector('div > div').style.transform = 'translateY(0)';
        }, 10);
        
        // Закрытие модального окна
        const closeModal = () => {
            modal.style.opacity = '0';
            modal.querySelector('div > div').style.transform = 'translateY(-20px)';
            setTimeout(() => modal.remove(), 300);
        };
        
        document.getElementById('close-search-modal').addEventListener('click', closeModal);
        document.getElementById('cancel-search').addEventListener('click', closeModal);
        
        // Закрытие по клику на фон
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // Поиск из модального окна
        document.getElementById('perform-advanced-search').addEventListener('click', async () => {
            const query = document.getElementById('advanced-search-input').value;
            const filters = this.getAdvancedFilters();
            
            if (!query.trim()) {
                this.showToast('error', 'Введите поисковый запрос');
                return;
            }
            
            console.log('🔍 Расширенный поиск:', { query, filters });
            closeModal();
            await this.performSearch(query, filters);
        });
        
        // Поиск по Enter
        document.getElementById('advanced-search-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('perform-advanced-search').click();
            }
        });
        
        // Загружаем фильтры
        this.loadAdvancedFilters();
    }

    async loadAdvancedFilters() {
        try {
            const filtersContainer = document.getElementById('advanced-filters');
            if (!filtersContainer) return;
            
            const filters = await this.searchAPI.getFilters();
            
            let filtersHTML = `
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4F378B;">Тип</label>
                        <select id="filter-type" style="width: 100%; padding: 10px; border: 2px solid #e6e6fa; border-radius: 8px;">
                            <option value="all">Все типы</option>
                            <option value="book">Книги</option>
                            <option value="author">Авторы</option>
                            <option value="club">Клубы</option>
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4F378B;">Жанр</label>
                        <select id="filter-genre" style="width: 100%; padding: 10px; border: 2px solid #e6e6fa; border-radius: 8px;">
                            <option value="">Все жанры</option>
                            ${filters.genres.map(genre => 
                                `<option value="${genre.id}">${genre.name} (${genre.count})</option>`
                            ).join('')}
                        </select>
                    </div>
                    
                    <div>
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4F378B;">Год</label>
                        <div style="display: flex; gap: 10px;">
                            <input type="number" id="filter-year-from" placeholder="От" min="${filters.years.min}" max="${filters.years.max}" 
                                   style="flex: 1; padding: 10px; border: 2px solid #e6e6fa; border-radius: 8px;">
                            <input type="number" id="filter-year-to" placeholder="До" min="${filters.years.min}" max="${filters.years.max}" 
                                   style="flex: 1; padding: 10px; border: 2px solid #e6e6fa; border-radius: 8px;">
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #4F378B;">Сортировка</label>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${filters.sortOptions.map(option => 
                            `<label style="display: flex; align-items: center; gap: 5px; padding: 8px 12px; background: #f9f7ff; border-radius: 6px;">
                                <input type="radio" name="sort" value="${option.id}" ${option.id === 'relevance' ? 'checked' : ''}>
                                ${option.name}
                            </label>`
                        ).join('')}
                    </div>
                </div>
            `;
            
            filtersContainer.innerHTML = filtersHTML;
            
        } catch (error) {
            console.error('❌ Ошибка загрузки фильтров:', error);
            filtersContainer.innerHTML = '<p style="color: #e53935; text-align: center;">Не удалось загрузить фильтры</p>';
        }
    }

    getAdvancedFilters() {
        const modal = document.getElementById('advanced-search-modal');
        if (!modal) return {};
        
        return {
            type: modal.querySelector('#filter-type')?.value || 'all',
            genre: modal.querySelector('#filter-genre')?.value || '',
            yearFrom: modal.querySelector('#filter-year-from')?.value || '',
            yearTo: modal.querySelector('#filter-year-to')?.value || '',
            sort: modal.querySelector('input[name="sort"]:checked')?.value || 'relevance'
        };
    }

    showToast(type, message) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        switch (type) {
            case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
            case 'error': icon = '<i class="fas fa-times-circle"></i>'; break;
            case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i>'; break;
            case 'info': icon = '<i class="fas fa-info-circle"></i>'; break;
        }
        
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                ${icon}
                <span>${message}</span>
            </div>
            <button style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: 10px;">&times;</button>
        `;
        
        toastContainer.appendChild(toast);
        
        const closeBtn = toast.querySelector('button');
        closeBtn.addEventListener('click', () => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        });
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }
        }, 4000);
    }
}

// Инициализируем при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, инициализация SearchEngine');
    
    // Проверяем доступность API
    if (!window.SearchAPI) {
        console.error('❌ SearchAPI не найден!');
        return;
    }
    
    console.log('✅ SearchAPI доступен, создаю SearchEngine');
    window.SearchEngine = new SearchEngine();
});

console.log('✅ Search.js загружен');