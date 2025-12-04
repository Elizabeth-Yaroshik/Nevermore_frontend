document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('bookId');
    const chapterId = urlParams.get('chapter') || 0;

    if (bookId) {
        loadBookForReading(bookId, chapterId);
        setupReaderControls();
    }
});

async function loadBookForReading(bookId, chapterId) {
    try {
        // Получаем данные книги (можно использовать те же, что в book.js)
        const booksData = [
            { 
                id: 1, 
                title: "Преступление и наказание", 
                chapters: [
                    "Часть первая", "Часть вторая", "Часть третья", 
                    "Часть четвертая", "Часть пятая", "Часть шестая", "Эпилог"
                ],
                text: {
                    0: `В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С-м переулке, на улицу и медленно, как бы в нерешимости, отправился к К-ну мосту.
                        
Он благополучно избегнул встречи с своею хозяйкой на лестнице. Каморка его приходилась под самою кровлей высокого пятиэтажного дома и походила более на шкаф, чем на квартиру. Квартирная же хозяйка его, у которой он нанимал эту каморку с обедом и прислугой, помещалась одною лестницей ниже, в отдельной квартире, и каждый раз, при выходе на улицу, ему непременно надо было проходить мимо хозяйкиной кухни, почти всегда настежь отворенной на ту лестницу. И каждый раз молодой человек, проходя мимо, чувствовал какое-то болезненное и трусливое ощущение, которого стыдился и от которого морщился. Он был должен кругом хозяйке и боялся с нею встретиться.`,

                    1: `Раскольников был необыкновенно хорош собою, с прекрасными темными глазами, темно-рус, ростом выше среднего, тонок и строен. Но вскоре он впал в какую-то глубокую задумчивость, даже, лучше сказать, в какую-то забывчивость, и стал забываться, а вернее сказать, перестал думать, хотя и продолжал стоять на одном месте. Вдруг он вздрогнул: не старая ли мысль опять пришла ему в голову под влиянием, может быть, одного и того же, видения?
                        
Он оглянулся и увидел, что стоит почти у самой своей квартиры. Он дошел до своего дома, не помня как. Войдя в свою каморку, он бросился на диван и просидел так с полчаса, не двигаясь и не думая ни о чем. Потом ему вдруг показалось, что он уже очень голоден. Он встал и увидел на столе оставшийся от вчерашнего обеда кусок хлеба. Он съел его жадно и запил водой из графина. Кончив, он снова лег на диван, но сон не приходил. Напротив, в голове его мысли стали работать яснее и быстрее.`,

                    2: `Он был до того худо одет, что иной, даже и привычный человек, посовестился бы днем выходить в таких лохмотьях на улицу. Впрочем, квартал был таков, что костюмом здесь было трудно кого-нибудь удивить. Близость Сенной, обилие известного рода заведений и, по преимуществу, ремесленного и рабочего населения, скучившегося в этих средних и мелких улицах Петербурга, пестрили иногда общую картину такими субъектами, что странно было бы и удивляться при встрече с иною фигурой.
                        
Но столько злобного презрения накопилось уже в душе молодого человека, что, несмотря на всю свою, иногда очень молодую, щепетильность, он менее всего совестился своих лохмотьев на улице. Другое дело при встрече с иными знакомыми или с прежними товарищами, с которыми вообще он не любил встречаться...`
                }
            },
            { 
                id: 2, 
                title: "Над пропастью во ржи", 
                chapters: [
                    "Глава 1", "Глава 2", "Глава 3", "Глава 4", "Глава 5",
                    "Глава 6", "Глава 7", "Глава 8", "Глава 9", "Глава 10"
                ],
                text: {
                    0: `Если вы на самом деле хотите это слушать, то первым делом, наверно, захотите узнать, где я родился и как провел свое дурацкое детство, и что там у меня за родители были, и чем они занимались до того, как я появился, и вообще всю эту давидову лабуду про мое семейство, но мне, если честно, не хочется в это вдаваться. Мои родители — хорошие люди, и все такое, но мне неохота много о них рассказывать.
                        
Во-первых, такое дело утомительное, а во-вторых, они здорово расстроятся, если я тут начну болтать об их личной жизни. Они вообще парни щепетильные, особенно отец. Он не из тех, кто много говорит, но когда говорит, так это всегда по делу. Во всяком случае, они оба — неплохие люди. Не скажу, чтобы уж очень, но неплохие.`,

                    1: `Одним словом, они написали целую кучу дерьма обо мне, но я не буду на это злиться. Вся эта история началась в Рождество, когда я чуть не угробился. Я тогда заболел и попал в санаторий, а оттуда уже меня отправили сюда, чтобы я "отдохнул". Смешно, правда? Ну да ладно. Это одна из тех историй, которые хочется рассказывать с самого начала, иначе ничего не поймешь.`
                }
            }
        ];

        const book = booksData.find(b => b.id == bookId);
        
        if (book) {
            // Устанавливаем заголовок
            document.getElementById('readerBookTitle').textContent = book.title;
            
            // Загружаем главы в select
            const chapterSelect = document.getElementById('chapterSelect');
            chapterSelect.innerHTML = '<option value="">Выберите главу</option>';
            
            book.chapters.forEach((chapter, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = chapter;
                chapterSelect.appendChild(option);
            });
            
            // Устанавливаем выбранную главу
            if (chapterId >= 0 && chapterId < book.chapters.length) {
                chapterSelect.value = chapterId;
                loadChapterText(book, chapterId);
            } else {
                loadChapterText(book, 0);
            }
            
            // Обновляем прогресс
            updateProgress(parseInt(chapterId) || 0, book.chapters.length);
        }
    } catch (error) {
        console.error('Error loading book:', error);
        document.getElementById('bookText').innerHTML = 
            '<p style="color: #dc2626; text-align: center;">Ошибка загрузки книги. Попробуйте позже.</p>';
    }
}

function loadChapterText(book, chapterId) {
    const textContainer = document.getElementById('bookText');
    
    if (book.text && book.text[chapterId]) {
        // Если есть текст главы
        const chapterTitle = book.chapters[chapterId];
        const chapterText = book.text[chapterId];
        
        // Разбиваем текст на абзацы и форматируем
        const paragraphs = chapterText.split('\n\n').map(paragraph => {
            if (paragraph.trim()) {
                return `<p style="text-indent: 2em; margin-bottom: 20px; text-align: justify;">${paragraph}</p>`;
            }
            return '';
        }).join('');
        
        textContainer.innerHTML = `
            <h2 style="color: #4F378B; margin-bottom: 30px; text-align: center; border-bottom: 2px solid #D0BCFF; padding-bottom: 10px;">
                ${chapterTitle}
            </h2>
            ${paragraphs}
        `;
    } else {
        // Если текста нет, показываем заглушку
        textContainer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2 style="color: #4F378B; margin-bottom: 20px;">${book.chapters[chapterId]}</h2>
                <p style="font-style: italic; color: #666; margin-bottom: 30px;">
                    Текст главы временно недоступен. Мы работаем над добавлением полного текста книги.
                </p>
                <p style="color: #888;">
                    Здесь будет полный текст выбранной главы книги "${book.title}".
                    В демонстрационной версии отображается только структура страницы чтения.
                </p>
            </div>
        `;
    }
    
    // Прокручиваем к началу текста
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupReaderControls() {
    // Навигация по главам
    const chapterSelect = document.getElementById('chapterSelect');
    const prevBtn = document.getElementById('prevChapter');
    const nextBtn = document.getElementById('nextChapter');
    
    chapterSelect.addEventListener('change', function() {
        if (this.value !== '') {
            const urlParams = new URLSearchParams(window.location.search);
            urlParams.set('chapter', this.value);
            window.location.search = urlParams.toString();
        }
    });
    
    prevBtn.addEventListener('click', () => {
        const currentChapter = parseInt(chapterSelect.value) || 0;
        if (currentChapter > 0) {
            chapterSelect.value = currentChapter - 1;
            chapterSelect.dispatchEvent(new Event('change'));
        }
    });
    
    nextBtn.addEventListener('click', () => {
        const currentChapter = parseInt(chapterSelect.value) || 0;
        const totalChapters = chapterSelect.options.length - 1;
        if (currentChapter < totalChapters - 1) {
            chapterSelect.value = currentChapter + 1;
            chapterSelect.dispatchEvent(new Event('change'));
        }
    });
    
    // Настройки шрифта
    const textElement = document.getElementById('bookText');
    const fontSizeSmall = document.getElementById('fontSizeSmall');
    const fontSizeNormal = document.getElementById('fontSizeNormal');
    const fontSizeLarge = document.getElementById('fontSizeLarge');
    
    fontSizeSmall.addEventListener('click', () => {
        textElement.className = 'font-small';
        saveSetting('fontSize', 'small');
    });
    
    fontSizeNormal.addEventListener('click', () => {
        textElement.className = '';
        saveSetting('fontSize', 'normal');
    });
    
    fontSizeLarge.addEventListener('click', () => {
        textElement.className = 'font-large';
        saveSetting('fontSize', 'large');
    });
    
    // Убираем кнопку темной темы из HTML или скрываем её
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.style.display = 'none';
    }
    
    // Закладки
    const bookmarkBtn = document.getElementById('bookmarkBtn');
    bookmarkBtn.addEventListener('click', () => {
        const bookId = new URLSearchParams(window.location.search).get('bookId');
        const chapter = chapterSelect.value;
        
        if (bookId && chapter) {
            const bookmarks = JSON.parse(localStorage.getItem('bookmarks') || '[]');
            const existingIndex = bookmarks.findIndex(b => b.bookId === bookId && b.chapter === chapter);
            
            if (existingIndex === -1) {
                bookmarks.push({
                    bookId,
                    chapter,
                    chapterName: chapterSelect.options[chapterSelect.selectedIndex].text,
                    date: new Date().toISOString()
                });
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                showToast('Закладка добавлена!', 'success');
                bookmarkBtn.classList.add('active');
            } else {
                bookmarks.splice(existingIndex, 1);
                localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
                showToast('Закладка удалена!', 'info');
                bookmarkBtn.classList.remove('active');
            }
        }
    });
    
    // Загрузка сохраненных настроек
    loadSettings();
}

function updateProgress(currentChapter, totalChapters) {
    const progress = ((currentChapter + 1) / totalChapters) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    
    document.getElementById('currentPosition').textContent = 
        `Глава ${currentChapter + 1} из ${totalChapters}`;
    
    // Примерное время чтения
    const estimatedTime = Math.round(totalChapters * 20); // 20 минут на главу
    const hours = Math.floor(estimatedTime / 60);
    const minutes = estimatedTime % 60;
    
    let timeText = 'Примерное время чтения: ';
    if (hours > 0) {
        timeText += `${hours} ч `;
    }
    timeText += `${minutes} мин`;
    
    document.getElementById('readingTime').textContent = timeText;
}

function saveSetting(key, value) {
    localStorage.setItem(`reader_${key}`, value);
}

function loadSettings() {
    // Шрифт
    const fontSize = localStorage.getItem('reader_fontSize');
    const textElement = document.getElementById('bookText');
    
    if (fontSize === 'small') {
        textElement.className = 'font-small';
    } else if (fontSize === 'large') {
        textElement.className = 'font-large';
    }
}

function showToast(message, type = 'info') {
    // Создаем контейнер для тостов если его нет
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    
    // Создаем тост
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
    
    // Удаляем тост через 4 секунды
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 4000);
}