const name = localStorage.getItem("username");
const avatar = localStorage.getItem("avatar");
const bg = localStorage.getItem("bg");
// profile.js
async function loadProfileData() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../Authorization/auth.html';
        return;
    }

    try {
        const response = await fetch('https://natosha-considerable-rheumily.ngrok-free.dev/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            
            // Сохраняем данные в localStorage для быстрого доступа
            localStorage.setItem('username', userData.name || userData.username || 'Пользователь');
            if (userData.photo) {
                localStorage.setItem('avatar', userData.photo);
            }
            
            // Обновляем UI
            const nameEl = document.getElementById('profileName');
            const avatarEl = document.getElementById('profileAvatar');
            
            if (nameEl) nameEl.textContent = userData.name || userData.username || 'Пользователь';
            if (avatarEl && userData.photo) avatarEl.src = userData.photo;
            
            // Загружаем статистику
            await loadUserStats();
        }
    } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        // Показываем данные из localStorage как fallback
        const name = localStorage.getItem('username');
        const avatar = localStorage.getItem('avatar');
        
        if (name && document.getElementById('profileName')) {
            document.getElementById('profileName').textContent = name;
        }
        if (avatar && document.getElementById('profileAvatar')) {
            document.getElementById('profileAvatar').src = avatar;
        }
    }
}

async function loadUserStats() {
    try {
        // Пример загрузки статистики (замени на свой endpoint)
        const response = await fetch(`${API_BASE_URL}/user/stats`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            // Обновляем статистику на странице
            const statItems = document.querySelectorAll('.stat-item span');
            if (statItems[0] && stats.booksRead) {
                statItems[0].textContent = stats.booksRead;
            }
            if (statItems[1] && stats.reviewsCount) {
                statItems[1].textContent = stats.reviewsCount;
            }
        }
    } catch (error) {
        console.error('Ошибка загрузки статистики:', error);
    }
}


