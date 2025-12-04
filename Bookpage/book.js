document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".tab");
  const contents = document.querySelectorAll(".tab-content");
  
  // Получаем ID книги из URL
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get('id');
  
  // Если есть ID, можно загрузить данные книги
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

// Функция для загрузки данных книги
async function loadBookData(bookId) {
  try {
    // Данные всех книг
    const booksData = [
      { 
        id: 1, 
        title: "Преступление и наказание", 
        author: "Ф.М. Достоевский", 
        genre: "classic", 
        year: 1866,
        description: "Роман о нравственных страданиях и борьбе между добром и злом в душе человека. История бывшего студента Родиона Раскольникова, совершившего убийство старухи-процентщицы и пытающегося оправдать свой поступок теорией о «тварях дрожащих» и «право имеющих».",
        tags: ["Классика", "Драма", "Психология", "Роман"],
        chapters: [
          "Часть первая", "Часть вторая", "Часть третья", 
          "Часть четвертая", "Часть пятая", "Часть шестая", "Эпилог"
        ]
      },
      { 
        id: 2, 
        title: "Над пропастью во ржи", 
        author: "Джером Д. Сэлинджер", 
        genre: "classic", 
        year: 1951,
        description: "История подростка Холдена Колфилда, который пытается найти свое место в мире взрослых, полном лицемерия и фальши. Роман стал культовым для нескольких поколений молодежи.",
        tags: ["Классика", "Роман", "Подростковая литература"],
        chapters: [
          "Глава 1", "Глава 2", "Глава 3", "Глава 4", "Глава 5",
          "Глава 6", "Глава 7", "Глава 8", "Глава 9", "Глава 10",
          "Глава 11", "Глава 12", "Глава 13", "Глава 14", "Глава 15"
        ]
      },
      { 
        id: 3, 
        title: "Мастер и Маргарита", 
        author: "М.А. Булгаков", 
        genre: "classic", 
        year: 1967,
        description: "Мистический роман о дьяволе, посетившем Москву 1930-х годов. Параллельно развивается история о Понтии Пилате и Иешуа Га-Ноцри.",
        tags: ["Классика", "Мистика", "Фантастика", "Роман"],
        chapters: [
          "Часть 1", "Часть 2", "Эпилог"
        ]
      },
      { 
        id: 4, 
        title: "1984", 
        author: "Джордж Оруэлл", 
        genre: "dystopia", 
        year: 1949,
        description: "Антиутопический роман о тоталитарном обществе, где правит Большой Брат. История Уинстона Смита, пытающегося сохранить свою индивидуальность.",
        tags: ["Антиутопия", "Политика", "Фантастика"],
        chapters: [
          "Часть 1", "Часть 2", "Часть 3", "Приложение"
        ]
      },
      { 
        id: 5, 
        title: "Тихий Дон", 
        author: "М.А. Шолохов", 
        genre: "classic", 
        year: 1940,
        description: "Эпопея о жизни донского казачества в период Первой мировой войны, революции и Гражданской войны. Центральный персонаж — Григорий Мелехов.",
        tags: ["Классика", "Исторический роман", "Эпопея"],
        chapters: [
          "Книга 1", "Книга 2", "Книга 3", "Книга 4"
        ]
      },
      { 
        id: 6, 
        title: "Анна Каренина", 
        author: "Л.Н. Толстой", 
        genre: "classic", 
        year: 1877,
        description: "Роман о трагической любви замужней Анны Карениной и блестящего офицера Алексея Вронского на фоне жизни русского дворянства.",
        tags: ["Классика", "Драма", "Любовный роман"],
        chapters: [
          "Часть 1", "Часть 2", "Часть 3", "Часть 4", 
          "Часть 5", "Часть 6", "Часть 7", "Часть 8"
        ]
      },
      { 
        id: 7, 
        title: "Горе от ума", 
        author: "А.С. Грибоедов", 
        genre: "classic", 
        year: 1825,
        description: "Комедия в стихах, высмеивающая московское дворянское общество первой половины XIX века. Главный герой — Александр Чацкий.",
        tags: ["Классика", "Комедия", "Поэзия"],
        chapters: [
          "Действие 1", "Действие 2", "Действие 3", "Действие 4"
        ]
      }
    ];
    
    const book = booksData.find(b => b.id == bookId);
    
    if (book) {
      // Обновляем данные на странице
      document.querySelector('.book-title').textContent = book.title;
      document.querySelector('.book-meta').textContent = `${book.year} / Автор: ${book.author}`;
      document.querySelector('.book-description').textContent = book.description;
      
      // Обновляем теги
      const tagsContainer = document.querySelector('.tags');
      tagsContainer.innerHTML = '';
      book.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
      });
      
      // Обновляем обложку
      const bookCover = document.getElementById('bookCover');
      bookCover.textContent = book.title.toUpperCase();
      
      // Загружаем главы
      if (book.chapters) {
        loadChapters(book.chapters);
      }
      
      // Загружаем отзывы
      loadReviews(bookId);
      
      // Загружаем рекомендации
      loadRecommendations(bookId);
    }
    
  } catch (error) {
    console.error('Error loading book data:', error);
  }
}

// Функция для загрузки глав
function loadChapters(chapters) {
  const chapterList = document.querySelector('.chapter-list');
  chapterList.innerHTML = '';
  
  chapters.forEach((chapter, index) => {
    const chapterElement = document.createElement('div');
    chapterElement.className = 'chapter';
    chapterElement.textContent = chapter;
    chapterElement.addEventListener('click', () => {
      // Можно добавить переход на чтение конкретной главы
      alert(`Начало чтения: ${chapter}`);
    });
    chapterList.appendChild(chapterElement);
  });
}

// Функция для загрузки отзывов
function loadReviews(bookId) {
  const reviewsList = document.querySelector('.reviews-list');
  
  // Примерные отзывы
  const reviews = {
    1: [
      { user: "Алексей Петров", rating: 5, text: "Великолепный роман! Заставляет задуматься о морали и ответственности." },
      { user: "Мария Иванова", rating: 4, text: "Сложное произведение, но очень глубокое. Рекомендую всем." }
    ],
    2: [
      { user: "Дмитрий Смирнов", rating: 5, text: "Книга, которая изменила мое мировоззрение. Обязательна к прочтению!" }
    ],
    3: [
      { user: "Елена Козлова", rating: 5, text: "Шедевр! Перечитываю каждый год и всегда нахожу что-то новое." }
    ]
  };
  
  reviewsList.innerHTML = '';
  
  const bookReviews = reviews[bookId] || [
    { user: "Анонимный читатель", rating: 4, text: "Хорошая книга, стоит прочитать." }
  ];
  
  bookReviews.forEach(review => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review';
    reviewElement.innerHTML = `
      <strong>${review.user}</strong> (${review.rating}/5)
      <p>${review.text}</p>
    `;
    reviewsList.appendChild(reviewElement);
  });
}

// Функция для загрузки рекомендаций
function loadRecommendations(bookId) {
  const recommendationsContainer = document.querySelector('.card');
  
  // Примерные рекомендации
  const recommendations = [
    { id: 8, title: "Братья Карамазовы", author: "Ф.М. Достоевский", year: 1880 },
    { id: 9, title: "Идиот", author: "Ф.М. Достоевский", year: 1869 },
    { id: 10, title: "Война и мир", author: "Л.Н. Толстой", year: 1869 },
    { id: 11, title: "Отцы и дети", author: "И.С. Тургенев", year: 1862 }
  ];
  
  recommendationsContainer.innerHTML = '<h3>Похожие книги</h3>';
  
  recommendations.forEach(book => {
    const recItem = document.createElement('div');
    recItem.className = 'rec-item';
    recItem.setAttribute('data-book-id', book.id);
    recItem.innerHTML = `
      <div style="width: 56px; height: 78px; background-color: #6750A4; opacity: 0.6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.7rem; text-align: center; padding: 5px;">
        ${book.title.substring(0, 15).toUpperCase()}
      </div>
      <div class="rec-info">
        <div class="rec-title">${book.title}</div>
        <div class="rec-author">${book.author}</div>
        <div class="rec-year">${book.year}</div>
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

// Функции для кнопок (можно реализовать позже)
// Функции для кнопок
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
    const bookId = new URLSearchParams(window.location.search).get('id');
    
    // Получаем данные о книге
    const booksData = [
        // ... ваш массив книг
    ];
    
    const book = booksData.find(b => b.id == bookId);
    
    if (book) {
        // Сохраняем в localStorage
        const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
        
        // Проверяем, есть ли уже эта книга в закладках
        const existingIndex = bookmarks.findIndex(b => b.id == bookId);
        
        if (existingIndex === -1) {
            bookmarks.push({
                id: book.id,
                title: book.title,
                author: book.author,
                addedDate: new Date().toISOString()
            });
            
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            showToast(`Книга "${book.title}" добавлена в закладки!`, 'success');
        } else {
            bookmarks.splice(existingIndex, 1);
            localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
            showToast(`Книга "${book.title}" удалена из закладок!`, 'info');
        }
    }
}

function reportBook() {
    const bookId = new URLSearchParams(window.location.search).get('id');
    const reason = prompt('Укажите причину жалобы:');
    
    if (reason) {
        // В реальном приложении здесь был бы отправка на сервер
        console.log(`Жалоба на книгу ${bookId}: ${reason}`);
        showToast('Жалоба отправлена модераторам. Спасибо!', 'info');
    }
}

// Функция для показа уведомлений (добавьте в book.js)
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
