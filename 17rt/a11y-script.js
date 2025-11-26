// Скрипты для доступности

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация доступной навигации
    initAccessibleNavigation();
    
    // Инициализация доступной формы
    initAccessibleForm();
    
    // Инициализация FAQ
    initAccessibleFAQ();
    
    // Управление фокусом
    initFocusManagement();
});

// Доступная навигация
function initAccessibleNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.setAttribute('aria-expanded', !isExpanded);
        });
        
        // Закрытие меню при клике вне его области
        document.addEventListener('click', function(event) {
            if (!event.target.closest('.nav')) {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-expanded', 'false');
            }
        });
        
        // Закрытие меню по Escape
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                navToggle.setAttribute('aria-expanded', 'false');
                navMenu.setAttribute('aria-expanded', 'false');
                navToggle.focus();
            }
        });
    }
}

// Доступная форма
function initAccessibleForm() {
    const form = document.getElementById('contact-form');
    
    if (!form) return;
    
    const requiredFields = form.querySelectorAll('[required]');
    const emailField = document.getElementById('email');
    const agreementCheckbox = document.getElementById('agreement');
    
    // Валидация в реальном времени
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
        field.addEventListener('input', clearFieldError);
    });
    
    // Специальная валидация для email
    if (emailField) {
        emailField.addEventListener('blur', validateEmail);
    }
    
    // Валидация согласия
    if (agreementCheckbox) {
        agreementCheckbox.addEventListener('change', validateAgreement);
    }
    
    // Обработка отправки формы
    form.addEventListener('submit', handleFormSubmit);
    
    // Управление фокусом при ошибках
    form.addEventListener('invalid', function(event) {
        event.preventDefault();
        const field = event.target;
        showFieldError(field, 'Это поле обязательно для заполнения');
        field.focus();
    }, true);
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Это поле обязательно для заполнения');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function validateEmail(event) {
    const field = event.target;
    const value = field.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (value && !emailRegex.test(value)) {
        showFieldError(field, 'Введите корректный email адрес');
        return false;
    }
    
    return true;
}

function validateAgreement(event) {
    const checkbox = event.target;
    const errorElement = document.getElementById('agreement-error');
    
    if (!checkbox.checked) {
        if (errorElement) {
            errorElement.textContent = 'Необходимо согласие с политикой конфиденциальности';
        }
        return false;
    }
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    return true;
}

function showFieldError(field, message) {
    const errorId = `${field.id}-error`;
    let errorElement = document.getElementById(errorId);
    
    if (!errorElement) {
        errorElement = document.createElement('span');
        errorElement.id = errorId;
        errorElement.className = 'error-message';
        errorElement.setAttribute('aria-live', 'polite');
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    field.setAttribute('aria-invalid', 'true');
    field.classList.add('error');
}

function clearFieldError(event) {
    const field = event.target;
    const errorId = `${field.id}-error`;
    const errorElement = document.getElementById(errorId);
    
    if (errorElement) {
        errorElement.textContent = '';
    }
    
    field.setAttribute('aria-invalid', 'false');
    field.classList.remove('error');
}

function handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    // Валидация всех обязательных полей
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    // Специальная валидация email
    const emailField = document.getElementById('email');
    if (emailField && emailField.value.trim() && !validateEmail({ target: emailField })) {
        isValid = false;
    }
    
    // Валидация согласия
    const agreementCheckbox = document.getElementById('agreement');
    if (agreementCheckbox && !validateAgreement({ target: agreementCheckbox })) {
        isValid = false;
    }
    
    if (isValid) {
        // Симуляция успешной отправки
        showSuccessMessage();
        form.reset();
    } else {
        // Фокус на первую ошибку
        const firstError = form.querySelector('[aria-invalid="true"]');
        if (firstError) {
            firstError.focus();
        }
    }
}

function showSuccessMessage() {
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.setAttribute('role', 'alert');
    successMessage.setAttribute('aria-live', 'polite');
    successMessage.innerHTML = `
        <div style="background: #d1fae5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <strong>Сообщение отправлено!</strong> Мы свяжемся с вами в течение 24 часов.
        </div>
    `;
    
    const form = document.getElementById('contact-form');
    form.parentNode.insertBefore(successMessage, form);
    
    // Автоматическое скрытие сообщения
    setTimeout(() => {
        successMessage.remove();
    }, 5000);
}

// Доступный FAQ
function initAccessibleFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const summary = item.querySelector('summary');
        
        summary.addEventListener('click', function(event) {
            // Предотвращаем стандартное поведение для ручного управления
            if (event.target.tagName === 'A') return;
            event.preventDefault();
            
            const isOpen = item.hasAttribute('open');
            
            if (isOpen) {
                item.removeAttribute('open');
                summary.setAttribute('aria-expanded', 'false');
            } else {
                // Закрываем другие открытые элементы
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.removeAttribute('open');
                        otherItem.querySelector('summary').setAttribute('aria-expanded', 'false');
                    }
                });
                
                item.setAttribute('open', '');
                summary.setAttribute('aria-expanded', 'true');
            }
        });
        
        // Обработка клавиатуры
        summary.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                summary.click();
            }
        });
        
        // Устанавливаем начальное состояние
        summary.setAttribute('aria-expanded', item.hasAttribute('open').toString());
    });
}

// Управление фокусом
function initFocusManagement() {
    // Ловушка фокуса для модальных окон (если будут добавлены)
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Tab' && document.querySelector('[aria-modal="true"]')) {
            handleFocusTrap(event);
        }
    });
}

function handleFocusTrap(event) {
    const modal = document.querySelector('[aria-modal="true"]');
    if (!modal) return;
    
    const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
    }
}

// Утилиты для работы с клавиатурой
document.addEventListener('keydown', function(event) {
    // Обработка Escape для закрытия различных элементов
    if (event.key === 'Escape') {
        const openModal = document.querySelector('[aria-modal="true"]');
        if (openModal) {
            // Закрытие модального окна
            const closeButton = openModal.querySelector('[aria-label*="закрыть"]');
            if (closeButton) closeButton.click();
        }
        
        const expandedMenu = document.querySelector('.nav-toggle[aria-expanded="true"]');
        if (expandedMenu) {
            expandedMenu.click();
        }
    }
});

// Полифиллы для старых браузеров
if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector;
}

if (!NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}