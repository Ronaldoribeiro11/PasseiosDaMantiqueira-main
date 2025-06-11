document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const myToursTableBody = document.getElementById('myToursTableBody');
    const myToursCount = document.getElementById('myToursCount');
    const emptyMyToursStateTable = document.getElementById('emptyMyToursStateTable');
    const paginationContainer = document.querySelector('.guide-tours-pagination');
    
    const searchInput = document.getElementById('searchMyToursInput');
    const statusFilter = document.getElementById('filterMyToursStatus');
    const categoryFilter = document.getElementById('filterMyToursCategory');

    // Instâncias de classes (assumindo que auth.js e passeios.js foram carregados)
    const auth = new Auth();
    const passeiosManager = new PasseiosManager();
    const currentUser = auth.getCurrentUser();

    let allMyTours = []; // Armazenará os passeios do guia logado
    let currentPage = 1;
    const itemsPerPage = 10; // Quantidade de itens por página

    function fetchMyTours() {
        if (!currentUser) {
            console.error("Usuário não logado. Não é possível carregar 'Meus Passeios'.");
            allMyTours = [];
            renderMyTours(); // Mostra estado vazio
            return;
        }
        // Em um sistema real, aqui seria uma chamada de API para buscar passeios do guia
        // Por enquanto, usamos a função de passeios.js
        allMyTours = passeiosManager.getPasseiosByUser(currentUser.id); // Retorna array de objetos de passeio
        // Adicionar um status simulado a cada passeio para teste (ativo, inativo, rascunho)
        allMyTours.forEach((tour, index) => {
            const statuses = ['active', 'inactive', 'draft', 'pending']; // pending = pendente de aprovação do admin
            tour.status = tour.status || statuses[index % statuses.length]; // Simula um status
            tour.reservasProximas = Math.floor(Math.random() * 20); // Simula reservas
        });
        allMyTours.sort((a,b) => (b.id) - (a.id)); // Ordena por ID (simulando mais recentes)
        
        renderMyTours();
    }

    function renderMyTours() {
        if (!myToursTableBody || !myToursCount || !emptyMyToursStateTable || !paginationContainer) return;

        let filteredTours = [...allMyTours];

        // Aplicar filtros
        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            filteredTours = filteredTours.filter(tour => tour.title.toLowerCase().includes(searchTerm));
        }
        if (statusFilter.value !== 'all') {
            filteredTours = filteredTours.filter(tour => tour.status === statusFilter.value);
        }
        if (categoryFilter.value !== 'all') {
            filteredTours = filteredTours.filter(tour => tour.category === categoryFilter.value);
        }

        myToursCount.textContent = `${filteredTours.length} passeios encontrados`;

        // Paginação
        const totalPages = Math.ceil(filteredTours.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedTours = filteredTours.slice(startIndex, endIndex);

        myToursTableBody.innerHTML = ''; // Limpa a tabela

        if (paginatedTours.length === 0) {
            emptyMyToursStateTable.style.display = 'flex'; // Usar flex se o CSS do empty-state for flex
            paginationContainer.style.display = 'none';
        } else {
            emptyMyToursStateTable.style.display = 'none';
            paginatedTours.forEach(tour => {
                myToursTableBody.innerHTML += createTourTableRow(tour);
            });
            renderPagination(totalPages);
            paginationContainer.style.display = filteredTours.length > itemsPerPage ? 'flex' : 'none';
        }
        
        // Reanexar listeners para botões de ação (se não usar delegação)
        // Ou usar delegação de eventos no tbody (melhor)
    }

    function createTourTableRow(tour) {
        const statusText = {
            active: 'Ativo', inactive: 'Inativo', draft: 'Rascunho', pending: 'Pendente'
        };
        const statusClass = {
            active: 'badge-status-active', inactive: 'badge-status-inactive', 
            draft: 'badge-status-draft', pending: 'badge-status-pending'
        };

        const toggleIconClass = (tour.status === 'active' || tour.status === 'pending') ? 'fa-toggle-on' : 'fa-toggle-off';
        const toggleTitle = (tour.status === 'active' || tour.status === 'pending') ? 'Desativar' : 'Ativar';

        return `
            <tr>
                <td><img src="../assets/images/${tour.mainImage}" alt="${tour.title}" class="table-thumbnail"></td>
                <td><a href="../criar-passeio.html?edit=${tour.id}" class="link-highlight">${tour.title}</a></td>
                <td>${tour.category.charAt(0).toUpperCase() + tour.category.slice(1)}</td>
                <td>R$ ${parseFloat(tour.price).toFixed(2)}</td>
                <td><span class="badge ${statusClass[tour.status] || 'badge-status-inactive'}">${statusText[tour.status] || 'Desconhecido'}</span></td>
                <td>${tour.rating || 'N/A'} <i class="fas fa-star text-warning"></i></td>
                <td>${tour.reservasProximas || 0}</td>
                <td class="actions-cell">
                    <a href="../passeio.html?id=${tour.id}" target="_blank" class="btn-icon" title="Ver no Site"><i class="fas fa-eye"></i></a>
                    <a href="../criar-passeio.html?edit=${tour.id}" class="btn-icon" title="Editar"><i class="fas fa-edit"></i></a>
                    <button class="btn-icon btn-toggle-status" data-tour-id="${tour.id}" data-current-status="${tour.status}" title="${toggleTitle}"><i class="fas ${toggleIconClass}"></i></button>
                    <button class="btn-icon btn-delete-tour" data-tour-id="${tour.id}" title="Excluir"><i class="fas fa-trash text-danger"></i></button>
                </td>
            </tr>
        `;
    }

    function renderPagination(totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = ''; // Limpa paginação anterior
         if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';

        // Botão Anterior (reutiliza de scripts anteriores)
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.classList.add('btn', 'btn-outline', 'btn-sm'); // Usar btn-sm para consistência
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderMyTours(); } });
        paginationContainer.appendChild(prevButton);

        const pageNumbersDiv = document.createElement('div');
        pageNumbersDiv.classList.add('page-numbers');
        // Lógica simplificada de números de página (pode ser melhorada para muitos itens)
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('btn', 'btn-sm');
            if (i === currentPage) {
                pageButton.classList.add('btn-primary'); // Ou 'active' se tiver estilo para isso
            } else {
                pageButton.classList.add('btn-outline');
            }
            pageButton.addEventListener('click', () => { currentPage = i; renderMyTours(); });
            pageNumbersDiv.appendChild(pageButton);
        }
        paginationContainer.appendChild(pageNumbersDiv);

        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.classList.add('btn', 'btn-outline', 'btn-sm');
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderMyTours(); } });
        paginationContainer.appendChild(nextButton);
    }

    // --- Event Listeners para Filtros e Ações ---
    if (searchInput) searchInput.addEventListener('input', () => { currentPage = 1; renderMyTours(); });
    if (statusFilter) statusFilter.addEventListener('change', () => { currentPage = 1; renderMyTours(); });
    if (categoryFilter) categoryFilter.addEventListener('change', () => { currentPage = 1; renderMyTours(); });

    // Delegação de eventos para botões de ação na tabela
    if (myToursTableBody) {
        myToursTableBody.addEventListener('click', function(event) {
            const target = event.target;
            const tourId = target.closest('button') ? target.closest('button').dataset.tourId : null;
            if (!tourId) return;

            if (target.closest('.btn-toggle-status')) {
                // Simular toggle de status
                const tour = allMyTours.find(t => t.id.toString() === tourId);
                if (tour) {
                    if (tour.status === 'active') tour.status = 'inactive';
                    else if (tour.status === 'inactive') tour.status = 'active';
                    else if (tour.status === 'draft') tour.status = 'pending'; // Ex: Rascunho -> Pendente
                    else if (tour.status === 'pending') tour.status = 'draft'; // Ex: Pendente -> Rascunho
                    
                    passeiosManager.updatePasseio(tourId, { status: tour.status }); // Atualiza no "banco" local
                    renderMyTours(); // Re-renderiza
                    alert(`Status do passeio ${tour.title} alterado para ${tour.status}. (Simulação)`);
                }
            } else if (target.closest('.btn-delete-tour')) {
                const tour = allMyTours.find(t => t.id.toString() === tourId);
                if (tour && confirm(`Tem certeza que deseja excluir o passeio "${tour.title}"? Esta ação não pode ser desfeita.`)) {
                    passeiosManager.removePasseio(tourId); // Remove do "banco" local
                    fetchMyTours(); // Recarrega tudo do "banco" e re-renderiza
                    alert(`Passeio "${tour.title}" excluído. (Simulação)`);
                }
            }
        });
    }

    // --- Inicialização ---
    fetchMyTours(); // Carrega e renderiza os passeios iniciais

    // Lógica do menu lateral do guia (já deve estar em guia-painel.js, mas para garantir)
    const guideMenuToggle = document.getElementById('guideMenuToggle');
    const guideSidebar = document.getElementById('guideSidebar');
    const guidePanelBody = document.querySelector('.guide-panel-body');

    if (guideMenuToggle && guideSidebar && guidePanelBody) {
        guideMenuToggle.addEventListener('click', function() {
            // guideSidebar.classList.toggle('open'); // Para mobile
            guideSidebar.classList.toggle('collapsed'); // Para desktop
            guidePanelBody.classList.toggle('sidebar-collapsed');
        });
    }
});