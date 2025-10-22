// js/home-features.js
'use strict';

// Adicione no topo do arquivo JS
const API_BASE_URL = (window.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');

// Adicione esta função no arquivo JS (ou garanta que esteja acessível globalmente)
function resolveMediaUrl(path) {
    if (!path) {
        // Retorna um placeholder se não houver imagem
        return 'assets/images/placeholder-passeio.jpg'; // Ajuste o caminho do seu placeholder
    }

    const normalizedPath = path.replace(/\\/g, '/'); // Normaliza barras invertidas (Windows)
    // Verifica se já é uma URL completa
    if (/^https?:\/\//i.test(normalizedPath)) {
        return normalizedPath;
    }

    // Monta a URL completa usando a base da API e o caminho relativo
    return `${API_BASE_URL}/${normalizedPath.replace(/^\//, '')}`; // Remove barra inicial se houver
}


document.addEventListener('DOMContentLoaded', function() {
    // A classe Auth deve estar disponível globalmente através do script auth.js
    const auth = new Auth();

    /**
     * ATUALIZA O STATUS DO USUÁRIO NO MENU LATERAL
     * Busca os dados do perfil do usuário na API e atualiza a UI do menu.
     * Esta é a única fonte de verdade para o estado de login do usuário na página.
     */
    async function updateSidebarUserStatus() {
        const sidebarProfileSection = document.getElementById('sidebarProfileSection');
        if (!sidebarProfileSection) return;

        const token = auth.getTokenFromStorage();

        // Elementos da UI que serão modificados
        const sidebarProfileImg = document.getElementById('sidebarProfileImg');
        const sidebarProfileName = document.getElementById('sidebarProfileName');
        const sidebarProfileEmail = document.getElementById('sidebarProfileEmail');
        const sidebarLinkAuth = document.getElementById('sidebarLinkAuth');
        const sidebarLinkTornarGuia = document.getElementById('sidebarLinkTornarGuia'); // Link para se tornar guia
        const sidebarLinkCriarPasseio = document.getElementById('sidebarLinkCriarPasseio'); // Link para criar passeio
        const userSpecificLinks = [
            document.getElementById('sidebarLinkMeuPerfil'),
            sidebarLinkTornarGuia,
            sidebarLinkCriarPasseio,
            document.getElementById('sidebarLinkAvaliacoes'), // Verifique se o ID está correto no HTML
            document.getElementById('sidebarLinkFavoritos'),
            document.getElementById('sidebarLinkConfiguracoes')
        ];

        // Função para reverter a UI para o estado "deslogado"
        const showLoggedOutState = () => {
            if (sidebarProfileImg) sidebarProfileImg.style.display = 'none';
            if (sidebarProfileName) sidebarProfileName.textContent = 'Visitante';
            if (sidebarProfileEmail) sidebarProfileEmail.textContent = 'Faça login ou cadastre-se';
            userSpecificLinks.forEach(link => { if (link) link.style.display = 'none'; });
            if (sidebarLinkAuth) sidebarLinkAuth.innerHTML = `<a href="login.html"><i class="fas fa-sign-in-alt"></i> Login / Cadastro</a>`;
        };

        // Se não há token, o usuário está deslogado.
        if (!token) {
            showLoggedOutState();
            return;
        }

        // Se há um token, vamos verificar sua validade e buscar os dados do perfil.
        try {
            const response = await fetch(`${API_BASE_URL}/api/perfil`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Token válido, usuário logado.
                const user = await response.json();

                if (sidebarProfileImg) {
                    // Usa resolveMediaUrl para o avatar do usuário também
                    sidebarProfileImg.src = resolveMediaUrl(user.avatar_url) || 'assets/images/ImagemUsuario.jpg'; // Fallback
                    sidebarProfileImg.style.display = 'block';
                }
                if (sidebarProfileName) sidebarProfileName.textContent = user.nome_completo;
                if (sidebarProfileEmail) sidebarProfileEmail.textContent = user.email;

                // Mostra/esconde links com base no tipo de usuário
                userSpecificLinks.forEach(link => {
                    if (link) {
                        // Oculta todos os links primeiro por padrão
                        link.style.display = 'none';

                        // Lógica para o link "Criar Passeio" (só para guias)
                        if (link.id === 'sidebarLinkCriarPasseio' && user.tipo_de_usuario === 'guia') {
                            link.style.display = 'list-item'; // Ou 'block' dependendo do seu CSS
                        }
                        // Lógica para o link "Tornar-se Guia" (só para clientes)
                        else if (link.id === 'sidebarLinkTornarGuia' && user.tipo_de_usuario === 'cliente') {
                            link.style.display = 'list-item'; // Ou 'block'
                        }
                        // Lógica para os outros links (visíveis para todos os logados)
                        else if (link.id !== 'sidebarLinkCriarPasseio' && link.id !== 'sidebarLinkTornarGuia') {
                            link.style.display = 'list-item'; // Ou 'block'
                        }
                    }
                });

                // Configura o botão de Logout
                if (sidebarLinkAuth) {
                    sidebarLinkAuth.innerHTML = `<a href="#" id="sidebarLogoutLink"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
                    document.getElementById('sidebarLogoutLink')?.addEventListener('click', (e) => {
                        e.preventDefault();
                        auth.logout();
                        window.location.reload(); // Recarrega a página para refletir o estado deslogado
                    });
                }
            } else {
                // Token inválido ou expirado.
                console.warn('Token inválido ou expirado, limpando dados de login.');
                auth.logout();
                showLoggedOutState();
            }
        } catch (error) {
            console.error('Erro ao verificar o status do usuário:', error);
            // Em caso de erro de rede, pode ser útil manter o estado anterior ou mostrar deslogado
            showLoggedOutState();
        }
    }

    // Lógica da Barra de Busca Hero
    const heroSearchForm = document.getElementById('heroSearchForm');
    if (heroSearchForm) {
        heroSearchForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const searchInput = document.getElementById('heroSearchInput');
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `pesquisa.html?q=${encodeURIComponent(query)}`;
            } else {
                window.location.href = 'pesquisa.html';
            }
        });
    }

    // --- Funções de Gerenciamento de Favoritos (Usando localStorage) ---
    // Mantenha estas funções aqui ou mova para um arquivo utilitário global
    function getFavorites() {
        return JSON.parse(localStorage.getItem('favorite_tours_ids')) || [];
    }
    function isFavorite(tourId) {
        return getFavorites().includes(tourId.toString());
    }
    function toggleFavorite(tourId, tourName = "este passeio") { // Adicionado tourName como parâmetro
        let favorites = getFavorites();
        const tourIdStr = tourId.toString();

        if (favorites.includes(tourIdStr)) {
            favorites = favorites.filter(id => id !== tourIdStr);
            alert(`"${tourName}" removido dos seus favoritos!`);
        } else {
            favorites.push(tourIdStr);
            alert(`"${tourName}" adicionado aos seus favoritos!`);
        }
        localStorage.setItem('favorite_tours_ids', JSON.stringify(favorites));
    }
     function updateFavoriteButtonState(buttonElement, tourId) {
        if (!buttonElement) return;
        if (isFavorite(tourId)) {
            buttonElement.classList.add('favorited');
            buttonElement.innerHTML = '<i class="fas fa-heart"></i>'; // Coração Sólido (Cheio)
            buttonElement.setAttribute('aria-label', 'Remover dos Favoritos');
        } else {
            buttonElement.classList.remove('favorited');
            buttonElement.innerHTML = '<i class="far fa-heart"></i>'; // Coração Contorno (Vazio)
            buttonElement.setAttribute('aria-label', 'Adicionar aos Favoritos');
        }
    }

    // --- Carregar Passeios em Destaque da API ---
    const featuredToursTrack = document.getElementById('featuredToursTrack');
    const tourCardPlaceholder = document.querySelector('.passeio-card-placeholder');

    async function loadFeaturedTours() {
        if (!featuredToursTrack || !tourCardPlaceholder) {
            console.error("Elementos do carrossel de destaques não encontrados.");
            return;
        }

        featuredToursTrack.innerHTML = '<p style="text-align:center; width:100%; padding: 2rem;">Carregando destaques...</p>'; // Indicador de carregamento

        try {
            const response = await fetch(`${API_BASE_URL}/api/passeios`); // Busca todos os passeios
            if (!response.ok) {
                throw new Error(`Erro ${response.status} ao buscar passeios.`);
            }
            let allTours = await response.json();

            // Seleciona os destaques (ex: os 5 mais bem avaliados ou com mais reviews)
            const featured = allTours
                .sort((a, b) => (b.rating || 0) - (a.rating || 0)) // Ordena por rating (já calculado pela API)
                .slice(0, 5); // Pega os 5 primeiros

            featuredToursTrack.innerHTML = ''; // Limpa o "Carregando..."

            if (featured.length === 0) {
                featuredToursTrack.innerHTML = '<p style="text-align:center; width:100%; padding: 2rem;">Nenhum passeio em destaque no momento.</p>';
                return;
            }

            featured.forEach(tour => {
                const cardClone = tourCardPlaceholder.cloneNode(true); // Clona o placeholder
                cardClone.classList.remove('passeio-card-placeholder');
                cardClone.classList.add('passeio-card', 'card-zoom'); // Adiciona classes reais
                cardClone.style.display = ''; // Garante visibilidade

                const imageUrl = resolveMediaUrl(tour.imagem_principal_url);
                cardClone.querySelector('.card-image').style.backgroundImage = `url('${imageUrl}')`;

                const badgeElement = cardClone.querySelector('.card-badge');
                if (tour.categoria?.nome) { // Usa nome da categoria como badge
                    badgeElement.textContent = tour.categoria.nome;
                    badgeElement.style.display = ''; // Garante visibilidade do badge
                } else {
                    badgeElement.style.display = 'none'; // Esconde se não houver categoria
                }

                cardClone.querySelector('h3').textContent = tour.titulo; // Usa 'titulo' da API

                const starsDiv = cardClone.querySelector('.stars');
                const rating = tour.rating || 0;
                const reviews = tour.reviews || 0;
                starsDiv.style.setProperty('--rating', rating); // Define a variável CSS
                starsDiv.setAttribute('aria-label', `Avaliação de ${rating.toFixed(1)} de 5 estrelas`);

                cardClone.querySelector('.rating-text').textContent = `${rating.toFixed(1)} (${reviews})`;
                cardClone.querySelector('.card-description').textContent = tour.descricao_curta; // Usa 'descricao_curta'
                cardClone.querySelector('.card-price').textContent = `R$ ${parseFloat(tour.preco).toFixed(2).replace('.', ',')}`; // Usa 'preco'
                cardClone.querySelector('.card-footer a').href = `passeio.html?id=${tour.id}`; // Link correto

                // Lógica de Favoritos
                const favButton = cardClone.querySelector('.favorite-btn');
                if (favButton) { // Verifica se o botão existe no placeholder
                    favButton.dataset.tourId = tour.id;
                    updateFavoriteButtonState(favButton, tour.id); // Atualiza estado inicial
                    favButton.addEventListener('click', function(e) {
                        e.preventDefault(); // Impede navegação ao clicar no coração
                        e.stopPropagation(); // Impede clique no card ao clicar no coração
                        toggleFavorite(tour.id, tour.titulo); // Passa o nome para o alert
                        updateFavoriteButtonState(this, tour.id); // Atualiza o botão clicado
                    });
                } else {
                     console.warn("Botão de favorito (.favorite-btn) não encontrado no card placeholder clonado.");
                }

                featuredToursTrack.appendChild(cardClone);
            });

             // --- INICIALIZAÇÃO DO CARROSSEL DE DESTAQUES APÓS CARREGAR OS DADOS ---
             // Garanta que a classe Carousel esteja definida (do carousel.js)
             if (typeof Carousel === 'function' && featured.length > 0) {
                 // Destrói carrossel anterior se existir (para evitar duplicação em HMR ou re-renderizações)
                 if (window.featuredCarouselInstance) {
                     // Adicionar um método destroy na classe Carousel seria ideal
                     // window.featuredCarouselInstance.destroy();
                 }
                 window.featuredCarouselInstance = new Carousel('.passeios-carousel .carousel-container', {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                    infinite: featured.length > 3, // Só faz sentido ser infinito se tiver mais slides que o visível
                    responsive: [
                        { breakpoint: 1024, settings: { slidesToShow: 2, infinite: featured.length > 2 } },
                        { breakpoint: 768, settings: { slidesToShow: 1, infinite: featured.length > 1 } }
                    ]
                });
             }


        } catch (error) {
            console.error('Erro ao carregar passeios em destaque:', error);
            featuredToursTrack.innerHTML = `<p style="text-align:center; width:100%; color: red; padding: 2rem;">Erro ao carregar destaques: ${error.message}</p>`;
        }
    }

    // INICIALIZAÇÃO da Página Home
    updateSidebarUserStatus(); // Atualiza o status do usuário no menu lateral
    loadFeaturedTours(); // Carrega os passeios em destaque da API

    // A inicialização dos outros carrosséis (testemunhos) e animações
    // que já estavam no index.js podem permanecer aqui ou em main.js
    // Exemplo:
     const testimonialsCarousel = new Carousel('.testimonials-carousel', {
         slidesToShow: 2, slidesToScroll: 1, infinite: true,
         responsive: [ { breakpoint: 768, settings: { slidesToShow: 1 } } ]
     });

}); // Fim do DOMContentLoaded