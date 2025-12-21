// chat-api.js
let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

function connectToChat() {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '../Authorization/auth.html';
        return;
    }

    // Закрываем старое соединение если есть
    if (socket) {
        socket.close();
    }

    // Подключаемся к WebSocket
    const wsUrl = 'wss://natosha-considerable-rheumily.ngrok-free.dev/chat/ws';
    
    socket = new WebSocket(wsUrl);

    socket.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts = 0;
        
        // Отправляем токен для аутентификации
        socket.send(JSON.stringify({
            type: 'auth',
            token: `Bearer ${token}`
        }));
    };

    socket.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            handleChatMessage(message);
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    };

    socket.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
        console.log('WebSocket disconnected');
        
        // Пробуем переподключиться
        if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttempts++;
            setTimeout(() => {
                console.log(`Попытка переподключения ${reconnectAttempts}`);
                connectToChat();
            }, 3000 * reconnectAttempts);
        }
    };
}

function handleChatMessage(message) {
    switch (message.type) {
        case 'chat_message':
            addMessageToChat(message);
            break;
        case 'user_online':
            updateOnlineUsers(message.users);
            break;
        case 'user_offline':
            updateOnlineUsers(message.users);
            break;
        case 'error':
            console.error('Chat error:', message.error);
            if (message.error === 'Invalid token') {
                apiUtils.refreshToken().then(refreshed => {
                    if (refreshed) {
                        connectToChat();
                    }
                });
            }
            break;
    }
}

function addMessageToChat(msg) {
    const body = document.querySelector('.chat-body');
    if (!body) return;
    
    const messageDiv = document.createElement('div');
    
    // Определяем класс в зависимости от отправителя
    let msgClass = 'left';
    const currentUserId = apiUtils.getCurrentUserId();
    
    if (msg.user_id === currentUserId) {
        msgClass = 'right';
    }
    
    messageDiv.classList.add('msg', msgClass);
    messageDiv.innerHTML = `
        <div class="content">${msg.content || msg.text || ''}</div>
        <div class="time">${apiUtils.formatTime(msg.created_at || msg.timestamp)}</div>
        ${msgClass === 'left' ? `<div class="username">${msg.username || 'Пользователь'}</div>` : ''}
    `;
    
    body.appendChild(messageDiv);
    scrollToBottom();
}

function sendChatMessage(content) {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket не подключен');
        // Локальное сохранение сообщения
        addMessageToChat({
            content: content,
            created_at: new Date().toISOString(),
            user_id: apiUtils.getCurrentUserId(),
            username: localStorage.getItem('username') || 'Вы'
        });
        return;
    }
    
    const message = {
        type: 'chat_message',
        content: content,
        timestamp: new Date().toISOString()
    };
    
    socket.send(JSON.stringify(message));
    
    // Локальное отображение
    addMessageToChat({
        content: content,
        created_at: new Date().toISOString(),
        user_id: apiUtils.getCurrentUserId(),
        username: localStorage.getItem('username') || 'Вы'
    });
}

function updateOnlineUsers(users) {
    const statusElement = document.querySelector('.chat-user .status');
    if (statusElement) {
        const onlineCount = users ? users.length : 0;
        statusElement.textContent = `online - ${onlineCount}`;
    }
}

function scrollToBottom() {
    const body = document.querySelector('.chat-body');
    if (body) {
        body.scrollTop = body.scrollHeight;
    }
}

function loadChatHistory() {
    apiUtils.apiRequest('/chat/messages?limit=50')
        .then(messages => {
            const body = document.querySelector('.chat-body');
            if (!body) return;
            
            body.innerHTML = '';
            
            messages.forEach(msg => {
                addMessageToChat(msg);
            });
            
            scrollToBottom();
        })
        .catch(error => {
            console.error('Failed to load chat history:', error);
        });
}

// Экспортируем функции
window.chatApi = {
    connectToChat,
    sendChatMessage,
    loadChatHistory,
    updateOnlineUsers
};