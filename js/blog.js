document.addEventListener('DOMContentLoaded', function() {
    const blogPostsContainer = document.getElementById('blogPostsContainer');
    const blogSearchInput = document.getElementById('blogSearchInput');
    const noResultsMessage = document.getElementById('noBlogResultsMessage');
    const categoryLinks = document.querySelectorAll('#blogCategoryList a.category-link');
    const recentPostsList = document.getElementById('blogRecentPosts');
    const tagCloudContainer = document.getElementById('blogTagCloud');
    const archiveSelect = document.getElementById('blogArchiveSelect');
    const paginationContainer = document.querySelector('.blog-pagination');

    // --- DADOS SIMULADOS DO BLOG ---
    // No futuro, isso viria de um CMS ou API
    const allBlogPosts = [
        {
            id: 1,
            title: "Guia Completo: Trilha da Pedra do Baú para Iniciantes e Experientes",
            slug: "guia-trilha-pedra-bau",
            imageUrl: "assets/images/ImagenPasseioTrilhaPedraDoBau.jpeg",
            category: "Trilhas",
            categorySlug: "trilhas",
            date: "2025-05-28",
            author: "Yohan Montanhista",
            excerpt: "A Pedra do Baú é um dos cartões postais da Serra da Mantiqueira. Saiba como se preparar, o que esperar e dicas essenciais para uma aventura segura e inesquecível...",
            content: "Conteúdo completo do post sobre a Pedra do Baú...",
            tags: ["Mantiqueira", "Trilhas", "Aventura", "Pedra do Baú"]
        },
        {
            id: 2,
            title: "Sabores da Montanha: Um Tour Gastronômico Inesquecível por Campos do Jordão",
            slug: "tour-gastronomico-campos-do-jordao",
            imageUrl: "assets/images/ImagemTourGastronomico.jpg",
            category: "Gastronomia Local",
            categorySlug: "gastronomia",
            date: "2025-05-22",
            author: "Ana Gourmet",
            excerpt: "Descubra os restaurantes, chocolaterias e empórios que fazem de Campos do Jordão um destino delicioso. Roteiro com os melhores pontos para degustar...",
            content: "Conteúdo completo do post sobre gastronomia...",
            tags: ["Campos do Jordão", "Gastronomia", "Restaurantes", "Chocolate"]
        },
        {
            id: 3,
            title: "Viajando no Tempo: A História Contada pelo Passeio de Trem na Serra",
            slug: "historia-passeio-trem-serra",
            imageUrl: "assets/images/ImagemPasseioTremPasseiosDaSerra.jpg",
            category: "Cultura e História",
            categorySlug: "cultura",
            date: "2025-05-15",
            author: "Carlos Historiador",
            excerpt: "Embarque numa jornada nostálgica pela antiga ferrovia que serpenteia a Mantiqueira. Conheça a história, as paisagens e o charme do tradicional passeio de trem...",
            content: "Conteúdo completo do post sobre o passeio de trem...",
            tags: ["Passeio de Trem", "História", "Cultura", "Campos do Jordão"]
        },
        {
            id: 4,
            title: "5 Dicas Essenciais para Sua Primeira Viagem à Serra da Mantiqueira",
            slug: "dicas-viagem-mantiqueira",
            imageUrl: "assets/images/ImagemDicasViagem.jpg", // Placeholder image
            category: "Dicas de Viagem",
            categorySlug: "dicas",
            date: "2025-05-10",
            author: "Mariana Viajante",
            excerpt: "Planejando sua aventura na serra? Confira nossas dicas sobre o que levar na mala, melhor época para visitar, como se locomover e muito mais para aproveitar ao máximo...",
            content: "Conteúdo completo do post sobre dicas de viagem...",
            tags: ["Dicas", "Planejamento", "Mantiqueira", "Viagem"]
        },
        // Adicionar mais posts aqui para popular
    ];

    let currentPage = 1;
    const postsPerPage = 6; // Quantidade de posts por página
    let currentFilters = {
        searchTerm: '',
        category: 'all'
    };

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString + 'T00:00:00-03:00').toLocaleDateString('pt-BR', options); // Adiciona fuso para evitar problemas de data
    }

    function renderPostCard(post) {
        // O link para o post individual pode ser algo como `blog-post.html?slug=${post.slug}`
        // Por enquanto, usaremos um exemplo estático.
        const postLink = `blog-post-exemplo.html?id=${post.id}`; // Ou usar o slug
        return `
            <article class="blog-post-card animate-on-scroll" data-animation="fadeInUp" data-category="${post.categorySlug} ${post.tags.join(' ').toLowerCase()}">
                <a href="${postLink}" class="post-card-image-link">
                    <img src="${post.imageUrl}" alt="${post.title}" class="post-card-image">
                </a>
                <div class="post-card-content">
                    <div class="post-card-meta">
                        <span class="post-card-category">${post.category}</span>
                        <span class="post-card-date"><i class="fas fa-calendar-alt"></i> ${formatDate(post.date)}</span>
                    </div>
                    <h2 class="post-card-title"><a href="${postLink}">${post.title}</a></h2>
                    <p class="post-card-excerpt">${post.excerpt}</p>
                    <a href="${postLink}" class="btn btn-outline btn-sm post-card-readmore">Leia Mais <i class="fas fa-arrow-right"></i></a>
                </div>
            </article>
        `;
    }

    function displayPosts(postsToDisplay) {
        if (!blogPostsContainer) return;
        blogPostsContainer.innerHTML = '';
        if (postsToDisplay.length === 0) {
            if (noResultsMessage) noResultsMessage.style.display = 'block';
        } else {
            if (noResultsMessage) noResultsMessage.style.display = 'none';
            postsToDisplay.forEach(post => {
                blogPostsContainer.innerHTML += renderPostCard(post);
            });
        }
    }
    
    function applyFiltersAndPagination() {
        let filteredPosts = allBlogPosts.filter(post => {
            const matchesSearch = currentFilters.searchTerm === '' ||
                                  post.title.toLowerCase().includes(currentFilters.searchTerm) ||
                                  post.excerpt.toLowerCase().includes(currentFilters.searchTerm) ||
                                  post.tags.join(' ').toLowerCase().includes(currentFilters.searchTerm);
            const matchesCategory = currentFilters.category === 'all' || post.categorySlug === currentFilters.category;
            return matchesSearch && matchesCategory;
        });

        // Ordenar por data (mais recente primeiro)
        filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

        displayPosts(paginatedPosts);
        renderPagination(totalPages, filteredPosts.length);

        // Re-disparar animações de scroll para novos itens
        if (typeof animateOnScroll === 'function') { // Verifica se a função global existe
             // Chamar a função animateOnScroll() de main.js pode ser necessário
             // ou inicializar a observação dos novos elementos.
             // Por simplicidade, pode-se apenas forçar a checagem:
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach(element => {
                // Forçar re-avaliação - isso pode não ser o ideal dependendo de como animateOnScroll é implementado
                // Se animateOnScroll usa IntersectionObserver, pode ser necessário re-observar.
                // Para uma solução simples, podemos remover e re-adicionar a classe de animação se estiver visível
                const elementPosition = element.getBoundingClientRect().top;
                const windowHeight = window.innerHeight;
                if (elementPosition < windowHeight - 50) { // 50px de offset
                    const animationType = element.getAttribute('data-animation') || 'fadeInUp';
                    element.style.opacity = '0'; // Reseta para animar novamente
                    setTimeout(() => {
                       element.classList.add(animationType);
                       element.style.opacity = '1';
                    }, parseFloat(element.getAttribute('data-delay') || 0) * 1000 + 50);
                }
            });
        }
    }

    function renderPagination(totalPages) {
        if (!paginationContainer) return;
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }
        paginationContainer.style.display = 'flex';

        // Botão Anterior
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i> Anterior';
        prevButton.classList.add('btn', 'btn-secondary');
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                applyFiltersAndPagination();
            }
        });
        paginationContainer.appendChild(prevButton);

        // Números das Páginas
        const pageNumbersDiv = document.createElement('div');
        pageNumbersDiv.classList.add('page-numbers');
        for (let i = 1; i <= totalPages; i++) {
            // Lógica mais complexa para "..." pode ser adicionada aqui
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            if (i === currentPage) pageButton.classList.add('active');
            pageButton.addEventListener('click', () => {
                currentPage = i;
                applyFiltersAndPagination();
            });
            pageNumbersDiv.appendChild(pageButton);
        }
        paginationContainer.appendChild(pageNumbersDiv);

        // Botão Próxima
        const nextButton = document.createElement('button');
        nextButton.innerHTML = 'Próxima <i class="fas fa-chevron-right"></i>';
        nextButton.classList.add('btn', 'btn-secondary');
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                applyFiltersAndPagination();
            }
        });
        paginationContainer.appendChild(nextButton);
    }


    // --- Sidebar ---
    function populateSidebar() {
        // Posts Recentes (pegar os 5 mais recentes)
        if (recentPostsList) {
            recentPostsList.innerHTML = '';
            const sortedPosts = [...allBlogPosts].sort((a,b) => new Date(b.date) - new Date(a.date));
            sortedPosts.slice(0, 5).forEach(post => {
                recentPostsList.innerHTML += `<li><a href="blog-post-exemplo.html?id=${post.id}">${post.title}</a></li>`;
            });
        }

        // Nuvem de Tags
        if (tagCloudContainer) {
            tagCloudContainer.innerHTML = '';
            const allTags = {};
            allBlogPosts.forEach(post => {
                post.tags.forEach(tag => {
                    allTags[tag] = (allTags[tag] || 0) + 1;
                });
            });
            // Simplesmente listar, a "nuvem" real precisa de mais CSS para tamanhos de fonte
            Object.keys(allTags).sort().forEach(tag => {
                 // Criar link para filtro de tag (não implementado no filter principal ainda)
                tagCloudContainer.innerHTML += `<a href="#" class="tag-link" data-tag-filter="${tag.toLowerCase()}">${tag}</a> `;
            });
        }

        // Arquivo por Mês/Ano
        if (archiveSelect) {
            archiveSelect.innerHTML = '<option value="">Selecione o Mês...</option>';
            const archives = {};
            allBlogPosts.forEach(post => {
                const yearMonth = post.date.substring(0, 7); // "YYYY-MM"
                archives[yearMonth] = (archives[yearMonth] || 0) + 1;
            });
            Object.keys(archives).sort().reverse().forEach(ym => {
                const [year, month] = ym.split('-');
                const dateObj = new Date(year, month -1);
                const monthName = dateObj.toLocaleString('pt-BR', { month: 'long' });
                archiveSelect.innerHTML += `<option value="${ym}">${monthName} de ${year} (${archives[ym]})</option>`;
            });
        }
    }


    // --- Event Listeners ---
    if (blogSearchInput) {
        blogSearchInput.addEventListener('input', function() {
            currentFilters.searchTerm = this.value.toLowerCase().trim();
            currentPage = 1; // Resetar para primeira página ao buscar
            applyFiltersAndPagination();
        });
    }

    categoryLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            currentFilters.category = this.dataset.categoryFilter;
            currentPage = 1; // Resetar para primeira página ao filtrar
            applyFiltersAndPagination();
        });
    });
    
    // Adicionar event listener para a nuvem de tags se for implementar o filtro
    if (tagCloudContainer) {
        tagCloudContainer.addEventListener('click', function(event){
            event.preventDefault();
            const target = event.target;
            if(target.classList.contains('tag-link')){
                const tag = target.dataset.tagFilter;
                // Para um filtro de tag, você pode definir currentFilters.searchTerm para a tag
                // ou adicionar um novo tipo de filtro 'tag'
                if(blogSearchInput) blogSearchInput.value = tag; // Coloca a tag na busca
                currentFilters.searchTerm = tag;
                currentFilters.category = 'all'; // Reseta categoria
                categoryLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('.category-link[data-category-filter="all"]').classList.add('active');

                currentPage = 1;
                applyFiltersAndPagination();
            }
        });
    }

    // --- Inicialização ---
    if (blogPostsContainer) { // Garante que estamos na página do blog
        populateSidebar();
        applyFiltersAndPagination(); // Carga inicial dos posts
    }

    // Lógica do menu lateral global
    const globalMenuToggle = document.querySelector('.page-menu-toggle');
    const globalSidebarMenu = document.getElementById('sidebarMenu');
    const globalMenuOverlay = document.getElementById('menuOverlay');
    const globalCloseMenuBtn = document.getElementById('closeMenuBtn');

    function toggleGlobalSidebarMenu() {
        if (globalSidebarMenu) globalSidebarMenu.classList.toggle('open');
        if (globalMenuOverlay) globalMenuOverlay.classList.toggle('active');
    }

    if (globalMenuToggle) globalMenuToggle.addEventListener('click', toggleGlobalSidebarMenu);
    if (globalMenuOverlay) globalMenuOverlay.addEventListener('click', toggleGlobalSidebarMenu);
    if (globalCloseMenuBtn) globalCloseMenuBtn.addEventListener('click', toggleGlobalSidebarMenu);
});

// --- JS para blog-post-exemplo.html (ou js/blog-post.js) ---
// Este script seria para carregar o conteúdo de um post específico
// com base em um ID/slug na URL. Como os dados do blog são simulados,
// você precisaria de uma função para encontrar o post por ID/slug
// no array `allBlogPosts` (que precisaria ser acessível aqui também,
// talvez movendo-o para um arquivo de dados separado e importando-o).

/* Exemplo de como seria em js/blog-post.js (para a página de post individual)
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id'); // ou 'slug'

    // Supondo que allBlogPosts (do blog.js) esteja acessível globalmente ou importado
    // const postData = allBlogPosts.find(p => p.id.toString() === postId);
    // if (postData) {
    //     document.title = `${postData.title} - Blog Passeios da Serra`;
    //     document.querySelector('.post-title').textContent = postData.title;
    //     document.querySelector('.post-meta-info .post-category-link').textContent = postData.category;
    //     // ... preencher outros campos ...
    //     document.querySelector('.post-body-content').innerHTML = parseMarkdownToHTML(postData.content); // Se o conteúdo for Markdown
    // } else {
    //     // Lidar com post não encontrado
    // }
});
*/