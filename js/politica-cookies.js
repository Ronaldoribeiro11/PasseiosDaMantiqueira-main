document.addEventListener('DOMContentLoaded', function() {
    const cookiePreferenceToggles = document.querySelectorAll('.cookie-preference-toggle');
    const saveCookiePreferencesBtn = document.getElementById('saveCookiePreferencesBtn');

    // Carregar preferências salvas (simulação com localStorage)
    function loadCookiePreferences() {
        cookiePreferenceToggles.forEach(toggle => {
            const cookieType = toggle.dataset.cookieType;
            const savedPreference = localStorage.getItem(`cookie_pref_${cookieType}`);
            if (savedPreference !== null) {
                toggle.checked = savedPreference === 'true';
            }
            // Atualizar estado visual inicial do toggle se necessário (geralmente CSS cuida disso)
        });
    }

    // Salvar preferências (simulação com localStorage)
    if (saveCookiePreferencesBtn) {
        saveCookiePreferencesBtn.addEventListener('click', function() {
            let preferencesChanged = false;
            cookiePreferenceToggles.forEach(toggle => {
                const cookieType = toggle.dataset.cookieType;
                const currentValue = localStorage.getItem(`cookie_pref_${cookieType}`);
                const newValue = toggle.checked.toString();
                if (currentValue !== newValue) {
                    preferencesChanged = true;
                }
                localStorage.setItem(`cookie_pref_${cookieType}`, newValue);
            });

            if (preferencesChanged) {
                this.innerHTML = '<i class="fas fa-check"></i> Preferências Salvas!';
                this.classList.remove('btn-primary');
                this.classList.add('btn-success'); // Supondo que .btn-success existe
            } else {
                this.innerHTML = '<i class="fas fa-info-circle"></i> Nenhuma alteração feita';
                 this.classList.remove('btn-primary', 'btn-success');
                 this.classList.add('btn-outline'); // Botão neutro
            }
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-save"></i> Salvar Minhas Preferências';
                this.classList.remove('btn-success', 'btn-outline');
                this.classList.add('btn-primary');
            }, 2500);

            // Aqui você poderia recarregar a página ou aplicar as lógicas de cookies (ex: desabilitar scripts de terceiros)
            console.log("Preferências de cookies salvas no localStorage.");
        });
    }

    // Inicialização
    loadCookiePreferences();

    // Reutilizar JS de legal-pages.js para sumário e scroll (se ele não for global em main.js)
    // Se legal-pages.js já está em main.js ou é carregado globalmente, não precisa repetir.
    // Caso contrário, copie a lógica do sumário de js/legal-pages.js para cá,
    // certificando-se de que o ID do sumário é 'cookiesTableOfContents'.
    
    const tocElementId = document.querySelector('.legal-nav-sidebar ul') ? document.querySelector('.legal-nav-sidebar ul').id : null;
    if (tocElementId === 'cookiesTableOfContents') { // Garante que só rode para o sumário correto
        const tocLinks = document.querySelectorAll(`#${tocElementId} a`);
        const legalSections = document.querySelectorAll('.legal-content .legal-section');
        const legalNavSidebar = document.querySelector('.legal-nav-sidebar');

        tocLinks.forEach(link => {
            link.addEventListener('click', function(event) {
                event.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const offset = 80;
                    const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                    const offsetPosition = elementPosition - offset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                    if (history.pushState) { history.pushState(null, null, `#${targetId}`);} 
                    else { location.hash = `#${targetId}`; }
                }
            });
        });

        function highlightActiveTocLink() {
            if (!legalNavSidebar || tocLinks.length === 0 || legalSections.length === 0) return;
            let currentSectionId = '';
            const scrollPosition = window.pageYOffset + 150;
            legalSections.forEach(section => {
                if (section.offsetTop <= scrollPosition && (section.offsetTop + section.offsetHeight) > scrollPosition) {
                    currentSectionId = section.id;
                }
            });
            if (!currentSectionId && legalSections.length > 0) { /* ... (lógica de fallback do script anterior) ... */ }
            tocLinks.forEach(link => {
                link.classList.remove('active-toc-link');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active-toc-link');
                }
            });
        }
        if (legalSections.length > 0 && tocLinks.length > 0) {
            window.addEventListener('scroll', highlightActiveTocLink);
            window.addEventListener('load', highlightActiveTocLink);
        }
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