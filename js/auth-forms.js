document.addEventListener('DOMContentLoaded', function() {
    // --- Lógica para Solicitar Redefinição de Senha ---
    const requestPasswordResetForm = document.getElementById('requestPasswordResetForm');
    const requestResetStatus = document.getElementById('requestResetStatus');

    if (requestPasswordResetForm && requestResetStatus) {
        requestPasswordResetForm.addEventListener('submit', function(event) {
            event.preventDefault();
            requestResetStatus.style.display = 'none';
            requestResetStatus.className = 'form-status-message'; // Limpa classes de status

            const emailInput = document.getElementById('reset-email');
            const email = emailInput.value.trim();

            if (!email || !isValidEmail(email)) {
                displayFormStatus(requestResetStatus, 'Por favor, insira um endereço de e-mail válido.', 'error');
                emailInput.focus();
                return;
            }

            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonHTML = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitButton.disabled = true;

            // Simulação de chamada de API
            setTimeout(() => {
                console.log('Solicitação de redefinição de senha para:', email);
                // Sucesso simulado:
                displayFormStatus(requestResetStatus, 'Se um conta com este e-mail existir, um link de redefinição foi enviado. Verifique sua caixa de entrada e spam.', 'success');
                requestPasswordResetForm.reset();
                
                // Erro simulado (para testar):
                // displayFormStatus(requestResetStatus, 'Ocorreu um erro. Tente novamente mais tarde.', 'error');

                submitButton.innerHTML = originalButtonHTML;
                submitButton.disabled = false;
            }, 2000);
        });
    }

    // --- Lógica para Definir Nova Senha (para redefinir-senha.html) ---
    // Será adicionada aqui quando criarmos essa página.

    // Função utilitária para validar e-mail (simples)
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Função utilitária para exibir mensagens de status
    function displayFormStatus(element, message, type) {
        element.textContent = message;
        element.classList.add(type); // 'success' ou 'error'
        element.style.display = 'block';
    }

    // Lógica do menu lateral global (se necessário aqui e não apenas em main.js)
    // Se você tiver um único main.js que lida com o menu em todas as páginas,
    // não precisa repetir isso aqui.
    const globalMenuToggle = document.querySelector('.page-menu-toggle');
    const globalSidebarMenu = document.getElementById('sidebarMenu');
    const globalMenuOverlay = document.getElementById('menuOverlay');
    const globalCloseMenuBtn = document.getElementById('closeMenuBtn');

    function toggleGlobalSidebarMenu() {
        if (globalSidebarMenu) globalSidebarMenu.classList.toggle('open');
        if (globalMenuOverlay) globalMenuOverlay.classList.toggle('active');
    }

    // Só adiciona listeners se os elementos existirem (ex: o menu-toggle pode não estar em todas as auth pages)
    if (globalMenuToggle) globalMenuToggle.addEventListener('click', toggleGlobalSidebarMenu);
    if (globalMenuOverlay) globalMenuOverlay.addEventListener('click', toggleGlobalSidebarMenu);
    if (globalCloseMenuBtn) globalCloseMenuBtn.addEventListener('click', toggleGlobalSidebarMenu);

});

// No arquivo js/auth-forms.js (continuando o código anterior)

document.addEventListener('DOMContentLoaded', function() {
    // ... (código existente de requestPasswordResetForm) ...

    // --- Lógica para Definir Nova Senha (redefinir-senha.html) ---
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const resetPasswordStatus = document.getElementById('resetPasswordStatus');
    const newPasswordInput = document.getElementById('new-password-reset');
    const strengthIndicator = document.getElementById('passwordStrengthIndicator');
    const strengthBar = strengthIndicator ? strengthIndicator.querySelector('.strength-bar') : null;
    const strengthText = strengthIndicator ? strengthIndicator.querySelector('.strength-text') : null;

    if (resetPasswordForm && resetPasswordStatus) {
        // Ler o token (simulado do campo oculto, futuramente da URL)
        const tokenInput = document.getElementById('resetToken');
        const resetToken = tokenInput ? tokenInput.value : null;
        console.log('Token de redefinição (simulado):', resetToken);
        // TODO: Futuramente, validar este token com o backend ao carregar a página.
        // Se inválido, mostrar erro e desabilitar formulário.

        resetPasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            resetPasswordStatus.style.display = 'none';
            resetPasswordStatus.className = 'form-status-message';

            const newPassword = newPasswordInput.value;
            const confirmPassword = document.getElementById('confirm-password-reset').value;

            if (!newPassword || !confirmPassword) {
                displayFormStatus(resetPasswordStatus, 'Por favor, preencha ambos os campos de senha.', 'error');
                return;
            }
            if (newPassword !== confirmPassword) {
                displayFormStatus(resetPasswordStatus, 'As senhas não coincidem. Tente novamente.', 'error');
                return;
            }
            if (!isPasswordStrongEnough(newPassword)) { // Você precisará definir isPasswordStrongEnough
                displayFormStatus(resetPasswordStatus, 'A senha não atende aos critérios de segurança. Verifique as regras abaixo do campo.', 'error');
                return;
            }


            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonHTML = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            submitButton.disabled = true;

            // Simulação de chamada de API para redefinir a senha
            setTimeout(() => {
                console.log('Nova senha definida (simulação):', newPassword, 'para o token:', resetToken);
                
                // Simulação de sucesso:
                // No mundo real, você também precisaria encontrar o usuário pelo token e atualizar a senha dele.
                // Se usar a classe Auth:
                // const auth = new Auth();
                // if (auth.updatePasswordForUserWithToken(resetToken, newPassword)) { ... }
                
                displayFormStatus(resetPasswordStatus, 'Senha redefinida com sucesso! Você será redirecionado para o login.', 'success');
                resetPasswordForm.reset();
                if (strengthBar) strengthBar.className = 'strength-bar'; // Reseta barra
                if (strengthText) strengthText.textContent = 'Força da senha';

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2500); // Redireciona após mensagem de sucesso

                // Simulação de erro (ex: token inválido/expirado):
                // displayFormStatus(resetPasswordStatus, 'O link de redefinição é inválido ou expirou. Solicite um novo.', 'error');
                // submitButton.innerHTML = originalButtonHTML;
                // submitButton.disabled = false;

            }, 2000);
        });
    }

    // Lógica para mostrar/ocultar senha
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
    
    // Indicador de força da senha
    if (newPasswordInput && strengthBar && strengthText) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = checkPasswordStrength(password);
            
            strengthBar.className = 'strength-bar'; // Limpa classes antigas
            if (password.length > 0) {
                strengthBar.classList.add(strength.className);
            }
            strengthText.textContent = strength.text;
        });
    }

    function checkPasswordStrength(password) {
        let score = 0;
        if (!password || password.length < 8) return { className: '', text: 'Muito Fraca (mín. 8 caracteres)' };
        
        // Critérios (você pode ajustar estes)
        if (password.length >= 8) score++;
        if (password.length >= 10) score++;
        if (/[A-Z]/.test(password)) score++; // Maiúscula
        if (/[a-z]/.test(password)) score++; // Minúscula
        if (/[0-9]/.test(password)) score++; // Número
        if (/[^A-Za-z0-9]/.test(password)) score++; // Símbolo

        if (score < 3) return { className: 'weak', text: 'Fraca' };
        if (score < 5) return { className: 'medium', text: 'Média' };
        if (score < 6) return { className: 'strong', text: 'Forte' };
        return { className: 'very-strong', text: 'Muito Forte' };
    }
    
    function isPasswordStrongEnough(password) {
        // Defina aqui o seu critério mínimo para uma senha ser considerada "forte o suficiente"
        // Por exemplo, pelo menos 8 caracteres, uma maiúscula, uma minúscula e um número.
        if (password.length < 8) return false;
        if (!/[A-Z]/.test(password)) return false;
        if (!/[a-z]/.test(password)) return false;
        if (!/[0-9]/.test(password)) return false;
        // if (!/[^A-Za-z0-9]/.test(password)) return false; // Opcional: exigir símbolo
        return true;
    }

    // Função utilitária displayFormStatus (se não estiver já definida no mesmo arquivo)
    // function displayFormStatus(element, message, type) { ... }
    // Se estiver no mesmo arquivo, não precisa redefinir.

    // Lógica do menu lateral (se o .page-menu-toggle existir nesta página,
    // o que não é comum para fluxos de redefinição de senha, mas mantido por consistência)
    const authPageMenuToggle = document.querySelector('.page-menu-toggle');
    if(authPageMenuToggle){
        // ... (lógica do menu-toggle, se aplicável a esta página)...
        // No geral, páginas de redefinição de senha não têm navegação principal
        // para manter o foco do usuário. A logo no topo serve como link para home.
        authPageMenuToggle.style.display = 'none'; // Ocultar se não for desejado
    }
});