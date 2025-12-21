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
const API_BASE_URL = 'https://natosha-considerable-rheumily.ngrok-free.dev';
const booksGrid = document.getElementById('booksGrid');
const genreFilter = document.getElementById('genreFilter');
const sortFilter = document.getElementById('sortFilter');

// Загрузка книг с API
async function loadBooks() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../Authorization/auth.html';
        return [];
    }

    try {
        // Получаем всех авторов
        const authorsResponse = await fetch(`${API_BASE_URL}/author/list`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!authorsResponse.ok) {
            throw new Error('Failed to load authors');
        }

        const authors = await authorsResponse.json();
        const allBooks = [];
        
        // Для каждого автора получаем его книги (ограничиваем 5 авторами для производительности)
        for (const author of authors.slice(0, 5)) {
            try {
                const booksResponse = await fetch(`${API_BASE_URL}/book/by-author/${author.id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (booksResponse.ok) {
                    const books = await booksResponse.json();
                    // Добавляем информацию об авторе к каждой книге
                    books.forEach(book => {
                        allBooks.push({
                            ...book,
                            authorName: author.name,
                            authorId: author.id
                        });
                    });
                }
            } catch (error) {
                console.error(`Error loading books for author ${author.id}:`, error);
            }
        }
        
        return allBooks;
    } catch (error) {
        console.error('Ошибка загрузки книг:', error);
        // Возвращаем демо-данные если API не доступен
        return getDemoBooks();
    }
}

// Демо-данные на случай недоступности API
function getDemoBooks() {
    return [
        { id: 1, title: "Преступление и наказание", authorName: "Ф.М. Достоевский", genre: "classic", year: 1866 },
        { id: 2, title: "Мастер и Маргарита", authorName: "М.А. Булгаков", genre: "classic", year: 1967 },
        { id: 3, title: "Анна Каренина", authorName: "Л.Н. Толстой", genre: "classic", year: 1877 },
        { id: 4, title: "Тихий Дон", authorName: "М.А. Шолохов", genre: "classic", year: 1940 },
        { id: 5, title: "Война и мир", authorName: "Л.Н. Толстой", genre: "classic", year: 1869 },
        { id: 6, title: "Евгений Онегин", authorName: "А.С. Пушкин", genre: "classic", year: 1833 },
        { id: 7, title: "Мёртвые души", authorName: "Н.В. Гоголь", genre: "classic", year: 1842 },
        { id: 8, title: "Отцы и дети", authorName: "И.С. Тургенев", genre: "classic", year: 1862 },
        { id: 9, title: "Герой нашего времени", authorName: "М.Ю. Лермонтов", genre: "classic", year: 1840 },
        { id: 10, title: "Ревизор", authorName: "Н.В. Гоголь", genre: "classic", year: 1836 },
        { id: 11, title: "Горе от ума", authorName: "А.С. Грибоедов", genre: "classic", year: 1825 },
        { id: 12, title: "Капитанская дочка", authorName: "А.С. Пушкин", genre: "classic", year: 1836 },
        { id: 13, title: "Идиот", authorName: "Ф.М. Достоевский", genre: "classic", year: 1869 },
        { id: 14, title: "Братья Карамазовы", authorName: "Ф.М. Достоевский", genre: "classic", year: 1880 },
        { id: 15, title: "Обломов", authorName: "И.А. Гончаров", genre: "classic", year: 1859 },
        { id: 16, title: "Вишнёвый сад", authorName: "А.П. Чехов", genre: "drama", year: 1904 },
        { id: 17, title: "Три сестры", authorName: "А.П. Чехов", genre: "drama", year: 1901 },
        { id: 18, title: "На дне", authorName: "М. Горький", genre: "drama", year: 1902 }
    ];
}

// Рендер книг
function renderBooks(books) {
    booksGrid.innerHTML = '';
    
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
                <div class="catalog-book-genre">${getGenreName(book.genre)}</div>
                ${book.year ? `<div style="color: #888; font-size: 0.8rem;">${book.year} год</div>` : ''}
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
        'romance': 'Роман',
        'novel': 'Роман',
        'poetry': 'Поэзия',
        'detective': 'Детектив'
    };
    return genres[genreCode] || (genreCode || 'Другое');
}

// Фильтрация и сортировка
function filterAndSortBooks(books) {
    let filteredBooks = [...books];
    
    // Фильтрация по жанру
    const selectedGenre = genreFilter.value;
    if (selectedGenre) {
        filteredBooks = filteredBooks.filter(book => 
            book.genre === selectedGenre || 
            getGenreName(book.genre).toLowerCase().includes(selectedGenre.toLowerCase())
        );
    }
    
    // Сортировка
    const sortBy = sortFilter.value;
    switch(sortBy) {
        case 'newest':
            filteredBooks.sort((a, b) => (b.year || 0) - (a.year || 0));
            break;
        case 'title':
            filteredBooks.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
            break;
        case 'author':
            filteredBooks.sort((a, b) => (a.authorName || '').localeCompare(b.authorName || ''));
            break;
        case 'popular':
            // Сортируем по ID как пример
            filteredBooks.sort((a, b) => (a.id || 0) - (b.id || 0));
            break;
    }
    
    return filteredBooks;
}

// Обновление книг
function updateBooks(books) {
    const filteredBooks = filterAndSortBooks(books);
    renderBooks(filteredBooks);
}

// Инициализация
document.addEventListener('DOMContentLoaded', async () => {
    // Загружаем книги
    const books = await loadBooks();
    
    // Инициализируем фильтры
    renderBooks(books);
    
    // Слушатели событий для фильтров
    genreFilter.addEventListener('change', () => updateBooks(books));
    sortFilter.addEventListener('change', () => updateBooks(books));
    
    // Пагинация
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});