document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('creatorSignupForm');
    if (!form) return;

    const stepIndicators = form.querySelectorAll('.step-indicator');
    const formSteps = form.querySelectorAll('.form-step');
    const nextStepBtns = form.querySelectorAll('[data-next-step]');
    const prevStepBtns = form.querySelectorAll('[data-prev-step]');
    let currentStep = 1;

    function updateActiveStep(targetStep) {
        formSteps.forEach(step => step.classList.remove('active'));
        const newActiveStep = form.querySelector(`.form-step[data-step="${targetStep}"]`);
        if (newActiveStep) {
            newActiveStep.classList.add('active');
        }

        stepIndicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            const stepNumber = parseInt(indicator.getAttribute('data-step'));
            if (stepNumber < targetStep) {
                indicator.classList.add('completed');
            } else if (stepNumber === targetStep) {
                indicator.classList.add('active');
            }
        });
        currentStep = targetStep;
        window.scrollTo(0, form.offsetTop - 20); // Rola para o topo do formulário
    }

    nextStepBtns.forEach(button => {
        button.addEventListener('click', () => {
            const currentFormStep = form.querySelector(`.form-step[data-step="${currentStep}"]`);
            let isValid = true;
            // Validação simples dos campos obrigatórios da etapa atual
            currentFormStep.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
                if (!input.value.trim() && input.type !== 'file') { // Arquivos são validados de forma diferente
                    isValid = false;
                    input.classList.add('error'); // Você precisará de estilos para .error
                    // Adicionar mensagem de erro perto do input se desejar
                } else if (input.type === 'checkbox' && !input.checked) {
                    isValid = false;
                    input.classList.add('error');
                    // Para o checkbox de termos, pode-se adicionar um alerta ou mensagem específica
                } else if (input.type === 'file' && input.required && input.files.length === 0) {
                    isValid = false;
                    // Encontrar o .upload-preview associado e adicionar classe de erro
                    const previewer = document.getElementById(input.id + '-preview');
                    if (previewer) previewer.classList.add('error-upload'); // Estilo para .error-upload
                }
                else {
                    input.classList.remove('error');
                     const previewer = document.getElementById(input.id + '-preview');
                    if (previewer) previewer.classList.remove('error-upload');
                }
            });

            if (isValid && currentStep < formSteps.length) {
                updateActiveStep(currentStep + 1);
            } else if (!isValid) {
                alert('Por favor, preencha todos os campos obrigatórios (*) antes de prosseguir.');
            }
        });
    });

    prevStepBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (currentStep > 1) {
                updateActiveStep(currentStep - 1);
            }
        });
    });

    // Preview de Upload de Arquivos (Singular)
    const fileUploadPreviews = form.querySelectorAll('.upload-preview');
    fileUploadPreviews.forEach(previewLabel => {
        const inputId = previewLabel.htmlFor;
        const fileInput = document.getElementById(inputId);
        
        if (fileInput) {
            fileInput.addEventListener('change', function(event) {
                const file = event.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    const placeholderText = previewLabel.querySelector('.placeholder-text');
                    
                    reader.onload = function(e) {
                        if(placeholderText) placeholderText.style.display = 'none'; // Esconde placeholder
                        
                        if (file.type.startsWith('image/')) {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.classList.add('preview-image');
                            previewLabel.innerHTML = ''; // Limpa qualquer conteúdo anterior
                            previewLabel.appendChild(img);
                        } else if (file.type === 'application/pdf') {
                            previewLabel.innerHTML = ''; // Limpa
                            const icon = document.createElement('i');
                            icon.className = 'fas fa-file-pdf';
                            icon.style.fontSize = '3rem';
                            icon.style.color = '#DE2C2C'; // Cor típica para PDF
                            
                            const fileName = document.createElement('p');
                            fileName.textContent = file.name;
                            fileName.style.marginTop = '0.5rem';
                            fileName.style.fontSize = '0.8rem';

                            previewLabel.appendChild(icon);
                            previewLabel.appendChild(fileName);
                        } else {
                             if(placeholderText) placeholderText.style.display = 'flex'; // Mostra placeholder se não for imagem/pdf
                             previewLabel.innerHTML = '<span class="placeholder-text"><i class="fas fa-cloud-upload-alt"></i>Arquivo não suportado</span>';
                        }
                    }
                    reader.readAsDataURL(file);
                    previewLabel.classList.remove('error-upload'); // Remove erro ao selecionar arquivo
                }
            });
        }
    });

    // Lista de arquivos para upload múltiplo (certificados)
    const certificatesInput = document.getElementById('doc-certificates');
    const certificateFileList = document.getElementById('certificate-file-list');

    if (certificatesInput && certificateFileList) {
        certificatesInput.addEventListener('change', function(event) {
            certificateFileList.innerHTML = ''; // Limpa a lista anterior
            if (event.target.files.length > 0) {
                const title = document.createElement('p');
                title.innerHTML = '<strong>Arquivos selecionados:</strong>';
                certificateFileList.appendChild(title);

                Array.from(event.target.files).forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.classList.add('file-item');
                    fileItem.textContent = file.name;
                    // Poderia adicionar um botão de remover aqui se necessário
                    certificateFileList.appendChild(fileItem);
                });
            }
        });
    }


    // Simulação de Envio do Formulário
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        // Última validação antes de submeter
        const currentFormStep = form.querySelector(`.form-step[data-step="${currentStep}"]`);
         let isFormValid = true;
         currentFormStep.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
             if (input.type === 'checkbox' && !input.checked) {
                isFormValid = false;
                alert('Você deve concordar com os Termos e Condições para prosseguir.');
                input.closest('.form-group').scrollIntoView({behavior: 'smooth', block: 'center'});
             }
         });

        if (!isFormValid) return;

        // Coletar dados do formulário (Exemplo)
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            // Para campos de arquivo, você pode querer apenas o nome ou lidar com o objeto File
            if (value instanceof File) {
                data[key] = value.name; // Ou value para o objeto File completo
            } else {
                data[key] = value;
            }
        }
        console.log('Dados do Formulário de Criador:', data);
        alert('Cadastro de criador enviado para análise! Entraremos em contato em breve.');
        // Aqui você redirecionaria ou limparia o formulário
        // window.location.href = 'perfil.html'; // Exemplo
        form.reset();
        updateActiveStep(1); // Volta para a primeira etapa
        // Limpar previews de arquivo
        document.querySelectorAll('.upload-preview').forEach(p => {
            p.innerHTML = '<span class="placeholder-text"><i class="fas fa-cloud-upload-alt"></i>Clique para enviar</span>';
        });
        if(certificateFileList) certificateFileList.innerHTML = '';

    });

    // Lógica para o menu lateral (se já não estiver em main.js)
    const menuToggle = document.querySelector('.page-menu-toggle'); // Ou a classe que você usar
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    function toggleMenu() {
        if (sidebarMenu) sidebarMenu.classList.toggle('open');
        if (menuOverlay) menuOverlay.classList.toggle('active');
        // document.body.classList.toggle('no-scroll'); // Se quiser impedir scroll do body
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    if (menuOverlay) {
        menuOverlay.addEventListener('click', toggleMenu);
    }
    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', toggleMenu);
    }

     // Adicionar estilos de erro se não existirem no seu style.css principal
    const dynamicStyles = `
        .form-control.error { border-color: #e53935 !important; }
        .upload-preview.error-upload { border-color: #e53935 !important; }
        .filter-option input[type="checkbox"].error + span { color: #e53935 !important; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = dynamicStyles;
    document.head.appendChild(styleSheet);
    // Dentro do form.addEventListener('submit', function(event) { ... });
    // Após coletar os dados em const data = {};

    // Supondo que 'auth' seja uma instância global de Auth ou que você a crie aqui.
    // Para consistência, se 'auth' não for global, crie-a:
    const authInstance = new Auth(); // Se não houver uma instância global acessível
    
    const creatorDataPayload = {
        // Mapeie os campos de 'data' para os campos do objeto do usuário em auth.js
        cpf: data.creatorCpf,
        birthDate: data.creatorBirthdate,
        fullAddress: { // Exemplo de como agrupar o endereço
            cep: data.creatorCep,
            street: data.creatorStreet,
            number: data.creatorNumber,
            complement: data.creatorComplement,
            neighborhood: data.creatorNeighborhood,
            city: data.creatorCity,
            state: data.creatorState
        },
        phone: data.creatorPhone, // Se quiser atualizar/confirmar
        // Para arquivos, você pode armazenar os nomes, ou futuramente, URLs após upload real
        docIdFrontName: data.docIdFront,
        docIdBackName: data.docIdBack,
        docProofAddressName: data.docProofAddress,
        docSelfieName: data.docSelfie,
        cadasturNumber: data.creatorCadastur,
        experience: data.creatorExperience,
        // Os próprios arquivos de certificado podem ser tratados separadamente para upload
        agreedToCreatorTerms: data.agreeTerms === 'on', // 'on' é o valor de um checkbox marcado
        creatorStatus: 'pending_verification' // Define o status após o envio
    };

    if (authInstance.updateCurrentUserData(creatorDataPayload)) {
        alert('Cadastro de criador enviado para análise! Você será redirecionado para o seu perfil.');
        // Idealmente, redirecionar para uma página que mostre o status "Em Análise"
        window.location.href = 'perfil.html';
    } else {
        alert('Erro ao enviar os dados. Verifique se você está logado e tente novamente.');
    }
    // Não reseta o formulário ou volta a etapa, pois há redirecionamento
    // form.reset();
    // updateActiveStep(1); 
    // ...

});