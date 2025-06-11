document.addEventListener('DOMContentLoaded', function() {
    const settingsMenuLinks = document.querySelectorAll('.settings-menu-link');
    const settingsTabPanes = document.querySelectorAll('.settings-tab-pane');
    const auth = new Auth(); // Instanciando Auth para pegar dados do usuário

    // Função para carregar dados do usuário nos formulários
    function loadUserData() {
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
            const emailDisplay = document.getElementById('settings-email-display');
            if (emailDisplay) emailDisplay.value = currentUser.email || 'N/A';
            
            const phoneInput = document.getElementById('settings-phone');
            if (phoneInput) phoneInput.value = currentUser.phone || ''; // Supondo que 'phone' exista

            const birthdateInput = document.getElementById('settings-birthdate');
            if (birthdateInput) birthdateInput.value = currentUser.birthDate || ''; // Supondo que 'birthDate' exista

            // Preencher endereço (se os campos existirem no objeto currentUser.fullAddress)
            if (currentUser.fullAddress) {
                const cepInput = document.getElementById('settings-cep');
                if (cepInput) cepInput.value = currentUser.fullAddress.cep || '';
                // ... preencher outros campos de endereço
            }

            // Preencher preferências de notificação
            const notificationsForm = document.getElementById('notificationsForm');
            if (notificationsForm && currentUser.notificationPreferences) {
                for (const key in currentUser.notificationPreferences) {
                    const checkbox = notificationsForm.querySelector(`input[name="${key}"]`);
                    if (checkbox) checkbox.checked = currentUser.notificationPreferences[key];
                }
            }
             // Preencher preferências de acessibilidade
            const accessibilityForm = document.getElementById('accessibilityForm');
            if (accessibilityForm && currentUser.accessibilityPreferences) {
                const fontSizeSelect = document.getElementById('fontSizePref');
                if (fontSizeSelect) fontSizeSelect.value = currentUser.accessibilityPreferences.fontSize || 'normal';
                
                const highContrastToggle = document.getElementById('highContrastToggle');
                if (highContrastToggle) highContrastToggle.checked = currentUser.accessibilityPreferences.highContrast || false;

                const reduceMotionToggle = document.getElementById('reduceMotionToggle');
                if (reduceMotionToggle) reduceMotionToggle.checked = currentUser.accessibilityPreferences.reduceMotion || false;
                
                // Aplicar as preferências de acessibilidade visualmente (exemplo)
                applyAccessibilityPreferences(currentUser.accessibilityPreferences);
            }
        }
    }
    
    function applyAccessibilityPreferences(prefs) {
        if (!prefs) return;

        // Tamanho da Fonte
        if (prefs.fontSize) {
            document.body.classList.remove('font-size-normal', 'font-size-medium', 'font-size-large');
            document.body.classList.add(`font-size-${prefs.fontSize}`);
        }

        // Alto Contraste
        if (prefs.highContrast) {
            document.body.classList.add('high-contrast-mode');
        } else {
            document.body.classList.remove('high-contrast-mode');
        }

        // Reduzir Movimento
        if (prefs.reduceMotion) {
            document.body.classList.add('reduce-motion-mode');
        } else {
            document.body.classList.remove('reduce-motion-mode');
        }
    }


    // Navegação por abas
    function activateTab(tabId) {
        settingsMenuLinks.forEach(l => l.classList.remove('active'));
        settingsTabPanes.forEach(p => p.classList.remove('active'));

        const activeLink = document.querySelector(`.settings-menu-link[data-tab="${tabId}"]`);
        const activePane = document.getElementById(tabId);

        if (activeLink) activeLink.classList.add('active');
        if (activePane) activePane.classList.add('active');
    }

    settingsMenuLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const tabId = this.getAttribute('data-tab');
            activateTab(tabId);
            // Atualiza o hash da URL para navegação e bookmarking
            window.location.hash = tabId;
        });
    });

    // Ativar aba inicial baseada no hash da URL ou default
    const currentHash = window.location.hash.substring(1);
    if (currentHash && document.getElementById(currentHash)) {
        activateTab(currentHash);
    } else {
        activateTab('profile'); // Aba padrão
    }
    
    // Carregar dados do usuário ao iniciar
    loadUserData();

    // --- Lógica para formulários (simulação) ---

    const profileContactForm = document.getElementById('profileContactForm');
    if (profileContactForm) {
        profileContactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const updatedData = {
                phone: document.getElementById('settings-phone').value,
                birthDate: document.getElementById('settings-birthdate').value,
                fullAddress: {
                    cep: document.getElementById('settings-cep').value,
                    street: document.getElementById('settings-street').value,
                    number: document.getElementById('settings-number').value,
                    complement: document.getElementById('settings-complement').value,
                    neighborhood: document.getElementById('settings-neighborhood').value,
                    city: document.getElementById('settings-city').value,
                    state: document.getElementById('settings-state').value,
                }
            };
            if (auth.updateCurrentUserData(updatedData)) {
                alert('Informações de contato salvas com sucesso! (Simulação)');
            } else {
                alert('Erro ao salvar. Usuário não logado?');
            }
        });
    }

    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;

            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('Por favor, preencha todos os campos de senha.'); return;
            }
            if (newPassword !== confirmPassword) {
                alert('A nova senha e a confirmação não coincidem.'); return;
            }
            if (newPassword.length < 8) {
                alert('A nova senha deve ter pelo menos 8 caracteres.'); return;
            }
            // Lógica de verificação da senha atual e alteração (simulada)
            console.log('Tentativa de Alteração de Senha:', { currentPassword, newPassword });
            alert('Senha alterada com sucesso! (Simulação)');
            changePasswordForm.reset();
        });
    }

    const notificationsForm = document.getElementById('notificationsForm');
    if (notificationsForm) {
        notificationsForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const preferences = {
                email_promocoes: document.querySelector('input[name="email_promocoes"]').checked,
                email_novidades_passeios: document.querySelector('input[name="email_novidades_passeios"]').checked,
                email_lembretes_reservas: document.querySelector('input[name="email_lembretes_reservas"]').checked,
                email_solicitacao_avaliacao: document.querySelector('input[name="email_solicitacao_avaliacao"]').checked,
                email_newsletter: document.querySelector('input[name="email_newsletter"]').checked,
                // Note: email_atualizacoes_conta é disabled, então seu valor não muda pelo usuário
                push_alertas_reservas: document.querySelector('input[name="push_alertas_reservas"]').checked,
                push_mensagens_guias: document.querySelector('input[name="push_mensagens_guias"]').checked
            };
            if(auth.updateCurrentUserData({ notificationPreferences: preferences })){
                console.log('Preferências de Notificação Salvas:', preferences);
                alert('Preferências de notificação salvas com sucesso! (Simulação)');
            } else {
                 alert('Erro ao salvar preferências. Usuário não logado?');
            }
        });
    }
    
    const accessibilityForm = document.getElementById('accessibilityForm');
    if(accessibilityForm) {
        accessibilityForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const accessibilityPrefs = {
                fontSize: document.getElementById('fontSizePref').value,
                highContrast: document.getElementById('highContrastToggle').checked,
                reduceMotion: document.getElementById('reduceMotionToggle').checked
            };
            if(auth.updateCurrentUserData({ accessibilityPreferences: accessibilityPrefs })) {
                applyAccessibilityPreferences(accessibilityPrefs); // Aplica visualmente
                console.log('Preferências de Acessibilidade Salvas:', accessibilityPrefs);
                alert('Preferências de acessibilidade salvas com sucesso! (Simulação)');
            } else {
                alert('Erro ao salvar preferências de acessibilidade. Usuário não logado?');
            }
        });
    }


    // Lógica para botões de Privacidade e Pagamentos
    const requestDataExportBtn = document.getElementById('requestDataExportBtn');
    if (requestDataExportBtn) {
        requestDataExportBtn.addEventListener('click', function() {
            alert('Sua solicitação de exportação de dados foi recebida. Você receberá um e-mail com um link para download em até 72 horas. (Simulação)');
        });
    }

    const requestAccountDeletionBtn = document.getElementById('requestAccountDeletionBtn');
    if (requestAccountDeletionBtn) {
        requestAccountDeletionBtn.addEventListener('click', function() {
            if (confirm('TEM CERTEZA ABSOLUTA?\n\nEsta ação é IRREVERSÍVEL e todos os seus dados (perfil, reservas, avaliações, etc.) serão permanentemente excluídos.\n\nNão haverá como recuperar sua conta após esta ação.\n\nDeseja prosseguir com a exclusão?')) {
                // Lógica real de exclusão de conta (chamada à API no futuro)
                console.log('Solicitação de exclusão definitiva de conta confirmada pelo usuário.');
                alert('Sua conta foi marcada para exclusão. O processo será concluído em breve e você será deslogado automaticamente. Sentimos muito por sua partida. (Simulação)');
                // auth.logout(); // Simula logout
                // window.location.href = 'index.html'; // Redireciona para a home
            } else {
                alert('Exclusão de conta cancelada.');
            }
        });
    }
    
    const addPaymentMethodButton = document.getElementById('addPaymentMethodButton');
    if(addPaymentMethodButton){
        addPaymentMethodButton.addEventListener('click', function(){
            alert('Funcionalidade de adicionar novo cartão ainda não implementada. (Simulação)');
            // Aqui abriria um modal ou formulário para adicionar dados do cartão
        });
    }

    document.querySelectorAll('.btn-remove-card').forEach(button => {
        button.addEventListener('click', function(){
            const cardId = this.dataset.cardId;
            if(confirm(`Tem certeza que deseja remover o cartão **** ${cardId.slice(-4)}?`)){
                alert(`Cartão **** ${cardId.slice(-4)} removido com sucesso! (Simulação)`);
                // Lógica para remover o item da lista na UI
                this.closest('.payment-method-item').remove();
                // Verificar se a lista ficou vazia e mostrar mensagem
                if(document.querySelectorAll('.payment-method-item').length === 0){
                    const pMethods = document.querySelector('.saved-payment-methods');
                    if(pMethods) pMethods.querySelector('.form-hint').style.display = 'block';
                }
            }
        });
    });
    // Ocultar a mensagem "Nenhum cartão cadastrado" se houver cartões
    const paymentMethodsContainer = document.querySelector('.saved-payment-methods');
    if(paymentMethodsContainer && paymentMethodsContainer.querySelectorAll('.payment-method-item').length > 0){
        const emptyHint = paymentMethodsContainer.querySelector('.form-hint');
        if(emptyHint) emptyHint.style.display = 'none';
    }


    const revokeAllSessionsButton = document.getElementById('revokeAllSessionsButton');
    if(revokeAllSessionsButton){
        revokeAllSessionsButton.addEventListener('click', function(){
            if(confirm('Tem certeza que deseja desconectar de todas as outras sessões ativas? Você permanecerá logado nesta sessão atual.')){
                alert('Todas as outras sessões foram encerradas com sucesso! (Simulação)');
                // Lógica para remover itens da lista de sessões ativas, exceto a atual
                const activeSessionsList = document.querySelector('.active-sessions-list');
                if(activeSessionsList){
                    const otherSessions = activeSessionsList.querySelectorAll('li:not(:first-child)'); // Assume que a primeira é a atual
                    otherSessions.forEach(session => session.remove());
                }
            }
        });
    }
     document.querySelectorAll('.btn-revoke-session').forEach(button => {
        button.addEventListener('click', function(){
            const sessionId = this.dataset.sessionId;
            if(confirm('Tem certeza que deseja revogar esta sessão?')){
                alert(`Sessão ${sessionId} revogada com sucesso! (Simulação)`);
                this.closest('li').remove();
            }
        });
    });


    // Lógica do menu lateral global (se já não estiver em main.js)
    const globalMenuToggle = document.querySelector('.page-menu-toggle'); // Renomeado para evitar conflito
    const globalSidebarMenu = document.getElementById('sidebarMenu');
    const globalMenuOverlay = document.getElementById('menuOverlay');
    const globalCloseMenuBtn = document.getElementById('closeMenuBtn');

    function toggleGlobalSidebarMenu() {
        if (globalSidebarMenu) globalSidebarMenu.classList.toggle('open');
        if (globalMenuOverlay) globalMenuOverlay.classList.toggle('active');
    }

    if (globalMenuToggle) globalMenuToggle.addEventListener('click', toggleGlobalSidebarMenu);
    if (globalMenuOverlay) globalMenuOverlay.addEventListener('click', toggleGlobalSidebarMenu);
    if (globalCloseMenuBtn) globalCloseMenuBtn.addEventListener('click', toggleGlobalSidebarMenu);

});