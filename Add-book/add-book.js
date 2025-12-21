addBookForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Проверка авторизации
    if (!window.apiUtils || !window.apiUtils.checkAuth()) {
        showToast('error', 'Необходимо авторизоваться для добавления книги');
        return;
    }
    
    // Проверка обязательных полей
    const bookTitle = document.getElementById('bookTitle').value.trim();
    const bookAuthor = document.getElementById('bookAuthor').value.trim();
    const genres = document.querySelectorAll('input[name="genre"]:checked');
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!bookTitle || !bookAuthor) {
        showToast('error', 'Пожалуйста, заполните обязательные поля');
        return;
    }
    
    if (genres.length === 0) {
        showToast('error', 'Пожалуйста, выберите хотя бы один жанр');
        return;
    }
    
    if (!agreeTerms) {
        showToast('error', 'Необходимо подтвердить согласие с условиями');
        return;
    }
    
    // Собираем данные для отправки
    const formData = new FormData();
    
    // Основные обязательные поля
    formData.append('title', bookTitle);
    formData.append('author', bookAuthor);
    
    // Описание (может быть обязательным в API)
    const description = document.getElementById('bookDescription').value.trim();
    if (description) {
        formData.append('description', description);
    }
    
    // Дополнительные поля
    const year = document.getElementById('bookYear').value;
    const isbn = document.getElementById('bookISBN').value;
    const language = document.getElementById('bookLanguage').value;
    const tags = document.getElementById('bookTags').value;
    
    if (year) formData.append('year', parseInt(year));
    if (isbn) formData.append('isbn', isbn);
    if (language) formData.append('language', language);
    if (tags) formData.append('tags', tags);
    
    // Жанры - преобразуем в строку с разделителями
    const selectedGenres = Array.from(genres).map(checkbox => checkbox.value);
    if (selectedGenres.length > 0) {
        formData.append('genres', selectedGenres.join(','));
    }
    
    // Файл обложки (ОБЯЗАТЕЛЬНО проверьте имя поля в свагере!)
    const fileInput = document.getElementById('bookCover');
    if (fileInput.files[0]) {
        // Проверьте в свагере точное имя поля для файла!
        // Это может быть 'file', 'cover', 'image', 'coverImage' и т.д.
        formData.append('file', fileInput.files[0]); // Предположительное имя
    } else {
        showToast('error', 'Необходимо загрузить обложку книги');
        return;
    }
    
    try {
        const token = localStorage.getItem('access_token');
        
        // Показываем индикатор загрузки
        const submitBtn = addBookForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Отправка...';
        submitBtn.disabled = true;
        
        // ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЙ ЭНДПОИНТ
        const response = await fetch(`${window.apiUtils.API_BASE_URL}/book/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
                // НЕ добавляем Content-Type для FormData - браузер сам установит!
            },
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
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
            
        } else {
            const errorText = await response.text();
            let errorMessage = 'Неизвестная ошибка';
            
            try {
                const errorData = JSON.parse(errorText);
                errorMessage = errorData.message || errorData.error || errorText;
            } catch {
                errorMessage = errorText || `HTTP ${response.status}`;
            }
            
            showToast('error', `Ошибка: ${errorMessage}`);
        }
        
    } catch (error) {
        console.error('Ошибка при отправке:', error);
        showToast('error', 'Ошибка сети или сервера: ' + error.message);
    } finally {
        // Восстанавливаем кнопку
        const submitBtn = addBookForm.querySelector('.submit-btn');
        submitBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Добавить книгу';
        submitBtn.disabled = false;
    }
});