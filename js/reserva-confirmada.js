document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth(); // Para pegar o e-mail do usuário logado
    const passeiosManager = new PasseiosManager(); // Para pegar dados do passeio

    const summaryPasseioNome = document.getElementById('summaryPasseioNome');
    const summaryData = document.getElementById('summaryData');
    const summaryParticipantes = document.getElementById('summaryParticipantes');
    const summaryValor = document.getElementById('summaryValor');
    const summaryCodigoReserva = document.getElementById('summaryCodigoReserva');
    const summaryEmailUsuario = document.getElementById('summaryEmailUsuario');
    
    const summaryPontoEncontro = document.getElementById('summaryPontoEncontro');
    const summaryNomeGuia = document.getElementById('summaryNomeGuia');
    const summaryContatoGuia = document.getElementById('summaryContatoGuia');
    const summaryOQueLevar = document.getElementById('summaryOQueLevar');
    const confirmationSubtitle = document.getElementById('confirmationSubtitle');


    function loadReservationDetails() {
        // Em um cenário real, você pegaria os dados da reserva de:
        // 1. Query parameters na URL (ex: ?reservaId=123)
        // 2. sessionStorage/localStorage (se salvos após o fluxo de reserva)
        // 3. Uma chamada de API para buscar os detalhes da reserva

        // --- Simulação de Dados ---
        const urlParams = new URLSearchParams(window.location.search);
        const passeioId = urlParams.get('passeioId') || '1'; // ID do passeio (ex: '1' para Pedra do Baú)
        const dataReserva = urlParams.get('data') || new Date().toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'});
        const numParticipantes = parseInt(urlParams.get('participantes') || 2);
        const valorTotal = parseFloat(urlParams.get('total') || 240.00);
        const codigoReserva = urlParams.get('codigo') || `PSR-${new Date().getTime().toString().slice(-6)}`;

        const currentUser = auth.getCurrentUser();
        const passeio = passeiosManager.getPasseioById(passeioId); // Busca o passeio

        if (currentUser && summaryEmailUsuario) {
            summaryEmailUsuario.textContent = currentUser.email;
        }

        if (passeio) {
            if (summaryPasseioNome) summaryPasseioNome.textContent = passeio.title; // title do seu objeto passeio
            if (summaryValor) summaryValor.textContent = `R$ ${valorTotal.toFixed(2).replace('.', ',')}`;
            
            // Detalhes do passeio para "próximos passos"
            if (summaryPontoEncontro) summaryPontoEncontro.textContent = passeio.localizacao_encontro || "Entrada principal do local do passeio.";
            // Supondo que o objeto passeio tenha info do guia
            const guia = passeiosManager.getGuiaById(passeio.creatorId); // Função hipotética
            if (summaryNomeGuia && guia) summaryNomeGuia.textContent = guia.name;
            if (summaryContatoGuia && guia) summaryContatoGuia.href = `mailto:${guia.email}`; // Exemplo
            
            if (summaryOQueLevar) summaryOQueLevar.textContent = passeio.requirements || "Verifique a descrição completa do passeio.";

            if (confirmationSubtitle) {
                 confirmationSubtitle.textContent = `Obrigado por escolher a Passeios da Serra! Sua aventura no passeio "${passeio.title}" está garantida.`;
            }

        } else {
            // Fallback se o passeio não for encontrado (improvável se o fluxo estiver correto)
            if (summaryPasseioNome) summaryPasseioNome.textContent = "Passeio não especificado";
             if (confirmationSubtitle) {
                 confirmationSubtitle.textContent = `Obrigado por escolher a Passeios da Serra! Sua aventura está garantida.`;
            }
        }

        if (summaryData) summaryData.textContent = dataReserva;
        if (summaryParticipantes) summaryParticipantes.textContent = `${numParticipantes} pessoa${numParticipantes > 1 ? 's' : ''}`;
        if (summaryCodigoReserva) summaryCodigoReserva.textContent = codigoReserva;

    }

    // Simulação de como os dados poderiam ser passados via URL para esta página:
    // Exemplo: reserva-confirmada.html?passeioId=1&data=2025-12-25&participantes=2&total=240&codigo=PSR123
    // (No seu fluxo de reserva, após o "pagamento", você redirecionaria para esta URL)
    
    loadReservationDetails();

    // Animações (se main.js não cobrir elementos carregados dinamicamente, mas aqui é estático)
    // Se você tiver a função global 'animateOnScroll' de main.js, ela deve pegar os elementos.
    // Caso contrário, teria que chamar uma função de inicialização de animação aqui.

    // Não há menu lateral nesta página, então não é necessário JS para o menu-toggle.
});