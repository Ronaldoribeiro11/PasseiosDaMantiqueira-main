document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM - KPIs
    const kpiAvgRatingElem = document.getElementById('kpiAvgRating');
    const kpiTotalReviewsElem = document.getElementById('kpiTotalReviews');
    const kpi5StarReviewsElem = document.getElementById('kpi5StarReviews');
    const kpiUnansweredReviewsElem = document.getElementById('kpiUnansweredReviews');
    const guideRatingBarsSummaryElem = document.getElementById('guideRatingBarsSummary');

    // Elementos do DOM - Filtros e Lista
    const filterPasseio = document.getElementById('filterGuideReviewPasseio');
    const filterRating = document.getElementById('filterGuideReviewRating');
    const filterDate = document.getElementById('filterGuideReviewDate'); // Para daterangepicker
    const reviewsListContainer = document.getElementById('guideReviewsListContainer');
    const emptyState = document.getElementById('emptyGuideReviewsState');
    const paginationContainer = document.querySelector('.guide-reviews-pagination');

    const auth = new Auth();
    const passeiosManager = new PasseiosManager();
    const currentUser = auth.getCurrentUser();

    let guideReviews = []; // Armazenará todas as avaliações dos passeios do guia
    let myPasseios = [];
    let currentPage = 1;
    const itemsPerPage = 5;

    // --- DADOS SIMULADOS ---
    // (Em um sistema real, estas viriam do backend ou do localStorage principal de avaliações)
    // Cada avaliação: id, userId (cliente), userName (cliente), userAvatar (cliente), passeioId, rating, title, text, date, guideResponse
    const allGlobalReviews = JSON.parse(localStorage.getItem('passeios_reviews_geral')) || [
        // { id: 'revG1', userId: 'client123', userName: 'Ana C.', userAvatar: '../assets/images/ImagemUsuario.jpg', passeioId: '1', rating: 5, title: 'Experiência Fantástica!', text: 'O Yohan é um guia excepcional...', date: '2025-05-28', guideResponse: null },
        // { id: 'revG2', userId: 'client456', userName: 'Bruno L.', userAvatar: '../assets/images/ImagemUsuario2.jpg', passeioId: '1', rating: 4, title: 'Muito bom!', text: 'Trilha ótima, um pouco cansativa mas valeu.', date: '2025-05-26', guideResponse: 'Obrigado Bruno! Que bom que gostou.' },
        // { id: 'revG3', userId: 'client789', userName: 'Clara M.', userAvatar: '../assets/images/ImagemUsuario3.jpg', passeioId: '3', rating: 5, title: 'Passeio de trem encantador!', text: 'Adoramos a viagem, paisagens lindas.', date: '2025-05-25', guideResponse: null }
    ];


    function formatDate(dateString) {
        if (!dateString) return 'Data não informada';
        return new Date(dateString + 'T00:00:00-03:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    function getPasseioTitleById(passeioId) {
        const passeio = myPasseios.find(p => p.id.toString() === passeioId.toString());
        return passeio ? passeio.title : 'Passeio Desconhecido';
    }

    function fetchAndPrepareData() {
        if (!currentUser) {
            console.error("Guia não logado.");
            displayReviews([]); return;
        }
        myPasseios = passeiosManager.getPasseiosByUser(currentUser.id);
        const myPasseioIds = myPasseios.map(p => p.id.toString());

        guideReviews = allGlobalReviews.filter(rev => myPasseioIds.includes(rev.passeioId.toString()));
        guideReviews.sort((a, b) => new Date(b.date) - new Date(a.date)); // Mais recentes primeiro

        updateReviewKPIs();
        renderRatingDistribution();
        populatePasseioFilter();
        renderReviews();
    }

    function updateReviewKPIs() {
        if (!kpiAvgRatingElem) return; // Se não estiver na página, não faz nada

        const totalReviewsCount = guideReviews.length;
        const sumRatings = guideReviews.reduce((sum, rev) => sum + rev.rating, 0);
        const avgRating = totalReviewsCount > 0 ? (sumRatings / totalReviewsCount).toFixed(1) : 'N/A';
        const fiveStarCount = guideReviews.filter(rev => rev.rating === 5).length;
        const unansweredCount = guideReviews.filter(rev => !rev.guideResponse).length;

        kpiAvgRatingElem.innerHTML = `${avgRating} <i class="fas fa-star"></i>`;
        kpiTotalReviewsElem.textContent = totalReviewsCount;
        kpi5StarReviewsElem.textContent = fiveStarCount;
        kpiUnansweredReviewsElem.textContent = unansweredCount;
    }

    function renderRatingDistribution() {
        if (!guideRatingBarsSummaryElem) return;
        guideRatingBarsSummaryElem.innerHTML = ''; // Limpa
        const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        guideReviews.forEach(rev => ratingCounts[rev.rating]++);

        const totalForPercent = guideReviews.length || 1; // Evita divisão por zero

        for (let i = 5; i >= 1; i--) {
            const count = ratingCounts[i];
            const percentage = (count / totalForPercent) * 100;
            const barItem = `
                <div class="rating-bar-item">
                    <span class="rating-bar-label">${i} estrela${i > 1 ? 's' : ''}</span>
                    <div class="bar-progress-wrapper">
                        <div class="bar-progress-fill stars-${i}" style="width: ${percentage.toFixed(1)}%;"></div>
                    </div>
                    <span class="rating-bar-count">${count}</span>
                </div>
            `;
            guideRatingBarsSummaryElem.innerHTML += barItem;
        }
    }
    
    function populatePasseioFilter() {
        if (!filterPasseio) return;
        filterPasseio.innerHTML = '<option value="all">Todos os Meus Passeios</option>';
        myPasseios.forEach(p => {
            filterPasseio.innerHTML += `<option value="${p.id}">${p.title}</option>`;
        });
    }


    function renderReviews() {
        if (!reviewsListContainer || !emptyState || !paginationContainer) return;
        let filteredReviews = [...guideReviews];

        // Aplicar filtros
        if (filterPasseio.value !== 'all') {
            filteredReviews = filteredReviews.filter(rev => rev.passeioId.toString() === filterPasseio.value);
        }
        if (filterRating.value !== 'all') {
            if (filterRating.value === 'unanswered') {
                filteredReviews = filteredReviews.filter(rev => !rev.guideResponse);
            } else {
                filteredReviews = filteredReviews.filter(rev => rev.rating === parseInt(filterRating.value));
            }
        }
        // TODO: Filtro de data (filterDate) se usar daterangepicker

        const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedReviews = filteredReviews.slice(startIndex, endIndex);

        reviewsListContainer.innerHTML = '';
        if (paginatedReviews.length === 0) {
            emptyState.style.display = 'flex';
            paginationContainer.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            paginatedReviews.forEach(review => reviewsListContainer.innerHTML += createReviewItemHTML(review));
            renderPagination(totalPages);
            paginationContainer.style.display = filteredReviews.length > itemsPerPage ? 'flex' : 'none';
        }
         // Re-aplicar estilo de estrelas após renderizar
        reviewsListContainer.querySelectorAll('.stars').forEach(starElement => {
            const rating = parseFloat(starElement.dataset.rating);
            starElement.style.setProperty('--rating', rating);
        });
    }

    function createReviewItemHTML(review) {
        const passeioTitle = getPasseioTitleById(review.passeioId);
        // Supondo que userAvatar e userName vêm com o objeto review
        const clientAvatar = review.userAvatar || '../assets/images/ImagemUsuarioPlaceholder.png'; 
        const clientName = review.userName || 'Cliente Anônimo';

        return `
            <div class="guide-review-item card-style animate-on-scroll" data-animation="fadeInUp" data-review-id="${review.id}">
                <div class="review-item-header">
                    <div class="review-item-passeio">
                        Passeio: <a href="../passeio.html?id=${review.passeioId}" class="link-highlight" target="_blank">${passeioTitle}</a>
                    </div>
                    <div class="review-item-meta">
                        <div class="stars" data-rating="${review.rating}" style="--rating: ${review.rating};" aria-label="Avaliação de ${review.rating} de 5 estrelas"></div>
                        <span class="review-date">por ${clientName} em ${formatDate(review.date)}</span>
                    </div>
                </div>
                <div class="review-item-client-info" style="display:flex; align-items:center; margin-bottom:var(--space-sm);">
                    <img src="${clientAvatar}" alt="${clientName}" style="width:30px; height:30px; border-radius:50%; margin-right:var(--space-xs);">
                    <span style="font-size:0.9em; font-weight:500;">${clientName}</span>
                </div>
                <div class="review-item-content">
                    ${review.title ? `<h4>${review.title}</h4>` : ''}
                    <p>${review.text}</p>
                </div>
                <div class="review-item-actions">
                    ${!review.guideResponse ? `<button class="btn btn-sm btn-primary btn-respond-review" data-review-id="${review.id}"><i class="fas fa-reply"></i> Responder</button>` : ''}
                    </div>
                <div class="review-response-area" id="response-area-${review.id}" style="display: none;">
                    <textarea class="form-control" rows="3" placeholder="Sua resposta..."></textarea>
                    <div style="margin-top:var(--space-xs); display:flex; justify-content:flex-end; gap:var(--space-xs);">
                        <button class="btn btn-sm btn-secondary btn-cancel-response" data-review-id="${review.id}">Cancelar</button>
                        <button class="btn btn-sm btn-success btn-submit-response" data-review-id="${review.id}">Enviar Resposta</button>
                    </div>
                </div>
                ${review.guideResponse ? `
                    <div class="guide-response-display">
                        <p><strong>Sua Resposta (${formatDate(review.guideResponseDate || new Date().toISOString().split('T')[0])}):</strong></p>
                        <p>${review.guideResponse}</p>
                    </div>` : ''
                }
            </div>
        `;
    }
    
    function renderPagination(totalPages) {
        // ... (Lógica de paginação similar à de guia-minhas-reservas.js) ...
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
         if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';
        // ... (código dos botões prev, numbers, next) ...
    }


    // --- Event Listeners ---
    if (filterPasseio) filterPasseio.addEventListener('change', () => { currentPage = 1; renderReviews(); });
    if (filterRating) filterRating.addEventListener('change', () => { currentPage = 1; renderReviews(); });
    // if (filterDate) { /* Listener para daterangepicker */ }

    if (reviewsListContainer) {
        reviewsListContainer.addEventListener('click', function(event) {
            const target = event.target;
            const reviewId = target.closest('[data-review-id]')?.dataset.reviewId;

            if (target.classList.contains('btn-respond-review') || target.closest('.btn-respond-review')) {
                const responseArea = document.getElementById(`response-area-${reviewId}`);
                if (responseArea) responseArea.style.display = 'block';
                target.closest('.btn-respond-review').style.display = 'none'; // Esconde o botão "Responder"
            }
            else if (target.classList.contains('btn-cancel-response') || target.closest('.btn-cancel-response')) {
                const responseArea = document.getElementById(`response-area-${reviewId}`);
                if (responseArea) {
                    responseArea.style.display = 'none';
                    responseArea.querySelector('textarea').value = '';
                }
                const respondButton = reviewsListContainer.querySelector(`.btn-respond-review[data-review-id="${reviewId}"]`);
                if(respondButton) respondButton.style.display = 'inline-flex'; // Mostra botão "Responder" de novo
            }
            else if (target.classList.contains('btn-submit-response') || target.closest('.btn-submit-response')) {
                const responseArea = document.getElementById(`response-area-${reviewId}`);
                const responseText = responseArea.querySelector('textarea').value.trim();
                if (responseText) {
                    // Simulação: Atualizar dados e re-renderizar
                    const reviewIndex = guideReviews.findIndex(r => r.id === reviewId);
                    if (reviewIndex > -1) {
                        guideReviews[reviewIndex].guideResponse = responseText;
                        guideReviews[reviewIndex].guideResponseDate = new Date().toISOString().split('T')[0];
                        
                        // Salvar no localStorage geral (simulado)
                        const globalReviewIndex = allGlobalReviews.findIndex(r => r.id === reviewId);
                        if(globalReviewIndex > -1) {
                            allGlobalReviews[globalReviewIndex].guideResponse = responseText;
                            allGlobalReviews[globalReviewIndex].guideResponseDate = new Date().toISOString().split('T')[0];
                            localStorage.setItem('passeios_reviews_geral', JSON.stringify(allGlobalReviews));
                        }
                        alert('Resposta enviada com sucesso! (Simulação)');
                        renderReviews(); // Re-renderiza a lista para mostrar a resposta
                        updateReviewKPIs(); // Atualiza KPI de não respondidas
                    }
                } else {
                    alert('Por favor, escreva uma resposta.');
                }
            }
        });
    }

    // --- Inicialização ---
    initializePage();

    function initializePage() {
        if (!currentUser) {
            alert("Acesso negado."); window.location.href = "../login.html"; return;
        }
         // Simular algumas avaliações se não houver no localStorage (apenas para teste)
        if (!localStorage.getItem('passeios_reviews_geral')) {
            const mockReviews = [
                { id: 'revG1', userId: 'client123', userName: 'Ana C.', userAvatar: '../assets/images/ImagemUsuario.jpg', passeioId: '1', rating: 5, title: 'Experiência Fantástica!', text: 'O Yohan é um guia excepcional, conhece tudo da região e tornou a trilha muito segura e divertida. As vistas são de tirar o fôlego. Recomendo 100%!', date: '2025-05-28', guideResponse: null },
                { id: 'revG2', userId: 'client456', userName: 'Bruno L.', userAvatar: '../assets/images/ImagemUsuario2.jpg', passeioId: '1', rating: 4, title: 'Muito bom!', text: 'Trilha ótima, um pouco cansativa mas valeu.', date: '2025-05-26', guideResponse: 'Obrigado Bruno! Que bom que gostou.' },
                { id: 'revG3', userId: 'client789', userName: 'Clara M.', userAvatar: '../assets/images/ImagemUsuario3.jpg', passeioId: '3', rating: 5, title: 'Passeio de trem encantador!', text: 'Adoramos a viagem, paisagens lindas.', date: '2025-05-25', guideResponse: null }
            ];
            localStorage.setItem('passeios_reviews_geral', JSON.stringify(mockReviews));
        }


        fetchAndPrepareData();
    }

    // Lógica do menu lateral do guia (já deve estar em guia-painel.js)
    // ...
});