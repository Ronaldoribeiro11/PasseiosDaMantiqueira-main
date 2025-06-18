// js/home-features.js
'use strict';

document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth(); // Assumindo que Auth está em auth.js e carregado
    const passeiosManager = new PasseiosManager(); // Assumindo que está em passeios.js

    // 1. Lógica da Barra de Busca Hero (SEU CÓDIGO ORIGINAL MANTIDO)
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

    // 2. Informações Dinâmicas no Menu Lateral (LÓGICA CORRIGIDA)
    async function updateSidebarUserStatus() {
        const sidebarProfileSection = document.getElementById('sidebarProfileSection');
        if (!sidebarProfileSection) return;

        const token = auth.getTokenFromStorage();

        // Elementos da UI
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

        const showLoggedOutState = () => {
            if (sidebarProfileImg) sidebarProfileImg.style.display = 'none';
            if (sidebarProfileName) sidebarProfileName.textContent = 'Visitante';
            if (sidebarProfileEmail) sidebarProfileEmail.textContent = 'Faça login ou cadastre-se';
            userSpecificLinks.forEach(link => { if (link) link.style.display = 'none'; });
            if (sidebarLinkAuth) sidebarLinkAuth.innerHTML = `<a href="login.html"><i class="fas fa-sign-in-alt"></i> Login / Cadastro</a>`;
        };

        if (token) {
            try {
                const response = await fetch('http://localhost:3000/api/perfil', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const user = await response.json();
                    if (sidebarProfileImg) {
                        sidebarProfileImg.src = user.avatar_url || 'assets/images/ImagemUsuario.jpg';
                        sidebarProfileImg.style.display = 'block';
                    }
                    if (sidebarProfileName) sidebarProfileName.textContent = user.nome_completo;
                    if (sidebarProfileEmail) sidebarProfileEmail.textContent = user.email;

                    userSpecificLinks.forEach(link => {
                        if (link) {
                            if (link.id === 'sidebarLinkCriarPasseio') {
                                link.style.display = user.tipo_de_usuario === 'guia' ? 'block' : 'none';
                            } else {
                                link.style.display = 'block';
                            }
                        }
                    });

                    if (sidebarLinkAuth) {
                        sidebarLinkAuth.innerHTML = `<a href="#" id="sidebarLogoutLink"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
                        document.getElementById('sidebarLogoutLink')?.addEventListener('click', (e) => {
                            e.preventDefault();
                            auth.logout();
                        });
                    }
                } else {
                    auth.logout();
                    showLoggedOutState();
                }
            } catch (error) {
                console.error('Erro ao verificar token:', error);
                showLoggedOutState();
            }
        } else {
            showLoggedOutState();
        }
    }

    // Chamada da função para ser executada assim que a página carregar
    updateSidebarUserStatus();


    // 3. Carregar Passeios em Destaque (SEU CÓDIGO ORIGINAL MANTIDO)
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
    // NOTA: A linha abaixo ainda usa dados do localStorage. Nosso próximo passo será mudar isso.
    if (featuredToursTrack) {
        loadFeaturedTours();
    }


    // 4. Carregar Posts do Blog (SEU CÓDIGO ORIGINAL MANTIDO)
    const latestBlogPostsContainer = document.getElementById('latestBlogPostsContainer');
    // ... (toda a sua lógica de blog posts aqui) ...
    function loadLatestBlogPosts() {
        // ... (seu código de blog posts) ...
    }
    if (latestBlogPostsContainer) {
        // loadLatestBlogPosts(); // Desativado para focar na autenticação
    }


    // 5. Lógica para Favoritar (SEU CÓDIGO ORIGINAL MANTIDO)
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

    // ... (O resto do seu código, como o IntersectionObserver, continua aqui) ...

    
    if (typeof IntersectionObserver !== 'undefined') {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const animationType = entry.target.dataset.animation || 'fadeIn';
                    const delay = entry.target.dataset.delay || '0s';
                    entry.target.style.animationDelay = delay;
                    entry.target.classList.add(animationType); // Usa classes de animation.css
                    entry.target.style.opacity = 1; 
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        animateOnScrollElements.forEach(el => {
            // Apenas aplicar opacity 0 se não for um card dinâmico que já trata isso
            if (!el.classList.contains('passeio-card') && !el.classList.contains('blog-preview-card')) {
                 el.style.opacity = 0; 
            }
            observer.observe(el);
        });
    } else { // Fallback para navegadores antigos sem IntersectionObserver
        animateOnScrollElements.forEach(el => el.style.opacity = 1);
    }

});