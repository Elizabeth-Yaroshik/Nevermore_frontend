// chat.js
document.addEventListener("DOMContentLoaded", () => {
    // Проверяем авторизацию
    if (!apiUtils || !apiUtils.checkAuth()) {
        return;
    }
    
    const input = document.querySelector(".chat-input input");
    const sendBtn = document.querySelector(".send");
    const body = document.querySelector(".chat-body");
    
    // Загружаем историю сообщений
    if (chatApi && chatApi.loadChatHistory) {
        chatApi.loadChatHistory();
    }
    
    // Подключаемся к WebSocket чату
    if (chatApi && chatApi.connectToChat) {
        chatApi.connectToChat();
    }
    
    function getTime() {
        const d = new Date();
        return d.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit"
        });
    }
    
    function scrollToBottom() {
        if (body) {
            body.scrollTop = body.scrollHeight;
        }
    }
    
    function sendMessage() {
        const text = input.value.trim();
        if (!text) return;
        
        if (chatApi && chatApi.sendChatMessage) {
            chatApi.sendChatMessage(text);
        } else {
            // Fallback на локальный чат
            const msg = document.createElement("div");
            msg.classList.add("msg", "right");
            msg.innerHTML = `<div class="content">${text}</div><div class="time">${getTime()}</div>`;
            
            body.appendChild(msg);
        }
        
        input.value = "";
        scrollToBottom();
    }
    
    // Добавляем обработчики событий
    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }
    
    if (input) {
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendMessage();
                e.preventDefault();
            }
        });
    }
    
    // Добавляем username к сообщениям справа
    const username = localStorage.getItem('username') || 'Вы';
    
    // Скролл вниз при загрузке
    setTimeout(scrollToBottom, 100);
});