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

// Константы
const booksGrid = document.getElementById('booksGrid');
const genreFilter = document.getElementById('genreFilter');
const sortFilter = document.getElementById('sortFilter');

// Переменная для хранения всех загруженных книг
let allBooks = [];

// Загрузка книг с API
async function loadBooks() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../Authorization/auth.html';
        return [];
    }

    try {
        // Получаем список книг
        const response = await fetch(`${apiUtils.API_BASE_URL}/book/list`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'any-value'
            }
        });

        console.log('Статус ответа:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Текст ошибки:', errorText);
            throw new Error(`Failed to load books: ${response.status}`);
        }

        // Парсим JSON ответ
        const data = await response.json();
        console.log('Полученные данные:', data);

        // Проверяем, что это массив (судя по вашему ответу, это JSON строка)
        let booksArray;
        
        if (typeof data === 'string') {
            // Если ответ пришел как строка JSON
            try {
                booksArray = JSON.parse(data);
            } catch (parseError) {
                console.error('Ошибка парсинга JSON строки:', parseError);
                return getDemoBooks();
            }
        } else if (Array.isArray(data)) {
            // Если это уже массив
            booksArray = data;
        } else if (data && Array.isArray(data.books)) {
            // Если это объект с массивом книг
            booksArray = data.books;
        } else {
            console.error('Неизвестный формат данных:', data);
            return getDemoBooks();
        }

        // Преобразуем данные в нужный формат
        const formattedBooks = booksArray.map(book => {
            // Определяем значения с учетом разных возможных названий полей
            const id = book.Id || book.id || book.bookId;
            const title = book.Title || book.title || book.name || 'Без названия';
            const author = book.AuthorName || book.authorName || book.author || book.Author || 'Неизвестный автор';
            const genre = book.Genre || book.genre || book.category || 'Поэма'; // По умолчанию "Поэма" из вашего ответа
            const year = book.Year || book.year || book.publicationYear || 1984; // По умолчанию 1984 из вашего ответа
            
            return {
                id: id || Math.random().toString(36).substr(2, 9),
                title: title,
                authorName: author,
                author: author, // Дублируем для совместимости
                authorId: book.AuthorId || book.authorId || null,
                genre: genre.toLowerCase(), // Приводим к нижнему регистру для фильтрации
                genreDisplay: genre, // Оригинальное название жанра для отображения
                year: year,
                description: book.Description || book.description || book.summary || 'Описание отсутствует',
                tags: book.Tags || book.tags || book.categories || [],
                chapters: book.Chapters || book.chapters || book.contents || []
            };
        });

        console.log(`Загружено ${formattedBooks.length} книг`);
        return formattedBooks;
        
    } catch (error) {
        console.error('Ошибка загрузки книг:', error);
        // Возвращаем демо-данные если API не доступен
        return getDemoBooks();
    }
}

// Демо-данные на случай недоступности API
function getDemoBooks() {
    return [
        { 
            id: 1, 
            title: "Преступление и наказание", 
            authorName: "Ф.М. Достоевский", 
            author: "Ф.М. Достоевский",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1866 
        },
        { 
            id: 2, 
            title: "Мастер и Маргарита", 
            authorName: "М.А. Булгаков", 
            author: "М.А. Булгаков",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1967 
        },
        { 
            id: 3, 
            title: "Анна Каренина", 
            authorName: "Л.Н. Толстой", 
            author: "Л.Н. Толстой",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1877 
        },
        { 
            id: 4, 
            title: "Тихий Дон", 
            authorName: "М.А. Шолохов", 
            author: "М.А. Шолохов",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1940 
        },
        { 
            id: 5, 
            title: "Война и мир", 
            authorName: "Л.Н. Толстой", 
            author: "Л.Н. Толстой",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1869 
        },
        { 
            id: 6, 
            title: "Евгений Онегин", 
            authorName: "А.С. Пушкин", 
            author: "А.С. Пушкин",
            genre: "poetry", 
            genreDisplay: "Поэзия",
            year: 1833 
        },
        { 
            id: 7, 
            title: "Мёртвые души", 
            authorName: "Н.В. Гоголь", 
            author: "Н.В. Гоголь",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1842 
        },
        { 
            id: 8, 
            title: "Отцы и дети", 
            authorName: "И.С. Тургенев", 
            author: "И.С. Тургенев",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1862 
        },
        { 
            id: 9, 
            title: "Герой нашего времени", 
            authorName: "М.Ю. Лермонтов", 
            author: "М.Ю. Лермонтов",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1840 
        },
        { 
            id: 10, 
            title: "Ревизор", 
            authorName: "Н.В. Гоголь", 
            author: "Н.В. Гоголь",
            genre: "drama", 
            genreDisplay: "Драма",
            year: 1836 
        },
        { 
            id: 11, 
            title: "Горе от ума", 
            authorName: "А.С. Грибоедов", 
            author: "А.С. Грибоедов",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1825 
        },
        { 
            id: 12, 
            title: "Капитанская дочка", 
            authorName: "А.С. Пушкин", 
            author: "А.С. Пушкин",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1836 
        },
        { 
            id: 13, 
            title: "Идиот", 
            authorName: "Ф.М. Достоевский", 
            author: "Ф.М. Достоевский",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1869 
        },
        { 
            id: 14, 
            title: "Братья Карамазовы", 
            authorName: "Ф.М. Достоевский", 
            author: "Ф.М. Достоевский",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1880 
        },
        { 
            id: 15, 
            title: "Обломов", 
            authorName: "И.А. Гончаров", 
            author: "И.А. Гончаров",
            genre: "classic", 
            genreDisplay: "Классика",
            year: 1859 
        },
        { 
            id: 16, 
            title: "Вишнёвый сад", 
            authorName: "А.П. Чехов", 
            author: "А.П. Чехов",
            genre: "drama", 
            genreDisplay: "Драма",
            year: 1904 
        },
        { 
            id: 17, 
            title: "Три сестры", 
            authorName: "А.П. Чехов", 
            author: "А.П. Чехов",
            genre: "drama", 
            genreDisplay: "Драма",
            year: 1901 
        },
        { 
            id: 18, 
            title: "На дне", 
            authorName: "М. Горький", 
            author: "М. Горький",
            genre: "drama", 
            genreDisplay: "Драма",
            year: 1902 
        }
    ];
}

// Рендер книг
function renderBooks(books) {
    booksGrid.innerHTML = '';
    
    if (books.length === 0) {
        booksGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <div style="font-size: 3rem; color: #ccc; margin-bottom: 20px;">📚</div>
                <h3 style="color: #666; margin-bottom: 10px;">Книги не найдены</h3>
                <p style="color: #888;">Попробуйте изменить параметры фильтрации</p>
            </div>
        `;
        return;
    }
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'catalog-book-card';
        bookCard.onclick = () => {
            window.location.href = `../Bookpage/book.html?id=${book.id}`;
        };
        
        // Создаем текст для обложки (первые буквы слов)
        const coverText = book.title ? 
            book.title.split(' ').map(word => word[0] || '').join('').toUpperCase().slice(0, 3) : 
            '???';
        
        bookCard.innerHTML = `
            <div class="catalog-book-cover">
                ${coverText}
            </div>
            <div class="catalog-book-info">
                <div class="catalog-book-title">${book.title || 'Название неизвестно'}</div>
                <div class="catalog-book-author">${book.authorName || 'Автор неизвестен'}</div>
                <div class="catalog-book-genre">${book.genreDisplay || getGenreName(book.genre)}</div>
                ${book.year ? `<div style="color: #888; font-size: 0.8rem; margin-top: 5px;">${book.year} год</div>` : ''}
            </div>
        `;
        
        booksGrid.appendChild(bookCard);
    });
}

function getGenreName(genreCode) {
    const genres = {
        'classic': 'Классика',
        'fantasy': 'Фэнтези',
        'scifi': 'Научная фантастика',
        'drama': 'Драма',
        'роман': 'Роман',
        'поэма': 'Поэма',
        'романтика': 'Романтика',
        'novel': 'Роман',
        'поэзия': 'Поэзия',
        'poetry': 'Поэзия',
        'detective': 'Детектив'
    };
    return genres[genreCode] || (genreCode || 'Другое');
}

// Получение уникальных жанров для фильтра
function updateGenreFilter(books) {
    const currentValue = genreFilter.value;
    
    // Получаем уникальные жанры из книг
    const genres = new Set();
    books.forEach(book => {
        if (book.genreDisplay) {
            genres.add(book.genreDisplay);
        } else if (book.genre) {
            genres.add(getGenreName(book.genre));
        }
    });
    
    // Обновляем список жанров
    genreFilter.innerHTML = `
        <option value="">Все жанры</option>
        ${Array.from(genres).sort().map(genre => 
            `<option value="${genre.toLowerCase()}">${genre}</option>`
        ).join('')}
    `;
    
    // Восстанавливаем выбранное значение
    if (currentValue) {
        genreFilter.value = currentValue;
    }
}

// Фильтрация и сортировка
function filterAndSortBooks(books) {
    let filteredBooks = [...books];
    
    // Фильтрация по жанру
    const selectedGenre = genreFilter.value;
    if (selectedGenre) {
        filteredBooks = filteredBooks.filter(book => {
            const bookGenre = book.genreDisplay || getGenreName(book.genre);
            return bookGenre.toLowerCase().includes(selectedGenre.toLowerCase());
        });
    }
    
    // Сортировка
    const sortBy = sortFilter.value;
    switch(sortBy) {
        case 'newest':
            filteredBooks.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'title':
            filteredBooks.sort((a, b) => (a.title || '').localeCompare(b.title || '', 'ru'));
            break;
        case 'author':
            filteredBooks.sort((a, b) => (a.authorName || '').localeCompare(b.authorName || '', 'ru'));
            break;
        case 'popular':
            // Сортируем по ID как пример
            filteredBooks.sort((a, b) => (a.id || 0) - (b.id || 0));
            break;
    }
    
    return filteredBooks;
}

// Обновление книг
function updateBooks() {
    const filteredBooks = filterAndSortBooks(allBooks);
    renderBooks(filteredBooks);
}

// Пагинация
function setupPagination(books) {
    const itemsPerPage = 12;
    const totalPages = Math.ceil(books.length / itemsPerPage);
    
    if (totalPages <= 1) {
        document.querySelector('.pagination').style.display = 'none';
        return;
    }
    
    document.querySelector('.pagination').style.display = 'flex';
    
    // Упрощенная пагинация - показываем только первые 5 страниц
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';
    
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = 'page-btn';
        if (i === 1) pageBtn.classList.add('active');
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
            pageBtn.classList.add('active');
            
            // Вычисляем книги для страницы
            const startIndex = (i - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageBooks = books.slice(startIndex, endIndex);
            renderBooks(pageBooks);
        });
        paginationContainer.appendChild(pageBtn);
    }
    
    if (totalPages > 5) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        dots.style.alignSelf = 'center';
        dots.style.margin = '0 10px';
        paginationContainer.appendChild(dots);
        
        const lastPageBtn = document.createElement('button');
        lastPageBtn.className = 'page-btn';
        lastPageBtn.textContent = totalPages;
        lastPageBtn.addEventListener('click', () => {
            document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
            lastPageBtn.classList.add('active');
            
            const startIndex = (totalPages - 1) * itemsPerPage;
            const pageBooks = books.slice(startIndex);
            renderBooks(pageBooks);
        });
        paginationContainer.appendChild(lastPageBtn);
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Показываем индикатор загрузки
        booksGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 15px; color: #666;">Загрузка книг...</p>
            </div>
        `;
        
        // Загружаем книги
        allBooks = await loadBooks();
        console.log('Всего загружено книг:', allBooks.length);
        
        // Обновляем фильтр жанров
        updateGenreFilter(allBooks);
        
        // Инициализируем отображение
        updateBooks();
        
        // Настраиваем пагинацию
        setupPagination(allBooks);
        
        // Слушатели событий для фильтров
        genreFilter.addEventListener('change', () => {
            updateBooks();
            setupPagination(filterAndSortBooks(allBooks));
        });
        
        sortFilter.addEventListener('change', () => {
            updateBooks();
            setupPagination(filterAndSortBooks(allBooks));
        });
        
        // Показываем уведомление об успешной загрузке
        if (allBooks.length > 0) {
            showToast(`Загружено ${allBooks.length} книг`, 'success');
        }
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
        booksGrid.innerHTML = `
            <div style="text-align: center; padding: 40px; grid-column: 1 / -1;">
                <div style="font-size: 3rem; color: #ff6b6b; margin-bottom: 20px;">❌</div>
                <h3 style="color: #666; margin-bottom: 10px;">Ошибка загрузки</h3>
                <p style="color: #888;">Не удалось загрузить книги. Попробуйте обновить страницу.</p>
                <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #6750A4; color: white; border: none; border-radius: 6px; cursor: pointer;">
                    Обновить страницу
                </button>
            </div>
        `;
    }
});

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
    }, 3000);
}