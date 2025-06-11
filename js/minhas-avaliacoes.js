document.addEventListener('DOMContentLoaded', function() {
    const myReviewsListContainer = document.getElementById('myReviewsListContainer');
    const emptyMyReviewsState = document.getElementById('emptyMyReviewsState');
    const paginationContainer = document.querySelector('.my-reviews-pagination');

    const auth = new Auth(); // Para identificar o usuário logado
    const passeiosManager = new PasseiosManager(); // Para buscar nomes dos passeios

    // --- DADOS SIMULADOS DE AVALIAÇÕES DO USUÁRIO ---
    // No futuro, isso viria do localStorage (filtrado por userId) ou de uma API
    // Cada avaliação deve ter um id único, userId, passeioId, rating, titulo, texto, data
    let userReviews = [
        // Exemplo de estrutura de dados para uma avaliação
        // {
        //     id: 'rev1',
        //     userId: 'currentUser_id', // ID do usuário logado
        //     passeioId: '1', // ID do passeio (de passeios.js)
        //     rating: 5,
        //     title: 'Experiência Incrível!',
        //     text: 'Foi uma das melhores experiências da minha vida! O guia foi super atencioso...',
        //     date: '2025-05-28'
        // },
        // {
        //     id: 'rev2',
        //     userId: 'currentUser_id',
        //     passeioId: '2',
        //     rating: 4,
        //     title: 'Delicioso, mas um pouco corrido.',
        //     text: 'Os lugares visitados foram ótimos e a comida excelente. Achei apenas que o tempo...',
        //     date: '2025-05-15'
        // }
    ];

    let currentPage = 1;
    const reviewsPerPage = 5;


    function formatDate(dateString) {
        if (!dateString) return 'Data não informada';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        // Adicionar fuso para evitar problemas de data com conversão
        return new Date(dateString + 'T00:00:00-03:00').toLocaleDateString('pt-BR', options);
    }

    function renderReviewItem(review) {
        const passeio = passeiosManager.getPasseioById(review.passeioId.toString());
        const passeioNome = passeio ? passeio.title : 'Passeio Desconhecido';
        const passeioLink = passeio ? `passeio.html?id=${passeio.id}` : '#';

        return `
            <div class="my-review-item animate-on-scroll" data-animation="fadeInUp" data-review-id="${review.id}">
                <div class="my-review-header">
                    <div class="my-review-tour-info">
                        <h3><a href="${passeioLink}" class="link-highlight">${passeioNome}</a></h3>
                        <div class="stars" style="--rating: ${review.rating};" aria-label="Avaliação de ${review.rating} de 5 estrelas"></div>
                    </div>
                    <span class="my-review-date">Avaliado em: ${formatDate(review.date)}</span>
                </div>
                <div class="my-review-content">
                    ${review.title ? `<h4>${review.title}</h4>` : ''}
                    <p>${review.text}</p>
                </div>
                <div class="my-review-actions">
                    <button class="btn btn-sm btn-outline btn-edit-review" data-review-id="${review.id}"><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-sm btn-danger-outline btn-delete-review" data-review-id="${review.id}"><i class="fas fa-trash-alt"></i> Excluir</button>
                </div>
            </div>
        `;
    }

    function displayUserReviews(reviewsToDisplay) {
        if (!myReviewsListContainer || !emptyMyReviewsState) return;

        myReviewsListContainer.innerHTML = '';
        if (reviewsToDisplay.length === 0) {
            myReviewsListContainer.style.display = 'none';
            emptyMyReviewsState.style.display = 'flex';
             if(paginationContainer) paginationContainer.style.display = 'none';
        } else {
            myReviewsListContainer.style.display = 'block';
            emptyMyReviewsState.style.display = 'none';
            reviewsToDisplay.forEach(review => {
                myReviewsListContainer.innerHTML += renderReviewItem(review);
            });
             // Aplicar estilo de estrelas dinamicamente (se não for por variável CSS)
            myReviewsListContainer.querySelectorAll('.stars').forEach(starElement => {
                const rating = parseFloat(starElement.style.getPropertyValue('--rating'));
                // A lógica de preenchimento de estrelas é feita via CSS com a variável --rating
                // Se for um método JS, seria aqui:
                // starElement.innerHTML = getStarRatingHTML(rating);
            });
        }
    }
    
    function loadAndPaginateReviews() {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            // Usuário não logado, idealmente redirecionar ou mostrar mensagem
            displayUserReviews([]); // Mostra estado vazio
            console.warn("Usuário não logado, não é possível carregar 'Minhas Avaliações'.");
            return;
        }

        // Simulação: Carregar todas as avaliações e filtrar pelo ID do usuário logado
        // Em um sistema real, você buscaria apenas as avaliações deste usuário
        const allStoredReviews = JSON.parse(localStorage.getItem('passeios_reviews_geral')) || []; // Chave hipotética
        userReviews = allStoredReviews.filter(rev => rev.userId === currentUser.id);
        userReviews.sort((a,b) => new Date(b.date) - new Date(a.date)); // Mais recentes primeiro


        const totalPages = Math.ceil(userReviews.length / reviewsPerPage);
        const startIndex = (currentPage - 1) * reviewsPerPage;
        const endIndex = startIndex + reviewsPerPage;
        const paginatedReviews = userReviews.slice(startIndex, endIndex);

        displayUserReviews(paginatedReviews);
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';

        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.classList.add('btn', 'btn-secondary');
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadAndPaginateReviews();
            }
        });
        paginationContainer.appendChild(prevButton);

        const pageNumbersDiv = document.createElement('div');
        pageNumbersDiv.classList.add('page-numbers');
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) pageButton.classList.add('active');
            pageButton.addEventListener('click', () => {
                currentPage = i;
                loadAndPaginateReviews();
            });
            pageNumbersDiv.appendChild(pageButton);
        }
        paginationContainer.appendChild(pageNumbersDiv);

        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.classList.add('btn', 'btn-secondary');
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                loadAndPaginateReviews();
            }
        });
        paginationContainer.appendChild(nextButton);
    }

    // Delegação de Eventos para botões de editar/excluir
    if (myReviewsListContainer) {
        myReviewsListContainer.addEventListener('click', function(event) {
            const target = event.target;
            const editButton = target.closest('.btn-edit-review');
            const deleteButton = target.closest('.btn-delete-review');

            if (editButton) {
                const reviewId = editButton.dataset.reviewId;
                alert(`Simulação: Editar avaliação ID: ${reviewId}. (Implementar modal ou formulário de edição)`);
                // Lógica para abrir um modal/formulário de edição
            }

            if (deleteButton) {
                const reviewId = deleteButton.dataset.reviewId;
                if (confirm('Tem certeza que deseja excluir esta avaliação? Esta ação não pode ser desfeita.')) {
                    // Lógica para excluir a avaliação do localStorage (ou da API)
                    userReviews = userReviews.filter(rev => rev.id !== reviewId);
                    // Atualizar o 'passeios_reviews_geral' no localStorage
                    const allStoredReviews = JSON.parse(localStorage.getItem('passeios_reviews_geral')) || [];
                    const updatedAllReviews = allStoredReviews.filter(rev => rev.id !== reviewId);
                    localStorage.setItem('passeios_reviews_geral', JSON.stringify(updatedAllReviews));
                    
                    alert(`Avaliação ID: ${reviewId} excluída com sucesso! (Simulação)`);
                    loadAndPaginateReviews(); // Recarrega a lista
                }
            }
        });
    }


    // --- Inicialização ---
    if (myReviewsListContainer && emptyMyReviewsState) {
        loadAndPaginateReviews();
    }
    
    // Lógica do menu lateral global (se já não estiver em main.js)
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