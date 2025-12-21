// services/search-demo-data.js
window.SearchDemoData = {
    // Полный поиск с пагинацией и фильтрацией
    search: async function(query, filters = {}, options = {}) {
        console.log('🔍 Демо-поиск:', { query, filters, options });
        
        // Все демо-данные
        const allItems = [
            // Книги
            {
                id: 1,
                type: 'book',
                title: 'Преступление и наказание',
                author: 'Ф.М. Достоевский',
                description: 'Роман о нравственных страданиях студента Родиона Раскольникова, совершившего убийство ради идеи.',
                year: 1866,
                genre: 'classic',
                rating: 4.8,
                saved: true,
                relevance: 95
            },
            {
                id: 2,
                type: 'book',
                title: 'Мастер и Маргарита',
                author: 'М.А. Булгаков',
                description: 'Роман о визите дьявола в Москву 1930-х годов, перемежающийся историей о Понтии Пилате.',
                year: 1967,
                genre: 'classic',
                rating: 4.9,
                saved: false,
                relevance: 90
            },
            {
                id: 3,
                type: 'book',
                title: 'Анна Каренина',
                author: 'Л.Н. Толстой',
                description: 'Роман о трагической любви замужней дамы Анны Карениной к блестящему офицеру Вронскому.',
                year: 1877,
                genre: 'classic',
                rating: 4.7,
                saved: true,
                relevance: 85
            },
            {
                id: 4,
                type: 'book',
                title: 'Тихий Дон',
                author: 'М.А. Шолохов',
                description: 'Эпопея о донском казачестве в годы Первой мировой и Гражданской войны.',
                year: 1940,
                genre: 'classic',
                rating: 4.6,
                saved: false,
                relevance: 80
            },
            {
                id: 5,
                type: 'book',
                title: 'Властелин колец',
                author: 'Дж. Р. Р. Толкин',
                description: 'Эпическая фэнтези-сага о борьбе за Кольцо Всевластья.',
                year: 1954,
                genre: 'fantasy',
                rating: 4.9,
                saved: true,
                relevance: 88
            },
            {
                id: 6,
                type: 'book',
                title: '1984',
                author: 'Джордж Оруэлл',
                description: 'Антиутопический роман о тоталитарном обществе и контроле над сознанием.',
                year: 1949,
                genre: 'scifi',
                rating: 4.7,
                saved: false,
                relevance: 75
            },
            {
                id: 7,
                type: 'book',
                title: 'Над пропастью во ржи',
                author: 'Джером Сэлинджер',
                description: 'Роман о подростке Холдене Колфилде и его неприятии мира взрослых.',
                year: 1951,
                genre: 'drama',
                rating: 4.5,
                saved: true,
                relevance: 70
            },
            {
                id: 8,
                type: 'book',
                title: 'Маленький принц',
                author: 'Антуан де Сент-Экзюпери',
                description: 'Философская сказка о дружбе, любви и ответственности.',
                year: 1943,
                genre: 'classic',
                rating: 4.9,
                saved: false,
                relevance: 82
            },
            {
                id: 9,
                type: 'book',
                title: 'Гарри Поттер и философский камень',
                author: 'Дж. К. Роулинг',
                description: 'Первая книга серии о юном волшебнике Гарри Поттере.',
                year: 1997,
                genre: 'fantasy',
                rating: 4.8,
                saved: true,
                relevance: 87
            },
            {
                id: 10,
                type: 'book',
                title: 'Убийство в Восточном экспрессе',
                author: 'Агата Кристи',
                description: 'Детективный роман о расследовании убийства в поезде.',
                year: 1934,
                genre: 'drama',
                rating: 4.6,
                saved: false,
                relevance: 68
            },
            {
                id: 11,
                type: 'book',
                title: 'Война и мир',
                author: 'Лев Толстой',
                description: 'Роман-эпопея, описывающий русское общество в эпоху войн против наполеона',
                year: 1861,
                genre: 'classic',
                rating: 4.8,
                saved: false,
                relevance: 80
            },
            {
                id: 11,
                type: 'book',
                title: 'Вой',
                author: 'М. Гиршовский',
                description: '',
                year: 1861,
                genre: 'drama',
                rating: 3.1,
                saved: false,
                relevance: 40
            },
            
            // Авторы
            {
                id: 101,
                type: 'author',
                name: 'Фёдор Достоевский',
                genre: 'Классика',
                description: 'Русский писатель, мыслитель, философ и публицист. Член-корреспондент Петербургской академии наук.',
                booksCount: 11,
                followers: 12500,
                saved: true,
                relevance: 92
            },
            {
                id: 102,
                type: 'author',
                name: 'Михаил Булгаков',
                genre: 'Классика',
                description: 'Русский писатель, драматург, театральный режиссёр и актёр. Автор романов и пьес.',
                booksCount: 8,
                followers: 8900,
                saved: false,
                relevance: 87
            },
            {
                id: 103,
                type: 'author',
                name: 'Лев Толстой',
                genre: 'Классика',
                description: 'Один из наиболее известных русских писателей и мыслителей, один из величайших писателей мира.',
                booksCount: 15,
                followers: 15200,
                saved: true,
                relevance: 89
            },
            {
                id: 104,
                type: 'author',
                name: 'Джордж Оруэлл',
                genre: 'Научная фантастика',
                description: 'Британский писатель и журналист, автор антиутопических романов.вой',
                booksCount: 6,
                followers: 9800,
                saved: false,
                relevance: 84
            },
            {
                id: 105,
                type: 'author',
                name: 'Агата Кристи',
                genre: 'Детектив',
                description: 'Английская писательница, одна из самых известных в мире авторов детективной прозы.вой',
                booksCount: 85,
                followers: 16800,
                saved: true,
                relevance: 90
            },
            
            // Клубы
            {
                id: 201,
                type: 'club',
                name: 'Классика навсегда',
                description: 'Обсуждение классической литературы разных эпох и стран.вой',
                members: 24,
                activity: 'высокая',
                tags: ['Классика', 'Литература', 'Анализ'],
                joined: true,
                relevance: 91
            },
            {
                id: 202,
                type: 'club',
                name: 'Фэнтези и магия',
                description: 'Волшебные миры, эпические битвы, магические системы. Погружаемся в лучшие фэнтези-саги.вой',
                members: 35,
                activity: 'средняя',
                tags: ['Фэнтези', 'Магия', 'Эпика'],
                joined: false,
                relevance: 83
            },
            {
                id: 203,
                type: 'club',
                name: 'Современная проза',
                description: 'Изучаем лучшие произведения современной литературы. От нобелевских лауреатов до молодых авторов.вой',
                members: 18,
                activity: 'высокая',
                tags: ['Современность', 'Проза', 'Новинки'],
                joined: true,
                relevance: 79
            },
            {
                id: 204,
                type: 'club',
                name: 'Детектив и триллер',
                description: 'Разгадываем тайны, анализируем улики, обсуждаем лучшие детективы.вой',
                members: 32,
                activity: 'средняя',
                tags: ['Детектив', 'Триллер', 'Загадки'],
                joined: false,
                relevance: 77
            },
            {
                id: 205,
                type: 'club',
                name: 'Научная фантастика',
                description: 'Будущее технологии, космические путешествия, альтернативные реальности.вой',
                members: 28,
                activity: 'высокая',
                tags: ['Фантастика', 'Технологии', 'Космос'],
                joined: true,
                relevance: 85
            }
        ];
        
        // Фильтрация по типу
        let filteredItems = allItems;
        if (filters.type && filters.type !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === filters.type);
        }
        
        // Фильтрация по жанру
        if (filters.genre) {
            const genres = Array.isArray(filters.genre) ? filters.genre : [filters.genre];
            filteredItems = filteredItems.filter(item => {
                // Для книг и авторов проверяем genre, для клубов - tags
                if (item.type === 'club' && item.tags) {
                    return item.tags.some(tag => 
                        genres.some(genre => tag.toLowerCase().includes(genre.toLowerCase()))
                    );
                }
                return genres.includes(item.genre);
            });
        }
        
        // Фильтрация по году
        if (filters.yearFrom || filters.yearTo) {
            filteredItems = filteredItems.filter(item => {
                if (!item.year) return true; // Для авторов и клубов без года
                const year = parseInt(item.year);
                const from = filters.yearFrom ? parseInt(filters.yearFrom) : 0;
                const to = filters.yearTo ? parseInt(filters.yearTo) : 9999;
                return year >= from && year <= to;
            });
        }
        
        // Фильтрация по рейтингу
        if (filters.minRating) {
            filteredItems = filteredItems.filter(item => {
                if (!item.rating) return true; // Для клубов без рейтинга
                return item.rating >= filters.minRating;
            });
        }
        
        // Поиск по тексту
        if (query && query.trim()) {
            const searchQuery = query.toLowerCase().trim();
            filteredItems = filteredItems.filter(item => {
                // Собираем все текстовые поля для поиска
                const searchableFields = [];
                
                if (item.title) searchableFields.push(item.title);
                if (item.name) searchableFields.push(item.name);
                if (item.author) searchableFields.push(item.author);
                if (item.description) searchableFields.push(item.description);
                if (item.genre) searchableFields.push(item.genre);
                if (item.tags) searchableFields.push(...item.tags);
                
                // Проверяем, содержит ли хотя бы одно поле запрос
                return searchableFields.some(field => 
                    field.toString().toLowerCase().includes(searchQuery)
                );
            });
            
            // Вычисляем релевантность для сортировки
            filteredItems.forEach(item => {
                let relevance = 0;
                const searchQuery = query.toLowerCase().trim();
                
                // Проверяем каждое поле с разным весом
                if (item.title && item.title.toLowerCase().includes(searchQuery)) {
                    relevance += 10;
                }
                if (item.name && item.name.toLowerCase().includes(searchQuery)) {
                    relevance += 10;
                }
                if (item.author && item.author.toLowerCase().includes(searchQuery)) {
                    relevance += 8;
                }
                if (item.description && item.description.toLowerCase().includes(searchQuery)) {
                    relevance += 5;
                }
                if (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchQuery))) {
                    relevance += 3;
                }
                
                item.relevance = relevance;
            });
        }
        
        // Сортировка
        filteredItems.sort((a, b) => {
            const sortType = filters.sort || 'relevance';
            
            switch(sortType) {
                case 'newest':
                    return (b.year || 0) - (a.year || 0);
                    
                case 'title':
                    const titleA = (a.title || a.name || '').toLowerCase();
                    const titleB = (b.title || b.name || '').toLowerCase();
                    return titleA.localeCompare(titleB);
                    
                case 'author':
                    return (a.author || '').localeCompare(b.author || '');
                    
                case 'popular':
                    const popA = (a.members || a.followers || 0);
                    const popB = (b.members || b.followers || 0);
                    return popB - popA;
                    
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                    
                case 'relevance':
                default:
                    return (b.relevance || 0) - (a.relevance || 0);
            }
        });
        
        // Пагинация
        const page = options.page || 1;
        const limit = options.limit || 9; // 9 для сетки 3x3
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedItems = filteredItems.slice(start, end);
        
        console.log('✅ Результаты поиска:', {
            found: filteredItems.length,
            showing: paginatedItems.length,
            page: page,
            totalPages: Math.ceil(filteredItems.length / limit)
        });
        
        // Имитация асинхронного ответа
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    data: paginatedItems,
                    total: filteredItems.length,
                    page: page,
                    totalPages: Math.ceil(filteredItems.length / limit),
                    hasMore: end < filteredItems.length
                });
            }, 300); // Небольшая задержка для реалистичности
        });
    },
    
    // Быстрый поиск для автодополнения
    quickSearch: async function(query, limit = 5) {
        console.log('⚡ Быстрый поиск демо-данных:', query);
        
        const allSuggestions = [
            {
                type: 'book',
                id: 1,
                title: 'Преступление и наказание',
                author: 'Ф.М. Достоевский'
            },
            {
                type: 'book',
                id: 2,
                title: 'Мастер и Маргарита',
                author: 'М.А. Булгаков'
            },
            {
                type: 'book',
                id: 3,
                title: 'Анна Каренина',
                author: 'Л.Н. Толстой'
            },
            {
                type: 'book',
                id: 5,
                title: 'Властелин колец',
                author: 'Дж. Р. Р. Толкин'
            },
            {
                type: 'author',
                id: 101,
                name: 'Фёдор Достоевский'
            },
            {
                type: 'author',
                id: 102,
                name: 'Михаил Булгаков'
            },
            {
                type: 'author',
                id: 103,
                name: 'Лев Толстой'
            },
            {
                type: 'club',
                id: 201,
                name: 'Классика навсегда',
                members: 24
            },
            {
                type: 'club',
                id: 202,
                name: 'Фэнтези и магия',
                members: 35
            },
            {
                type: 'club',
                id: 203,
                name: 'Современная проза',
                members: 18
            }
        ];
        
        if (!query || !query.trim()) {
            return { suggestions: allSuggestions.slice(0, limit) };
        }
        
        const searchQuery = query.toLowerCase().trim();
        const filtered = allSuggestions.filter(item => {
            const searchableText = [
                item.title,
                item.name,
                item.author
            ].filter(Boolean).join(' ').toLowerCase();
            
            return searchableText.includes(searchQuery);
        });
        
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ suggestions: filtered.slice(0, limit) });
            }, 150);
        });
    },
    
    // Получение фильтров
    getFilters: async function() {
        console.log('📋 Загружаю демо-фильтры');
        
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({
                    genres: [
                        { id: 'classic', name: 'Классика', count: 120 },
                        { id: 'fantasy', name: 'Фэнтези', count: 85 },
                        { id: 'scifi', name: 'Научная фантастика', count: 67 },
                        { id: 'drama', name: 'Драма', count: 42 },
                        { id: 'romance', name: 'Роман', count: 56 },
                        { id: 'detective', name: 'Детектив', count: 38 }
                    ],
                    years: {
                        min: 1800,
                        max: 2024
                    },
                    languages: ['Русский', 'Английский', 'Французский'],
                    sortOptions: [
                        { id: 'relevance', name: 'По релевантности' },
                        { id: 'newest', name: 'Сначала новые' },
                        { id: 'popular', name: 'По популярности' },
                        { id: 'title', name: 'По названию (А-Я)' },
                        { id: 'author', name: 'По автору (А-Я)' },
                        { id: 'rating', name: 'По рейтингу' }
                    ]
                });
            }, 200);
        });
    }
};

console.log('✅ SearchDemoData загружен');