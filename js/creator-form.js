document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('creatorSignupForm');
    if (!form) return;

    const authInstance = new Auth();
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
        window.scrollTo(0, form.offsetTop - 20);
    }
    
    function showFieldError(input, message) {
        input.classList.add('error');
        const errorElement = input.closest('.form-group').querySelector('.field-validation-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function hideFieldError(input) {
        input.classList.remove('error');
        const errorElement = input.closest('.form-group').querySelector('.field-validation-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }

    // Lógica para validar a etapa atual
    function validateCurrentStep() {
        const currentFormStep = form.querySelector(`.form-step[data-step="${currentStep}"]`);
        let isValid = true;
        
        currentFormStep.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
            if (input.type === 'file') {
                if (input.files.length === 0) {
                    isValid = false;
                    const previewer = document.getElementById(input.id + '-preview');
                    if (previewer) previewer.classList.add('error-upload');
                } else {
                    const previewer = document.getElementById(input.id + '-preview');
                    if (previewer) previewer.classList.remove('error-upload');
                }
            } else if (input.type === 'checkbox') {
                if (!input.checked) {
                    isValid = false;
                    showFieldError(input, 'Você deve concordar com os termos.');
                } else {
                    hideFieldError(input);
                }
            } else if (!input.value.trim()) {
                isValid = false;
                showFieldError(input, 'Este campo é obrigatório.');
            } else {
                hideFieldError(input);
            }
        });
        
        return isValid;
    }

    nextStepBtns.forEach(button => {
        button.addEventListener('click', () => {
            if (validateCurrentStep()) {
                if (currentStep < formSteps.length) {
                    updateActiveStep(currentStep + 1);
                }
            } else {
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

    // Formatação de CPF e Telefone em tempo real
    const cpfInput = document.getElementById('creator-cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) value = value.substring(0, 3) + '.' + value.substring(3);
            if (value.length > 7) value = value.substring(0, 7) + '.' + value.substring(7);
            if (value.length > 11) value = value.substring(0, 11) + '-' + value.substring(11, 13);
            e.target.value = value;
        });
    }

    const phoneInput = document.getElementById('creator-phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) value = '(' + value;
            if (value.length > 3) value = value.substring(0, 3) + ') ' + value.substring(3);
            if (value.length > 10) value = value.substring(0, 10) + '-' + value.substring(10, 14);
            e.target.value = value;
        });
    }

    // Preview de Upload de Arquivos
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
                        if(placeholderText) placeholderText.style.display = 'none';
                        if (file.type.startsWith('image/')) {
                            const img = document.createElement('img');
                            img.src = e.target.result;
                            img.classList.add('preview-image');
                            previewLabel.innerHTML = '';
                            previewLabel.appendChild(img);
                        } else if (file.type === 'application/pdf') {
                            previewLabel.innerHTML = '';
                            const icon = document.createElement('i');
                            icon.className = 'fas fa-file-pdf';
                            icon.style.fontSize = '3rem';
                            icon.style.color = '#DE2C2C';
                            
                            const fileName = document.createElement('p');
                            fileName.textContent = file.name;
                            fileName.style.marginTop = '0.5rem';
                            fileName.style.fontSize = '0.8rem';

                            previewLabel.appendChild(icon);
                            previewLabel.appendChild(fileName);
                        } else {
                            if(placeholderText) placeholderText.style.display = 'flex';
                            previewLabel.innerHTML = '<span class="placeholder-text"><i class="fas fa-cloud-upload-alt"></i>Arquivo não suportado</span>';
                        }
                    }
                    reader.readAsDataURL(file);
                    previewLabel.classList.remove('error-upload');
                }
            });
        }
    });

    if (certificatesInput) {
        certificatesInput.addEventListener('change', function(event) {
            const certificateFileList = document.getElementById('certificate-file-list');
            certificateFileList.innerHTML = '';
            if (event.target.files.length > 0) {
                const title = document.createElement('p');
                title.innerHTML = '<strong>Arquivos selecionados:</strong>';
                certificateFileList.appendChild(title);

                Array.from(event.target.files).forEach(file => {
                    const fileItem = document.createElement('div');
                    fileItem.classList.add('file-item');
                    fileItem.textContent = file.name;
                    certificateFileList.appendChild(fileItem);
                });
            }
        });
    }

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (!validateCurrentStep()) {
            alert('Por favor, preencha todos os campos obrigatórios antes de prosseguir.');
            return;
        }

        const token = authInstance.getTokenFromStorage();
        if (!token) {
            alert('Sessão expirada. Por favor, faça login novamente para continuar.');
            window.location.href = 'login.html';
            return;
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const payload = {
            nome_publico: data.creatorFullname,
            bio_publica: data.creatorExperience,
            cpf: data.creatorCpf,
            numero_cadastur: data.creatorCadastur,
            tagline: 'Anfitrião de Passeios na Serra',
        };

        fetch('http://localhost:3000/api/candidatar-guia', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Erro ao enviar o formulário.'); });
            }
            return response.json();
        })
        .then(result => {
            alert('Cadastro de criador enviado para análise! Você será redirecionado para o seu perfil.');
            window.location.href = 'perfil.html';
        })
        .catch(error => {
            console.error('Erro na submissão do formulário:', error);
            alert(error.message);
        });
    });

    const menuToggle = document.querySelector('.page-menu-toggle');
    const sidebarMenu = document.getElementById('sidebarMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const closeMenuBtn = document.getElementById('closeMenuBtn');

    function toggleMenu() {
        if (sidebarMenu) sidebarMenu.classList.toggle('open');
        if (menuOverlay) menuOverlay.classList.toggle('active');
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

    const dynamicStyles = `
        .form-control.error { border-color: #e53935 !important; }
        .upload-preview.error-upload { border-color: #e53935 !important; }
        .filter-option input[type="checkbox"].error + span { color: #e53935 !important; }
        .field-validation-message { display:none; color:#c62828; font-size: 0.8rem; margin-top: 4px;}
        .form-group input.error + .field-validation-message,
        .form-group textarea.error + .field-validation-message,
        .form-group select.error + .field-validation-message { display: block; }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = dynamicStyles;
    document.head.appendChild(styleSheet);
});