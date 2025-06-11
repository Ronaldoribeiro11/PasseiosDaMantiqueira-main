document.addEventListener('DOMContentLoaded', function() {
    // Controle do Menu Lateral
    const menuToggle = document.querySelector('.menu-toggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    
    if (menuToggle && sidebarMenu && menuOverlay) {
        menuToggle.addEventListener('click', function() {
            sidebarMenu.classList.toggle('open');
            menuOverlay.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
        
        menuOverlay.addEventListener('click', function() {
            sidebarMenu.classList.remove('open');
            this.classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // Carrossel de passeios
    const passeiosCarousel = new Carousel('.passeios-carousel .carousel-container', {
        slidesToShow: 3,
        slidesToScroll: 1,
        infinite: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
    
    // Carrossel de depoimentos
    const testimonialsCarousel = new Carousel('.testimonials-carousel', {
        slidesToShow: 2,
        slidesToScroll: 1,
        infinite: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1
                }
            }
        ]
    });
    
    // Animação de digitação
    const typeElements = document.querySelectorAll('.type-animation');
    typeElements.forEach(el => {
        const text = el.textContent;
        el.textContent = '';
        let i = 0;
        const typing = setInterval(() => {
            if (i < text.length) {
                el.textContent += text.charAt(i);
                i++;
            } else {
                clearInterval(typing);
            }
        }, 100);
    });

    // Animação ao rolar a página
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                const animationType = element.getAttribute('data-animation') || 'fadeIn';
                const delay = element.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    element.classList.add(animationType);
                    element.style.opacity = '1';
                }, delay * 1000);
            }
        });
    };
    
    // Verificar animações ao carregar e ao rolar
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
});

// Função para carregar conteúdo dinâmico
function loadContent(url, targetElementId) {
    const targetElement = document.getElementById(targetElementId);
    if (!targetElement) return;
    
    targetElement.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner spin"></i></div>';
    
    fetch(url)
        .then(response => response.text())
        .then(html => {
            targetElement.innerHTML = html;
            // Disparar evento para que scripts possam ser executados no conteúdo carregado
            const event = new Event('contentLoaded');
            document.dispatchEvent(event);
        })
        .catch(error => {
            targetElement.innerHTML = `<div class="error-message">Erro ao carregar o conteúdo: ${error.message}</div>`;
        });
}
