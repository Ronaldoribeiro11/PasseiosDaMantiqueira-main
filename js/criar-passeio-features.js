// js/criar-passeio-features.js
document.addEventListener('DOMContentLoaded', function() {
    const auth = new Auth();
    const passeiosManager = new PasseiosManager();
    let currentUser = auth.getCurrentUser();

    // --- Autenticação e Verificação de Criador ---
    // --- Autenticação e Verificação de Criador (VERSÃO CORRIGIDA) ---

// Esta função será executada assim que a página carregar
async function verificarAcessoGuia() {
    const token = auth.getTokenFromStorage();

    // 1. Se não há token, não está logado. Redireciona.
    if (!token) {
        alert('Você precisa estar logado para acessar esta página.');
        // Redireciona para login, guardando a página de destino
        window.location.href = `login.html?redirect=criar-passeio.html`;
        return;
    }

    try {
        // 2. Busca os dados mais recentes do usuário na API de perfil
        const response = await fetch('http://localhost:3000/api/perfil', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Se o token for inválido/expirado, o back-end retorna erro
        if (!response.ok) {
            auth.logout(); // Limpa o login antigo
            alert('Sua sessão expirou. Por favor, faça login novamente.');
            window.location.href = `login.html?redirect=criar-passeio.html`;
            return;
        }

        const usuario = await response.json();

        // 3. AQUI ESTÁ A CORREÇÃO: Verificar o campo `tipo_de_usuario`
        if (usuario.tipo_de_usuario !== 'guia') {
            alert('Acesso negado. Apenas guias podem acessar esta página.');
            // Redireciona para a página de perfil ou para a home
            window.location.href = 'index.html'; 
            return;
        }
        
        // Se chegou até aqui, o usuário é um guia verificado e a página pode continuar a carregar.
        console.log('Acesso de guia verificado com sucesso.');

    } catch (error) {
        console.error("Erro ao verificar o perfil do usuário:", error);
        alert("Ocorreu um erro ao verificar suas permissões. Tente novamente mais tarde.");
        window.location.href = 'index.html';
    }
}

// Chama a função de verificação ao carregar a página
verificarAcessoGuia();

    new SidebarMenuHandler({
        menuToggleSelector: '.page-menu-toggle',
        sidebarMenuId: 'sidebarMenuCriarPasseio',
        menuOverlayId: 'menuOverlayCriarPasseio'
    });
    updateCriarPasseioSidebarUserStatus();

    const form = document.getElementById('createPasseioForm');
    const formSteps = Array.from(form.querySelectorAll('.form-step'));
    const stepIndicators = Array.from(form.querySelectorAll('.form-steps .step-indicator'));
    const nextStepBtns = form.querySelectorAll('[data-next-step]');
    const prevStepBtns = form.querySelectorAll('[data-prev-step]');
    const pageTitleElement = document.getElementById('pageTitle');
    const pageSubtitleElement = document.getElementById('pageSubtitle');
    const publishButton = document.getElementById('publishButton');
    const saveDraftButton = document.getElementById('saveDraftButton');
    const formStatusMessageGlobal = document.getElementById('formStatusMessageGlobal');

    const titleInput = document.getElementById('passeio-title');
    const categoryInput = document.getElementById('passeio-category');
    const shortDescInput = document.getElementById('passeio-short-desc');
    const shortDescCharCount = document.getElementById('shortDescCharCount');
    const tagsInput = document.getElementById('passeio-tags-input');
    const tagsContainer = document.getElementById('passeio-tags-container');
    const longDescInput = document.getElementById('passeio-long-desc');
    const requirementsInput = document.getElementById('passeio-requirements');
    const includedItemsCheckboxes = form.querySelectorAll('input[name="includedItems"]');
    const mainImageInput = document.getElementById('main-image');
    const mainImagePreview = document.getElementById('main-image-preview');
    const mainImageInfo = document.getElementById('mainImageInfo');
    const galleryImagesInput = document.getElementById('gallery-images');
    const galleryPreviewContainer = document.getElementById('gallery-preview-container');
    const emptyGalleryPlaceholder = document.getElementById('emptyGalleryPlaceholder');
    const locationDetailedInput = document.getElementById('passeio-location-detailed');
    const mapsLinkInput = document.getElementById('passeio-maps-link');
    const locationInstructionsInput = document.getElementById('passeio-location-instructions');
    const priceInput = document.getElementById('passeio-price');
    const durationInput = document.getElementById('passeio-duration');
    const difficultyInput = document.getElementById('passeio-difficulty');
    const maxParticipantsInput = document.getElementById('passeio-max-participants');
    const newDateInput = document.getElementById('new-date-input');
    const newTimeInput = document.getElementById('new-time-input');
    const addDateTimeBtn = document.getElementById('add-date-time-btn');
    const datesAvailabilityContainer = document.getElementById('dates-availability-container');
    const cancelationPolicyInput = document.getElementById('passeio-cancelation');
    const confirmAccuracyCheckbox = document.getElementById('confirm-accuracy');

    let currentStep = 1;
    let editingTourId = null;
    let editingTourData = null;
    let uploadedMainImageFile = null;
    let uploadedGalleryImageFiles = [];
    let existingGalleryImageNames = [];
    let tagsArray = [];
    let datesAvailabilityArray = [];

    function updateCriarPasseioSidebarUserStatus() {
        currentUser = auth.getCurrentUser();
        const sidebarProfileImg = document.getElementById('sidebarProfileImgCriarPasseio');
        const sidebarProfileName = document.getElementById('sidebarProfileNameCriarPasseio');
        const sidebarProfileEmail = document.getElementById('sidebarProfileEmailCriarPasseio');
        const sidebarLinkAuth = document.getElementById('sidebarLinkAuthCriarPasseio');
        const userSpecificLinks = [
            document.getElementById('sidebarLinkMeuPerfilCriarPasseio'),
            document.getElementById('sidebarLinkCriarPasseioCriarPasseio'),
            document.getElementById('sidebarLinkAvaliacoesCriarPasseio'),
            document.getElementById('sidebarLinkFavoritosCriarPasseio'),
            document.getElementById('sidebarLinkConfiguracoesCriarPasseio')
        ];
        if (currentUser) {
            if(sidebarProfileImg) { sidebarProfileImg.src = currentUser.avatarUrl || 'assets/images/ImagemUsuario.jpg'; sidebarProfileImg.style.display = 'block';}
            if(sidebarProfileName) sidebarProfileName.textContent = currentUser.name;
            if(sidebarProfileEmail) sidebarProfileEmail.textContent = currentUser.email;
            userSpecificLinks.forEach(link => {
                if (link) link.style.display = (link.id === 'sidebarLinkCriarPasseioCriarPasseio' && currentUser.creatorStatus !== 'verified') ? 'none' : 'list-item';
            });
            if (sidebarLinkAuth) {
                sidebarLinkAuth.innerHTML = `<a href="#" id="sidebarLogoutLinkCriarPasseio"><i class="fas fa-sign-out-alt"></i> Sair</a>`;
                document.getElementById('sidebarLogoutLinkCriarPasseio')?.addEventListener('click', (e) => {
                    e.preventDefault(); auth.logout(); updateCriarPasseioSidebarUserStatus(); window.location.href = 'login.html';
                });
            }
        } else {
            if(sidebarProfileImg) sidebarProfileImg.style.display = 'none';
            if(sidebarProfileName) sidebarProfileName.textContent = 'Visitante';
            if(sidebarProfileEmail) sidebarProfileEmail.textContent = 'Faça login';
            userSpecificLinks.forEach(link => { if (link) link.style.display = 'none'; });
            if (sidebarLinkAuth) sidebarLinkAuth.innerHTML = `<a href="login.html?redirect=criar-passeio.html"><i class="fas fa-sign-in-alt"></i> Login / Cadastro</a>`;
        }
    }

    function displayGlobalFormStatus(message, type) {
        if (!formStatusMessageGlobal) return;
        formStatusMessageGlobal.innerHTML = message;
        formStatusMessageGlobal.className = 'form-status-message-profile';
        formStatusMessageGlobal.classList.add(type, 'visible');
        if (type === 'error') {
            setTimeout(() => { formStatusMessageGlobal.classList.remove('visible'); }, 7000);
        }
    }

    function updateStepDisplay(animate = false) {
        formSteps.forEach((stepEl, index) => {
            const stepNum = index + 1;
            const wasActive = stepEl.classList.contains('active');
            const isActiveNow = stepNum === currentStep;

            if (animate && wasActive && !isActiveNow) {
                stepEl.classList.add('exiting');
                const handleAnimationEnd = () => {
                    stepEl.classList.remove('active', 'exiting');
                    stepEl.style.display = 'none';
                    stepEl.removeEventListener('animationend', handleAnimationEnd);
                };
                stepEl.addEventListener('animationend', handleAnimationEnd);
            } else if (isActiveNow && !wasActive) {
                 stepEl.classList.remove('exiting');
                 stepEl.style.display = 'block';
                 void stepEl.offsetWidth; 
                 stepEl.classList.add('active');
            } else if (!isActiveNow) { // Garante que inativos estejam escondidos
                stepEl.classList.remove('active', 'exiting');
                stepEl.style.display = 'none';
            }
        });
        stepIndicators.forEach((indicator, index) => {
            const stepNum = index + 1;
            indicator.classList.remove('active', 'completed');
            if (stepNum < currentStep) indicator.classList.add('completed');
            if (stepNum === currentStep) indicator.classList.add('active');
        });
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    nextStepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < formSteps.length) {
                    currentStep++;
                    if (currentStep === 5) populateSummary();
                    updateStepDisplay(true);
                }
            }
        });
    });
    prevStepBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepDisplay(true);
            }
        });
    });

    function validateField(inputElement, errorElementId, validationFn, errorMessage) {
        const errorElement = document.getElementById(errorElementId);
        if (!inputElement) return true; // Campo não existe, não validar
        
        const parentGroup = inputElement.closest('.form-group'); // Para destacar o grupo todo
        
        if (!errorElement && parentGroup) { // Cria elemento de erro se não existir
             const smallError = document.createElement('small');
             smallError.className = 'field-validation-message';
             smallError.id = errorElementId;
             parentGroup.appendChild(smallError);
             // errorElement = smallError; // Não funciona pois a var errorElement é const no escopo da função
        }
        const actualErrorElement = document.getElementById(errorElementId); // Pega de novo caso tenha sido criado

        if(actualErrorElement) clearFieldValidation(actualErrorElement);
        inputElement.classList.remove('error');

        if (!validationFn(inputElement.value, inputElement)) {
            inputElement.classList.add('error');
            if(actualErrorElement) {
                actualErrorElement.textContent = errorMessage;
                actualErrorElement.className = 'field-validation-message error visible';
            }
            return false;
        }
        return true;
    }
    function clearFieldValidation(errorElement) {
        if(errorElement) {
            errorElement.textContent = '';
            errorElement.className = 'field-validation-message';
        }
    }
    function updateCharCount(textarea, countElement, maxLength) {
        if(!textarea || ! countElement) return;
        const currentLength = textarea.value.length;
        countElement.textContent = `${currentLength}/${maxLength}`;
        countElement.classList.remove('limit-near', 'limit-exceeded');
        if (currentLength > maxLength) countElement.classList.add('limit-exceeded');
        else if (currentLength >= maxLength * 0.9) countElement.classList.add('limit-near');
    }

    shortDescInput?.addEventListener('input', () => {
        updateCharCount(shortDescInput, shortDescCharCount, 200);
        validateField(shortDescInput, 'passeio-short-descError', val => val.trim().length >= 20 && val.trim().length <= 200, 'Descrição curta: 20-200 caracteres.');
    });
    titleInput?.addEventListener('input', () => validateField(titleInput, 'passeio-titleError', val => val.trim().length >= 10, 'Título: mínimo 10 caracteres.'));
    longDescInput?.addEventListener('input', () => validateField(longDescInput, 'passeio-long-descError', val => val.trim().length >= 50, 'Descrição detalhada: mínimo 50 caracteres.'));
    priceInput?.addEventListener('input', () => validateField(priceInput, 'passeio-priceError', val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Preço deve ser um número positivo.'));
    durationInput?.addEventListener('input', () => validateField(durationInput, 'passeio-durationError', val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0.5, 'Duração: mínimo 0.5 horas.'));
    maxParticipantsInput?.addEventListener('input', () => validateField(maxParticipantsInput, 'passeio-max-participantsError', val => !isNaN(parseInt(val)) && parseInt(val) >= 1, 'Participantes: mínimo 1.'));
    locationDetailedInput?.addEventListener('input', () => validateField(locationDetailedInput, 'passeio-location-detailedError', val => val.trim().length > 0, 'Ponto de encontro é obrigatório.'));
    categoryInput?.addEventListener('change', () => validateField(categoryInput, 'passeio-categoryError', val => val !== '', 'Selecione uma categoria.'));
    difficultyInput?.addEventListener('change', () => validateField(difficultyInput, 'passeio-difficultyError', val => val !== '', 'Selecione a dificuldade.'));
    cancelationPolicyInput?.addEventListener('change', () => validateField(cancelationPolicyInput, 'passeio-cancelationError', val => val !== '', 'Selecione uma política.'));


    function validateStep(stepNum) {
        let isStepValid = true;
        if (formStatusMessageGlobal) formStatusMessageGlobal.classList.remove('visible');
        const currentStepElement = formSteps[stepNum - 1];
        if (!currentStepElement) return false;

        currentStepElement.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
            let fieldIsValid = true;
            let errMsg = 'Este campo é obrigatório.';
            let validationFn = (val) => typeof val === 'string' ? val.trim() !== '' : val !== null && val !== undefined;


            if (input.type === 'select-one' && input.value === "") fieldIsValid = false;
            if (input.id === 'main-image' && !uploadedMainImageFile && !(editingTourId && editingTourData && editingTourData.mainImage) ) {
                 fieldIsValid = false; errMsg = 'Imagem principal é obrigatória.';
            }
            if (input.id === 'confirm-accuracy' && !input.checked) {
                fieldIsValid = false; errMsg = 'Você precisa confirmar a precisão e aceitar os termos.';
            }
            
            if(input.id === 'passeio-title') { validationFn = val => val.trim().length >= 10; errMsg = 'Título: mínimo 10 caracteres.';}
            else if (input.id === 'passeio-short-desc') { validationFn = val => val.trim().length >= 20 && val.trim().length <= 200; errMsg = 'Descrição curta: 20-200 caracteres.';}
            else if (input.id === 'passeio-long-desc') { validationFn = val => val.trim().length >= 50; errMsg = 'Descrição detalhada: mínimo 50 caracteres.';}
            else if (input.id === 'passeio-price') { validationFn = val => !isNaN(parseFloat(val)) && parseFloat(val) > 0; errMsg = 'Preço deve ser um número positivo.';}
            else if (input.id === 'passeio-duration') { validationFn = val => !isNaN(parseFloat(val)) && parseFloat(val) >= 0.5; errMsg = 'Duração: mínimo 0.5 horas.';}
            else if (input.id === 'passeio-max-participants') { validationFn = val => !isNaN(parseInt(val)) && parseInt(val) >= 1; errMsg = 'Participantes: mínimo 1.';}


            if (!validationFn(input.value, input) || !fieldIsValid) {
                validateField(input, input.id + 'Error', () => false, errMsg);
                isStepValid = false;
            } else {
                 const errorElement = document.getElementById(input.id + 'Error');
                 if (errorElement) clearFieldValidation(errorElement);
                 input.classList.remove('error');
            }
        });
        if (stepNum === 4 && datesAvailabilityArray.length === 0) {
            const el = document.getElementById('dates-availability-containerError');
            if (el) { el.textContent = 'Adicione pelo menos uma data/hora.'; el.className = 'field-validation-message error visible';}
            isStepValid = false;
        } else if (stepNum === 4) {
            const el = document.getElementById('dates-availability-containerError'); if(el) clearFieldValidation(el);
        }
        if (!isStepValid) {
            const firstErrorField = currentStepElement.querySelector('.error, .field-validation-message.error.visible');
            firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return isStepValid;
    }
    
    tagsInput?.addEventListener('keyup', function(e) {
        if (e.key === ',' || e.key === 'Enter') {
            e.preventDefault();
            const tagText = this.value.trim().replace(/,$/, '');
            if (tagText && !tagsArray.includes(tagText.toLowerCase()) && tagsArray.length < 10) {
                tagsArray.push(tagText.toLowerCase()); renderTags();
            } else if (tagsArray.length >= 10) { alert("Máximo de 10 tags."); }
            this.value = '';
        }
    });
    function renderTags() {
        if (!tagsContainer) return;
        tagsContainer.innerHTML = '';
        tagsArray.forEach((tag, index) => {
            const tagEl = Object.assign(document.createElement('span'), {className: 'tag-item', textContent: tag});
            const remBtn = Object.assign(document.createElement('button'), {className: 'remove-tag', innerHTML: '×', type: 'button', ariaLabel: `Remover tag ${tag}`});
            remBtn.onclick = () => { tagsArray.splice(index, 1); renderTags(); };
            tagEl.appendChild(remBtn);
            tagsContainer.appendChild(tagEl);
        });
    }

    mainImageInput?.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { validateField(mainImageInput, 'main-imageError', () => false, 'Imagem principal excede 5MB.'); this.value = null; return; }
            uploadedMainImageFile = file;
            const reader = new FileReader();
            reader.onload = (ev) => { mainImagePreview.style.backgroundImage = `url(${ev.target.result})`; mainImagePreview.innerHTML = ''; }
            reader.readAsDataURL(file);
            if(mainImageInfo) mainImageInfo.textContent = `Selecionado: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
            clearFieldValidation(document.getElementById('main-imageError'));
        }
    });

    galleryImagesInput?.addEventListener('change', function(e) {
        let filesAddedThisTime = 0;
        for (const file of e.target.files) {
            if ((uploadedGalleryImageFiles.length + existingGalleryImageNames.length + filesAddedThisTime) < 5) {
                if (file.size > 2 * 1024 * 1024) { alert(`A imagem "${file.name}" excede 2MB e não será adicionada.`); continue; }
                uploadedGalleryImageFiles.push(file);
                renderGalleryPreviewItem(file, false); // false para indicar que é um novo arquivo
                filesAddedThisTime++;
            } else { alert("Máximo de 5 imagens na galeria (incluindo existentes)."); break; }
        }
        this.value = null; 
    });
    function renderGalleryPreviewItem(fileOrName, isExistingName = false) {
        if (!galleryPreviewContainer) return;
        if (emptyGalleryPlaceholder) emptyGalleryPlaceholder.style.display = 'none';

        const itemWrapper = document.createElement('div'); itemWrapper.className = 'gallery-item-wrapper';
        const galleryItemDiv = document.createElement('div'); galleryItemDiv.className = 'gallery-item';
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image-btn'; removeBtn.innerHTML = '×'; removeBtn.type = 'button';
        
        if (isExistingName) {
            galleryItemDiv.style.backgroundImage = `url('assets/images/${fileOrName}')`;
            removeBtn.setAttribute('aria-label', `Remover imagem existente ${fileOrName}`);
            removeBtn.onclick = () => {
                itemWrapper.remove();
                existingGalleryImageNames = existingGalleryImageNames.filter(name => name !== fileOrName);
                if((uploadedGalleryImageFiles.length + existingGalleryImageNames.length) === 0 && emptyGalleryPlaceholder) emptyGalleryPlaceholder.style.display = 'flex';
            };
        } else { // É um objeto File
            const reader = new FileReader();
            reader.onload = (ev) => galleryItemDiv.style.backgroundImage = `url(${ev.target.result})`;
            reader.readAsDataURL(fileOrName);
            removeBtn.setAttribute('aria-label', `Remover nova imagem ${fileOrName.name}`);
            removeBtn.onclick = () => {
                itemWrapper.remove();
                uploadedGalleryImageFiles = uploadedGalleryImageFiles.filter(f => f !== fileOrName);
                 if((uploadedGalleryImageFiles.length + existingGalleryImageNames.length) === 0 && emptyGalleryPlaceholder) emptyGalleryPlaceholder.style.display = 'flex';
            };
        }
        itemWrapper.appendChild(galleryItemDiv); itemWrapper.appendChild(removeBtn);
        galleryPreviewContainer.appendChild(itemWrapper);
    }
    
    const todayForDateInput = new Date().toISOString().split("T")[0];
    if(newDateInput) newDateInput.min = todayForDateInput;

    addDateTimeBtn?.addEventListener('click', () => {
        const dateVal = newDateInput.value;
        const timeVal = newTimeInput.value;
        if (dateVal && timeVal) {
            if (dateVal < todayForDateInput) { alert("Não é possível adicionar datas ou horários no passado."); return; }
            if (dateVal === todayForDateInput) {
                const now = new Date();
                const selectedDateTime = new Date(`${dateVal}T${timeVal}`);
                if (selectedDateTime <= now) { alert("Não é possível adicionar horários no passado para o dia de hoje."); return;}
            }
            if (!datesAvailabilityArray.some(dt => dt.date === dateVal && dt.time === timeVal)) {
                datesAvailabilityArray.push({ date: dateVal, time: timeVal });
                datesAvailabilityArray.sort((a,b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
                renderDatesAvailability();
                newDateInput.value = ''; newTimeInput.value = '';
                const el = document.getElementById('dates-availability-containerError'); if(el) clearFieldValidation(el);
            } else { alert("Esta data e hora já foram adicionadas."); }
        } else { alert("Por favor, selecione data e hora válidas."); }
    });
    function renderDatesAvailability() {
        if (!datesAvailabilityContainer) return;
        datesAvailabilityContainer.innerHTML = '';
        datesAvailabilityArray.forEach((dt, index) => {
            const dtEl = Object.assign(document.createElement('span'), {className: 'date-tag'});
            const dateObj = new Date(dt.date + 'T' + dt.time);
            dtEl.textContent = dateObj.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit', year:'numeric'}) + ' às ' + dt.time;
            const remBtn = Object.assign(document.createElement('button'), {className: 'remove-date', innerHTML: '×', type: 'button', ariaLabel: `Remover ${dtEl.textContent}`});
            remBtn.onclick = () => { datesAvailabilityArray.splice(index, 1); renderDatesAvailability(); };
            dtEl.appendChild(remBtn);
            datesAvailabilityContainer.appendChild(dtEl);
        });
    }
    
    function populateSummary() {
        const summaryFields = {
            'summaryTitle': titleInput.value,
            'summaryCategory': categoryInput.value ? categoryInput.options[categoryInput.selectedIndex].text : '',
            'summaryShortDesc': shortDescInput.value,
            'summaryLongDesc': longDescInput.value,
            'summaryTags': tagsArray.join(', ') || 'Nenhuma',
            'summaryRequirements': requirementsInput.value || 'Não especificado',
            'summaryIncludedItems': Array.from(includedItemsCheckboxes).filter(cb => cb.checked).map(cb => cb.parentElement.textContent.trim()).join(', ') || 'Nenhum',
            'summaryLocationDetailed': locationDetailedInput.value,
            'summaryMapsLink': mapsLinkInput.value ? `<a href="${mapsLinkInput.value}" target="_blank">${mapsLinkInput.value}</a>` : 'Não informado',
            'summaryLocationInstructions': locationInstructionsInput.value || 'Não informado',
            'summaryDuration': `${durationInput.value || 0} horas`,
            'summaryDifficulty': difficultyInput.value ? difficultyInput.options[difficultyInput.selectedIndex].text : '',
            'summaryPrice': `R$ ${parseFloat(priceInput.value || 0).toFixed(2)}`,
            'summaryMaxParticipants': maxParticipantsInput.value || '0',
            'summaryCancelationPolicy': cancelationPolicyInput.value ? cancelationPolicyInput.options[cancelationPolicyInput.selectedIndex].text : ''
        };
        for (const id in summaryFields) {
            const el = document.getElementById(id);
            if (el) {
                const span = el.querySelector('span');
                if (span) span.innerHTML = summaryFields[id]; else el.innerHTML += ` <span>${summaryFields[id]}</span>`;
            }
        }

        const datesUl = document.querySelector('#summaryDates ul');
        datesUl.innerHTML = '';
        if (datesAvailabilityArray.length > 0) {
            datesAvailabilityArray.forEach(dt => {
                const li = document.createElement('li');
                const dateObj = new Date(dt.date + 'T' + dt.time);
                li.textContent = dateObj.toLocaleDateString('pt-BR', {weekday:'short', day:'2-digit', month:'short', year:'numeric'}) + ' às ' + dt.time;
                datesUl.appendChild(li);
            });
        } else { datesUl.innerHTML = '<li>Nenhuma data/hora definida.</li>'; }

        const summaryMainImgEl = document.querySelector('#summaryMainImage img');
        if (uploadedMainImageFile) {
            const reader = new FileReader();
            reader.onload = e => { summaryMainImgEl.src = e.target.result; summaryMainImgEl.style.display = 'inline-block'; }
            reader.readAsDataURL(uploadedMainImageFile);
        } else if (editingTourData && editingTourData.mainImage) {
            summaryMainImgEl.src = `assets/images/${editingTourData.mainImage}`;
            summaryMainImgEl.style.display = 'inline-block';
        } else { summaryMainImgEl.style.display = 'none'; }

        const summaryGalleryDiv = document.getElementById('summaryGalleryImages');
        const strongLabel = summaryGalleryDiv.querySelector('strong');
        summaryGalleryDiv.innerHTML = ''; // Limpa tudo
        summaryGalleryDiv.appendChild(strongLabel); // Readiciona o "Galeria de Imagens:"
        
        let galleryHasImages = false;
        const combinedGalleryForSummary = [...existingGalleryImageNames, ...uploadedGalleryImageFiles];
        combinedGalleryForSummary.forEach(item => {
            const img = document.createElement('img');
            if (typeof item === 'string') { img.src = `assets/images/${item}`; } 
            else { const reader = new FileReader(); reader.onload = e => img.src = e.target.result; reader.readAsDataURL(item); }
            summaryGalleryDiv.appendChild(img);
            galleryHasImages = true;
        });
        if (!galleryHasImages) {
            const noImgSpan = document.createElement('span'); noImgSpan.textContent = ' Nenhuma imagem na galeria.';
            summaryGalleryDiv.appendChild(noImgSpan);
        }
    }
    
    function resetFormUIElements() {
        form.reset(); 
        tagsArray = []; renderTags();
        datesAvailabilityArray = []; renderDatesAvailability();
        uploadedMainImageFile = null;
        uploadedGalleryImageFiles = [];
        existingGalleryImageNames = [];
        if(mainImagePreview) {mainImagePreview.style.backgroundImage = 'none'; mainImagePreview.innerHTML = '<span class="placeholder-text"><i class="fas fa-camera"></i> Clique para enviar Imagem Principal</span>';}
        if(mainImageInfo) mainImageInfo.textContent = '';
        if(galleryPreviewContainer) galleryPreviewContainer.innerHTML = '';
        if(emptyGalleryPlaceholder) emptyGalleryPlaceholder.style.display = 'flex';
        if(shortDescCharCount) shortDescCharCount.textContent = "0/200";
        document.querySelectorAll('.field-validation-message').forEach(el => clearFieldValidation(el));
        document.querySelectorAll('.form-group input.error, .form-group select.error, .form-group textarea.error').forEach(el => el.classList.remove('error'));
        
        currentStep = 1; updateStepDisplay();
        confirmAccuracyCheckbox.checked = false;
        editingTourId = null; editingTourData = null;
        if(pageTitleElement) pageTitleElement.textContent = "Criar Novo Passeio";
        if(pageSubtitleElement) pageSubtitleElement.textContent = "Compartilhe sua experiência única com outros viajantes.";
        if(publishButton) publishButton.innerHTML = '<i class="fas fa-rocket"></i> Publicar Passeio';
        if(saveDraftButton) saveDraftButton.style.display = 'inline-flex';
    }

    function loadTourDataForEditing(tour) {
        editingTourData = {...tour}; // Copia os dados para evitar modificar o original no manager diretamente
        titleInput.value = tour.title || '';
        categoryInput.value = tour.category || '';
        shortDescInput.value = tour.shortDesc || '';
        updateCharCount(shortDescInput, shortDescCharCount, 200);
        tagsArray = tour.tags ? [...tour.tags] : []; renderTags();
        longDescInput.value = tour.longDesc || '';
        requirementsInput.value = tour.requirements || '';
        includedItemsCheckboxes.forEach(cb => { cb.checked = tour.includedItems?.includes(cb.value) || false; });

        if (tour.mainImage) {
            mainImagePreview.style.backgroundImage = `url('assets/images/${tour.mainImage}')`;
            mainImagePreview.innerHTML = '';
            if(mainImageInfo) mainImageInfo.textContent = `Atual: ${tour.mainImage}`;
        }
        existingGalleryImageNames = tour.galleryImages ? [...tour.galleryImages] : [];
        galleryPreviewContainer.innerHTML = '';
        if (existingGalleryImageNames.length > 0) {
            if(emptyGalleryPlaceholder) emptyGalleryPlaceholder.style.display = 'none';
            existingGalleryImageNames.forEach(imgName => renderGalleryPreviewItem(imgName, true));
        } else {
            if(emptyGalleryPlaceholder) emptyGalleryPlaceholder.style.display = 'flex';
        }
        locationDetailedInput.value = tour.locationDetailed || '';
        mapsLinkInput.value = tour.mapsLink || '';
        locationInstructionsInput.value = tour.locationInstructions || '';
        durationInput.value = tour.duration || '';
        difficultyInput.value = tour.difficulty || '';
        priceInput.value = tour.price || '';
        maxParticipantsInput.value = tour.maxParticipants || '';
        datesAvailabilityArray = tour.datesAvailability ? tour.datesAvailability.map(da => ({date: da.date, time: da.time})) : [];
        renderDatesAvailability();
        cancelationPolicyInput.value = tour.cancelationPolicy || '';
    }

    function checkForEditMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const tourIdFromUrl = urlParams.get('edit');
        if (tourIdFromUrl) {
            const tourDataFromStorage = passeiosManager.getPasseioById(tourIdFromUrl);
            if (tourDataFromStorage && tourDataFromStorage.creatorId === currentUser.id) {
                editingTourId = tourIdFromUrl;
                if(pageTitleElement) pageTitleElement.textContent = "Editar Passeio";
                if(pageSubtitleElement) pageSubtitleElement.textContent = "Atualize os detalhes da sua experiência.";
                if(publishButton) publishButton.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações';
                if(saveDraftButton) saveDraftButton.style.display = (tourDataFromStorage.status === 'draft') ? 'inline-flex' : 'none';
                loadTourDataForEditing(tourDataFromStorage);
            } else {
                alert("Passeio não encontrado ou você não tem permissão para editá-lo.");
                editingTourId = null; window.location.href = 'perfil.html';
            }
        }
    }
    
    // Em js/criar-passeio-features.js, substitua a função inteira

    // NO SEU ARQUIVO: js/criar-passeio-features.js

// ... (todo o código existente acima da função handleFormSubmission permanece o mesmo)

/**
 * Lida com a submissão final do formulário, tanto para salvar como rascunho
 * quanto para publicar o passeio.
 * @param {boolean} isDraft - True se o botão "Salvar Rascunho" foi clicado.
 */
// SUBSTITUA A FUNÇÃO INTEIRA NO SEU js/criar-passeio-features.js

async function handleFormSubmission(isDraft = false) {
    const token = auth.getTokenFromStorage();
    if (!token) {
        alert('Sessão expirada. Por favor, faça login novamente para continuar.');
        window.location.href = `login.html?redirect=criar-passeio.html`;
        return;
    }

    if (!isDraft && !validateStep(5)) { 
        displayGlobalFormStatus('<i class="fas fa-exclamation-circle"></i> Por favor, corrija os erros no formulário.', 'error');
        for (let i = 1; i <= formSteps.length; i++) {
            if (formSteps[i-1].querySelector('.error, .field-validation-message.error.visible')) {
                currentStep = i;
                updateStepDisplay();
                break;
            }
        }
        return;
    }

    // --- A CORREÇÃO ESTÁ AQUI ---
    // Agora estamos buscando o ID CORRETO: 'createPasseioForm'
    const formElement = document.getElementById('createPasseioForm');
    if (!formElement) {
        console.error('Elemento do formulário #createPasseioForm não encontrado!');
        return;
    }
    const formData = new FormData(formElement);
    // --- FIM DA CORREÇÃO ---


    // Adiciona o status correto ao FormData
    formData.append('status', isDraft ? 'rascunho' : 'pendente_aprovacao');

    // Adiciona os arquivos de imagem
    if (uploadedMainImageFile) {
        formData.append('imagem_principal', uploadedMainImageFile);
    }
    uploadedGalleryImageFiles.forEach(file => {
        formData.append('galeria_imagens', file);
    });

    publishButton.disabled = true;
    saveDraftButton.disabled = true;
    publishButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';

    try {
        const response = await fetch('http://localhost:3000/api/passeios', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'Não foi possível salvar o passeio.');
        }

        displayGlobalFormStatus(`<i class="fas fa-check-circle"></i> Passeio "${result.titulo}" salvo com sucesso! Redirecionando...`, 'success');
        
        setTimeout(() => {
            window.location.href = 'guia-painel/meus-passeios.html';
        }, 2500);

    } catch (error) {
        displayGlobalFormStatus(`<i class="fas fa-exclamation-circle"></i> Erro: ${error.message}`, 'error');
        publishButton.disabled = false;
        saveDraftButton.disabled = false;
        publishButton.innerHTML = '<i class="fas fa-rocket"></i> Publicar Passeio';
    }
}

// ... (o restante do seu código, como os event listeners dos botões, permanece o mesmo)

    form?.addEventListener('submit', (e) => { e.preventDefault(); handleFormSubmission(false); });
    saveDraftButton?.addEventListener('click', () => { handleFormSubmission(true); });

    updateStepDisplay(); 
    checkForEditMode(); 
    
    // Animações de scroll para a página (se não estiver no main.js)
    const scrollElements = document.querySelectorAll('.animate-on-scroll');
    const elementObserver = new IntersectionObserver((entries, observerInstance) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const animationType = el.dataset.animation || 'fadeIn';
                const delay = el.dataset.delay || '0s';
                el.style.animationDelay = delay;
                el.classList.add(animationType);
                el.style.opacity = 1;
                observerInstance.unobserve(el);
            }
        });
    }, { threshold: 0.1 });
    scrollElements.forEach(el => { 
        // Só aplicar opacity 0 para elementos que não são steps do formulário, pois eles têm seu próprio controle de display
        if (!el.classList.contains('form-step')) {
            el.style.opacity = 0; 
        }
        elementObserver.observe(el); 
    });
});