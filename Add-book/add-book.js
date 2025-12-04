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

// Обработка загрузки файла
const fileUpload = document.getElementById('fileUpload');
const bookCoverInput = document.getElementById('bookCover');

fileUpload.addEventListener('click', () => {
    bookCoverInput.click();
});

bookCoverInput.addEventListener('change', function() {
    if (this.files.length > 0) {
        const fileName = this.files[0].name;
        fileUpload.innerHTML = `
            <i class="fas fa-check-circle" style="color: #4CAF50;"></i>
            <div>Файл загружен: <strong>${fileName}</strong></div>
            <div class="file-info">Нажмите, чтобы изменить</div>
        `;
    }
});

// Обработка формы
const addBookForm = document.getElementById('addBookForm');

addBookForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Проверка обязательных полей
    const bookTitle = document.getElementById('bookTitle').value.trim();
    const bookAuthor = document.getElementById('bookAuthor').value.trim();
    const genres = document.querySelectorAll('input[name="genre"]:checked');
    
    if (!bookTitle || !bookAuthor) {
        showToast('error', 'Пожалуйста, заполните обязательные поля');
        return;
    }
    
    if (genres.length === 0) {
        showToast('error', 'Пожалуйста, выберите хотя бы один жанр');
        return;
    }
    
    // Симуляция успешной отправки
    showToast('success', 'Книга успешно добавлена! Она появится в каталоге после модерации.');
    
    // Очистка формы
    setTimeout(() => {
        addBookForm.reset();
        fileUpload.innerHTML = `
            <i class="fas fa-cloud-upload-alt"></i>
            <div>Перетащите изображение сюда или нажмите для выбора</div>
            <div class="file-info">Рекомендуемый размер: 600×800 px. Форматы: JPG, PNG</div>
        `;
    }, 2000);
});

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