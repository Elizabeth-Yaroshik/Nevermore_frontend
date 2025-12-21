// services/search-api.js
class SearchAPI {
    constructor() {
        console.log('🔧 SearchAPI инициализирован');
        this.useDemoData = true; // Всегда используем демо-данные
    }

    async search(query, filters = {}, options = {}) {
        console.log('🔍 SearchAPI.search вызван:', { query, filters, options });
        
        try {
            // Проверяем доступность демо-данных
            if (!window.SearchDemoData) {
                console.error('❌ SearchDemoData не найден!');
                throw new Error('SearchDemoData не найден');
            }
            
            // Вызываем демо-поиск
            const result = await window.SearchDemoData.search(query, filters, options);
            console.log('✅ SearchAPI.search успешен:', result);
            return result;
            
        } catch (error) {
            console.error('❌ SearchAPI.search ошибка:', error);
            
            // Возвращаем пустые данные при ошибке
            return {
                data: [],
                total: 0,
                page: options.page || 1,
                totalPages: 0,
                hasMore: false
            };
        }
    }

    async quickSearch(query, limit = 5) {
        console.log('⚡ SearchAPI.quickSearch:', query);
        
        try {
            if (!window.SearchDemoData) {
                throw new Error('SearchDemoData не найден');
            }
            
            const result = await window.SearchDemoData.quickSearch(query, limit);
            console.log('✅ SearchAPI.quickSearch успешен');
            return result;
            
        } catch (error) {
            console.error('❌ SearchAPI.quickSearch ошибка:', error);
            return { suggestions: [] };
        }
    }

    async getFilters() {
        console.log('📋 SearchAPI.getFilters');
        
        try {
            if (!window.SearchDemoData) {
                throw new Error('SearchDemoData не найден');
            }
            
            const result = await window.SearchDemoData.getFilters();
            console.log('✅ SearchAPI.getFilters успешен');
            return result;
            
        } catch (error) {
            console.error('❌ SearchAPI.getFilters ошибка:', error);
            
            // Возвращаем базовые фильтры
            return {
                genres: [
                    { id: 'classic', name: 'Классика', count: 10 },
                    { id: 'fantasy', name: 'Фэнтези', count: 8 }
                ],
                years: { min: 1800, max: 2024 },
                languages: ['Русский'],
                sortOptions: [
                    { id: 'relevance', name: 'По релевантности' },
                    { id: 'newest', name: 'Сначала новые' }
                ]
            };
        }
    }
}

// Создаем глобальный экземпляр API
window.SearchAPI = new SearchAPI();
console.log('✅ SearchAPI готов к работе');