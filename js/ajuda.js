document.addEventListener('DOMContentLoaded', function() {
    const faqSearchInput = document.getElementById('faqSearchInput');
    const faqItems = document.querySelectorAll('.faq-item'); // Seleciona todos os itens de FAQ
    const faqListContainer = document.getElementById('faqListContainer'); // Onde os itens estão
    const noResultsMessage = document.getElementById('noResultsMessage');
    const categoryLinks = document.querySelectorAll('.category-link');
    const faqListTitle = document.getElementById('faq-list-title');


    // Função de Accordion para FAQs
    faqListContainer.addEventListener('click', function(event) {
        const questionButton = event.target.closest('.faq-question');
        if (!questionButton) return;

        const faqItem = questionButton.parentElement;
        const answer = faqItem.querySelector('.faq-answer');
        const isActive = questionButton.classList.contains('active');

        // Fechar todos os outros abertos (opcional, para ter apenas um aberto por vez)
        // faqListContainer.querySelectorAll('.faq-question.active').forEach(activeQ => {
        //     if (activeQ !== questionButton) {
        //         activeQ.classList.remove('active');
        //         activeQ.nextElementSibling.style.maxHeight = null;
        //         activeQ.nextElementSibling.style.paddingTop = '0';
        //         activeQ.nextElementSibling.style.paddingBottom = '0';
        //     }
        // });
        
        questionButton.classList.toggle('active');
        if (questionButton.classList.contains('active')) {
            answer.style.paddingTop = 'var(--space-lg, 1.5rem)';
            answer.style.paddingBottom = 'var(--space-lg, 1.5rem)';
            answer.style.maxHeight = answer.scrollHeight + "px";
        } else {
            answer.style.maxHeight = null;
            answer.style.paddingTop = '0';
            answer.style.paddingBottom = '0';
        }
    });

    // Função de Busca/Filtro de FAQs
    function filterFAQs() {
        const searchTerm = faqSearchInput.value.toLowerCase().trim();
        const activeCategory = document.querySelector('.category-link.active')?.dataset.categoryFilter || 'all';
        let itemsVisible = 0;

        faqItems.forEach(item => {
            const questionText = item.querySelector('.faq-question span').textContent.toLowerCase();
            const answerText = item.querySelector('.faq-answer').textContent.toLowerCase();
            const itemCategory = item.dataset.category;

            const matchesSearch = searchTerm === '' || questionText.includes(searchTerm) || answerText.includes(searchTerm);
            const matchesCategory = activeCategory === 'all' || itemCategory === activeCategory;

            if (matchesSearch && matchesCategory) {
                item.style.display = 'block';
                itemsVisible++;
            } else {
                item.style.display = 'none';
            }
        });

        if (noResultsMessage) {
            noResultsMessage.style.display = itemsVisible === 0 ? 'block' : 'none';
        }
    }

    if (faqSearchInput) {
        faqSearchInput.addEventListener('input', filterFAQs);
    }

    // Função para Filtro de Categorias
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            categoryLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const categoryName = this.textContent.trim();
            if (faqListTitle) {
                faqListTitle.textContent = categoryName === 'Todos os Tópicos' ? 'Perguntas Frequentes' : categoryName;
            }
            
            filterFAQs(); // Refiltra com a nova categoria e o termo de busca atual
        });
    });

    // Inicializa o filtro (caso haja algum valor pré-preenchido na busca ou categoria)
    filterFAQs();

    // Lógica do menu lateral principal (copiada de configuracoes.js, ajustar se necessário)
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