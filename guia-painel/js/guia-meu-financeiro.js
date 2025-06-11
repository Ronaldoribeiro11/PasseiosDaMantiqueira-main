document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM - KPIs
    const kpiSaldoReceberElem = document.getElementById('kpiSaldoReceber');
    const kpiTotalMesElem = document.getElementById('kpiTotalMes');
    const kpiMesReferenciaElem = document.getElementById('kpiMesReferencia');
    const kpiTotalAnoElem = document.getElementById('kpiTotalAno');
    const kpiAnoReferenciaElem = document.getElementById('kpiAnoReferencia');
    const kpiProximoRepasseDataElem = document.getElementById('kpiProximoRepasseData');
    const kpiProximoRepasseValorElem = document.getElementById('kpiProximoRepasseValor');

    // Elementos do DOM - Tabela e Filtros
    const guideBankInfoSummaryElem = document.getElementById('guideBankInfoSummary');
    const filterFinancialPeriod = document.getElementById('filterFinancialPeriod'); // Para daterangepicker
    const exportFinancialReportBtn = document.getElementById('exportFinancialReport');
    const financialTableBody = document.getElementById('financialTableBody');
    const financialTransactionsCount = document.getElementById('financialTransactionsCount');
    const emptyFinancialStateTable = document.getElementById('emptyFinancialStateTable');
    const paginationContainer = document.querySelector('.guide-financial-pagination');

    const auth = new Auth();
    const currentUser = auth.getCurrentUser();

    // --- DADOS SIMULADOS ---
    // No futuro, viriam de uma API ou cálculos baseados nas reservas e pagamentos
    let allFinancialTransactions = [
        // { id: 'TRN001', dataRepasse: '2025-06-05', periodoReferente: 'Maio/2025', valorLiquido: 850.75, status: 'paid', linkComprovante: '#' },
        // { id: 'TRN002', dataRepasse: '2025-05-05', periodoReferente: 'Abril/2025', valorLiquido: 1230.50, status: 'paid', linkComprovante: '#' },
        // { id: 'TRN003', dataRepasse: '2025-04-05', periodoReferente: 'Março/2025', valorLiquido: 980.00, status: 'paid', linkComprovante: '#' },
        // { id: 'TRN004', dataRepasse: '---', periodoReferente: 'Junho/2025 (Previsto)', valorLiquido: 0, status: 'pending', linkComprovante: null }
    ];

    let currentPage = 1;
    const itemsPerPage = 10;

    // --- Inicialização do Date Range Picker (Opcional) ---
    /*
    if (filterFinancialPeriod && typeof $(filterFinancialPeriod).daterangepicker === 'function') {
        $(filterFinancialPeriod).daterangepicker({
            autoUpdateInput: false,
            opens: 'left',
            locale: { cancelLabel: 'Limpar', applyLabel: 'Aplicar', format: 'DD/MM/YYYY',
                      monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
                      daysOfWeek: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
            }
        });
        $(filterFinancialPeriod).on('apply.daterangepicker', function(ev, picker) {
            $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            currentPage = 1; loadAndRenderFinancials();
        });
        $(filterFinancialPeriod).on('cancel.daterangepicker', function(ev, picker) {
            $(this).val('');
            currentPage = 1; loadAndRenderFinancials();
        });
    }
    */

    function formatDate(dateString, includeTime = false) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        if (includeTime) { options.hour = '2-digit'; options.minute = '2-digit'; }
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }
    
    function formatCurrency(value) {
        return `R$ ${parseFloat(value).toFixed(2).replace('.', ',')}`;
    }

    function updateFinancialKPIs() {
        if (!currentUser) return;
        // Simulação de dados para KPIs
        const saldoAReceber = allFinancialTransactions.find(t => t.status === 'pending')?.valorLiquido || 320.50; // Exemplo
        const agora = new Date();
        const mesAtual = agora.toLocaleString('pt-BR', { month: 'long' });
        const anoAtual = agora.getFullYear();

        const totalMesAtual = allFinancialTransactions
            .filter(t => t.status === 'paid' && new Date(t.dataRepasse).getMonth() === agora.getMonth() && new Date(t.dataRepasse).getFullYear() === anoAtual)
            .reduce((sum, t) => sum + t.valorLiquido, 0);
        
        const totalAnoAtual = allFinancialTransactions
            .filter(t => t.status === 'paid' && new Date(t.dataRepasse).getFullYear() === anoAtual)
            .reduce((sum, t) => sum + t.valorLiquido, 0);
        
        // Simular próximo repasse
        const proximoRepasse = new Date(agora);
        proximoRepasse.setDate(5); // Dia 5 do próximo mês
        if (agora.getDate() >= 5) { // Se já passou do dia 5 do mês atual
             proximoRepasse.setMonth(agora.getMonth() + 1);
        }


        if(kpiSaldoReceberElem) kpiSaldoReceberElem.textContent = formatCurrency(saldoAReceber);
        if(kpiTotalMesElem) kpiTotalMesElem.textContent = formatCurrency(totalMesAtual + 1500.75); // Adicionando valor simulado
        if(kpiMesReferenciaElem) kpiMesReferenciaElem.textContent = `${mesAtual}/${anoAtual}`;
        if(kpiTotalAnoElem) kpiTotalAnoElem.textContent = formatCurrency(totalAnoAtual + 5800.20); // Adicionando valor simulado
        if(kpiAnoReferenciaElem) kpiAnoReferenciaElem.textContent = anoAtual.toString();
        if(kpiProximoRepasseDataElem) kpiProximoRepasseDataElem.textContent = formatDate(proximoRepasse.toISOString().split('T')[0]);
        if(kpiProximoRepasseValorElem) kpiProximoRepasseValorElem.textContent = `Valor: ${formatCurrency(saldoAReceber)}`;

        // Dados bancários (simulado - viria do perfil do criador)
        if (guideBankInfoSummaryElem && currentUser.bankDetails) { // Supondo que bankDetails exista
            guideBankInfoSummaryElem.textContent = `Banco: ${currentUser.bankDetails.banco}, Ag: ${currentUser.bankDetails.agencia}, C/C: ${currentUser.bankDetails.conta}`;
        } else if (guideBankInfoSummaryElem) {
            guideBankInfoSummaryElem.textContent = "Dados bancários não cadastrados.";
        }
    }


    function renderFinancialTable() {
        if (!financialTableBody || !financialTransactionsCount || !emptyFinancialStateTable || !paginationContainer) return;

        let transactionsToDisplay = [...allFinancialTransactions];
        
        // Aplicar filtros (ex: por período do filterFinancialPeriod)
        // const dateRange = filterFinancialPeriod ? filterFinancialPeriod.value : '';
        // if (dateRange) {
        //     const [startDateStr, endDateStr] = dateRange.split(' - ');
        //     // ... lógica de filtro de data ...
        // }

        financialTransactionsCount.textContent = `${transactionsToDisplay.length} transações encontradas`;

        const totalPages = Math.ceil(transactionsToDisplay.length / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedTransactions = transactionsToDisplay.slice(startIndex, endIndex);

        financialTableBody.innerHTML = '';
        if (paginatedTransactions.length === 0) {
            emptyFinancialStateTable.style.display = 'flex';
            paginationContainer.style.display = 'none';
        } else {
            emptyFinancialStateTable.style.display = 'none';
            paginatedTransactions.forEach(trn => {
                financialTableBody.innerHTML += createFinancialTableRow(trn);
            });
            renderPagination(totalPages);
            paginationContainer.style.display = transactionsToDisplay.length > itemsPerPage ? 'flex' : 'none';
        }
    }

    function createFinancialTableRow(transaction) {
        const statusText = { paid: 'Pago', pending: 'Pendente', processing: 'Processando', failed: 'Falhou' };
        const statusClass = { paid: 'status-paid', pending: 'status-pending', processing: 'status-processing', failed: 'status-failed' }; // Defina status-failed no CSS

        return `
            <tr>
                <td>${formatDate(transaction.dataRepasse)}</td>
                <td>${transaction.periodoReferente}</td>
                <td class="transaction-value-positive">${formatCurrency(transaction.valorLiquido)}</td>
                <td><span class="badge ${statusClass[transaction.status] || ''}">${statusText[transaction.status] || transaction.status}</span></td>
                <td>
                    ${transaction.linkComprovante ? `<a href="${transaction.linkComprovante}" target="_blank" class="btn-icon btn-details" title="Ver Comprovante"><i class="fas fa-receipt"></i></a>` : '-'}
                    <button class="btn-icon btn-details" data-transaction-id="${transaction.id}" title="Ver Detalhes das Reservas"><i class="fas fa-list-ul"></i></button>
                </td>
            </tr>
        `;
    }
    
    function renderPagination(totalPages) {
        // ... (Lógica de paginação similar à de guia-meus-passeios.js ou guia-minhas-reservas.js) ...
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
    // if (filterFinancialPeriod) { /* Listener para o daterangepicker */ }
    if (exportFinancialReportBtn) {
        exportFinancialReportBtn.addEventListener('click', () => {
            alert("Simulação: Gerar e baixar extrato financeiro. (Implementar conversão para CSV/PDF)");
        });
    }
    
    if (financialTableBody) {
        financialTableBody.addEventListener('click', function(event){
            const target = event.target;
            const detailsButton = target.closest('.btn-details[data-transaction-id]');
            if(detailsButton){
                const transactionId = detailsButton.dataset.transactionId;
                alert(`Simulação: Mostrar detalhes das reservas que compõem o repasse ${transactionId}. (Abrir modal ou nova visualização)`);
            }
        });
    }


    // --- Inicialização ---
    function initializePage() {
        if (!currentUser) {
            // Redirecionar para login se não estiver logado, ou se não for guia verificado
            alert("Acesso negado. Faça login como guia verificado.");
            window.location.href = "../login.html"; // Ajuste o caminho
            return;
        }
        // Simular algumas transações se não houver nenhuma
        if (allFinancialTransactions.length === 0) {
            allFinancialTransactions = [
                { id: 'TRN001', dataRepasse: '2025-06-05', periodoReferente: 'Maio/2025', valorLiquido: 850.75, status: 'paid', linkComprovante: '#' },
                { id: 'TRN002', dataRepasse: '2025-05-05', periodoReferente: 'Abril/2025', valorLiquido: 1230.50, status: 'paid', linkComprovante: '#' },
                { id: 'TRN003', dataRepasse: '2025-07-05', periodoReferente: 'Junho/2025 (Estimado)', valorLiquido: 320.50, status: 'pending', linkComprovante: null }
            ];
        }

        updateFinancialKPIs();
        renderFinancialTable();
    }

    initializePage();

    // Lógica do menu lateral do guia (já deve estar em guia-painel.js)
    // ...
});