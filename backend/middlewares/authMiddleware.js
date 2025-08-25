// ARQUIVO: backend/middlewares/authMiddleware.js

const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // --- ESTA É A CORREÇÃO CRUCIAL ---
        // O ID do usuário no token (decoded.userId) é uma string.
        // Precisamos convertê-lo para BigInt para que o Prisma possa encontrar o usuário no banco.
        const usuario = await prisma.usuario.findUnique({
            where: { id: BigInt(decoded.userId) } 
        });
        // --- FIM DA CORREÇÃO ---

        if (!usuario) {
            return res.status(401).json({ message: 'Acesso negado. Usuário do token não encontrado.' });
        }
        
        // Anexa o objeto do usuário completo na requisição para ser usado nas próximas rotas (como /api/perfil)
        req.usuario = usuario;
        
        next(); // Passa para a próxima etapa (a rota /api/perfil)

    } catch (error) {
        console.error("Erro no middleware de autenticação:", error);
        return res.status(401).json({ message: 'Acesso negado. Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;