const API_BASE_URL = 'https://4ee4b751a306736111235546528c12f7.serveo.net';

document.addEventListener('DOMContentLoaded', function() {
  const authForm = document.getElementById('authForm');
  
  authForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Сброс сообщений об ошибках
    document.querySelectorAll('.error-message').forEach(el => {
      el.textContent = '';
      el.classList.remove('error-visible');
    });
    
    const globalMessage = document.getElementById('globalMessage');
    globalMessage.textContent = '';
    globalMessage.className = 'global-message';
    
    // Получение значений полей
    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value;
    
    let isValid = true;
    
    // Валидация логина (email)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!login) {
      showError('loginError', 'Пожалуйста, введите email');
      isValid = false;
    } else if (!emailRegex.test(login)) {
      showError('loginError', 'Пожалуйста, введите корректный email');
      isValid = false;
    }
    
    // Валидация пароля
    if (!password) {
      showError('passwordError', 'Пожалуйста, введите пароль');
      isValid = false;
    }
    
    // Если форма валидна
    if (isValid) {
      try {
        // Отправка данных на сервер
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: login,
            password: password
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Сохраняем токены в localStorage
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('refresh_token', data.refresh_token);
          
          showGlobalMessage('Успешный вход!', 'success');
          
          // Перенаправление на главную страницу через 1 секунду
          setTimeout(() => {
            window.location.href = '../index.html';
          }, 1000);
        } else {
          showGlobalMessage(data.error || 'Ошибка при входе', 'error');
        }
      } catch (error) {
        console.error('Ошибка:', error);
        showGlobalMessage('Ошибка соединения с сервером', 'error');
      }
    }
  });
  
  // Функция для показа ошибок
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.classList.add('error-visible');
  }
  
  // Функция для показа глобальных сообщений
  function showGlobalMessage(message, type) {
    const globalMessage = document.getElementById('globalMessage');
    globalMessage.textContent = message;
    globalMessage.classList.add(type);
  }
});