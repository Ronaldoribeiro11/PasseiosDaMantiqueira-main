document.addEventListener('DOMContentLoaded', () => {
    const statusMessage = sessionStorage.getItem('form-status-message');
    if (statusMessage) {
        const loginStatusMsg = document.getElementById('login-status-msg');
        if (loginStatusMsg) {
            displayFormStatus(loginStatusMsg, statusMessage, 'success');
        }
        sessionStorage.removeItem('form-status-message');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    // Alternar entre login e cadastro
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Ativar aba clicada
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar formulário correspondente
            document.querySelectorAll('.auth-form-content').forEach(form => {
                form.classList.remove('active');
            });
            document.querySelector(`.auth-form-content[data-form="${tabName}"]`).classList.add('active');
        });
    });
    
    // Navegação entre passos do cadastro
    const nextStepBtns = document.querySelectorAll('[data-next-step]');
    const prevStepBtns = document.querySelectorAll('[data-prev-step]');
    
    nextStepBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const nextStep = currentStep.nextElementSibling;
            
            // Validar campos antes de avançar
            const inputs = currentStep.querySelectorAll('input[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    input.classList.add('error');
                    isValid = false;
                } else {
                    input.classList.remove('error');
                }
            });
            
            // Verificar se senhas coincidem
            const password = document.getElementById('register-password');
            const confirmPassword = document.getElementById('register-confirm-password');
            
            if (password.value !== confirmPassword.value) {
                password.classList.add('error');
                confirmPassword.classList.add('error');
                isValid = false;
                
                // Mostrar mensagem de erro
                const errorMsg = document.createElement('div');
                errorMsg.className = 'error-message';
                errorMsg.textContent = 'As senhas não coincidem';
                
                const existingError = confirmPassword.nextElementSibling;
                if (existingError && existingError.className === 'error-message') {
                    existingError.remove();
                }
                
                confirmPassword.insertAdjacentElement('afterend', errorMsg);
            }
            
            if (!isValid) return;
            
            // Avançar para o próximo passo
            currentStep.classList.remove('active');
            nextStep.classList.add('active');
            
            // Atualizar indicador de passos
            const currentIndicator = document.querySelector(`.step-indicator[data-step="${currentStep.dataset.step}"]`);
            const nextIndicator = document.querySelector(`.step-indicator[data-step="${nextStep.dataset.step}"]`);
            
            currentIndicator.classList.remove('active');
            nextIndicator.classList.add('active');
        });
    });
    
    prevStepBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const currentStep = this.closest('.form-step');
            const prevStep = currentStep.previousElementSibling;
            
            // Voltar para o passo anterior
            currentStep.classList.remove('active');
            prevStep.classList.add('active');
            
            // Atualizar indicador de passos
            const currentIndicator = document.querySelector(`.step-indicator[data-step="${currentStep.dataset.step}"]`);
            const prevIndicator = document.querySelector(`.step-indicator[data-step="${prevStep.dataset.step}"]`);
            
            currentIndicator.classList.remove('active');
            prevIndicator.classList.add('active');
        });
    });
    
    // Remover mensagens de erro ao digitar
    const registerInputs = document.querySelectorAll('#register-form input');
    registerInputs.forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('error');
            
            const errorMsg = this.nextElementSibling;
            if (errorMsg && errorMsg.className === 'error-message') {
                errorMsg.remove();
            }
        });
    });

    // Função para verificar credenciais de admin
    function checkAdminCredentials(email, password) {
        // Lista de administradores (em um sistema real, isso viria de um banco de dados)
        const adminUsers = [
            { email: "admin@passeiosdaserra.com", password: "admin123" },
            { email: "yohan@passeios.com", password: "yohan123" }
        ];

        return adminUsers.some(user => user.email === email && user.password === password);
    }
});