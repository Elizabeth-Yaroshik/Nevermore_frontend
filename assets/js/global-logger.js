/**
 * Глобальный логгер для всего приложения Nevermore
 * Отправляет логи на бэкенд для анализа
 */
class GlobalLogger {
    constructor(config = {}) {
        this.config = {
            endpoint: config.endpoint || '/api/logs',
            bufferSize: config.bufferSize || 5,
            flushInterval: config.flushInterval || 10000, // 10 секунд
            enabled: config.enabled !== false,
            debugMode: config.debugMode || false
        };
        
        this.buffer = [];
        this.isFlushing = false;
        this.sessionId = this.generateSessionId();
        this.userId = localStorage.getItem('userId') || 'anonymous';
        
        // Авто-очистка
        if (this.config.enabled) {
            setInterval(() => this.flush(), this.config.flushInterval);
            this.setupGlobalErrorHandling();
            
            // Логируем старт сессии
            this.info('Application session started', {
                userId: this.userId,
                appVersion: '1.0.0'
            });
        }
    }
    
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    setupGlobalErrorHandling() {
        // Глобальные ошибки JavaScript
        window.addEventListener('error', (event) => {
            this.error('JavaScript runtime error', {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack
            });
        });
        
        // Необработанные промисы
        window.addEventListener('unhandledrejection', (event) => {
            this.error('Unhandled promise rejection', {
                reason: event.reason?.toString()
            });
        });
        
        // Ошибки загрузки ресурсов
        window.addEventListener('error', (event) => {
            const target = event.target;
            if (target && (target.tagName === 'IMG' || target.tagName === 'SCRIPT' || target.tagName === 'LINK')) {
                this.warn('Resource failed to load', {
                    resourceType: target.tagName,
                    src: target.src || target.href,
                    id: target.id
                });
            }
        }, true);
    }
    
    createEntry(level, message, data = {}) {
        return {
            level,
            message,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            userId: this.userId,
            page: window.location.pathname,
            url: window.location.href,
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            screen: `${window.screen.width}x${window.screen.height}`,
            data: data
        };
    }
    
    log(level, message, data = {}) {
        if (!this.config.enabled) return null;
        
        const entry = this.createEntry(level, message, data);
        
        // Локальный вывод в консоль
        const consoleMethod = console[level] || console.log;
        if (this.config.debugMode) {
            consoleMethod(`[Nevermore:${level.toUpperCase()}] ${message}`, data);
        }
        
        // Добавляем в буфер
        this.buffer.push(entry);
        
        // Автоматическая отправка при заполнении буфера
        if (this.buffer.length >= this.config.bufferSize) {
            this.flush();
        }
        
        return entry;
    }
    
    info(message, data) {
        return this.log('info', message, data);
    }
    
    warn(message, data) {
        return this.log('warn', message, data);
    }
    
    error(message, data) {
        return this.log('error', message, data);
    }
    
    debug(message, data) {
        return this.log('debug', message, data);
    }
    // В global-logger.js добавим:
trackSearch(query, filters = {}) {
    this.info('Search performed', {
        query,
        filters,
        timestamp: new Date().toISOString(),
        page: window.location.pathname
    });
    
    // Отправка аналитики если нужно
    if (typeof gtag !== 'undefined') {
        gtag('event', 'search', {
            search_term: query
        });
    }
}
    
    async flush() {
        if (this.isFlushing || this.buffer.length === 0 || !this.config.enabled) {
            return;
        }
        
        this.isFlushing = true;
        const logsToSend = [...this.buffer];
        this.buffer = [];
        
        try {
            const response = await fetch(this.config.endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logsToSend)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            if (this.config.debugMode) {
                console.debug(`[Nevermore] Sent ${logsToSend.length} logs`, result);
            }
        } catch (error) {
            console.error('[Nevermore] Failed to send logs:', error);
            // Возвращаем логи в буфер при ошибке
            this.buffer.unshift(...logsToSend);
        } finally {
            this.isFlushing = false;
        }
    }
    
    // Методы для отслеживания пользовательских действий
    trackNavigation(from, to) {
        return this.info('User navigation', { from, to });
    }
    
    trackClick(elementType, elementId, additionalData = {}) {
        return this.info('User interaction', {
            action: 'click',
            elementType,
            elementId,
            ...additionalData
        });
    }
    
    trackSearch(query, resultsCount = null) {
        return this.info('Search performed', {
            action: 'search',
            query,
            resultsCount
        });
    }
    
    trackFormSubmit(formId, formData = {}) {
        return this.info('Form submitted', {
            action: 'form_submit',
            formId,
            fieldsCount: Object.keys(formData).length
        });
    }
    
    trackApiCall(method, endpoint, status = null, duration = null) {
        return this.info('API request', {
            action: 'api_call',
            method,
            endpoint,
            status,
            duration
        });
    }
    
    // Принудительная отправка всех логов
    async forceFlush() {
        await this.flush();
    }
    
    // Получить текущие настройки
    getConfig() {
        return { ...this.config };
    }
    
    // Изменить настройки
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        return this.config;
    }
}

// Создаем глобальный экземпляр логгера
window.NevermoreLogger = new GlobalLogger({
    endpoint: '/api/logs',
    bufferSize: 5,
    flushInterval: 10000,
    enabled: true,
    debugMode: window.location.hostname === 'localhost' // Включить debug на localhost
});

