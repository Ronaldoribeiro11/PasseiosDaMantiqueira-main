// js/home-features.js
'use strict';

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
        const userSpecificLinks = [
            document.getElementById('sidebarLinkMeuPerfil'),
            document.getElementById('sidebarLinkCriarPasseio'),
            document.getElementById('sidebarLinkAvaliacoes'),
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
            const response = await fetch('http://localhost:3000/api/perfil', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                // Token válido, usuário logado.
                const user = await response.json();

                if (sidebarProfileImg) {
                    sidebarProfileImg.src = user.avatar_url || 'assets/images/ImagemUsuario.jpg';
                    sidebarProfileImg.style.display = 'block';
                }
                if (sidebarProfileName) sidebarProfileName.textContent = user.nome_completo;
                if (sidebarProfileEmail) sidebarProfileEmail.textContent = user.email;

                // Mostra/esconde links com base no tipo de usuário
                userSpecificLinks.forEach(link => {
                    if (link) {
                        // O link "Criar Passeio" só aparece para o tipo 'guia'
                        if (link.id === 'sidebarLinkCriarPasseio') {
                            link.style.display = user.tipo_de_usuario === 'guia' ? 'block' : 'none';
                        } else {
                            link.style.display = 'block';
                        }
                    }
                });

                // Configura o botão de Logout
                if (sidebarLinkAuth) {
                    sidebarLinkAuth.innerHTML = `<a href="#" id="sidebarLogoutLink"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
                    document.getElementById('sidebarLogoutLink')?.addEventListener('click', (e) => {
                        e.preventDefault();
                        auth.logout(); // A função logout do auth.js já limpa o storage e recarrega a página.
                        window.location.reload(); // Garante que a página será recarregada no estado deslogado.
                    });
                }
            } else {
                // Token inválido ou expirado.
                auth.logout();
                showLoggedOutState();
            }
        } catch (error) {
            console.error('Erro ao verificar o status do usuário:', error);
            showLoggedOutState(); // Em caso de erro de rede, assume que está deslogado.
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
    
    // --- ATENÇÃO ---
    // A lógica de carregar passeios e favoritos abaixo ainda usa o sistema antigo.
    // O próximo passo do seu projeto será refatorar essas seções para também
    // buscarem os dados da sua API (back-end), em vez do localStorage.
    // Por enquanto, vamos manter para não quebrar o layout.

    const passeiosManager = new PasseiosManager(); // Dependência do código antigo

    function getFavorites() {
        return JSON.parse(localStorage.getItem('favorite_tours_ids')) || [];
    }
    function isFavorite(tourId) {
        return getFavorites().includes(tourId.toString());
    }
    function toggleFavorite(tourId) {
        let favorites = getFavorites();
        const tourIdStr = tourId.toString();
        const tour = passeiosManager.getPasseioById(tourIdStr);
        const tourName = tour ? tour.title : "este passeio";
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
            buttonElement.innerHTML = '<i class="fas fa-heart"></i>'; 
            buttonElement.setAttribute('aria-label', 'Remover dos Favoritos');
        } else {
            buttonElement.classList.remove('favorited');
            buttonElement.innerHTML = '<i class="far fa-heart"></i>'; 
            buttonElement.setAttribute('aria-label', 'Adicionar aos Favoritos');
        }
    }


    // Carregar Passeios em Destaque (Lógica antiga mantida temporariamente)
    const featuredToursTrack = document.getElementById('featuredToursTrack');
    const tourCardTemplate = document.querySelector('.passeio-card-placeholder');

    function loadFeaturedTours() {
        if (!featuredToursTrack || !tourCardTemplate) return;
        const allTours = passeiosManager.getAllPasseios();
        const featured = allTours.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
        featuredToursTrack.innerHTML = '';
        if (featured.length === 0) {
            featuredToursTrack.innerHTML = '<p style="text-align:center; width:100%;">Nenhum passeio em destaque no momento.</p>';
            return;
        }
        featured.forEach(tour => {
            const cardClone = tourCardTemplate.cloneNode(true);
            cardClone.classList.remove('passeio-card-placeholder');
            cardClone.classList.add('passeio-card', 'card-zoom');
            cardClone.style.display = '';
            cardClone.querySelector('.card-image').style.backgroundImage = `url('assets/images/${tour.mainImage || 'ImagemDefaultPasseio.jpg'}')`;
            if (tour.badge) {
                cardClone.querySelector('.card-badge').textContent = tour.badge;
            } else {
                cardClone.querySelector('.card-badge').style.display = 'none';
            }
            cardClone.querySelector('h3').textContent = tour.title;
            const starsDiv = cardClone.querySelector('.stars');
            starsDiv.dataset.rating = tour.rating || 0;
            const starPercentage = ((tour.rating || 0) / 5) * 100;
            starsDiv.querySelector('span').style.width = `${starPercentage}%`;
            cardClone.querySelector('.rating-text').textContent = `${tour.rating || 'N/A'} (${tour.reviews || 0})`;
            cardClone.querySelector('.card-description').textContent = tour.shortDesc;
            cardClone.querySelector('.card-price').textContent = `R$ ${parseFloat(tour.price).toFixed(2).replace('.', ',')}`;
            cardClone.querySelector('.card-footer a').href = `passeio.html?id=${tour.id}`;
            const favButton = cardClone.querySelector('.favorite-btn');
            favButton.dataset.tourId = tour.id;
            updateFavoriteButtonState(favButton, tour.id);
            favButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(tour.id);
                updateFavoriteButtonState(this, tour.id);
            });
            featuredToursTrack.appendChild(cardClone);
        });
    }

    if (featuredToursTrack) {
        loadFeaturedTours();
    }


    // INICIALIZAÇÃO
    // Primeiro, atualiza o status do usuário no menu.
    updateSidebarUserStatus();
});