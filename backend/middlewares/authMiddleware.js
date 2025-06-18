const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const segredo = 'NOSSO_SEGREDO_SUPER_SECRETO'; // O mesmo segredo que usaremos no server.js

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  // O token vem no formato "Bearer [token]". Vamos separar as duas partes.
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado.' });
  }

  // Verifica se o token é válido
  jwt.verify(token, segredo, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }

    try {
      // Busca o usuário completo no banco de dados usando o ID do token
      const usuario = await prisma.usuario.findUnique({
        where: { id: BigInt(decoded.id) }
      });

      if (!usuario) {
        return res.status(401).json({ message: 'Usuário do token não encontrado.' });
      }

      // Anexa o objeto de usuário inteiro na requisição para usarmos nas rotas
      req.user = usuario;
      
      return next(); // Deixa a requisição continuar para a rota final

    } catch (dbError) {
      return res.status(500).json({ message: 'Erro ao validar usuário no banco de dados.' });
    }
  });
}

module.exports = authMiddleware;