document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM - Abas
    const tabButtons = document.querySelectorAll('.guide-profile-edit-tabs .tab-btn');
    const tabContents = document.querySelectorAll('.guide-profile-edit-content .tab-content');

    // Instâncias
    const auth = new Auth();
    const currentUser = auth.getCurrentUser();

    // --- Lógica das Abas ---
    tabButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const targetTab = this.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === targetTab) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });

    // --- Carregar Dados do Guia nos Formulários (Simulação) ---
    function loadGuideDataIntoForms() {
        if (!currentUser) {
            alert("Erro: Guia não está logado.");
            window.location.href = "../login.html"; // Redireciona
            return;
        }

        // Aba Perfil Público
        const publicNameInput = document.getElementById('guide-public-name');
        const taglineInput = document.getElementById('guide-tagline');
        const avatarPreview = document.getElementById('guide-avatar-preview-display');
        const bannerPreview = document.getElementById('guide-banner-preview-display');
        const publicBioTextarea = document.getElementById('guide-public-bio');

        if(publicNameInput) publicNameInput.value = currentUser.publicName || currentUser.name || ''; // Nome público, fallback para nome
        if(taglineInput) taglineInput.value = currentUser.tagline || '';
        if(avatarPreview && currentUser.avatarUrl) avatarPreview.style.backgroundImage = `url('${currentUser.avatarUrl}')`;
        if(bannerPreview && currentUser.bannerUrl) bannerPreview.style.backgroundImage = `url('${currentUser.bannerUrl}')`;
        if(publicBioTextarea) publicBioTextarea.value = currentUser.publicBio || currentUser.experience || ''; // Bio pública, fallback para experiência do cadastro-criador

        // Aba Dados Pessoais
        const fullNameConfidential = document.getElementById('guide-fullname-confidential');
        const cpfConfidential = document.getElementById('guide-cpf-confidential');
        // ... carregar telefone, data de nascimento, endereço ...

        if(fullNameConfidential) fullNameConfidential.value = currentUser.name || ''; // Nome completo do documento
        if(cpfConfidential) cpfConfidential.value = currentUser.cpf || 'Não informado (Contate Suporte)';
        
        // Aba Informações Profissionais
        const cadasturInput = document.getElementById('edit-creator-cadastur');
        const languagesInput = document.getElementById('edit-guide-languages');
        if(cadasturInput) cadasturInput.value = currentUser.cadasturNumber || '';
        if(languagesInput && currentUser.languages) languagesInput.value = currentUser.languages.join(', ');

        // Aba Dados Bancários
        const bankNameInput = document.getElementById('bank-name');
        if (bankNameInput && currentUser.bankDetails) { // Supondo que bankDetails seja um objeto
            bankNameInput.value = currentUser.bankDetails.bankName || '';
            document.getElementById('bank-agency').value = currentUser.bankDetails.bankAgency || '';
            document.getElementById('bank-account').value = currentUser.bankDetails.bankAccount || '';
            document.getElementById('bank-account-type').value = currentUser.bankDetails.bankAccountType || 'corrente';
            document.getElementById('bank-holder-document').value = currentUser.bankDetails.bankHolderDocument || '';
        }
        
        // Carregar lista de certificados e documentos atuais (simulado)
        // ...
    }


    // --- Lógica de Preview para Uploads ---
    function setupFileUploadPreview(inputId, previewDisplayId) {
        const fileInput = document.getElementById(inputId);
        const previewDisplay = document.getElementById(previewDisplayId);
        if (!fileInput || !previewDisplay) return;

        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewDisplay.style.backgroundImage = `url('${e.target.result}')`;
                    const placeholder = previewDisplay.querySelector('.placeholder-text');
                    if(placeholder) placeholder.style.display = 'none';
                }
                reader.readAsDataURL(file);
            }
        });
    }
    setupFileUploadPreview('guide-avatar-upload', 'guide-avatar-preview-display');
    setupFileUploadPreview('guide-banner-upload', 'guide-banner-preview-display');
    // Setup para outros uploads de documentos...

    // Upload múltiplo de certificados (similar a creator-form.js)
    const certificatesInputEdit = document.getElementById('edit-doc-certificates');
    const certificateFileListEdit = document.getElementById('edit-certificate-list');

    if (certificatesInputEdit && certificateFileListEdit) {
        // TODO: Carregar certificados já existentes
        // Ex: if (currentUser.certificates) { renderExistingFiles(currentUser.certificates, certificateFileListEdit); }

        certificatesInputEdit.addEventListener('change', function(event) {
            // Limpar apenas os "novos" se quiser manter os antigos listados
            // ou limpar tudo e adicionar antigos + novos.
            // Por simplicidade, vamos apenas mostrar os novos selecionados:
            certificateFileListEdit.innerHTML = '<strong>Novos arquivos selecionados:</strong><br>';
             if (event.target.files.length > 0) {
                Array.from(event.target.files).forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.classList.add('file-item');
                    fileItem.textContent = file.name;
                    certificateFileListEdit.appendChild(fileItem);
                });
            }
        });
    }


    // --- Submissão dos Formulários (Simulação) ---
    function handleFormSubmit(formId, successMessage) {
        const form = document.getElementById(formId);
        if (form) {
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());
                
                // Simulação de atualização no objeto currentUser e no localStorage
                if (currentUser) {
                    let updatedData = {};
                    // Mapear campos do formulário para o objeto currentUser
                    // Exemplo para Perfil Público:
                    if (formId === "guidePublicProfileForm") {
                        updatedData.publicName = data.publicName;
                        updatedData.tagline = data.tagline;
                        updatedData.publicBio = data.publicBio;
                        // Lidar com upload de avatar e banner aqui (armazenar nome ou simular)
                        if (data.avatarUpload && data.avatarUpload.name) updatedData.avatarUrl = `simulated/path/${data.avatarUpload.name}`;
                        if (data.bannerUpload && data.bannerUpload.name) updatedData.bannerUrl = `simulated/path/${data.bannerUpload.name}`;
                    }
                    // Adicionar mapeamento para outros formulários
                    // ...

                    if(auth.updateCurrentUserData(updatedData)){ // Usa a função de auth.js
                        alert(successMessage + " (Simulação)");
                    } else {
                        alert("Erro ao salvar. Verifique se está logado.");
                    }
                }
                console.log(`Dados do formulário ${formId}:`, data);
            });
        }
    }

    handleFormSubmit('guidePublicProfileForm', 'Perfil público atualizado com sucesso!');
    handleFormSubmit('guidePersonalDetailsForm', 'Dados pessoais atualizados com sucesso!');
    handleFormSubmit('guideDocumentsForm', 'Documentos enviados para verificação!');
    handleFormSubmit('guideProfessionalInfoForm', 'Informações profissionais atualizadas com sucesso!');
    handleFormSubmit('guideBankDetailsForm', 'Dados bancários atualizados com sucesso!');


    // --- Inicialização ---
    loadGuideDataIntoForms();

    // Lógica do menu lateral do guia (já deve estar em guia-painel.js)
    // ...
});