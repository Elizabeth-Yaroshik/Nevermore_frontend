document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");
  
  // Получаем ID книги из URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  
  // Проверяем авторизацию
  if (!apiUtils.checkAuth()) {
    window.location.href = '../Authorization/auth.html';
    return;
  }
  
  // Загружаем список книг для рекомендаций или других целей
  loadBooksList();
  
  // Если есть ID, загружаем данные книги
  if (bookId) {
    loadBookData(bookId);
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      contents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      const targetId = tab.dataset.tab;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });
});

async function loadBooksList() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('Пользователь не авторизован');
      showToast('Для просмотра книг необходимо авторизоваться', 'info');
      return [];
    }

    console.log('Загрузка списка книг...');
    
    const response = await fetch(`${API_BASE_URL}/book/list`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'any-value'
      }
    });

    console.log('Статус ответа:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Данные получены:', data);
      
      // Обрабатываем данные в зависимости от формата
      let books = [];
      
      if (Array.isArray(data)) {
        books = data;
      } else if (data && Array.isArray(data.books)) {
        books = data.books;
      } else if (data && Array.isArray(data.data)) {
        books = data.data;
      }
      
      // Кешируем книги
      cacheBooksData(books);
      
      // Обновляем рекомендации
      const urlParams = new URLSearchParams(window.location.search);
      const bookId = urlParams.get('id');
      if (bookId) {
        updateRecommendationsFromAPI(books, bookId);
      }
      
      return books;
    } else if (response.status === 401) {
      console.log('Токен устарел, пытаемся обновить...');
      const refreshed = await apiUtils.refreshToken();
      if (refreshed) {
        console.log('Токен обновлен, повторяем запрос...');
        return await loadBooksList();
      } else {
        console.error('Не удалось обновить токен');
        showToast('Сессия истекла, требуется повторный вход', 'error');
        setTimeout(() => {
          window.location.href = '../Authorization/auth.html';
        }, 2000);
      }
    } else {
      const errorText = await response.text();
      console.error('Ошибка сервера:', response.status, errorText);
      showToast(`Ошибка сервера: ${response.status}`, 'error');
    }
    
  } catch (error) {
    console.error('Ошибка загрузки списка книг:', error);
    showToast('Ошибка сети при загрузке книг', 'error');
  }
  return [];
}

// Функция для кеширования данных книг
function cacheBooksData(books) {
  localStorage.setItem('cached_books', JSON.stringify(books));
  console.log('Данные книг сохранены в кеш');
}

// Функция для обновления рекомендаций из API
function updateRecommendationsFromAPI(books, currentBookId) {
  // Фильтруем книги, исключая текущую
  const otherBooks = books.filter(book => {
    const bookId = book.Id || book.id || book.bookId;
    return bookId != currentBookId;
  });
  
  // Берем первые 4 книги для рекомендаций
  const recommendations = otherBooks.slice(0, 4);
  
  // Обновляем блок рекомендаций
  const recommendationsContainer = document.querySelector('.card');
  if (!recommendationsContainer) return;
  
  recommendationsContainer.innerHTML = '<h3>Похожие книги</h3>';
  
  if (recommendations.length === 0) {
    recommendationsContainer.innerHTML += '<p style="color: #666; text-align: center; padding: 20px;">Пока нет рекомендаций</p>';
    return;
  }
  
  recommendations.forEach(book => {
    const bookId = book.Id || book.id || book.bookId;
    const title = book.Title || book.title || book.name || 'Без названия';
    const author = book.AuthorName || book.authorName || book.author || 'Автор неизвестен';
    const year = book.Year || book.year || book.publicationYear || null;
    
    const recItem = document.createElement('div');
    recItem.className = 'rec-item';
    recItem.setAttribute('data-book-id', bookId);
    recItem.innerHTML = `
      <div style="width: 56px; height: 78px; background-color: #6750A4; opacity: 0.6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.7rem; text-align: center; padding: 5px;">
        ${title.substring(0, 15).toUpperCase()}
      </div>
      <div class="rec-info">
        <div class="rec-title">${title}</div>
        <div class="rec-author">${author}</div>
        ${year ? `<div class="rec-year">${year} год</div>` : ''}
      </div>
    `;
    
    // Добавляем обработчик клика для рекомендаций
    recItem.addEventListener('click', function() {
      const recBookId = this.getAttribute('data-book-id');
      window.location.href = `book.html?id=${recBookId}`;
    });
    
    recommendationsContainer.appendChild(recItem);
  });
}

// Функция для загрузки данных книги
async function loadBookData(bookId) {
  try {
    // Показываем индикатор загрузки
    document.querySelector('.book-title').textContent = 'Загрузка...';
    document.querySelector('.book-meta').textContent = 'Загрузка данных...';
    document.querySelector('.book-description').textContent = 'Загрузка описания...';
    
    // Сначала проверяем кеш
    const cachedBooks = localStorage.getItem('cached_books');
    let book;
    
    if (cachedBooks) {
      const books = JSON.parse(cachedBooks);
      // Ищем книгу по ID (учитываем разные форматы)
      book = books.find(b => {
        const bId = b.Id || b.id || b.bookId;
        return bId == bookId;
      });
    }
    
    // Если не нашли в кеше, загружаем список книг
    if (!book) {
      console.log('Книга не найдена в кеше, загружаем список...');
      const books = await loadBooksList();
      if (books && Array.isArray(books)) {
        book = books.find(b => {
          const bId = b.Id || b.id || b.bookId;
          return bId == bookId;
        });
      }
    }
    
    // Если нашли книгу
    if (book) {
      // Извлекаем данные из разных возможных форматов
      const bookId = book.Id || book.id || book.bookId;
      const title = book.Title || book.title || book.name || 'Без названия';
      const author = book.AuthorName || book.authorName || book.author || 'Автор неизвестен';
      const year = book.Year || book.year || book.publicationYear || null;
      const genre = book.Genre || book.genre || book.category || 'Не указан';
      const description = book.Description || book.description || book.summary || 'Описание отсутствует';
      const tags = book.Tags || book.tags || book.categories || [];
      
      // Обновляем данные на странице
      document.querySelector('.book-title').textContent = title;
      document.querySelector('.book-meta').textContent = 
        `${year || 'Неизвестный год'} / Автор: ${author}`;
      document.querySelector('.book-description').textContent = description;
      
      // Обновляем теги
      const tagsContainer = document.querySelector('.tags');
      tagsContainer.innerHTML = '';
      
      // Добавляем жанр как первый тег
      const genreTag = document.createElement('span');
      genreTag.className = 'tag';
      genreTag.textContent = genre;
      tagsContainer.appendChild(genreTag);
      
      // Добавляем остальные теги
      if (Array.isArray(tags)) {
        tags.forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.className = 'tag';
          tagElement.textContent = tag;
          tagsContainer.appendChild(tagElement);
        });
      }
      
      // Обновляем обложку
      const bookCover = document.getElementById('bookCover');
      if (bookCover) {
        // Берем первые буквы слов из названия
        const coverText = title.split(' ')
          .map(word => word[0] || '')
          .join('')
          .toUpperCase()
          .slice(0, 4);
        bookCover.textContent = coverText || title.substring(0, 3).toUpperCase();
      }
      
      // Загружаем главы
      loadChapters(book);
      
      // Загружаем отзывы
      loadReviews(bookId);
      
      // Показываем успешное уведомление
      showToast(`Загружена книга "${title}"`, 'success');
      
    } else {
      // Если книга не найдена
      document.querySelector('.book-title').textContent = 'Книга не найдена';
      document.querySelector('.book-meta').textContent = '';
      document.querySelector('.book-description').textContent = 
        'Запрашиваемая книга не найдена в каталоге.';
      
      const bookCover = document.getElementById('bookCover');
      if (bookCover) {
        bookCover.textContent = '404';
      }
      
      showToast('Книга не найдена', 'error');
    }
    
  } catch (error) {
    console.error('Error loading book data:', error);
    showToast('Ошибка загрузки данных книги', 'error');
    
    // Показываем ошибку на странице
    document.querySelector('.book-title').textContent = 'Ошибка загрузки';
    document.querySelector('.book-description').textContent = 
      'Не удалось загрузить данные книги. Пожалуйста, попробуйте обновить страницу.';
  }
}

// Функция для загрузки глав
function loadChapters(book) {
  const chapterList = document.querySelector('.chapter-list');
  if (!chapterList) return;
  
  chapterList.innerHTML = '';
  
  // Проверяем разные варианты хранения глав
  let chapters = [];
  
  if (book.Chapters && Array.isArray(book.Chapters)) {
    chapters = book.Chapters;
  } else if (book.chapters && Array.isArray(book.chapters)) {
    chapters = book.chapters;
  } else if (book.contents && Array.isArray(book.contents)) {
    chapters = book.contents;
  } else if (book.parts && Array.isArray(book.parts)) {
    chapters = book.parts;
  }
  
  // Если есть главы, отображаем их
  if (chapters.length > 0) {
    chapters.forEach((chapter, index) => {
      const chapterElement = document.createElement('div');
      chapterElement.className = 'chapter';
      chapterElement.textContent = typeof chapter === 'string' ? chapter : `Глава ${index + 1}`;
      chapterElement.addEventListener('click', () => {
        startReadingChapter(index + 1);
      });
      chapterList.appendChild(chapterElement);
    });
  } else {
    // Если глав нет, показываем информацию о книге
    const genre = book.Genre || book.genre || book.category || 'Не указан';
    const year = book.Year || book.year || book.publicationYear || 'Неизвестен';
    const author = book.AuthorName || book.authorName || book.author || 'Неизвестен';
    
    const infoElement = document.createElement('div');
    infoElement.className = 'chapter';
    infoElement.innerHTML = `
      <div style="text-align: center;">
        <div style="font-weight: bold; margin-bottom: 5px;">Информация о книге</div>
        <div style="font-size: 0.9rem;">Жанр: ${genre}</div>
        <div style="font-size: 0.9rem;">Год: ${year}</div>
        <div style="font-size: 0.9rem;">Автор: ${author}</div>
      </div>
    `;
    chapterList.appendChild(infoElement);
  }
}

// Функция для начала чтения конкретной главы
function startReadingChapter(chapterNumber) {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  
  if (bookId) {
    // Перенаправляем на страницу чтения с указанием главы
    window.location.href = `../Reader/reader.html?bookId=${bookId}&chapter=${chapterNumber}`;
  } else {
    alert('Ошибка: не удалось определить книгу');
  }
}

// Функция для загрузки отзывов
function loadReviews(bookId) {
  const reviewsList = document.querySelector('.reviews-list');
  if (!reviewsList) return;
  
  // В реальном приложении здесь должен быть запрос к API для получения отзывов
  // Пока используем демо-отзывы
  const reviews = [
    { user: "Алексей Петров", rating: 5, text: "Отличная книга! Очень понравилось." },
    { user: "Мария Иванова", rating: 4, text: "Интересное произведение, рекомендую к прочтению." },
    { user: "Дмитрий Смирнов", rating: 5, text: "Шедевр! Перечитываю уже в третий раз." }
  ];
  
  reviewsList.innerHTML = '';
  
  if (reviews.length === 0) {
    reviewsList.innerHTML = '<p style="color: #666; text-align: center; padding: 20px;">Пока нет отзывов</p>';
    return;
  }
  
  reviews.forEach(review => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review';
    
    // Создаем звездочки рейтинга
    let stars = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= review.rating) {
        stars += '<i class="fas fa-star" style="color: #ffd700;"></i>';
      } else {
        stars += '<i class="far fa-star" style="color: #ccc;"></i>';
      }
    }
    
    reviewElement.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <strong>${review.user}</strong>
        <div style="display: flex; gap: 2px;">
          ${stars}
        </div>
      </div>
      <p>${review.text}</p>
    `;
    reviewsList.appendChild(reviewElement);
  });
}

// Функция для кнопок
function startReading() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  
  if (bookId) {
    // Перенаправляем на страницу чтения
    window.location.href = `../Reader/reader.html?bookId=${bookId}`;
  } else {
    alert('Ошибка: не удалось определить книгу');
  }
}

function addToBookmarks() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  
  if (!bookId) {
    showToast('Не удалось определить книгу', 'error');
    return;
  }
  
  // Получаем данные о книге из кеша
  const cachedBooks = localStorage.getItem('cached_books');
  
  if (cachedBooks) {
    const books = JSON.parse(cachedBooks);
    const book = books.find(b => {
      const bId = b.Id || b.id || b.bookId;
      return bId == bookId;
    });
    
    if (book) {
      const title = book.Title || book.title || book.name || 'Без названия';
      const author = book.AuthorName || book.authorName || book.author || 'Автор неизвестен';
      
      // Сохраняем в localStorage
      const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
      
      // Проверяем, есть ли уже эта книга в закладках
      const existingIndex = bookmarks.findIndex(b => b.id == bookId);
      
      if (existingIndex === -1) {
        bookmarks.push({
          id: bookId,
          title: title,
          author: author,
          addedDate: new Date().toISOString()
        });
        
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        showToast(`Книга "${title}" добавлена в закладки!`, 'success');
      } else {
        bookmarks.splice(existingIndex, 1);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        showToast(`Книга "${title}" удалена из закладок!`, 'info');
      }
    } else {
      showToast('Не удалось найти данные книги', 'error');
    }
  } else {
    showToast('Данные книг не загружены', 'error');
  }
}

function reportBook() {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  
  if (!bookId) {
    showToast('Не удалось определить книгу', 'error');
    return;
  }
  
  // Получаем данные о книге из кеша
  const cachedBooks = localStorage.getItem('cached_books');
  let bookTitle = 'неизвестная книга';
  
  if (cachedBooks) {
    const books = JSON.parse(cachedBooks);
    const book = books.find(b => {
      const bId = b.Id || b.id || b.bookId;
      return bId == bookId;
    });
    
    if (book) {
      bookTitle = book.Title || book.title || book.name || 'неизвестная книга';
    }
  }
  
  const reason = prompt(`Укажите причину жалобы на книгу "${bookTitle}":`);
  
  if (reason) {
    // В реальном приложении здесь была бы отправка на сервер
    console.log(`Жалоба на книгу ${bookId}: ${reason}`);
    showToast('Жалоба отправлена модераторам. Спасибо!', 'info');
  }
}

// Функция для показа уведомлений
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
  }, 4000);
}

// Функция для проверки, загружена ли страница
function isPageLoaded() {
  return document.readyState === 'complete';
}

// Добавляем обработчик для кнопки "Назад" в браузере
window.addEventListener('popstate', function(event) {
  // При возврате на страницу книги, перезагружаем данные
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  if (bookId && isPageLoaded()) {
    loadBookData(bookId);
  }
});