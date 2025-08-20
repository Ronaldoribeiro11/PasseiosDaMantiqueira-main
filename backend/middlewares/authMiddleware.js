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

        const usuario = await prisma.usuario.findUnique({
            // AQUI ESTÁ A CORREÇÃO ESSENCIAL:
            where: { id: BigInt(decoded.userId) } 
        });

        if (!usuario) {
            return res.status(401).json({ message: 'Acesso negado. Usuário do token não encontrado.' });
        }

        req.usuario = usuario;
        
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Acesso negado. Token inválido ou expirado.' });
    }
};

module.exports = authMiddleware;