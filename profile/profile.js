async function loadProfileData() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../Authorization/auth.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/user`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'any-value'
            }
        });

        console.log('Статус ответа профиля:', response.status);

        if (response.ok) {
            const userData = await response.json();
            console.log('Данные пользователя:', userData);
            
            // Сохраняем данные в localStorage для быстрого доступа
            localStorage.setItem('username', userData.name || userData.username || 'Пользователь');
            localStorage.setItem('email', userData.email || '');
            localStorage.setItem('phone_number', userData.phone_number || '');
            
            // Обрабатываем фото из S3
            if (userData.photo) {
                // Если фото уже полный URL
                let photoUrl = userData.photo;
                
                // Если фото относительный путь, добавляем базовый URL
                if (photoUrl && !photoUrl.startsWith('http')) {
                    photoUrl = `${API_BASE_URL}/${photoUrl.replace(/^\//, '')}`;
                }
                
                localStorage.setItem('avatar', photoUrl);
            } else {
                localStorage.removeItem('avatar');
            }
            
            // Обновляем UI
            updateProfileUI(userData);
            
            // Загружаем дополнительную статистику
            await loadUserStats();
            await loadUserBookStats();
            
        } else if (response.status === 401) {
            console.log('Токен устарел, пытаемся обновить...');
            const refreshed = await refreshToken();
            if (refreshed) {
                console.log('Токен обновлен, повторяем запрос...');
                await loadProfileData();
            } else {
                console.error('Не удалось обновить токен');
                showToast('Сессия истекла, требуется повторный вход', 'error');
                setTimeout(() => {
                    window.location.href = '../Authorization/auth.html';
                }, 2000);
            }
        } else {
            console.error('Ошибка сервера:', response.status);
            // Используем данные из localStorage
            loadFromLocalStorage();
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        loadFromLocalStorage();
    }
}

function updateProfileUI(userData) {
    // Обновляем имя
    const nameEl = document.getElementById('profileName');
    if (nameEl) {
        nameEl.textContent = userData.name || userData.username || 'Пользователь';
    }
    
    // Обновляем email
    const emailEl = document.getElementById('profileEmail');
    if (emailEl) {
        emailEl.textContent = userData.email || 'Email не указан';
    }
    
    // Обновляем телефон
    const phoneEl = document.getElementById('profilePhone');
    if (phoneEl) {
        phoneEl.textContent = userData.phone_number || 'Телефон не указан';
    }
    
    // Обновляем аватар
    const avatarEl = document.getElementById('profileAvatar');
    if (avatarEl) {
        if (userData.photo) {
            // Обрабатываем URL фото
            let photoUrl = userData.photo;
            
            // Если фото относительный путь, добавляем базовый URL
            if (photoUrl && !photoUrl.startsWith('http')) {
                photoUrl = `${API_BASE_URL}/${photoUrl.replace(/^\//, '')}`;
            }
            
            avatarEl.src = photoUrl;
            avatarEl.onerror = function() {
                // Если фото не загрузилось, используем fallback
                this.src = getDefaultAvatar();
                this.onerror = null;
            };
        } else {
            // Используем дефолтную аватарку
            avatarEl.src = getDefaultAvatar();
        }
        avatarEl.style.display = 'block';
    }
    
    // Обновляем фон профиля
    const bgEl = document.getElementById('profileBg');
    if (bgEl) {
        // Можно добавить кастомный фон из данных пользователя
        // или использовать дефолтный
        bgEl.src = '../images/profile-bg.jpg';
        bgEl.onerror = function() {
            // Если фон не загрузился, используем цвет
            this.style.display = 'none';
            document.querySelector('.profile-banner').style.backgroundColor = '#6750A4';
        };
    }
}

function getDefaultAvatar() {
    // Возвращаем URL дефолтной аватарки
    return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%236750A4"/><text x="50" y="55" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dominant-baseline="middle">👤</text></svg>';
}

function loadFromLocalStorage() {
    // Загружаем данные из localStorage
    const name = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    const email = localStorage.getItem('email');
    const phone = localStorage.getItem('phone_number');
    
    if (name && document.getElementById('profileName')) {
        document.getElementById('profileName').textContent = name;
    }
    
    if (email && document.getElementById('profileEmail')) {
        document.getElementById('profileEmail').textContent = email;
    }
    
    if (phone && document.getElementById('profilePhone')) {
        document.getElementById('profilePhone').textContent = phone;
    }
    
    const avatarEl = document.getElementById('profileAvatar');
    if (avatarEl) {
        if (avatar) {
            avatarEl.src = avatar;
            avatarEl.onerror = function() {
                this.src = getDefaultAvatar();
                this.onerror = null;
            };
        } else {
            avatarEl.src = getDefaultAvatar();
        }
        avatarEl.style.display = 'block';
    }
}

async function refreshToken() {
    try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) return false;
        
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'any-value'
            },
            body: JSON.stringify({ refreshToken: refreshToken })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.accessToken);
            localStorage.setItem('refresh_token', data.refreshToken);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
}

async function loadUserStats() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        // Загрузка статистики пользователя
        const response = await fetch(`${API_BASE_URL}/user/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'any-value'
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            
            // Обновляем статистику на странице
            const statItems = document.querySelectorAll('.stat-item span');
            if (statItems[0] && stats.booksRead !== undefined) {
                statItems[0].textContent = stats.booksRead;
            }
            if (statItems[1] && stats.reviewsCount !== undefined) {
                statItems[1].textContent = stats.reviewsCount;
            }
            if (statItems[2] && stats.hoursRead !== undefined) {
                statItems[2].textContent = stats.hoursRead;
            }
            if (statItems[3] && stats.daysActive !== undefined) {
                statItems[3].textContent = stats.daysActive;
            }
        }
    } catch (error) {
        console.log('Статистика пока недоступна, используем заглушки');
        // Устанавливаем дефолтные значения
        const statItems = document.querySelectorAll('.stat-item span');
        if (statItems[0]) statItems[0].textContent = '0';
        if (statItems[1]) statItems[1].textContent = '0';
    }
}

async function loadUserBookStats() {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) return;
        
        // Загрузка статистики по жанрам
        const response = await fetch(`${API_BASE_URL}/user/genre-stats`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'ngrok-skip-browser-warning': 'any-value'
            }
        });
        
        if (response.ok) {
            const genreStats = await response.json();
            updateGenreStats(genreStats);
        }
    } catch (error) {
        console.log('Статистика по жанрам недоступна');
        // Можно оставить дефолтные значения
    }
}

function updateGenreStats(genreStats) {
    const tagStatsContainer = document.querySelector('.tag-stats');
    if (!tagStatsContainer) return;
    
    // Очищаем контейнер
    tagStatsContainer.innerHTML = '';
    
    // Добавляем статистику по жанрам
    if (genreStats && Array.isArray(genreStats) && genreStats.length > 0) {
        genreStats.forEach(stat => {
            const tagLine = document.createElement('div');
            tagLine.className = 'tag-line';
            tagLine.innerHTML = `
                <span>${stat.genre || 'Неизвестный жанр'}</span>
                <span>${stat.count || 0}</span>
            `;
            tagStatsContainer.appendChild(tagLine);
        });
    } else {
        // Дефолтные жанры, если нет данных
        const defaultGenres = [
            { genre: 'Романтика', count: 230 },
            { genre: 'Драма', count: 217 },
            { genre: 'Фэнтези', count: 210 },
            { genre: 'Детектив', count: 106 }
        ];
        
        defaultGenres.forEach(stat => {
            const tagLine = document.createElement('div');
            tagLine.className = 'tag-line';
            tagLine.innerHTML = `
                <span>${stat.genre}</span>
                <span>${stat.count}</span>
            `;
            tagStatsContainer.appendChild(tagLine);
        });
    }
}

function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Функция для смены аватарки
async function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Проверяем размер файла (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Файл слишком большой. Максимальный размер: 5MB', 'error');
            return;
        }
        
        try {
            const token = localStorage.getItem('access_token');
            const formData = new FormData();
            formData.append('photo', file);
            
            showToast('Загрузка фото...', 'info');
            
            const response = await fetch(`${API_BASE_URL}/user/avatar`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                if (result.photo) {
                    // Обновляем фото в localStorage и на странице
                    let photoUrl = result.photo;
                    if (photoUrl && !photoUrl.startsWith('http')) {
                        photoUrl = `${API_BASE_URL}/${photoUrl.replace(/^\//, '')}`;
                    }
                    
                    localStorage.setItem('avatar', photoUrl);
                    
                    const avatarEl = document.getElementById('profileAvatar');
                    if (avatarEl) {
                        avatarEl.src = photoUrl;
                    }
                    
                    showToast('Фото профиля обновлено!', 'success');
                }
            } else {
                showToast('Ошибка загрузки фото', 'error');
            }
        } catch (error) {
            console.error('Ошибка загрузки фото:', error);
            showToast('Ошибка загрузки фото', 'error');
        }
    };
    
    input.click();
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем авторизацию
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../Authorization/auth.html';
        return;
    }
    
    // Загружаем профиль
    loadProfileData();
});