// /js/auth.js

class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('passeios-da-serra-current-user')) || null;
    }

    /**
     * Obtém o token JWT do localStorage.
     * @returns {string|null} O token ou null se não existir.
     */
    getTokenFromStorage() {
        return localStorage.getItem('passeios-da-serra-token');
    }

    /**
     * Tenta registrar um novo usuário na API.
     * @param {string} nome_completo - O nome completo do usuário.
     * @param {string} email - O email do usuário.
     * @param {string} senha - A senha do usuário.
     * @returns {Promise<{success: boolean, message: string}>} Um objeto indicando o sucesso da operação.
     */
    async register(nome_completo, email, senha) {
        try {
            const response = await fetch('http://localhost:3000/api/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome_completo, email, senha }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro desconhecido ao cadastrar.');
            }
            
            return { success: true, message: 'Cadastro realizado com sucesso!' };

        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            return { success: false, message: error.message };
        }
    }

    /**
     * Tenta autenticar um usuário e, se bem-sucedido, armazena o token e os dados do perfil.
     * @param {string} email - O email do usuário.
     * @param {string} senha - A senha do usuário.
     * @returns {Promise<{success: boolean, message?: string, user?: object}>} Um objeto indicando o sucesso e os dados do usuário.
     */
    async login(email, senha) {
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha: senha }),
            });

            const data = await response.json();
            if (!response.ok) {
                return { success: false, message: data.message || 'Erro no login.' };
            }
            
            if (data.token) {
                localStorage.setItem('passeios-da-serra-token', data.token);

                const profileResponse = await fetch('http://localhost:3000/api/perfil', {
                    headers: { 'Authorization': `Bearer ${data.token}` }
                });

                if (!profileResponse.ok) {
                    return { success: false, message: 'Login bem-sucedido, mas não foi possível buscar o perfil.' };
                }

                const userProfile = await profileResponse.json();
                this.currentUser = userProfile;
                localStorage.setItem('passeios-da-serra-current-user', JSON.stringify(this.currentUser));
                
                return { success: true, user: this.currentUser };
            }
            return { success: false, message: 'Token não recebido do servidor.' };

        } catch (error) {
            console.error('Erro de conexão no login:', error);
            return { success: false, message: 'Não foi possível conectar ao servidor.' };
        }
    }

    /**
     * Desloga o usuário, limpando o token e os dados do localStorage.
     */
    logout() {
        this.currentUser = null;
        localStorage.removeItem('passeios-da-serra-current-user');
        localStorage.removeItem('passeios-da-serra-token');
        console.log('Usuário deslogado, localStorage limpo.');
    }

    /**
     * Verifica se o usuário está autenticado (se existe um token).
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!this.getTokenFromStorage();
    }

    /**
     * Obtém os dados do usuário logado diretamente do localStorage.
     * @returns {object|null}
     */
    getCurrentUser() {
        return JSON.parse(localStorage.getItem('passeios-da-serra-current-user')) || null;
    }
}