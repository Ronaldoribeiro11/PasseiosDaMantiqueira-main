// js/login-features.js
document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth(); // Instância da sua classe de autenticação

    // --- Elementos Comuns ---
    const loginEmailInput = document.getElementById('login-email');
    const loginPasswordInput = document.getElementById('login-password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const loginForm = document.getElementById('login-form');
    const loginStatusMessage = document.getElementById('login-status-message');

    const registerNameInput = document.getElementById('register-name');
    const registerEmailInput = document.getElementById('register-email');
    const registerPasswordInput = document.getElementById('register-password');
    const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
    const agreeTermsCheckbox = document.getElementById('agree-terms');
    const registerForm = document.getElementById('register-form');
    const registerStatusMessage = document.getElementById('register-status-message');
    
    // Elementos para validação em tempo real
    const loginEmailError = document.getElementById('login-email-error');
    const registerEmailError = document.getElementById('register-email-error');
    const registerConfirmPasswordError = document.getElementById('register-confirm-password-error');
    const agreeTermsError = document.getElementById('agree-terms-error');

    // Indicador de força de senha para cadastro
    const registerPasswordStrengthIndicator = document.getElementById('register-password-strength');
    const registerStrengthBar = registerPasswordStrengthIndicator ? registerPasswordStrengthIndicator.querySelector('.strength-bar-login') : null;
    const registerStrengthText = registerPasswordStrengthIndicator ? registerPasswordStrengthIndicator.querySelector('.strength-text-login') : null;


    // --- Função para exibir mensagens de status nos formulários ---
    function displayFormStatus(element, message, type = 'error') {
        if (!element) return;
        element.textContent = message;
        element.className = 'form-status-message ' + type; // Adiciona classe 'success' ou 'error'
        element.style.display = 'block';
        // Auto-hide success messages after a few seconds
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 4000);
        }
    }
    // Limpar mensagem de erro individual de campo
    function clearFieldError(errorElement) {
        if (errorElement) errorElement.textContent = '';
    }
    // Mostrar mensagem de erro individual de campo
    function showFieldError(errorElement, message) {
        if (errorElement) errorElement.textContent = message;
    }

    // --- Validação de Email Simples ---
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // --- Validação de Formato de Email em Tempo Real ---
    if (loginEmailInput) {
        loginEmailInput.addEventListener('input', function() {
            if (this.value && !isValidEmail(this.value)) {
                showFieldError(loginEmailError, 'Formato de e-mail inválido.');
            } else {
                clearFieldError(loginEmailError);
            }
        });
    }
    if (registerEmailInput) {
        registerEmailInput.addEventListener('input', function() {
            if (this.value && !isValidEmail(this.value)) {
                showFieldError(registerEmailError, 'Formato de e-mail inválido.');
            } else {
                clearFieldError(registerEmailError);
            }
        });
    }

    // --- Verificação de Força da Senha (Cadastro) ---
    if (registerPasswordInput && registerStrengthBar && registerStrengthText) {
        registerPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            
            registerStrengthBar.className = 'strength-bar-login'; // Limpa classes antigas
            if (password.length > 0) {
                registerStrengthBar.classList.add(strength.className);
            }
            registerStrengthText.textContent = strength.text;
        });
    }

    function checkPasswordStrength(password) {
        let score = 0;
        let feedback = { className: '', text: 'Força da senha' };

        if (!password) return feedback;

        if (password.length < 8) {
            feedback.text = 'Muito Fraca (mín. 8 caracteres)';
            feedback.className = ''; // ou 'very-weak' se tiver estilo
            return feedback;
        }
        
        if (password.length >= 8) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++; 
        if (/[a-z]/.test(password)) score++; 
        if (/[0-9]/.test(password)) score++; 
        if (/[^A-Za-z0-9]/.test(password)) score++; // Símbolo

        if (score < 3) { feedback.className = 'weak'; feedback.text = 'Fraca'; }
        else if (score < 5) { feedback.className = 'medium'; feedback.text = 'Média'; }
        else if (score < 6) { feedback.className = 'strong'; feedback.text = 'Forte'; }
        else { feedback.className = 'very-strong'; feedback.text = 'Muito Forte'; }
        return feedback;
    }
    
    function isPasswordMinimallyAcceptable(password) {
        // Defina aqui o seu critério MÍNIMO para aceitar a senha no cadastro
        return password.length >= 8 && /[a-z]/.test(password) && /[0-9]/.test(password); // Ex: Mín 8 chars, letras e números
    }


    // --- Verificação de Confirmação de Senha em Tempo Real (Cadastro) ---
    if (registerConfirmPasswordInput) {
        registerConfirmPasswordInput.addEventListener('input', function() {
            if (registerPasswordInput.value !== this.value) {
                showFieldError(registerConfirmPasswordError, 'As senhas não coincidem.');
            } else {
                clearFieldError(registerConfirmPasswordError);
            }
        });
         registerPasswordInput.addEventListener('input', function() { // Também ao mudar a primeira senha
            if (registerConfirmPasswordInput.value && this.value !== registerConfirmPasswordInput.value) {
                 showFieldError(registerConfirmPasswordError, 'As senhas não coincidem.');
            } else if (registerConfirmPasswordInput.value) {
                 clearFieldError(registerConfirmPasswordError);
            }
        });
    }


    // --- Botão Mostrar/Ocultar Senha ---
    document.querySelectorAll('.password-toggle-btn').forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.previousElementSibling; // O input de senha
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

    // --- "Lembrar-me" ---
    if (rememberMeCheckbox && loginEmailInput) {
        const rememberedEmail = localStorage.getItem('rememberedUserEmail_passeiosdaserra');
        if (rememberedEmail) {
            loginEmailInput.value = rememberedEmail;
            rememberMeCheckbox.checked = true;
        }
    }

    // --- Redirecionamento Inteligente ---
    function getRedirectUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('redirect'); // Retorna ex: 'perfil.html' ou null
    }

    // --- Submissão do Formulário de Login ---
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if(loginStatusMessage) loginStatusMessage.style.display = 'none';
            clearFieldError(loginEmailError);

            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value;

            if (!email || !password) {
                displayFormStatus(loginStatusMessage, 'Por favor, preencha e-mail e senha.');
                return;
            }
            if (!isValidEmail(email)) {
                showFieldError(loginEmailError, 'Formato de e-mail inválido.');
                displayFormStatus(loginStatusMessage, 'Verifique os erros no formulário.');
                return;
            }

            const result = auth.login(email, password);

            if (result.success) {
                if (rememberMeCheckbox.checked) {
                    localStorage.setItem('rememberedUserEmail_passeiosdaserra', email);
                } else {
                    localStorage.removeItem('rememberedUserEmail_passeiosdaserra');
                }
                
                const redirectUrl = getRedirectUrl();
                window.location.href = redirectUrl || 'index.html'; // Redireciona para URL guardada ou index
            } else {
                displayFormStatus(loginStatusMessage, result.message || 'Falha no login. Verifique seus dados.');
            }
        });
    }

    // --- Submissão do Formulário de Cadastro ---
    // A lógica de navegação entre etapas já está em js/login.js, vamos focar na submissão final
    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();
            if(registerStatusMessage) registerStatusMessage.style.display = 'none';
            clearFieldError(registerEmailError);
            clearFieldError(registerConfirmPasswordError);
            clearFieldError(agreeTermsError);

            const name = registerNameInput.value.trim();
            const email = registerEmailInput.value.trim();
            const password = registerPasswordInput.value;
            const confirmPassword = registerConfirmPasswordInput.value;
            const agreedToTerms = agreeTermsCheckbox.checked;

            // Validações finais
            let valid = true;
            if (!name || !email || !password || !confirmPassword) {
                displayFormStatus(registerStatusMessage, 'Por favor, preencha todos os campos obrigatórios.');
                valid = false;
            }
            if (email && !isValidEmail(email)) {
                showFieldError(registerEmailError, 'Formato de e-mail inválido.');
                valid = false;
            }
            if (password && !isPasswordMinimallyAcceptable(password)) {
                displayFormStatus(registerStatusMessage, 'Sua senha não atende aos critérios mínimos de segurança.');
                valid = false;
            }
            if (password !== confirmPassword) {
                showFieldError(registerConfirmPasswordError, 'As senhas não coincidem.');
                valid = false;
            }
            if (!agreedToTerms) {
                showFieldError(agreeTermsError, 'Você precisa aceitar os termos para se cadastrar.');
                valid = false;
            }
            
            if (!valid) {
                if(!registerStatusMessage.textContent){ // Se nenhuma mensagem geral foi setada, mas há erros de campo
                     displayFormStatus(registerStatusMessage, 'Verifique os erros no formulário.');
                }
                return;
            }

            const preferenceCheckboxes = document.querySelectorAll('input[name="preferences"]:checked');
            const preferences = Array.from(preferenceCheckboxes).map(cb => cb.value);
            const interests = document.getElementById('register-interests').value.trim();

            const userData = { name, email, password, preferences, interests };
            const result = auth.register(userData); // auth.js já faz autologin

            if (result.success) {
                const redirectUrl = getRedirectUrl(); // Mesmo que não tenha vindo de um redirect, não faz mal
                window.location.href = redirectUrl || 'index.html';
            } else {
                displayFormStatus(registerStatusMessage, result.message || 'Falha no cadastro. Tente novamente.');
                // Se o erro for email duplicado, focar no campo de email
                if (result.message && result.message.toLowerCase().includes('email já está cadastrado')) {
                    showFieldError(registerEmailError, result.message);
                    registerEmailInput.focus();
                }
            }
        });
    }

    // --- Login Social (Simulado) ---
    const googleLoginBtn = document.getElementById('google-login-btn');
    const facebookLoginBtn = document.getElementById('facebook-login-btn');

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', function() {
            alert('Login com Google estará disponível em breve!');
        });
    }
    if (facebookLoginBtn) {
        facebookLoginBtn.addEventListener('click', function() {
            alert('Login com Facebook estará disponível em breve!');
        });
    }

    // --- Lógica do menu lateral principal (já deve estar em js/main.js) ---
    // Se js/main.js já está tratando o menu com ID "sidebarMenu", não precisa repetir aqui.
    // Apenas garanta que js/main.js é carregado nesta página.
    // A estrutura do menu lateral que adicionei no HTML da login.html usa os mesmos IDs.

});