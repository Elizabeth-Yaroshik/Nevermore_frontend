// Сервис для работы с API авторов
const API_BASE_URL = 'https://natosha-considerable-rheumily.ngrok-free.dev';

class AuthorsService {
    constructor() {
        this.token = localStorage.getItem('authToken');
    }

    // Общий метод для запросов
    async request(endpoint, method = 'GET', body = null) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const options = {
            method,
            headers,
        };

        if (body && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Получить список авторов
    async getAuthors(filters = {}) {
        let url = '/author/list';
        
        // Добавляем параметры фильтрации
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                params.append(key, filters[key]);
            }
        });
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return this.request(url);
    }

    // Получить автора по ID
    async getAuthor(id) {
        return this.request(`/author/get/${id}`);
    }

    // Обновить автора
    async updateAuthor(id, data) {
        return this.request(`/author/update/${id}`, 'PUT', data);
    }

    // Удалить автора
    async deleteAuthor(id) {
        return this.request(`/author/delete/${id}`, 'DELETE');
    }

    // Сохранить автора
    async saveAuthor(authorId) {
        return this.request('/saved-author/create', 'POST', { authorId });
    }

    // Удалить сохраненного автора
    async removeSavedAuthor(savedAuthorId) {
        return this.request('/saved-author/delete', 'DELETE', { id: savedAuthorId });
    }

    // Получить сохраненных авторов
    async getSavedAuthors() {
        return this.request('/saved-author/list');
    }
}

// Экспортируем экземпляр сервиса
const authorsService = new AuthorsService();