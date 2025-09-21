// Classe para gerenciar passeios
class PasseiosManager {
    constructor() {
        this.passeios = JSON.parse(localStorage.getItem('passeios-da-serra-passeios')) || [];
        this.loadSampleData();
    }

    // Carregar dados de exemplo se não houver passeios cadastrados
    loadSampleData() {
        if (this.passeios.length === 0) {
            this.passeios = [
                {
                    id: '1',
                    title: 'Trilha da Pedra do Baú',
                    category: 'aventura',
                    location: 'São Bento do Sapucaí, SP',
                    shortDesc: 'Uma aventura incrível pela famosa formação rochosa de São Bento do Sapucaí.',
                    longDesc: 'A Trilha da Pedra do Baú é uma das aventuras mais emocionantes da região de Campos do Jordão. Localizada em São Bento do Sapucaí, esta formação rochosa impressionante oferece vistas panorâmicas deslumbrantes e uma experiência inesquecível para os amantes da natureza e do ecoturismo.',
                    duration: 8,
                    difficulty: 'moderado',
                    includedItems: ['equipamentos'],
                    requirements: 'Levar água, lanche leve e usar calçado adequado para trilha.',
                    price: 120,
                    maxParticipants: 12,
                    dates: ['2025-10-15', '2025-10-22', '2025-10-29'],
                    cancelationPolicy: 'moderada',
                    mainImage: 'assets/images/ImagenPasseioTrilhaPedraDoBau.jpeg',
                    galleryImages: ['assets/images/ImagemTrilha1.jpeg', 'assets/images/ImagemTrilha2.jpg', 'assets/images/ImagemTrilha3.jpg'],
                    rating: 4.5,
                    reviews: 128,
                    creatorId: '101'
                },
                {
                    id: '2',
                    title: 'Tour Gastronômico',
                    category: 'gastronomia',
                    location: 'Campos do Jordão, SP',
                    shortDesc: 'Descubra os sabores da serra em um tour pelos melhores restaurantes e chocolatiers.',
                    longDesc: 'Este tour gastronômico leva você pelos melhores estabelecimentos de Campos do Jordão, conhecendo a rica culinária da região. Inclui degustações em chocolatiers tradicionais, restaurantes típicos e vinícolas locais, com explicações sobre a história e preparo de cada iguaria.',
                    duration: 4,
                    difficulty: 'facil',
                    includedItems: ['refeicoes', 'bebidas'],
                    requirements: 'Trazer roupa confortável e avisar sobre restrições alimentares.',
                    price: 180,
                    maxParticipants: 8,
                    dates: ['2025-10-20', '2025-10-27'],
                    cancelationPolicy: 'flexivel',
                    mainImage: 'assets/images/ImagemTourGastronomico.jpg',
                    galleryImages: [],
                    rating: 5,
                    reviews: 87,
                    creatorId: '102'
                },
                {
                    id: '3',
                    title: 'Passeio de Trem',
                    category: 'cultural',
                    location: 'Campos do Jordão, SP',
                    shortDesc: 'Uma viagem encantadora pela história e paisagens de Campos do Jordão.',
                    longDesc: 'O passeio de trem é uma das experiências mais tradicionais de Campos do Jordão. A bordo de uma locomotiva histórica, você percorrerá paisagens deslumbrantes enquanto conhece a história da região e da ferrovia. Ideal para famílias e amantes de história.',
                    duration: 3,
                    difficulty: 'facil',
                    includedItems: ['transport'],
                    requirements: 'Chegar com 30 minutos de antecedência no ponto de encontro.',
                    price: 90,
                    maxParticipants: 20,
                    dates: ['2025-10-18', '2025-10-25'],
                    cancelationPolicy: 'rigorosa',
                    mainImage: 'assets/images/ImagemPasseioTremPasseiosDaSerra.jpg',
                    galleryImages: [],
                    rating: 4.8,
                    reviews: 215,
                    creatorId: '103'
                }
            ];

            this.savePasseios();
        }
    }

    // Salvar passeios no localStorage
    savePasseios() {
        localStorage.setItem('passeios-da-serra-passeios', JSON.stringify(this.passeios));
    }

    // Obter todos os passeios
    getAllPasseios() {
        return this.passeios;
    }

    // Obter passeio por ID
    getPasseioById(id) {
        return this.passeios.find(passeio => passeio.id === id);
    }

    // Obter passeios por categoria
    getPasseiosByCategory(category) {
        return this.passeios.filter(passeio => passeio.category === category);
    }

    // Obter passeios criados por um usuário
    getPasseiosByUser(userId) {
        return this.passeios.filter(passeio => passeio.creatorId === userId);
    }

    // Adicionar novo passeio
    addPasseio(passeioData) {
        const newPasseio = {
            id: Date.now().toString(),
            rating: 0,
            reviews: 0,
            ...passeioData
        };

        this.passeios.push(newPasseio);
        this.savePasseios();
        return newPasseio;
    }

    // Atualizar passeio existente
    updatePasseio(id, updatedData) {
        const passeioIndex = this.passeios.findIndex(passeio => passeio.id === id);

        if (passeioIndex !== -1) {
            this.passeios[passeioIndex] = {
                ...this.passeios[passeioIndex],
                ...updatedData
            };

            this.savePasseios();
            return this.passeios[passeioIndex];
        }

        return null;
    }

    // Remover passeio
    removePasseio(id) {
        this.passeios = this.passeios.filter(passeio => passeio.id !== id);
        this.savePasseios();
    }

    // Adicionar avaliação a um passeio
    addReview(passeioId, reviewData) {
        const passeio = this.getPasseioById(passeioId);

        if (passeio) {
            // Simular cálculo da nova avaliação
            const newRating = ((passeio.rating * passeio.reviews) + reviewData.rating) / (passeio.reviews + 1);

            passeio.rating = parseFloat(newRating.toFixed(1));
            passeio.reviews += 1;

            this.savePasseios();
            return passeio;
        }

        return null;
    }

    // Filtrar passeios
    filterPasseios(filters) {
        return this.passeios.filter(passeio => {
            // Filtrar por categoria
            if (filters.category && filters.category.length > 0 && !filters.category.includes(passeio.category)) {
                return false;
            }

            // Filtrar por preço máximo
            if (filters.maxPrice && passeio.price > filters.maxPrice) {
                return false;
            }

            // Filtrar por avaliação mínima
            if (filters.minRating && passeio.rating < filters.minRating) {
                return false;
            }

            // Filtrar por data
            if (filters.date) {
                const hasDate = passeio.dates.some(d => d === filters.date);
                if (!hasDate) return false;
            }

            return true;
        });
    }

    // Ordenar passeios
    sortPasseios(passeios, sortBy) {
        const sorted = [...passeios];

        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                sorted.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'date':
                sorted.sort((a, b) => new Date(a.dates[0]) - new Date(b.dates[0]));
                break;
            default: // 'relevance' ou padrão
                // Poderia usar algum algoritmo de relevância mais complexo
                sorted.sort((a, b) => b.rating - a.rating);
        }

        return sorted;
    }
}

// Inicializar o gerenciador de passeios
const passeiosManager = new PasseiosManager();

// Carregar passeios na página de pesquisa
function loadPasseios() {
    const passeiosContainer = document.querySelector('.results-grid');
    if (!passeiosContainer) return;

    // Obter filtros da URL ou usar padrões
    const urlParams = new URLSearchParams(window.location.search);
    const filters = {
        category: urlParams.getAll('category'), // Usar getAll para múltiplas categorias
        maxPrice: urlParams.get('maxPrice') || 500,
        minRating: urlParams.get('minRating') || 0,
        date: urlParams.get('date')
    };

    const sortBy = urlParams.get('sort') || 'relevance';

    // Filtrar e ordenar passeios
    let passeios = passeiosManager.filterPasseios(filters);
    passeios = passeiosManager.sortPasseios(passeios, sortBy);

    // Atualizar contador de resultados
    const resultsCount = document.getElementById('results-number');
    if (resultsCount) {
        resultsCount.textContent = passeios.length;
    }

    // Limpar resultados anteriores
    passeiosContainer.innerHTML = '';

    // Adicionar passeios filtrados
    if (passeios.length === 0) {
        passeiosContainer.innerHTML = `
            <div class="empty-results">
                <i class="fas fa-search"></i>
                <h3>Nenhum passeio encontrado</h3>
                <p>Tente ajustar seus filtros de busca</p>
                <button class="btn btn-secondary" id="reset-filters-btn">Limpar Filtros</button>
            </div>
        `;

        document.getElementById('reset-filters-btn').addEventListener('click', function() {
            window.location.href = 'pesquisa.html';
        });
    } else {
        passeios.forEach(passeio => {
            const passeioCard = document.createElement('div');
            passeioCard.className = 'passeio-card card-zoom animate-on-scroll';
            passeioCard.setAttribute('data-animation', 'slideUp');

            // Determinar badge conforme categoria
            let badgeText = '';
            let badgeClass = '';

            switch(passeio.category) {
                case 'aventura':
                    badgeText = 'Aventura';
                    break;
                case 'gastronomia':
                    badgeText = 'Gastronomia';
                    break;
                case 'cultural':
                    badgeText = 'Cultural';
                    break;
                case 'natureza':
                    badgeText = 'Natureza';
                    break;
                case 'familia':
                    badgeText = 'Família';
                    break;
            }

            passeioCard.innerHTML = `
                <div class="card-image" style="background-image: url('${passeio.mainImage}')">
                    ${badgeText ? `<span class="card-badge">${badgeText}</span>` : ''}
                </div>
                <div class="card-content">
                    <h3>${passeio.title}</h3>
                    <div class="card-rating">
                        <div class="stars" data-rating="${passeio.rating}">
                            <span>★★★★★</span>
                        </div>
                        <span class="rating-text">${passeio.rating} (${passeio.reviews})</span>
                    </div>
                    <p class="card-description">${passeio.shortDesc}</p>
                    <div class="card-meta">
                        <span><i class="fas fa-clock"></i> ${passeio.duration}h</span>
                        <span><i class="fas fa-users"></i> ${passeio.maxParticipants} pessoas</span>
                    </div>
                    <div class="card-footer">
                        <span class="card-price">R$ ${passeio.price.toFixed(2)}</span>
                        <a href="passeio.html?id=${passeio.id}" class="btn btn-primary btn-sm">Detalhes</a>
                    </div>
                </div>
            `;

            passeiosContainer.appendChild(passeioCard);
        });
    }

    // Atualizar estrelas de avaliação
    updateStarsRating();
}

// Atualizar visualização das estrelas de avaliação
function updateStarsRating() {
    document.querySelectorAll('.stars').forEach(starContainer => {
        const rating = parseFloat(starContainer.getAttribute('data-rating'));
        const stars = starContainer.querySelector('span');
        const starPercentage = (rating / 5) * 100;

        stars.style.width = `${starPercentage}%`;
    });
}

// Carregar detalhes de um passeio específico
function loadPasseioDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const passeioId = urlParams.get('id');

    if (!passeioId) return;

    const passeio = passeiosManager.getPasseioById(passeioId);
    if (!passeio) {
        // Passeio não encontrado, redirecionar ou mostrar mensagem
        window.location.href = 'pesquisa.html';
        return;
    }

    // Preencher os dados do passeio na página
    document.title = `${passeio.title} - Passeios da Serra`;

    // Hero section
    const heroSection = document.querySelector('.passeio-hero');
    if (heroSection) {
        heroSection.querySelector('.hero-image').style.backgroundImage = `url('${passeio.mainImage}')`;
        heroSection.querySelector('h1').textContent = passeio.title;

        const ratingElement = heroSection.querySelector('.rating');
        ratingElement.querySelector('.stars').setAttribute('data-rating', passeio.rating);
        ratingElement.querySelector('.rating-text').textContent = `${passeio.rating} (${passeio.reviews} avaliações)`;

        heroSection.querySelector('.location span').textContent = passeio.location;
    }

    // Sobre o passeio
    const aboutSection = document.querySelector('.passeio-section');
    if (aboutSection) {
        aboutSection.querySelector('p').textContent = passeio.longDesc;

        // Destaques podem ser extraídos de partes específicas da descrição ou adicionados como campo separado
    }

    // Galeria de imagens
    const gallerySection = document.querySelector('.passeio-gallery');
    if (gallerySection && passeio.galleryImages) {
        gallerySection.innerHTML = '';

        passeio.galleryImages.forEach(image => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.style.backgroundImage = `url('${image}')`;
            gallerySection.appendChild(galleryItem);
        });
    }

    // Informações detalhadas
    const infoGrid = document.querySelector('.info-grid');
    if (infoGrid) {
        infoGrid.innerHTML = `
            <div class="info-item">
                <i class="fas fa-clock"></i>
                <div>
                    <h4>Duração</h4>
                    <p>${passeio.duration} horas</p>
                </div>
            </div>

            <div class="info-item">
                <i class="fas fa-users"></i>
                <div>
                    <h4>Tamanho do Grupo</h4>
                    <p>Máximo de ${passeio.maxParticipants} pessoas</p>
                </div>
            </div>

            <div class="info-item">
                <i class="fas fa-language"></i>
                <div>
                    <h4>Idiomas</h4>
                    <p>Português</p>
                </div>
            </div>

            <div class="info-item">
                <i class="fas fa-utensils"></i>
                <div>
                    <h4>Refeições</h4>
                    <p>${passeio.includedItems.includes('refeicoes') ? 'Incluídas' : 'Não incluídas'}</p>
                </div>
            </div>

            <div class="info-item">
                <i class="fas fa-briefcase-medical"></i>
                <div>
                    <h4>Segurança</h4>
                    <p>${passeio.category === 'aventura' ? 'Equipamentos certificados e guias treinados' : 'Guias treinados'}</p>
                </div>
            </div>

            <div class="info-item">
                <i class="fas fa-child"></i>
                <div>
                    <h4>Requisitos</h4>
                    <p>${passeio.requirements || 'Nenhum requisito específico'}</p>
                </div>
            </div>
        `;
    }

    // Card de reserva
    const bookingCard = document.querySelector('.booking-card');
    if (bookingCard) {
        bookingCard.querySelector('.price').textContent = `R$ ${passeio.price.toFixed(2)}`;

        const datesSelect = bookingCard.querySelector('#booking-date');
        datesSelect.innerHTML = '<option value="">Selecione uma data</option>';

        passeio.dates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = formatDate(date);
            datesSelect.appendChild(option);
        });
    }

    // Atualizar estrelas de avaliação
    updateStarsRating();
}

// Função auxiliar para formatar data
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

// Carregar passeios do usuário no perfil
function loadUserPasseios(userId) {
    const passeios = passeiosManager.getPasseiosByUser(userId);
    const passeiosContainer = document.querySelector('.tab-content[data-tab="created"]');

    if (!passeiosContainer) return;

    // Limpar conteúdo existente
    passeiosContainer.innerHTML = '';

    if (passeios.length === 0) {
        passeiosContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-plus-circle"></i>
                <p>Você ainda não criou nenhum passeio</p>
                <a href="criar-passeio.html" class="btn btn-primary">Criar Passeio</a>
            </div>
        `;
    } else {
        passeios.forEach(passeio => {
            const passeioItem = document.createElement('div');
            passeioItem.className = 'passeio-item';

            passeioItem.innerHTML = `
                <div class="passeio-image">
                    <img src="${passeio.mainImage}" alt="${passeio.title}">
                </div>
                <div class="passeio-details">
                    <h3>${passeio.title}</h3>
                    <div class="passeio-meta">
                        <span><i class="fas fa-calendar-alt"></i> ${formatDate(passeio.dates[0])}</span>
                        <span><i class="fas fa-users"></i> ${passeio.maxParticipants} participantes</span>
                        <span class="status active"><i class="fas fa-check-circle"></i> Ativo</span>
                    </div>
                    <div class="passeio-actions">
                        <button class="btn btn-sm btn-secondary">Editar</button>
                        <button class="btn btn-sm btn-outline">Ver Detalhes</button>
                    </div>
                </div>
            `;

            passeiosContainer.appendChild(passeioItem);
        });
    }
}

// Inicializar funcionalidades quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Carregar passeios na página de pesquisa
    if (document.querySelector('.search-results')) {
        loadPasseios();
    }

    // Carregar detalhes do passeio na página individual
    if (document.querySelector('.passeio-detail')) {
        loadPasseioDetails();
    }

    // Carregar passeios do usuário no perfil
    const auth = new Auth();
    const currentUser = auth.getCurrentUser();

    if (currentUser && document.querySelector('.profile-content')) {
        loadUserPasseios(currentUser.id);
    }

    // Configurar filtros na página de pesquisa
    const filterForm = document.querySelector('.search-filters');
    if (filterForm) {
        filterForm.addEventListener('change', function() {
            // Aqui você pode implementar a filtragem em tempo real
            // ou apenas atualizar os parâmetros da URL para quando o usuário
            // clicar em "Aplicar Filtros"
        });
    }

    // Configurar ordenação na página de pesquisa
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const url = new URL(window.location.href);
            url.searchParams.set('sort', this.value);
            window.location.href = url.toString();
        });
    }
});