const API_BASE_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', function() {
  const registerForm = document.getElementById('registerForm');
  
  registerForm.addEventListener('submit', async function(e) {
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
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    let isValid = true;
    
    // Валидация имени
    if (!name) {
      showError('nameError', 'Пожалуйста, введите ваше имя');
      isValid = false;
    } else if (name.length < 2) {
      showError('nameError', 'Имя должно содержать не менее 2 символов');
      isValid = false;
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      showError('emailError', 'Пожалуйста, введите email');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      showError('emailError', 'Пожалуйста, введите корректный email');
      isValid = false;
    }
    
    // Валидация пароля
    if (!password) {
      showError('passwordError', 'Пожалуйста, введите пароль');
      isValid = false;
    } else if (password.length < 6) {
      showError('passwordError', 'Пароль должен содержать не менее 6 символов');
      isValid = false;
    }
    
    // Проверка совпадения паролей
    if (!confirmPassword) {
      showError('confirmPasswordError', 'Пожалуйста, подтвердите пароль');
      isValid = false;
    } else if (password !== confirmPassword) {
      showError('confirmPasswordError', 'Пароли не совпадают');
      isValid = false;
    }
    
    // Если форма валидна
    if (isValid) {
      try {
        // Отправка данных на сервер
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            phone_number: '' // Добавляем обязательное поле из спецификации
          })
        });

        const data = await response.json();

        if (response.ok) {
          showGlobalMessage(data.message || 'Регистрация прошла успешно!', 'success');
          
          // Очистка формы
          registerForm.reset();
          
          // Перенаправление на страницу авторизации через 2 секунды
          setTimeout(() => {
            window.location.href = '../Authorization/auth.html';
          }, 2000);
        } else {
          showGlobalMessage(data.error || 'Ошибка при регистрации', 'error');
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
  
  // Реальная валидация при вводе
  document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    const errorElement = document.getElementById('confirmPasswordError');
    
    if (confirmPassword && password !== confirmPassword) {
      errorElement.textContent = 'Пароли не совпадают';
      errorElement.classList.add('error-visible');
    } else {
      errorElement.textContent = '';
      errorElement.classList.remove('error-visible');
    }
  });
});