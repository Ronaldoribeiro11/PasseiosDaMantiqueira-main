document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const guideBookingsTableBody = document.getElementById('guideBookingsTableBody');
    const guideBookingsCount = document.getElementById('guideBookingsCount');
    const emptyGuideBookingsStateTable = document.getElementById('emptyGuideBookingsStateTable');
    const paginationContainer = document.querySelector('.guide-bookings-pagination');
    
    const filterPasseio = document.getElementById('filterGuideBookingPasseio');
    const filterStatus = document.getElementById('filterGuideBookingStatus');
    const filterDateRange = document.getElementById('filterGuideBookingDateRange'); // Precisa da lib daterangepicker
    const clearFiltersBtn = document.getElementById('clearGuideBookingFilters');
    const exportBtn = document.getElementById('exportGuideBookings');

    // KPIs
    const kpiBookingsTodayElem = document.getElementById('kpiBookingsToday');
    const kpiBookingsNext7DaysElem = document.getElementById('kpiBookingsNext7Days');
    const kpiBookingsPendingElem = document.getElementById('kpiBookingsPending');
    const kpiParticipantsNext7DaysElem = document.getElementById('kpiParticipantsNext7Days');

    // Modal
    const bookingDetailsModal = document.getElementById('bookingDetailsModal');
    const modalBookingTitle = document.getElementById('modalBookingTitle');
    const modalBookingCode = document.getElementById('modalBookingCode');
    const modalBookingDetailsContent = document.getElementById('modalBookingDetailsContent');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');


    // Instâncias
    const auth = new Auth();
    const passeiosManager = new PasseiosManager();
    const currentUser = auth.getCurrentUser();

    let allMyBookings = []; // Armazenará todas as reservas dos passeios do guia
    let myPasseios = []; // Armazenará os passeios criados pelo guia
    let currentPage = 1;
    const itemsPerPage = 10;

    // --- Inicialização do Date Range Picker (Opcional, requer jQuery e Moment.js também) ---
    /*
    if (filterDateRange && typeof $(filterDateRange).daterangepicker === 'function') {
        $(filterDateRange).daterangepicker({
            autoUpdateInput: false,
            locale: { cancelLabel: 'Limpar', applyLabel: 'Aplicar', format: 'DD/MM/YYYY' }
        });
        $(filterDateRange).on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            currentPage = 1; loadAndRenderBookings();
        });
        $(filterDateRange).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
            currentPage = 1; loadAndRenderBookings();
        });
    } else {
        console.warn("DateRangePicker não está carregado ou o elemento não foi encontrado.");
    }
    */


    function fetchAndPrepareData() {
        if (!currentUser) {
            console.error("Guia não logado.");
            displayBookings([]); // Mostra estado vazio
            return;
        }
        myPasseios = passeiosManager.getPasseiosByUser(currentUser.id);
        
        // Popular filtro de passeios
        if (filterPasseio) {
            filterPasseio.innerHTML = '<option value="all">Todos os Meus Passeios</option>'; // Reset
            myPasseios.forEach(p => {
                filterPasseio.innerHTML += `<option value="${p.id}">${p.title}</option>`;
            });
        }
        
        // Simulação: Carregar TODAS as reservas e filtrar pelos passeios do guia.
        // Em um sistema real, a API traria apenas as reservas dos passeios deste guia.
        const allStoredBookings = JSON.parse(localStorage.getItem('passeios_reservas_geral')) || [];
        const myPasseioIds = myPasseios.map(p => p.id.toString());
        
        allMyBookings = allStoredBookings.filter(b => myPasseioIds.includes(b.passeioId.toString()));
        
        // Adicionar dados de cliente simulados (em um sistema real, viriam com a reserva)
        const sampleClients = ["Ana Silva", "Carlos Mendes", "Julia Lima", "Rafael Souza", "Beatriz Costa"];
        allMyBookings.forEach((booking, index) => {
            booking.clientName = booking.clientName || sampleClients[index % sampleClients.length];
            booking.clientEmail = booking.clientEmail || `${sampleClients[index % sampleClients.length].toLowerCase().replace(' ','_')}@email.com`;
            booking.clientPhone = booking.clientPhone || `(12) 98877-${String(1000 + index).padStart(4,'0')}`;
            // Simular valor a receber pelo guia (Passeio.preco * participantes * (1 - comissao_plataforma))
            const passeioOriginal = passeiosManager.getPasseioById(booking.passeioId.toString());
            if (passeioOriginal) {
                 booking.valorRecebidoGuia = (parseFloat(passeioOriginal.price) * booking.participantes * 0.85).toFixed(2); // 15% comissão
            } else {
                booking.valorRecebidoGuia = (booking.valorTotal * 0.85).toFixed(2); // Fallback
            }
        });

        allMyBookings.sort((a,b) => new Date(b.dataPasseio) - new Date(a.dataPasseio)); // Mais recentes primeiro
        
        updateKPIs();
        renderBookings();
    }

    function updateKPIs() {
        const hojeStr = new Date().toISOString().split('T')[0];
        const prox7Dias = new Date();
        prox7Dias.setDate(prox7Dias.getDate() + 7);
        const prox7DiasStr = prox7Dias.toISOString().split('T')[0];

        let countToday = 0;
        let countNext7Days = 0;
        let countPending = 0;
        let participantsNext7Days = 0;

        allMyBookings.forEach(b => {
            if (b.status === 'pending') countPending++;
            if (b.status === 'confirmed' || b.status === 'pending') { // Considerar pendentes como futuras também
                if (b.dataPasseio === hojeStr) countToday++;
                if (b.dataPasseio >= hojeStr && b.dataPasseio <= prox7DiasStr) {
                    countNext7Days++;
                    participantsNext7Days += parseInt(b.participantes);
                }
            }
        });
        if (kpiBookingsTodayElem) kpiBookingsTodayElem.textContent = countToday;
        if (kpiBookingsNext7DaysElem) kpiBookingsNext7DaysElem.textContent = countNext7Days;
        if (kpiBookingsPendingElem) kpiBookingsPendingElem.textContent = countPending;
        if (kpiParticipantsNext7DaysElem) kpiParticipantsNext7DaysElem.textContent = participantsNext7Days;
    }


    function renderBookings() {
        if (!guideBookingsTableBody || !guideBookingsCount || !emptyGuideBookingsStateTable || !paginationContainer) return;

        let filteredBookings = [...allMyBookings];

        // Aplicar filtros
        if (filterPasseio.value !== 'all') {
            filteredBookings = filteredBookings.filter(b => b.passeioId.toString() === filterPasseio.value);
        }
        if (filterStatus.value !== 'all') {
            filteredBookings = filteredBookings.filter(b => b.status === filterStatus.value);
        }
        // Filtro de Date Range (simples, se não usar a lib)
        // if (filterDateRange.value) { /* ... lógica de filtro de data ... */ }


        guideBookingsCount.textContent = `${filteredBookings.length} reservas encontradas`;

        const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

        guideBookingsTableBody.innerHTML = '';
        if (paginatedBookings.length === 0) {
            emptyGuideBookingsStateTable.style.display = 'flex';
            paginationContainer.style.display = 'none';
        } else {
            emptyGuideBookingsStateTable.style.display = 'none';
            paginatedBookings.forEach(booking => {
                guideBookingsTableBody.innerHTML += createBookingTableRow(booking);
            });
            renderPagination(totalPages);
            paginationContainer.style.display = filteredBookings.length > itemsPerPage ? 'flex' : 'none';
        }
    }

    function createBookingTableRow(booking) {
        const passeio = myPasseios.find(p => p.id.toString() === booking.passeioId.toString());
        const statusText = {
            confirmed: 'Confirmada', pending: 'Pendente', completed: 'Concluída',
            cancelled_user: 'Cancelada (Cliente)', cancelled_guide: 'Cancelada (Guia)', no_show: 'Não Compareceu'
        };
        const statusClass = {
            confirmed: 'badge-status-confirmed', pending: 'badge-status-pending', completed: 'badge-status-completed',
            cancelled_user: 'badge-status-cancelled_user', cancelled_guide: 'badge-status-cancelled_guide', no_show: 'badge-status-no_show'
        };
        
        let actionsHTML = `<button class="btn-icon btn-view-booking-details" data-booking-id="${booking.id}" title="Ver Detalhes"><i class="fas fa-eye"></i></button>`;
        if (booking.status === 'confirmed' || booking.status === 'pending') {
            actionsHTML += `<button class="btn-icon btn-guide-cancel-booking" data-booking-id="${booking.id}" title="Cancelar Reserva"><i class="fas fa-calendar-times text-danger"></i></button>`;
        }
        if (booking.status === 'confirmed') {
             actionsHTML += `<button class="btn-icon btn-mark-noshow" data-booking-id="${booking.id}" title="Marcar Não Compareceu"><i class="fas fa-user-slash"></i></button>`;
        }
         if (booking.status !== 'cancelled_user' && booking.status !== 'cancelled_guide') {
            actionsHTML += `<button class="btn-icon btn-message-client" data-client-id="${booking.userId}" title="Contatar Cliente"><i class="fas fa-comment-dots"></i></button>`;
        }


        return `
            <tr>
                <td><a href="#" class="link-highlight btn-view-booking-details" data-booking-id="${booking.id}">${booking.codigoReserva}</a></td>
                <td>${formatDate(booking.dataPasseio)}</td>
                <td>${passeio ? passeio.title : 'Passeio Desconhecido'}</td>
                <td class="client-name-cell">${booking.clientName || 'N/A'}</td>
                <td>${booking.participantes}</td>
                <td class="booking-value-cell">R$ ${booking.valorRecebidoGuia || 'N/A'}</td>
                <td><span class="badge ${statusClass[booking.status] || ''}">${statusText[booking.status] || booking.status}</span></td>
                <td class="actions-cell">${actionsHTML}</td>
            </tr>
        `;
    }
    
    function renderPagination(totalPages) {
        // ... (Lógica de paginação similar à de guia-meus-passeios.js) ...
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
         if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';

        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.classList.add('btn', 'btn-outline', 'btn-sm');
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderBookings(); } });
        paginationContainer.appendChild(prevButton);

        const pageNumbersDiv = document.createElement('div');
        pageNumbersDiv.classList.add('page-numbers');
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('btn', 'btn-sm');
            if (i === currentPage) { pageButton.classList.add('btn-primary'); } 
            else { pageButton.classList.add('btn-outline'); }
            pageButton.addEventListener('click', () => { currentPage = i; renderBookings(); });
            pageNumbersDiv.appendChild(pageButton);
        }
        paginationContainer.appendChild(pageNumbersDiv);

        const nextButton = document.createElement('button');
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.classList.add('btn', 'btn-outline', 'btn-sm');
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderBookings(); } });
        paginationContainer.appendChild(nextButton);
    }


    // --- Event Listeners ---
    if (filterPasseio) filterPasseio.addEventListener('change', () => { currentPage = 1; renderBookings(); });
    if (filterStatus) filterStatus.addEventListener('change', () => { currentPage = 1; renderBookings(); });
    // if (filterDateRange) { /* Listener para quando o daterangepicker for aplicado */ }
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            filterPasseio.value = 'all';
            filterStatus.value = 'all';
            if (filterDateRange) filterDateRange.value = '';
            // if (typeof $(filterDateRange).data('daterangepicker') !== 'undefined') { // Se usar a lib
            //    $(filterDateRange).data('daterangepicker').setStartDate(moment());
            //    $(filterDateRange).data('daterangepicker').setEndDate(moment());
            //    $(filterDateRange).val('');
            // }
            currentPage = 1; renderBookings();
        });
    }
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            alert("Simulação: Exportar dados para CSV. (Implementar a lógica de conversão e download)");
        });
    }

    // Delegação de eventos para ações na tabela
    if (guideBookingsTableBody) {
        guideBookingsTableBody.addEventListener('click', function(event) {
            const target = event.target;
            const bookingId = target.closest('button, a[data-booking-id]')?.dataset.bookingId;
            if (!bookingId) return;
            
            const booking = allMyBookings.find(b => b.id === bookingId || b.codigoReserva === bookingId); // Acha por ID ou código

            if (target.closest('.btn-view-booking-details')) {
                openBookingDetailsModal(booking);
            } else if (target.closest('.btn-guide-cancel-booking')) {
                if (confirm(`Tem certeza que deseja cancelar a reserva ${booking.codigoReserva}? O cliente será notificado.`)) {
                    // Lógica para cancelar (simulada)
                    booking.status = 'cancelled_guide';
                    // Atualizar no localStorage geral de reservas
                    // ...
                    alert(`Reserva ${booking.codigoReserva} cancelada pelo guia. (Simulação)`);
                    updateKPIs(); renderBookings();
                }
            } else if (target.closest('.btn-mark-noshow')) {
                 if (confirm(`Confirmar não comparecimento para a reserva ${booking.codigoReserva}?`)) {
                    booking.status = 'no_show';
                    alert(`Reserva ${booking.codigoReserva} marcada como Não Compareceu. (Simulação)`);
                    updateKPIs(); renderBookings();
                 }
            } else if (target.closest('.btn-message-client')) {
                 alert(`Simulação: Iniciar conversa com cliente da reserva ${booking.codigoReserva}. (Redirecionar para página/modal de mensagens)`);
            }
        });
    }
    
    // Funções do Modal
    function openBookingDetailsModal(booking) {
        if (!bookingDetailsModal || !booking) return;
        const passeio = myPasseios.find(p => p.id.toString() === booking.passeioId.toString());

        if(modalBookingCode) modalBookingCode.textContent = booking.codigoReserva;
        if(modalBookingTitle && passeio) modalBookingTitle.textContent = `Detalhes da Reserva #${booking.codigoReserva} - ${passeio.title}`;
        
        if(modalBookingDetailsContent) {
            modalBookingDetailsContent.innerHTML = `
                <div class="detail-item"><strong>Passeio:</strong> ${passeio ? passeio.title : 'N/A'}</div>
                <div class="detail-item"><strong>Data do Passeio:</strong> ${formatDate(booking.dataPasseio)}</div>
                <div class="detail-item"><strong>Cliente:</strong> ${booking.clientName || 'N/A'}</div>
                <div class="detail-item"><strong>E-mail Cliente:</strong> ${booking.clientEmail || 'N/A'}</div>
                <div class="detail-item"><strong>Telefone Cliente:</strong> ${booking.clientPhone || 'N/A'}</div>
                <div class="detail-item"><strong>Participantes:</strong> ${booking.participantes}</div>
                <div class="detail-item"><strong>Valor Total Reserva:</strong> R$ ${parseFloat(booking.valorTotal).toFixed(2)}</div>
                <div class="detail-item"><strong>Valor a Receber (Est.):</strong> R$ ${booking.valorRecebidoGuia}</div>
                <div class="detail-item"><strong>Status:</strong> <span class="badge ${getStatusBadgeClass(booking.status)}">${getStatusText(booking.status)}</span></div>
                <div class="detail-item"><strong>Reservado em:</strong> ${booking.dataReserva ? formatDate(booking.dataReserva) : 'N/A'}</div>
                ${booking.observacoesCliente ? `<div class="detail-item"><strong>Observações do Cliente:</strong> ${booking.observacoesCliente}</div>` : ''}
            `;
        }
        bookingDetailsModal.classList.add('active');
    }

    if (closeModalBtns) {
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if(bookingDetailsModal) bookingDetailsModal.classList.remove('active');
            });
        });
    }
    // Fechar modal clicando fora
    if (bookingDetailsModal) {
        bookingDetailsModal.addEventListener('click', function(event) {
            if (event.target === bookingDetailsModal) { // Clicou no fundo do modal
                bookingDetailsModal.classList.remove('active');
            }
        });
    }


    // --- Inicialização ---
    fetchAndPrepareData();

    // Lógica do menu lateral do guia (já deve estar em guia-painel.js)
    // ...
});