// js/home-features.js
document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth(); // Assumindo que Auth está em auth.js e carregado
    const passeiosManager = new PasseiosManager(); // Assumindo que está em passeios.js

    // 1. Lógica da Barra de Busca Hero
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

    // 2. Informações Dinâmicas no Menu Lateral
    const sidebarProfileSection = document.getElementById('sidebarProfileSection');
    const sidebarProfileImg = document.getElementById('sidebarProfileImg');
    const sidebarProfileName = document.getElementById('sidebarProfileName');
    const sidebarProfileEmail = document.getElementById('sidebarProfileEmail');
    
    // Links de navegação que mudam com o status de login
    const sidebarLinkMeuPerfil = document.getElementById('sidebarLinkMeuPerfil');
    const sidebarLinkCriarPasseio = document.getElementById('sidebarLinkCriarPasseio');
    const sidebarLinkAvaliacoes = document.getElementById('sidebarLinkAvaliacoes');
    const sidebarLinkFavoritos = document.getElementById('sidebarLinkFavoritos');
    const sidebarLinkConfiguracoes = document.getElementById('sidebarLinkConfiguracoes');
    const sidebarLinkAuth = document.getElementById('sidebarLinkAuth'); // Para Login/Sair

    // Lista de todos os links que são específicos do usuário logado
    const userSpecificLinks = [
        sidebarLinkMeuPerfil,
        sidebarLinkCriarPasseio,
        sidebarLinkAvaliacoes,
        sidebarLinkFavoritos,
        sidebarLinkConfiguracoes
    ];

    function updateSidebarUserStatus() {
        const currentUser = auth.getCurrentUser();
        if (currentUser) { // Usuário ESTÁ logado
            if (sidebarProfileImg) {
                sidebarProfileImg.src = currentUser.avatarUrl || 'assets/images/ImagemUsuario.jpg'; // Supondo que user tenha avatarUrl
                sidebarProfileImg.style.display = 'block'; // Garante que a imagem seja visível
            }
            if (sidebarProfileName) sidebarProfileName.textContent = currentUser.name;
            if (sidebarProfileEmail) sidebarProfileEmail.textContent = currentUser.email;

            // Mostrar links específicos do usuário
            userSpecificLinks.forEach(link => {
                if (link) {
                    // Tratamento especial para "Criar Passeio" que depende do creatorStatus
                    if (link.id === 'sidebarLinkCriarPasseio') {
                        if (currentUser.creatorStatus === 'verified') {
                            link.style.display = 'block'; // Ou 'list-item' se preferir
                        } else {
                            link.style.display = 'none';
                        }
                    } else {
                        link.style.display = 'block'; // Ou 'list-item'
                    }
                }
            });

            if (sidebarLinkAuth) {
                sidebarLinkAuth.innerHTML = `<a href="#" id="sidebarLogoutLink"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
                const logoutLink = document.getElementById('sidebarLogoutLink');
                if (logoutLink) {
                    logoutLink.addEventListener('click', function(e) {
                        e.preventDefault();
                        auth.logout();
                        updateSidebarUserStatus(); // Atualiza a sidebar para o estado deslogado
                        // Opcional: window.location.reload(); // Recarregar a página pode ser uma boa ideia
                    });
                }
            }
        } else { // Usuário NÃO ESTÁ logado
            if (sidebarProfileImg) {
                sidebarProfileImg.style.display = 'none'; // ESCONDE A IMAGEM
            }
            if (sidebarProfileName) sidebarProfileName.textContent = 'Visitante';
            if (sidebarProfileEmail) sidebarProfileEmail.textContent = 'Faça login ou cadastre-se';

            // Esconder links específicos do usuário
            userSpecificLinks.forEach(link => {
                if (link) link.style.display = 'none';
            });

            if (sidebarLinkAuth) {
                sidebarLinkAuth.innerHTML = `<a href="login.html"><i class="fas fa-sign-in-alt"></i> Login / Cadastro</a>`;
            }
        }
    }

    if (sidebarProfileSection) {
        updateSidebarUserStatus();
    }


    // 3. Carregar Passeios em Destaque Dinamicamente
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
            cardClone.classList.add('passeio-card', 'card-zoom'); // Removido 'animate-on-scroll' daqui, pois o IntersectionObserver abaixo cuidará disso
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
        
        // Adicionar a classe 'animate-on-scroll' aos cards recém-criados para o observer
        featuredToursTrack.querySelectorAll('.passeio-card').forEach(card => {
            card.classList.add('animate-on-scroll');
            card.dataset.animation = "slideUp"; // Ou a animação que você preferir
            // Reiniciar observação para esses novos elementos se o observer já estiver configurado
            if (observer) { // Verifica se observer existe (definido mais abaixo)
                card.style.opacity = 0; // Começa invisível para a animação
                observer.observe(card);
            }
        });
    }
    if (featuredToursTrack) { // Garante que o elemento exista antes de chamar
        loadFeaturedTours();
    }


    // 4. Carregar Últimos Posts do Blog
    const latestBlogPostsContainer = document.getElementById('latestBlogPostsContainer');
    // Garanta que `allBlogPosts` esteja acessível (ex: via js/blog-data.js ou definido globalmente por js/blog.js)
    // Se não, o fallback de dados simulados abaixo será usado.
    const blogPostsData = typeof allBlogPosts !== 'undefined' ? allBlogPosts : [
        {id: 1, title: "Post de Blog Exemplo 1", imageUrl: "assets/images/ImagemBlogBanner.jpg", category: "Dicas", date: "2025-06-01", excerpt: "Um breve resumo do post...", slug: "post-exemplo-1"},
        {id: 2, title: "Aventura na Serra: Melhor Época", imageUrl: "assets/images/ImagemDicasViagem.jpg", category: "Aventura", date: "2025-05-28", excerpt: "Descubra quando visitar para...", slug: "post-exemplo-2"},
        {id: 3, title: "Sabores da Montanha", imageUrl: "assets/images/ImagemTourGastronomico.jpg", category: "Gastronomia", date: "2025-05-20", excerpt: "Delícias que você precisa provar...", slug: "post-exemplo-3"}
    ];

    function loadLatestBlogPosts() {
        if (!latestBlogPostsContainer) return;

        const latestPosts = blogPostsData.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
        latestBlogPostsContainer.innerHTML = '';

        if (latestPosts.length === 0) {
            latestBlogPostsContainer.innerHTML = '<p style="text-align:center; width:100%;">Nenhum post no blog ainda.</p>';
            return;
        }
        
        function formatDateForBlog(dateString) {
            if (!dateString) return '';
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString + 'T00:00:00-03:00').toLocaleDateString('pt-BR', options);
        }

        latestPosts.forEach(post => {
            const postCardHTML = `
                <a href="blog-post-exemplo.html?id=${post.id || post.slug}" class="blog-preview-card animate-on-scroll" data-animation="fadeInUp">
                    <img src="${post.imageUrl || 'assets/images/ImagemDefaultBlog.jpg'}" alt="${post.title}">
                    <div class="blog-preview-content">
                        ${post.category ? `<span class="post-category">${post.category}</span>` : ''}
                        <h4>${post.title}</h4>
                        <p class="post-excerpt">${post.excerpt}</p>
                        <span class="post-date">${formatDateForBlog(post.date)}</span>
                    </div>
                </a>
            `;
            latestBlogPostsContainer.innerHTML += postCardHTML;
        });
         // Adicionar a classe 'animate-on-scroll' aos cards recém-criados para o observer
        latestBlogPostsContainer.querySelectorAll('.blog-preview-card').forEach(card => {
            // card.classList.add('animate-on-scroll'); // Já está no HTML do template
            // card.dataset.animation = "fadeInUp";
            if (observer) {
                card.style.opacity = 0;
                observer.observe(card);
            }
        });
    }
    if (latestBlogPostsContainer) { // Garante que o elemento exista
        loadLatestBlogPosts();
    }

    // 5. Lógica para Favoritar (Simplificada com localStorage)
    function getFavorites() {
        return JSON.parse(localStorage.getItem('favorite_tours_ids')) || [];
    }

    function isFavorite(tourId) {
        return getFavorites().includes(tourId.toString());
    }

    function toggleFavorite(tourId) {
        let favorites = getFavorites();
        const tourIdStr = tourId.toString();
        const tour = passeiosManager.getPasseioById(tourIdStr); // Pega o nome do passeio
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

    // Animações ao rolar (com IntersectionObserver)
    // Esta lógica deve ser global ou garantida que não conflite com js/main.js
    let observer; // Declarar observer no escopo mais amplo do DOMContentLoaded
    const animateOnScrollElements = document.querySelectorAll('.animate-on-scroll');
    
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