// js/passeio-detalhe-features.js
document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth();
    let currentUser = auth.getCurrentUser();

    // Função para buscar dados do passeio da API
    async function fetchPasseioDetails(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/passeios/${id}`);
            if (!response.ok) {
                // Se o status for 404 ou outro erro, chama a função para exibir o estado de "não encontrado"
                displayPasseioData(null);
                return;
            }
            const passeioData = await response.json();
            // Adiciona um log para podermos ver no console do navegador exatamente o que a API está retornando
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

    // Função para exibir os dados na página (COM VERIFICAÇÕES DE SEGURANÇA)
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
            heroImage.style.backgroundImage = `url('http://localhost:3000/${passeio.imagem_principal_url.replace(/\\/g, '/')}')`;
        }
        
        // Meta Info (Rating e Localização)
        const ratingOverall = document.getElementById('passeioRatingOverall');
        if (ratingOverall) {
            const starsDiv = ratingOverall.querySelector('.stars');
            if (starsDiv) {
                // A animação da estrela é feita via CSS com a variável --rating
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
            
            // --- CORREÇÃO CRÍTICA AQUI ---
            // Verifica se galeria_imagens_urls é uma string e a converte para um array
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
                    galleryItem.style.backgroundImage = `url('http://localhost:3000/${imageUrl.replace(/\\/g, '/')}')`;
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
            
            // --- CORREÇÃO SIMILAR PARA ITENS INCLUSOS ---
            let includedItems = [];
             if (typeof passeio.itens_inclusos === 'string') {
                try {
                    includedItems = JSON.parse(passeio.itens_inclusos);
                } catch(e) { console.error("Erro ao parsear itens inclusos:", e); }
            } else if (Array.isArray(passeio.itens_inclusos)) {
                includedItems = passeio.itens_inclusos;