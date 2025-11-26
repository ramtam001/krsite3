document.addEventListener('DOMContentLoaded', function() {
    // Инициализация доступности
    initAccessibility();
    
    // Инициализация формы
    initFormValidation();
    
    // Инициализация навигации
    initKeyboardNavigation();
});

function initAccessibility() {
    // Добавляем skip-link для быстрой навигации
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content';
    skipLink.className = 'skip-link';
    skipLink.textContent = 'Перейти к основному содержанию';
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Добавляем ID для main content
    const mainContent = document.querySelector('main');
    if (mainContent) {
        mainContent.id = 'main-content';
    }
    
    // Скрываем декоративные элементы от скринридеров
    const requiredSpans = document.querySelectorAll('.required');
    requiredSpans.forEach(span => {
        span.setAttribute('aria-hidden', 'true');
    });
    
    // Добавляем описания для семантических элементов
    const form = document.querySelector('form');
    if (form && !form.getAttribute('aria-labelledby')) {
        const heading = form.querySelector('h2') || document.querySelector('h1');
        if (heading) {
            if (!heading.id) {
                heading.id = 'form-heading-' + Date.now();
            }
            form.setAttribute('aria-labelledby', heading.id);
        }
    }
}

function initFormValidation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    const nameInput = document.getElementById('name');
    const nameError = document.getElementById('name-error');
    const emailInput = document.getElementById('email');
    const topicSelect = document.getElementById('topic');

    // Валидация имени при потере фокуса
    if (nameInput) {
        nameInput.addEventListener('blur', function() {
            validateNameField(this, nameError);
        });
        
        nameInput.addEventListener('input', function() {
            if (this.getAttribute('aria-invalid') === 'true') {
                validateNameField(this, nameError);
            }
        });
    }

    // Валидация email
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            validateEmailField(this);
        });
    }

    // Валидация при отправке формы
    form.addEventListener('submit', function(event) {
        const errors = validateForm();
        
        if (errors.length > 0) {
            event.preventDefault();
            showFormErrors(errors);
        } else {
            // Симуляция успешной отправки для демонстрации
            event.preventDefault();
            showSuccessMessage();
        }
    });

    // Добавляем live region для динамических сообщений
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'visually-hidden';
    form.appendChild(liveRegion);
}

function validateNameField(input, errorElement) {
    const value = input.value.trim();
    
    if (!value) {
        input.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.style.display = 'block';
        }
        return false;
    } else if (value.length < 2) {
        input.setAttribute('aria-invalid', 'true');
        if (errorElement) {
            errorElement.textContent = 'Имя должно содержать минимум 2 символа';
            errorElement.style.display = 'block';
        }
        return false;
    } else {
        input.setAttribute('aria-invalid', 'false');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    }
}

function validateEmailField(input) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value && !emailRegex.test(value)) {
        input.setAttribute('aria-invalid', 'true');
        
        // Создаем или обновляем сообщение об ошибке
        let errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error')) {
            errorElement = document.createElement('div');
            errorElement.className = 'error';
            errorElement.id = 'email-error';
            input.parentNode.insertBefore(errorElement, input.nextElementSibling);
        }
        
        errorElement.textContent = 'Введите корректный email адрес';
        errorElement.style.display = 'block';
        return false;
    } else {
        input.setAttribute('aria-invalid', 'false');
        const errorElement = document.getElementById('email-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        return true;
    }
}

function validateForm() {
    const errors = [];
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const topicSelect = document.getElementById('topic');
    
    // Проверка обязательного поля имени
    if (nameInput && !nameInput.value.trim()) {
        errors.push({
            field: nameInput,
            message: 'Поле "Имя" обязательно для заполнения'
        });
    }
    
    // Проверка валидности email (если заполнен)
    if (emailInput && emailInput.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value.trim())) {
            errors.push({
                field: emailInput,
                message: 'Введите корректный email адрес'
            });
        }
    }
    
    return errors;
}

function showFormErrors(errors) {
    // Показываем ошибки
    errors.forEach(error => {
        error.field.setAttribute('aria-invalid', 'true');
        error.field.focus();
    });
    
    // Анонсируем ошибки для скринридеров
    const errorMessage = `В форме обнаружено ${errors.length} ошибок. Пожалуйста, исправьте их перед отправкой.`;
    announceToScreenReader(errorMessage, 'assertive');
    
    // Показываем визуальное уведомление
    showNotification(errorMessage, 'error');
}

function showSuccessMessage() {
    const message = 'Форма успешно отправлена! Мы свяжемся с вами в ближайшее время.';
    announceToScreenReader(message, 'polite');
    showNotification(message, 'success');
}

function announceToScreenReader(message, politeness) {
    const liveRegion = document.createElement('div');
    liveRegion.setAttribute('aria-live', politeness || 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'visually-hidden';
    liveRegion.textContent = message;
    
    document.body.appendChild(liveRegion);
    
    setTimeout(() => {
        document.body.removeChild(liveRegion);
    }, 3000);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification fade-in ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    if (type === 'error') {
        notification.style.background = '#d63384';
    } else {
        notification.style.background = '#005603';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function initKeyboardNavigation() {
    const form = document.querySelector('form');
    if (!form) return;
    
    const focusableElements = form.querySelectorAll(
        'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    // Делаем модальное поведение для формы
    if (focusableElements.length > 0) {
        focusableElements.forEach((element, index) => {
            element.addEventListener('keydown', function(event) {
                // Tab navigation with loop
                if (event.key === 'Tab') {
                    if (!event.shiftKey && index === focusableElements.length - 1) {
                        event.preventDefault();
                        focusableElements[0].focus();
                    } else if (event.shiftKey && index === 0) {
                        event.preventDefault();
                        focusableElements[focusableElements.length - 1].focus();
                    }
                }
                
                // Enter для отправки на любом элементе формы (кроме textarea)
                if (event.key === 'Enter' && element.tagName !== 'TEXTAREA' && !event.ctrlKey) {
                    event.preventDefault();
                    form.dispatchEvent(new Event('submit'));
                }
            });
        });
    }
    
    // Добавляем быстрые клавиши
    document.addEventListener('keydown', function(event) {
        // Alt + 1 - переход на главную
        if (event.altKey && event.key === '1') {
            const header = document.querySelector('header');
            if (header) {
                event.preventDefault();
                header.scrollIntoView({ behavior: 'smooth' });
                const firstFocusable = header.querySelector('button, a, [tabindex]');
                if (firstFocusable) firstFocusable.focus();
            }
        }
        
        // Alt + 2 - переход к форме
        if (event.altKey && event.key === '2') {
            const form = document.querySelector('form');
            if (form) {
                event.preventDefault();
                form.scrollIntoView({ behavior: 'smooth' });
                const firstInput = form.querySelector('input, select, textarea');
                if (firstInput) firstInput.focus();
            }
        }
    });
}