// saved-authors.js
document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем авторизацию
    if (!apiUtils.checkAuth()) {
        return;
    }

    const authorsGrid = document.getElementById('authorsGrid');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');
    const authorsCount = document.getElementById('authorsCount');
    const filterContainer = document.getElementById('filterContainer');

    let savedAuthors = [];
    let isLoading = false;

    // Инициализация
    async function init() {
        showLoading();
        await loadSavedAuthors();
        hideLoading();
    }

    // Показать загрузку
    function showLoading() {
        loading.style.display = 'block';
        authorsGrid.innerHTML = '';
        emptyState.style.display = 'none';
        isLoading = true;
    }

    // Скрыть загрузку
    function hideLoading() {
        loading.style.display = 'none';
        isLoading = false;
    }

    // Загрузить сохраненных авторов
    async function loadSavedAuthors() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '../Authorization/auth.html';
            return;
        }

        try {
            const response = await fetch(`${apiUtils.API_BASE_URL}/saved-author/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                savedAuthors = await response.json();
                // Добавляем флаг saved для каждого автора
                savedAuthors.forEach(author => author.saved = true);
                renderAuthors();
            } else if (response.status === 401) {
                // Пробуем обновить токен
                const refreshed = await apiUtils.refreshToken();
                if (refreshed) {
                    await loadSavedAuthors(); // Повторяем запрос
                } else {
                    window.location.href = '../Authorization/auth.html';
                }
            } else {
                throw new Error(`HTTP error: ${response.status}`);
            }
        } catch (error) {
            console.error('Ошибка загрузки сохраненных авторов:', error);
            showError('Не удалось загрузить сохраненных авторов');
        }
    }

    // Отобразить авторов
    function renderAuthors() {
        if (!savedAuthors || savedAuthors.length === 0) {
            showEmptyState();
            return;
        }

        authorsCount.textContent = `${savedAuthors.length} авторов`;
        authorsGrid.innerHTML = savedAuthors.map(author => createAuthorCard(author)).join('');
        
        // Добавить обработчики событий для кнопок
        addCardEventListeners();
    }

    // Создать карточку автора
    function createAuthorCard(author) {
        const isSaved = author.saved || true; // На этой странице все авторы сохранены
        
        return `
            <div class="author-card ${isSaved ? 'saved' : ''}" data-author-id="${author.id}">
                <div class="author-header">
                    <div class="author-avatar">
                        ${getInitials(author.name || author.author_name)}
                    </div>
                    <div class="author-info">
                        <h3 class="author-name">${author.name || author.author_name || 'Автор'}</h3>
                        <span class="author-genre">${author.genre || author.genres || 'Жанр не указан'}</span>
                    </div>
                </div>
                
                <div class="author-stats">
                    <div class="stat">
                        <div class="stat-value">${author.booksCount || author.books_count || '?'}</div>
                        <div class="stat-label">Книги</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${author.rating || '—'}</div>
                        <div class="stat-label">Рейтинг</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">${author.followers || '0'}</div>
                        <div class="stat-label">Подписчики</div>
                    </div>
                </div>
                
                <p class="author-description">
                    ${author.description || author.bio || 'Нет описания'}
                </p>
                
                <div class="author-actions">
                    <button class="btn-action btn-view" onclick="viewAuthor('${author.id || author.author_id}')">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                    <button class="btn-action btn-save ${isSaved ? 'saved' : ''}" 
                            data-action="toggle-save" 
                            data-author-id="${author.id || author.author_id}">
                        ${isSaved ? 
                            '<i class="fas fa-bookmark"></i> Удалить' : 
                            '<i class="far fa-bookmark"></i> Сохранить'}
                    </button>
                </div>
            </div>
        `;
    }

    // Получить инициалы из имени
    function getInitials(name) {
        if (!name) return '?';
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    // Показать пустое состояние
    function showEmptyState() {
        authorsGrid.innerHTML = '';
        emptyState.style.display = 'block';
        authorsCount.textContent = '0 авторов';
    }

    // Добавить обработчики событий для карточек
    function addCardEventListeners() {
        // Кнопки сохранения
        document.querySelectorAll('[data-action="toggle-save"]').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const authorId = button.dataset.authorId;
                await toggleSaveAuthor(authorId, button);
            });
        });

        // Клик по карточке (для перехода)
        document.querySelectorAll('.author-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    const authorId = card.dataset.authorId;
                    viewAuthor(authorId);
                }
            });
        });
    }

    // Переключить сохранение автора
    async function toggleSaveAuthor(authorId, button) {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            const author = savedAuthors.find(a => (a.id || a.author_id) == authorId);
            
            if (author && author.saved) {
                // Удаляем из сохраненных
                const response = await fetch(`${apiUtils.API_BASE_URL}/saved-author/delete?author_id=${authorId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    // Обновляем UI
                    savedAuthors = savedAuthors.filter(a => (a.id || a.author_id) != authorId);
                    renderAuthors();
                    showToast('success', 'Автор удален из сохраненных');
                } else if (response.status === 401) {
                    const refreshed = await apiUtils.refreshToken();
                    if (refreshed) {
                        await toggleSaveAuthor(authorId, button); // Повторяем
                    }
                }
            } else {
                // Сохраняем автора (на случай, если функция используется где-то еще)
                const userId = apiUtils.getCurrentUserId();
                if (!userId) {
                    showToast('error', 'Не удалось определить пользователя');
                    return;
                }

                const response = await fetch(`${apiUtils.API_BASE_URL}/saved-author/create`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        author_id: authorId,
                        user_id: userId
                    })
                });

                if (response.ok) {
                    showToast('success', 'Автор добавлен в сохраненные');
                    // Загружаем обновленный список
                    await loadSavedAuthors();
                }
            }
        } catch (error) {
            console.error('Ошибка сохранения автора:', error);
            showToast('error', 'Не удалось выполнить действие');
        }
    }

    // Показать автора
    function viewAuthor(authorId) {
        window.location.href = `../book.html?authorId=${authorId}`;
    }

    // Показать уведомление
    function showToast(type, message) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        switch (type) {
            case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
            case 'error': icon = '<i class="fas fa-times-circle"></i>'; break;
        }
        
        toast.innerHTML = `${icon}<span>${message}</span><button>&times;</button>`;
        toastContainer.appendChild(toast);
        
        const closeBtn = toast.querySelector('button');
        closeBtn.addEventListener('click', () => toast.remove());
        
        setTimeout(() => toast.remove(), 4000);
    }

    // Показать ошибку
    function showError(message) {
        showToast('error', message);
        showEmptyState();
    }

    // Глобальные функции
    window.viewAuthor = viewAuthor;
    window.toggleSaveAuthor = toggleSaveAuthor;

    // Запуск
    await init();
});