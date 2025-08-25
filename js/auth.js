// Em js/auth.js

class Auth {
    constructor() {
        // Não precisamos mais do `this.users` no frontend
        this.currentUser = JSON.parse(localStorage.getItem('passeios-da-serra-current-user')) || null;
    }

    getTokenFromStorage() {
        return localStorage.getItem('passeios-da-serra-token');
    }
    
    async login(email, password) {
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, senha: password }),
            });

            const data = await response.json();
            if (!response.ok) {
                return { success: false, message: data.message || 'Erro no login.' };
            }
            
            // Se o login foi bem-sucedido, guarda o token
            if (data.token) {
                localStorage.setItem('passeios-da-serra-token', data.token);

                // Com o token, busca os dados do perfil
                const profileResponse = await fetch('http://localhost:3000/api/perfil', {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });

                if (!profileResponse.ok) {
                    return { success: false, message: 'Login bem-sucedido, mas não foi possível buscar o perfil.' };
                }

                // Guarda os dados do perfil no localStorage
                const userProfile = await profileResponse.json();
                this.currentUser = userProfile;
                localStorage.setItem('passeios-da-serra-current-user', JSON.stringify(this.currentUser));
                
                return { success: true, user: this.currentUser };
            }
        } catch (error) {
            console.error('Erro de conexão:', error);
            return { success: false, message: 'Não foi possível conectar ao servidor.' };
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('passeios-da-serra-current-user');
        localStorage.removeItem('passeios-da-serra-token'); // <-- Linha importante
        window.location.href = 'index.html'; // Redireciona para a página inicial
    }

    isAuthenticated() {
        return !!this.getTokenFromStorage();
    }

    getCurrentUser() {
        // Garante que estamos sempre lendo a versão mais atual do localStorage
        return JSON.parse(localStorage.getItem('passeios-da-serra-current-user')) || null;
    }

    // Este método continuará útil para atualizar dados no frontend
    updateCurrentUserData(dataToUpdate) {
        if (!this.currentUser) return false;
        
        // No futuro, este método também fará uma chamada `PUT` para a API
        this.currentUser = { ...this.currentUser, ...dataToUpdate };
        localStorage.setItem('passeios-da-serra-current-user', JSON.stringify(this.currentUser));
        
        console.log('User data updated in localStorage:', this.currentUser);
        return true;
    }
}