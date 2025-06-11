document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth(); // Para o usuário logado, se necessário para alguma ação
    const passeiosManager = new PasseiosManager(); // Para dados de passeios e guias

    // Elementos da página (para popular com dados do guia)
    const guideProfileBanner = document.getElementById('guideProfileBanner');
    const guidePublicAvatar = document.getElementById('guidePublicAvatar');
    const guideVerifiedBadge = document.getElementById('guideVerifiedBadge');
    const guidePublicName = document.getElementById('guidePublicName');
    const guidePublicTagline = document.getElementById('guidePublicTagline');
    const guidePublicStars = document.getElementById('guidePublicStars');
    const guidePublicRatingText = document.getElementById('guidePublicRatingText');
    const contactGuideBtn = document.getElementById('contactGuideBtn');
    // const followGuideBtn = document.getElementById('followGuideBtn'); // Se implementado

    const guideNameInAbout = document.getElementById('guideNameInAbout');
    const guidePublicBio = document.getElementById('guidePublicBio');
    const guideCredentialsList = document.getElementById('guideCredentialsList');
    
    const guideNameInTours = document.getElementById('guideNameInTours');
    const guideOfferedToursGrid = document.getElementById('guideOfferedToursGrid');
    const noGuideToursMessage = document.getElementById('noGuideToursMessage');

    const guideNameInReviews = document.getElementById('guideNameInReviews');
    const guideReviewsSummaryElem = document.getElementById('guideReviewsSummary');
    const guideReceivedReviewsList = document.getElementById('guideReceivedReviewsList');
    const noGuideReviewsMessage = document.getElementById('noGuideReviewsMessage');

    // Sidebar Info
    const guideMemberSinceElem = document.getElementById('guideMemberSince');
    const guideTotalToursElem = document.getElementById('guideTotalTours');
    // ... outros elementos da sidebar

    // Botões de Compartilhamento
    const shareGuideFacebookBtn = document.getElementById('shareGuideFacebook');
    const shareGuideTwitterBtn = document.getElementById('shareGuideTwitter');
    const shareGuideWhatsAppBtn = document.getElementById('shareGuideWhatsApp');
    const copyGuideProfileLinkBtn = document.getElementById('copyGuideProfileLink');
    const copyGuideLinkStatusElem = document.getElementById('copyGuideLinkStatus');


    function getGuideData(guideId) {
        // SIMULAÇÃO: Buscar dados do guia. No futuro, viria de uma API ou do objeto de usuário se o guia for o usuário logado.
        // Se `passeios.js` tiver uma lista de guias ou se os dados do guia estiverem no objeto de usuário:
        // const guideData = passeiosManager.getGuiaById(guideId); // Função hipotética em passeios.js
        // Por agora, dados fixos para o guia "Yohan Montanhista" (ID '101' de passeios.js)
        if (guideId === '101') { // ID do Yohan nos dados de exemplo de passeios.js
             return {
                id: '101',
                name: 'Yohan Montanhista',
                tagline: 'Especialista em Trilhas e Aventuras na Serra da Mantiqueira',
                avatarUrl: 'assets/images/DonoPasseio.jpg',
                bannerUrl: 'assets/images/ImagemBlogBanner.jpg', // Imagem de capa
                isVerified: true,
                rating: 4.8,
                totalReviews: 87,
                bio: `<p>Olá! Sou Yohan, guia profissional credenciado desde 2015 e um verdadeiro apaixonado pela Serra da Mantiqueira. Minha missão é proporcionar experiências autênticas e seguras, revelando os segredos e a beleza única desta região.</p><p>Sou especializado em ecoturismo, trilhas de todos os níveis, e em compartilhar conhecimentos sobre a flora, fauna e geologia local. Comigo, sua aventura vai além de um simples passeio; é uma imersão na cultura e na natureza vibrante da montanha. Vamos explorar juntos?</p>`,
                credentials: [
                    { icon: 'fa-id-badge', text: 'CADASTUR: 12345678901234-5' },
                    { icon: 'fa-certificate', text: 'Certificado em Primeiros Socorros em Áreas Remotas (WAFA)' },
                    { icon: 'fa-language', text: 'Idiomas: Português (Nativo), Inglês (Fluente)' }
                ],
                memberSince: '2020-01-15',
                // ... outras informações rápidas da sidebar
            };
        }
        return null; // Guia não encontrado
    }

    function loadGuideProfile() {
        const urlParams = new URLSearchParams(window.location.search);
        const guideId = urlParams.get('id') || '101'; // Pega ID da URL ou usa '101' como padrão
        const guideData = getGuideData(guideId);

        if (!guideData) {
            if(guidePublicName) guidePublicName.textContent = "Guia não encontrado";
            // Ocultar ou mostrar mensagem de erro no restante da página
            document.querySelector('.guide-profile-details-section').innerHTML = '<p class="empty-state-text" style="text-align:center; padding: var(--space-xl);">Perfil de guia não encontrado.</p>';
            return;
        }

        document.title = `${guideData.name} - Perfil de Guia - Passeios da Serra`;

        if(guideProfileBanner && guideData.bannerUrl) guideProfileBanner.style.backgroundImage = `url('${guideData.bannerUrl}')`;
        if(guidePublicAvatar) guidePublicAvatar.src = guideData.avatarUrl;
        if(guideVerifiedBadge) guideVerifiedBadge.style.display = guideData.isVerified ? 'flex' : 'none';
        if(guidePublicName) guidePublicName.textContent = guideData.name;
        if(guidePublicTagline) guidePublicTagline.textContent = guideData.tagline;
        if(guidePublicStars) guidePublicStars.style.setProperty('--rating', guideData.rating); // Se usar variável CSS para estrelas
        if(guidePublicRatingText) guidePublicRatingText.textContent = `${guideData.rating} (${guideData.totalReviews} avaliações como guia)`;

        // Preencher seção "Sobre"
        if(guideNameInAbout) guideNameInAbout.textContent = guideData.name.split(' ')[0]; // Primeiro nome
        if(guidePublicBio) guidePublicBio.innerHTML = guideData.bio;
        if(guideCredentialsList && guideData.credentials) {
            guideCredentialsList.innerHTML = guideData.credentials.map(cred => 
                `<span class="credential-item"><i class="fas ${cred.icon}"></i> ${cred.text}</span>`
            ).join('');
        }

        // Preencher Passeios Oferecidos
        if(guideNameInTours) guideNameInTours.textContent = guideData.name.split(' ')[0];
        const offeredTours = passeiosManager.getPasseiosByUser(guideId); // Reutiliza de passeios.js
        if (guideOfferedToursGrid) {
            if (offeredTours.length > 0) {
                guideOfferedToursGrid.innerHTML = offeredTours.slice(0,4).map(tour => renderCompactTourCard(tour)).join(''); // Mostrar até 4, por exemplo
                if(noGuideToursMessage) noGuideToursMessage.style.display = 'none';
                // Adicionar link "Ver todos os passeios deste guia" se houver mais que 4
            } else {
                if(noGuideToursMessage) noGuideToursMessage.style.display = 'block';
            }
        }
        
        // Preencher Avaliações Recebidas (Simulado)
        if(guideNameInReviews) guideNameInReviews.textContent = guideData.name.split(' ')[0];
        // TODO: Lógica para buscar e renderizar avaliações específicas do guia
        if(guideReceivedReviewsList && noGuideReviewsMessage){
            guideReceivedReviewsList.innerHTML = '<p class="small-empty">Exemplo: "Guia excelente, muito atencioso!" - Maria S. ★★★★★</p>'; // Placeholder
            noGuideReviewsMessage.style.display = 'none'; // Assumindo que sempre há avaliações de exemplo
        }
        if(guideReviewsSummaryElem){
            guideReviewsSummaryElem.innerHTML = `<div class="stars" style="--rating: ${guideData.rating};"></div> Média de ${guideData.rating} estrelas (${guideData.totalReviews} avaliações)`;
        }


        // Preencher Sidebar Info (Simulado)
        if(guideMemberSinceElem && guideData.memberSince) guideMemberSinceElem.innerHTML = `<i class="fas fa-calendar-check"></i>Membro desde: ${new Date(guideData.memberSince).toLocaleDateString('pt-BR', {month:'short', year:'numeric'})}`;
        if(guideTotalToursElem) guideTotalToursElem.innerHTML = `<i class="fas fa-hiking"></i>Total de Passeios: ${offeredTours.length}`;

        // Ações de Compartilhamento
        const profileUrl = window.location.href;
        const profileTitle = encodeURIComponent(`Confira o perfil de ${guideData.name} na Passeios da Serra!`);
        if(shareGuideFacebookBtn) shareGuideFacebookBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`;
        if(shareGuideTwitterBtn) shareGuideTwitterBtn.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(profileUrl)}&text=${profileTitle}`;
        if(shareGuideWhatsAppBtn) shareGuideWhatsAppBtn.href = `https://api.whatsapp.com/send?text=${profileTitle}%20${encodeURIComponent(profileUrl)}`;
        
        if(copyGuideProfileLinkBtn && copyGuideLinkStatusElem) {
            copyGuideProfileLinkBtn.addEventListener('click', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(profileUrl).then(() => {
                    copyGuideLinkStatusElem.textContent = 'Link copiado!';
                    copyGuideLinkStatusElem.classList.add('visible');
                    setTimeout(() => {
                        copyGuideLinkStatusElem.classList.remove('visible');
                        copyGuideLinkStatusElem.textContent = '';
                    }, 2000);
                }).catch(err => { console.error('Erro ao copiar link: ', err);});
            });
        }

        if(contactGuideBtn){
            contactGuideBtn.addEventListener('click', () => {
                // Futuramente, abriria um modal de mensagem ou redirecionaria para um sistema de chat
                alert(`Simulação: Contatar ${guideData.name}. (Implementar sistema de mensagens)`);
            });
        }
    }

    function renderCompactTourCard(tour) {
        // Versão mais compacta do .passeio-card para a lista de passeios do guia
        return `
            <div class="passeio-card card-zoom compact-tour-card">
                <a href="passeio.html?id=${tour.id}" class="card-image-link">
                    <div class="card-image" style="background-image: url('assets/images/${tour.mainImage}'); height: 160px;">
                        ${tour.badge ? `<span class="card-badge">${tour.badge}</span>` : ''}
                    </div>
                </a>
                <div class="card-content" style="padding: var(--space-sm);">
                    <h4 style="font-size: 1rem; margin-bottom: var(--space-xs);"><a href="passeio.html?id=${tour.id}" style="color: var(--dark-green);">${tour.title}</a></h4>
                    <div class="card-rating" style="margin-bottom: var(--space-xs);">
                        <div class="stars" style="--rating: ${tour.rating}; font-size: 0.9rem;"></div>
                        <span class="rating-text" style="font-size: 0.8rem;">${tour.rating} (${tour.reviews})</span>
                    </div>
                    <span class="card-price" style="font-size: 1rem;">R$ ${parseFloat(tour.price).toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    // --- Inicialização ---
    loadGuideProfile();
    
    // Estilo de estrelas dinâmico (se o seu CSS principal não usa a variável --rating)
    document.querySelectorAll('.stars').forEach(starElement => {
        const rating = parseFloat(starElement.style.getPropertyValue('--rating'));
        // Se você tem uma função JS para preencher estrelas, chame-a aqui.
        // A implementação atual do CSS com a variável --rating deve funcionar.
        // Se não, adapte:
        // const percentage = (rating / 5) * 100;
        // starElement.querySelector('span').style.width = `${percentage}%`; // Supondo que tenha um <span> interno.
    });


    // Lógica do menu lateral global
    const globalMenuToggle = document.querySelector('.page-menu-toggle');
    const globalSidebarMenu = document.getElementById('sidebarMenu');
    const globalMenuOverlay = document.getElementById('menuOverlay');
   

    function toggleGlobalSidebarMenu() {
        if (globalSidebarMenu) globalSidebarMenu.classList.toggle('open');
        if (globalMenuOverlay) globalMenuOverlay.classList.toggle('active');
    }

    if (globalMenuToggle) globalMenuToggle.addEventListener('click', toggleGlobalSidebarMenu);
    if (globalMenuOverlay) globalMenuOverlay.addEventListener('click', toggleGlobalSidebarMenu);
    
});