// --- VERSÃO FINAL DO server.js (com Multer) ---

// 1. Importação das bibliotecas
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const cors = require('cors');
const authMiddleware = require('./middlewares/authMiddleware');
const jwt = require('jsonwebtoken');
const multer = require('multer'); // <-- Importando o multer
const path = require('path');   // <-- Importando o path do Node.js

// --- Configuração do Multer para Upload de Arquivos ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Define a pasta 'uploads/' como destino
    },
    filename: function (req, file, cb) {
        // Cria um nome de arquivo único para evitar conflitos
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


// 2. Inicialização
const app = express();
const prisma = new PrismaClient();
const port = 3000;

// Correção para o erro do BigInt
BigInt.prototype.toJSON = function() {       
  return this.toString();
};

// 3. Middlewares
app.use(cors());
app.use(express.json());
// Torna a pasta 'uploads' publicamente acessível para o navegador poder mostrar as imagens
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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

// Rota de Criação de Passeios (ATUALIZADA COM MULTER)
app.post('/api/passeios', 
    authMiddleware, 
    upload.fields([
        { name: 'imagem_principal', maxCount: 1 },
        { name: 'galeria_imagens', maxCount: 5 }
    ]), 
    async (req, res) => {
        try {
            const usuario = req.user;
            if (usuario.tipo_de_usuario !== 'guia') {
              return res.status(403).json({ message: 'Acesso negado. Apenas guias podem criar passeios.' });
            }
            const perfilGuia = await prisma.perfilDeGuia.findUnique({ where: { usuario_id: usuario.id } });
            if (!perfilGuia) {
              return res.status(400).json({ message: 'Perfil de guia não encontrado.' });
            }
            
            const dadosDoFormulario = req.body;
            const imagemPrincipal = req.files['imagem_principal'] ? req.files['imagem_principal'][0] : null;
            const galeriaImagens = req.files['galeria_imagens'] || [];

            const novoPasseio = await prisma.passeio.create({
              data: {
                titulo: dadosDoFormulario.titulo,
                descricao_curta: dadosDoFormulario.descricao_curta,
                descricao_longa: dadosDoFormulario.descricao_longa,
                preco: parseFloat(dadosDoFormulario.preco),
                duracao_horas: parseFloat(dadosDoFormulario.duracao_horas),
                dificuldade: dadosDoFormulario.dificuldade,
                localizacao_geral: dadosDoFormulario.localizacao_geral,
                politica_cancelamento: dadosDoFormulario.politica_cancelamento,
                guia_id: perfilGuia.id,
                categoria_id: parseInt(dadosDoFormulario.categoria_id) || 1,
                // Salvamos o CAMINHO do arquivo no banco de dados
                imagem_principal_url: imagemPrincipal ? imagemPrincipal.path.replace(/\\/g, "/") : null,
                galeria_imagens_urls: galeriaImagens.map(file => file.path.replace(/\\/g, "/")),
              }
            });
            res.status(201).json(novoPasseio);
        } catch (error) {
            console.error("Erro ao criar passeio:", error);
            res.status(500).json({ message: 'Erro interno ao criar passeio.' });
        }
    }
);


// 5. Comando para iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});