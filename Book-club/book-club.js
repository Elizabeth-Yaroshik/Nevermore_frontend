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

// Инициализация клубов
const clubsGrid = document.getElementById('clubsGrid');

// Данные клубов
const clubsData = [
    {
        id: 1,
        name: "Классика навсегда",
        members: 24,
        activity: "высокая",
        description: "Обсуждение классической литературы разных эпох и стран. Читаем и анализируем произведения, которые прошли проверку временем.",
        tags: ["Классика", "Литература", "Анализ"],
        currentBook: "\"Преступление и наказание\" - Ф.М. Достоевский",
        joined: true
    },
    {
        id: 2,
        name: "Мировая литература",
        members: 42,
        activity: "средняя",
        description: "Открываем для себя литературу со всего мира. Каждый месяц - новая страна и новый автор.",
        tags: ["Мировая", "Переводы", "Культура"],
        currentBook: "\"Сто лет одиночества\" - Габриэль Гарсиа Маркес",
        joined: true
    },
    {
        id: 3,
        name: "Современная проза",
        members: 18,
        activity: "высокая",
        description: "Изучаем лучшие произведения современной литературы. От нобелевских лауреатов до молодых авторов.",
        tags: ["Современность", "Проза", "Новинки"],
        currentBook: "\"Книжный вор\" - Маркус Зусак",
        joined: false
    },
    {
        id: 4,
        name: "Драматургия",
        members: 15,
        activity: "низкая",
        description: "Читаем и обсуждаем пьесы от античности до современности. Учимся видеть за текстом сценическое воплощение.",
        tags: ["Пьесы", "Театр", "Диалоги"],
        currentBook: "\"Вишнёвый сад\" - А.П. Чехов",
        joined: false
    },
    {
        id: 5,
        name: "Научная фантастика",
        members: 28,
        activity: "высокая",
        description: "Путешествия во времени, далёкие галактики, технологии будущего. Исследуем лучшие образцы научной фантастики.",
        tags: ["Фантастика", "Наука", "Будущее"],
        currentBook: "\"451° по Фаренгейту\" - Рэй Брэдбери",
        joined: false
    },
    {
        id: 6,
        name: "Фэнтези и магия",
        members: 35,
        activity: "средняя",
        description: "Волшебные миры, эпические битвы, магические системы. Погружаемся в лучшие фэнтези-саги и обсуждаем мировоззрение.",
        tags: ["Фэнтези", "Магия", "Эпика"],
        currentBook: "\"Властелин колец\" - Дж. Р. Р. Толкин",
        joined: false
    }
];

// Функция для создания HTML карточки клуба
function createClubCard(club) {
    const clubCard = document.createElement('a');
    clubCard.href = `../Bookclub/club.html?id=${club.id}&name=${encodeURIComponent(club.name)}`;
    clubCard.className = 'club-card';
    clubCard.dataset.id = club.id;
    clubCard.dataset.joined = club.joined;
    
    // Создаем первые буквы названия для аватара
    const avatarText = club.name.split(' ').map(word => word[0]).join('');
    
    clubCard.innerHTML = `
        <div class="club-header">
            <div class="club-avatar">
                <img src="../resources/Ellipse 2.png" alt="${club.name}">
            </div>
            <div class="club-info">
                <div class="club-name">${club.name}</div>
                <div class="club-meta">
                    <span><i class="fas fa-user-friends"></i> ${club.members} ${getMembersWord(club.members)}</span>
                    <span><i class="fas fa-comments"></i> Активность: ${club.activity}</span>
                </div>
            </div>
        </div>
        
        <div class="club-body">
            <p class="club-description">${club.description}</p>
            
            <div class="club-tags">
                ${club.tags.map(tag => `<span class="club-tag">${tag}</span>`).join('')}
            </div>
            
            <div class="club-current-book">
                <div class="current-book-label">Сейчас читаем:</div>
                <div class="current-book-title">${club.currentBook}</div>
            </div>
        </div>
        
        <div class="club-footer">
            <div class="club-members">
                <i class="fas ${club.joined ? 'fa-user-check' : 'fa-users'}"></i>
                <span>${club.joined ? 'Вы в клубе' : `${club.members} ${getMembersWord(club.members)}`}</span>
            </div>
            <div class="club-actions">
                ${club.joined ? 
                    `<button type="button" class="joined-btn" onclick="event.preventDefault(); leaveClub(${club.id})">
                        <i class="fas fa-sign-out-alt"></i> Выйти
                    </button>` : 
                    `<button type="button" class="join-btn" onclick="event.preventDefault(); joinClub(${club.id})">
                        <i class="fas fa-user-plus"></i> Вступить
                    </button>`
                }
            </div>
        </div>
    `;
    
    return clubCard;
}

// Функция для правильного склонения слова "участник"
function getMembersWord(count) {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'участников';
    }
    
    if (lastDigit === 1) {
        return 'участник';
    } else if (lastDigit >= 2 && lastDigit <= 4) {
        return 'участника';
    } else {
        return 'участников';
    }
}

// Инициализация клубов на странице
function initializeClubs() {
    clubsGrid.innerHTML = '';
    clubsData.forEach(club => {
        clubsGrid.appendChild(createClubCard(club));
    });
}

// Управление вкладками
document.querySelectorAll('.club-tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.club-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const tabType = this.dataset.tab;
        filterClubs(tabType);
    });
});

// Поиск клубов
const searchInput = document.getElementById('searchClubs');
searchInput.addEventListener('input', function() {
    filterClubsBySearch(this.value.toLowerCase());
});

// Модальное окно создания клуба
const createClubBtn = document.getElementById('createClubBtn');
const createClubModal = document.getElementById('createClubModal');
const createClubForm = document.getElementById('createClubForm');

createClubBtn.addEventListener('click', () => {
    createClubModal.style.display = 'flex';
});

function closeModal() {
    createClubModal.style.display = 'none';
}

createClubForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Симуляция создания клуба
    showToast('success', 'Книжный клуб успешно создан!');
    closeModal();
    
    // Очистка формы
    setTimeout(() => {
        this.reset();
    }, 1000);
});

// Клик вне модального окна для закрытия
window.addEventListener('click', function(e) {
    if (e.target === createClubModal) {
        closeModal();
    }
});

// Функции для вступления/выхода из клуба
function joinClub(clubId) {
    const club = clubsData.find(c => c.id === clubId);
    if (club) {
        club.joined = true;
        club.members += 1;
        
        // Перерисовываем карточку
        const oldCard = document.querySelector(`.club-card[data-id="${clubId}"]`);
        const newCard = createClubCard(club);
        oldCard.parentNode.replaceChild(newCard, oldCard);
        
        // Обновляем фильтрацию если активна вкладка "Мои клубы"
        const activeTab = document.querySelector('.club-tab.active').dataset.tab;
        if (activeTab === 'my') {
            filterClubs('my');
        }
        
        showToast('success', 'Вы успешно вступили в клуб!');
    }
}

function leaveClub(clubId) {
    const club = clubsData.find(c => c.id === clubId);
    if (club) {
        club.joined = false;
        club.members = Math.max(0, club.members - 1);
        
        // Перерисовываем карточку
        const oldCard = document.querySelector(`.club-card[data-id="${clubId}"]`);
        const newCard = createClubCard(club);
        oldCard.parentNode.replaceChild(newCard, oldCard);
        
        // Обновляем фильтрацию если активна вкладка "Мои клубы"
        const activeTab = document.querySelector('.club-tab.active').dataset.tab;
        if (activeTab === 'my') {
            filterClubs('my');
        }
        
        showToast('info', 'Вы вышли из клуба');
    }
}

// Фильтрация клубов
function filterClubs(tabType) {
    const clubs = document.querySelectorAll('.club-card');
    
    clubs.forEach(club => {
        const isJoined = club.dataset.joined === 'true';
        const memberCount = parseInt(club.querySelector('.club-members span').textContent.match(/\d+/)?.[0]) || 0;
        const clubId = parseInt(club.dataset.id);
        
        switch(tabType) {
            case 'all':
                club.style.display = 'flex';
                break;
            case 'my':
                club.style.display = isJoined ? 'flex' : 'none';
                break;
            case 'popular':
                // Показываем клубы с > 20 участниками
                club.style.display = memberCount > 20 ? 'flex' : 'none';
                break;
            case 'new':
                // Показываем последние 3 клуба (с id > 3)
                club.style.display = clubId > 3 ? 'flex' : 'none';
                break;
        }
    });
}

function filterClubsBySearch(searchTerm) {
    const clubs = document.querySelectorAll('.club-card');
    
    clubs.forEach(club => {
        const clubName = club.querySelector('.club-name').textContent.toLowerCase();
        const clubDesc = club.querySelector('.club-description').textContent.toLowerCase();
        const clubTags = Array.from(club.querySelectorAll('.club-tag')).map(tag => tag.textContent.toLowerCase());
        
        const matches = clubName.includes(searchTerm) || 
                       clubDesc.includes(searchTerm) ||
                       clubTags.some(tag => tag.includes(searchTerm));
        
        club.style.display = matches ? 'flex' : 'none';
    });
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

// Инициализация при загрузке страницы
initializeClubs();