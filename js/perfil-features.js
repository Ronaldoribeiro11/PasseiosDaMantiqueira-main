// js/perfil-features.js
document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth();
    const passeiosManager = new PasseiosManager();
    let currentUser = auth.getCurrentUser();

    new SidebarMenuHandler({
        menuToggleSelector: '.page-menu-toggle',
        sidebarMenuId: 'sidebarMenuPerfil',
        menuOverlayId: 'menuOverlayPerfil'
    });

    // --- Elementos da Sidebar da Página de Perfil ---
    const sidebarProfileImgPerfil = document.getElementById('sidebarProfileImgPerfil');
    const sidebarProfileNamePerfil = document.getElementById('sidebarProfileNamePerfil');
    const sidebarProfileEmailPerfil = document.getElementById('sidebarProfileEmailPerfil');
    const sidebarLinkMeuPerfilPerfil = document.getElementById('sidebarLinkMeuPerfilPerfil');
    const sidebarLinkCriarPasseioPerfil = document.getElementById('sidebarLinkCriarPasseioPerfil');
    const sidebarLinkAvaliacoesPerfil = document.getElementById('sidebarLinkAvaliacoesPerfil');
    const sidebarLinkFavoritosPerfil = document.getElementById('sidebarLinkFavoritosPerfil');
    const sidebarLinkConfiguracoesPerfil = document.getElementById('sidebarLinkConfiguracoesPerfil');
    const sidebarLinkAuthPerfil = document.getElementById('sidebarLinkAuthPerfil');
    const profileLogoutLink = document.getElementById('profileLogoutLink');

    const userSpecificLinksPerfilPage = [
        sidebarLinkMeuPerfilPerfil, sidebarLinkCriarPasseioPerfil, sidebarLinkAvaliacoesPerfil,
        sidebarLinkFavoritosPerfil, sidebarLinkConfiguracoesPerfil
    ];

    function updateProfilePageSidebarStatus() {
        currentUser = auth.getCurrentUser();
        if (currentUser) {
            if (sidebarProfileImgPerfil) {
                sidebarProfileImgPerfil.src = currentUser.avatarUrl || 'assets/images/ImagemUsuario.jpg';
                sidebarProfileImgPerfil.style.display = 'block';
            }
            if (sidebarProfileNamePerfil) sidebarProfileNamePerfil.textContent = currentUser.name;
            if (sidebarProfileEmailPerfil) sidebarProfileEmailPerfil.textContent = currentUser.email;

            userSpecificLinksPerfilPage.forEach(link => {
                if (link) {
                    if (link.id === 'sidebarLinkCriarPasseioPerfil') {
                        link.style.display = currentUser.creatorStatus === 'verified' ? 'list-item' : 'none';
                    } else {
                        link.style.display = 'list-item';
                    }
                }
            });

            if (sidebarLinkAuthPerfil) {
                sidebarLinkAuthPerfil.innerHTML = `<a href="#" id="sidebarLogoutLinkPerfilPage"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
                document.getElementById('sidebarLogoutLinkPerfilPage')?.addEventListener('click', handleLogout);
            }
            if (profileLogoutLink) {
                 profileLogoutLink.innerHTML = `<i class="fas fa-sign-out-alt"></i> Sair`;
                 profileLogoutLink.href = "#"; 
                 profileLogoutLink.addEventListener('click', handleLogout);
            }

        } else {
            if (sidebarProfileImgPerfil) sidebarProfileImgPerfil.style.display = 'none';
            if (sidebarProfileNamePerfil) sidebarProfileNamePerfil.textContent = 'Visitante';
            if (sidebarProfileEmailPerfil) sidebarProfileEmailPerfil.textContent = 'Faça login';
            userSpecificLinksPerfilPage.forEach(link => { if (link) link.style.display = 'none'; });
            if (sidebarLinkAuthPerfil) {
                sidebarLinkAuthPerfil.innerHTML = `<a href="login.html?redirect=perfil.html"><i class="fas fa-sign-in-alt"></i> Login / Cadastro</a>`;
            }
             if (profileLogoutLink) {
                profileLogoutLink.innerHTML = `<i class="fas fa-sign-in-alt"></i> Login / Cadastro`;
                profileLogoutLink.href = "login.html?redirect=perfil.html";
                profileLogoutLink.removeEventListener('click', handleLogout);
            }
        }
    }
    
    function handleLogout(e) {
        e.preventDefault();
        auth.logout();
        updateProfilePageSidebarStatus(); 
        window.location.href = 'login.html';
    }

    // --- Elementos do Conteúdo Principal do Perfil ---
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileDisplayEmail = document.getElementById('profileDisplayEmail');
    const profileAvatarDisplay = document.getElementById('profileAvatarDisplay');
    const avatarUploadInput = document.getElementById('avatarUploadInput');
    const editAvatarButton = document.getElementById('editAvatarButton');

    const profileEditForm = document.getElementById('profileEditForm');
    const profileNameInput = document.getElementById('profile-name');
    const profileEmailFormInput = document.getElementById('profile-email-form');
    const profilePhoneInput = document.getElementById('profile-phone');
    const profileBirthdateInput = document.getElementById('profile-birthdate');
    const profileBioInput = document.getElementById('profile-bio');
    const profileFormStatus = document.getElementById('profileFormStatus');

    const statPasseiosCriados = document.getElementById('statPasseiosCriados');
    const statPasseiosReservados = document.getElementById('statPasseiosReservados');
    const statAvaliacoesFeitas = document.getElementById('statAvaliacoesFeitas');

    const creatorStatusBanner = document.getElementById('creatorStatusBanner');

    const profileNavLinks = document.querySelectorAll('.profile-menu .profile-nav-link');
    const profileContentSections = document.querySelectorAll('.profile-content .content-section');
    const meusPasseiosNavTabs = document.querySelectorAll('#meusPasseiosContent .tabs .tab-btn');
    const meusPasseiosContentTabs = document.querySelectorAll('#meusPasseiosContent .tab-content');
    const listaPasseiosCriadosDiv = document.getElementById('listaPasseiosCriados');
    const emptyPasseiosCriadosDiv = document.getElementById('emptyPasseiosCriados');
    const listaPasseiosReservadosDiv = document.getElementById('listaPasseiosReservados');
    const emptyPasseiosReservadosDiv = document.getElementById('emptyPasseiosReservados');

    function displayProfileFormStatus(element, message, type) {
        if (!element) return;
        element.innerHTML = message;
        element.className = 'form-status-message-profile';
        element.classList.add(type, 'visible');
        setTimeout(() => { element.classList.remove('visible'); }, 4000);
    }
    
    function animateListItems(containerSelector) {
        const items = document.querySelectorAll(`${containerSelector} .passeio-item`);
        items.forEach((item, index) => {
            item.style.transitionDelay = `${index * 0.07}s`;
            void item.offsetWidth; 
            item.classList.add('visible');
        });
    }

    function loadProfileData() {
        currentUser = auth.getCurrentUser();
        if (!currentUser) {
            window.location.href = `login.html?redirect=perfil.html`;
            return;
        }

        if (profileDisplayName) profileDisplayName.textContent = currentUser.name;
        if (profileDisplayEmail) profileDisplayEmail.textContent = currentUser.email;
        if (profileAvatarDisplay) profileAvatarDisplay.src = currentUser.avatarUrl || 'assets/images/ImagemUsuario.jpg';
        if (profileNameInput) profileNameInput.value = currentUser.name || '';
        if (profileEmailFormInput) profileEmailFormInput.value = currentUser.email || '';
        if (profilePhoneInput) profilePhoneInput.value = currentUser.phone || '';
        if (profileBirthdateInput) profileBirthdateInput.value = currentUser.birthDate || '';
        if (profileBioInput) profileBioInput.value = currentUser.bio || '';
        
        if(creatorStatusBanner && currentUser.creatorStatus && currentUser.creatorStatus !== 'none') {
            creatorStatusBanner.style.display = 'block';
            creatorStatusBanner.classList.remove('pending', 'rejected', 'verified', 'visible');
            let statusMsg = '';
            if (currentUser.creatorStatus === 'pending_verification') {
                statusMsg = '<i class="fas fa-hourglass-half"></i> Seu cadastro de guia/anfitrião está <strong>em análise</strong>. Avisaremos quando for aprovado!';
                creatorStatusBanner.classList.add('pending');
            } else if (currentUser.creatorStatus === 'rejected') {
                statusMsg = '<i class="fas fa-times-circle"></i> Seu cadastro de guia/anfitrião foi <strong>rejeitado</strong>. Verifique seu e-mail ou <a href="contato.html">contate o suporte</a>.';
                creatorStatusBanner.classList.add('rejected');
            } else if (currentUser.creatorStatus === 'verified') {
                 creatorStatusBanner.style.display = 'none';
            }
            creatorStatusBanner.innerHTML = statusMsg;
            if(statusMsg) setTimeout(() => { creatorStatusBanner.classList.add('visible'); }, 100);
        } else if (creatorStatusBanner) {
            creatorStatusBanner.style.display = 'none';
        }

        loadPasseiosCriados();
        loadPasseiosReservados();
        updateProfilePageSidebarStatus();
        loadAvaliacoesFeitasCount(); // Atualiza o contador de avaliações
    }

    if (profileEditForm) {
        profileEditForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const updatedData = {
                name: profileNameInput.value,
                phone: profilePhoneInput.value,
                birthDate: profileBirthdateInput.value,
                bio: profileBioInput.value
            };
            if (auth.updateCurrentUserData(updatedData)) {
                displayProfileFormStatus(profileFormStatus, '<i class="fas fa-check-circle"></i> Perfil atualizado com sucesso!', 'success');
                if (profileDisplayName) profileDisplayName.textContent = updatedData.name;
                updateProfilePageSidebarStatus();
            } else {
                displayProfileFormStatus(profileFormStatus, '<i class="fas fa-exclamation-circle"></i> Erro ao atualizar o perfil.', 'error');
            }
        });
    }

    if (editAvatarButton && avatarUploadInput && profileAvatarDisplay) {
        editAvatarButton.addEventListener('click', () => avatarUploadInput.click());
        avatarUploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profileAvatarDisplay.src = e.target.result;
                    if (auth.updateCurrentUserData({ avatarUrl: e.target.result })) {
                        updateProfilePageSidebarStatus(); 
                        displayProfileFormStatus(profileFormStatus, '<i class="fas fa-image"></i> Foto de perfil atualizada!', 'success');
                    }
                }
                reader.readAsDataURL(file);
            } else if (file) {
                displayProfileFormStatus(profileFormStatus, '<i class="fas fa-exclamation-triangle"></i> Selecione um arquivo de imagem válido (JPG, PNG).', 'error');
            }
        });
    }

    function loadPasseiosCriados() {
        if (!listaPasseiosCriadosDiv || !emptyPasseiosCriadosDiv || !currentUser) return;
        
        const meusPasseios = passeiosManager.getPasseiosByUser(currentUser.id);
        if (statPasseiosCriados) statPasseiosCriados.textContent = meusPasseios.length;

        if (meusPasseios.length === 0) {
            listaPasseiosCriadosDiv.innerHTML = '';
            emptyPasseiosCriadosDiv.style.display = 'block';
        } else {
            emptyPasseiosCriadosDiv.style.display = 'none';
            listaPasseiosCriadosDiv.innerHTML = meusPasseios.map(passeio => `
                <div class="passeio-item">
                    <div class="passeio-image">
                        <img src="assets/images/${passeio.mainImage || 'ImagemDefaultPasseio.jpg'}" alt="${passeio.title}">
                    </div>
                    <div class="passeio-details">
                        <h3>${passeio.title}</h3>
                        <div class="passeio-meta">
                            <span><i class="fas fa-calendar-alt"></i> ${passeio.dates && passeio.dates.length > 0 ? formatDate(passeio.dates[0]) : (passeio.datesAvailability && passeio.datesAvailability.length > 0 ? formatDate(passeio.datesAvailability[0].date) : 'N/A')}</span>
                            <span><i class="fas fa-users"></i> ${passeio.maxParticipants || 0} Max.</span>
                            <span class="status ${passeio.status || 'active'}"><i class="fas fa-info-circle"></i> ${passeio.status ? (passeio.status.charAt(0).toUpperCase() + passeio.status.slice(1)) : 'Ativo'}</span>
                        </div>
                        <div class="passeio-actions">
                            <a href="criar-passeio.html?edit=${passeio.id}" class="btn btn-sm btn-secondary"><i class="fas fa-edit"></i> Editar</a>
                            <a href="passeio.html?id=${passeio.id}" class="btn btn-sm btn-outline"><i class="fas fa-eye"></i> Ver</a>
                            <button class="btn btn-sm btn-danger-outline btn-delete-meu-passeio" data-passeio-id="${passeio.id}"><i class="fas fa-trash"></i> Excluir</button>
                        </div>
                    </div>
                </div>
            `).join('');
            attachDeletePasseioListeners();
            animateListItems('#listaPasseiosCriados');
        }
    }

    function attachDeletePasseioListeners() {
        document.querySelectorAll('.btn-delete-meu-passeio').forEach(button => {
            button.addEventListener('click', function() {
                const passeioId = this.dataset.passeioId;
                const passeio = passeiosManager.getPasseioById(passeioId);
                if (confirm(`Tem certeza que deseja excluir o passeio "${passeio ? passeio.title : 'este passeio'}"? Esta ação não pode ser desfeita.`)) {
                    passeiosManager.removePasseio(passeioId);
                    loadPasseiosCriados(); // Recarrega a lista de passeios criados
                    // Atualizar outras estatísticas se necessário
                    displayProfileFormStatus(profileFormStatus, '<i class="fas fa-trash-alt"></i> Passeio excluído com sucesso!', 'success');
                }
            });
        });
    }


    function loadPasseiosReservados() {
        if (!listaPasseiosReservadosDiv || !emptyPasseiosReservadosDiv || !currentUser) return;
        const allBookings = JSON.parse(localStorage.getItem('all_site_bookings')) || [];
        const minhasReservas = allBookings.filter(b => b.userId === currentUser.id);

        if (statPasseiosReservados) statPasseiosReservados.textContent = minhasReservas.length;

        if (minhasReservas.length === 0) {
            listaPasseiosReservadosDiv.innerHTML = '';
            emptyPasseiosReservadosDiv.style.display = 'block';
        } else {
            emptyPasseiosReservadosDiv.style.display = 'none';
            listaPasseiosReservadosDiv.innerHTML = minhasReservas.map(reserva => {
                const passeio = passeiosManager.getPasseioById(reserva.passeioId);
                if (!passeio) return '';
                return `
                    <div class="passeio-item">
                        <div class="passeio-image">
                            <img src="assets/images/${passeio.mainImage || 'ImagemDefaultPasseio.jpg'}" alt="${passeio.title}">
                        </div>
                        <div class="passeio-details">
                            <h3>${passeio.title}</h3>
                            <div class="passeio-meta">
                                <span><i class="fas fa-calendar-check"></i> Para: ${formatDate(reserva.dataPasseio)} às ${reserva.horaPasseio || ''}</span>
                                <span><i class="fas fa-users"></i> ${reserva.participantes} pessoa(s)</span>
                                <span class="status ${reserva.statusReserva || 'confirmed'}">
                                    <i class="fas fa-info-circle"></i> 
                                    ${reserva.statusReserva ? (reserva.statusReserva.replace(/_/g, ' ').charAt(0).toUpperCase() + reserva.statusReserva.replace(/_/g, ' ').slice(1)) : 'Confirmada'}
                                </span>
                            </div>
                            <div class="passeio-actions">
                                <a href="passeio.html?id=${passeio.id}" class="btn btn-sm btn-outline"><i class="fas fa-eye"></i> Ver Detalhes</a>
                                ${(reserva.statusReserva !== 'cancelled_by_user' && reserva.statusReserva !== 'completed' && reserva.statusReserva !== 'cancelled_by_guide') ? 
                                `<button class="btn btn-sm btn-danger-outline btn-cancel-booking" data-reserva-id="${reserva.reservaId}"><i class="fas fa-times-circle"></i> Cancelar</button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            animateListItems('#listaPasseiosReservados');
            
            document.querySelectorAll('.btn-cancel-booking').forEach(button => {
                button.addEventListener('click', function() {
                    const reservaId = this.dataset.reservaId;
                    const bookingIndex = allBookings.findIndex(b => b.reservaId === reservaId);
                    const passeioId = bookingIndex > -1 ? allBookings[bookingIndex].passeioId : null;
                    const passeioData = passeioId ? passeiosManager.getPasseioById(passeioId) : null;
                    let canCancel = false;
                    let politicaMsg = "Verifique a política de cancelamento do passeio.";

                    if (passeioData && passeioData.cancelationPolicy) {
                        const dataPasseio = new Date(allBookings[bookingIndex].dataPasseio + "T" + (allBookings[bookingIndex].horaPasseio || "00:00:00"));
                        const agora = new Date();
                        const diffHoras = (dataPasseio - agora) / (1000 * 60 * 60);

                        if (passeioData.cancelationPolicy === "flexivel" && diffHoras >= 24) canCancel = true;
                        else if (passeioData.cancelationPolicy === "moderada" && diffHoras >= 72) canCancel = true;
                        else if (passeioData.cancelationPolicy === "rigorosa" && diffHoras >= 24 * 7) canCancel = true; // 7 dias
                        
                        if (passeioData.cancelationPolicy === "nao_reembolsavel") politicaMsg = "Este passeio não é reembolsável.";
                        else if (!canCancel) politicaMsg = "O prazo para cancelamento com reembolso total expirou conforme a política do passeio.";
                    }


                    if (confirm(`Tem certeza que deseja solicitar o cancelamento desta reserva? ${politicaMsg}`)) {
                        if (bookingIndex > -1) {
                            allBookings[bookingIndex].statusReserva = 'cancelled_by_user';
                            localStorage.setItem('all_site_bookings', JSON.stringify(allBookings));
                            loadPasseiosReservados(); 
                            displayProfileFormStatus(profileFormStatus, '<i class="fas fa-info-circle"></i> Solicitação de cancelamento enviada.', 'success');
                        }
                    }
                });
            });
        }
    }
    
    function loadAvaliacoesFeitasCount() {
        if (!statAvaliacoesFeitas || !currentUser) return;
        const userReviews = JSON.parse(localStorage.getItem('passeios_reviews_geral')) || [];
        const minhasAvaliacoes = userReviews.filter(review => review.userId === currentUser.id);
        statAvaliacoesFeitas.textContent = minhasAvaliacoes.length;
    }

    // Navegação por Abas do Perfil (Menu Lateral do Conteúdo)
    profileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.dataset.tabTarget;
            if (!targetId) return; // Se for um link normal como Favoritos, não previne default

            e.preventDefault();
            profileNavLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');

            profileContentSections.forEach(section => {
                if (section.id === targetId) {
                    section.style.display = 'block';
                    void section.offsetWidth; 
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                    section.style.display = 'none';
                }
            });
             // Salva aba ativa no localStorage
            localStorage.setItem('activeProfileTab', targetId);
        });
    });

    // Navegação por Sub-Abas em "Meus Passeios"
    meusPasseiosNavTabs.forEach(btn => {
        btn.addEventListener('click', function() {
            const contentId = this.dataset.contentId;
            meusPasseiosNavTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            meusPasseiosContentTabs.forEach(content => {
                content.classList.toggle('active', content.id === contentId);
            });
            if (contentId === 'passeiosCriadosTab') animateListItems('#listaPasseiosCriados');
            if (contentId === 'passeiosReservadosTab') animateListItems('#listaPasseiosReservados');
            localStorage.setItem('activeMeusPasseiosSubTab', contentId);
        });
    });
    
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString + 'T00:00:00-03:00').toLocaleDateString('pt-BR', options);
    }

    // Inicialização
    if (currentUser) {
        loadProfileData(); // Isso também chama loadPasseiosCriados/Reservados e updateSidebar
        loadAvaliacoesFeitasCount();

        const activeTab = localStorage.getItem('activeProfileTab') || 'infoPessoaisContent';
        document.querySelector(`.profile-menu .profile-nav-link[data-tab-target="${activeTab}"]`)?.click();
        
        if (activeTab === 'meusPasseiosContent') {
            const activeSubTab = localStorage.getItem('activeMeusPasseiosSubTab') || 'passeiosCriadosTab';
            document.querySelector(`#meusPasseiosContent .tabs .tab-btn[data-content-id="${activeSubTab}"]`)?.click();
        }

        // Lidar com hash na URL para navegação direta (ex: de criar-passeio.html)
        if (window.location.hash === '#meusPasseiosContent') {
            document.querySelector('.profile-menu .profile-nav-link[data-tab-target="meusPasseiosContent"]')?.click();
            // Opcional: forçar a sub-aba "Criados por Mim"
             setTimeout(() => { // Pequeno delay para garantir que a aba principal já carregou
                document.querySelector('#meusPasseiosContent .tabs .tab-btn[data-content-id="passeiosCriadosTab"]')?.click();
            }, 100);
        }


    } else {
        window.location.href = 'login.html?redirect=perfil.html';
    }

});