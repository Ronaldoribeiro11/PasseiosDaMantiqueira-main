// Menu mobile
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const menuOverlay = document.querySelector('.menu-overlay');
    
    // Abrir/fechar menu
    menuToggle.addEventListener('click', function() {
        this.classList.toggle('active');
        navMenu.classList.toggle('open');
        menuOverlay.style.pointerEvents = navMenu.classList.contains('open') ? 'all' : 'none';
        menuOverlay.style.opacity = navMenu.classList.contains('open') ? '1' : '0';
    });
    
    // Fechar menu ao clicar no overlay
    menuOverlay.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('open');
        this.style.pointerEvents = 'none';
        this.style.opacity = '0';
    });
    
    // Fechar menu ao clicar em um link
    const menuLinks = document.querySelectorAll('.main-menu a');
    menuLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('open');
            menuOverlay.style.pointerEvents = 'none';
            menuOverlay.style.opacity = '0';
        });
    });
    
    // Adicionar classes de animação aos elementos conforme aparecem na tela
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                const animationType = element.getAttribute('data-animation') || 'fadeIn';
                element.classList.add(animationType);
                element.style.opacity = '1';
            }
        });
    };
    
    // Verificar animações ao carregar e ao rolar
    window.addEventListener('load', animateOnScroll);
    window.addEventListener('scroll', animateOnScroll);
    
    // Inicializar tooltips
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });

    // COLE ESTE CÓDIGO DENTRO DO SEU addEventListener para 'DOMContentLoaded' em js/main.js

// Função assíncrona para verificar o token e atualizar a UI do cabeçalho
async function updateUserHeaderStatus() {
    const headerActions = document.querySelector('.main-header .header-actions');
    const loginButton = document.querySelector('.header-actions .btn-login');

    if (!headerActions) return; // Se não encontrar a área de ações, para aqui

    const token = auth.getTokenFromStorage(); // Pega o token do localStorage

    if (token) {
        // Se existe um token, vamos validá-lo com o back-end
        try {
            const response = await fetch('http://localhost:3000/api/perfil', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const user = await response.json();
                // Sucesso! O token é válido e temos os dados frescos do usuário

                // Remove o botão de login existente
                if (loginButton) loginButton.remove();

                // Cria e insere o link do perfil se ele ainda não existir
                if (!document.querySelector('.user-profile-link')) {
                    const profileHTML = `
                        <a href="perfil.html" class="user-profile-link">
                            <img src="${user.avatar_url || 'assets/images/default-profile.png'}" alt="Foto de Perfil" class="profile-pic-small">
                            <span>Olá, ${user.nome_completo.split(' ')[0]}</span>
                        </a>
                        <a href="#" id="logout-link" class="btn btn-logout">Sair</a>
                    `;
                    // Adiciona o novo HTML no início da div 'header-actions'
                    headerActions.insertAdjacentHTML('afterbegin', profileHTML);
                    
                    // Adiciona o evento de logout ao novo link
                    document.getElementById('logout-link').addEventListener('click', (e) => {
                        e.preventDefault();
                        auth.logout();
                    });
                }
            } else {
                // O token é inválido ou expirado, então limpamos o login antigo
                auth.logout();
            }
        } catch (error) {
            console.error('Erro ao contatar o servidor para verificar o token:', error);
            // Se o back-end estiver offline, não faz nada, deixa o botão de login visível
        }
    }
}

// Chama a função para ser executada assim que a página carregar
updateUserHeaderStatus();
    
    function showTooltip(e) {
        const tooltipText = this.getAttribute('data-tooltip');
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = tooltipText;
        document.body.appendChild(tooltip);
        
        const rect = this.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
        
        this.tooltip = tooltip;
    }
    
    function hideTooltip() {
        if (this.tooltip) {
            this.tooltip.remove();
            this.tooltip = null;
        }
    }
    // Dentro do document.addEventListener('DOMContentLoaded', function() { ... em js/main.js });

    // ... (código existente do menu toggle, etc.) ...

    // Proteção para links que levam à criação de passeios
    
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

// Controle do Menu Deslizante
const menuToggle = document.querySelector('.menu-toggle');
const slideMenu = document.getElementById('slideMenu');
const slideMenuOverlay = document.getElementById('slideMenuOverlay');

if (menuToggle && slideMenu && slideMenuOverlay) {
    menuToggle.addEventListener('click', function() {
        slideMenu.classList.toggle('open');
        slideMenuOverlay.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    });
    
    slideMenuOverlay.addEventListener('click', function() {
        slideMenu.classList.remove('open');
        this.classList.remove('active');
        document.body.classList.remove('no-scroll');
    });
}