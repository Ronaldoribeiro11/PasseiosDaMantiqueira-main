// ARQUIVO: backend/server.js

// 1. CARREGA AS VARIÁVEIS DE AMBIENTE DO ARQUIVO .env
require('dotenv').config();

// 2. IMPORTAÇÃO DAS BIBLIOTECAS
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// 3. CONFIGURAÇÃO DO MULTER (UPLOAD DE ARQUIVOS)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// 4. INICIALIZAÇÃO
const app = express();
const prisma = new PrismaClient();
const port = 3000;

// Correção para o erro de serialização do BigInt
BigInt.prototype.toJSON = function() {
  return this.toString();
};

// 5. MIDDLEWARES GLOBAIS
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROTAS DA API ---

app.get('/', (req, res) => {
  res.send('Servidor do Passeios da Serra está no ar!');
});

// Rota de Cadastro de Usuários (PÚBLICA)
app.post('/api/usuarios', async (req, res) => {
  try {
    const { nome_completo, email, senha } = req.body;
    
    // Validação básica
    if (!nome_completo || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }
    if (senha.length < 8) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres.' });
    }

    const saltRounds = 10;
    const senha_hash = await bcrypt.hash(senha, saltRounds);
    const novoUsuario = await prisma.usuario.create({
      data: { nome_completo, email, senha_hash },
    });
    const { senha_hash: _, ...usuarioSemSenha } = novoUsuario;
    res.status(201).json(usuarioSemSenha);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'O e-mail fornecido já está em uso.' });
    }
    console.error("Erro no cadastro:", error);
    res.status(500).json({ message: 'Não foi possível criar o usuário.' });
  }
});

// Rota de Login (PÚBLICA)
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
    
    const token = jwt.sign(
        { userId: usuario.id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
    );

    res.status(200).json({ message: "Login bem-sucedido!", token: token });
  } catch (error) {
    console.error('Erro na rota de login:', error); 
    res.status(500).json({ message: "Ocorreu um erro no servidor." });
  }
});

// Rota de Perfil (PROTEGIDA)
// **A CORREÇÃO ESTÁ AQUI: O middleware fica apenas nas rotas que precisam de login**
app.get('/api/perfil', authMiddleware, async (req, res) => {
  try {
    const { senha_hash: _, ...perfil } = req.usuario;
    res.status(200).json(perfil);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil.' });
  }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});