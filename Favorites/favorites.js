// Загрузка компонентов страницы
fetch("../menu_samples/header.html")
    .then(r => r.text())
    .then(h => document.getElementById("header").innerHTML = h);

fetch("../menu_samples/sidebar.html")
    .then(r => r.text())
    .then(html => {
        document.getElementById("sidebar").innerHTML = html;
    })
    .catch(err => console.error('Error loading sidebar:', err));

fetch("../menu_samples/mobile-nav.html")
    .then(r => r.text())
    .then(html => {
        document.getElementById("mobile-nav").innerHTML = html;
    })
    .catch(err => console.error('Error loading mobile navigation:', err));

// Управление вкладками
document.querySelectorAll('.fav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        const tabId = this.dataset.tab;
        
        // Обновляем активные вкладки
        document.querySelectorAll('.fav-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        // Показываем соответствующий контент
        document.querySelectorAll('.fav-content').forEach(c => c.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
    });
});

// Удаление из избранного
function removeFromFavorites(button, itemId) {
    const card = button.closest('.fav-book-card');
    card.style.opacity = '0.5';
    card.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        card.remove();
        updateTabCounts();
        showToast('success', 'Удалено из избранного');
    }, 300);
}

// Обновление счетчиков на вкладках
function updateTabCounts() {
    // Здесь можно добавить логику обновления счетчиков
    // Для примеза просто уменьшим счетчик книг
    const booksTab = document.querySelector('.fav-tab[data-tab="books"]');
    const currentCount = parseInt(booksTab.textContent.match(/\((\d+)\)/)[1]) || 0;
    if (currentCount > 0) {
        booksTab.textContent = booksTab.textContent.replace(/\(\d+\)/, `(${currentCount - 1})`);
    }
}

// Функция toast уведомлений
function showToast(type, message) {
    const toastContainer = document.getElementById("toastContainer");
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
}