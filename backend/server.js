// --- COLE TODO ESTE CÓDIGO NO SEU server.js ---

// 1. Importação das bibliotecas que vamos usar
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const authMiddleware = require('./middlewares/authMiddleware');
const cors = require('cors');
BigInt.prototype.toJSON = function() {       
  return this.toString();
};

// 2. Inicialização do servidor e do Prisma
const app = express();
const prisma = new PrismaClient();
const port = 3000;

// 3. Middleware para o servidor entender JSON
// Essencial para receber os dados do formulário de cadastro
app.use(cors()); // Permite requisições de outros domínios (CORS)
app.use(express.json());

// 4. Definição das Rotas da API

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor do Passeios da Serra está no ar e pronto para receber requisições!');
});

/**
 * ROTA PARA CRIAR UM NOVO USUÁRIO (Cadastro)
 */
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nome_completo, email, senha } = req.body;

    // Criptografa a senha antes de salvar no banco
    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(senha, saltRounds);

    // Usa o Prisma para criar o novo usuário no banco de dados
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome_completo: nome_completo,
        email: email,
        senha_hash: senha_hash,
      },
    });

    // Retorna uma resposta de sucesso com os dados do usuário criado
    // (removendo a senha da resposta por segurança)
    const { senha_hash: _, ...usuarioSemSenha } = novoUsuario;
    res.status(201).json(usuarioSemSenha);

  } catch (error) {
    // Se der erro (ex: email já existe), retorna um erro
    console.error(error);
    res.status(400).json({ message: 'Não foi possível criar o usuário. O e-mail já pode estar em uso.' });
  }
});

// 5. Comando para iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

/**
 * ROTA PARA FAZER LOGIN DE UM USUÁRIO
 */
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;

    // 1. Encontrar o usuário pelo email no banco de dados
    const usuario = await prisma.usuario.findUnique({
      where: { email: email }
    });

    // Se o usuário não for encontrado, retorna um erro genérico por segurança
    if (!usuario) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    // 2. Compara a senha enviada com a senha criptografada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    // Se a senha não for válida, retorna o mesmo erro genérico
    if (!senhaValida) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }

    // 3. Se a senha for válida, gera o Token JWT (o "crachá")
    const jwt = require('jsonwebtoken');
    const segredo = 'NOSSO_SEGREDO_SUPER_SECRETO'; // IMPORTANTE: No futuro, isso deve ir para o arquivo .env!

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email }, // Informações que vão dentro do token
      segredo,
      { expiresIn: '8h' } // Duração do token (ex: 8 horas)
    );

    // 4. Envia o token de volta como resposta de sucesso
    res.status(200).json({ message: "Login bem-sucedido!", token: token });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ocorreu um erro no servidor." });
  }
});

/**
 * ROTA PROTEGIDA PARA BUSCAR DADOS DO PERFIL
 */
app.get('/api/perfil', authMiddleware, async (req, res) => {
  try {
    // O ID do usuário foi adicionado ao 'req' pelo nosso authMiddleware
    const userId = req.userId;

    const usuario = await prisma.usuario.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const { senha_hash: _, ...perfil } = usuario;
    res.status(200).json(perfil);

  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil.' });
  }
});

