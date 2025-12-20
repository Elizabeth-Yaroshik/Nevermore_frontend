/**
 * Интерцептор для логирования всех API запросов
 */
class ApiLogger {
    constructor() {
        this.originalFetch = window.fetch;
        this.originalXHROpen = XMLHttpRequest.prototype.open;
        this.originalXHRSend = XMLHttpRequest.prototype.send;
        this.interceptRequests();
    }
    
    interceptRequests() {
        // Перехватываем Fetch API
        window.fetch = async (...args) => {
            const [resource, config = {}] = args;
            const url = typeof resource === 'string' ? resource : resource.url;
            const method = config.method || 'GET';
            const startTime = Date.now();
            
            // Логируем начало запроса
            if (window.NevermoreLogger) {
                window.NevermoreLogger.debug('API request started', {
                    url,
                    method,
                    headers: config.headers
                });
            }
            
            try {
                const response = await this.originalFetch(...args);
                const duration = Date.now() - startTime;
                
                // Логируем успешный ответ
                if (window.NevermoreLogger) {
                    if (response.ok) {
                        window.NevermoreLogger.info('API request successful', {
                            url,
                            method,
                            status: response.status,
                            statusText: response.statusText,
                            duration: `${duration}ms`
                        });
                    } else {
                        window.NevermoreLogger.warn('API request failed', {
                            url,
                            method,
                            status: response.status,
                            statusText: response.statusText,
                            duration: `${duration}ms`
                        });
                    }
                }
                
                return response;
            } catch (error) {
                const duration = Date.now() - startTime;
                
                // Логируем ошибку сети
                if (window.NevermoreLogger) {
                    window.NevermoreLogger.error('API request network error', {
                        url,
                        method,
                        error: error.message,
                        duration: `${duration}ms`
                    });
                }
                
                throw error;
            }
        };
        
        // Перехватываем XMLHttpRequest
        this.interceptXHR();
    }
    
    interceptXHR() {
        const self = this;
        
        XMLHttpRequest.prototype.open = function(method, url) {
            this._requestMetadata = {
                method,
                url,
                startTime: Date.now()
            };
            return self.originalXHROpen.apply(this, arguments);
        };
        
        XMLHttpRequest.prototype.send = function(body) {
            const metadata = this._requestMetadata;
            
            if (metadata && window.NevermoreLogger) {
                window.NevermoreLogger.debug('XHR request started', {
                    url: metadata.url,
                    method: metadata.method
                });
            }
            
            this.addEventListener('load', function() {
                const duration = Date.now() - metadata.startTime;
                
                if (metadata && window.NevermoreLogger) {
                    if (this.status >= 200 && this.status < 300) {
                        window.NevermoreLogger.info('XHR request successful', {
                            url: metadata.url,
                            method: metadata.method,
                            status: this.status,
                            duration: `${duration}ms`
                        });
                    } else if (this.status >= 400) {
                        window.NevermoreLogger.warn('XHR request failed', {
                            url: metadata.url,
                            method: metadata.method,
                            status: this.status,
                            statusText: this.statusText,
                            duration: `${duration}ms`
                        });
                    }
                }
            });
            
            this.addEventListener('error', function() {
                const duration = Date.now() - metadata.startTime;
                
                if (metadata && window.NevermoreLogger) {
                    window.NevermoreLogger.error('XHR request network error', {
                        url: metadata.url,
                        method: metadata.method,
                        duration: `${duration}ms`
                    });
                }
            });
            
            return self.originalXHRSend.apply(this, arguments);
        };
    }
}

// Автоматически инициализируем при загрузке
document.addEventListener('DOMContentLoaded', () => {
    if (window.NevermoreLogger) {
        new ApiLogger();
        window.NevermoreLogger.info('API logger initialized');
    }
});