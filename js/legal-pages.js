document.addEventListener('DOMContentLoaded', function() {
    const tocLinks = document.querySelectorAll('#termsTableOfContents a');
    const legalSections = document.querySelectorAll('.legal-content .legal-section');
    const legalNavSidebar = document.querySelector('.legal-nav-sidebar');

    // Scroll Suave para âncoras do Sumário
    tocLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Calcula a posição do elemento mais um offset para o header (se houver um fixo)
                // ou para o menu-toggle. Como não temos header fixo, o offset pode ser menor.
                const offset = 80; // Espaço para o menu-toggle e um pouco de margem
                const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Atualiza o hash na URL sem pular
                if (history.pushState) {
                    history.pushState(null, null, `#${targetId}`);
                } else {
                    location.hash = `#${targetId}`;
                }
            }
        });
    });

    // Destaque do Link Ativo no Sumário ao Rolar a Página
    function highlightActiveTocLink() {
        if (!legalNavSidebar) return; // Se não houver sidebar, não faz nada

        let currentSectionId = '';
        const scrollPosition = window.pageYOffset + 120; // Offset maior para ativar antes

        legalSections.forEach(section => {
            if (section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
                currentSectionId = section.id;
            }
        });
        
        // Se nenhuma seção estiver "ativa" (ex: no topo ou final da página),
        // podemos tentar pegar a mais próxima do topo da viewport
        if (!currentSectionId && legalSections.length > 0) {
            let closestSection = legalSections[0];
            let minDistance = Infinity;
            legalSections.forEach(section => {
                const distance = Math.abs(section.getBoundingClientRect().top);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestSection = section;
                }
            });
            currentSectionId = closestSection.id;
        }


        tocLinks.forEach(link => {
            link.classList.remove('active-toc-link');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active-toc-link');
                // Opcional: Rolar o link ativo para o centro da sidebar se ela tiver scroll
                // link.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            }
        });
    }

    // Adicionar listeners de scroll e load para o destaque
    if (legalSections.length > 0 && tocLinks.length > 0) {
        window.addEventListener('scroll', highlightActiveTocLink);
        window.addEventListener('load', highlightActiveTocLink); // Para caso a página carregue com um hash
    }


    // Lógica do menu lateral global (copiada/adaptada, se ainda não estiver em main.js)
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