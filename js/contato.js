document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const formStatusMessage = document.getElementById('contactFormStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            formStatusMessage.style.display = 'none'; // Esconde mensagens anteriores
            formStatusMessage.classList.remove('success', 'error');

            // Simulação de validação
            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const subject = document.getElementById('contact-subject').value;
            const message = document.getElementById('contact-message').value.trim();
            const agreePrivacy = document.querySelector('input[name="agree_privacy_contact"]').checked;

            if (!name || !email || !subject || !message) {
                formStatusMessage.textContent = 'Por favor, preencha todos os campos obrigatórios (*).';
                formStatusMessage.className = 'form-status-message error'; // Reutiliza classes de login.css se houver
                formStatusMessage.style.display = 'block';
                return;
            }
            if (!agreePrivacy) {
                 formStatusMessage.textContent = 'Você precisa concordar com a Política de Privacidade.';
                 formStatusMessage.className = 'form-status-message error';
                 formStatusMessage.style.display = 'block';
                 return;
            }

            // Simulação de envio (no futuro, seria uma chamada fetch/ajax)
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitButton.disabled = true;

            setTimeout(() => {
                console.log('Dados do Formulário de Contato:', { name, email, subject, message });
                formStatusMessage.textContent = 'Mensagem enviada com sucesso! Entraremos em contato em breve.';
                formStatusMessage.className = 'form-status-message success';
                formStatusMessage.style.display = 'block';
                
                contactForm.reset(); // Limpa o formulário
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;

                // Opcional: esconder mensagem após alguns segundos
                setTimeout(() => {
                    formStatusMessage.style.display = 'none';
                }, 5000);

            }, 1500); // Simula um delay de rede
        });
    }

    // Opcional: Inicialização do Mapa Leaflet
    /*
    const contactMapElement = document.getElementById('contactMap');
    if (contactMapElement) {
        // Coordenadas de Campos do Jordão (exemplo, ajuste para o endereço exato)
        const mapCoordinates = [-22.7390, -45.5910]; 
        const map = L.map('contactMap').setView(mapCoordinates, 15); // Zoom level 15

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker(mapCoordinates).addTo(map)
            .bindPopup('<b>Passeios da Serra</b><br>Av. Dr. Januário Miraglia, 1000<br>Campos do Jordão, SP')
            .openPopup();
    }
    */


    // Lógica do menu lateral global (copiada/adaptada, se ainda não estiver em main.js)
    const globalMenuToggle = document.querySelector('.page-menu-toggle');
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