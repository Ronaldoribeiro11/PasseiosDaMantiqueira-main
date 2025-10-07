// /js/login-page-features.js
document.addEventListener('DOMContentLoaded', function () {
    const auth = new Auth();

    new SidebarMenuHandler({
        menuToggleSelector: '.page-menu-toggle',
        sidebarMenuId: 'sidebarMenuLogin',
        menuOverlayId: 'menuOverlayLogin'
    });

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginStatusMsg = document.getElementById('loginStatusMsg');
    const registerStatusMsg = document.getElementById('registerStatusMsg');

    function displayFormStatus(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = 'form-status-message';
        element.classList.add(type, 'visible');
        setTimeout(() => element.classList.remove('visible'), 5000);
    }

    function getRedirectUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('redirect') ? decodeURIComponent(urlParams.get('redirect')) : null;
    }

    // --- LÓGICA DE LOGIN ---
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const submitButton = loginForm.querySelector('button[type="submit"]');

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';

            const result = await auth.login(email, password); 

            if (result.success) {
                const redirectUrl = getRedirectUrl();
                window.location.href = redirectUrl || 'index.html';
            } else {
                displayFormStatus(loginStatusMsg, result.message, 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Entrar';
            }
        });
    }
    
    // --- LÓGICA DE CADASTRO ---
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const nome = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const terms = document.getElementById('agree-terms').checked;
            const submitButton = registerForm.querySelector('button[type="submit"]');

            if (password !== confirmPassword) {
                return displayFormStatus(registerStatusMsg, 'As senhas não coincidem.', 'error');
            }
            if (!terms) {
                return displayFormStatus(registerStatusMsg, 'Você deve aceitar os termos de uso.', 'error');
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';

            const registerResult = await auth.register(nome, email, password);

            if (registerResult.success) {
                const loginResult = await auth.login(email, password);
                if (loginResult.success) {
                    const redirectUrl = getRedirectUrl();
                    window.location.href = redirectUrl || 'index.html';
                } else {
                    displayFormStatus(loginStatusMsg, 'Cadastro realizado com sucesso! Por favor, faça o login.', 'success');
                    document.querySelector('.auth-tab[data-tab="login"]').click();
                }
            } else {
                displayFormStatus(registerStatusMsg, registerResult.message, 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Finalizar Cadastro';
            }
        });
    }

    // Lógica para mostrar/ocultar senha
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function () {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
});