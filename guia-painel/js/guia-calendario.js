document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const calendarGrid = document.getElementById('calendarGrid');
    const currentMonthYearDisplay = document.getElementById('currentMonthYearDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const viewTodayBtn = document.getElementById('viewTodayBtn');
    const blockDateBtn = document.getElementById('blockDateBtn'); // Para futura implementação

    // Modal Elements
    const calendarDayModal = document.getElementById('calendarDayModal');
    const modalDayTitle = document.getElementById('modalDayTitle');
    const modalDayEventsContainer = document.getElementById('modalDayEvents');
    const blockDateForm = document.getElementById('blockDateForm');
    const closeModalBtns = calendarDayModal ? calendarDayModal.querySelectorAll('.close-modal-btn') : [];


    // Estado do Calendário
    let currentDate = new Date(); // Começa com o mês atual

    // Instâncias (assumindo que auth.js e passeios.js foram carregados)
    const auth = new Auth();
    const passeiosManager = new PasseiosManager();
    const currentUser = auth.getCurrentUser();

    // --- DADOS SIMULADOS DE RESERVAS E BLOQUEIOS DO GUIA ---
    // No futuro, viria da API ou do localStorage (filtrado pelo guia)
    let guideBookings = []; // Array de objetos de reserva
    let guideBlockedDates = []; // Array de objetos de bloqueio { date: 'YYYY-MM-DD', reason: 'Motivo' }

    function fetchGuideCalendarData() {
        if (!currentUser) return;
        
        // Simulação: Carregar TODAS as reservas e filtrar pelos passeios do guia.
        const allStoredBookings = JSON.parse(localStorage.getItem('passeios_reservas_geral')) || [];
        const myPasseioIds = passeiosManager.getPasseiosByUser(currentUser.id).map(p => p.id.toString());
        guideBookings = allStoredBookings.filter(b => 
            myPasseioIds.includes(b.passeioId.toString()) && 
            (b.status === 'confirmed' || b.status === 'pending') // Apenas confirmadas ou pendentes no calendário
        );

        // Simular algumas datas bloqueadas
        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);
        guideBlockedDates = [
            { date: tomorrow.toISOString().split('T')[0], reason: 'Manutenção de Equipamentos' },
            { date: nextWeek.toISOString().split('T')[0], reason: 'Férias Curtas' }
        ];
    }


    function renderCalendar(year, month) { // month é 0-indexed
        if (!calendarGrid || !currentMonthYearDisplay) return;
        calendarGrid.innerHTML = '';
        currentDate = new Date(year, month, 1); // Define a data atual do calendário
        
        currentMonthYearDisplay.textContent = currentDate.toLocaleDateString('pt-BR', {
            month: 'long', year: 'numeric'
        }).replace(/^\w/, c => c.toUpperCase()); // Capitaliza o mês

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Dom) - 6 (Sáb)
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        today.setHours(0,0,0,0);


        // Células vazias para dias do mês anterior
        for (let i = 0; i < firstDayOfMonth; i++) {
            calendarGrid.innerHTML += `<div class="calendar-day other-month"></div>`;
        }

        // Dias do mês atual
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            const dayDate = new Date(year, month, day);
            dayDate.setHours(0,0,0,0);
            const dayDateStr = dayDate.toISOString().split('T')[0];

            dayCell.innerHTML = `<span class="day-number">${day}</span><div class="day-events"></div>`;
            if (dayDate.getTime() === today.getTime()) {
                dayCell.classList.add('today');
            }
            
            // Adicionar eventos ao dia
            const dayEventsContainer = dayCell.querySelector('.day-events');
            let eventCount = 0;

            // Eventos de Reserva
            guideBookings.filter(b => b.dataPasseio === dayDateStr).forEach(booking => {
                const passeio = passeiosManager.getPasseioById(booking.passeioId.toString());
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('day-event', 'event-booked-tour');
                eventDiv.textContent = passeio ? passeio.title.substring(0,15) + (passeio.title.length > 15 ? '...' : '') : 'Reserva';
                eventDiv.title = `${passeio ? passeio.title : 'Reserva'} - ${booking.participantes}pax`;
                dayEventsContainer.appendChild(eventDiv);
                eventCount++;
            });

            // Eventos de Bloqueio
            guideBlockedDates.filter(b => b.date === dayDateStr).forEach(blocked => {
                const eventDiv = document.createElement('div');
                eventDiv.classList.add('day-event', 'event-blocked-date');
                eventDiv.textContent = blocked.reason ? blocked.reason.substring(0,15) + (blocked.reason.length > 15 ? '...' : '') : 'Bloqueado';
                eventDiv.title = blocked.reason || 'Data Bloqueada';
                dayEventsContainer.appendChild(eventDiv);
                eventCount++;
            });
            
            // Se múltiplos eventos, pode adicionar uma classe para estilo diferente (não implementado no CSS ainda)
            if (eventCount > 2) { // Exemplo: mais de 2 eventos
                // dayCell.classList.add('multiple-events-day'); 
                // Ou mudar a cor do último evento para indicar "mais..."
            }

            dayCell.dataset.date = dayDateStr; // Armazena a data na célula
            dayCell.addEventListener('click', () => openDayDetailsModal(dayDateStr));
            calendarGrid.appendChild(dayCell);
        }
    }
    
    function openDayDetailsModal(dateStr) {
        if (!calendarDayModal || !modalDayTitle || !modalDayEventsContainer) return;
        
        modalDayTitle.textContent = `Detalhes para: ${formatDate(dateStr)}`;
        modalDayEventsContainer.innerHTML = ''; // Limpa eventos anteriores

        let hasEvents = false;
        // Listar reservas
        guideBookings.filter(b => b.dataPasseio === dateStr).forEach(booking => {
            const passeio = passeiosManager.getPasseioById(booking.passeioId.toString());
            modalDayEventsContainer.innerHTML += `
                <div class="event-list-item">
                    <span class="event-type-badge booked">RESERVA</span>
                    <span class="event-title">${passeio ? passeio.title : 'Passeio'}</span>
                    <span class="event-participants"><i class="fas fa-users"></i> ${booking.participantes} participante(s)</span>
                    <span class="event-client">Cliente: ${booking.clientName || 'N/A'}</span>
                </div>
            `;
            hasEvents = true;
        });
        // Listar bloqueios
        guideBlockedDates.filter(b => b.date === dateStr).forEach(blocked => {
            modalDayEventsContainer.innerHTML += `
                <div class="event-list-item">
                    <span class="event-type-badge blocked">BLOQUEIO</span>
                    <span class="event-title">${blocked.reason || 'Data Bloqueada'}</span>
                </div>
            `;
            hasEvents = true;
        });

        if (!hasEvents) {
            modalDayEventsContainer.innerHTML = '<p>Nenhum evento ou reserva para este dia.</p>';
        }
        
        // Passar a data para o formulário de bloqueio
        if (blockDateForm) blockDateForm.dataset.dateToBlock = dateStr;

        calendarDayModal.classList.add('active');
    }

    if (closeModalBtns) {
        closeModalBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (calendarDayModal) calendarDayModal.classList.remove('active');
            });
        });
    }
    if (calendarDayModal) {
        calendarDayModal.addEventListener('click', function(event) {
            if (event.target === calendarDayModal) {
                calendarDayModal.classList.remove('active');
            }
        });
    }

    if (blockDateForm) {
        blockDateForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const dateToBlock = this.dataset.dateToBlock;
            const reason = document.getElementById('blockReason').value.trim();
            
            // Adicionar à lista de bloqueios (simulado)
            // Verificar se já existe um bloqueio para essa data
            if (!guideBlockedDates.some(b => b.date === dateToBlock)) {
                 guideBlockedDates.push({ date: dateToBlock, reason: reason });
                 console.log("Data bloqueada:", dateToBlock, "Motivo:", reason);
                 // Salvar no localStorage (simulado)
                 // localStorage.setItem('guide_blocked_dates', JSON.stringify(guideBlockedDates));
                 renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Re-renderiza o calendário
            } else {
                alert("Esta data já está bloqueada ou tem um evento de bloqueio similar.");
            }
            
            if (calendarDayModal) calendarDayModal.classList.remove('active');
            this.reset();
        });
    }


    // --- Navegação e Inicialização do Calendário ---
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }
    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }
    if (viewTodayBtn) {
        viewTodayBtn.addEventListener('click', () => {
            currentDate = new Date(); // Volta para o mês atual
            renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
        });
    }
    if (blockDateBtn) { // Botão principal para bloquear data/período
        blockDateBtn.addEventListener('click', () => {
            alert("Funcionalidade de bloquear período (múltiplos dias) ainda não implementada. Clique em um dia específico para bloqueá-lo individualmente.");
            // Aqui poderia abrir um modal diferente para selecionar um intervalo de datas.
        });
    }


    // --- Inicialização ---
    function initializeCalendarPage() {
        if (!currentUser) {
            alert("Acesso negado. Faça login como guia verificado.");
            window.location.href = "../login.html";
            return;
        }
        fetchGuideCalendarData(); // Carrega dados simulados de reservas e bloqueios
        renderCalendar(currentDate.getFullYear(), currentDate.getMonth()); // Renderiza o mês atual
    }

    initializeCalendarPage();

    // Lógica do menu lateral do guia (já deve estar em guia-painel.js)
    // ...
});