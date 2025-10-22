// js/passeio-detalhe-features.js
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = (window.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const auth = new Auth();
    let currentUser = auth.getCurrentUser();

    function resolveMediaUrl(path) {
        if (!path) {
            return null;
        }

        const normalizedPath = path.replace(/\\/g, '/');
        if (/^https?:\/\//i.test(normalizedPath)) {
            return normalizedPath;
        }

        return `${API_BASE_URL}/${normalizedPath.replace(/^\//, '')}`;
    }

    async function fetchPasseioDetails(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/passeios/${id}`);
            if (!response.ok) {
                displayPasseioData(null);
                return;
            }
            const passeioData = await response.json();
            console.log("Dados recebidos da API:", passeioData); 
            displayPasseioData(passeioData);
        } catch (error) {
            console.error('Erro ao buscar detalhes do passeio:', error);
            const container = document.querySelector('.passeio-container');
            if (container) {
                container.innerHTML = '<p style="text-align:center; font-size:1.2rem; padding: 2rem;">Ocorreu um erro ao carregar as informações. Por favor, tente novamente mais tarde.</p>';
            }
        }
    }

    function displayPasseioData(passeio) {
        const titleElement = document.getElementById('passeioTitle');
        const containerElement = document.querySelector('.passeio-container');

        if (!passeio) {
            if (titleElement) titleElement.textContent = "Passeio não encontrado";
            if (containerElement) containerElement.innerHTML = '<p style="text-align:center; font-size:1.2rem; padding: 2rem;">Desculpe, o passeio que você procura não foi encontrado ou não está mais disponível. <a href="pesquisa.html" class="link-highlight">Voltar para a busca de passeios</a>.</p>';
            return;
        }

        document.title = `${passeio.titulo} - Passeios da Serra`;

        // Hero
        if (titleElement) titleElement.textContent = passeio.titulo;
        const heroImage = document.getElementById('passeioHeroImage');
        if (heroImage && passeio.imagem_principal_url) {
            const heroUrl = resolveMediaUrl(passeio.imagem_principal_url);
            if (heroUrl) {
                heroImage.style.backgroundImage = `url('${heroUrl}')`;
            }
        }
        
        // Meta Info
        const ratingOverall = document.getElementById('passeioRatingOverall');
        if (ratingOverall) {
            const starsDiv = ratingOverall.querySelector('.stars');
            if (starsDiv) {
                starsDiv.style.setProperty('--rating', passeio.rating);
            }
            ratingOverall.querySelector('.rating-text').textContent = `(${passeio.reviews} avaliações)`;
        }
        const locationHeader = document.getElementById('passeioLocationHeader');
        if (locationHeader) {
            locationHeader.querySelector('span').textContent = passeio.localizacao_geral;
        }

        // Sobre o Passeio
        const longDesc = document.getElementById('passeioLongDesc');
        if (longDesc) {
            longDesc.innerHTML = passeio.descricao_longa || "Descrição não disponível.";
        }

        // Galeria de Imagens
        const galleryContainer = document.getElementById('passeioGalleryContainer');
        if (galleryContainer) {
            galleryContainer.innerHTML = '';
            
            let galleryImages = [];
            if (typeof passeio.galeria_imagens_urls === 'string') {
                try {
                    galleryImages = JSON.parse(passeio.galeria_imagens_urls);
                } catch(e) {
                    console.error("Erro ao parsear galeria de imagens:", e);
                }
            } else if (Array.isArray(passeio.galeria_imagens_urls)) {
                galleryImages = passeio.galeria_imagens_urls;
            }

            if (galleryImages.length > 0) {
                galleryImages.forEach(imageUrl => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    const resolvedGalleryUrl = resolveMediaUrl(imageUrl);
                    if (resolvedGalleryUrl) {
                        galleryItem.style.backgroundImage = `url('${resolvedGalleryUrl}')`;
                    }
                    galleryContainer.appendChild(galleryItem);
                });
            } else {
                galleryContainer.innerHTML = '<p>Nenhuma imagem adicional na galeria.</p>';
            }
        }

        // Informações Detalhadas
        const infoGrid = document.getElementById('passeioInfoGrid');
        if (infoGrid) {
            infoGrid.innerHTML = `
                <div class="info-item"><i class="fas fa-clock"></i><div><h4>Duração</h4><p>${passeio.duracao_horas || 'N/A'} horas</p></div></div>
                <div class="info-item"><i class="fas fa-hiking"></i><div><h4>Dificuldade</h4><p>${passeio.dificuldade || 'N/A'}</p></div></div>
                <div class="info-item"><i class="fas fa-list-alt"></i><div><h4>Requisitos</h4><p>${passeio.requisitos || 'Nenhum requisito especial.'}</p></div></div>
            `;
            
            let includedItems = [];
             if (typeof passeio.itens_inclusos === 'string') {
                try {
                    includedItems = JSON.parse(passeio.itens_inclusos);
                } catch(e) { console.error("Erro ao parsear itens inclusos:", e); }
            } else if (Array.isArray(passeio.itens_inclusos)) {
                includedItems = passeio.itens_inclusos;
            }

            if(includedItems.length > 0) {
                infoGrid.innerHTML += `<div class="info-item"><i class="fas fa-box-open"></i><div><h4>Itens Inclusos</h4><p>${includedItems.join(', ')}</p></div></div>`;
            }
        }

        // Card do Guia
        const guideCard = document.getElementById('guideCard');
        if (guideCard) {
            if (passeio.guia && passeio.guia.usuario) {
                guideCard.style.display = 'block';
                document.getElementById('guideName').textContent = passeio.guia.nome_publico;
                const guideAvatar = document.getElementById('guideAvatar');
                const resolvedAvatarUrl = resolveMediaUrl(passeio.guia.usuario.avatar_url);
                guideAvatar.src = resolvedAvatarUrl || 'assets/images/ImagemUsuarioPlaceholder.png';
                document.getElementById('guideBioShort').textContent = (passeio.guia.bio_publica || 'Guia especialista na região.').substring(0, 150) + '...';
                document.getElementById('guideProfileLink').href = `perfil-guia.html?id=${passeio.guia.id}`;
            } else {
                guideCard.style.display = 'none';
            }
        }

        // Card de Reserva
        const bookingCardPrice = document.getElementById('bookingCardPrice');
        if (bookingCardPrice) {
            bookingCardPrice.textContent = `R$ ${parseFloat(passeio.preco).toFixed(2).replace('.', ',')}`;
        }
        const bookingDateSelect = document.getElementById('booking-date');
        if (bookingDateSelect) {
            bookingDateSelect.innerHTML = '<option value="">Selecione data e horário</option>';
            if (passeio.datas_disponiveis && passeio.datas_disponiveis.length > 0) {
                passeio.datas_disponiveis.forEach(data => {
                    const dataObj = new Date(data.data_hora_inicio);
                    const dataFormatada = dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
                    const horaFormatada = dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    
                    const option = document.createElement('option');
                    option.value = data.data_hora_inicio;
                    option.textContent = `${dataFormatada} às ${horaFormatada}`;
                    bookingDateSelect.appendChild(option);
                });
            } else {
                 bookingDateSelect.innerHTML = '<option value="" disabled>Nenhuma data disponível</option>';
            }
        }
    }

    // --- INICIALIZAÇÃO DA PÁGINA ---
    const passeioId = new URLSearchParams(window.location.search).get('id');
    if (passeioId) {
        fetchPasseioDetails(passeioId);
    } else {
        displayPasseioData(null);
    }
});