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
            // Добавляем логирование для отладки
            console.log('URL запроса:', `${apiUtils.API_BASE_URL}/saved-author/list`);
            console.log('Токен:', token.substring(0, 20) + '...');

            const response = await fetch(`${apiUtils.API_BASE_URL}/saved-author/list`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json', // Явно запрашиваем JSON
                    'ngrok-skip-browser-warning': 'any-value' // Пропускаем предупреждение ngrok[citation:5]
                },
                mode: 'cors', // Явно указываем режим COR
                credentials: 'omit'
            });

            console.log('Статус ответа:', response.status);
            console.log('Заголовки ответа:', Object.fromEntries(response.headers.entries()));

            // Получаем текст ответа для анализа
            const responseText = await response.text();
            console.log('Текст ответа (первые 500 символов):', responseText.substring(0, 500));

            // Проверяем, похож ли ответ на JSON
            const isLikelyJson = responseText.trim().startsWith('[') || 
                                 responseText.trim().startsWith('{');

            if (!response.ok) {
                if (response.status === 401) {
                    console.log('Токен устарел, пытаемся обновить...');
                    const refreshed = await apiUtils.refreshToken();
                    if (refreshed) {
                        console.log('Токен обновлен, повторяем запрос...');
                        await loadSavedAuthors();
                        return;
                    } else {
                        window.location.href = '../Authorization/auth.html';
                        return;
                    }
                }
                
                // Если получили HTML (страницу ошибки)
                if (responseText.includes('<!DOCTYPE html>') || 
                    responseText.includes('<html')) {
                    console.error('Сервер вернул HTML страницу вместо JSON');
                    
                    // Проверяем, не редирект ли это
                    if (responseText.includes('Redirecting') || 
                        responseText.includes('location.href') ||
                        response.status === 302 || 
                        response.status === 301) {
                        showError('Произошел редирект. Проверьте настройки сервера.');
                        return;
                    }
                    
                    showError(`Сервер вернул ошибку ${response.status}. Возможно, неправильный URL API.`);
                    return;
                }
                
                // Пробуем распарсить как JSON для получения сообщения об ошибке
                if (isLikelyJson) {
                    try {
                        const errorData = JSON.parse(responseText);
                        showError(`Ошибка сервера: ${errorData.message || errorData.error || response.statusText}`);
                    } catch {
                        showError(`Ошибка сервера: ${response.status} ${response.statusText}`);
                    }
                } else {
                    showError(`Ошибка сервера: ${response.status} ${response.statusText}`);
                }
                return;
            }

            // Если ответ успешный, пробуем его распарсить
            if (!isLikelyJson) {
                console.error('Ответ не похож на JSON:', responseText.substring(0, 200));
                
                // Проверяем, не пустой ли ответ
                if (!responseText.trim()) {
                    console.log('Получен пустой ответ, показываем пустое состояние');
                    savedAuthors = [];
                    renderAuthors();
                    return;
                }
                
                showError('Сервер вернул некорректный формат данных');
                return;
            }

            // Пробуем распарсить JSON
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (error) {
                console.error('Ошибка парсинга JSON:', error);
                showError('Некорректный JSON от сервера');
                return;
            }

            // Обрабатываем данные
            processAuthorsData(data);
            
        } catch (error) {
            console.error('Критическая ошибка загрузки сохраненных авторов:', error);
            
            // Проверяем различные типы ошибок
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                showError('Не удалось подключиться к серверу. Проверьте интернет-соединение.');
            } else if (error.name === 'SyntaxError') {
                showError('Сервер вернул некорректные данные');
            } else {
                showError(`Не удалось загрузить сохраненных авторов: ${error.message}`);
            }
        }
    }

    // Обработка данных авторов
    function processAuthorsData(data) {
        // Проверяем структуру данных
        console.log('Получены данные авторов:', data);
        
        if (!data) {
            console.log('Получены пустые данные');
            savedAuthors = [];
            renderAuthors();
            return;
        }
        
        if (!Array.isArray(data)) {
            console.error('Ожидался массив авторов, получено:', typeof data, data);
            
            // Возможно, данные пришли в другом формате (например, {authors: [...]})
            if (data && typeof data === 'object') {
                // Пробуем найти массив авторов в объекте
                for (const key in data) {
                    if (Array.isArray(data[key])) {
                        console.log('Нашли массив авторов в ключе:', key);
                        savedAuthors = data[key];
                        break;
                    }
                }
                
                if (!Array.isArray(savedAuthors)) {
                    showError('Некорректный формат данных от сервера');
                    return;
                }
            } else {
                showError('Некорректный формат данных от сервера');
                return;
            }
        } else {
            savedAuthors = data;
        }
        
        // Преобразуем данные в нужный формат
        savedAuthors = savedAuthors.map((author, index) => {
            // Используем index как временный ID, если нет настоящего
            const authorId = author.id || author._id || `temp-${index}`;
            
            return {
                name: author.name || author.author_name || 'Без имени',
                biography: author.biography || author.bio || author.description || 'Нет биографии',
                photo_url: author.photo_url || author.photo || author.avatar || author.image_url || null,
                saved: true
            };
        });
        
        console.log('Обработанные авторы:', savedAuthors);
        renderAuthors();
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

    // Создать карточку автора с новым форматом данных
    function createAuthorCard(author) {
        const isSaved = author.saved || true;
        const safeName = (author.name || 'Без имени').replace(/'/g, "\\'");
        const safeBiography = (author.biography || 'Нет биографии')
            .replace(/"/g, '&quot;')
            .replace(/'/g, "&#39;");
        
        return `
            <div class="author-card ${isSaved ? 'saved' : ''}" data-author-id="${author.id}">
                <div class="author-header">
                    <div class="author-avatar">
                        ${author.photo_url ? 
                            `<img src="${author.photo_url}" alt="${safeName}" 
                                  onerror="handleImageError(this, '${getInitials(safeName)}')" 
                                  loading="lazy">` : 
                            getInitials(safeName)}
                    </div>
                    <div class="author-info">
                        <h3 class="author-name">${author.name || 'Без имени'}</h3>
                        <span class="author-genre">Автор</span>
                    </div>
                </div>
                
                <div class="author-stats">
                    <div class="stat">
                        <div class="stat-value">—</div>
                        <div class="stat-label">Книги</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">—</div>
                        <div class="stat-label">Рейтинг</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">—</div>
                        <div class="stat-label">Подписчики</div>
                    </div>
                </div>
                
                <p class="author-description">
                    ${(author.biography || 'Нет биографии').length > 150 ? 
                        (author.biography || 'Нет биографии').substring(0, 150) + '...' : 
                        (author.biography || 'Нет биографии')}
                </p>
                
                <div class="author-actions">
                    <button class="btn-action btn-view" onclick="viewAuthor('${author.id}')">
                        <i class="fas fa-eye"></i> Просмотр
                    </button>
                    <button class="btn-action btn-save ${isSaved ? 'saved' : ''}" 
                            data-action="toggle-save" 
                            data-author-id="${author.id}">
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
        const initials = name.split(' ')
            .filter(word => word.length > 0)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        return initials || '??';
    }

    // Обработка ошибки загрузки изображения
    function handleImageError(imgElement, initials) {
        imgElement.style.display = 'none';
        imgElement.parentElement.innerHTML = initials;
        imgElement.parentElement.classList.add('initials');
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
        if (!token) {
            window.location.href = '../Authorization/auth.html';
            return;
        }

        try {
            const author = savedAuthors.find(a => a.id == authorId);
            
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
                    savedAuthors = savedAuthors.filter(a => a.id != authorId);
                    renderAuthors();
                    showToast('success', 'Автор удален из сохраненных');
                } else if (response.status === 401) {
                    const refreshed = await apiUtils.refreshToken();
                    if (refreshed) {
                        await toggleSaveAuthor(authorId, button);
                    }
                }
            } else {
                // Сохраняем автора
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
                        user_id: userId,
                        author_id: authorId
                    })
                });

                if (response.ok) {
                    showToast('success', 'Автор добавлен в сохраненные');
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
        window.location.href = `../author-detail.html?authorId=${authorId}`;
    }

    // Показать уведомление
    function showToast(type, message) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) {
            console.log(`Toast (${type}): ${message}`);
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        let icon = '';
        switch (type) {
            case 'success': icon = '<i class="fas fa-check-circle"></i>'; break;
            case 'error': icon = '<i class="fas fa-times-circle"></i>'; break;
            default: icon = '<i class="fas fa-info-circle"></i>'; break;
        }
        
        toast.innerHTML = `${icon}<span>${message}</span><button>&times;</button>`;
        toastContainer.appendChild(toast);
        
        const closeBtn = toast.querySelector('button');
        closeBtn.addEventListener('click', () => toast.remove());
        
        setTimeout(() => toast.remove(), 4000);
    }

    // Показать ошибку
    function showError(message) {
        console.error('Показываем ошибку:', message);
        showToast('error', message);
        showEmptyState();
    }

    // Глобальные функции
    window.viewAuthor = viewAuthor;
    window.toggleSaveAuthor = toggleSaveAuthor;
    window.handleImageError = handleImageError;

    // Запуск
    await init();
});