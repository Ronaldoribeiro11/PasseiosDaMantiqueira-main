// js/sidebarMenuHandler.js
class SidebarMenuHandler {
    constructor(options) {
        this.menuToggleSelector = options.menuToggleSelector || '.menu-toggle'; // Seletor do botão hambúrguer
        this.sidebarMenuId = options.sidebarMenuId || 'sidebarMenu';
        this.menuOverlayId = options.menuOverlayId || 'menuOverlay';
        // O closeButtonId não é mais necessário, pois o botão foi removido

        this.menuToggle = document.querySelector(this.menuToggleSelector);
        this.sidebarMenu = document.getElementById(this.sidebarMenuId);
        this.menuOverlay = document.getElementById(this.menuOverlayId);

        this.init();
    }

    toggleMenu() {
        if (this.menuToggle) {
            // Para animação do ícone hambúrguer (X), se houver classes CSS para isso
            // this.menuToggle.classList.toggle('active'); 
        }
        if (this.sidebarMenu) {
            this.sidebarMenu.classList.toggle('open');
        }
        if (this.menuOverlay) {
            this.menuOverlay.classList.toggle('active');
        }
        document.body.classList.toggle('no-scroll'); // Para impedir scroll quando o menu está aberto
    }

    init() {
        if (!this.menuToggle || !this.sidebarMenu || !this.menuOverlay) {
            // console.warn('SidebarMenuHandler: Um ou mais elementos do menu não foram encontrados.');
            return;
        }

        this.menuToggle.addEventListener('click', () => this.toggleMenu());
        this.menuOverlay.addEventListener('click', () => this.toggleMenu());
    }
}