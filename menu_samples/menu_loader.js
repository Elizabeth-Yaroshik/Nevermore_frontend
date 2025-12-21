// menu_loader.js - ПРОСТОЙ И РАБОЧИЙ
console.log('🔧 Простой menu loader запущен');

// Функция загрузки с проверкой ошибок
function loadComponent(id, fileName) {
    const element = document.getElementById(id);
    if (!element) {
        console.log(`⚠️ Элемент #${id} не найден, пропускаем`);
        return Promise.resolve();
    }
    
    console.log(`📥 Пытаюсь загрузить ${fileName} для #${id}`);
    
    // Пробуем разные пути
    const possiblePaths = [
        `menu_samples/${fileName}`,           // Текущая папка
        `../menu_samples/${fileName}`,        // На уровень выше
        `../../menu_samples/${fileName}`,     // На два уровня выше
        `/menu_samples/${fileName}`           // Абсолютный путь
    ];
    
    // Пробуем каждый путь по очереди
    const tryLoad = (pathIndex) => {
        if (pathIndex >= possiblePaths.length) {
            console.error(`❌ Не удалось загрузить ${fileName}`);
            element.innerHTML = `<div style="padding:10px;color:red;">Не загружено: ${fileName}</div>`;
            return;
        }
        
        const path = possiblePaths[pathIndex];
        console.log(`🔄 Пробую путь: ${path}`);
        
        fetch(path)
            .then(response => {
                if (!response.ok) throw new Error('HTTP error: ' + response.status);
                return response.text();
            })
            .then(html => {
                console.log(`✅ Успешно загружено: ${path}`);
                element.innerHTML = html;
                
                // Если это header, настраиваем поиск
                if (id === 'header') {
                    setTimeout(setupHeaderSearch, 100);
                }
            })
            .catch(error => {
                console.log(`⚠️ Путь ${path} не сработал: ${error.message}`);
                // Пробуем следующий путь
                tryLoad(pathIndex + 1);
            });
    };
    
    tryLoad(0);
}

// Настройка поиска в header
function setupHeaderSearch() {
    const searchInput = document.getElementById('headerSearchInput');
    const searchBtn = document.getElementById('headerSearchBtn');
    
    if (!searchInput) {
        console.log('⚠️ Поле поиска в header не найдено');
        return;
    }
    
    console.log('🔧 Настраиваю поиск в header');
    
    // Поиск по Enter - ГАРАНТИРОВАННО РАБОЧИЙ
    searchInput.addEventListener('keydown', function(e) {
        console.log('⌨️ Клавиша в поиске:', e.key);
        
        if (e.key === 'Enter') {
            console.log('🎯 ENTER НАЖАТ!');
            e.preventDefault();
            
            const query = this.value.trim();
            if (!query) {
                alert('Введите запрос для поиска');
                return;
            }
            
            console.log('🔍 Выполняю поиск:', query);
            sessionStorage.setItem('lastSearchQuery', query);
            window.location.href = `../Search/search-results.html?q=${encodeURIComponent(query)}`;
        }
    });
    
    // Кнопка поиска
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value.trim();
            if (!query) {
                alert('Введите запрос для поиска');
                return;
            }
            
            sessionStorage.setItem('lastSearchQuery', query);
            window.location.href = `../Search/search-results.html?q=${encodeURIComponent(query)}`;
        });
    }
    
    console.log('✅ Поиск в header настроен');
}

// Главная функция
function loadAllMenu() {
    console.log('🔄 Загружаю все меню...');
    
    loadComponent('header', 'header.html');
    loadComponent('sidebar', 'sidebar.html');
    loadComponent('mobile-nav', 'mobile-nav.html');
    
    console.log('✅ Menu loader завершил запуск загрузки');
}

// Автоматически запускаем при загрузке DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAllMenu);
} else {
    setTimeout(loadAllMenu, 100);
}

// Глобальная функция для ручной загрузки
window.loadMenu = loadAllMenu;