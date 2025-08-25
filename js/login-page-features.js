// js/login-page-features.js
document.addEventListener('DOMContentLoaded', function () {
    const auth = new Auth();

    // Inicia o manipulador do menu lateral
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
        return urlParams.get('redirect');
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

            // Chama o método login da classe Auth, que agora se comunica com a API
            const result = await auth.login(email, password); 

            if (result.success) {
                const redirectUrl = getRedirectUrl();
                window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : 'index.html';
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

            // Validações
            if (password !== confirmPassword) {
                return displayFormStatus(registerStatusMsg, 'As senhas não coincidem.', 'error');
            }
            if (!terms) {
                return displayFormStatus(registerStatusMsg, 'Você deve aceitar os termos de uso.', 'error');
            }

            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cadastrando...';

            try {
                // Chamada direta para a API de cadastro
                const response = await fetch('http://localhost:3000/api/usuarios', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nome_completo: nome, email: email, senha: password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erro ao cadastrar.');
                }
                
                // Se o cadastro foi bem-sucedido, tenta fazer o login
                const loginResult = await auth.login(email, password);
                if (loginResult.success) {
                    const redirectUrl = getRedirectUrl();
                    window.location.href = redirectUrl || 'index.html';
                } else {
                    // Se o login falhar por algum motivo, avisa o usuário
                    sessionStorage.setItem('form-status-message', 'Cadastro realizado com sucesso! Por favor, faça o login.');
                    window.location.hash = 'login'; // Muda para a aba de login
                    location.reload();
                }

            } catch (error) {
                displayFormStatus(registerStatusMsg, error.message, 'error');
                submitButton.disabled = false;
                submitButton.textContent = 'Finalizar Cadastro';
            }
        });
    }

    // Lógica para mostrar/ocultar senha (pode manter a sua original, está ótima)
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