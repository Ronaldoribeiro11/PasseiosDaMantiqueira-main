// ARQUIVO: backend/server.js

// 1. CARREGA AS VARIÁVEIS DE AMBIENTE DO ARQUIVO .env
// Esta deve ser a PRIMEIRA linha do seu arquivo.
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
// Torna a pasta 'uploads' publicamente acessível
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROTAS DA API ---

// Rota de teste da raiz
app.get('/', (req, res) => {
  res.send('Servidor do Passeios da Serra está no ar!');
});

// Rota de Cadastro de Usuários
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
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'O e-mail fornecido já está em uso.' });
    }
    res.status(500).json({ message: 'Não foi possível criar o usuário.' });
  }
});

// Rota de Login (CORRIGIDA)
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
    
    // CORREÇÃO: Usando a chave secreta do .env e o payload padronizado
    const token = jwt.sign(
        { userId: usuario.id.toString() }, // Usa 'userId' para ser consistente
        process.env.JWT_SECRET, 
        { expiresIn: '8h' }
    );

    res.status(200).json({ message: "Login bem-sucedido!", token: token });
  } catch (error) {
    // MELHORIA: Adicionado console.error para ver o erro detalhado no terminal
    console.error('Erro na rota de login:', error); 
    res.status(500).json({ message: "Ocorreu um erro no servidor." });
  }
});

// Rota de Perfil (CORRIGIDA)
app.get('/api/perfil', authMiddleware, async (req, res) => {
  try {
    // CORREÇÃO: Lendo o usuário de `req.usuario` (em português)
    const { senha_hash: _, ...perfil } = req.usuario;
    res.status(200).json(perfil);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil.' });
  }
});

// Rota para Criar um Novo Passeio (CORRIGIDA)
app.post('/api/passeios', authMiddleware, upload.fields([
    { name: 'imagem_principal', maxCount: 1 },
    { name: 'galeria_imagens', maxCount: 5 }
]), async (req, res) => {
    // CORREÇÃO: Lendo o usuário de `req.usuario` (em português)
    if (req.usuario.tipo_de_usuario !== 'guia' && req.usuario.tipo_de_usuario !== 'admin') {
        return res.status(403).json({ message: 'Acesso negado. Apenas guias podem criar passeios.' });
    }

    try {
        const {
            titulo,
            descricao_curta,
            descricao_longa,
            requisitos,
            localizacao_detalhada,
            link_Maps,
            instrucoes_local,
            duracao_horas,
            dificuldade,
            preco,
            max_participantes,
            politica_cancelamento,
            status,
            categoria_id
        } = req.body;

        const imagemPrincipalPath = req.files['imagem_principal'] ? req.files['imagem_principal'][0].path : null;
        const galeriaPaths = req.files['galeria_imagens'] ? req.files['galeria_imagens'].map(file => file.path) : [];

        const novoPasseio = await prisma.passeio.create({
            data: {
                titulo,
                descricao_curta,
                descricao_longa,
                requisitos,
                localizacao_detalhada,
                link_maps: link_Maps,
                instrucoes_ponto_encontro: instrucoes_local,
                duracao_horas: parseFloat(duracao_horas),
                nivel_dificuldade: dificuldade,
                preco: parseFloat(preco),
                max_participantes: parseInt(max_participantes, 10),
                politica_cancelamento,
                status: status || 'pendente_aprovacao',
                guia_id: req.usuario.id, // Associa o passeio ao guia logado
                categoria_id: parseInt(categoria_id, 10),
                imagem_principal: imagemPrincipalPath,
                galeria_imagens: galeriaPaths,
            }
        });

        res.status(201).json(novoPasseio);

    } catch (error) {
        console.error('Erro ao criar passeio:', error);
        res.status(500).json({ message: 'Erro interno ao criar o passeio.', details: error.message });
    }
});

// --- INICIALIZAÇÃO DO SERVIDOR ---
// Esta deve ser a ÚNICA chamada para app.listen no seu arquivo
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
