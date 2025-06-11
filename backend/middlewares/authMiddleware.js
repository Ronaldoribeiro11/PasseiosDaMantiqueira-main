const jwt = require('jsonwebtoken');
const segredo = 'NOSSO_SEGREDO_SUPER_SECRETO'; // O mesmo segredo do server.js

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  // O token vem no formato "Bearer [token]". Vamos separar.
  const parts = authHeader.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ message: 'Erro no formato do token.' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ message: 'Token mal formatado.' });
  }

  // Verifica se o token é válido
  jwt.verify(token, segredo, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token inválido.' });
    }

    // Se for válido, guarda o id do usuário na requisição para usarmos depois
    req.userId = decoded.id;
    return next(); // Deixa a requisição continuar para a rota final
  });
}

module.exports = authMiddleware;