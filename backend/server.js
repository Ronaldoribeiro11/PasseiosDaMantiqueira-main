// --- VERSÃO CORRIGIDA E COMPLETA DO server.js ---

// 1. Importação das bibliotecas
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');
const jwt = require('jsonwebtoken');

// Correção para o erro do BigInt ao converter para JSON
BigInt.prototype.toJSON = function() {       
  return this.toString();
};

// 2. Inicialização
const app = express();
const prisma = new PrismaClient();
const port = 3000;

// 3. Middlewares
app.use(cors());
app.use(express.json());

// 4. Definição das Rotas da API

// Rota de teste
app.get('/', (req, res) => {
  res.send('Servidor do Passeios da Serra está no ar e pronto para receber requisições!');
});

// Rota de Cadastro
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nome_completo, email, senha } = req.body;
    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(senha, saltRounds);
    const novoUsuario = await prisma.usuario.create({
      data: { nome_completo, email, senha_hash },
    });
    const { senha_hash: _, ...usuarioSemSenha } = novoUsuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error) {
    console.error(error);
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'O e-mail fornecido já está em uso.' });
    }
    res.status(500).json({ message: 'Não foi possível criar o usuário.' });
  }
});

// Rota de Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ message: "Email ou senha inválidos." });
    }
    const segredo = 'NOSSO_SEGREDO_SUPER_SECRETO';
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, segredo, { expiresIn: '8h' });
    res.status(200).json({ message: "Login bem-sucedido!", token: token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Ocorreu um erro no servidor." });
  }
});

// Rota de Perfil
app.get('/api/perfil', authMiddleware, async (req, res) => {
  try {
    const { senha_hash: _, ...perfil } = req.user;
    res.status(200).json(perfil);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil.' });
  }
});

// Rota de Criação de Passeios
app.post('/api/passeios', authMiddleware, async (req, res) => {
  try {
    const usuario = req.user;
    if (usuario.tipo_de_usuario !== 'guia') {
      return res.status(403).json({ message: 'Acesso negado. Apenas guias podem criar passeios.' });
    }
    const perfilGuia = await prisma.perfilDeGuia.findUnique({
      where: { usuario_id: usuario.id }
    });
    if (!perfilGuia) {
      return res.status(400).json({ message: 'Perfil de guia não encontrado.' });
    }
    const dadosDoPasseio = req.body;
    const novoPasseio = await prisma.passeio.create({
      data: {
        titulo: dadosDoPasseio.titulo,
        descricao_curta: dadosDoPasseio.descricao_curta,
        descricao_longa: dadosDoPasseio.descricao_longa,
        preco: parseFloat(dadosDoPasseio.preco),
        duracao_horas: parseFloat(dadosDoPasseio.duracao_horas),
        dificuldade: dadosDoPasseio.dificuldade,
        localizacao_geral: dadosDoPasseio.localizacao_geral,
        politica_cancelamento: dadosDoPasseio.politica_cancelamento,
        guia_id: perfilGuia.id,
        categoria_id: parseInt(dadosDoPasseio.categoria_id) || 1,
      }
    });
    res.status(201).json(novoPasseio);
  } catch (error) {
    console.error("Erro ao criar passeio:", error);
    res.status(500).json({ message: 'Erro interno ao criar passeio.' });
  }
});


// 5. Comando para iniciar o servidor (AGORA NO LUGAR CERTO, NO FINAL DE TUDO)
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});