// js/passeio-detalhe-features.js
document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth();
    const passeiosManager = new PasseiosManager(); // Assume que getGuiaById é um método ou acessa dados de guias
    let currentUser = auth.getCurrentUser();
    let currentPasseio = null;
    let currentPasseioId = null;
    let currentGalleryImages = [];
    let currentImageIndexInLightbox = 0;

    new SidebarMenuHandler({
        menuToggleSelector: '.page-menu-toggle',
        sidebarMenuId: 'sidebarMenuPasseio',
        menuOverlayId: 'menuOverlayPasseio'
    });
    updatePasseioPageSidebarUserStatus();

    const elements = {
        title: document.getElementById('passeioTitle'),
        heroImage: document.getElementById('passeioHeroImage'),
        ratingOverall: document.getElementById('passeioRatingOverall'),
        locationHeader: document.getElementById('passeioLocationHeader'),
        favoriteButton: document.getElementById('favoriteButtonPasseio'),
        longDesc: document.getElementById('passeioLongDesc'),
        oQueEsperar: document.getElementById('passeioOQueEsperar'),
        destaquesList: document.getElementById('passeioDestaquesList'),
        galleryContainer: document.getElementById('passeioGalleryContainer'),
        infoGrid: document.getElementById('passeioInfoGrid'),
        faqSection: document.getElementById('passeioFaqSection'),
        faqItemsContainer: document.getElementById('passeioFaqItemsContainer'),
        reviewsSummaryContainer: document.getElementById('passeioReviewsSummaryContainer'),
        reviewsListContainer: document.getElementById('passeioReviewsListContainer'),
        addReviewContainer: document.getElementById('addReviewContainer'),
        bookingCardPrice: document.getElementById('bookingCardPrice'),
        bookingDateSelect: document.getElementById('booking-date'),
        bookingParticipantsSelect: document.getElementById('booking-participants'),
        bookingTotalPrice: document.getElementById('bookingTotalPrice'),
        bookNowButton: document.getElementById('bookNowButton'),
        bookingForm: document.getElementById('bookingForm'),
        bookingStatusMessage: document.getElementById('bookingStatusMessage'),
        bookingCancellationPolicyText: document.getElementById('bookingCancellationPolicyText'),
        guideCard: document.getElementById('guideCard'),
        guideAvatar: document.getElementById('guideAvatar'),
        guideName: document.getElementById('guideName'),
        guideRatingDisplay: document.getElementById('guideRatingDisplay'),
        guideBioShort: document.getElementById('guideBioShort'),
        guideProfileLink: document.getElementById('guideProfileLink'),
        mapImage: document.getElementById('mapImagePasseio'),
        mapDirectionsLinkContainer: document.getElementById('mapDirectionsLinkContainer'),
        mapDirectionsLink: document.getElementById('mapDirectionsLink'),
        mapLocationAddress: document.getElementById('mapLocationAddress'),
        lightboxModal: document.getElementById('imageLightboxModal'),
        lightboxImage: document.getElementById('lightboxImage'),
        lightboxClose: document.getElementById('lightboxClose'),
        lightboxPrev: document.getElementById('lightboxPrev'),
        lightboxNext: document.getElementById('lightboxNext'),
        shareFacebookBtn: document.getElementById('shareFacebookBtn'),
        shareTwitterBtn: document.getElementById('shareTwitterBtn'),
        shareWhatsAppBtn: document.getElementById('shareWhatsAppBtn'),
        copyLinkBtnPasseio: document.getElementById('copyLinkBtnPasseio'),
        copyLinkStatusPasseio: document.getElementById('copyLinkStatusPasseio')
    };

    function updatePasseioPageSidebarUserStatus() {
        currentUser = auth.getCurrentUser();
        const sbProfileImg = document.getElementById('sidebarProfileImgPasseio');
        const sbProfileName = document.getElementById('sidebarProfileNamePasseio');
        const sbProfileEmail = document.getElementById('sidebarProfileEmailPasseio');
        const sbLinkAuth = document.getElementById('sidebarLinkAuthPasseio');
        const userSpecificLinks = [
            document.getElementById('sidebarLinkMeuPerfilPasseio'),
            document.getElementById('sidebarLinkCriarPasseioPasseio'),
            document.getElementById('sidebarLinkAvaliacoesPasseio'),
            document.getElementById('sidebarLinkFavoritosPasseio'),
            document.getElementById('sidebarLinkConfiguracoesPasseio')
        ];
        if (currentUser) {
            if(sbProfileImg) { sbProfileImg.src = currentUser.avatarUrl || 'assets/images/ImagemUsuario.jpg'; sbProfileImg.style.display = 'block';}
            if(sbProfileName) sbProfileName.textContent = currentUser.name;
            if(sbProfileEmail) sbProfileEmail.textContent = currentUser.email;
            userSpecificLinks.forEach(link => {
                if(link) link.style.display = (link.id === 'sidebarLinkCriarPasseioPasseio' && currentUser.creatorStatus !== 'verified') ? 'none' : 'list-item';
            });
            if (sbLinkAuth) {
                sbLinkAuth.innerHTML = `<a href="#" id="sidebarLogoutLinkPasseio"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
                document.getElementById('sidebarLogoutLinkPasseio')?.addEventListener('click', (e) => {
                    e.preventDefault(); auth.logout(); updatePasseioPageSidebarUserStatus(); window.location.reload();
                });
            }
        } else {
            if(sbProfileImg) sbProfileImg.style.display = 'none';
            if(sbProfileName) sbProfileName.textContent = 'Visitante';
            if(sbProfileEmail) sbProfileEmail.textContent = 'Faça login ou cadastre-se';
            userSpecificLinks.forEach(link => { if(link) link.style.display = 'none'; });
            if (sbLinkAuth) sbLinkAuth.innerHTML = `<a href="login.html?redirect=${encodeURIComponent(window.location.href)}"><i class="fas fa-sign-in-alt"></i> Login / Cadastro</a>`;
        }
    }

    function getPasseioIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }

    function formatDate(dateString, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
        if (!dateString) return 'N/A';
        try {
            // Adicionar um horário fixo para evitar problemas de fuso horário que mudam a data
            const datePart = dateString.split('T')[0]; // Pega apenas a parte da data
            return new Date(datePart + 'T12:00:00Z').toLocaleDateString('pt-BR', options);
        } catch (e) {
            console.error("Erro ao formatar data:", dateString, e);
            return dateString; // Retorna a string original em caso de erro
        }
    }
    function formatDateTimeForSelect(date, time) { return `${date} ${time}`; }

    function clearPlaceholder(element) {
        if (element && element.hasAttribute('data-placeholder')) {
            element.removeAttribute('data-placeholder');
            const originalPlaceholderText = element.getAttribute('data-placeholder-original-text');
            if(element.textContent === originalPlaceholderText) element.textContent = '';
        }
    }
    document.querySelectorAll('[data-placeholder]').forEach(el => el.setAttribute('data-placeholder-original-text', el.textContent));


    function displayPasseioData(passeio) {
        if (!passeio) {
            if (elements.title) elements.title.textContent = "Passeio não encontrado";
            document.querySelector('.passeio-container').innerHTML = '<p style="text-align:center; font-size:1.2rem; padding: 2rem;">Desculpe, o passeio que você procura não foi encontrado ou não está mais disponível. <a href="pesquisa.html" class="link-highlight">Voltar para a busca de passeios</a>.</p>';
            return;
        }
        currentPasseio = passeio;
        document.title = `${passeio.title || 'Detalhes do Passeio'} - Passeios da Serra`;

        if (elements.title) { elements.title.textContent = passeio.title; clearPlaceholder(elements.title); }
        if (elements.heroImage) elements.heroImage.style.backgroundImage = `url('assets/images/${passeio.mainImage || 'placeholder-passeio-grande.jpg'}')`;
        
        if (elements.ratingOverall) {
            const starsDiv = elements.ratingOverall.querySelector('.stars');
            const ratingText = elements.ratingOverall.querySelector('.rating-text');
            starsDiv.dataset.rating = passeio.rating || 0;
            starsDiv.querySelector('span').style.width = `${((passeio.rating || 0) / 5) * 100}%`;
            ratingText.textContent = `(${passeio.reviews || 0} avaliações)`;
            clearPlaceholder(ratingText);
        }
        if (elements.locationHeader) { elements.locationHeader.querySelector('span').textContent = passeio.location || 'Não informado'; clearPlaceholder(elements.locationHeader.querySelector('span'));}

        if (elements.longDesc) { elements.longDesc.innerHTML = passeio.longDesc ? marked.parse(passeio.longDesc) : 'Descrição detalhada não disponível.'; clearPlaceholder(elements.longDesc); } // Usando marked.js para Markdown
        if (elements.oQueEsperar) { elements.oQueEsperar.innerHTML = passeio.oQueEsperar ? marked.parse(passeio.oQueEsperar) : 'Detalhes sobre o que esperar não fornecidos.'; clearPlaceholder(elements.oQueEsperar); }
        
        if (elements.destaquesList) {
            elements.destaquesList.innerHTML = '';
            (passeio.destaques || []).forEach(d => elements.destaquesList.innerHTML += `<li><i class="fas fa-check"></i> ${d}</li>`);
            if (passeio.destaques && passeio.destaques.length > 0) clearPlaceholder(elements.destaquesList);
            else elements.destaquesList.innerHTML = '<li>Nenhum destaque especial informado.</li>';
        }

        currentGalleryImages = passeio.galleryImages || [];
        if (elements.galleryContainer) {
            elements.galleryContainer.innerHTML = '';
            if (currentGalleryImages.length > 0) {
                clearPlaceholder(elements.galleryContainer);
                currentGalleryImages.forEach((imgName, index) => {
                    const item = document.createElement('div');
                    item.className = 'gallery-item';
                    item.style.backgroundImage = `url('assets/images/${imgName}')`;
                    item.dataset.index = index;
                    item.setAttribute('aria-label', `Ver imagem ${index + 1} da galeria`);
                    item.tabIndex = 0; // Torna clicável pelo teclado
                    item.addEventListener('click', () => openLightbox(index));
                    item.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') openLightbox(index); });
                    elements.galleryContainer.appendChild(item);
                });
            } else {
                elements.galleryContainer.innerHTML = '<p>Nenhuma imagem adicional na galeria.</p>';
            }
        }

        if (elements.infoGrid) {
            elements.infoGrid.innerHTML = `
                <div class="info-item"><i class="fas fa-clock"></i><div><h4>Duração</h4><p>${passeio.duration || 'N/A'} horas</p></div></div>
                <div class="info-item"><i class="fas fa-users"></i><div><h4>Tamanho Máx. Grupo</h4><p>${passeio.maxParticipants || 'N/A'} pessoas</p></div></div>
                <div class="info-item"><i class="fas fa-language"></i><div><h4>Idiomas</h4><p>${(passeio.languagesShown || ['Português']).join(', ')}</p></div></div>
                <div class="info-item"><i class="fas fa-utensils"></i><div><h4>Refeições</h4><p>${(passeio.includedItems && passeio.includedItems.includes('refeicoes')) ? 'Inclusas' : 'Não inclusas'}</p></div></div>
                <div class="info-item"><i class="fas fa-hiking"></i><div><h4>Dificuldade</h4><p>${passeio.difficulty ? (passeio.difficulty.charAt(0).toUpperCase() + passeio.difficulty.slice(1)) : 'N/A'}</p></div></div>
                <div class="info-item"><i class="fas fa-list-alt"></i><div><h4>O que levar/Requisitos</h4><p>${passeio.requirements || 'Verificar com o guia.'}</p></div></div>
            `;
            clearPlaceholder(elements.infoGrid);
        }
        
        // Seção FAQ (exemplo, precisa de dados no objeto passeio)
        if (elements.faqSection && elements.faqItemsContainer && passeio.faqs && passeio.faqs.length > 0) {
            elements.faqSection.style.display = 'block';
            elements.faqItemsContainer.innerHTML = '';
            passeio.faqs.forEach(faq => {
                const faqItem = document.createElement('div');
                faqItem.className = 'faq-item';
                faqItem.innerHTML = `
                    <button class="faq-question">
                        <span>${faq.question}</span>
                        <i class="fas fa-chevron-down"></i>
                    </button>
                    <div class="faq-answer"><p>${faq.answer}</p></div>
                `;
                elements.faqItemsContainer.appendChild(faqItem);
            });
            // Adicionar lógica de accordion para FAQs (pode estar em main.js ou aqui)
             elements.faqItemsContainer.querySelectorAll('.faq-question').forEach(button => {
                button.addEventListener('click', () => {
                    const answer = button.nextElementSibling;
                    const isActive = button.classList.contains('active');
                    // Fechar outros (opcional)
                    elements.faqItemsContainer.querySelectorAll('.faq-question.active').forEach(q => {
                        if (q !== button) { 
                            q.classList.remove('active'); 
                            q.nextElementSibling.style.maxHeight = null; 
                            q.nextElementSibling.style.paddingTop = '0';
                            q.nextElementSibling.style.paddingBottom = '0';
                        }
                    });
                    button.classList.toggle('active');
                    if (button.classList.contains('active')) {
                        answer.style.paddingTop = 'var(--space-md)'; 
                        answer.style.paddingBottom = 'var(--space-md)';
                        answer.style.maxHeight = answer.scrollHeight + "px";
                    } else {
                        answer.style.maxHeight = null;
                        answer.style.paddingTop = '0';
                        answer.style.paddingBottom = '0';
                    }
                });
            });
        } else if (elements.faqSection) {
            elements.faqSection.style.display = 'none';
        }

        // Booking Card
        if (elements.bookingCardPrice) { elements.bookingCardPrice.textContent = `R$ ${parseFloat(passeio.price || 0).toFixed(2).replace('.',',')}`; clearPlaceholder(elements.bookingCardPrice); }
        if (elements.bookingDateSelect) {
            elements.bookingDateSelect.innerHTML = '<option value="">Selecione data e horário...</option>';
            (passeio.datesAvailability || []).forEach(avail => {
                const option = document.createElement('option');
                const dateTimeValue = formatDateTimeForSelect(avail.date, avail.time);
                option.value = dateTimeValue;
                const vagas = verificarVagas(passeio.id, avail.date, avail.time, passeio.maxParticipants);
                option.textContent = `${formatDate(avail.date, {day:'2-digit', month:'short', year:'numeric'})} às ${avail.time} (${vagas > 0 ? vagas + ' vagas' : 'Esgotado'})`;
                option.disabled = vagas === 0;
                elements.bookingDateSelect.appendChild(option);
            });
        }
        if (elements.bookingParticipantsSelect) {
            elements.bookingParticipantsSelect.innerHTML = '';
            const maxVagasInicial = passeio.maxParticipants || 10; // Usa maxParticipants do passeio se não houver data selecionada
            for (let i = 1; i <= maxVagasInicial; i++) {
                const option = document.createElement('option'); option.value = i; option.textContent = `${i} pessoa${i > 1 ? 's' : ''}`;
                elements.bookingParticipantsSelect.appendChild(option);
            }
        }
        // Lógica para atualizar max participantes no select quando data/hora é escolhida
        elements.bookingDateSelect?.addEventListener('change', function() {
            const selectedDateHour = this.value;
            if (selectedDateHour && currentPasseio) {
                const [selectedDate, selectedTime] = selectedDateHour.split(' ');
                const vagas = verificarVagas(currentPasseio.id, selectedDate, selectedTime, currentPasseio.maxParticipants);
                elements.bookingParticipantsSelect.innerHTML = ''; // Limpa opções antigas
                for (let i = 1; i <= vagas; i++) {
                    const option = document.createElement('option'); option.value = i; option.textContent = `${i} pessoa${i > 1 ? 's' : ''}`;
                    elements.bookingParticipantsSelect.appendChild(option);
                }
                if (vagas === 0) {
                    const option = document.createElement('option'); option.value = ""; option.textContent = "Esgotado";
                    elements.bookingParticipantsSelect.appendChild(option);
                }
            }
            updateBookingTotalPrice();
        });


        if(elements.bookingCancellationPolicyText) {
            const policies = { flexivel: "Cancelamento gratuito até 24h antes.", moderada: "Cancelamento gratuito até 72h antes. Reembolso de 50% até 24h antes.", rigorosa: "Reembolso de 50% até 7 dias antes. Sem reembolso após.", nao_reembolsavel: "Esta reserva não é reembolsável." };
            elements.bookingCancellationPolicyText.textContent = policies[passeio.cancelationPolicy] || "Consulte a política.";
            clearPlaceholder(elements.bookingCancellationPolicyText);
        }
        updateBookingTotalPrice();

        // Guia Card
        const guia = passeiosManager.getGuiaById(passeio.creatorId);
        if (guia && elements.guideCard) {
            elements.guideCard.style.display = 'block';
            if(elements.guideAvatar) elements.guideAvatar.src = guia.avatarUrl || 'assets/images/ImagemUsuarioPlaceholder.png';
            if(elements.guideName) {elements.guideName.textContent = guia.publicName || guia.name; clearPlaceholder(elements.guideName);}
            if(elements.guideRatingDisplay) {
                const starsDiv = elements.guideRatingDisplay.querySelector('.stars');
                const ratingText = elements.guideRatingDisplay.querySelector('.rating-text');
                const guideRatingValue = guia.ratingAsGuide || 0; // Assumindo campo no objeto guia
                const guideReviewsCount = guia.totalReviewsAsGuide || 0;
                starsDiv.dataset.rating = guideRatingValue;
                starsDiv.querySelector('span').style.width = `${(guideRatingValue / 5) * 100}%`;
                ratingText.textContent = `(${guideReviewsCount} avaliações como guia)`;
                clearPlaceholder(ratingText);
            }
            if(elements.guideBioShort) { elements.guideBioShort.textContent = (guia.publicBio || guia.tagline || 'Guia experiente.').substring(0, 120) + "..."; clearPlaceholder(elements.guideBioShort); }
            if(elements.guideProfileLink) elements.guideProfileLink.href = `perfil-guia.html?id=${guia.id}`;
        } else if (elements.guideCard) {
            elements.guideCard.style.display = 'none';
        }

        if (elements.mapImage && passeio.mapImageUrl) elements.mapImage.src = `assets/images/${passeio.mapImageUrl}`;
        else if (elements.mapImage) elements.mapImage.src = 'assets/images/MapPlaceholder.png';
        if (elements.mapLocationAddress && passeio.locationDetailed) elements.mapLocationAddress.textContent = passeio.locationDetailed;
        if (elements.mapDirectionsLink && passeio.mapsLink) {
            elements.mapDirectionsLink.href = passeio.mapsLink;
            if(elements.mapDirectionsLinkContainer) elements.mapDirectionsLinkContainer.style.display = 'block';
        } else if (elements.mapDirectionsLinkContainer) {
            elements.mapDirectionsLinkContainer.style.display = 'none';
        }
        
        document.querySelectorAll('.passeio-section, .passeio-sidebar > .animate-on-scroll').forEach(el => {
            el.classList.add('loaded');
        });
        
        if (elements.favoriteButton) { elements.favoriteButton.dataset.tourId = passeio.id; updateFavoriteButtonDisplay(passeio.id); }
        loadReviews(passeio.id);
        setupAddReviewForm(passeio.id);
        setupSocialShare(passeio);
    }
    
    // Booking Card Logic
    function updateBookingTotalPrice() {
        if (!currentPasseio || !elements.bookingTotalPrice || !elements.bookingParticipantsSelect) return;
        const basePrice = parseFloat(currentPasseio.price) || 0;
        const participants = parseInt(elements.bookingParticipantsSelect.value) || 1;
        const total = basePrice * participants;
        elements.bookingTotalPrice.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    }
    if (elements.bookingParticipantsSelect) elements.bookingParticipantsSelect.addEventListener('change', updateBookingTotalPrice);
    
    if (elements.bookingForm) {
        elements.bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (elements.bookNowButton) {
                elements.bookNowButton.disabled = true;
                elements.bookNowButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
            }
            displayBookingStatus('', '');

            if (!currentUser) {
                displayBookingStatus('Você precisa estar logado para fazer uma reserva.', 'error');
                setTimeout(() => window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`, 2500);
                if (elements.bookNowButton) { elements.bookNowButton.disabled = false; elements.bookNowButton.textContent = 'Reservar Agora';}
                return;
            }
            const selectedDateHour = elements.bookingDateSelect.value;
            const participants = parseInt(elements.bookingParticipantsSelect.value);

            let formValid = true;
            if (!selectedDateHour) {
                document.getElementById('bookingDateError').textContent = 'Selecione data/hora.'; formValid = false;
            } else { document.getElementById('bookingDateError').textContent = ''; }
            if (!participants || participants < 1) {
                 document.getElementById('bookingParticipantsError').textContent = 'Selecione o nº de participantes.'; formValid = false;
            } else { document.getElementById('bookingParticipantsError').textContent = ''; }

            if (!formValid) {
                displayBookingStatus('Por favor, corrija os erros no formulário.', 'error');
                if (elements.bookNowButton) { elements.bookNowButton.disabled = false; elements.bookNowButton.textContent = 'Reservar Agora';}
                return;
            }
            
            const [selectedDate, selectedTime] = selectedDateHour.split(' ');

            if (verificarVagas(currentPasseio.id, selectedDate, selectedTime, currentPasseio.maxParticipants) < participants) {
                displayBookingStatus('Não há vagas suficientes para esta data/horário e número de participantes.', 'error');
                if (elements.bookNowButton) { elements.bookNowButton.disabled = false; elements.bookNowButton.textContent = 'Reservar Agora';}
                return;
            }

            const reservaId = `PSR-${Date.now().toString().slice(-6)}`;
            const valorTotalCalculado = parseFloat(elements.bookingTotalPrice.textContent.replace('R$ ', '').replace(',', '.'));
            const novaReserva = {
                reservaId: reservaId, passeioId: currentPasseio.id, userId: currentUser.id,
                userName: currentUser.name, dataPasseio: selectedDate, horaPasseio: selectedTime,
                participantes: participants, valorTotal: valorTotalCalculado,
                statusReserva: 'confirmed', dataReservaEfetuada: new Date().toISOString().split('T')[0]
            };
            let todasReservas = JSON.parse(localStorage.getItem('all_site_bookings')) || [];
            todasReservas.push(novaReserva);
            localStorage.setItem('all_site_bookings', JSON.stringify(todasReservas));
            
            displayBookingStatus('Reserva confirmada com sucesso! Você será redirecionado em instantes.', 'success');
            setTimeout(() => {
                window.location.href = `reserva-confirmada.html?codigo=${reservaId}&passeioId=${currentPasseio.id}&data=${selectedDateHour}&participantes=${participants}&total=${valorTotalCalculado.toFixed(2)}`;
            }, 2500);
        });
    }
    function displayBookingStatus(message, type) {
        if (!elements.bookingStatusMessage) return;
        elements.bookingStatusMessage.textContent = message;
        elements.bookingStatusMessage.className = 'booking-status-message'; // Reset
        if (type) elements.bookingStatusMessage.classList.add(type, 'visible');
    }
    function verificarVagas(passeioId, data, hora, maxParticipantes) {
        const todasReservas = JSON.parse(localStorage.getItem('all_site_bookings')) || [];
        const reservasNestaDataHora = todasReservas.filter(
            r => r.passeioId === passeioId && r.dataPasseio === data && r.horaPasseio === hora && 
                 (r.statusReserva === 'confirmed' || r.statusReserva === 'pending_payment')
        );
        const participantesReservados = reservasNestaDataHora.reduce((sum, r) => sum + parseInt(r.participantes), 0);
        return Math.max(0, maxParticipantes - participantesReservados);
    }

    // Galeria Lightbox
    function openLightbox(index) {
        if (!elements.lightboxModal || !elements.lightboxImage || currentGalleryImages.length === 0) return;
        currentImageIndexInLightbox = index;
        updateLightboxImage();
        elements.lightboxModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeLightbox() {
        if (!elements.lightboxModal) return;
        elements.lightboxModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    function updateLightboxImage() {
        if (!elements.lightboxImage || currentGalleryImages.length === 0) return;
        elements.lightboxImage.src = `assets/images/${currentGalleryImages[currentImageIndexInLightbox]}`;
        elements.lightboxPrev.style.display = currentGalleryImages.length > 1 ? 'flex' : 'none';
        elements.lightboxNext.style.display = currentGalleryImages.length > 1 ? 'flex' : 'none';
    }
    function changeLightboxImage(step) {
        currentImageIndexInLightbox = (currentImageIndexInLightbox + step + currentGalleryImages.length) % currentGalleryImages.length;
        updateLightboxImage();
    }
    if(elements.lightboxClose) elements.lightboxClose.addEventListener('click', closeLightbox);
    if(elements.lightboxPrev) elements.lightboxPrev.addEventListener('click', () => changeLightboxImage(-1));
    if(elements.lightboxNext) elements.lightboxNext.addEventListener('click', () => changeLightboxImage(1));
    if(elements.lightboxModal) elements.lightboxModal.addEventListener('click', (e) => { if(e.target === elements.lightboxModal) closeLightbox(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && elements.lightboxModal?.classList.contains('active')) closeLightbox(); });

    // Sistema de Avaliações
    function loadReviews(passeioId) {
        if (!elements.reviewsListContainer || !elements.reviewsSummaryContainer) return;
        const todasAvaliacoes = JSON.parse(localStorage.getItem('passeios_reviews_geral')) || [];
        const avaliacoesDoPasseio = todasAvaliacoes.filter(r => r.passeioId === passeioId);
        
        let somaRatings = 0; const ratingCounts = {1:0, 2:0, 3:0, 4:0, 5:0};
        avaliacoesDoPasseio.forEach(r => { somaRatings += r.rating; ratingCounts[r.rating]++; });
        const mediaGeral = avaliacoesDoPasseio.length > 0 ? (somaRatings / avaliacoesDoPasseio.length) : 0;

        elements.reviewsSummaryContainer.innerHTML = `
            <div class="summary-rating">
                <div class="overall-rating">${mediaGeral.toFixed(1)}</div>
                <div class="stars" data-rating="${mediaGeral.toFixed(1)}"><span>★★★★★</span></div>
                <div class="total-reviews">${avaliacoesDoPasseio.length} avaliações</div>
            </div>
            <div class="rating-bars">
                ${[5,4,3,2,1].map(star => `
                    <div class="rating-bar">
                        <span>${star} estrela${star > 1 ? 's':''}</span>
                        <div class="bar-container"><div class="bar-fill" style="width: ${avaliacoesDoPasseio.length > 0 ? (ratingCounts[star] / avaliacoesDoPasseio.length * 100) : 0}%"></div></div>
                        <span>${ratingCounts[star]}</span>
                    </div>`).join('')}
            </div>`;
        const starsSum = elements.reviewsSummaryContainer.querySelector('.stars span');
        if (starsSum) starsSum.style.width = `${(mediaGeral / 5) * 100}%`;
        clearPlaceholder(elements.reviewsSummaryContainer);

        elements.reviewsListContainer.innerHTML = '';
        if (avaliacoesDoPasseio.length > 0) {
            clearPlaceholder(elements.reviewsListContainer);
            avaliacoesDoPasseio.sort((a,b) => new Date(b.date) - new Date(a.date)).forEach((review, idx) => {
                const item = document.createElement('div');
                item.className = 'review'; // 'animate-on-scroll' será adicionado pelo observer
                item.style.transitionDelay = `${idx * 0.05}s`; // Stagger para entrada
                item.innerHTML = `
                    <div class="review-header"><div class="review-author">
                        <img src="${review.userAvatar || 'assets/images/ImagemUsuarioPlaceholder.png'}" alt="${review.userName || 'Anônimo'}">
                        <div><h4>${review.userName || 'Anônimo'}</h4>
                             <div class="review-rating"><div class="stars" data-rating="${review.rating}"><span>★★★★★</span></div>
                             <span class="review-date">${formatDate(review.date)}</span></div>
                        </div></div></div>
                    <div class="review-content">${review.title ? `<h3>${review.title}</h3>` : ''}<p>${review.text}</p></div>
                    <div class="review-actions"><button class="btn-like" data-review-id="${review.id}"><i class="far fa-thumbs-up"></i> Útil (${review.likes || 0})</button></div>`;
                elements.reviewsListContainer.appendChild(item);
                item.querySelector('.stars span').style.width = `${(review.rating/5)*100}%`;
            });
            attachLikeButtonListeners();
            elements.reviewsListContainer.querySelectorAll('.review').forEach(el => {el.style.opacity=0; elementObserverPasseio.observe(el);});
        } else {
            elements.reviewsListContainer.innerHTML = '<p>Este passeio ainda não possui avaliações. Seja o primeiro!</p>';
        }
    }
    function attachLikeButtonListeners() {
        elements.reviewsListContainer.querySelectorAll('.btn-like').forEach(button => {
            const newButton = button.cloneNode(true); button.parentNode.replaceChild(newButton, button);
            newButton.addEventListener('click', function() {
                const reviewId = this.dataset.reviewId;
                let todasAvaliacoes = JSON.parse(localStorage.getItem('passeios_reviews_geral')) || [];
                const rIdx = todasAvaliacoes.findIndex(r => r.id === reviewId);
                if (rIdx > -1) {
                    todasAvaliacoes[rIdx].likes = (todasAvaliacoes[rIdx].likes || 0) + 1;
                    localStorage.setItem('passeios_reviews_geral', JSON.stringify(todasAvaliacoes));
                    this.innerHTML = `<i class="fas fa-thumbs-up"></i> Útil (${todasAvaliacoes[rIdx].likes})`;
                    this.disabled = true;
                }
            });
        });
    }
    function setupAddReviewForm(passeioId) {
        if (!elements.addReviewContainer) return;
        elements.addReviewContainer.innerHTML = ''; 
        if (!currentUser) {
            elements.addReviewContainer.innerHTML = `<p>Você precisa estar <a href="login.html?redirect=${encodeURIComponent(window.location.href)}" class="link-highlight">logado</a> para avaliar.</p>`; return;
        }
        const minhasReservas = JSON.parse(localStorage.getItem('all_site_bookings')) || [];
        const participou = minhasReservas.some(r => r.userId === currentUser.id && r.passeioId === passeioId && r.statusReserva === 'completed');
        if (!participou) {
            elements.addReviewContainer.innerHTML = '<p>Avalie este passeio após sua participação.</p>'; return;
        }
        const todasAv = JSON.parse(localStorage.getItem('passeios_reviews_geral')) || [];
        if (todasAv.some(r => r.userId === currentUser.id && r.passeioId === passeioId)) {
            elements.addReviewContainer.innerHTML = '<p>Você já avaliou este passeio. Obrigado!</p>'; return;
        }
        elements.addReviewContainer.innerHTML = `
            <form id="addReviewFormPasseio"><hr class="settings-divider" style="margin: var(--space-lg) 0;"><h3>Deixe sua Avaliação</h3>
                <div class="form-group"><label for="review-rating-select">Sua Nota*:</label><div class="stars-select" id="reviewFormStarsPasseio">
                    ${[5,4,3,2,1].map(n => `<input type="radio" id="formStarP${n}" name="reviewRating" value="${n}" required><label for="formStarP${n}" title="${n} estrelas"><i class="far fa-star"></i></label>`).join('')}
                </div><small id="review-rating-selectError" class="field-error-msg"></small></div>
                <div class="form-group"><label for="review-title-passeio">Título (Opcional):</label><input type="text" id="review-title-passeio" class="form-control" placeholder="Ex: Experiência Incrível!"></div>
                <div class="form-group"><label for="review-text-passeio">Seu Comentário*:</label><textarea id="review-text-passeio" class="form-control" rows="4" placeholder="Compartilhe sua experiência..." required></textarea><small id="review-text-passeioError" class="field-error-msg"></small></div>
                <div class="form-actions"><button type="submit" class="btn btn-primary" id="submitReviewBtnPasseio">Enviar Avaliação</button></div>
                <div id="reviewSubmitStatusPasseio" class="form-status-message"></div></form>`;
        
        const formStars = elements.addReviewContainer.querySelectorAll('#reviewFormStarsPasseio label');
        formStars.forEach(label => { /* ... (lógica de interação com estrelas como na resposta anterior) ... */ });
        document.getElementById('addReviewFormPasseio').addEventListener('submit', function(e) { /* ... (lógica de submit como na resposta anterior, usando os IDs corretos e displaySubmitStatus) ... */ });
    }
    function displaySubmitStatus(element, message, type) { /* ... (como na resposta anterior) ... */ }

    // Favoritar
    function getFavorites() { return JSON.parse(localStorage.getItem('favorite_tours_ids')) || []; }
    function isFavorite(tourId) { return getFavorites().includes(tourId.toString()); }
    function toggleFavoritePasseio(tourId) { /* ... (como na resposta anterior) ... */ }
    function updateFavoriteButtonDisplay(tourId) { /* ... (como na resposta anterior, usando elements.favoriteButton) ... */ }
    if (elements.favoriteButton) elements.favoriteButton.addEventListener('click', function() { /* ... (como na resposta anterior) ... */});

    // Compartilhamento Social
    function setupSocialShare(passeio) { /* ... (como na resposta anterior, usando elements.share...) ... */ }

    // Inicialização da Página
    currentPasseioId = getPasseioIdFromUrl();
    if (currentPasseioId) {
        const passeioData = passeiosManager.getPasseioById(currentPasseioId);
        displayPasseioData(passeioData);
    } else {
        displayPasseioData(null);
    }
    
    const elementObserverPasseio = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const animationType = el.dataset.animation || 'fadeInUp';
                const delay = parseFloat(el.style.transitionDelay || el.dataset.delay || 0) * 1000;
                setTimeout(() => { el.style.opacity = 1; el.classList.add(animationType);}, delay);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.passeio-section, .passeio-sidebar > .animate-on-scroll').forEach(el => {
        el.style.opacity = 0; elementObserverPasseio.observe(el);
    });
});