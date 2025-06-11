// js/login-page-features.js
document.addEventListener('DOMContentLoaded', function () {
    const auth = new Auth(); // Instância da classe Auth

    // Inicializar o manipulador do menu lateral para a página de login
    // Certifique-se que os IDs no HTML correspondem (sidebarMenuLogin, menuOverlayLogin)
    // e o seletor do botão de toggle (page-menu-toggle)
    new SidebarMenuHandler({
        menuToggleSelector: '.page-menu-toggle', // O botão hambúrguer que você adicionou
        sidebarMenuId: 'sidebarMenuLogin',
        menuOverlayId: 'menuOverlayLogin'
    });

    // --- Elementos da Sidebar para atualizar ---
    const sidebarProfileImgLogin = document.getElementById('sidebarProfileImgLogin');
    const sidebarProfileNameLogin = document.getElementById('sidebarProfileNameLogin');
    const sidebarProfileEmailLogin = document.getElementById('sidebarProfileEmailLogin');
    const sidebarLinkMeuPerfilLogin = document.getElementById('sidebarLinkMeuPerfilLogin');
    const sidebarLinkCriarPasseioLogin = document.getElementById('sidebarLinkCriarPasseioLogin');
    const sidebarLinkAvaliacoesLogin = document.getElementById('sidebarLinkAvaliacoesLogin');
    const sidebarLinkFavoritosLogin = document.getElementById('sidebarLinkFavoritosLogin');
    const sidebarLinkConfiguracoesLogin = document.getElementById('sidebarLinkConfiguracoesLogin');
    const sidebarLinkAuthLogin = document.getElementById('sidebarLinkAuthLogin');

    const userSpecificLinksLogin = [
        sidebarLinkMeuPerfilLogin, sidebarLinkCriarPasseioLogin, sidebarLinkAvaliacoesLogin,
        sidebarLinkFavoritosLogin, sidebarLinkConfiguracoesLogin
    ];

    function updateLoginSidebarUserStatus() {
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
            if (sidebarProfileImgLogin) {
                sidebarProfileImgLogin.src = currentUser.avatarUrl || 'assets/images/ImagemUsuario.jpg';
                sidebarProfileImgLogin.style.display = 'block';
            }
            if (sidebarProfileNameLogin) sidebarProfileNameLogin.textContent = currentUser.name;
            if (sidebarProfileEmailLogin) sidebarProfileEmailLogin.textContent = currentUser.email;

            userSpecificLinksLogin.forEach(link => {
                if (link) {
                    if (link.id === 'sidebarLinkCriarPasseioLogin') {
                        link.style.display = currentUser.creatorStatus === 'verified' ? 'block' : 'none';
                    } else {
                        link.style.display = 'block';
                    }
                }
            });

            if (sidebarLinkAuthLogin) {
                sidebarLinkAuthLogin.innerHTML = `<a href="#" id="sidebarLogoutLinkLogin"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
                document.getElementById('sidebarLogoutLinkLogin')?.addEventListener('click', function (e) {
                    e.preventDefault();
                    auth.logout();
                    updateLoginSidebarUserStatus();
                    // Redirecionar ou atualizar a página de login para refletir o logout
                    window.location.href = 'login.html'; 
                });
            }
        } else {
            if (sidebarProfileImgLogin) sidebarProfileImgLogin.style.display = 'none';
            if (sidebarProfileNameLogin) sidebarProfileNameLogin.textContent = 'Visitante';
            if (sidebarProfileEmailLogin) sidebarProfileEmailLogin.textContent = 'Faça login ou cadastre-se';
            userSpecificLinksLogin.forEach(link => { if (link) link.style.display = 'none'; });
            if (sidebarLinkAuthLogin) {
                sidebarLinkAuthLogin.innerHTML = `<a href="login.html"><i class="fas fa-sign-in-alt"></i> Login / Cadastro</a>`;
            }
        }
    }
    updateLoginSidebarUserStatus(); // Chama na carga da página


    // --- Funcionalidades dos formulários de Login e Cadastro ---
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginStatusMsg = document.getElementById('loginStatusMsg');
    const registerStatusMsg = document.getElementById('registerStatusMsg');

    // Função para exibir mensagens de status com animação
    function displayFormStatus(element, message, type) {
        if (!element) return;
        element.textContent = message;
        element.className = 'form-status-message'; // Reseta classes
        element.classList.add(type); // 'success' ou 'error'
        element.classList.add('visible');

        // Ocultar mensagem após alguns segundos
        setTimeout(() => {
            element.classList.remove('visible');
        }, 5000);
    }
    
    // Função para exibir erro de campo específico
    function displayFieldError(element, message) {
        if (!element) return;
        element.textContent = message;
        element.classList.add('visible');
    }
    function clearFieldError(element) {
        if (!element) return;
        element.textContent = '';
        element.classList.remove('visible');
    }


    // Redirecionamento Inteligente
    function getRedirectUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('redirect'); // Ex: 'perfil.html'
    }

    // "Lembrar-me"
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginEmailInput = document.getElementById('login-email');
    if (rememberMeCheckbox && loginEmailInput) {
        const rememberedEmail = localStorage.getItem('remembered_email_passeiosdaserra');
        if (rememberedEmail) {
            loginEmailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    // Modificar o submit do formulário de LOGIN (que está em js/auth.js ou js/login.js)
    // Idealmente, a lógica de submit de js/auth.js ou js/login.js seria movida para cá.
    // Por ora, vamos assumir que a lógica de login básica está em auth.js e vamos apenas
    // adicionar o "Lembrar-me" e o redirecionamento.
    // Você precisará integrar isso com seu manipulador de submit existente.

    if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const result = await auth.login(email, password); 

        if (result.success) {
            if (rememberMeCheckbox && rememberMeCheckbox.checked) {
                localStorage.setItem('remembered_email_passeiosdaserra', email);
            } else {
                localStorage.removeItem('remembered_email_passeiosdaserra');
            }
            const redirectUrl = getRedirectUrl();
            window.location.href = redirectUrl ? decodeURIComponent(redirectUrl) : 'index.html';
        } else {
            displayFormStatus(loginStatusMsg, result.message, 'error');
        }
    });
}
    
    // Modificar o submit do formulário de CADASTRO
   if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const nome = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const terms = document.getElementById('agree-terms').checked;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return displayFormStatus(registerStatusMsg, 'Por favor, insira um formato de email válido.', 'error');
        if (password.length < 8) return displayFormStatus(registerStatusMsg, 'A senha deve ter pelo menos 8 caracteres.', 'error');
        if (password !== confirmPassword) return displayFormStatus(registerStatusMsg, 'As senhas não coincidem.', 'error');
        if (!terms) return displayFormStatus(registerStatusMsg, 'Você deve aceitar os termos de uso.', 'error');

        try {
            const response = await fetch('http://localhost:3000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_completo: nome, email: email, senha: password })
            });
            const data = await response.json();
            if (!response.ok) {
                displayFormStatus(registerStatusMsg, data.message || 'Erro ao cadastrar.', 'error');
            } else {
                sessionStorage.setItem('form-status-message', 'Cadastro realizado com sucesso! Por favor, faça o login.');
                window.location.hash = 'login';
                location.reload();
            }
        } catch (error) {
            displayFormStatus(registerStatusMsg, 'Não foi possível conectar ao servidor.', 'error');
        }
    });
}

    // Mostrar/Ocultar Senha
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function () {
            const passwordInput = this.previousElementSibling;
            const icon = this.querySelector('i');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                this.setAttribute('aria-label', 'Ocultar senha');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                this.setAttribute('aria-label', 'Mostrar senha');
            }
        });
    });
    
    // Lógica de força da senha (similar a js/auth-forms.js)
    function checkPasswordStrength(password) {
        let score = 0;
        if (!password) return { className: '', text: 'Senha' };
        if (password.length >= 8) score++; else return { className: 'weak', text: 'Mín. 8 caracteres' };
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++; // Símbolo

        if (score < 3) return { className: 'weak', text: 'Fraca' };
        if (score < 5) return { className: 'medium', text: 'Média' };
        if (score < 6) return { className: 'strong', text: 'Forte' };
        return { className: 'very-strong', text: 'Muito Forte' };
    }
    
    function isPasswordStrongEnough(password) {
        if (!password || password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        if (!/[^A-Za-z0-9]/.test(password)) return false; // Exigindo símbolo
        return true;
    }


    // Botões de login social (simulação)
    document.getElementById('googleLoginBtn')?.addEventListener('click', () => {
        alert('Login com Google estará disponível em breve!');
    });
    document.getElementById('facebookLoginBtn')?.addEventListener('click', () => {
        alert('Login com Facebook estará disponível em breve!');
    });
    
    // Melhoria visual para etapas de cadastro (js/login.js já tem a lógica de navegação)
    // Aqui, apenas adicionamos classes 'completed' visualmente.
    const stepIndicators = document.querySelectorAll('.form-steps .step-indicator');
    const nextStepButtons = document.querySelectorAll('[data-next-step]');
    
    nextStepButtons.forEach(button => {
        button.addEventListener('click', () => {
            const currentStepNum = parseInt(button.closest('.form-step').dataset.step);
            stepIndicators.forEach(indicator => {
                const indicatorStepNum = parseInt(indicator.dataset.step);
                if (indicatorStepNum <= currentStepNum) { // Marca a atual e as anteriores como completas ao avançar
                    indicator.classList.add('completed');
                }
            });
        });
    });
    // A lógica de 'active' para o indicador já está em js/login.js

});