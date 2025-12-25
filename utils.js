// utils.js - объединённая версия
const API_BASE_URL = 'https://natosha-considerable-rheumily.ngrok-free.dev';
//const API_BASE_URL = 'https://e64e7fa1166011ff-151-249-189-59.serveousercontent.com';
// Проверка аутентификации
function checkAuth() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../Authorization/auth.html';
        return false;
    }
    return true;
}

// utils.js - дополнительная функция
// Проверка подтверждения email
async function verifyEmail(code) {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email?code=${code}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
    });
    
    if (!response.ok) {
        throw new Error('Email verification failed');
    }
    
    return response.json();
}

// Добавляем в window.apiUtils
window.apiUtils = {
    ...window.apiUtils,
    verifyEmail
};
// Общий запрос с обработкой ошибок
async function apiRequest(endpoint, get = {}) {
    const token = localStorage.getItem('access_token');
    
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...get,
        headers: {
            ...defaultHeaders,
            ...get.headers
        }
    });
    
    // Если 401 - пробуем обновить токен
    if (response.status === 401) {
        const refreshed = await refreshToken();
        if (refreshed) {
            // Повторяем запрос с новым токеном
            return apiRequest(endpoint, get);
        } else {
            window.location.href = '../Authorization/auth.html';
            throw new Error('Authentication failed');
        }
    }
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
}

// Обновление токена
async function refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh_token: refreshToken
            })
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            return true;
        }
    } catch (error) {
        console.error('Failed to refresh token:', error);
    }
    
    return false;
}

// Получение ID текущего пользователя (улучшенная версия)
function getCurrentUserId() {
    const token = localStorage.getItem('access_token');
    if (token) {
        try {
            // Декодируем JWT токен (если это JWT)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.user_id || payload.sub || null;
        } catch (e) {
            console.error('Error decoding token:', e);
        }
    }
    
    // Альтернативно: проверяем localStorage (сохраняем обратную совместимость)
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData).id : null;
}

// Форматирование времени
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Выход из системы (улучшенная версия)
function logout() {
    const token = localStorage.getItem('access_token');
    
    // Отправляем запрос на logout только если есть токен
    if (token) {
        fetch(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).catch(console.error);
    }
    
    // Очищаем localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('userData');
    
    // Перенаправляем на страницу входа
    window.location.href = '../Authorization/auth.html';
}

// Экспортируем функции (включая API_BASE_URL)
window.apiUtils = {
    API_BASE_URL,           // Добавлено из второго варианта
    checkAuth,
    apiRequest,
    refreshToken,
    getCurrentUserId,       // Улучшенная версия
    formatTime,
    logout                  // Улучшенная версия
};