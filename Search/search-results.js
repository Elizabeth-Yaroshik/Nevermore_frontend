// Search/search-results.js
class SearchResultsPage {
    constructor() {
        console.log('🔧 SearchResultsPage инициализируется');
        this.searchAPI = window.SearchAPI;
        this.currentQuery = '';
        this.currentFilters = {};
        this.currentPage = 1;
        this.totalPages = 1;
        this.currentType = 'all';
        this.currentSort = 'relevance';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        console.log('🔧 Инициализация страницы результатов');
        
        // Проверяем доступность API
        if (!this.searchAPI) {
            console.error('❌ SearchAPI не найден!');
            this.showError('Ошибка загрузки поискового модуля');
            return;
        }
        
        this.parseUrlParams();
        this.setupEventListeners();
        this.loadMenuComponents();
        await this.performSearch();
        
        console.log('✅ SearchResultsPage инициализирован');
    }

    loadMenuComponents() {
        console.log('🔧 Загрузка компонентов меню');
        
        // Загружаем стандартные компоненты меню
        Promise.all([
            fetch("../menu_samples/header.html")
                .then(r => r.text())
                .then(h => {
                    document.getElementById("header").innerHTML = h;
                    console.log('✅ Header загружен');
                })
                .catch(err => console.error('❌ Ошибка загрузки header:', err)),
            
            fetch("../menu_samples/sidebar.html")
                .then(r => r.text())
                .then(html => {
                    document.getElementById("sidebar").innerHTML = html;
                    console.log('✅ Sidebar загружен');
                })
                .catch(err => console.error('❌ Ошибка загрузки sidebar:', err)),
            
            fetch("../menu_samples/mobile-nav.html")
                .then(r => r.text())
                .then(html => {
                    document.getElementById("mobile-nav").innerHTML = html;
                    console.log('✅ Mobile nav загружен');
                })
                .catch(err => console.error('❌ Ошибка загрузки mobile navigation:', err))
        ]);
    }

    parseUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Получаем запрос из URL или из sessionStorage
        this.currentQuery = urlParams.get('q') || sessionStorage.getItem('lastSearchQuery') || '';
        this.currentPage = parseInt(urlParams.get('page')) || 1;
        
        // Получаем фильтры из sessionStorage
        const savedFilters = sessionStorage.getItem('lastSearchFilters');
        if (savedFilters) {
            try {
                this.currentFilters = JSON.parse(savedFilters);
            } catch (e) {
                console.error('❌ Ошибка парсинга сохраненных фильтров:', e);
                this.currentFilters = {};
            }
        }
        
        // Извлекаем тип и сортировку из фильтров
        if (this.currentFilters.type && this.currentFilters.type !== 'all') {
            this.currentType = this.currentFilters.type;
        }
        
        if (this.currentFilters.sort) {
            this.currentSort = this.currentFilters.sort;
        }
        
        console.log('📋 Параметры URL:', {
            query: this.currentQuery,
            page: this.currentPage,
            filters: this.currentFilters,
            type: this.currentType,
            sort: this.currentSort
        });
        
        // Обновляем отображение запроса
        this.updateQueryDisplay();
        this.updateFiltersUI();
    }

    updateQueryDisplay() {
        const queryText = document.getElementById('queryText');
        const resultsCount = document.getElementById('resultsCount');
        
        if (queryText && this.currentQuery) {
            queryText.textContent = `"${this.currentQuery}"`;
        }
        
        if (resultsCount) {
            resultsCount.textContent = 'Идет поиск...';
        }
    }

    updateFiltersUI() {
        // Устанавливаем активный тип
        document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
            if (btn.dataset.type === this.currentType) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Устанавливаем сортировку
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.value = this.currentSort;
        }
    }

    setupEventListeners() {
        console.log('🔧 Настройка обработчиков событий');
        
        // Фильтры по типу
        document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.dataset.type;
                console.log(`🔍 Изменен тип фильтра: ${type}`);
                this.setCurrentType(type);
            });
        });

        // Сортировка
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                console.log(`🔍 Изменена сортировка: ${this.currentSort}`);
                this.performSearch();
            });
        }

        // Кнопка уточнить поиск
        const refineBtn = document.getElementById('refineSearchBtn');
        if (refineBtn) {
            refineBtn.addEventListener('click', () => {
                console.log('🔍 Кнопка "Уточнить поиск" нажата');
                this.toggleDetailedFilters();
            });
        }

        // Кнопка расширенного поиска
        const advancedBtn = document.getElementById('advancedSearchBtn');
        if (advancedBtn) {
            advancedBtn.addEventListener('click', () => {
                console.log('🔍 Кнопка "Расширенный поиск" нажата');
                if (window.SearchEngine) {
                    window.SearchEngine.openSearchModal();
                } else {
                    alert('Поисковый движок не загружен');
                }
            });
        }

        // Кнопка закрытия фильтров
        const closeFiltersBtn = document.getElementById('closeFiltersBtn');
        if (closeFiltersBtn) {
            closeFiltersBtn.addEventListener('click', () => {
                console.log('🔍 Кнопка закрытия фильтров нажата');
                this.toggleDetailedFilters(false);
            });
        }

        // Кнопка очистки фильтров
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                console.log('🔍 Кнопка очистки фильтров нажата');
                this.clearAllFilters();
            });
        }

        // Кнопка применения фильтров
        const applyFiltersBtn = document.getElementById('applyFiltersBtn');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                console.log('🔍 Кнопка применения фильтров нажата');
                this.applyDetailedFilters();
                this.toggleDetailedFilters(false);
            });
        }

        // Пагинация
        document.addEventListener('click', (e) => {
            if (e.target.closest('.page-number')) {
                const page = parseInt(e.target.closest('.page-number').dataset.page);
                console.log(`🔍 Переход на страницу ${page}`);
                this.goToPage(page);
            }
            
            if (e.target.closest('.prev-btn')) {
                console.log(`🔍 Предыдущая страница`);
                this.goToPage(this.currentPage - 1);
            }
            
            if (e.target.closest('.next-btn')) {
                console.log(`🔍 Следующая страница`);
                this.goToPage(this.currentPage + 1);
            }
        });
        
        // Закрытие фильтров по клику вне
        document.addEventListener('click', (e) => {
            const filtersPanel = document.getElementById('detailedFilters');
            const refineBtn = document.getElementById('refineSearchBtn');
            
            if (filtersPanel && filtersPanel.classList.contains('active') && 
                !filtersPanel.contains(e.target) && 
                !refineBtn.contains(e.target)) {
                this.toggleDetailedFilters(false);
            }
        });

        // Обработка нажатия Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const filtersPanel = document.getElementById('detailedFilters');
                if (filtersPanel && filtersPanel.classList.contains('active')) {
                    this.toggleDetailedFilters(false);
                }
            }
        });

        console.log('✅ Обработчики событий настроены');
    }

    setCurrentType(type) {
        if (this.currentType === type) return;
        
        this.currentType = type;
        console.log(`🔍 Установлен тип поиска: ${type}`);
        
        // Обновляем активные кнопки
        document.querySelectorAll('.filter-btn[data-type]').forEach(btn => {
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Сбрасываем на первую страницу при изменении типа
        this.currentPage = 1;
        
        this.performSearch();
    }

    async performSearch() {
        if (this.isLoading) return;
        
        if (!this.currentQuery.trim()) {
            console.log('⚠️ Пустой поисковый запрос');
            this.showNoResults();
            return;
        }

        console.log(`🔍 Выполнение поиска: "${this.currentQuery}"`, {
            page: this.currentPage,
            type: this.currentType,
            sort: this.currentSort,
            filters: this.currentFilters
        });

        this.showLoading();
        this.isLoading = true;
        
        try {
            // Собираем все фильтры
            const filters = {
                ...this.currentFilters,
                type: this.currentType !== 'all' ? this.currentType : undefined,
                sort: this.currentSort
            };

            console.log('📤 Отправка запроса поиска:', { 
                query: this.currentQuery, 
                filters,
                page: this.currentPage 
            });
            
            // Выполняем поиск через API
            const results = await this.searchAPI.search(
                this.currentQuery, 
                filters, 
                { page: this.currentPage, limit: 9 }
            );
            
            console.log('✅ Получены результаты:', results);
            
            if (results && results.data) {
                this.renderResults(results);
            } else {
                console.log('⚠️ Нет результатов');
                this.showNoResults();
            }
            
        } catch (error) {
            console.error('❌ Ошибка при выполнении поиска:', error);
            this.showError('Ошибка при выполнении поиска. Попробуйте еще раз.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    renderResults(results) {
        const resultsGrid = document.getElementById('resultsGrid');
        const resultsCount = document.getElementById('resultsCount');
        const pagination = document.getElementById('pagination');
        
        if (!resultsGrid) return;
        
        // Обновляем количество результатов
        if (resultsCount) {
            const total = results.total || 0;
            resultsCount.textContent = `Найдено: ${total}`;
            console.log(`✅ Найдено результатов: ${total}`);
        }
        
        // Очищаем сетку
        resultsGrid.innerHTML = '';
        
        if (!results.data || results.data.length === 0) {
            console.log('⚠️ Нет данных для отображения');
            this.showNoResults();
            return;
        }
        
        // Скрываем сообщение "Нет результатов"
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = 'none';
        }
        
        // Рендерим каждый результат
        results.data.forEach((item, index) => {
            console.log(`🖼️ Рендеринг результата ${index + 1}:`, item.title || item.name);
            const resultItem = this.createResultItem(item);
            resultsGrid.appendChild(resultItem);
        });
        
        // Обновляем пагинацию
        if (results.totalPages > 1) {
            this.totalPages = results.totalPages;
            this.renderPagination();
            if (pagination) {
                pagination.style.display = 'flex';
            }
        } else {
            if (pagination) {
                pagination.style.display = 'none';
            }
        }
        
        // Обновляем активные фильтры
        this.updateActiveFilters();
        
        console.log(`✅ Отображено ${results.data.length} результатов`);
    }

    createResultItem(item) {
        const div = document.createElement('div');
        div.className = 'result-item';
        div.dataset.type = item.type;
        div.dataset.id = item.id;
        
        let icon = '';
        let iconClass = '';
        let title = '';
        let subtitle = '';
        let description = '';
        let meta = '';
        let actions = '';
        
        switch(item.type) {
            case 'book':
                icon = '<i class="fas fa-book"></i>';
                iconClass = 'book';
                title = item.title || 'Без названия';
                subtitle = item.author ? `Автор: ${item.author}` : '';
                description = item.description || 'Описание отсутствует';
                meta = `
                    <span><i class="fas fa-calendar"></i> ${item.year || '—'}</span>
                    <span><i class="fas fa-star"></i> ${item.rating || '—'}</span>
                    <span><i class="fas fa-tag"></i> ${this.getGenreName(item.genre)}</span>
                `;
                actions = `
                    <button class="btn-view" onclick="event.stopPropagation(); window.location.href='../Bookpage/book.html?id=${item.id}'">
                        <i class="fas fa-eye"></i> Читать
                    </button>
                    <button class="btn-save ${item.saved ? 'saved' : ''}" onclick="event.stopPropagation(); toggleSaveBook(${item.id}, this)">
                        ${item.saved ? 
                            '<i class="fas fa-bookmark"></i> Сохранено' : 
                            '<i class="far fa-bookmark"></i> Сохранить'}
                    </button>
                `;
                break;
                
            case 'author':
                icon = '<i class="fas fa-user-pen"></i>';
                iconClass = 'author';
                title = item.name || 'Автор';
                subtitle = item.genre ? `Жанр: ${item.genre}` : '';
                description = item.description || 'Информация об авторе отсутствует';
                meta = `
                    <span><i class="fas fa-book"></i> ${item.booksCount || 0} книг</span>
                    <span><i class="fas fa-users"></i> ${item.followers || 0} подписчиков</span>
                `;
                actions = `
                    <button class="btn-view" onclick="event.stopPropagation(); window.location.href='../Author/author.html?id=${item.id}'">
                        <i class="fas fa-eye"></i> Профиль
                    </button>
                    <button class="btn-save ${item.saved ? 'saved' : ''}" onclick="event.stopPropagation(); toggleSaveAuthor(${item.id}, this)">
                        ${item.saved ? 
                            '<i class="fas fa-bookmark"></i> Сохранено' : 
                            '<i class="far fa-bookmark"></i> Сохранить'}
                    </button>
                `;
                break;
                
            case 'club':
                icon = '<i class="fas fa-users"></i>';
                iconClass = 'club';
                title = item.name || 'Клуб';
                subtitle = `${item.members || 0} участников`;
                description = item.description || 'Описание клуба отсутствует';
                meta = `
                    <span><i class="fas fa-comments"></i> ${item.activity || '—'}</span>
                    <span><i class="fas fa-tag"></i> ${item.tags ? item.tags.slice(0, 2).join(', ') : '—'}</span>
                `;
                actions = `
                    <button class="btn-view" onclick="event.stopPropagation(); window.location.href='../Bookclub/club.html?id=${item.id}'">
                        <i class="fas fa-eye"></i> Войти
                    </button>
                    <button class="btn-save ${item.joined ? 'saved' : ''}" onclick="event.stopPropagation(); toggleJoinClub(${item.id}, this)">
                        ${item.joined ? 
                            '<i class="fas fa-user-check"></i> Вы в клубе' : 
                            '<i class="fas fa-user-plus"></i> Вступить'}
                    </button>
                `;
                break;
        }
        
        div.innerHTML = `
            <div class="result-header">
                <div class="result-icon ${iconClass}">
                    ${icon}
                </div>
                <div class="result-info">
                    <div class="result-title" title="${title}">${title}</div>
                    ${subtitle ? `<div class="result-subtitle" title="${subtitle}">${subtitle}</div>` : ''}
                </div>
            </div>
            
            <div class="result-body">
                <p class="result-description" title="${description}">${description}</p>
                <div class="result-meta">
                    ${meta}
                </div>
            </div>
            
            <div class="result-footer">
                <div class="result-type">
                    <span style="background: #f3e8ff; color: #4F378B; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600;">
                        ${this.getTypeLabel(item.type)}
                    </span>
                </div>
                <div class="result-actions">
                    ${actions}
                </div>
            </div>
        `;
        
        // Добавляем обработчик клика на всю карточку
        div.addEventListener('click', (e) => {
            // Если клик не по кнопке
            if (!e.target.closest('button')) {
                this.navigateToItem(item);
            }
        });
        
        // Эффекты при наведении
        div.addEventListener('mouseenter', () => {
            div.style.transform = 'translateY(-5px)';
            div.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
        });
        
        div.addEventListener('mouseleave', () => {
            div.style.transform = 'translateY(0)';
            div.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.05)';
        });
        
        return div;
    }

    getGenreName(genreId) {
        const genres = {
            'classic': 'Классика',
            'fantasy': 'Фэнтези',
            'scifi': 'Научная фантастика',
            'drama': 'Драма',
            'romance': 'Роман',
            'detective': 'Детектив'
        };
        return genres[genreId] || genreId;
    }

    getTypeLabel(type) {
        const labels = {
            'book': 'Книга',
            'author': 'Автор',
            'club': 'Клуб'
        };
        return labels[type] || 'Другое';
    }

    navigateToItem(item) {
        console.log(`🔗 Переход к элементу: ${item.type} ${item.id}`);
        
        switch(item.type) {
            case 'book':
                window.location.href = `../Bookpage/book.html?id=${item.id}`;
                break;
            case 'author':
                window.location.href = `../Author/author.html?id=${item.id}`;
                break;
            case 'club':
                window.location.href = `../Bookclub/club.html?id=${item.id}`;
                break;
        }
    }

    renderPagination() {
        const pageNumbers = document.getElementById('pageNumbers');
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (!pageNumbers) return;
        
        console.log(`📄 Рендеринг пагинации: страница ${this.currentPage} из ${this.totalPages}`);
        
        // Очищаем старые номера
        pageNumbers.innerHTML = '';
        
        // Определяем диапазон страниц для отображения
        let startPage = Math.max(1, this.currentPage - 2);
        let endPage = Math.min(this.totalPages, this.currentPage + 2);
        
        // Добавляем первую страницу и многоточие если нужно
        if (startPage > 1) {
            pageNumbers.appendChild(this.createPageNumber(1));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.cssText = 'display: flex; align-items: center; padding: 0 5px; color: #888;';
                pageNumbers.appendChild(ellipsis);
            }
        }
        
        // Добавляем страницы в диапазоне
        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.appendChild(this.createPageNumber(i));
        }
        
        // Добавляем последнюю страницу и многоточие если нужно
        if (endPage < this.totalPages) {
            if (endPage < this.totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.style.cssText = 'display: flex; align-items: center; padding: 0 5px; color: #888;';
                pageNumbers.appendChild(ellipsis);
            }
            pageNumbers.appendChild(this.createPageNumber(this.totalPages));
        }
        
        // Обновляем состояние кнопок
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
            prevBtn.style.opacity = this.currentPage === 1 ? '0.5' : '1';
            prevBtn.style.cursor = this.currentPage === 1 ? 'not-allowed' : 'pointer';
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === this.totalPages;
            nextBtn.style.opacity = this.currentPage === this.totalPages ? '0.5' : '1';
            nextBtn.style.cursor = this.currentPage === this.totalPages ? 'not-allowed' : 'pointer';
        }
    }

    createPageNumber(page) {
        const span = document.createElement('span');
        span.className = 'page-number';
        span.dataset.page = page;
        span.textContent = page;
        
        if (page === this.currentPage) {
            span.classList.add('active');
        }
        
        span.addEventListener('mouseenter', () => {
            if (!span.classList.contains('active')) {
                span.style.background = '#f3e8ff';
                span.style.borderColor = '#D0BCFF';
            }
        });
        
        span.addEventListener('mouseleave', () => {
            if (!span.classList.contains('active')) {
                span.style.background = '';
                span.style.borderColor = '';
            }
        });
        
        return span;
    }

    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return;
        }
        
        console.log(`📄 Переход на страницу ${page}`);
        this.currentPage = page;
        
        // Обновляем URL без перезагрузки страницы
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
        
        this.performSearch();
        
        // Прокручиваем к верху
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    showLoading() {
        const loading = document.getElementById('resultsLoading');
        const resultsGrid = document.getElementById('resultsGrid');
        const noResults = document.getElementById('noResults');
        const pagination = document.getElementById('pagination');
        
        if (loading) {
            loading.style.display = 'block';
            loading.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p>Идет поиск по запросу: "${this.currentQuery}"...</p>
            `;
        }
        if (resultsGrid) resultsGrid.innerHTML = '';
        if (noResults) noResults.style.display = 'none';
        if (pagination) pagination.style.display = 'none';
        
        console.log('⏳ Показываю индикатор загрузки');
    }

    hideLoading() {
        const loading = document.getElementById('resultsLoading');
        if (loading) {
            loading.style.display = 'none';
        }
        console.log('✅ Скрываю индикатор загрузки');
    }

    showNoResults() {
        this.hideLoading();
        
        const resultsGrid = document.getElementById('resultsGrid');
        const noResults = document.getElementById('noResults');
        const pagination = document.getElementById('pagination');
        const resultsCount = document.getElementById('resultsCount');
        
        if (resultsGrid) resultsGrid.innerHTML = '';
        if (noResults) {
            noResults.style.display = 'block';
            noResults.querySelector('h3').textContent = `По запросу "${this.currentQuery}" ничего не найдено`;
        }
        if (pagination) pagination.style.display = 'none';
        if (resultsCount) resultsCount.textContent = 'Найдено: 0';
        
        console.log('⚠️ Показываю сообщение "Нет результатов"');
    }

    showError(message) {
        this.hideLoading();
        
        const resultsGrid = document.getElementById('resultsGrid');
        if (resultsGrid) {
            resultsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="color: #e53935; font-size: 3rem; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 style="color: #4F378B; margin-bottom: 10px;">Ошибка</h3>
                    <p style="color: #666; margin-bottom: 20px;">${message}</p>
                    <button onclick="window.location.reload()" style="padding: 10px 20px; background: #6750A4; color: white; border: none; border-radius: 8px; cursor: pointer; transition: background 0.3s;">
                        <i class="fas fa-redo"></i> Попробовать снова
                    </button>
                </div>
            `;
        }
        
        console.error('❌ Показываю сообщение об ошибке:', message);
    }

    toggleDetailedFilters(show) {
        const filtersPanel = document.getElementById('detailedFilters');
        if (!filtersPanel) return;
        
        if (show === undefined) {
            show = !filtersPanel.classList.contains('active');
        }
        
        if (show) {
            filtersPanel.classList.add('active');
            document.body.style.overflow = 'hidden'; // Блокируем скролл
            this.loadDetailedFilters();
            console.log('📋 Панель фильтров открыта');
        } else {
            filtersPanel.classList.remove('active');
            document.body.style.overflow = ''; // Разблокируем скролл
            console.log('📋 Панель фильтров закрыта');
        }
    }

    async loadDetailedFilters() {
        const filtersBody = document.querySelector('.filters-body');
        if (!filtersBody) return;
        
        try {
            console.log('📋 Загрузка детальных фильтров');
            filtersBody.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #888;">
                    <i class="fas fa-spinner fa-spin"></i> Загрузка фильтров...
                </div>
            `;
            
            const filters = await this.searchAPI.getFilters();
            
            console.log('✅ Фильтры загружены:', filters);
            
            filtersBody.innerHTML = `
                <div class="filter-section">
                    <h4><i class="fas fa-tag"></i> Жанр</h4>
                    <div class="filter-options" id="genreFilters">
                        ${filters.genres.map(genre => `
                            <div class="filter-option">
                                <input type="checkbox" id="filter-genre-${genre.id}" value="${genre.id}" 
                                       ${this.currentFilters.genre && this.currentFilters.genre.includes(genre.id) ? 'checked' : ''}>
                                <label for="filter-genre-${genre.id}">${genre.name}</label>
                                <span class="filter-count">${genre.count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4><i class="fas fa-calendar"></i> Год издания</h4>
                    <div class="filter-options">
                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <input type="number" id="filter-year-from" placeholder="От" 
                                   value="${this.currentFilters.yearFrom || ''}" 
                                   min="${filters.years.min}" max="${filters.years.max}"
                                   style="flex: 1; padding: 8px; border: 2px solid #e6e6fa; border-radius: 6px;">
                            <input type="number" id="filter-year-to" placeholder="До" 
                                   value="${this.currentFilters.yearTo || ''}" 
                                   min="${filters.years.min}" max="${filters.years.max}"
                                   style="flex: 1; padding: 8px; border: 2px solid #e6e6fa; border-radius: 6px;">
                        </div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4><i class="fas fa-star"></i> Рейтинг</h4>
                    <div class="filter-options">
                        <div class="filter-option">
                            <input type="checkbox" id="filter-rating-4" value="4" ${this.currentFilters.minRating >= 4 ? 'checked' : ''}>
                            <label for="filter-rating-4">4+ звезды и выше</label>
                        </div>
                        <div class="filter-option">
                            <input type="checkbox" id="filter-rating-3" value="3" ${this.currentFilters.minRating >= 3 ? 'checked' : ''}>
                            <label for="filter-rating-3">3+ звезды и выше</label>
                        </div>
                    </div>
                </div>
                
                <div class="filter-section">
                    <h4><i class="fas fa-language"></i> Язык</h4>
                    <div class="filter-options">
                        ${filters.languages.map((lang, index) => `
                            <div class="filter-option">
                                <input type="checkbox" id="filter-lang-${index}" value="${lang}">
                                <label for="filter-lang-${index}">${lang}</label>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
        } catch (error) {
            console.error('❌ Ошибка загрузки детальных фильтров:', error);
            filtersBody.innerHTML = `
                <div style="text-align: center; padding: 30px; color: #e53935;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Не удалось загрузить фильтры</p>
                    <button onclick="window.SearchResultsPage.loadDetailedFilters()" style="padding: 8px 15px; background: #f3e8ff; color: #4F378B; border: none; border-radius: 6px; cursor: pointer; margin-top: 10px;">
                        Попробовать снова
                    </button>
                </div>
            `;
        }
    }

    applyDetailedFilters() {
        console.log('📋 Применение детальных фильтров');
        
        const filters = {};
        
        // Жанры
        const genreCheckboxes = document.querySelectorAll('#genreFilters input[type="checkbox"]:checked');
        if (genreCheckboxes.length > 0) {
            filters.genre = Array.from(genreCheckboxes).map(cb => cb.value);
        }
        
        // Год
        const yearFrom = document.getElementById('filter-year-from')?.value;
        const yearTo = document.getElementById('filter-year-to')?.value;
        
        if (yearFrom) filters.yearFrom = parseInt(yearFrom);
        if (yearTo) filters.yearTo = parseInt(yearTo);
        
        // Рейтинг
        const ratingCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="filter-rating-"]:checked');
        if (ratingCheckboxes.length > 0) {
            const ratings = Array.from(ratingCheckboxes).map(cb => parseInt(cb.value));
            filters.minRating = Math.max(...ratings);
        }
        
        // Язык
        const langCheckboxes = document.querySelectorAll('input[type="checkbox"][id^="filter-lang-"]:checked');
        if (langCheckboxes.length > 0) {
            filters.languages = Array.from(langCheckboxes).map(cb => cb.value);
        }
        
        console.log('📋 Применены фильтры:', filters);
        
        // Сохраняем фильтры
        this.currentFilters = filters;
        sessionStorage.setItem('lastSearchFilters', JSON.stringify(filters));
        
        // Сбрасываем на первую страницу
        this.currentPage = 1;
        
        // Выполняем поиск
        this.performSearch();
    }

    clearAllFilters() {
        console.log('🗑️ Очистка всех фильтров');
        
        this.currentFilters = {};
        this.currentType = 'all';
        this.currentSort = 'relevance';
        this.currentPage = 1;
        
        sessionStorage.removeItem('lastSearchFilters');
        
        // Обновляем UI
        this.updateFiltersUI();
        
        // Выполняем поиск
        this.performSearch();
        
        // Закрываем панель фильтров
        this.toggleDetailedFilters(false);
    }

    updateActiveFilters() {
        const activeFiltersContainer = document.getElementById('activeFilters');
        if (!activeFiltersContainer) return;
        
        activeFiltersContainer.innerHTML = '';
        
        if (Object.keys(this.currentFilters).length === 0) {
            return;
        }
        
        console.log('📋 Обновление активных фильтров:', this.currentFilters);
        
        // Добавляем фильтры
        if (this.currentFilters.genre && this.currentFilters.genre.length > 0) {
            const filterDiv = document.createElement('div');
            filterDiv.className = 'active-filter';
            filterDiv.innerHTML = `
                <i class="fas fa-tag"></i>
                <span>Жанр: ${this.currentFilters.genre.join(', ')}</span>
                <button class="remove-filter" data-filter="genre">&times;</button>
            `;
            activeFiltersContainer.appendChild(filterDiv);
        }
        
        if (this.currentFilters.yearFrom || this.currentFilters.yearTo) {
            const filterDiv = document.createElement('div');
            filterDiv.className = 'active-filter';
            const yearText = `${this.currentFilters.yearFrom || ''} - ${this.currentFilters.yearTo || ''}`;
            filterDiv.innerHTML = `
                <i class="fas fa-calendar"></i>
                <span>Год: ${yearText}</span>
                <button class="remove-filter" data-filter="year">&times;</button>
            `;
            activeFiltersContainer.appendChild(filterDiv);
        }
        
        if (this.currentFilters.minRating) {
            const filterDiv = document.createElement('div');
            filterDiv.className = 'active-filter';
            filterDiv.innerHTML = `
                <i class="fas fa-star"></i>
                <span>Рейтинг: ${this.currentFilters.minRating}+</span>
                <button class="remove-filter" data-filter="rating">&times;</button>
            `;
            activeFiltersContainer.appendChild(filterDiv);
        }
        
        if (this.currentFilters.languages && this.currentFilters.languages.length > 0) {
            const filterDiv = document.createElement('div');
            filterDiv.className = 'active-filter';
            filterDiv.innerHTML = `
                <i class="fas fa-language"></i>
                <span>Язык: ${this.currentFilters.languages.join(', ')}</span>
                <button class="remove-filter" data-filter="languages">&times;</button>
            `;
            activeFiltersContainer.appendChild(filterDiv);
        }
        
        // Добавляем обработчики для кнопок удаления
        activeFiltersContainer.querySelectorAll('.remove-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const filter = e.target.dataset.filter;
                console.log(`🗑️ Удаление фильтра: ${filter}`);
                this.removeFilter(filter);
            });
        });
        
        // Показываем контейнер, если есть фильтры
        if (activeFiltersContainer.children.length > 0) {
            activeFiltersContainer.style.display = 'flex';
        }
    }

    removeFilter(filterName) {
        console.log(`🗑️ Удаление фильтра: ${filterName}`);
        
        switch(filterName) {
            case 'genre':
                delete this.currentFilters.genre;
                break;
            case 'year':
                delete this.currentFilters.yearFrom;
                delete this.currentFilters.yearTo;
                break;
            case 'rating':
                delete this.currentFilters.minRating;
                break;
            case 'languages':
                delete this.currentFilters.languages;
                break;
        }
        
        // Сохраняем обновленные фильтры
        sessionStorage.setItem('lastSearchFilters', JSON.stringify(this.currentFilters));
        
        // Обновляем поиск
        this.currentPage = 1;
        this.performSearch();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM загружен, инициализация SearchResultsPage');
    
    // Проверяем доступность API
    if (!window.SearchAPI) {
        console.error('❌ SearchAPI не найден!');
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center; max-width: 500px; width: 90%;
        `;
        errorDiv.innerHTML = `
            <h2 style="color: #e53935; margin-bottom: 20px;"><i class="fas fa-exclamation-triangle"></i> Ошибка</h2>
            <p style="margin-bottom: 20px;">Поисковый модуль не загружен. Пожалуйста, обновите страницу.</p>
            <button onclick="window.location.reload()" style="padding: 12px 25px; background: #6750A4; color: white; border: none; border-radius: 8px; cursor: pointer;">
                Обновить страницу
            </button>
        `;
        document.body.appendChild(errorDiv);
        return;
    }
    
    console.log('✅ SearchAPI доступен, создаю SearchResultsPage');
    window.SearchResultsPage = new SearchResultsPage();
});

// Глобальные функции для кнопок
function toggleSaveBook(bookId, button) {
    const isSaved = button.classList.contains('saved');
    
    if (isSaved) {
        button.innerHTML = '<i class="far fa-bookmark"></i> Сохранить';
        button.classList.remove('saved');
        showToast('info', 'Книга удалена из сохраненных');
        console.log(`📚 Книга ${bookId} удалена из сохраненных`);
    } else {
        button.innerHTML = '<i class="fas fa-bookmark"></i> Сохранено';
        button.classList.add('saved');
        showToast('success', 'Книга добавлена в сохраненные');
        console.log(`📚 Книга ${bookId} добавлена в сохраненные`);
    }
}

function toggleSaveAuthor(authorId, button) {
    const isSaved = button.classList.contains('saved');
    
    if (isSaved) {
        button.innerHTML = '<i class="far fa-bookmark"></i> Сохранить';
        button.classList.remove('saved');
        showToast('info', 'Автор удален из сохраненных');
        console.log(`👤 Автор ${authorId} удален из сохраненных`);
    } else {
        button.innerHTML = '<i class="fas fa-bookmark"></i> Сохранено';
        button.classList.add('saved');
        showToast('success', 'Автор добавлен в сохраненные');
        console.log(`👤 Автор ${authorId} добавлен в сохраненные`);
    }
}

function toggleJoinClub(clubId, button) {
    const isJoined = button.classList.contains('saved');
    
    if (isJoined) {
        button.innerHTML = '<i class="fas fa-user-plus"></i> Вступить';
        button.classList.remove('saved');
        showToast('info', 'Вы вышли из клуба');
        console.log(`👥 Вышли из клуба ${clubId}`);
    } else {
        button.innerHTML = '<i class="fas fa-user-check"></i> Вы в клубе';
        button.classList.add('saved');
        showToast('success', 'Вы вступили в клубе');
        console.log(`👥 Вступили в клуб ${clubId}`);
    }
}

function showToast(type, message) {
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
        <button style="background: none; border: none; color: inherit; font-size: 1.2rem; cursor: pointer; margin-left: 10px; opacity: 0.7;">&times;</button>
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

console.log('✅ Search-results.js загружен');