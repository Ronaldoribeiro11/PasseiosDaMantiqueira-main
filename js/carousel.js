class Carousel {
    constructor(selector, options = {}) {
        this.container = document.querySelector(selector);
        if (!this.container) return;
        
        this.track = this.container.querySelector('.carousel-track');
        this.slides = Array.from(this.track.children);
        this.prevBtn = this.container.querySelector('.carousel-prev');
        this.nextBtn = this.container.querySelector('.carousel-next');
        
        // Configurações padrão
        this.settings = {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: false,
            responsive: null,
            ...options
        };
        
        // Estado atual
        this.currentSlide = 0;
        this.slideWidth = 0;
        this.maxSlides = 0;
        
        // Inicializar
        this.init();
        this.setupEventListeners();
        this.handleResize();
        
        // Adicionar listener para redimensionamento
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    init() {
        // Calcular largura dos slides
        const containerWidth = this.container.offsetWidth;
        this.slideWidth = containerWidth / this.settings.slidesToShow;
        
        // Definir largura dos slides
        this.slides.forEach(slide => {
            slide.style.minWidth = `${this.slideWidth}px`;
        });
        
        // Calcular número máximo de slides
        this.maxSlides = this.slides.length - this.settings.slidesToShow;
    }
    
    setupEventListeners() {
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => this.prev());
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.next());
        }
    }
    
    handleResize() {
        // Verificar configurações responsivas
        if (this.settings.responsive) {
            const windowWidth = window.innerWidth;
            let newSettings = {...this.settings};
            
            this.settings.responsive.forEach(breakpoint => {
                if (windowWidth <= breakpoint.breakpoint) {
                    newSettings = {...newSettings, ...breakpoint.settings};
                }
            });
            
            this.settings = newSettings;
        }
        
        // Reinicializar com novas configurações
        this.init();
        this.goToSlide(this.currentSlide);
    }
    
    prev() {
        if (this.currentSlide <= 0 && !this.settings.infinite) return;
        
        this.currentSlide -= this.settings.slidesToScroll;
        
        if (this.currentSlide < 0) {
            if (this.settings.infinite) {
                this.currentSlide = this.maxSlides;
            } else {
                this.currentSlide = 0;
            }
        }
        
        this.goToSlide(this.currentSlide);
    }
    
    next() {
        if (this.currentSlide >= this.maxSlides && !this.settings.infinite) return;
        
        this.currentSlide += this.settings.slidesToScroll;
        
        if (this.currentSlide > this.maxSlides) {
            if (this.settings.infinite) {
                this.currentSlide = 0;
            } else {
                this.currentSlide = this.maxSlides;
            }
        }
        
        this.goToSlide(this.currentSlide);
    }
    
    goToSlide(index) {
        const offset = -index * this.slideWidth;
        this.track.style.transform = `translateX(${offset}px)`;
    }
}