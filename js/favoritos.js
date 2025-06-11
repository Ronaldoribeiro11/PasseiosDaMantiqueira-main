document.addEventListener('DOMContentLoaded', function() {
    const favoritesGrid = document.getElementById('favorites-grid');
    const emptyState = document.getElementById('empty-favorites-state');

    // Supondo que você tenha a classe 'PasseiosManager' disponível de passeios.js
    // Se não for uma classe, adapte para a forma como você acessa os dados dos passeios.
    const passeiosManager = new PasseiosManager();
    const allTours = passeiosManager.getAllPasseios();

    function getFavoriteIDs() {
        // Pega os IDs dos favoritos do localStorage. Assume que é um array de strings.
        return JSON.parse(localStorage.getItem('favorite_tours')) || [];
    }

    function saveFavoriteIDs(favoriteIDs) {
        localStorage.setItem('favorite_tours', JSON.stringify(favoriteIDs));
    }

    function renderFavorites(favoriteTours) {
        // Limpa o grid antes de adicionar novos elementos
        favoritesGrid.innerHTML = '';

        if (favoriteTours.length === 0) {
            favoritesGrid.style.display = 'none';
            emptyState.style.display = 'flex'; // Usar flex por causa do nosso CSS
        } else {
            favoritesGrid.style.display = 'grid'; // Ou o display original do seu .results-grid
            emptyState.style.display = 'none';

            favoriteTours.forEach(tour => {
                const tourCardHTML = `
                    <div class="passeio-card card-zoom">
                        <div class="card-image" style="background-image: url('${tour.imagem_principal}');">
                            ${tour.badge ? `<span class="card-badge">${tour.badge}</span>` : ''}
                            <button class="btn-remove-favorite" data-tour-id="${tour.id}" aria-label="Remover dos Favoritos">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="card-content">
                            <h3>${tour.nome}</h3>
                            <div class="card-rating">
                                <div class="stars" style="--rating: ${tour.avaliacao_media};" aria-label="Avaliação de ${tour.avaliacao_media} de 5 estrelas"></div>
                                <span class="rating-text">${tour.avaliacao_media} (${tour.numero_avaliacoes})</span>
                            </div>
                            <p class="card-description">${tour.descricao_curta}</p>
                            <div class="card-footer">
                                <span class="card-price">R$ ${parseFloat(tour.preco).toFixed(2).replace('.', ',')}</span>
                                <a href="passeio.html?id=${tour.id}" class="btn btn-primary btn-sm">Ver Detalhes</a>
                            </div>
                        </div>
                    </div>
                `;
                favoritesGrid.innerHTML += tourCardHTML;
            });
        }
    }

    function loadAndDisplayFavorites() {
        const favoriteIDs = getFavoriteIDs();
        // Filtra a lista completa de passeios para encontrar apenas os favoritos
        const favoriteTours = allTours.filter(tour => favoriteIDs.includes(tour.id.toString()));
        renderFavorites(favoriteTours);
    }

    function removeFromFavorites(tourId) {
        let favoriteIDs = getFavoriteIDs();
        // Filtra o array, removendo o ID do passeio
        const updatedFavorites = favoriteIDs.filter(id => id !== tourId.toString());
        saveFavoriteIDs(updatedFavorites);
        // Recarrega e exibe a lista atualizada
        loadAndDisplayFavorites();
    }

    // Usando delegação de eventos para os botões de remover
    favoritesGrid.addEventListener('click', function(event) {
        const removeButton = event.target.closest('.btn-remove-favorite');
        if (removeButton) {
            const tourId = removeButton.dataset.tourId;
            if (confirm(`Tem certeza de que deseja remover este passeio dos seus favoritos?`)) {
                removeFromFavorites(tourId);
            }
        }
    });


    // --- Inicialização da Página ---
    // Verifica se os elementos necessários existem antes de rodar
    if (favoritesGrid && emptyState) {
        loadAndDisplayFavorites();
    }

    // Adaptação para o rating de estrelas (se esta lógica não for global em main.js)
    // Se o seu CSS usa a variável --rating, este JS não é necessário. Se usa outro método, adicione-o aqui.
    // Exemplo:
    document.querySelectorAll('.stars').forEach(starElement => {
        const rating = parseFloat(starElement.getAttribute('aria-label').match(/(\d\.\d|\d)/)[0]);
        starElement.style.setProperty('--rating', rating);
    });

});