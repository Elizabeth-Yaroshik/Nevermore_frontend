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

// Данные книг для каталога
const booksData = [
    { id: 1, title: "Преступление и наказание", author: "Ф.М. Достоевский", genre: "classic", year: 1866 },
    { id: 2, title: "Мастер и Маргарита", author: "М.А. Булгаков", genre: "classic", year: 1967 },
    { id: 3, title: "Анна Каренина", author: "Л.Н. Толстой", genre: "classic", year: 1877 },
    { id: 4, title: "Тихий Дон", author: "М.А. Шолохов", genre: "classic", year: 1940 },
    { id: 5, title: "Война и мир", author: "Л.Н. Толстой", genre: "classic", year: 1869 },
    { id: 6, title: "Евгений Онегин", author: "А.С. Пушкин", genre: "classic", year: 1833 },
    { id: 7, title: "Мёртвые души", author: "Н.В. Гоголь", genre: "classic", year: 1842 },
    { id: 8, title: "Отцы и дети", author: "И.С. Тургенев", genre: "classic", year: 1862 },
    { id: 9, title: "Герой нашего времени", author: "М.Ю. Лермонтов", genre: "classic", year: 1840 },
    { id: 10, title: "Ревизор", author: "Н.В. Гоголь", genre: "classic", year: 1836 },
    { id: 11, title: "Горе от ума", author: "А.С. Грибоедов", genre: "classic", year: 1825 },
    { id: 12, title: "Капитанская дочка", author: "А.С. Пушкин", genre: "classic", year: 1836 },
    { id: 13, title: "Идиот", author: "Ф.М. Достоевский", genre: "classic", year: 1869 },
    { id: 14, title: "Братья Карамазовы", author: "Ф.М. Достоевский", genre: "classic", year: 1880 },
    { id: 15, title: "Обломов", author: "И.А. Гончаров", genre: "classic", year: 1859 },
    { id: 16, title: "Вишнёвый сад", author: "А.П. Чехов", genre: "drama", year: 1904 },
    { id: 17, title: "Три сестры", author: "А.П. Чехов", genre: "drama", year: 1901 },
    { id: 18, title: "На дне", author: "М. Горький", genre: "drama", year: 1902 }
];

const booksGrid = document.getElementById('booksGrid');
const genreFilter = document.getElementById('genreFilter');
const sortFilter = document.getElementById('sortFilter');

function renderBooks(books) {
    booksGrid.innerHTML = '';
    
    books.forEach(book => {
        const bookCard = document.createElement('div');
        bookCard.className = 'catalog-book-card';
        bookCard.onclick = () => {
            window.location.href = `../Bookpage/book.html?id=${book.id}`;
        };
        
        // Создаем текст для обложки (первые буквы слов)
        const coverText = book.title.split(' ').map(word => word[0]).join('').toUpperCase();
        
        bookCard.innerHTML = `
            <div class="catalog-book-cover">
                ${coverText}
            </div>
            <div class="catalog-book-info">
                <div class="catalog-book-title">${book.title}</div>
                <div class="catalog-book-author">${book.author}</div>
                <div class="catalog-book-genre">${getGenreName(book.genre)}</div>
                <div style="color: #888; font-size: 0.8rem;">${book.year} год</div>
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
        'romance': 'Роман'
    };
    return genres[genreCode] || 'Другое';
}

function filterAndSortBooks() {
    let filteredBooks = [...booksData];
    
    // Фильтрация по жанру
    const selectedGenre = genreFilter.value;
    if (selectedGenre) {
        filteredBooks = filteredBooks.filter(book => book.genre === selectedGenre);
    }
    
    // Сортировка
    const sortBy = sortFilter.value;
    switch(sortBy) {
        case 'newest':
            filteredBooks.sort((a, b) => b.year - a.year);
            break;
        case 'title':
            filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case 'author':
            filteredBooks.sort((a, b) => a.author.localeCompare(b.author));
            break;
        case 'popular':
            // Для примеза - сортируем по id
            filteredBooks.sort((a, b) => a.id - b.id);
            break;
    }
    
    return filteredBooks;
}

function updateBooks() {
    const books = filterAndSortBooks();
    renderBooks(books);
}

// Инициализация
renderBooks(booksData);

// Слушатели событий
genreFilter.addEventListener('change', updateBooks);
sortFilter.addEventListener('change', updateBooks);

// Пагинация
document.querySelectorAll('.page-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        // Здесь можно добавить загрузку другой страницы
    });
});