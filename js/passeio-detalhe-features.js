// js/passeio-detalhe-features.js
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = (window.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const auth = new Auth();
    let currentUser = auth.getCurrentUser();
    let currentPasseio = null; // Guarda os dados do passeio atual

    // --- Função Utilitária para URLs de Mídia ---
    function resolveMediaUrl(path) {
        if (!path) {
            // Retorna um placeholder se não houver imagem
            return 'assets/images/placeholder-passeio.jpg'; // Ajuste o caminho se necessário
        }

        const normalizedPath = path.replace(/\\/g, '/'); // Normaliza barras invertidas (Windows)
        // Verifica se já é uma URL completa
        if (/^https?:\/\//i.test(normalizedPath)) {
            return normalizedPath;
        }

        // Monta a URL completa usando a base da API e o caminho relativo
        return `${API_BASE_URL}/${normalizedPath.replace(/^\//, '')}`; // Remove barra inicial se houver
    }

    // --- Função para buscar detalhes do Passeio via API ---
    async function fetchPasseioDetails(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/passeios/${id}`);
            if (!response.ok) {
                // Se a resposta não for OK (ex: 404 Not Found), trata como passeio não encontrado
                if (response.status === 404) {
                    console.warn(`Passeio com ID ${id} não encontrado.`);
                    displayPasseioData(null); // Mostra mensagem de "não encontrado"
                } else {
                    // Outros erros de servidor
                    throw new Error(`Erro ${response.status}: ${response.statusText}`);
                }
                return;
            }
            const passeioData = await response.json();
            console.log("Dados recebidos da API:", passeioData);
            currentPasseio = passeioData; // Armazena os dados do passeio
            displayPasseioData(currentPasseio);
        } catch (error) {
            console.error('Erro ao buscar detalhes do passeio:', error);
            const container = document.querySelector('.passeio-container');
            if (container) {
                container.innerHTML = '<p style="text-align:center; font-size:1.2rem; padding: 2rem;">Ocorreu um erro ao carregar as informações. Por favor, tente novamente mais tarde.</p>';
            }
        }
    }

    // --- Função para formatar datas ---
    function formatDate(dateString) {
        if (!dateString) return 'Data indisponível';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        // Adiciona fuso horário para evitar problemas de data off-by-one
        return new Date(dateString + 'T00:00:00-03:00').toLocaleDateString('pt-BR', options);
    }


    // --- Função para exibir os dados do Passeio no HTML ---
    function displayPasseioData(passeio) {
        const titleElement = document.getElementById('passeioTitle');
        const containerElement = document.querySelector('.passeio-container'); // O container principal

        // Se o passeio não for encontrado
        if (!passeio) {
            if (titleElement) titleElement.textContent = "Passeio não encontrado";
            if (containerElement) containerElement.innerHTML = '<p style="text-align:center; font-size:1.2rem; padding: 2rem;">Desculpe, o passeio que você procura não foi encontrado ou não está mais disponível. <a href="pesquisa.html" class="link-highlight">Voltar para a busca de passeios</a>.</p>';
            // Esconde elementos que não fazem sentido sem um passeio
            document.querySelector('.passeio-hero')?.style.display = 'none'; // Esconde a imagem principal
            return;
        }

        // --- Preenche os elementos HTML com os dados do passeio ---

        document.title = `${passeio.titulo} - Passeios da Serra`;

        // Hero Section
        if (titleElement) titleElement.textContent = passeio.titulo;
        const heroImage = document.getElementById('passeioHeroImage');
        if (heroImage) {
            heroImage.style.backgroundImage = `url('${resolveMediaUrl(passeio.imagem_principal_url)}')`;
        }

        // Meta Info (Avaliação, Localização)
        const ratingOverall = document.getElementById('passeioRatingOverall');
        if (ratingOverall) {
            const starsDiv = ratingOverall.querySelector('.stars');
            const ratingValue = passeio.rating || 0;
            const reviewsCount = passeio.reviews || 0;
            if (starsDiv) {
                starsDiv.style.setProperty('--rating', ratingValue); // Define a variável CSS para as estrelas
                starsDiv.setAttribute('aria-label', `Avaliação de ${ratingValue.toFixed(1)} de 5 estrelas`);
            }
           ratingOverall.querySelector('.rating-text').textContent = `(${reviewsCount} ${reviewsCount === 1 ? 'avaliação' : 'avaliações'})`; // CORRETO
        }
        const locationHeader = document.getElementById('passeioLocationHeader');
        if (locationHeader) {
            locationHeader.querySelector('span').textContent = passeio.localizacao_geral || 'Local não informado';
        }

        // Seção "Sobre o Passeio"
        const longDesc = document.getElementById('passeioLongDesc');
        if (longDesc) {
            // Usar innerHTML pode ser um risco se a descrição vier de fontes não confiáveis.
            // Se a descrição for segura (ex: Markdown processado no backend), OK.
            // Se for texto puro, use textContent.
            longDesc.innerHTML = passeio.descricao_longa || '<p>Descrição detalhada não disponível.</p>';
        }

        // Galeria de Imagens
        const galleryContainer = document.getElementById('passeioGalleryContainer');
        if (galleryContainer) {
            galleryContainer.innerHTML = ''; // Limpa
            let galleryImages = [];
            // Verifica se galeria_imagens_urls existe e é um array ou string JSON válida
            if (passeio.galeria_imagens_urls) {
                if (Array.isArray(passeio.galeria_imagens_urls)) {
                    galleryImages = passeio.galeria_imagens_urls;
                } else if (typeof passeio.galeria_imagens_urls === 'string') {
                    try {
                        galleryImages = JSON.parse(passeio.galeria_imagens_urls);
                        // Garante que é um array após o parse
                        if (!Array.isArray(galleryImages)) galleryImages = [];
                    } catch (e) {
                        console.error("Erro ao parsear galeria de imagens (JSON string inválida):", e);
                        galleryImages = [];
                    }
                }
            }

            if (galleryImages.length > 0) {
                galleryImages.forEach(imageUrl => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    galleryItem.style.backgroundImage = `url('${resolveMediaUrl(imageUrl)}')`;
                    // Opcional: Adicionar funcionalidade de lightbox ao clicar
                    galleryContainer.appendChild(galleryItem);
                });
            } else {
                galleryContainer.innerHTML = '<p>Nenhuma imagem adicional na galeria.</p>';
            }
        }

        // Seção "Informações Detalhadas"
        const infoGrid = document.getElementById('passeioInfoGrid');
        if (infoGrid) {
            // Limpa o grid antes de adicionar
            infoGrid.innerHTML = `
                <div class="info-item">
                    <i class="fas fa-clock"></i>
                    <div>
                        <h4>Duração</h4>
                        <p>${passeio.duracao_horas ? `${passeio.duracao_horas} horas` : 'N/A'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-hiking"></i>
                    <div>
                        <h4>Dificuldade</h4>
                        <p>${passeio.dificuldade ? (passeio.dificuldade.charAt(0).toUpperCase() + passeio.dificuldade.slice(1)) : 'N/A'}</p>
                    </div>
                </div>
                <div class="info-item">
                    <i class="fas fa-list-alt"></i>
                    <div>
                        <h4>Requisitos</h4>
                        <p>${passeio.requisitos || 'Nenhum requisito especial.'}</p>
                    </div>
                </div>
            `;
            // Itens Inclusos (trata como array ou string JSON)
            let includedItems = [];
             if (passeio.itens_inclusos) {
                 if (Array.isArray(passeio.itens_inclusos)) {
                     includedItems = passeio.itens_inclusos;
                 } else if (typeof passeio.itens_inclusos === 'string') {
                    try {
                        const parsedItems = JSON.parse(passeio.itens_inclusos);
                        if(Array.isArray(parsedItems)) includedItems = parsedItems;
                    } catch(e) { console.error("Erro ao parsear itens inclusos:", e); }
                 }
            }
            if (includedItems.length > 0) {
                infoGrid.innerHTML += `
                    <div class="info-item">
                        <i class="fas fa-box-open"></i>
                        <div>
                            <h4>Itens Inclusos</h4>
                            <p>${includedItems.join(', ')}</p>
                        </div>
                    </div>`;
            } else {
                 infoGrid.innerHTML += `
                    <div class="info-item">
                        <i class="fas fa-box-open"></i>
                        <div>
                            <h4>Itens Inclusos</h4>
                            <p>Não especificado.</p>
                        </div>
                    </div>`;
            }
        }

        // Card do Guia
        const guideCard = document.getElementById('guideCard');
        if (guideCard) {
            if (passeio.guia && passeio.guia.usuario) { // Verifica se guia e usuário existem
                guideCard.style.display = 'block'; // Mostra o card
                document.getElementById('guideName').textContent = passeio.guia.nome_publico || 'Guia';
                const guideAvatar = document.getElementById('guideAvatar');
                if (guideAvatar) {
                    guideAvatar.src = resolveMediaUrl(passeio.guia.usuario.avatar_url) || 'assets/images/ImagemUsuarioPlaceholder.png'; // Fallback
                    guideAvatar.alt = `Foto de ${passeio.guia.nome_publico || 'Guia'}`;
                }
                const guideBioShort = document.getElementById('guideBioShort');
                if(guideBioShort) {
                    const bio = passeio.guia.bio_publica || 'Guia especialista na região.';
                    guideBioShort.textContent = bio.length > 150 ? bio.substring(0, 150) + '...' : bio;
                }
                const guideProfileLink = document.getElementById('guideProfileLink');
                 if(guideProfileLink && passeio.guia.id) { // Usa o ID do PerfilDeGuia
                     // ASSUMINDO que a API retorna o ID do PerfilDeGuia em passeio.guia.id
                     // Se a API retornar o ID do Usuario em passeio.guia.usuario_id, ajuste aqui.
                    guideProfileLink.href = `perfil-guia.html?id=${passeio.guia.id}`;
                 } else if (guideProfileLink) {
                     guideProfileLink.style.display = 'none'; // Esconde o link se não houver ID
                 }

            } else {
                guideCard.style.display = 'none'; // Esconde se não houver dados do guia
            }
        }

        // Card de Reserva (Preço e Datas)
        const bookingCardPrice = document.getElementById('bookingCardPrice');
        if (bookingCardPrice) {
            bookingCardPrice.textContent = `R$ ${parseFloat(passeio.preco || 0).toFixed(2).replace('.', ',')}`;
        }

        const bookingDateSelect = document.getElementById('booking-date');
        const bookingParticipantsSelect = document.getElementById('booking-participants');
        const bookingTotalPrice = document.getElementById('bookingTotalPrice');
        const bookNowButton = document.getElementById('bookNowButton');

        if (bookingDateSelect) {
            bookingDateSelect.innerHTML = '<option value="">Selecione data e horário</option>'; // Opção padrão
            if (passeio.datas_disponiveis && passeio.datas_disponiveis.length > 0) {
                passeio.datas_disponiveis.forEach(data => {
                    const dataObj = new Date(data.data_hora_inicio);
                    // Verifica se a data é futura
                    if (dataObj > new Date()) {
                        const vagasDisponiveis = (data.vagas_maximas || 0) - (data.vagas_ocupadas || 0);
                        if (vagasDisponiveis > 0) { // Só mostra datas com vagas
                            const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                            const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                            const option = document.createElement('option');
                            option.value = data.id; // USA O ID DA DATA DISPONÍVEL COMO VALUE
                            option.dataset.maxVagas = vagasDisponiveis; // Guarda o número de vagas
                            option.dataset.dateTime = data.data_hora_inicio; // Guarda data/hora ISO
                            option.textContent = `${dataFormatada} às ${horaFormatada} (${vagasDisponiveis} vagas)`;
                            bookingDateSelect.appendChild(option);
                        }
                    }
                });
                // Habilita o select se houver opções
                bookingDateSelect.disabled = bookingDateSelect.options.length <= 1;
            } else {
                bookingDateSelect.innerHTML = '<option value="" disabled>Nenhuma data disponível</option>';
                bookingDateSelect.disabled = true;
                if(bookingParticipantsSelect) bookingParticipantsSelect.disabled = true;
                if(bookNowButton) bookNowButton.disabled = true;
            }
        }

        // Atualiza o total e o select de participantes ao mudar a data ou o número de participantes
        function updateBookingTotal() {
            const selectedDateOption = bookingDateSelect ? bookingDateSelect.options[bookingDateSelect.selectedIndex] : null;
            const participants = bookingParticipantsSelect ? parseInt(bookingParticipantsSelect.value) : 1;
            const maxVagas = selectedDateOption ? parseInt(selectedDateOption.dataset.maxVagas || 1) : 1;

            if (bookingParticipantsSelect) {
                // Atualiza as opções de participantes com base nas vagas da data selecionada
                const currentParticipantValue = bookingParticipantsSelect.value;
                bookingParticipantsSelect.innerHTML = ''; // Limpa opções
                for (let i = 1; i <= maxVagas; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = `${i} pessoa${i > 1 ? 's' : ''}`;
                    bookingParticipantsSelect.appendChild(option);
                }
                // Tenta manter o valor selecionado anteriormente, se ainda for válido
                if (parseInt(currentParticipantValue) <= maxVagas) {
                    bookingParticipantsSelect.value = currentParticipantValue;
                } else {
                     bookingParticipantsSelect.value = '1'; // Reseta para 1 se o valor anterior for maior que as vagas
                }
                 bookingParticipantsSelect.disabled = !selectedDateOption || !selectedDateOption.value; // Desabilita se nenhuma data selecionada
            }

            if (bookingTotalPrice && passeio.preco && participants > 0 && selectedDateOption && selectedDateOption.value) {
                const total = parseFloat(passeio.preco) * participants;
                bookingTotalPrice.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
                if (bookNowButton) bookNowButton.disabled = false;
            } else {
                if (bookingTotalPrice) bookingTotalPrice.textContent = `R$ 0,00`;
                if (bookNowButton) bookNowButton.disabled = true;
            }
        }

        if (bookingDateSelect) bookingDateSelect.addEventListener('change', updateBookingTotal);
        if (bookingParticipantsSelect) bookingParticipantsSelect.addEventListener('change', updateBookingTotal);
        updateBookingTotal(); // Chama uma vez para inicializar


        // Seção de Avaliações
        displayReviews(passeio.avaliacoes || []); // Chama a função para exibir avaliações

    } // Fim da função displayPasseioData


    // --- Função para Exibir Avaliações ---
    function displayReviews(reviews) {
        const reviewsSummaryContainer = document.getElementById('passeioReviewsSummaryContainer');
        const reviewsListContainer = document.getElementById('passeioReviewsListContainer');
        const addReviewContainer = document.getElementById('addReviewContainer'); // Onde o form de add review ficará

        if (!reviewsSummaryContainer || !reviewsListContainer || !addReviewContainer) return;

        // Calcular Resumo
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((sum, rev) => sum + (rev.nota || 0), 0) / totalReviews)
            : 0;

        // Exibir Resumo (similar ao admin/reviews.html ou passeio.html)
        reviewsSummaryContainer.innerHTML = `
            <div class="summary-overall">
                <div class="overall-rating">${averageRating.toFixed(1)}</div>
                <div class="stars" style="--rating: ${averageRating};" aria-label="Avaliação média de ${averageRating.toFixed(1)} de 5 estrelas"></div>
                <div class="total-reviews">Baseado em ${totalReviews} ${totalReviews === 1 ? 'avaliação' : 'avaliações'}</div>
            </div>
            `;

        // Exibir Lista de Avaliações
        if (totalReviews === 0) {
            reviewsListContainer.innerHTML = '<p>Este passeio ainda não possui avaliações. Seja o primeiro a avaliar!</p>';
        } else {
            reviewsListContainer.innerHTML = reviews.map(review => {
                const reviewDate = review.data_avaliacao ? formatDate(review.data_avaliacao.split('T')[0]) : 'Data indisponível';
                const authorName = review.usuario?.nome_completo || 'Anônimo';
                const authorAvatar = resolveMediaUrl(review.usuario?.avatar_url) || 'assets/images/ImagemUsuarioPlaceholder.png';

                return `
                    <div class="review">
                        <div class="review-header">
                            <div class="review-author">
                                <img src="${authorAvatar}" alt="${authorName}">
                                <div>
                                    <h4>${authorName}</h4>
                                    <div class="review-meta">
                                        <div class="review-rating">
                                            <div class="stars" style="--rating: ${review.nota || 0};" aria-label="Avaliação de ${review.nota || 0} de 5 estrelas"></div>
                                        </div>
                                        <span class="review-date">${reviewDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="review-content">
                            ${review.titulo ? `<h3>${review.titulo}</h3>` : ''}
                            <p>${review.comentario || ''}</p>
                        </div>
                        ${review.resposta_do_guia ? `
                            <div class="review-replies"> {/* Adaptar estilo .reply de avaliacoes.html se necessário */}
                                <div class="reply">
                                    <div class="reply-author">
                                        {/* Idealmente buscar avatar do guia */}
                                        <img src="${resolveMediaUrl(currentPasseio?.guia?.usuario?.avatar_url) || 'assets/images/DonoPasseio.jpg'}" alt="Guia">
                                        <div>
                                            <h5>${currentPasseio?.guia?.nome_publico || 'Guia'} <span class="reply-badge">Guia</span></h5>
                                            {/* Idealmente ter a data da resposta */}
                                            <span class="reply-date">${review.data_resposta ? formatDate(review.data_resposta.split('T')[0]) : ''}</span>
                                        </div>
                                    </div>
                                    <div class="reply-content">
                                        <p>${review.resposta_do_guia}</p>
                                    </div>
                                </div>
                            </div>` : ''
                        }
                    </div>
                `;
            }).join('');
        }

        // Adicionar Formulário para Nova Avaliação (se usuário logado e talvez se já fez o passeio)
        // Por enquanto, apenas mostra se logado
        if (currentUser) {
            addReviewContainer.innerHTML = `
                <div class="write-review">
                    <h3>Deixe sua avaliação</h3>
                    <form id="addReviewForm" class="review-form">
                        {/* ... campos do formulário como em avaliacoes.html ... */}
                         <div class="form-group">
                            <label for="review-rating-add">Sua Nota*</label>
                            {/* Input de estrelas aqui */}
                        </div>
                        <div class="form-group">
                            <label for="review-title-add">Título (Opcional)</label>
                            <input type="text" id="review-title-add" class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="review-text-add">Seu Comentário*</label>
                            <textarea id="review-text-add" rows="4" class="form-control" required></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Enviar Avaliação</button>
                        </div>
                        <div id="addReviewStatus" class="form-status-message" style="display:none;"></div>
                    </form>
                </div>
            `;
            // Adicionar event listener para o submit do addReviewForm aqui
            // (faria um POST para /api/passeios/:id/avaliacoes ou similar)
        } else {
            addReviewContainer.innerHTML = '<p>Faça <a href="login.html" class="link-highlight">login</a> para deixar sua avaliação.</p>';
        }

    } // Fim da função displayReviews


     // --- Lógica do Formulário de Reserva ---
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(event) {
            event.preventDefault();

            if (!currentUser) {
                alert('Você precisa estar logado para fazer uma reserva.');
                window.location.href = `login.html?redirect=${encodeURIComponent(window.location.href)}`;
                return;
            }

            const selectedDateOption = document.getElementById('booking-date').options[document.getElementById('booking-date').selectedIndex];
            const dataDisponivelId = selectedDateOption ? selectedDateOption.value : null; // ID da DataDisponivel
            const selectedDateTime = selectedDateOption ? selectedDateOption.dataset.dateTime : null; // Data/Hora ISO
            const participantes = parseInt(document.getElementById('booking-participants').value);
            const precoUnitario = currentPasseio ? parseFloat(currentPasseio.preco) : 0;
            const valorTotalCalculado = precoUnitario * participantes;
            const passeioId = currentPasseio ? currentPasseio.id : null;

            if (!passeioId || !dataDisponivelId || isNaN(participantes) || participantes <= 0) {
                alert('Por favor, selecione uma data e o número de participantes.');
                return;
            }

            const bookNowButton = document.getElementById('bookNowButton');
            bookNowButton.disabled = true;
            bookNowButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

            try {
                const token = auth.getTokenFromStorage();
                const response = await fetch(`${API_BASE_URL}/api/reservas`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        passeioId: passeioId,
                        dataDisponivelId: dataDisponivelId, // Envia o ID da data
                        participantes: participantes,
                        valorTotal: valorTotalCalculado,
                        // observacoesCliente: '...' // Adicionar campo se necessário
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'Erro ao criar a reserva.');
                }

                // Sucesso! Redireciona para a página de confirmação
                console.log('Reserva criada:', result.reserva);
                const queryParams = new URLSearchParams({
                    codigo: result.reserva.codigo_reserva,
                    passeioId: passeioId, // Passa ID para buscar dados do passeio na confirmação
                    data: selectedDateTime, // Passa a data/hora ISO
                    participantes: participantes,
                    total: valorTotalCalculado.toFixed(2)
                }).toString();

                window.location.href = `reserva-confirmada.html?${queryParams}`;

            } catch (error) {
                console.error('Erro ao enviar reserva:', error);
                alert(`Erro ao fazer a reserva: ${error.message}`);
                bookNowButton.disabled = false;
                bookNowButton.textContent = 'Reservar Agora';
            }
        });
    }


    // --- INICIALIZAÇÃO DA PÁGINA ---
    const urlParams = new URLSearchParams(window.location.search);
    const passeioIdFromUrl = urlParams.get('id');

    if (passeioIdFromUrl) {
        fetchPasseioDetails(passeioIdFromUrl);
    } else {
        // Se não houver ID, mostra a mensagem de "não encontrado"
        displayPasseioData(null);
    }

    // --- Lógica do Menu Lateral (se não estiver em main.js global) ---
    // Instancia o handler para o menu desta página
    new SidebarMenuHandler({
        menuToggleSelector: '.page-menu-toggle',
        sidebarMenuId: 'sidebarMenuPasseio', // ID específico do menu nesta página
        menuOverlayId: 'menuOverlayPasseio' // ID específico do overlay nesta página
    });
    // Adicionar lógica para atualizar o status do usuário no menu lateral, se necessário
    // updateSidebarUserStatus(); // Função similar à de home-features.js

});