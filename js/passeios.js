// Classe para gerenciar passeios
class PasseiosManager {
    constructor() {
        // Tenta buscar da API primeiro, se falhar (ou para offline), usa localStorage
        this.passeios = []; // Inicializa vazio
        this._initializePasseios(); // Chama a função para carregar
    }

    // Função interna para carregar os passeios (assíncrona)
    async _initializePasseios() {
        try {
            // Define a API_BASE_URL aqui também, ou garanta que seja global
            const API_BASE_URL = (window.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
            const response = await fetch(`${API_BASE_URL}/api/passeios`);
            if (!response.ok) {
                console.warn('API indisponível ou erro ao buscar passeios, tentando localStorage.');
                throw new Error('API fetch failed'); // Força o catch a usar localStorage
            }
            this.passeios = await response.json();
            console.log("Passeios carregados da API em PasseiosManager.");
            // Opcional: Salvar no localStorage como cache para offline?
            // localStorage.setItem('passeios-da-serra-passeios', JSON.stringify(this.passeios));
        } catch (error) {
            console.error("Erro ao buscar passeios da API:", error);
            this.passeios = JSON.parse(localStorage.getItem('passeios-da-serra-passeios')) || [];
            if (this.passeios.length === 0) {
                 console.log("Carregando dados de exemplo (localStorage vazio e API falhou).");
                 this.loadSampleData(); // Carrega exemplos apenas se API falhar E localStorage vazio
            } else {
                 console.log("Passeios carregados do localStorage (fallback).");
            }
        }
        // Dispara um evento para indicar que os passeios foram carregados (útil para outras partes do código)
        document.dispatchEvent(new Event('passeiosManagerReady'));
    }


    // Carregar dados de exemplo se necessário (mantido como fallback)
    loadSampleData() {
        // Mantém seus dados de exemplo originais aqui...
        this.passeios = [
             {
                 id: '1', title: 'Trilha da Pedra do Baú', category: 'aventura', categoria: { nome: 'Aventura', slug: 'aventura' }, // Adiciona objeto categoria
                 location: 'São Bento do Sapucaí, SP', localizacao_geral: 'São Bento do Sapucaí, SP',
                 shortDesc: 'Uma aventura incrível pela famosa formação rochosa.', descricao_curta: 'Uma aventura incrível pela famosa formação rochosa.',
                 longDesc: 'Descrição longa...', descricao_longa: 'Descrição longa...',
                 duration: 8, duracao_horas: 8.0, difficulty: 'moderado', dificuldade: 'moderado',
                 includedItems: ['equipamentos'], itens_inclusos: ['equipamentos'],
                 requirements: 'Levar água...', requisitos: 'Levar água...',
                 price: 120, preco: 120.00, maxParticipants: 12, vagas_maximas: 12,
                 dates: ['2025-10-15', '2025-10-22', '2025-10-29'], datas_disponiveis: [/*...*/],
                 cancelationPolicy: 'moderada', politica_cancelamento: 'moderada',
                 mainImage: 'ImagenPasseioTrilhaPedraDoBau.jpeg', imagem_principal_url: 'uploads/pedra_bau_principal.jpeg',
                 galleryImages: ['ImagemTrilha1.jpeg', 'ImagemTrilha2.jpg', 'ImagemTrilha3.jpg'], galeria_imagens_urls: [/*...*/],
                 rating: 4.5, reviews: 128, creatorId: '101', guia: { id: 1 /*...*/ }
             },
             {
                 id: '2', title: 'Tour Gastronômico', category: 'gastronomia', categoria: { nome: 'Gastronomia', slug: 'gastronomia' },
                 location: 'Campos do Jordão, SP', localizacao_geral: 'Campos do Jordão, SP',
                 shortDesc: 'Descubra os sabores da serra...', descricao_curta: 'Descubra os sabores da serra...',
                 longDesc: 'Descrição longa...', descricao_longa: 'Descrição longa...',
                 duration: 4, duracao_horas: 4.0, difficulty: 'facil', dificuldade: 'facil',
                 includedItems: ['refeicoes', 'bebidas'], itens_inclusos: ['refeicoes', 'bebidas'],
                 requirements: 'Avisar restrições...', requisitos: 'Avisar restrições...',
                 price: 180, preco: 180.00, maxParticipants: 8, vagas_maximas: 8,
                 dates: ['2025-10-20', '2025-10-27'], datas_disponiveis: [/*...*/],
                 cancelationPolicy: 'flexivel', politica_cancelamento: 'flexivel',
                 mainImage: 'ImagemTourGastronomico.jpg', imagem_principal_url: 'uploads/tour_gastronomico.jpeg',
                 galleryImages: [], galeria_imagens_urls: [],
                 rating: 5, reviews: 87, creatorId: '102', guia: { id: 1 /*...*/ }
             },
             // ... (resto dos seus dados de exemplo, adicione os campos da API como categoria:{nome, slug}, preco, etc.)
         ];
        this.savePasseiosToLocal(); // Salva no localStorage como fallback
    }

    // Salvar passeios no localStorage (usado como fallback/cache)
    savePasseiosToLocal() {
        localStorage.setItem('passeios-da-serra-passeios', JSON.stringify(this.passeios));
    }

    // Obter todos os passeios (AGORA RETORNA A LISTA INTERNA)
    getAllPasseios() {
        return this.passeios; // Retorna os passeios já carregados (da API ou localStorage)
    }

    // Obter passeio por ID
    getPasseioById(id) {
         // Converte para string para comparação consistente, pois IDs da API podem ser números ou strings (BigInt)
        return this.passeios.find(passeio => passeio.id.toString() === id.toString());
    }

    // Obter passeios por categoria (usando slug da API)
    getPasseiosByCategory(categorySlug) {
        return this.passeios.filter(passeio => passeio.categoria?.slug === categorySlug);
    }

    // Obter passeios criados por um guia (usando guia_id da API)
    getPasseiosByUser(guiaId) {
         // Converte para string para comparação consistente
        return this.passeios.filter(passeio => passeio.guia_id?.toString() === guiaId.toString());
    }

    // Adicionar novo passeio (MANTER, mas idealmente seria feito via API)
    addPasseio(passeioData) {
        // Esta função se torna menos relevante se tudo for via API,
        // mas pode ser útil para testes offline ou se precisar adicionar localmente por algum motivo.
        const newPasseio = {
            id: Date.now().toString(), // Gera ID local
            rating: 0,
            reviews: 0,
            // Mapeia os campos do formulário para os nomes da API
            titulo: passeioData.title,
            categoria: { nome: passeioData.category, slug: passeioData.category }, // Simula objeto categoria
            descricao_curta: passeioData.shortDesc,
            descricao_longa: passeioData.longDesc,
            duracao_horas: parseFloat(passeioData.duration),
            dificuldade: passeioData.difficulty,
            itens_inclusos: passeioData.includedItems || [],
            requisitos: passeioData.requirements,
            preco: parseFloat(passeioData.price),
            vagas_maximas: parseInt(passeioData.maxParticipants),
            datas_disponiveis: passeioData.datesAvailability || [], // Assume que datesAvailability é o array {date, time}
            politica_cancelamento: passeioData.cancelationPolicy,
            imagem_principal_url: passeioData.mainImage ? `uploads/${passeioData.mainImage.name}` : null, // Simula path
            galeria_imagens_urls: passeioData.galleryImages ? passeioData.galleryImages.map(f => `uploads/${f.name}`) : [], // Simula paths
            localizacao_geral: passeioData.locationDetailed?.split(',')[0], // Tenta pegar a primeira parte
            localizacao_detalhada: passeioData.locationDetailed,
            link_Maps: passeioData.mapsLink,
            guia_id: passeioData.creatorId, // Associa ao criador
            // ... outros campos que sua API pode esperar ...
            status: StatusPasseio.rascunho // Exemplo
        };
        this.passeios.push(newPasseio);
        this.savePasseiosToLocal();
        return newPasseio;
    }

    // Atualizar passeio (MANTER, mas idealmente via API)
    updatePasseio(id, updatedData) {
        const passeioIndex = this.passeios.findIndex(p => p.id.toString() === id.toString());
        if (passeioIndex !== -1) {
            // Atualiza o objeto local
            this.passeios[passeioIndex] = { ...this.passeios[passeioIndex], ...updatedData };
            this.savePasseiosToLocal();
            return this.passeios[passeioIndex];
        }
        return null;
    }

    // Remover passeio (MANTER, mas idealmente via API)
    removePasseio(id) {
        this.passeios = this.passeios.filter(p => p.id.toString() !== id.toString());
        this.savePasseiosToLocal();
    }

    // Adicionar avaliação (MANTER, mas idealmente via API)
    addReview(passeioId, reviewData) {
        const passeio = this.getPasseioById(passeioId);
        if (passeio) {
            // Simula cálculo local da média (API já faz isso, então essa lógica local pode ser removida se não for usada)
            const currentTotalRating = (passeio.rating || 0) * (passeio.reviews || 0);
            const newReviewsCount = (passeio.reviews || 0) + 1;
            const newAverageRating = (currentTotalRating + reviewData.nota) / newReviewsCount;

            passeio.rating = parseFloat(newAverageRating.toFixed(1));
            passeio.reviews = newReviewsCount;
            // ATENÇÃO: A API recalcula isso, então a atualização local é mais para UI imediata se necessário.
            this.savePasseiosToLocal(); // Salva a atualização localmente
            return passeio;
        }
        return null;
    }

    // Filtrar passeios (AGORA OPERA SOBRE OS DADOS CARREGADOS INTERNAMENTE)
    filterPasseios(filters) {
        return this.passeios.filter(passeio => {
            // Categoria (usa slug)
            if (filters.category && filters.category.length > 0 && !filters.category.includes(passeio.categoria?.slug)) {
                return false;
            }
            // Preço Máximo
            if (filters.maxPrice && parseFloat(passeio.preco) > parseFloat(filters.maxPrice)) {
                return false;
            }
            // Avaliação Mínima
            if (filters.minRating && (passeio.rating || 0) < parseFloat(filters.minRating)) {
                return false;
            }
            // Data (precisa verificar contra datas_disponiveis[])
            if (filters.date) {
                const targetDate = filters.date; // Espera formato 'YYYY-MM-DD'
                 const hasDate = passeio.datas_disponiveis?.some(d => {
                     try {
                         // Compara apenas a parte da data (YYYY-MM-DD)
                         return d.data_hora_inicio.startsWith(targetDate);
                     } catch (e) { return false; }
                 });
                if (!hasDate) return false;
            }
            // Busca por texto (título, descrição, tags)
             if (filters.query && filters.query.length > 0) {
                 const queryLower = filters.query.toLowerCase();
                 const inTitle = passeio.titulo?.toLowerCase().includes(queryLower);
                 const inShortDesc = passeio.descricao_curta?.toLowerCase().includes(queryLower);
                 const inLongDesc = passeio.descricao_longa?.toLowerCase().includes(queryLower);
                 // const inTags = passeio.tags?.some(t => t.tag?.nome.toLowerCase().includes(queryLower)); // Se API retornar tags aninhadas
                 if (!(inTitle || inShortDesc || inLongDesc /*|| inTags*/)) {
                     return false;
                 }
             }
            return true;
        });
    }

    // Ordenar passeios (AGORA OPERA SOBRE OS DADOS CARREGADOS INTERNAMENTE)
    sortPasseios(passeiosToSort, sortBy) {
        const sorted = [...passeiosToSort]; // Cria cópia para não modificar o original
        switch (sortBy) {
            case 'price-asc':
                sorted.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
                break;
            case 'price-desc':
                sorted.sort((a, b) => parseFloat(b.preco) - parseFloat(a.preco));
                break;
            case 'rating':
                 sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                 break;
            // case 'date': // Ordenar por data inicial é mais complexo com datas_disponiveis[]
            //     sorted.sort((a, b) => {
            //         const dateA = a.datas_disponiveis?.[0]?.data_hora_inicio;
            //         const dateB = b.datas_disponiveis?.[0]?.data_hora_inicio;
            //         if (!dateA) return 1; if (!dateB) return -1;
            //         return new Date(dateA) - new Date(dateB);
            //     });
            //     break;
            default: // 'relevance' (pode ser rating por padrão)
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }
        return sorted;
    }

    // --- FUNÇÃO REMOVIDA ---
    // loadPasseioDetails(id) { /* ... REMOVIDA ... */ }

} // Fim da classe PasseiosManager

// Inicializar o gerenciador de passeios (pode ser global ou instanciado onde necessário)
// É importante que seja instanciado apenas uma vez para carregar os dados
const passeiosManager = new PasseiosManager();

// --- FUNÇÕES GLOBAIS QUE DEPENDIAM DO MANAGER (AJUSTADAS/REMOVIDAS) ---

// Carregar passeios na página de pesquisa (MOVIDA PARA pesquisa.js e usa API diretamente)
// function loadPasseios() { /* ... LÓGICA MOVIDA PARA pesquisa.js ... */ }

// Atualizar visualização das estrelas (PODE SER MANTIDA COMO UTILITÁRIA GLOBAL ou movida/duplicada)
function updateStarsRating() {
    document.querySelectorAll('.stars[style*="--rating"]').forEach(starContainer => {
        // A lógica agora é feita via CSS pela variável --rating, esta função pode ser removida
        // a menos que você precise dela por outro motivo.
    });
     // Se você usa data-rating em vez de style="--rating", a lógica antiga seria:
     document.querySelectorAll('.stars[data-rating]').forEach(starContainer => {
         const rating = parseFloat(starContainer.getAttribute('data-rating')) || 0;
         const starsSpan = starContainer.querySelector('span'); // Assume que há um span interno
         if (starsSpan) {
             const starPercentage = Math.max(0, Math.min(100, (rating / 5) * 100));
             starsSpan.style.width = `${starPercentage}%`;
         }
     });
}

// Função auxiliar para formatar data (PODE SER MANTIDA COMO UTILITÁRIA GLOBAL ou movida/duplicada)
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
     try {
         // Tenta tratar como ISO string ou objeto Date
         const dateObj = new Date(dateString);
         // Adiciona verificação se a data é válida
         if (isNaN(dateObj.getTime())) {
             // Se não for válida, tenta formato YYYY-MM-DD com fuso
             return new Date(dateString + 'T00:00:00-03:00').toLocaleDateString('pt-BR', options);
         }
         return dateObj.toLocaleDateString('pt-BR', options);
     } catch (e) {
         console.error("Erro ao formatar data em passeios.js:", dateString, e);
         return dateString; // Retorna original em caso de erro
     }
}

// Carregar passeios do usuário no perfil (MOVIDA PARA perfil-features.js e usa API)
// function loadUserPasseios(userId) { /* ... LÓGICA MOVIDA PARA perfil-features.js ... */ }

// --- EVENT LISTENER DOMContentLoaded ---
// Remove a lógica específica de páginas (pesquisa, detalhe, perfil) daqui,
// pois cada página agora tem seu próprio JS que lida com isso.
// Mantém apenas inicializações globais, se houver.
// document.addEventListener('DOMContentLoaded', function() {
//     console.log("passeios.js carregado - Lógica de carregamento de páginas movida para scripts específicos.");
//     // Exemplo: Chamar updateStarsRating globalmente se você usar data-rating
//     updateStarsRating();

//     // Outras inicializações globais que dependam deste arquivo podem vir aqui.
//     // O evento 'passeiosManagerReady' pode ser escutado por outros scripts
//     // para garantir que os dados de fallback/cache estejam prontos, se necessário.
//     document.addEventListener('passeiosManagerReady', () => {
//         console.log("PasseiosManager está pronto (dados carregados da API ou fallback).");
//         // Scripts que dependem dos dados de fallback podem iniciar aqui
//         // Ex: updateStarsRating(); // Atualiza estrelas após carregamento
//     });

// });