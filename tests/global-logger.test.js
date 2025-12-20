import { GlobalLogger } from '../assets/js/global-logger.js';

describe('GlobalLogger', () => {
    let logger;
    let mockFetch;
    
    beforeEach(() => {
        // Мокаем fetch
        mockFetch = jest.fn(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ status: 'logs_received', count: 3 })
            })
        );
        global.fetch = mockFetch;
        
        // Мокаем localStorage
        Storage.prototype.getItem = jest.fn(() => 'user123');
        
        // Создаем логгер с тестовыми настройками
        logger = new GlobalLogger({
            endpoint: '/api/logs',
            bufferSize: 2,
            flushInterval: 10000,
            enabled: true,
            debugMode: false
        });
    });
    
    afterEach(() => {
        jest.clearAllMocks();
    });
    
    test('should create log entry with session ID', () => {
        const entry = logger.info('Test message', { test: 'data' });
        
        expect(entry).toHaveProperty('sessionId');
        expect(entry.sessionId).toMatch(/^session_\d+_/);
        expect(entry).toHaveProperty('userId', 'user123');
        expect(entry).toHaveProperty('page');
        expect(entry.data).toHaveProperty('test', 'data');
    });
    
    test('should buffer logs and flush automatically', async () => {
        logger.info('Message 1');
        logger.info('Message 2'); // Должен вызвать flush
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(logger.buffer.length).toBe(0);
    });
    
    test('should track user actions', () => {
        const navEntry = logger.trackNavigation('/home', '/books');
        expect(navEntry.message).toBe('User navigation');
        expect(navEntry.data).toHaveProperty('from', '/home');
        expect(navEntry.data).toHaveProperty('to', '/books');
        
        const clickEntry = logger.trackClick('button', 'submit-btn', { form: 'login' });
        expect(clickEntry.message).toBe('User interaction');
        expect(clickEntry.data).toHaveProperty('action', 'click');
        expect(clickEntry.data).toHaveProperty('elementType', 'button');
    });
    
    test('should handle API call tracking', () => {
        const apiEntry = logger.trackApiCall('GET', '/api/books', 200, 150);
        expect(apiEntry.message).toBe('API request');
        expect(apiEntry.data).toHaveProperty('method', 'GET');
        expect(apiEntry.data).toHaveProperty('endpoint', '/api/books');
        expect(apiEntry.data).toHaveProperty('status', 200);
        expect(apiEntry.data).toHaveProperty('duration', 150);
    });
});