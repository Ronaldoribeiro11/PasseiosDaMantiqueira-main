// js/pesquisa.js
document.addEventListener('DOMContentLoaded', function() {
    const API_BASE_URL = (window.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
    const resultsGrid = document.querySelector('.results-grid');
    const resultsCount = document.getElementById('results-number');
    
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const priceSlider = document.getElementById('price-slider');
    const maxPriceDisplay = document.getElementById('max-price');
    const ratingFilters = document.querySelectorAll('input[name="rating"]');
    const sortSelect = document.getElementById('sort-by');
    const resetFiltersBtn = document.getElementById('reset-filters');
    
    let allTours = [];
    // Adicione no topo do arquivo JS

// Adicione esta função no arquivo JS (se não estiver lá)
function resolveMediaUrl(path) {
    if (!path) {
        // Retorna um placeholder ou null se não houver imagem
        return 'assets/images/placeholder-passeio.jpg'; // Ou ajuste o caminho do seu placeholder
    }

    const normalizedPath = path.replace(/\\/g, '/'); // Normaliza barras invertidas (Windows)
    // Verifica se já é uma URL completa
    if (/^https?:\/\//i.test(normalizedPath)) {
        return normalizedPath;
    }

    // Monta a URL completa usando a base da API e o caminho relativo
    return `${API_BASE_URL}/${normalizedPath.replace(/^\//, '')}`; // Remove barra inicial se houver
}
    

    async function fetchTours() {
        try {
            const response = await fetch('http://localhost:3000/api/passeios');
            if (!response.ok) {
                throw new Error('Não foi possível buscar os passeios do servidor.');
            }
            allTours = await response.json();
            applyFilters(); 
        } catch (error) {
            console.error('Erro:', error);
            if(resultsGrid) resultsGrid.innerHTML = '<p style="text-align:center; width:100%;">Erro ao carregar os passeios. Tente novamente mais tarde.</p>';
        }
    }

    function resolveImageUrl(imagePath) {
        if (!imagePath) {
            return null;
        }

        const normalizedPath = imagePath.replace(/\\/g, '/');
        if (/^https?:\/\//i.test(normalizedPath)) {
            return normalizedPath;
        }

        return `${API_BASE_URL}/${normalizedPath.replace(/^\//, '')}`;
    }

    function createTourCard(tour) {
    const rating = tour.rating || 0; // rating já vem calculado da API
    const reviews = tour.reviews || 0; // reviews já vem calculado da API

    // Usa resolveMediaUrl para obter a URL completa da imagem principal
    const imageUrl = resolveMediaUrl(tour.imagem_principal_url);

    const starStyle = `--rating: ${rating};`; // Para o CSS das estrelas funcionar

    return `
        <div class="passeio-card card-zoom">
            {/* Link para a página de detalhes */}
            <a href="passeio.html?id=${tour.id}" class="card-image" style="background-image: url('${imageUrl}');">
                {/* Exibe o nome da categoria */}
                <span class="card-badge">${tour.categoria?.nome || 'Sem Categoria'}</span>
            </a>
            <div class="card-content">
                <h3><a href="passeio.html?id=${tour.id}">${tour.titulo}</a></h3>
                <div class="card-rating">
                    {/* Estrelas usam a variável CSS --rating */}
                    <div class="stars" style="${starStyle}" aria-label="Avaliação de ${rating} de 5 estrelas"></div>
                    <span class="rating-text">${rating.toFixed(1)} (${reviews})</span>
                </div>
                <p class="card-description">${tour.descricao_curta}</p>
                <div class="card-footer">
                    {/* Formata o preço */}
                    <span class="card-price">R$ ${parseFloat(tour.preco).toFixed(2).replace('.', ',')}</span>
                    <a href="passeio.html?id=${tour.id}" class="btn btn-primary btn-sm">Detalhes</a>
                </div>
            </div>
        </div>
    `;
}
    
    function applyFilters() {
        let filteredTours = [...allTours];

        const selectedCategories = Array.from(categoryFilters)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        if (selectedCategories.length > 0) {
            filteredTours = filteredTours.filter(tour => selectedCategories.includes(tour.categoria.slug));
        }

        const maxPrice = parseFloat(priceSlider.value);
        if (maxPrice < 500) {
             filteredTours = filteredTours.filter(tour => parseFloat(tour.preco) <= maxPrice);
        }

        const minRating = parseFloat(document.querySelector('input[name="rating"]:checked').value);
        if (minRating > 0) {
            filteredTours = filteredTours.filter(tour => (tour.rating || 0) >= minRating);
        }
        
        const sortBy = sortSelect.value;
        switch (sortBy) {
            case 'price-asc':
                filteredTours.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
                break;
            case 'price-desc':
                filteredTours.sort((a, b) => parseFloat(b.preco) - parseFloat(a.preco));
                break;
            case 'rating':
            default: // Trata 'relevance' e qualquer outro caso como default
                filteredTours.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
        }

        renderTours(filteredTours);
    }
    
    function renderTours(tours) {
        if(resultsCount) resultsCount.textContent = tours.length;
        if(resultsGrid) {
            if (tours.length === 0) {
                resultsGrid.innerHTML = `
                    <div class="empty-results" style="display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%; padding: 2rem; grid-column: 1 / -1;">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; color: #ccc;"></i>
                        <h3>Nenhum passeio encontrado</h3>
                        <p>Tente ajustar seus filtros de busca.</p>
                    </div>
                `;
            } else {
                resultsGrid.innerHTML = tours.map(createTourCard).join('');
            }
        }
    }

    categoryFilters.forEach(cb => cb.addEventListener('change', applyFilters));
    ratingFilters.forEach(rb => rb.addEventListener('change', applyFilters));
    sortSelect.addEventListener('change', applyFilters);
    
    priceSlider.addEventListener('input', () => {
        if(maxPriceDisplay) {
            if (priceSlider.value === '500') {
                 maxPriceDisplay.textContent = `R$ 500+`;
            } else {
                 maxPriceDisplay.textContent = `R$ ${priceSlider.value}`;
            }
        }
    });
    priceSlider.addEventListener('change', applyFilters);

    resetFiltersBtn.addEventListener('click', () => {
        categoryFilters.forEach(cb => cb.checked = false);
        priceSlider.value = 500;
        if(maxPriceDisplay) maxPriceDisplay.textContent = `R$ 500+`;
        document.querySelector('input[name="rating"][value="0"]').checked = true;
        sortSelect.value = 'relevance';
        applyFilters();
    });

    fetchTours();
});